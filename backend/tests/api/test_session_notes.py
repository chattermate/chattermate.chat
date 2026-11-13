"""
Copyright 2024-2026 ChatterMate

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
"""

"""Team notes, @-mentions and snooze.

The most important property: a note never reaches the customer or the model.
Notes live in their own table, and these tests pin that every reader of the
conversation (the messages in the inbox detail, the history the widget and
the AI read, the list's preview) leaves them out.
"""

import asyncio
from datetime import datetime, timedelta, timezone
from unittest.mock import AsyncMock, patch
from uuid import uuid4

import pytest
from fastapi import FastAPI, status
from fastapi.testclient import TestClient

from app.api import session_notes
from app.core.auth import get_current_user
from app.database import get_db
from app.models.agent import Agent
from app.models.chat_history import ChatHistory
from app.models.conversation_note import ConversationNote
from app.models.customer import Customer
from app.models.permission import Permission, role_permissions
from app.models.role import Role
from app.models.session_to_agent import SessionStatus, SessionToAgent
from app.models.user import User
from app.repositories.chat import ChatRepository
from app.repositories.inbox_views import InboxView

app = FastAPI()
app.include_router(session_notes.router, prefix="/api/v1/sessions")

SECRET_NOTE = "Customer is a reseller, do not refund (internal)"


@pytest.fixture
def role(db, test_organization_id):
    role = Role(name="Agent", description="", organization_id=test_organization_id, is_default=False)
    db.add(role)
    db.commit()
    for name in ("manage_all_chats", "view_all_chats"):
        perm = Permission(name=name, description=name)
        db.add(perm)
        db.commit()
        db.execute(role_permissions.insert().values(role_id=role.id, permission_id=perm.id))
    db.commit()
    return role


def _user(db, org_id, role, name, active=True):
    user = User(id=uuid4(), email=f"{name.lower()}-{uuid4().hex[:6]}@example.com", hashed_password="x",
                full_name=name, organization_id=org_id, role_id=role.id if role else None, is_active=active)
    db.add(user)
    db.commit()
    return user


@pytest.fixture
def me(db, test_organization_id, role):
    return _user(db, test_organization_id, role, "Sam")


@pytest.fixture
def teammate(db, test_organization_id, role):
    return _user(db, test_organization_id, role, "Asha")


@pytest.fixture
def chat(db, test_organization_id):
    agent = Agent(id=uuid4(), name="Bot", agent_type="CUSTOMER_SUPPORT", instructions=["x"],
                  organization_id=test_organization_id)
    customer = Customer(id=uuid4(), email="maya@example.com", full_name="Maya", organization_id=test_organization_id)
    db.add_all([agent, customer])
    db.commit()
    session = SessionToAgent(session_id=uuid4(), organization_id=test_organization_id, agent_id=agent.id,
                             customer_id=customer.id, status=SessionStatus.TRANSFERRED)
    db.add(session)
    db.commit()
    db.add(ChatHistory(message="I want a refund", message_type="user", session_id=session.session_id,
                       organization_id=test_organization_id, agent_id=agent.id, customer_id=customer.id))
    db.commit()
    return session


@pytest.fixture
def client(db, me):
    app.dependency_overrides[get_current_user] = lambda: me
    app.dependency_overrides[get_db] = lambda: db
    yield TestClient(app)
    app.dependency_overrides.clear()


def _note(client, chat, body=SECRET_NOTE, mentions=()):
    return client.post(f"/api/v1/sessions/{chat.session_id}/notes",
                       json={"body": body, "mentions": [str(m) for m in mentions]})


