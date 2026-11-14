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

A widget left open while its conversation was erased: the visitor's next
message carries on in a new conversation,
or, when the visitor's record went too, the widget is sent to authorize again.
"""
import asyncio
from datetime import datetime, timedelta
from unittest.mock import AsyncMock, MagicMock, patch
from uuid import UUID, uuid4

import pytest
from sqlalchemy.exc import OperationalError

from app.api import widget_chat
from app.models.chat_history import ChatHistory
from app.models.customer import Customer
from app.models.session_to_agent import SessionToAgent
from app.repositories.session_to_agent import SessionToAgentRepository
from app.services import ai_access, host_action_runtime, message_delivery, widget_reply
from app.services.customer_erasure import erase_customers, erase_sessions
from tests.socket_db import serve_socket_db

SCOPE = "browser-key-1"


@pytest.fixture
def sio(monkeypatch):
    mock = MagicMock()
    for name in ("emit", "get_session", "save_session", "enter_room", "leave_room", "disconnect"):
        setattr(mock, name, AsyncMock())
    mock.get_environ = MagicMock(return_value={})
    for module in (widget_chat, widget_reply, host_action_runtime, message_delivery):
        monkeypatch.setattr(module, "sio", mock)
    return mock


@pytest.fixture
def socket(db, test_widget, test_ai_config, test_customer, sio, monkeypatch):
    """An open widget socket on a conversation with one message in it. AI is off
    for the plan, so a message is stored and relayed without a model call."""
    serve_socket_db(monkeypatch, db)
    monkeypatch.setattr(ai_access, "is_within_business_hours", lambda org: True)
    monkeypatch.setattr(widget_chat, "plan_allows_ai", lambda *a, **k: False)
    monkeypatch.setattr(ai_access, "plan_allows_ai", lambda *a, **k: False)
    session_id = str(uuid4())
    SessionToAgentRepository(db).create_session(
        session_id=session_id, agent_id=test_widget.agent_id, customer_id=test_customer.id,
        organization_id=test_widget.organization_id, conversation_key=SCOPE)
    state = {
        "widget_id": str(test_widget.id), "org_id": str(test_widget.organization_id),
        "agent_id": str(test_widget.agent_id), "customer_id": str(test_customer.id),
        "session_id": session_id, "ai_config": test_ai_config, "conversation_token": "token",
        "conversation_scope": SCOPE, "authenticated": False,
    }
    sio.get_session.return_value = state
    return state


async def send(text="hello again"):
    with patch("app.services.widget_reply.ChatAgent.create_async", AsyncMock()):
        await widget_chat.handle_widget_chat("sid", {"message": text})


def emitted(sio, event):
    return [call[0][1] for call in sio.emit.call_args_list if call[0][0] == event]


def sessions_of(db, customer_id):
    return db.query(SessionToAgent).filter(SessionToAgent.customer_id == customer_id).all()


@pytest.mark.asyncio
class TestConversationDeletedVisitorKept:
    async def test_the_message_goes_into_a_new_conversation(self, db, socket, sio, test_customer, test_widget):
        deleted = socket["session_id"]
        erase_sessions(db, [UUID(deleted)])

        await send("are you there?")

        [new] = sessions_of(db, test_customer.id)
        assert str(new.session_id) != deleted
        assert (new.conversation_key, new.agent_id, new.channel) == (SCOPE, test_widget.agent_id, "web")
        stored = db.query(ChatHistory).filter(ChatHistory.session_id == new.session_id).all()
        assert [m.message for m in stored if m.message_type == "user"] == ["are you there?"]
        assert emitted(sio, "error") == []

    async def test_the_socket_moves_to_the_new_room_and_the_widget_is_told(self, db, socket, sio):
        deleted = socket["session_id"]
        erase_sessions(db, [UUID(deleted)])

        await send()

        new_id = socket["session_id"]
        assert new_id != deleted
        sio.leave_room.assert_awaited_once_with("sid", deleted, namespace="/widget")
        sio.enter_room.assert_awaited_once_with("sid", new_id, namespace="/widget")
        assert sio.save_session.await_args.args[1]["session_id"] == new_id
        [announced] = emitted(sio, "session_initialized")
        assert (announced["session_id"], announced["created"], announced["authenticated"]) == (new_id, True, False)
        sio.disconnect.assert_not_awaited()

    async def test_the_next_message_stays_in_the_new_conversation(self, db, socket, sio, test_customer):
        erase_sessions(db, [UUID(socket["session_id"])])

        await send("one")
        await send("two")

        assert len(sessions_of(db, test_customer.id)) == 1
        assert len(emitted(sio, "session_initialized")) == 1

    async def test_two_messages_at_once_start_one_conversation(self, db, socket, sio, test_customer):
        erase_sessions(db, [UUID(socket["session_id"])])
        db.commit()
        # Each handler reads its own copy of the socket session, as socket.io
        # does, and every socket.io call lets the other handler run
        async def get_session(*args, **kwargs):
            await asyncio.sleep(0)
            return dict(socket)

        async def save_session(sid, saved, **kwargs):
            await asyncio.sleep(0)
            socket.update(saved)

        async def yields(*args, **kwargs):
            await asyncio.sleep(0)

        sio.get_session.side_effect = get_session
        sio.save_session.side_effect = save_session
        sio.leave_room.side_effect = yields
        sio.enter_room.side_effect = yields

        await asyncio.gather(send("one"), send("two"))

        [new] = sessions_of(db, test_customer.id)
        user_messages = db.query(ChatHistory).filter(ChatHistory.session_id == new.session_id,
                                                     ChatHistory.message_type == "user").count()
        assert user_messages == 2
        assert len(emitted(sio, "session_initialized")) == 1


@pytest.mark.asyncio
class TestConversationAndVisitorDeleted:
    async def test_the_widget_is_asked_to_resend_and_disconnected(self, db, socket, sio, test_customer):
        customer_id = test_customer.id
        erase_customers(db, [customer_id])

        await send()

        [error] = emitted(sio, "error")
        assert error == {"error": widget_chat.CONVERSATION_GONE_MESSAGE, "type": "conversation_gone"}
        sio.disconnect.assert_awaited_once_with("sid", namespace="/widget")
        assert sessions_of(db, customer_id) == []
        assert db.query(ChatHistory).count() == 0

    async def test_a_visitor_since_signed_in_is_not_stood_for_by_this_token(self, db, socket, sio, test_customer):
        """The page's own token may not keep naming a person the embedding app
        signed in: it goes back to authorize, like a deleted visitor."""
        erase_sessions(db, [UUID(socket["session_id"])])
        test_customer.is_authenticated = True
        db.commit()

        await send()

        sio.disconnect.assert_awaited_once()
        assert sessions_of(db, test_customer.id) == []


@pytest.mark.asyncio
class TestConversationStillThere:
    async def test_a_conversation_moved_to_another_customer_is_not_replaced(
            self, db, socket, sio, test_customer, test_organization):
        """A merge moves the conversation away: that isn't a deletion, and the
        socket must not get a new conversation for the old record."""
        survivor = Customer(organization_id=test_organization.id, email="survivor@example.com")
        db.add(survivor)
        db.commit()
        db.query(SessionToAgent).update({SessionToAgent.customer_id: survivor.id})
        db.commit()

        await send()

        assert sessions_of(db, test_customer.id) == []
        assert [e["type"] for e in emitted(sio, "error")] == ["chat_error"]
        sio.disconnect.assert_not_awaited()

    async def test_a_failed_lookup_is_not_taken_for_a_deletion(self, db, socket, sio, test_customer, monkeypatch):
        erase_sessions(db, [UUID(socket["session_id"])])
        broken = MagicMock(side_effect=OperationalError("SELECT", {}, Exception("connection lost")))
        monkeypatch.setattr(SessionToAgentRepository, "session_exists", broken)

        await send()

        assert sessions_of(db, test_customer.id) == []
        assert [e["type"] for e in emitted(sio, "error")] == ["chat_error"]

    async def test_a_live_conversation_takes_the_usual_path(self, db, socket, sio, test_customer):
        await send()

        [only] = sessions_of(db, test_customer.id)
        assert str(only.session_id) == socket["session_id"]
        assert emitted(sio, "session_initialized") == []
        sio.leave_room.assert_not_awaited()


class TestSessionExists:
    def test_true_for_a_row_and_false_once_deleted(self, db, test_widget, test_customer):
        repo = SessionToAgentRepository(db)
        session_id = str(uuid4())
        repo.create_session(session_id=session_id, agent_id=test_widget.agent_id, customer_id=test_customer.id,
                            organization_id=test_widget.organization_id)
        assert repo.session_exists(session_id) is True
        erase_sessions(db, [UUID(session_id)])
        assert repo.session_exists(session_id) is False


@pytest.mark.asyncio
class TestStartingOverInstead:
    async def test_a_widget_since_moved_to_another_agent_reconnects(
            self, db, socket, sio, test_customer, monkeypatch):
        """The socket's cached settings are the old agent's: connect reads the new one's."""
        erase_sessions(db, [UUID(socket["session_id"])])
        monkeypatch.setattr("app.repositories.widget.WidgetRepository.get_widget_agent",
                            lambda self, widget: MagicMock(id=uuid4()))

        await send()

        assert [e["type"] for e in emitted(sio, "error")] == ["conversation_gone"]
        sio.disconnect.assert_awaited_once()
        assert sessions_of(db, test_customer.id) == []

    async def test_a_socket_gone_while_its_message_waited_is_left_alone(self, db, socket, sio, test_customer):
        erase_sessions(db, [UUID(socket["session_id"])])
        first = dict(socket)
        sio.get_session.side_effect = [first, None]

        await send()

        assert emitted(sio, "error") == []
        assert sessions_of(db, test_customer.id) == []

    @pytest.mark.parametrize("handler, data", [
        ("handle_form_submission", {"form_data": {"email": "a@example.com"}}),
        ("handle_proceed_workflow", {}),
    ])
    async def test_a_workflow_step_on_a_deleted_conversation_starts_over(
            self, db, socket, sio, test_customer, handler, data):
        erase_sessions(db, [UUID(socket["session_id"])])

        await getattr(widget_chat, handler)("sid", data)

        assert [e["type"] for e in emitted(sio, "error")] == ["conversation_gone"]
        sio.disconnect.assert_awaited_once_with("sid", namespace="/widget")
        assert sessions_of(db, test_customer.id) == []

    @pytest.mark.parametrize("handler, data", [
        ("handle_form_submission", {"form_data": {"email": "a@example.com"}}),
        ("handle_proceed_workflow", {}),
    ])
    async def test_a_workflow_step_on_a_live_conversation_does_not_start_over(
            self, db, socket, sio, handler, data):
        await getattr(widget_chat, handler)("sid", data)

        sio.disconnect.assert_not_awaited()


