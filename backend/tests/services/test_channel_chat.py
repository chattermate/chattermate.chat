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

from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock, patch
from uuid import uuid4

import pytest

from app.channels.base import InboundMessage, InteractiveReply, InteractiveReplyType
from app.channels.interactive_limits import TELEGRAM_LIMITS, WHATSAPP_LIMITS
from app.models.channels import ChannelConversation
from app.models.chat_history import ChatHistory
from app.models.customer import Customer
from app.models.agent import AgentType
from app.models.session_to_agent import SessionToAgent, SessionStatus
from app.repositories.channels import (
    ChannelAccountRepository,
    ChannelConversationRepository,
    AgentChannelConfigRepository,
)
from app.repositories.agent import AgentRepository
from app.repositories.chat import ChatRepository
from app.services import agent_rooms, channel_chat
from app.services.human_routing import HUMAN_ONLY_ACK
from app.services.business_message import remember_business_message
from app.services.channel_chat import process_channel_message
from app.services.customer_erasure import erase_customers, erase_sessions
from app.services.message_delivery import DeliveryResult


def make_inbound(text="hello"):
    return InboundMessage(
        external_account_id="bot123",
        external_conversation_id="222",
        external_user_id="111",
        external_message_id="42",
        text=text,
        profile={"name": "Ada Lovelace"},
    )


@pytest.fixture
def account(db, test_organization):
    return ChannelAccountRepository(db).create_account(
        organization_id=test_organization.id,
        channel_type="telegram",
        external_account_id="bot123",
        credentials={"bot_token": "123:abc"},
        display_name="@testbot",
    )


@pytest.fixture
def routed_account(db, account, test_agent):
    AgentChannelConfigRepository(db).set_agent(account.id, test_agent.id)
    return account


@pytest.fixture
def use_test_db(db, monkeypatch):
    """process_channel_message opens its own SessionLocal; bind it to the test db."""
    class _NonClosing:
        def __init__(self, inner):
            self._inner = inner
        def __getattr__(self, name):
            return getattr(self._inner, name)
        def close(self):
            pass  # keep the fixture-owned session usable after processing
    monkeypatch.setattr(channel_chat, "SessionLocal", lambda: _NonClosing(db))
    return db


@pytest.fixture
def mock_sio(monkeypatch):
    sio = MagicMock()
    sio.emit = AsyncMock()
    monkeypatch.setattr(agent_rooms, "sio", sio)
    return sio


@pytest.mark.asyncio
async def test_drops_message_when_no_agent_routed(db, account, use_test_db, test_ai_config):
    with patch.object(channel_chat, "ChatAgent") as mock_agent:
        await process_channel_message(account.id, make_inbound())
        mock_agent.create_async.assert_not_called()
    # No session created
    assert db.query(ChannelConversation).count() == 0


@pytest.mark.asyncio
async def test_ai_path_creates_session_and_delivers(db, routed_account, use_test_db, test_ai_config, test_agent, mock_sio):
    response = SimpleNamespace(message="hi there", transfer_to_human=False,
                               end_chat=False, request_lead_capture=False)
    fake_agent = MagicMock()
    fake_agent.get_response = AsyncMock(return_value=response)
    fake_agent.safe_cleanup_mcp_tools = AsyncMock()

    with patch.object(channel_chat.ChatAgent, "create_async", AsyncMock(return_value=fake_agent)) as create_async, \
         patch.object(channel_chat, "deliver_to_customer", AsyncMock()) as deliver:
        await process_channel_message(routed_account.id, make_inbound())

        assert create_async.await_args.kwargs["channel"] == "telegram"
        fake_agent.get_response.assert_awaited_once()
        fake_agent.safe_cleanup_mcp_tools.assert_awaited()
        deliver.assert_awaited_once()
        payload = deliver.await_args.args[2]
        assert payload["message"] == "hi there"

    # Session + conversation persisted with the right channel
    conversation = db.query(ChannelConversation).one()
    session = db.query(SessionToAgent).filter_by(session_id=conversation.session_id).one()
    assert session.channel == "telegram"
    assert str(session.agent_id) == str(test_agent.id)


