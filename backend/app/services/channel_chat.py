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
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy.orm import Session

from app.agents.chat_agent import ChatAgent
from app.channels import InboundMessage, ChannelInteraction, get_adapter
from app.channels.app_hooks import HandledBy
from app.channels.base import InteractiveMessage
from app.channels.constants import MessageSource
from app.channels.interactive import from_options
from app.channels.interactive_limits import InteractiveLimits
from app.core.security import decrypt_api_key
from app.core.logger import get_logger
from app.database import SessionLocal, release_connection
from app.models.channels import ChannelAccount
from app.models.session_to_agent import SessionStatus
from app.repositories.agent import AgentRepository
from app.repositories.ai_config import AIConfigRepository
from app.repositories.chat import ChatRepository
from app.repositories.customer import CustomerRepository
from app.utils.phone import normalize_msisdn
from app.repositories.channels import (
    ChannelAccountRepository,
    ChannelConversationRepository,
    AgentChannelConfigRepository,
)
from app.repositories.session_to_agent import SessionToAgentRepository
from app.services.app_first_routing import announce_inbound, app_claims
from app.services.chat_notifications import notify_new_channel_chat_once, team_not_yet_notified
from app.services.human_routing import HUMAN_ONLY_ACK, notify_customer
from app.services.lead_capture import record_lead_from_response
from app.services.conversation_token import VERIFIED_SCOPE
from app.services.agent_rooms import USER_MESSAGE, relay_stored_message
from app.services.ai_access import plan_allows_ai, tell_customer_ai_is_off
from app.services.business_message import business_message_context
from app.services.channel_replies import inbound_attributes, reply_text
from app.services.message_delivery import DeliveryResult, deliver_to_customer

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
        # If the customer still has a synthesized placeholder name, resolve the
        # real one via the platform API — only then, not on every message.
        if adapter is not None:
            await _enrich_customer_name(db, adapter, account, inbound, customer_id)
        session_record, conversation, is_new_session = _get_or_create_session(
            db, account, inbound, agent_id, customer_id, org_id
        )
        session_id = str(session_record.session_id)

        # Merge channel-specific per-conversation state (e.g. email threading
        # headers) so outbound replies can use it.
        if adapter is not None:
            state = adapter.conversation_state(inbound)
            if state:
                ChannelConversationRepository(db).merge_extra(conversation, state)

        # A human-only agent answers nothing — the chat waits in the inbox for
        # someone to pick it up, so it takes the same path as one a human
        # already holds.
        agent = AgentRepository(db).get_agent(agent_id)
        agent_uses_ai = agent.ai_replies_enabled if agent else True
        # The plan can switch the AI off too, for this message only: the
        # conversation stays as it is, so the AI is back as soon as it's allowed
        ai_config = AIConfigRepository(db).get_active_config(account.organization_id)
        plan_allows = ai_config is None or plan_allows_ai(db, org_id, ai_config.model_type, on_channel=True)
        ai_replies_enabled = agent_uses_ai and plan_allows
        # Buttons are the agent's choice (off unless turned on), where the
        # channel can show them
        choice_limits = (adapter.choice_limits_for(conversation)
                         if adapter is not None and agent is not None and agent.channel_quick_replies else None)

        # An installed extension (an external app) may answer first. Its reply
        # can land while we wait, so the customer's message keeps the time it
        # arrived and still sorts before it.
        received_at = datetime.now(timezone.utc)
        if await app_claims(db, account, session_record, customer_id, inbound, received_at):
            stored = _store_customer_message(db, inbound, session_record, agent_id,
                                             customer_id, org_id, account, created_at=received_at)
            await relay_stored_message(session_record, stored, USER_MESSAGE)
            if adapter is not None:
                await adapter.mark_read(account, inbound.external_message_id)
            await announce_inbound(account, session_record, customer_id, inbound,
                                   HandledBy.APP, received_at)
            return

        # From here the team (AI or inbox) is answering
        await notify_new_channel_chat_once(db, session_record, conversation)

        # Human is handling (or a transfer is pending, or this agent never uses
        # AI): store + relay to the agent dashboard, never run the bot.
        if (session_record.user_id is not None
                or session_record.status == SessionStatus.TRANSFERRED
                or not ai_replies_enabled):
            stored = _store_customer_message(db, inbound, session_record, agent_id,
                                             customer_id, org_id, account)
            await relay_stored_message(session_record, stored, USER_MESSAGE)
            await announce_inbound(account, session_record, customer_id, inbound,
                                   HandledBy.HUMAN, received_at)

            # Nothing will answer this on its own, so acknowledge once — on a
            # channel an unanswered message reads as a dead number. Only on the
            # opening message of a brand-new conversation.
            if is_new_session and not agent_uses_ai:
                await notify_customer(db, session_record, HUMAN_ONLY_ACK,
                                      channels_only=False)
            elif agent_uses_ai and not plan_allows and session_record.user_id is None:
                await tell_customer_ai_is_off(db, session_record)
            return

        await announce_inbound(account, session_record, customer_id, inbound,
                               HandledBy.AI, received_at)

        if ai_config is None:
            logger.error(f"No AI config for org {org_id}; dropping {account.channel_type} message")
            return

        # Show a typing indicator while the agent composes its reply
        if adapter is not None:
            await adapter.send_typing(account, conversation)

        response, bot_message_id = await _run_chat_agent(
            db, account, ai_config, inbound,
            org_id=org_id, agent_id=str(agent_id),
            customer_id=customer_id, session_id=session_id,
            conversation=conversation,
            choice_limits=choice_limits,
        )
        if response is None:
            # The agent hard-failed. Still send a reply so a typing indicator /
            # placeholder (Slack, LINE) resolves instead of dangling.
            await _deliver(db, session_record, {
                'message': "Sorry, I hit an error handling that — please try again.",
                'type': 'chat_response',
            }, source=MessageSource.SYSTEM)
            return

        record_lead_from_response(
            db, response,
            organization_id=account.organization_id,
            agent_id=agent_id,
            customer_id=customer_id,
            session_id=session_id,
            channel=account.channel_type,
            # The platform vouches for who is messaging.
            scope=VERIFIED_SCOPE,
        )

        delivery = await _deliver(db, session_record, {
            'message': response.message,
            'type': 'chat_response',
            'transfer_to_human': getattr(response, 'transfer_to_human', False),
            'end_chat': getattr(response, 'end_chat', False),
        }, source=MessageSource.AI, message_id=bot_message_id,
            interactive=_offered_choices(response, choice_limits))
        if not delivery.ok and bot_message_id is not None:
            ChatRepository(db).mark_delivery_failed(bot_message_id, delivery.reason)

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
    # Also promote to the identity column (set-if-absent, conflict-guarded) so
    # the person becomes phone-addressable; meta_data keeps the raw value for
    # anything already reading it there. msisdn-lenient because the number is
    # platform-relayed (Telegram sends it with or without '+'), and one commit
    # for both writes — separate transactions left a crash window where the
    # two stores disagreed.
    phone = normalize_msisdn(interaction.phone)
    if phone:
        CustomerRepository(db).set_phone_if_absent(customer, phone)
    db.commit()
    logger.info(f"Stored shared phone for customer {conversation.customer_id}")


