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

A widget visitor can be bound to an existing customer by an email they only
typed. That keeps one person in the inbox, but must never hand them that
person's conversations: a widget-issued token reaches only the conversations
started from its own browser, and may not stand for a person the embedding app
has signed in.
"""
from datetime import datetime, timedelta, timezone
from unittest.mock import AsyncMock, MagicMock
from uuid import uuid4

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from socketio.exceptions import ConnectionRefusedError

from app.api import token as token_router
from app.api import widget as widget_router
from app.agents.chat_agent import ChatAgent
from app.api import widget_chat
from app.services import host_action_runtime, widget_reply
from app.core.security import create_conversation_token
from app.database import get_db
from app.models.customer import Customer
from app.models.session_to_agent import SessionStatus, SessionToAgent
from app.repositories.customer import CustomerRepository
from app.repositories.session_to_agent import SessionToAgentRepository
from app.services import conversation_token
from app.services.contact_capture import CONTACT_EMAIL_META_KEY
from tests.socket_db import serve_socket_db

VICTIM_BROWSER = "victim-browser"


@pytest.fixture
def client(db) -> TestClient:
    app = FastAPI()
    app.include_router(widget_router.router, prefix="/api/v1/widgets")
    app.include_router(token_router.router, prefix="/api/v1")

    def override_get_db():
        yield db

    app.dependency_overrides[get_db] = override_get_db
    return TestClient(app)


@pytest.fixture
def mock_sio():
    mock = MagicMock()
    mock.enter_room = AsyncMock()
    mock.emit = AsyncMock()
    mock.save_session = AsyncMock()
    mock.get_session = AsyncMock()
    return mock


@pytest.fixture
def socket(db, test_widget, test_ai_config, mock_sio, monkeypatch):
    """Connect a widget socket with a given token; returns its saved session."""
    monkeypatch.setattr(widget_chat, "sio", mock_sio)
    monkeypatch.setattr(widget_reply, "sio", mock_sio)
    monkeypatch.setattr(host_action_runtime, "sio", mock_sio)
    serve_socket_db(monkeypatch, db)
    monkeypatch.setattr(
        "app.repositories.widget.WidgetRepository.get_widget",
        lambda self, widget_id: test_widget,
    )
    ai_repo = MagicMock()
    ai_repo.get_active_config.return_value = test_ai_config
    monkeypatch.setattr(widget_chat, "AIConfigRepository", lambda db: ai_repo)

    async def connect(token: str, sid: str):
        claims = conversation_token.claims_ignoring_expiry(token)
        monkeypatch.setattr(
            widget_chat,
            "authenticate_socket_conversation_token",
            AsyncMock(return_value=(
                str(test_widget.id), str(test_widget.organization_id), claims.get("sub"), token,
            )),
        )
        mock_sio.save_session.reset_mock()
        if not await widget_chat.widget_connect(sid, {}, {}):
            return None
        return mock_sio.save_session.call_args[0][1]

    return connect


@pytest.fixture
def victim_session(db, test_widget, test_customer, test_user) -> SessionToAgent:
    """The victim's live conversation, with a human agent on it."""
    session = SessionToAgent(
        session_id=uuid4(),
        customer_id=test_customer.id,
        agent_id=test_widget.agent_id,
        organization_id=test_widget.organization_id,
        user_id=test_user.id,
        status=SessionStatus.OPEN,
        conversation_key=VICTIM_BROWSER,
    )
    db.add(session)
    db.commit()
    return session


def _victim_token(test_widget, test_customer) -> str:
    return create_conversation_token(
        widget_id=str(test_widget.id), customer_id=str(test_customer.id), ckey=VICTIM_BROWSER
    )


def _customer_of(data: dict) -> str:
    """The customer a GET /widgets response bound the visitor to."""
    return conversation_token.claims_ignoring_expiry(data["token"])["sub"]


def _emitted(mock_sio, event: str) -> dict:
    for call in reversed(mock_sio.emit.call_args_list):
        if call[0][0] == event:
            return call[0][1]
    raise AssertionError(f"{event} was never emitted")


