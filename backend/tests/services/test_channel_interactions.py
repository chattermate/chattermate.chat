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

import pytest

from app.channels.base import ChannelInteraction, InboundMessage
from app.models.customer import Customer
from app.repositories.channels import (
    ChannelAccountRepository,
    ChannelConversationRepository,
    AgentChannelConfigRepository,
)
from app.repositories.rating import RatingRepository
from app.repositories.session_to_agent import SessionToAgentRepository
from app.services import channel_chat
from app.services.channel_chat import process_channel_interaction, process_channel_message


@pytest.fixture
def use_test_db(db, monkeypatch):
    class _NonClosing:
        def __init__(self, inner):
            self._inner = inner
        def __getattr__(self, name):
            return getattr(self._inner, name)
        def close(self):
            pass
    monkeypatch.setattr(channel_chat, "SessionLocal", lambda: _NonClosing(db))
    return db


@pytest.fixture
def account(db, test_organization):
    return ChannelAccountRepository(db).create_account(
        organization_id=test_organization.id,
        channel_type="telegram",
        external_account_id="bot1",
        credentials={"bot_token": "1:x"},
        display_name="@bot",
    )


@pytest.fixture
def conversation(db, account, test_agent, test_customer, test_organization):
    import uuid
    session = SessionToAgentRepository(db).create_session(
        session_id=uuid.uuid4(),
        agent_id=test_agent.id, customer_id=test_customer.id,
        organization_id=test_organization.id, channel="telegram")
    return ChannelConversationRepository(db).create(
        channel_account_id=account.id, channel_type="telegram",
        external_conversation_id="555", external_user_id="555",
        session_id=session.session_id, organization_id=test_organization.id,
        agent_id=test_agent.id, customer_id=test_customer.id)


@pytest.fixture
def fake_adapter(monkeypatch):
    adapter = MagicMock()
    adapter.send_text = AsyncMock()
    adapter.send_typing = AsyncMock()
    adapter.request_phone = AsyncMock()
    monkeypatch.setattr(channel_chat, "get_adapter", lambda ct: adapter)
    return adapter


@pytest.mark.asyncio
async def test_contact_stores_phone(db, account, conversation, use_test_db, fake_adapter):
    interaction = ChannelInteraction(type="contact", external_account_id="",
                                     external_conversation_id="555", external_user_id="555",
                                     phone="+441234567890")
    await process_channel_interaction(account.id, interaction)

    customer = db.query(Customer).filter(Customer.id == conversation.customer_id).one()
    assert customer.meta_data.get("phone") == "+441234567890"
    # Promoted to the identity column too, so the person is phone-addressable
    assert customer.phone == "+441234567890"


@pytest.mark.asyncio
async def test_typing_shown_no_rating_prompt_on_end_chat(db, account, conversation, use_test_db,
                                                         fake_adapter, test_ai_config):
    """Typing indicator fires, but rating is NEVER asked on a channel — rating
    is a web-widget-only feature."""
    AgentChannelConfigRepository(db).set_agent(account.id, conversation.agent_id)
    response = SimpleNamespace(message="Bye!", transfer_to_human=False, end_chat=True,
                              request_rating=True, request_contact=False,
                              request_lead_capture=False)
    fake = MagicMock()
    fake.get_response = AsyncMock(return_value=response)
    fake.safe_cleanup_mcp_tools = AsyncMock()

    inbound = InboundMessage(external_account_id="", external_conversation_id="555",
                             external_user_id="555", external_message_id="m3", text="bye")
    with patch.object(channel_chat.ChatAgent, "create_async", AsyncMock(return_value=fake)), \
         patch.object(channel_chat, "deliver_to_customer", AsyncMock()):
        await process_channel_message(account.id, inbound)

    fake_adapter.send_typing.assert_awaited()
    # No rating was recorded and the adapter was never asked to prompt for one
    assert RatingRepository(db).get_rating_by_session(conversation.session_id) is None
    assert not hasattr(fake_adapter, "send_rating_prompt") or \
        not fake_adapter.send_rating_prompt.called


@pytest.mark.asyncio
async def test_request_contact_triggers_phone_prompt(db, account, conversation, use_test_db,
                                                    fake_adapter, test_ai_config):
    AgentChannelConfigRepository(db).set_agent(account.id, conversation.agent_id)
    response = SimpleNamespace(message="Let me connect you.", transfer_to_human=False,
                              end_chat=False, request_rating=False, request_contact=True,
                              request_lead_capture=False)
    fake = MagicMock()
    fake.get_response = AsyncMock(return_value=response)
    fake.safe_cleanup_mcp_tools = AsyncMock()

    inbound = InboundMessage(external_account_id="", external_conversation_id="555",
                             external_user_id="555", external_message_id="m4", text="help")
    with patch.object(channel_chat.ChatAgent, "create_async", AsyncMock(return_value=fake)), \
         patch.object(channel_chat, "deliver_to_customer", AsyncMock()):
        await process_channel_message(account.id, inbound)

    fake_adapter.request_phone.assert_awaited()