@pytest.mark.asyncio
async def test_no_connection_is_held_through_the_model_call(db, routed_account, use_test_db, test_ai_config, mock_sio):
    # A few concurrent conversations would otherwise use up the connection pool
    held = []

    async def respond(**kwargs):
        held.append(db.in_transaction())
        return SimpleNamespace(message="hi there", transfer_to_human=False,
                               end_chat=False, request_lead_capture=False)
    fake_agent = MagicMock()
    fake_agent.get_response = AsyncMock(side_effect=respond)
    fake_agent.safe_cleanup_mcp_tools = AsyncMock()

    with patch.object(channel_chat.ChatAgent, "create_async", AsyncMock(return_value=fake_agent)), \
         patch.object(channel_chat, "deliver_to_customer", AsyncMock()):
        await process_channel_message(routed_account.id, make_inbound())

    assert held == [False]


def _agent_persisting_reply(db, text="hi there"):
    """A ChatAgent stub that persists its reply the way the real one does and
    reports the row id, so delivery results land on that row."""
    response = SimpleNamespace(message=text, transfer_to_human=False,
                               end_chat=False, request_lead_capture=False)

    fake_agent = MagicMock()

    async def _respond(**kwargs):
        fake_agent.last_bot_message_id = ChatRepository(db).create_message({
            "message": text,
            "message_type": "bot",
            "session_id": kwargs["session_id"],
            "organization_id": kwargs["org_id"],
            "agent_id": kwargs["agent_id"],
            "customer_id": kwargs["customer_id"],
        }).id
        return response

    fake_agent.get_response = AsyncMock(side_effect=_respond)
    fake_agent.safe_cleanup_mcp_tools = AsyncMock()
    return fake_agent


@pytest.mark.asyncio
async def test_bot_reply_records_delivery_failure(db, routed_account, use_test_db, test_ai_config, mock_sio):
    """Outside the messaging window the customer receives nothing, so the stored
    reply must record that instead of looking delivered."""
    fake_agent = _agent_persisting_reply(db)
    failed = DeliveryResult(ok=False, reason="window_expired", can_template=True)

    with patch.object(channel_chat.ChatAgent, "create_async", AsyncMock(return_value=fake_agent)), \
         patch.object(channel_chat, "deliver_to_customer", AsyncMock(return_value=failed)):
        await process_channel_message(routed_account.id, make_inbound())

    message = db.query(ChatHistory).filter_by(message_type="bot").one()
    assert message.attributes["delivery_status"] == "window_expired"


@pytest.mark.asyncio
async def test_bot_reply_marks_nothing_when_delivered(db, routed_account, use_test_db, test_ai_config, mock_sio):
    fake_agent = _agent_persisting_reply(db)

    with patch.object(channel_chat.ChatAgent, "create_async", AsyncMock(return_value=fake_agent)), \
         patch.object(channel_chat, "deliver_to_customer", AsyncMock(return_value=DeliveryResult(ok=True))):
        await process_channel_message(routed_account.id, make_inbound())

    message = db.query(ChatHistory).filter_by(message_type="bot").one()
    assert "delivery_status" not in (message.attributes or {})


@pytest.mark.asyncio
async def test_reuses_open_session_for_same_conversation(db, routed_account, use_test_db, test_ai_config, mock_sio):
    response = SimpleNamespace(message="ok", transfer_to_human=False,
                               end_chat=False, request_lead_capture=False)
    fake_agent = MagicMock()
    fake_agent.get_response = AsyncMock(return_value=response)
    fake_agent.safe_cleanup_mcp_tools = AsyncMock()

    with patch.object(channel_chat.ChatAgent, "create_async", AsyncMock(return_value=fake_agent)), \
         patch.object(channel_chat, "deliver_to_customer", AsyncMock()):
        await process_channel_message(routed_account.id, make_inbound("first"))
        await process_channel_message(routed_account.id, make_inbound("second"))

    assert db.query(ChannelConversation).count() == 1