class TestEmailDoesNotOpenAnotherBrowsersConversation:
    """GHSA-rfh4-6ghv-m2rr: GET /widgets/{id}?email=<victim>."""

    @pytest.mark.asyncio
    async def test_the_reported_takeover_lands_in_a_new_empty_conversation(
        self, client, socket, mock_sio, test_widget, test_customer, victim_session
    ):
        response = client.get(f"/api/v1/widgets/{test_widget.id}", params={"email": test_customer.email})
        assert response.status_code == 200, response.text
        data = response.json()

        # Still one person in the inbox...
        assert _customer_of(data) == str(test_customer.id)
        # ...but nothing of theirs: not even who is helping them.
        assert not (data["human_agent"] or {}).get("human_agent_name")
        claims = conversation_token.inspect(data["token"], str(test_widget.id)).payload
        assert claims["ckey"] != VICTIM_BROWSER

        attacker = await socket(data["token"], "attacker")
        assert attacker["session_id"] != str(victim_session.session_id)
        assert _emitted(mock_sio, "session_initialized")["created"] is True
        joined = [call[0][1] for call in mock_sio.enter_room.call_args_list]
        assert str(victim_session.session_id) not in joined

        mock_sio.get_session.return_value = attacker
        await widget_chat.get_widget_chat_history("attacker")
        assert _emitted(mock_sio, "chat_history")["messages"] == []

    @pytest.mark.asyncio
    async def test_the_victim_still_lands_in_their_own_conversation(
        self, client, socket, test_widget, test_customer, victim_session
    ):
        attacker_token = client.get(
            f"/api/v1/widgets/{test_widget.id}", params={"email": test_customer.email}
        ).json()["token"]
        await socket(attacker_token, "attacker")

        victim = await socket(_victim_token(test_widget, test_customer), "victim")

        assert victim["session_id"] == str(victim_session.session_id)

    @pytest.mark.asyncio
    async def test_a_token_issued_before_conversation_keys_reaches_no_existing_conversation(
        self, db, socket, test_widget, test_customer
    ):
        keyless = SessionToAgent(
            session_id=uuid4(), customer_id=test_customer.id, agent_id=test_widget.agent_id,
            organization_id=test_widget.organization_id, status=SessionStatus.OPEN,
        )
        db.add(keyless)
        db.commit()
        legacy_token = create_conversation_token(
            widget_id=str(test_widget.id), customer_id=str(test_customer.id)
        )

        connected = await socket(legacy_token, "legacy")

        assert connected["session_id"] != str(keyless.session_id)

    @pytest.mark.asyncio
    async def test_an_unverifiable_token_is_refused(self, socket, mock_sio, test_widget, test_customer, monkeypatch):
        monkeypatch.setattr(widget_chat, "verify_conversation_token", lambda token: None)

        # Refused for the widget to authorize again, and never given a conversation.
        with pytest.raises(ConnectionRefusedError) as refused:
            await socket(_victim_token(test_widget, test_customer), "sid")
        assert refused.value.error_args["data"]["type"] == "token_invalid"
        mock_sio.save_session.assert_not_called()


class TestOwnConversationOnly:
    @pytest.mark.asyncio
    async def test_a_closed_conversation_reopens_despite_a_newer_one_from_another_browser(
        self, db, socket, mock_sio, test_widget, test_customer, victim_session, monkeypatch
    ):
        victim = await socket(_victim_token(test_widget, test_customer), "victim")
        victim_session.status = SessionStatus.CLOSED
        victim_session.user_id = None
        victim_session.assigned_at = datetime.now(timezone.utc) - timedelta(hours=1)
        db.add(SessionToAgent(
            session_id=uuid4(), customer_id=test_customer.id, agent_id=test_widget.agent_id,
            organization_id=test_widget.organization_id, status=SessionStatus.OPEN,
            conversation_key="someone-else", assigned_at=datetime.now(timezone.utc),
        ))
        db.commit()
        monkeypatch.setattr(widget_chat, "notify_new_chat", AsyncMock())
        monkeypatch.setattr(
            ChatAgent, "create_async", AsyncMock(side_effect=RuntimeError("stop here"))
        )

        mock_sio.get_session.return_value = victim
        await widget_chat.handle_widget_chat("victim", {"message": "still there?"})

        db.refresh(victim_session)
        assert victim_session.status == SessionStatus.OPEN

    def test_there_is_no_lookup_of_a_conversation_by_customer_alone(self):
        assert not hasattr(SessionToAgentRepository, "get_active_customer_session")

    @pytest.mark.asyncio
    async def test_a_claimed_email_cannot_rename_the_customer(
        self, db, client, socket, mock_sio, test_widget, test_customer, victim_session
    ):
        test_customer.full_name = "Real Name"
        db.commit()
        attacker_token = client.get(
            f"/api/v1/widgets/{test_widget.id}", params={"email": test_customer.email}
        ).json()["token"]
        attacker = await socket(attacker_token, "attacker")

        mock_sio.get_session.return_value = attacker
        await widget_chat.handle_contact_info("attacker", {"form_data": {"name": "Attacker"}})

        db.refresh(test_customer)
        assert test_customer.full_name == "Real Name"

    @pytest.mark.asyncio
    async def test_a_claimed_email_cannot_leave_a_follow_up_address(
        self, db, client, socket, mock_sio, test_widget, test_customer, victim_session
    ):
        attacker_token = client.get(
            f"/api/v1/widgets/{test_widget.id}", params={"email": test_customer.email}
        ).json()["token"]
        attacker = await socket(attacker_token, "attacker")

        mock_sio.get_session.return_value = attacker
        await widget_chat.handle_contact_info("attacker", {"form_data": {"email": "attacker@evil.com"}})

        db.refresh(test_customer)
        assert CONTACT_EMAIL_META_KEY not in (test_customer.meta_data or {})