def _get_or_create_customer(db: Session, account: ChannelAccount,
                            inbound: InboundMessage, org_id: str) -> str:
    """Resolve the platform user to a Customer.

    When the channel already gives us the customer's real email (e.g. the
    email channel), use it verbatim so the same person is unified across
    channels and the widget. Otherwise synthesize a stable per-channel address.

    Phone is the second identity key: adapters that truthfully know the
    customer's number (WhatsApp, SMS) declare it in profile['phone'], and the
    repository resolves by phone before email — which is what unifies one human
    across phone-bearing channels and outbound sends.
    """
    real_email = (inbound.profile or {}).get('email')
    real_name = (inbound.profile or {}).get('name')
    if real_email and '@' in real_email:
        channel_email = real_email.lower()
    else:
        channel_email = f"{inbound.external_user_id}@{account.channel_type}.channel"
    customer = CustomerRepository(db).get_or_create_customer(
        email=channel_email,
        organization_id=uuid.UUID(org_id),
        full_name=real_name or placeholder_name(account.channel_type,
                                                inbound.external_user_id),
        # msisdn-lenient: adapters supply platform ids (wa_id, SMS sender),
        # which are E.164-without-plus — trusted in a way typed digits aren't.
        phone=normalize_msisdn((inbound.profile or {}).get('phone')),
    )
    # Upgrade an existing placeholder name once we've resolved the real one
    # (get_or_create doesn't update an existing customer's name).
    if real_name and _is_placeholder_name(customer.full_name, account.channel_type):
        try:
            customer.full_name = real_name
            db.commit()
        except Exception as e:
            db.rollback()
            logger.error(f"Failed to update customer name: {e}")
    return str(customer.id)