class TestAgentChangeStartsANewSession:
    """A session belongs to one agent: its history, and the AI runtime's memory
    for that session id, are that agent's. Reusing it after the channel is
    pointed at a different agent made the new agent answer out of the previous
    one's retrieved knowledge, and split the inbox in two — the conversations
    list groups by agent *and* session while the detail view keys on session
    alone, so one thread showed twice and neither row opened the other."""

    @staticmethod
    async def _send(routed_account, text):
        response = SimpleNamespace(message="ok", transfer_to_human=False,
                                   end_chat=False, request_lead_capture=False)
        fake_agent = MagicMock()
        fake_agent.get_response = AsyncMock(return_value=response)
        fake_agent.safe_cleanup_mcp_tools = AsyncMock()
        with patch.object(channel_chat.ChatAgent, "create_async", AsyncMock(return_value=fake_agent)), \
             patch.object(channel_chat, "deliver_to_customer", AsyncMock()):
            await process_channel_message(routed_account.id, make_inbound(text))

    @pytest.mark.asyncio
    async def test_a_new_agent_gets_a_new_session(self, db, routed_account, use_test_db,
                                                  test_ai_config, test_organization, mock_sio):
        await self._send(routed_account, "first")
        first = db.query(ChannelConversation).one()

        other = AgentRepository(db).create_agent(
            name="Other Agent", agent_type=AgentType.CUSTOMER_SUPPORT,
            org_id=test_organization.id, instructions=["help"])
        AgentChannelConfigRepository(db).set_agent(routed_account.id, other.id)

        await self._send(routed_account, "second")

        # Same platform thread, but a second conversation and a second session.
        conversations = db.query(ChannelConversation).order_by(
            ChannelConversation.created_at).all()
        assert len(conversations) == 2
        assert conversations[0].session_id != conversations[1].session_id
        assert {c.external_conversation_id for c in conversations} == {"222"}

        # The retired session is closed, so it stops being picked up, and each
        # session is bound to exactly one agent.
        old = db.query(SessionToAgent).filter_by(session_id=first.session_id).one()
        new = db.query(SessionToAgent).filter_by(session_id=conversations[1].session_id).one()
        assert old.status == SessionStatus.CLOSED
        assert str(new.agent_id) == str(other.id)

    @pytest.mark.asyncio
    async def test_the_same_agent_keeps_its_session(self, db, routed_account, use_test_db,
                                                    test_ai_config, mock_sio):
        """The guard must not fire on every message — only on a real change."""
        await self._send(routed_account, "first")
        await self._send(routed_account, "second")

        assert db.query(ChannelConversation).count() == 1
        assert db.query(SessionToAgent).filter_by(
            status=SessionStatus.CLOSED).count() == 0

    @pytest.mark.asyncio
    async def test_a_human_handled_chat_is_not_rotated(self, db, routed_account, use_test_db,
                                                       test_ai_config, test_organization,
                                                       test_user, mock_sio):
        """Rotating here would drop the human agent out of a live conversation."""
        await self._send(routed_account, "first")
        conversation = db.query(ChannelConversation).one()
        session = db.query(SessionToAgent).filter_by(
            session_id=conversation.session_id).one()
        session.user_id = test_user.id
        db.commit()

        other = AgentRepository(db).create_agent(
            name="Other Agent 2", agent_type=AgentType.CUSTOMER_SUPPORT,
            org_id=test_organization.id, instructions=["help"])
        AgentChannelConfigRepository(db).set_agent(routed_account.id, other.id)

        await self._send(routed_account, "while a human is on it")

        assert db.query(ChannelConversation).count() == 1
        assert db.query(SessionToAgent).filter_by(
            session_id=conversation.session_id).one().status != SessionStatus.CLOSED


@pytest.mark.asyncio
async def test_human_handling_relays_and_skips_bot(db, routed_account, use_test_db, test_ai_config, test_user, mock_sio):
    # First message creates the session via the AI path
    response = SimpleNamespace(message="ok", transfer_to_human=False,
                               end_chat=False, request_lead_capture=False)
    fake_agent = MagicMock()
    fake_agent.get_response = AsyncMock(return_value=response)
    fake_agent.safe_cleanup_mcp_tools = AsyncMock()
    with patch.object(channel_chat.ChatAgent, "create_async", AsyncMock(return_value=fake_agent)), \
         patch.object(channel_chat, "deliver_to_customer", AsyncMock()):
        await process_channel_message(routed_account.id, make_inbound("first"))

    # A human takes over the session
    conversation = db.query(ChannelConversation).one()
    session = db.query(SessionToAgent).filter_by(session_id=conversation.session_id).one()
    session.user_id = test_user.id
    db.commit()

    with patch.object(channel_chat.ChatAgent, "create_async", AsyncMock()) as create_async:
        await process_channel_message(routed_account.id, make_inbound("for the human"))
        create_async.assert_not_awaited()

    # Relayed to the handling agent's rooms
    rooms = [call.kwargs.get("room") for call in mock_sio.emit.await_args_list]
    assert f"user_{test_user.id}" in rooms
    assert str(session.session_id) in rooms


