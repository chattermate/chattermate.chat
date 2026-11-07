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

Building the widget's AI agent for a socket session and sending its reply.
Shared by a normal chat turn and by a turn that resumes after host actions.
"""

from typing import Iterable, Optional

from app.agents.chat_agent import ChatAgent, ChatResponse
from app.agents.host_actions.tools import build_action_functions, host_extra_context
from app.core.logger import get_logger
from app.core.security import decrypt_api_key
from app.core.socketio import sio
from app.models.agent_action import AgentAction
from app.repositories.agent import AgentRepository
from app.repositories.customer import CustomerRepository
from app.repositories.session_to_agent import SessionToAgentRepository
from app.services.contact_capture import build_handoff_contact_form
from app.services.host_prompt import host_prompt_context
from app.services.lead_capture import record_lead_from_response

logger = get_logger(__name__)

WIDGET_NAMESPACE = '/widget'


async def emit_bot_typing(session_id: str) -> None:
    """Tell the widget a reply is actually being produced.

    The widget owns no opinion about this: it shows the typing indicator only
    between this event and the reply that follows. Every path that answers
    nothing — a human-only agent, a chat someone has taken over, a closed
    session — simply never calls this, so the indicator cannot be left spinning
    over a conversation nobody is answering.
    """
    await sio.emit('bot_typing', {'session_id': session_id},
                   room=session_id, namespace=WIDGET_NAMESPACE)


def widget_agent_kwargs(session: dict, host_actions: Iterable[AgentAction] = (),
                        journey_hint: Optional[str] = None) -> dict:
    """Everything ChatAgent needs for this socket session, read up front so a
    caller can release its database connection before the slow agent build.
    `journey_hint` names the actions that finish the user's journey step."""
    ai_config = session['ai_config']
    actions = list(host_actions)
    return dict(
        api_key=decrypt_api_key(ai_config.encrypted_api_key),
        model_name=ai_config.model_name,
        model_type=ai_config.model_type,
        base_url=(ai_config.settings or {}).get('base_url'),
        org_id=session['org_id'],
        agent_id=session['agent_id'],
        customer_id=session['customer_id'],
        session_id=session['session_id'],
        source=session.get('source'),
        extra_context=_joined(
            host_extra_context(session.get('host_context'), bool(actions)),
            journey_hint,
            host_prompt_context(session.get('host_prompt')),
        ),
        host_action_functions=build_action_functions(actions) or None,
    )


def _joined(*parts: Optional[str]) -> Optional[str]:
    text = "\n\n".join(p for p in parts if p)
    return text or None


async def create_widget_agent(agent_kwargs: dict) -> ChatAgent:
    return await ChatAgent.create_async(**agent_kwargs)


async def build_widget_agent(session: dict, host_actions: Iterable[AgentAction] = (),
                             journey_hint: Optional[str] = None) -> ChatAgent:
    """The ChatAgent for this socket session, with the host page's actions and
    context when the page supplied any."""
    return await create_widget_agent(widget_agent_kwargs(session, host_actions, journey_hint))


def _response_payload(response: ChatResponse, session_id: str) -> dict:
    payload = {
        'message': response.message,
        'type': 'chat_response',
        'session_id': session_id,
        'transfer_to_human': response.transfer_to_human,
        'end_chat': response.end_chat,
        'end_chat_reason': response.end_chat_reason.value if response.end_chat_reason else None,
        'end_chat_description': response.end_chat_description,
        'request_rating': response.request_rating,
        # Populated below when the reply carries product data.
        'shopify_output': None,
        # Knowledge-base citations (rendering is gated client-side by the agent's
        # show_citations customization setting).
        'sources': [s.model_dump() for s in response.sources] if getattr(response, 'sources', None) else None,
    }
    shopify_output = getattr(response, 'shopify_output', None)
    if shopify_output:
        try:
            payload['shopify_output'] = shopify_output.model_dump(exclude_unset=True)
        except AttributeError:
            if isinstance(shopify_output, dict):
                payload['shopify_output'] = shopify_output
            else:
                logger.warning(f"Unexpected type for shopify_output: {type(shopify_output)}")
    return payload


async def deliver_ai_reply(sid: str, session: dict, response: Optional[ChatResponse], db) -> None:
    """Send the AI's reply to the conversation, then act on what it asked for:
    the hand-off contact form, a captured lead, or ending the chat."""
    if response is None or not response.message:
        return
    session_id = session['session_id']
    customer_id = session['customer_id']
    await sio.emit('chat_response', _response_payload(response, session_id), room=session_id, namespace=WIDGET_NAMESPACE)

    # On human handoff, optionally collect the visitor's contact details (email/name)
    # so the human agent can follow up. Fires for both a live transfer and the
    # no-agents/ticket case (request_contact). Only asks for enabled + missing fields.
    if response.transfer_to_human or getattr(response, 'request_contact', False):
        try:
            handoff_agent = AgentRepository(db).get_agent(session['agent_id'])
            customer = CustomerRepository(db).get_by_id(customer_id)
            if handoff_agent and customer:
                contact_form = build_handoff_contact_form(
                    customer,
                    collect_email=getattr(handoff_agent, 'handoff_collect_email', True),
                    collect_name=getattr(handoff_agent, 'handoff_collect_name', True),
                )
                if contact_form:
                    await sio.emit('display_form', {
                        'form_data': contact_form,
                        'session_id': session_id,
                    }, room=session_id, namespace=WIDGET_NAMESPACE)
        except Exception as contact_err:
            logger.error(f"Failed to emit handoff contact form: {contact_err}")

    # Lead capture: the agent collected the details conversationally and set
    # request_lead_capture (like transfer_to_human). Persist the structured
    # lead_data + AI summary — no form. Skipped on transfer/handoff (the branch
    # above takes precedence), but NOT on end_chat: the model naturally captures
    # and signs off in the same turn, and this runs before the close block below.
    # record_lead_capture enforces valid-email + consent and captures once.
    elif getattr(response, 'request_lead_capture', False):
        lc_resp = record_lead_from_response(
            db, response,
            organization_id=session['org_id'],
            agent_id=session['agent_id'],
            customer_id=customer_id,
            session_id=session_id,
            page_url=session.get('page_url'),
            scope=session.get('conversation_scope'),
        )
        # If the capture merged this anonymous visitor into an existing
        # customer (email already known), repoint the live socket session
        # so the rest of this conversation writes to the merged customer.
        # Isolated so a session-store failure can't skip the end_chat
        # close block below.
        if lc_resp is not None and str(lc_resp.customer_id) != str(customer_id):
            try:
                session['customer_id'] = str(lc_resp.customer_id)
                await sio.save_session(sid, session, namespace=WIDGET_NAMESPACE)
                logger.info(f"Lead capture merged customer {customer_id} -> {lc_resp.customer_id}")
            except Exception as merge_err:
                logger.error(f"Failed to repoint socket session after merge: {merge_err}")

    if response.end_chat:
        try:
            SessionToAgentRepository(db).close_session(
                session_id=session_id,
                reason=response.end_chat_reason.value if response.end_chat_reason else None,
                description=response.end_chat_description,
            )
            logger.info(f"Session {session_id} closed due to end_chat with reason: {response.end_chat_reason}")
        except Exception as close_error:
            logger.error(f"Error closing session {session_id}: {close_error}")
