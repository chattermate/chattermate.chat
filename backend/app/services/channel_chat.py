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

import uuid

from sqlalchemy.orm import Session

from app.agents.chat_agent import ChatAgent
from app.channels import InboundMessage, ChannelInteraction, get_adapter
from app.core.socketio import sio
from app.core.security import decrypt_api_key
from app.core.logger import get_logger
from app.database import SessionLocal
from app.models.ai_config import AIModelType
from app.models.channels import ChannelAccount
from app.models.session_to_agent import SessionStatus
from app.repositories.ai_config import AIConfigRepository
from app.repositories.chat import ChatRepository
from app.repositories.customer import CustomerRepository
from app.repositories.channels import (
    ChannelAccountRepository,
    ChannelConversationRepository,
    AgentChannelConfigRepository,
)
from app.repositories.session_to_agent import SessionToAgentRepository
from app.services.lead_capture import record_lead_from_response
from app.services.message_delivery import deliver_to_customer

# Optional enterprise message-limit check (same seam as the widget path)
try:
    from app.enterprise.services.message_limit import check_message_limit
    HAS_ENTERPRISE = True
except ImportError:
    HAS_ENTERPRISE = False

logger = get_logger(__name__)


async def process_channel_message(account_id, inbound: InboundMessage) -> None:
    """Process one inbound customer message from an external channel.

    Channel-agnostic core shared by every webhook route: resolves the
    customer and session, stores the message, runs the AI agent (or relays
    to the handling human), and delivers the reply through the channel's
    adapter. Runs from a BackgroundTask with its own DB session.
    """
    db = SessionLocal()
    try:
        account_repo = ChannelAccountRepository(db)
        account = account_repo.get_by_id(account_id)
        if account is None or not account.is_active:
            logger.warning(f"Ignoring message for missing/inactive channel account {account_id}")
            return

        adapter = get_adapter(account.channel_type)

        agent_id = AgentChannelConfigRepository(db).get_active_agent_id(account.id)
        if agent_id is None:
            logger.warning(f"No agent configured for {account.channel_type} account {account.id}")
            return

        org_id = str(account.organization_id)
        customer_id = _get_or_create_customer(db, account, inbound, org_id)
        session_record, conversation = _get_or_create_session(
            db, account, inbound, agent_id, customer_id, org_id
        )
        session_id = str(session_record.session_id)

        # Merge channel-specific per-conversation state (e.g. email threading
        # headers) so outbound replies can use it.
        if adapter is not None:
            state = adapter.conversation_state(inbound)
            if state:
                ChannelConversationRepository(db).set_extra(
                    conversation, {**(conversation.extra or {}), **state})

        # Human is handling (or transfer is pending): store + relay to the
        # agent dashboard, never run the bot.
        if session_record.user_id is not None or session_record.status == SessionStatus.TRANSFERRED:
            _store_customer_message(db, inbound, session_record, agent_id, customer_id, org_id, account)
            await _relay_to_human(session_record, inbound)
            return

        ai_config = AIConfigRepository(db).get_active_config(account.organization_id)
        if ai_config is None:
            logger.error(f"No AI config for org {org_id}; dropping {account.channel_type} message")
            return

        if not await _within_message_limit(db, org_id, ai_config):
            await _send_via_adapter(
                db, session_record,
                "Sorry, this assistant has reached its message limit. Please try again later."
            )
            return

        # Show a typing indicator while the agent composes its reply
        if adapter is not None:
            await adapter.send_typing(account, conversation)

        response = await _run_chat_agent(
            db, account, ai_config, inbound,
            org_id=org_id, agent_id=str(agent_id),
            customer_id=customer_id, session_id=session_id,
        )
        if response is None:
            return

        record_lead_from_response(
            db, response,
            organization_id=account.organization_id,
            agent_id=agent_id,
            customer_id=customer_id,
            session_id=session_id,
            channel=account.channel_type,
        )

        await deliver_to_customer(db, session_record, {
            'message': response.message,
            'type': 'chat_response',
            'transfer_to_human': getattr(response, 'transfer_to_human', False),
            'end_chat': getattr(response, 'end_chat', False),
        })

        await _send_channel_prompts(db, adapter, account, conversation, response)
    except Exception as e:
        logger.error(f"Error processing channel message: {e}", exc_info=True)
    finally:
        db.close()


async def _send_channel_prompts(db, adapter, account, conversation, response) -> None:
    """After the reply, surface channel-native prompts. Rating is deliberately
    NOT asked on external channels — it is a web-widget-only feature; here we
    only request a phone number when the agent asks for contact."""
    if adapter is None:
        return
    try:
        if getattr(response, 'request_contact', False):
            await adapter.request_phone(
                account, conversation,
                "To help us follow up, tap below to share your phone number.")
    except Exception as e:
        logger.error(f"Failed sending channel prompt: {e}")


async def process_channel_interaction(account_id, interaction: ChannelInteraction) -> None:
    """Handle a non-message interaction (a shared phone number) from a channel.
    Runs from a BackgroundTask with its own DB session."""
    db = SessionLocal()
    try:
        account = ChannelAccountRepository(db).get_by_id(account_id)
        if account is None or not account.is_active:
            return
        conversation = ChannelConversationRepository(db).get_latest(
            account.id, interaction.external_conversation_id)
        if conversation is None:
            return

        if interaction.type == "contact":
            _handle_contact(db, conversation, interaction)
    except Exception as e:
        logger.error(f"Error processing channel interaction: {e}", exc_info=True)
    finally:
        db.close()