@pytest.mark.asyncio
async def test_human_only_agent_never_runs_the_bot(db, routed_account, use_test_db,
                                                   test_ai_config, test_agent, mock_sio):
    """AI switched off on the agent: relay to the dashboard, never model.

    No transfer either — the chat simply waits for someone to pick it up, so
    the customer gets no automated reply.
    """
    test_agent.ai_replies_enabled = False
    db.commit()

    with patch.object(channel_chat.ChatAgent, "create_async", AsyncMock()) as create_async, \
         patch("app.services.human_routing.deliver_to_customer",
               AsyncMock(return_value=DeliveryResult(ok=True))) as ack:
        await process_channel_message(routed_account.id, make_inbound("hello"))
        create_async.assert_not_awaited()
        # One acknowledgement so the number doesn't look dead, nothing more.
        assert ack.await_count == 1
        assert ack.await_args.args[2]['message'] == HUMAN_ONLY_ACK

    # A follow-up message is not acknowledged again.
    with patch.object(channel_chat.ChatAgent, "create_async", AsyncMock()), \
         patch("app.services.human_routing.deliver_to_customer",
               AsyncMock(return_value=DeliveryResult(ok=True))) as ack:
        await process_channel_message(routed_account.id, make_inbound("still there?"))
        assert not ack.called

    conversation = db.query(ChannelConversation).one()
    session = db.query(SessionToAgent).filter_by(
        session_id=conversation.session_id).one()
    # A plain open chat waiting in the inbox, not a transfer.
    assert session.status == SessionStatus.OPEN
    assert session.user_id is None


@pytest.mark.asyncio
async def test_email_channel_uses_real_customer_email(db, test_organization):
    """Email sender address is used verbatim as the customer email (unifies
    the person across channels + widget) — not the synthetic @email.channel."""
    from app.services.channel_chat import _get_or_create_customer
    from app.models.channels import ChannelAccount
    from app.models.customer import Customer
    from app.channels.base import InboundMessage
    import uuid as _uuid

    account = MagicMock(spec=ChannelAccount)
    account.channel_type = "email"
    inbound = InboundMessage(
        external_account_id="", external_conversation_id="jane@acme.com",
        external_user_id="jane@acme.com", external_message_id="m1", text="hi",
        profile={"name": "Jane Roe", "email": "Jane@Acme.com"})
    customer_id = _get_or_create_customer(db, account, inbound, str(test_organization.id))
    customer = db.query(Customer).filter(Customer.id == _uuid.UUID(customer_id)).one()
    assert customer.email == "jane@acme.com"  # lowercased real address, no suffix


@pytest.mark.asyncio
async def test_non_email_channel_synthesizes_address(db, test_organization):
    from app.services.channel_chat import _get_or_create_customer
    from app.models.channels import ChannelAccount
    from app.models.customer import Customer
    from app.channels.base import InboundMessage
    import uuid as _uuid

    account = MagicMock(spec=ChannelAccount)
    account.channel_type = "telegram"
    inbound = InboundMessage(
        external_account_id="", external_conversation_id="555",
        external_user_id="555", external_message_id="m1", text="hi",
        profile={"name": "Bob"})
    customer_id = _get_or_create_customer(db, account, inbound, str(test_organization.id))
    customer = db.query(Customer).filter(Customer.id == _uuid.UUID(customer_id)).one()
    assert customer.email == "555@telegram.channel"