class TestNotes:
    def test_a_note_is_kept_with_its_author_and_mentions(self, client, chat, me, teammate):
        with patch('app.api.session_notes.notify_user', new=AsyncMock()), \
             patch('app.api.session_notes.emit_to_session_agents', new=AsyncMock()), \
             patch('app.api.session_notes.sio.emit', new=AsyncMock()):
            response = _note(client, chat, mentions=[teammate.id])

        assert response.status_code == status.HTTP_201_CREATED
        note = response.json()
        assert note["body"] == SECRET_NOTE
        assert note["user_name"] == "Sam"
        assert note["mentions"] == [{"user_id": str(teammate.id), "name": "Asha"}]

    def test_mentioned_teammates_are_notified_but_not_the_author(self, client, chat, me, teammate):
        with patch('app.api.session_notes.notify_user', new=AsyncMock()) as notify, \
             patch('app.api.session_notes.emit_to_session_agents', new=AsyncMock()), \
             patch('app.api.session_notes.sio.emit', new=AsyncMock()) as emit:
            _note(client, chat, mentions=[teammate.id, me.id])

        assert [c.kwargs["user_id"] for c in notify.call_args_list] == [teammate.id]
        assert notify.call_args.kwargs["title"] == "Sam mentioned you"
        assert notify.call_args.kwargs["metadata"]["event"] == "mention"
        assert notify.call_args.kwargs["metadata"]["session_id"] == str(chat.session_id)
        rooms = [c.kwargs["room"] for c in emit.call_args_list]
        assert f"user_{teammate.id}" in rooms

    def test_a_mention_of_someone_outside_the_team_is_dropped(self, db, client, chat, role):
        stranger = _user(db, uuid4(), None, "Stranger")
        former = _user(db, chat.organization_id, role, "Former", active=False)
        with patch('app.api.session_notes.notify_user', new=AsyncMock()) as notify, \
             patch('app.api.session_notes.emit_to_session_agents', new=AsyncMock()), \
             patch('app.api.session_notes.sio.emit', new=AsyncMock()):
            response = _note(client, chat, mentions=[stranger.id, former.id])

        assert response.json()["mentions"] == []
        assert not notify.called

    @pytest.mark.parametrize("payload", [{"body": ""}, {"body": "   "}, {"body": "x" * 4001}, {"body": "x", "mentions": [str(uuid4())] * 21}])
    def test_refuses_an_empty_or_oversized_note(self, client, chat, payload):
        response = client.post(f"/api/v1/sessions/{chat.session_id}/notes", json=payload)
        assert response.status_code == 422

    def test_needs_the_permission_to_manage_chats(self, db, client, chat, test_organization_id):
        nobody = _user(db, test_organization_id, None, "Viewer")
        app.dependency_overrides[get_current_user] = lambda: nobody
        assert _note(client, chat).status_code == status.HTTP_403_FORBIDDEN

    def test_another_organizations_chat_is_not_found(self, db, client, me, role):
        other = SessionToAgent(session_id=uuid4(), organization_id=uuid4(), customer_id=uuid4(), status=SessionStatus.OPEN)
        db.add(other)
        db.flush()
        assert client.post(f"/api/v1/sessions/{other.session_id}/notes", json={"body": "x"}).status_code == 404


class TestNotesNeverReachTheCustomerOrTheModel:
    @pytest.fixture
    def noted(self, db, client, chat):
        with patch('app.api.session_notes.notify_user', new=AsyncMock()), \
             patch('app.api.session_notes.emit_to_session_agents', new=AsyncMock()), \
             patch('app.api.session_notes.sio.emit', new=AsyncMock()):
            assert _note(client, chat).status_code == 201
        return chat

    def test_a_note_is_not_a_message(self, db, noted):
        """Nothing that reads chat_history (the widget's history, channel
        delivery, the AI's context, transcripts, sentiment, analytics) can see it."""
        texts = [m.message for m in db.query(ChatHistory).filter(ChatHistory.session_id == noted.session_id)]
        assert SECRET_NOTE not in texts
        assert db.query(ConversationNote).filter(ConversationNote.session_id == noted.session_id).count() == 1

    def test_the_history_the_widget_and_the_ai_read_leaves_it_out(self, db, noted):
        history = asyncio.run(ChatRepository(db).get_session_history(noted.session_id))
        assert [m.message for m in history] == ["I want a refund"]

    def test_the_inbox_detail_keeps_it_apart_from_the_messages(self, db, noted):
        detail = asyncio.run(ChatRepository(db).get_chat_detail(noted.session_id, noted.organization_id))
        assert SECRET_NOTE not in [m["message"] for m in detail["messages"]]
        assert [n["body"] for n in detail["notes"]] == [SECRET_NOTE]

    def test_the_list_preview_is_the_last_message_not_the_note(self, db, noted):
        previews = ChatRepository(db).get_last_messages([noted.session_id])
        assert previews[noted.session_id] == "I want a refund"

    def test_the_note_is_encrypted_at_rest(self, db, noted):
        from sqlalchemy import text
        stored = db.execute(text("SELECT body FROM conversation_notes")).scalar()
        assert stored != SECRET_NOTE