def placeholder_name(channel_type: str, external_user_id: str) -> str:
    """The stand-in name for a channel person we don't know yet.

    Paired with _is_placeholder_name deliberately: one builds the string, the
    other recognises it, and the two only work if they agree exactly. Spelling
    either out a second time somewhere else (an outbound send, say) makes them
    agree by coincidence — and the day the format changes, the detector
    silently stops matching and every real name upgrade stops happening.
    """
    return f"{channel_type.capitalize()} user {external_user_id[:8]}"


def _is_placeholder_name(name: str, channel_type: str) -> bool:
    """True when the stored name is the synthesized '<Channel> user xxxx' or empty."""
    if not name:
        return True
    return name.startswith(f"{channel_type.capitalize()} user ")


async def _enrich_customer_name(db: Session, adapter, account: ChannelAccount,
                                inbound: InboundMessage, customer_id: str) -> None:
    """Resolve the customer's real name via the platform API, but only while
    the stored name is still a placeholder.

    Channels like Slack send just a user id in the webhook, so we look the name
    up via e.g. users.info. Gating on the placeholder means we make that network
    call once — for a new/unresolved customer — not on every inbound message.
    """
    customer = CustomerRepository(db).get_by_id(uuid.UUID(customer_id))
    if customer is None or not _is_placeholder_name(customer.full_name, account.channel_type):
        return
    try:
        enrichment = await adapter.fetch_profile(account, inbound.external_user_id)
    except Exception as e:
        logger.debug(f"Profile enrichment failed (non-critical): {e}")
        return
    name = (enrichment or {}).get('name')
    if not name:
        return
    try:
        customer.full_name = name
        db.commit()
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to update customer name: {e}")


def _agent_changed(session_record, agent_id) -> bool:
    """Whether this channel now answers with a different agent than the one the
    open session was started with.

    A session is bound to one agent: its stored history, and the AI runtime's
    own memory for that session id, belong to that agent. Carrying it over to a
    newly configured agent makes the new agent answer out of the previous one's
    retrieved knowledge, and splits the inbox list in two — the conversations
    query groups by agent *and* session, while the detail view keys on session
    alone, so the same thread appears twice and neither row opens the other.

    A missing session likewise needs a new one. A human-handled or
    transferred chat is left alone: rotating it would drop the agent out of a
    live conversation mid-reply.
    """
    if session_record is None:
        return True
    if session_record.user_id is not None:
        return False
    if session_record.status == SessionStatus.TRANSFERRED:
        return False
    return str(session_record.agent_id) != str(agent_id)


def _get_or_create_session(db: Session, account: ChannelAccount, inbound: InboundMessage,
                           agent_id, customer_id: str, org_id: str):
    """Find the open session for this platform conversation or start a new one.

    Returns (session, conversation, is_new) — callers use is_new to notify the
    team only when a conversation actually starts.
    """
    conv_repo = ChannelConversationRepository(db)
    session_repo = SessionToAgentRepository(db)

    conversation = conv_repo.get_active(account.id, inbound.external_conversation_id)
    if conversation is not None:
        session_record = session_repo.get_session(conversation.session_id)
        if not _agent_changed(session_record, agent_id):
            conv_repo.touch_inbound(conversation)
            return session_record, conversation, False
        # Retire the thread so the newly configured agent starts clean. Closing
        # the session is what makes get_active skip it, so the create below
        # opens a fresh conversation for the same platform thread.
        logger.info(
            f"Agent changed for {account.channel_type} account {account.id}; "
            f"starting a new session for conversation {inbound.external_conversation_id}")
        session_repo.close_session(conversation.session_id)

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
        extra=team_not_yet_notified(),
    )
    return session_record, conversation, True