@pytest.mark.asyncio
async def test_placeholder_name_upgraded_when_real_name_resolved(db, account, test_organization):
    """An existing customer created with a '<Channel> user xxxx' placeholder is
    renamed once fetch_profile resolves a real name."""
    from app.services.channel_chat import _get_or_create_customer
    from app.channels.base import InboundMessage
    from app.models.customer import Customer
    import uuid as _uuid

    account.channel_type = "slack"
    # First message: no real name yet → placeholder
    inbound1 = InboundMessage(external_account_id="T1", external_conversation_id="D7",
                              external_user_id="U09UPKP7", external_message_id="e1", text="hi")
    cid = _get_or_create_customer(db, account, inbound1, str(test_organization.id))
    cust = db.query(Customer).filter(Customer.id == _uuid.UUID(cid)).one()
    assert cust.full_name == "Slack user U09UPKP7"

    # Second message: profile now carries the real name → upgraded in place
    inbound2 = InboundMessage(external_account_id="T1", external_conversation_id="D7",
                              external_user_id="U09UPKP7", external_message_id="e2", text="hi again",
                              profile={"name": "Ada Lovelace"})
    cid2 = _get_or_create_customer(db, account, inbound2, str(test_organization.id))
    assert cid2 == cid  # same customer
    db.refresh(cust)
    assert cust.full_name == "Ada Lovelace"


@pytest.mark.asyncio
async def test_enrich_customer_name_only_fetches_while_placeholder(db, account, test_organization):
    """fetch_profile is called to resolve a placeholder name, but skipped once
    the customer already has a real name (no per-message API call)."""
    from unittest.mock import AsyncMock
    from app.services.channel_chat import _get_or_create_customer, _enrich_customer_name
    from app.channels.base import InboundMessage
    from app.models.customer import Customer
    import uuid as _uuid

    account.channel_type = "slack"
    inbound = InboundMessage(external_account_id="T1", external_conversation_id="D8",
                             external_user_id="U0ENRICH", external_message_id="e1", text="hi")
    cid = _get_or_create_customer(db, account, inbound, str(test_organization.id))
    cust = db.query(Customer).filter(Customer.id == _uuid.UUID(cid)).one()
    assert cust.full_name == "Slack user U0ENRICH"

    # Placeholder present → adapter is queried and the name is upgraded
    adapter = AsyncMock()
    adapter.fetch_profile = AsyncMock(return_value={"name": "Grace Hopper"})
    await _enrich_customer_name(db, adapter, account, inbound, cid)
    adapter.fetch_profile.assert_awaited_once()
    db.refresh(cust)
    assert cust.full_name == "Grace Hopper"

    # Real name already set → no further API call on subsequent messages
    adapter.fetch_profile.reset_mock()
    await _enrich_customer_name(db, adapter, account, inbound, cid)
    adapter.fetch_profile.assert_not_awaited()


@pytest.mark.asyncio
async def test_whatsapp_inbound_stores_the_phone(db, test_organization):
    """The WhatsApp adapter declares profile['phone']; identity stores it."""
    from app.services.channel_chat import _get_or_create_customer
    from app.models.channels import ChannelAccount
    from app.models.customer import Customer
    from app.channels.base import InboundMessage
    import uuid as _uuid

    account = MagicMock(spec=ChannelAccount)
    account.channel_type = "whatsapp"
    inbound = InboundMessage(
        external_account_id="PN1", external_conversation_id="911234567890",
        external_user_id="911234567890", external_message_id="m1", text="hi",
        profile={"name": "Priya", "phone": "+911234567890"})
    cid = _get_or_create_customer(db, account, inbound, str(test_organization.id))
    customer = db.query(Customer).filter(Customer.id == _uuid.UUID(cid)).one()
    assert customer.phone == "+911234567890"
    assert customer.email == "911234567890@whatsapp.channel"


@pytest.mark.asyncio
async def test_phone_unifies_one_human_across_channels(db, test_organization):
    """A widget lead with a captured phone and a WhatsApp inbound from that
    number resolve to ONE customer — the point of the phone identity key."""
    from app.services.channel_chat import _get_or_create_customer
    from app.models.channels import ChannelAccount
    from app.repositories.customer import CustomerRepository
    from app.channels.base import InboundMessage

    widget_person = CustomerRepository(db).create_customer(
        email="priya@example.com", organization_id=test_organization.id,
        full_name="Priya", phone="+911234567890")

    account = MagicMock(spec=ChannelAccount)
    account.channel_type = "whatsapp"
    inbound = InboundMessage(
        external_account_id="PN1", external_conversation_id="911234567890",
        external_user_id="911234567890", external_message_id="m2", text="hello",
        profile={"phone": "+911234567890"})
    cid = _get_or_create_customer(db, account, inbound, str(test_organization.id))
    assert cid == str(widget_person.id)