class TestMergedToken:
    """A device token naming a customer that lead capture merged into another."""

    def test_a_token_for_a_merged_customer_is_judged_on_the_survivor(
        self, db, client, test_widget, test_organization
    ):
        survivor = Customer(email="member@acme.com", organization_id=test_organization.id,
                            is_authenticated=True)
        db.add(survivor); db.commit(); db.refresh(survivor)
        merged = Customer(email="123@noemail.com", organization_id=test_organization.id,
                          conversation_key="browser-a", merged_into_customer_id=survivor.id)
        db.add(merged); db.commit(); db.refresh(merged)
        token = create_conversation_token(
            widget_id=str(test_widget.id), customer_id=str(merged.id), ckey="browser-a")

        data = client.get(f"/api/v1/widgets/{test_widget.id}",
                          headers={"Authorization": f"Bearer {token}"}).json()

        # Swapped now, rather than accepted here and refused on every connect.
        assert data["token"]
        assert _customer_of(data) not in (str(survivor.id), str(merged.id))


class TestPreClaimedAddress:
    """An address claimed through the widget before its owner signs in."""

    @pytest.fixture
    def pre_claim(self, db, client, test_widget, test_organization):
        """The attacker claims new@x; later the app signs the real user in."""
        data = client.get(
            f"/api/v1/widgets/{test_widget.id}", params={"email": "new.user@example.com"}
        ).json()
        claimed = CustomerRepository(db).get_by_id(_customer_of(data))
        assert claimed.email == "new.user@example.com"

        signed_in = CustomerRepository(db).identify("new.user@example.com", test_organization.id)
        assert signed_in.id == claimed.id and signed_in.is_authenticated
        users_chat = SessionToAgent(
            session_id=uuid4(), customer_id=signed_in.id, agent_id=test_widget.agent_id,
            organization_id=test_widget.organization_id, status=SessionStatus.OPEN,
        )
        db.add(users_chat)
        db.commit()
        return data["token"], signed_in, users_chat

    def test_the_old_token_is_swapped_for_a_customer_of_its_own(self, db, client, test_widget, pre_claim):
        attacker_token, signed_in, _ = pre_claim

        response = client.get(f"/api/v1/widgets/{test_widget.id}", headers={"Authorization": f"Bearer {attacker_token}"})

        assert response.status_code == 200, response.text
        data = response.json()
        assert data["token"]
        assert _customer_of(data) != str(signed_in.id)
        swapped = CustomerRepository(db).get_by_id(_customer_of(data))
        assert swapped.meta_data[CONTACT_EMAIL_META_KEY] == "new.user@example.com"

    @pytest.mark.asyncio
    async def test_the_old_token_is_sent_back_to_authorize(self, socket, pre_claim):
        """Refused the way an unbound token is, so the widget authorizes again
        and GET /widgets/{id} hands it a customer of its own."""
        attacker_token, _, _ = pre_claim

        with pytest.raises(ConnectionRefusedError) as refused:
            await socket(attacker_token, "attacker")

        assert refused.value.error_args["data"]["type"] == "customer_required"

    def test_typing_the_address_again_gets_an_anonymous_customer(self, db, client, test_widget, pre_claim):
        _, signed_in, _ = pre_claim

        data = client.get(
            f"/api/v1/widgets/{test_widget.id}", params={"email": "new.user@example.com"}
        ).json()

        assert _customer_of(data) != str(signed_in.id)
        fresh = CustomerRepository(db).get_by_id(_customer_of(data))
        assert CustomerRepository.is_placeholder_email(fresh.email)
        assert fresh.meta_data[CONTACT_EMAIL_META_KEY] == "new.user@example.com"

    @pytest.mark.asyncio
    async def test_the_signed_in_user_keeps_their_conversation(self, socket, test_widget, pre_claim):
        _, signed_in, users_chat = pre_claim
        verified_token, _, _ = conversation_token.mint({
            "sub": str(signed_in.id),
            "widget_id": str(test_widget.id),
            "customer_email": signed_in.email,
        }, ttl_seconds=600)

        connected = await socket(verified_token, "user")

        assert connected["session_id"] == str(users_chat.session_id)