def _store_customer_message(db: Session, inbound: InboundMessage, session_record,
                            agent_id, customer_id: str, org_id: str,
                            account: ChannelAccount, created_at: Optional[datetime] = None):
    """Persist a customer message on the paths the AI doesn't answer (the AI
    path persists inside ChatAgent.get_response). Returns the stored row for
    the relay."""
    message = {
        "message": reply_text(db, account.id, inbound),
        "message_type": "user",
        "session_id": str(session_record.session_id),
        "organization_id": org_id,
        "agent_id": str(agent_id),
        "customer_id": customer_id,
        "attributes": inbound_attributes(inbound, account.channel_type),
    }
    if created_at is not None:
        message["created_at"] = created_at
    return ChatRepository(db).create_message(message)


async def _run_chat_agent(db: Session, account: ChannelAccount, ai_config,
                          inbound: InboundMessage, org_id: str, agent_id: str,
                          customer_id: str, session_id: str, conversation=None,
                          choice_limits: Optional[InteractiveLimits] = None):
    """Run the AI agent for one turn. Workflow-enabled agents fall back to the
    plain agent on external channels (workflow forms are widget-only).

    Returns (response, id of the stored reply row); response is None when the
    agent hard-failed."""
    # Everything the model call needs, read before the connection is let go:
    # it isn't held through the call, and these rows would reload on access
    channel = account.channel_type
    message = reply_text(db, account.id, inbound)
    attributes = inbound_attributes(inbound, channel)
    extra_context = business_message_context(conversation)
    model = dict(
        api_key=decrypt_api_key(ai_config.encrypted_api_key),
        model_name=ai_config.model_name,
        model_type=ai_config.model_type.value if hasattr(ai_config.model_type, 'value') else ai_config.model_type,
        base_url=(ai_config.settings or {}).get('base_url'),
    )
    release_connection(db)
    chat_agent = await ChatAgent.create_async(
        **model,
        org_id=org_id,
        agent_id=agent_id,
        customer_id=customer_id,
        session_id=session_id,
        channel=channel,
        extra_context=extra_context,
        choice_limits=choice_limits,
    )
    try:
        response = await chat_agent.get_response(
            message=message,
            session_id=session_id,
            org_id=org_id,
            agent_id=agent_id,
            customer_id=customer_id,
            user_attributes=attributes,
        )
        return response, chat_agent.last_bot_message_id
    except Exception as e:
        logger.error(f"Chat agent error on {channel} session {session_id}: {e}")
        return None, None
    finally:
        await chat_agent.safe_cleanup_mcp_tools()


def _offered_choices(response, limits: Optional[InteractiveLimits]) -> Optional[InteractiveMessage]:
    """The agent's choices as the interactive message to send with its reply."""
    options = getattr(response, 'quick_replies', None)
    return from_options(response.message, options, limits) if options and limits is not None else None


async def _deliver(db: Session, session_record, payload: dict, *, source: MessageSource,
                   message_id: Optional[int] = None,
                   interactive: Optional[InteractiveMessage] = None) -> DeliveryResult:
    """Deliver a reply and log any failure.

    Unlike the widget path there is no agent socket to notify here, so a failed
    send would otherwise be silent: the customer gets nothing and nothing says
    so. Callers that have a stored message act further on the result.
    """
    result = await deliver_to_customer(db, session_record, payload, message_id=message_id,
                                       interactive=interactive, source=source)
    if not result.ok:
        logger.warning(
            f"Undelivered reply on {getattr(session_record, 'channel', 'unknown')} "
            f"session {session_record.session_id}: {result.reason}")
    return result