@pytest.mark.asyncio
async def test_channels_without_phone_keep_a_null_column(db, test_organization):
    from app.services.channel_chat import _get_or_create_customer
    from app.models.channels import ChannelAccount
    from app.models.customer import Customer
    from app.channels.base import InboundMessage
    import uuid as _uuid

    account = MagicMock(spec=ChannelAccount)
    account.channel_type = "messenger"
    inbound = InboundMessage(
        external_account_id="PG1", external_conversation_id="PSID9",
        external_user_id="PSID9", external_message_id="m1", text="hi")
    cid = _get_or_create_customer(db, account, inbound, str(test_organization.id))
    customer = db.query(Customer).filter(Customer.id == _uuid.UUID(cid)).one()
    assert customer.phone is None


@pytest.mark.asyncio
async def test_outbound_context_reaches_the_agent(db, routed_account, use_test_db, test_ai_config, mock_sio):
    """A reply to an outbound template is a fragment ("yes") — the agent gets
    told what was sent, on every turn, via extra_context."""
    response = SimpleNamespace(message="ok", transfer_to_human=False,
                               end_chat=False, request_lead_capture=False)
    fake_agent = MagicMock()
    fake_agent.get_response = AsyncMock(return_value=response)
    fake_agent.safe_cleanup_mcp_tools = AsyncMock()

    with patch.object(channel_chat.ChatAgent, "create_async", AsyncMock(return_value=fake_agent)) as create_async, \
         patch.object(channel_chat, "deliver_to_customer", AsyncMock()):
        # First inbound creates the conversation; stamp the outbound marker on
        # it the way start_outbound_conversation does, then send the reply.
        await process_channel_message(routed_account.id, make_inbound())
        conversation = db.query(ChannelConversation).one()
        remember_business_message(db, conversation, "Hi Priya, your order A-12 shipped.", "wamid.T")
        await process_channel_message(routed_account.id, make_inbound(text="yes"))

        extra = create_async.await_args.kwargs["extra_context"]
        assert "Hi Priya, your order A-12 shipped." in extra
        assert "Your business sent this customer" in extra


@pytest.mark.asyncio
async def test_ordinary_inbound_conversations_carry_no_outbound_context(db, routed_account, use_test_db, test_ai_config, mock_sio):
    response = SimpleNamespace(message="ok", transfer_to_human=False,
                               end_chat=False, request_lead_capture=False)
    fake_agent = MagicMock()
    fake_agent.get_response = AsyncMock(return_value=response)
    fake_agent.safe_cleanup_mcp_tools = AsyncMock()

    with patch.object(channel_chat.ChatAgent, "create_async", AsyncMock(return_value=fake_agent)) as create_async, \
         patch.object(channel_chat, "deliver_to_customer", AsyncMock()):
        await process_channel_message(routed_account.id, make_inbound())

    assert create_async.await_args.kwargs["extra_context"] is None


@pytest.fixture
def whatsapp_account(db, test_organization, test_agent):
    account = ChannelAccountRepository(db).create_account(
        organization_id=test_organization.id,
        channel_type="whatsapp",
        external_account_id="PN123",
        credentials={"access_token": "tok"},
        display_name="+1 555",
    )
    AgentChannelConfigRepository(db).set_agent(account.id, test_agent.id)
    return account


def _wa_tap():
    return InboundMessage(
        external_account_id="PN123", external_conversation_id="447",
        external_user_id="447", external_message_id="wamid.IN", text="Tomorrow",
        profile={"phone": "447"},
        interactive=InteractiveReply(type=InteractiveReplyType.BUTTON_REPLY,
                                     id="qr_1", title="Tomorrow"),
    )