@pytest.mark.asyncio
async def test_a_visitor_merged_into_another_record_reconnects(db, socket, sio, test_customer, test_organization):
    """Authorizing again resolves the merge; a new conversation on the merged
    record would hide it from the person it now belongs to."""
    survivor = Customer(organization_id=test_organization.id, email="survivor@example.com")
    db.add(survivor)
    db.commit()
    erase_sessions(db, [UUID(socket["session_id"])])
    test_customer.merged_into_customer_id = survivor.id
    db.commit()

    await send()

    sio.disconnect.assert_awaited_once()
    assert sessions_of(db, test_customer.id) == []


@pytest.mark.asyncio
class TestLiveMessageTime:
    async def test_the_inbox_gets_the_time_with_its_zone(self, db, socket, sio, test_user):
        """An agent's browser reads a time without a zone as its own local time,
        so a message that just arrived showed as hours old (or hours ahead)."""
        session = db.query(SessionToAgent).filter(SessionToAgent.session_id == UUID(socket["session_id"])).one()
        session.user_id = test_user.id
        db.commit()

        await send("is anyone there?")

        [to_agent, to_room] = emitted(sio, "chat_reply")
        for stamp in (to_agent["created_at"], to_room["timestamp"]):
            assert datetime.fromisoformat(stamp).utcoffset() == timedelta(0)