def _handle_contact(db, conversation, interaction: ChannelInteraction) -> None:
    """Store a shared phone number on the customer record."""
    if not interaction.phone or conversation.customer_id is None:
        return
    from app.models.customer import Customer
    customer = db.query(Customer).filter(Customer.id == conversation.customer_id).first()
    if customer is None:
        return
    meta = dict(customer.meta_data or {})
    meta["phone"] = interaction.phone
    customer.meta_data = meta
    db.commit()
    logger.info(f"Stored shared phone for customer {conversation.customer_id}")


def _get_or_create_customer(db: Session, account: ChannelAccount,
                            inbound: InboundMessage, org_id: str) -> str:
    """Resolve the platform user to a Customer.

    When the channel already gives us the customer's real email (e.g. the
    email channel), use it verbatim so the same person is unified across
    channels and the widget. Otherwise synthesize a stable per-channel address.
    """
    real_email = (inbound.profile or {}).get('email')
    if real_email and '@' in real_email:
        channel_email = real_email.lower()
    else:
        channel_email = f"{inbound.external_user_id}@{account.channel_type}.channel"
    display = (inbound.profile or {}).get('name') or \
        f"{account.channel_type.capitalize()} user {inbound.external_user_id[:8]}"
    customer = CustomerRepository(db).get_or_create_customer(
        email=channel_email,
        organization_id=uuid.UUID(org_id),
        full_name=display,
    )
    return str(customer.id)


def _get_or_create_session(db: Session, account: ChannelAccount, inbound: InboundMessage,
                           agent_id, customer_id: str, org_id: str):
    """Find the open session for this platform conversation or start a new one."""
    conv_repo = ChannelConversationRepository(db)
    session_repo = SessionToAgentRepository(db)

    conversation = conv_repo.get_active(account.id, inbound.external_conversation_id)
    if conversation is not None:
        conv_repo.touch_inbound(conversation)
        return session_repo.get_session(conversation.session_id), conversation

    session_id = str(uuid.uuid4())
    session_record = session_repo.create_session(
        session_id=session_id,
        agent_id=str(agent_id),
        customer_id=customer_id,
        organization_id=org_id,
        channel=account.channel_type,
    )
    conversation = conv_repo.create(
        channel_account_id=account.id,
        channel_type=account.channel_type,
        external_conversation_id=inbound.external_conversation_id,
        external_user_id=inbound.external_user_id,
        session_id=uuid.UUID(session_id),
        organization_id=account.organization_id,
        agent_id=agent_id,
        customer_id=uuid.UUID(customer_id),
    )
    return session_record, conversation


def _store_customer_message(db: Session, inbound: InboundMessage, session_record,
                            agent_id, customer_id: str, org_id: str,
                            account: ChannelAccount) -> None:
    """Persist a customer message on the human-handled path (the AI path
    persists inside ChatAgent.get_response)."""
    ChatRepository(db).create_message({
        "message": inbound.text or "",
        "message_type": "user",
        "session_id": str(session_record.session_id),
        "organization_id": org_id,
        "agent_id": str(agent_id),
        "customer_id": customer_id,
        "attributes": {
            "channel": account.channel_type,
            "external_message_id": inbound.external_message_id,
        },
    })


async def _relay_to_human(session_record, inbound: InboundMessage) -> None:
    """Forward a customer message to the handling agent's dashboard rooms,
    mirroring the widget's chat_reply events."""
    session_id = str(session_record.session_id)
    payload = {
        'message': inbound.text or "",
        'type': 'user_message',
        'transfer_to_human': False,
        'session_id': session_id,
    }
    if session_record.user_id is not None:
        await sio.emit('chat_reply', payload, room=f"user_{session_record.user_id}", namespace='/agent')
    await sio.emit('chat_reply', payload, room=session_id, namespace='/agent')


async def _within_message_limit(db: Session, org_id: str, ai_config) -> bool:
    """Enterprise subscription limit; permissive on any failure so the
    community edition and enterprise errors never block conversations."""
    if not (HAS_ENTERPRISE and ai_config.model_type == AIModelType.CHATTERMATE):
        return True
    try:
        return await check_message_limit(db, org_id, None, None)
    except Exception as e:
        logger.error(f"Message limit check failed (allowing message): {e}")
        return True


async def _run_chat_agent(db: Session, account: ChannelAccount, ai_config,
                          inbound: InboundMessage, org_id: str, agent_id: str,
                          customer_id: str, session_id: str):
    """Run the AI agent for one turn. Workflow-enabled agents fall back to the
    plain agent on external channels (workflow forms/buttons are widget-only)."""
    chat_agent = await ChatAgent.create_async(
        api_key=decrypt_api_key(ai_config.encrypted_api_key),
        model_name=ai_config.model_name,
        model_type=ai_config.model_type.value if hasattr(ai_config.model_type, 'value') else ai_config.model_type,
        org_id=org_id,
        agent_id=agent_id,
        customer_id=customer_id,
        session_id=session_id,
        channel=account.channel_type,
    )
    try:
        return await chat_agent.get_response(
            message=inbound.text or "",
            session_id=session_id,
            org_id=org_id,
            agent_id=agent_id,
            customer_id=customer_id,
        )
    except Exception as e:
        logger.error(f"Chat agent error on {account.channel_type} session {session_id}: {e}")
        return None
    finally:
        await chat_agent.safe_cleanup_mcp_tools()


async def _send_via_adapter(db: Session, session_record, text: str) -> None:
    """Send a plain service message to the customer's channel."""
    await deliver_to_customer(db, session_record, {'message': text, 'type': 'chat_response'})