class TestChoices:
    @pytest.mark.asyncio
    async def test_whatsapp_agent_is_told_it_can_offer_choices(
            self, db, whatsapp_account, use_test_db, test_ai_config, mock_sio, test_agent):
        test_agent.channel_quick_replies = True
        db.commit()
        response = SimpleNamespace(message="When?", transfer_to_human=False, end_chat=False,
                                   request_lead_capture=False, quick_replies=["Today", "Tomorrow"])
        fake_agent = MagicMock()
        fake_agent.get_response = AsyncMock(return_value=response)
        fake_agent.safe_cleanup_mcp_tools = AsyncMock()
        fake_agent.last_bot_message_id = 7

        with patch.object(channel_chat.ChatAgent, "create_async", AsyncMock(return_value=fake_agent)) as create_async, \
             patch.object(channel_chat, "deliver_to_customer",
                          AsyncMock(return_value=DeliveryResult(ok=True))) as deliver:
            await process_channel_message(whatsapp_account.id, _wa_tap())

        assert create_async.await_args.kwargs["choice_limits"] is WHATSAPP_LIMITS
        assert deliver.await_args.kwargs["message_id"] == 7
        sent = deliver.await_args.kwargs["interactive"]
        assert [b.title for b in sent.buttons] == ["Today", "Tomorrow"]
        user_attributes = fake_agent.get_response.await_args.kwargs["user_attributes"]
        assert user_attributes["interactive_reply"] == {"type": "button_reply", "id": "qr_1"}

    @pytest.mark.asyncio
    async def test_buttons_are_off_until_the_agent_turns_them_on(
            self, db, whatsapp_account, use_test_db, test_ai_config, mock_sio):
        response = SimpleNamespace(message="When?", transfer_to_human=False, end_chat=False,
                                   request_lead_capture=False, quick_replies=["Today", "Tomorrow"])
        fake_agent = MagicMock()
        fake_agent.get_response = AsyncMock(return_value=response)
        fake_agent.safe_cleanup_mcp_tools = AsyncMock()
        fake_agent.last_bot_message_id = 7

        with patch.object(channel_chat.ChatAgent, "create_async", AsyncMock(return_value=fake_agent)) as create_async, \
             patch.object(channel_chat, "deliver_to_customer",
                          AsyncMock(return_value=DeliveryResult(ok=True))) as deliver:
            await process_channel_message(whatsapp_account.id, _wa_tap())

        assert create_async.await_args.kwargs["choice_limits"] is None
        assert deliver.await_args.kwargs["interactive"] is None

    @pytest.mark.asyncio
    async def test_telegram_agents_get_buttons_when_turned_on(
            self, db, routed_account, use_test_db, test_ai_config, mock_sio, test_agent):
        test_agent.channel_quick_replies = True
        db.commit()
        fake_agent = _agent_persisting_reply(db)

        with patch.object(channel_chat.ChatAgent, "create_async", AsyncMock(return_value=fake_agent)) as create_async, \
             patch.object(channel_chat, "deliver_to_customer", AsyncMock(return_value=DeliveryResult(ok=True))):
            await process_channel_message(routed_account.id, make_inbound())

        assert create_async.await_args.kwargs["choice_limits"] is TELEGRAM_LIMITS

    @pytest.mark.asyncio
    async def test_a_channel_without_buttons_offers_none_even_when_turned_on(
            self, db, routed_account, use_test_db, test_ai_config, mock_sio, test_agent, monkeypatch):
        test_agent.channel_quick_replies = True
        db.commit()
        monkeypatch.setattr(type(channel_chat.get_adapter("telegram")), "interactive_limits", None)
        fake_agent = _agent_persisting_reply(db)

        with patch.object(channel_chat.ChatAgent, "create_async", AsyncMock(return_value=fake_agent)) as create_async, \
             patch.object(channel_chat, "deliver_to_customer", AsyncMock(return_value=DeliveryResult(ok=True))):
            await process_channel_message(routed_account.id, make_inbound())

        assert create_async.await_args.kwargs["choice_limits"] is None

    @pytest.mark.asyncio
    async def test_human_path_stores_and_relays_the_tap(self, db, whatsapp_account, use_test_db, mock_sio):
        with patch.object(channel_chat.AgentRepository, "get_agent",
                          return_value=SimpleNamespace(ai_replies_enabled=False, channel_quick_replies=False)), \
             patch.object(channel_chat, "notify_customer", AsyncMock()):
            await process_channel_message(whatsapp_account.id, _wa_tap())

        stored = db.query(ChatHistory).filter_by(message_type="user").one()
        assert stored.attributes["interactive_reply"] == {"type": "button_reply", "id": "qr_1"}
        relayed = mock_sio.emit.await_args.args[1]
        assert relayed["message_id"] == stored.id
        assert relayed["attributes"]["interactive_reply"]["id"] == "qr_1"


