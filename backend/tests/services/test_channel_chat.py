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

from app.channels.base import InboundMessage
from app.models.channels import ChannelConversation
from app.models.session_to_agent import SessionToAgent, SessionStatus
from app.repositories.channels import (
    ChannelAccountRepository,
    ChannelConversationRepository,
    AgentChannelConfigRepository,
)
from app.repositories.chat import ChatRepository
from app.services import channel_chat
from app.services.channel_chat import process_channel_message
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
    monkeypatch.setattr(channel_chat, "sio", sio)
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


def _agent_persisting_reply(db, text="hi there"):
    """A ChatAgent stub that persists its reply the way the real one does, so
    the delivery-status read-back has a row to find."""
    response = SimpleNamespace(message=text, transfer_to_human=False,
                               end_chat=False, request_lead_capture=False)

    async def _respond(**kwargs):
        ChatRepository(db).create_message({
            "message": text,
            "message_type": "bot",
            "session_id": kwargs["session_id"],
            "organization_id": kwargs["org_id"],
            "agent_id": kwargs["agent_id"],
            "customer_id": kwargs["customer_id"],
        })
        return response

    fake_agent = MagicMock()
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

    conversation = db.query(ChannelConversation).one()
    message = ChatRepository(db).get_latest_bot_message(conversation.session_id)
    assert message.attributes["delivery_status"] == "window_expired"


@pytest.mark.asyncio
async def test_bot_reply_marks_nothing_when_delivered(db, routed_account, use_test_db, test_ai_config, mock_sio):
    fake_agent = _agent_persisting_reply(db)

    with patch.object(channel_chat.ChatAgent, "create_async", AsyncMock(return_value=fake_agent)), \
         patch.object(channel_chat, "deliver_to_customer", AsyncMock(return_value=DeliveryResult(ok=True))):
        await process_channel_message(routed_account.id, make_inbound())

    conversation = db.query(ChannelConversation).one()
    message = ChatRepository(db).get_latest_bot_message(conversation.session_id)
    assert "delivery_status" not in (message.attributes or {})


def test_latest_bot_message_ignores_human_agent_replies(db, test_organization, test_agent):
    """'agent' is a human's message, never the AI's. A human replying after the
    bot must not become the row a delivery failure gets stamped on."""
    chat_repo = ChatRepository(db)
    session_id = str(uuid4())
    common = {
        "session_id": session_id,
        "organization_id": str(test_organization.id),
        "agent_id": str(test_agent.id),
    }
    bot = chat_repo.create_message({**common, "message": "bot reply", "message_type": "bot"})
    chat_repo.create_message({**common, "message": "human reply", "message_type": "agent"})

    assert chat_repo.get_latest_bot_message(session_id).id == bot.id


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
        external_account_id="PN1", external_conversation_id="916366602824",
        external_user_id="916366602824", external_message_id="m1", text="hi",
        profile={"name": "Priya", "phone": "+916366602824"})
    cid = _get_or_create_customer(db, account, inbound, str(test_organization.id))
    customer = db.query(Customer).filter(Customer.id == _uuid.UUID(cid)).one()
    assert customer.phone == "+916366602824"
    assert customer.email == "916366602824@whatsapp.channel"


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
        full_name="Priya", phone="+916366602824")

    account = MagicMock(spec=ChannelAccount)
    account.channel_type = "whatsapp"
    inbound = InboundMessage(
        external_account_id="PN1", external_conversation_id="916366602824",
        external_user_id="916366602824", external_message_id="m2", text="hello",
        profile={"phone": "+916366602824"})
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
    from app.repositories.channels import ChannelConversationRepository

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
        ChannelConversationRepository(db).set_extra(conversation, {
            **(conversation.extra or {}),
            "outbound_template": "Hi Priya, your order A-12 shipped.",
        })
        await process_channel_message(routed_account.id, make_inbound(text="yes"))

        extra = create_async.await_args.kwargs["extra_context"]
        assert "Hi Priya, your order A-12 shipped." in extra
        assert "started by your business" in extra


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


def test_outbound_context_helper_quotes_the_template():
    from app.services.channel_chat import _outbound_context
    from types import SimpleNamespace as NS

    assert _outbound_context(None) is None
    assert _outbound_context(NS(extra=None)) is None
    assert _outbound_context(NS(extra={})) is None
    text = _outbound_context(NS(extra={"outbound_template": "Your code is 1234"}))
    assert '"Your code is 1234"' in text