class TestMentionsView:
    def test_a_mention_puts_the_chat_in_the_mentioned_teammates_view(self, db, client, chat, teammate, me):
        with patch('app.api.session_notes.notify_user', new=AsyncMock()), \
             patch('app.api.session_notes.emit_to_session_agents', new=AsyncMock()), \
             patch('app.api.session_notes.sio.emit', new=AsyncMock()):
            _note(client, chat, mentions=[teammate.id])
        repo = ChatRepository(db)

        theirs = repo.get_recent_chats(organization_id=chat.organization_id, view=InboxView.MENTIONS, current_user_id=teammate.id)
        mine = repo.get_recent_chats(organization_id=chat.organization_id, view=InboxView.MENTIONS, current_user_id=me.id)

        assert [str(r["session_id"]) for r in theirs] == [str(chat.session_id)]
        assert mine == []
        assert repo.get_inbox_counts(chat.organization_id, current_user_id=teammate.id)["mentions"] == 1


class TestSnooze:
    def _snooze(self, client, chat, until):
        return client.post(f"/api/v1/sessions/{chat.session_id}/snooze", json={"until": until.isoformat()})

    def test_a_snoozed_chat_leaves_the_views_until_its_time(self, db, client, chat):
        until = datetime.now(timezone.utc) + timedelta(hours=3)
        response = self._snooze(client, chat, until)
        assert response.status_code == 200
        assert response.json()["snoozed_until"] is not None
        repo = ChatRepository(db)

        def listed(view):
            return [str(r["session_id"]) for r in repo.get_recent_chats(organization_id=chat.organization_id, view=view)]

        assert listed(InboxView.WAITING) == []
        assert listed(InboxView.OPEN) == []
        assert listed(InboxView.SNOOZED) == [str(chat.session_id)]
        counts = repo.get_inbox_counts(chat.organization_id)
        assert (counts["waiting_for_human"], counts["open"], counts["snoozed"]) == (0, 0, 1)

    def test_it_comes_back_once_the_time_has_passed(self, db, chat):
        chat.snoozed_until = datetime.now(timezone.utc) - timedelta(minutes=1)
        db.commit()
        rows = ChatRepository(db).get_recent_chats(organization_id=chat.organization_id, view=InboxView.WAITING)
        assert [str(r["session_id"]) for r in rows] == [str(chat.session_id)]

    def test_the_customer_writing_again_wakes_it(self, db, client, chat):
        self._snooze(client, chat, datetime.now(timezone.utc) + timedelta(days=1))
        ChatRepository(db).create_message({
            'message': 'Hello?', 'message_type': 'user', 'session_id': str(chat.session_id),
            'organization_id': str(chat.organization_id), 'agent_id': str(chat.agent_id),
            'customer_id': str(chat.customer_id),
        })
        db.refresh(chat)
        assert chat.snoozed_until is None

    def test_a_reply_from_the_team_does_not_wake_it(self, db, client, chat):
        self._snooze(client, chat, datetime.now(timezone.utc) + timedelta(days=1))
        ChatRepository(db).create_message({
            'message': 'We are on it', 'message_type': 'agent', 'session_id': str(chat.session_id),
            'organization_id': str(chat.organization_id), 'agent_id': str(chat.agent_id),
            'customer_id': str(chat.customer_id),
        })
        db.refresh(chat)
        assert chat.snoozed_until is not None

    def test_unsnoozing_brings_it_back_now(self, db, client, chat):
        self._snooze(client, chat, datetime.now(timezone.utc) + timedelta(days=1))
        response = client.delete(f"/api/v1/sessions/{chat.session_id}/snooze")
        assert response.status_code == 200
        assert response.json()["snoozed_until"] is None

    @pytest.mark.parametrize("offset, detail", [
        (timedelta(minutes=-5), "Snooze until a time in the future"),
        (timedelta(days=91), "Snooze for 90 days at most"),
    ])
    def test_refuses_a_time_in_the_past_or_too_far_off(self, client, chat, offset, detail):
        response = self._snooze(client, chat, datetime.now(timezone.utc) + offset)
        assert response.status_code == 422
        assert response.json()["detail"] == detail

    def test_a_closed_chat_cannot_be_snoozed(self, db, client, chat):
        chat.status = SessionStatus.CLOSED
        db.commit()
        response = self._snooze(client, chat, datetime.now(timezone.utc) + timedelta(hours=1))
        assert response.status_code == 400