@pytest.mark.asyncio
async def test_concurrent_turns_each_deliver_against_their_own_reply(
        db, routed_account, use_test_db, test_ai_config, mock_sio):
    """Two messages processed at once on one conversation: each reply's
    delivery must point at that reply's row, never the other's (the old
    'latest bot message' read-back could swap them)."""
    import asyncio

    def _agent():
        agent = MagicMock()
        agent.safe_cleanup_mcp_tools = AsyncMock()

        async def _respond(**kwargs):
            await asyncio.sleep(0)  # let the other turn interleave
            text = f"re: {kwargs['message']}"
            agent.last_bot_message_id = ChatRepository(db).create_message({
                "message": text, "message_type": "bot",
                "session_id": kwargs["session_id"], "organization_id": kwargs["org_id"],
                "agent_id": kwargs["agent_id"], "customer_id": kwargs["customer_id"],
            }).id
            await asyncio.sleep(0)
            return SimpleNamespace(message=text, transfer_to_human=False,
                                   end_chat=False, request_lead_capture=False)
        agent.get_response = AsyncMock(side_effect=_respond)
        return agent

    deliveries = []

    async def _deliver(db_, session, payload, message_id=None, interactive=None, **_):
        deliveries.append((payload["message"], message_id))
        return DeliveryResult(ok=True)

    first, second = make_inbound("first"), make_inbound("second")
    second.external_message_id = "43"
    with patch.object(channel_chat.ChatAgent, "create_async", AsyncMock(side_effect=lambda **_: _agent())), \
         patch.object(channel_chat, "deliver_to_customer", side_effect=_deliver):
        await asyncio.gather(process_channel_message(routed_account.id, first),
                             process_channel_message(routed_account.id, second))

    assert len(deliveries) == 2
    for text, message_id in deliveries:
        assert db.get(ChatHistory, message_id).message == text


class TestAfterTheConversationWasDeleted:
    """Data retention and erasure requests delete conversations, and customers
    with them. The person can still message the channel: the next message must
    start over cleanly rather than fail on rows that are gone."""

    @staticmethod
    async def _send(account, text):
        response = SimpleNamespace(message="ok", transfer_to_human=False,
                                   end_chat=False, request_lead_capture=False)
        fake_agent = MagicMock()
        fake_agent.get_response = AsyncMock(return_value=response)
        fake_agent.safe_cleanup_mcp_tools = AsyncMock()
        with patch.object(channel_chat.ChatAgent, "create_async", AsyncMock(return_value=fake_agent)), \
             patch.object(channel_chat, "deliver_to_customer", AsyncMock()) as deliver:
            await process_channel_message(account.id, make_inbound(text))
        return deliver

    @pytest.mark.asyncio
    async def test_the_same_customer_gets_a_new_conversation(self, db, routed_account, use_test_db,
                                                             test_ai_config, mock_sio):
        await self._send(routed_account, "first")
        old = db.query(SessionToAgent).one()
        old_id, customer_id = old.session_id, old.customer_id
        erase_sessions(db, [old_id])

        deliver = await self._send(routed_account, "back again")

        new = db.query(SessionToAgent).one()
        assert new.session_id != old_id and new.customer_id == customer_id
        assert db.query(ChannelConversation).one().session_id == new.session_id
        deliver.assert_awaited_once()

    @pytest.mark.asyncio
    async def test_a_deleted_customer_is_created_again(self, db, routed_account, use_test_db,
                                                       test_ai_config, mock_sio):
        await self._send(routed_account, "first")
        old_customer = db.query(SessionToAgent).one().customer_id
        erase_customers(db, [old_customer])
        assert db.query(SessionToAgent).count() == 0

        deliver = await self._send(routed_account, "back again")

        session = db.query(SessionToAgent).one()
        assert session.customer_id != old_customer
        assert db.get(Customer, session.customer_id) is not None
        assert db.query(ChannelConversation).one().customer_id == session.customer_id
        deliver.assert_awaited_once()