def _mint(widget, customer, **claims) -> str:
    token, _, _ = conversation_token.mint(
        {"sub": str(customer.id), "widget_id": str(widget.id), **claims}, ttl_seconds=600)
    return token


class TestAccountScope:
    """Our in-app support chat: a token our backend vouched for on behalf of one
    dashboard account, keyed to that account rather than to the address."""

    @pytest.fixture
    def signed_in(self, db, test_organization) -> Customer:
        customer = Customer(email="member@acme.com", organization_id=test_organization.id, is_authenticated=True)
        db.add(customer)
        db.commit()
        return customer

    @pytest.mark.asyncio
    async def test_the_account_keeps_its_customer_and_its_conversation(self, client, socket, test_widget, signed_in):
        key = conversation_token.account_conversation_key("account-1")
        token = _mint(test_widget, signed_in, customer_email=signed_in.email, ckey=key)

        data = client.get(f"/api/v1/widgets/{test_widget.id}", headers={"Authorization": f"Bearer {token}"}).json()
        assert "token" not in data or data["token"] is None  # no swap to an anonymous customer

        first = await socket(token, "drawer-1")
        again = await socket(token, "drawer-2")
        assert again["session_id"] == first["session_id"]

    def test_a_widget_token_never_carries_an_account_key_forward(self, client, test_widget, signed_in):
        """An unverified token claiming an account key is refused, and the widget's
        replacement starts a key of its own."""
        forged = create_conversation_token(widget_id=str(test_widget.id),
                                           ckey=conversation_token.account_conversation_key("account-1"))

        data = client.get(f"/api/v1/widgets/{test_widget.id}", headers={"Authorization": f"Bearer {forged}"}).json()

        claims = conversation_token.claims_ignoring_expiry(data["token"])
        assert not conversation_token.is_account_key(claims["ckey"])


class TestEdges:
    def test_a_token_for_a_customer_that_is_gone_gets_a_new_one(self, client, test_widget):
        """Answering without a token here meant every connect was refused, forever."""
        ghost = create_conversation_token(widget_id=str(test_widget.id), customer_id=str(uuid4()), ckey="browser-a")

        data = client.get(f"/api/v1/widgets/{test_widget.id}", headers={"Authorization": f"Bearer {ghost}"}).json()

        assert data["token"]
        assert conversation_token.claims_ignoring_expiry(data["token"])["ckey"] == "browser-a"

    @pytest.mark.asyncio
    async def test_a_refresh_cannot_move_the_socket_to_another_scope(self, socket, mock_sio, test_widget, test_customer):
        connected = await socket(_victim_token(test_widget, test_customer), "victim")
        other_scope = create_conversation_token(widget_id=str(test_widget.id), customer_id=str(test_customer.id),
                                                ckey="another-browser")
        mock_sio.get_session.return_value = dict(connected)
        mock_sio.save_session.reset_mock()

        await widget_chat.handle_refresh_token("victim", {"conversation_token": other_scope})

        mock_sio.save_session.assert_not_awaited()

    @pytest.mark.asyncio
    async def test_a_visitor_who_cannot_save_contact_details_still_hears_back(
        self, db, client, socket, mock_sio, test_widget, test_customer, victim_session
    ):
        stranger = client.get(f"/api/v1/widgets/{test_widget.id}", params={"email": test_customer.email}).json()["token"]
        mock_sio.get_session.return_value = await socket(stranger, "stranger")
        mock_sio.emit.reset_mock()

        await widget_chat.handle_contact_info("stranger", {"form_data": {"name": "Someone"}})

        assert _emitted(mock_sio, "chat_response")["message"] == "Thanks — a teammate will follow up here."
