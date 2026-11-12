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

Running a widget reply that paused on host actions.

When the model calls an action, the run pauses (agno external execution). Each
call is recorded in agent_action_calls and sent to the page one at a time, in
the order the model made them. The page answers with action_result; once every
call of the step has an outcome, the run resumes on whichever worker received
the last answer. Nothing waits on a socket in between, so a reconnect or a
second worker never loses a reply.
"""

import json
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Iterable, List, Optional
from uuid import UUID

from sqlalchemy.orm import Session

from app.agents.chat_agent import ChatResponse
from app.agents.host_actions.turns import PausedTurn, args_hash, argument_problem, invalid_args_text, result_text
from app.core.encryption import decrypt_value, encrypt_value
from app.core.config import settings
from app.core.logger import get_logger
from app.core.socketio import sio
from app.models.agent_action import ActionCallStatus, ActionConfirmPolicy, AgentAction, AgentActionCall
from app.repositories.agent_action import AgentActionRepository
from app.repositories.agent_action_call import AgentActionCallRepository
from app.repositories.chat import ChatRepository
from app.repositories.widget import WidgetRepository
from app.services.widget_embed_policy import allows_embedder
from app.services.journey_runtime import step_actions_hint
from app.services.widget_journeys import sync_journey
from app.services.widget_reply import WIDGET_NAMESPACE, build_widget_agent, deliver_ai_reply, emit_bot_typing

logger = get_logger(__name__)

# Socket-session keys this module owns.
OFFERED_KEY = 'host_action_names'
PAUSES_KEY = 'host_action_pauses'

# Statuses the page may report for a call.
PAGE_OUTCOMES = {
    'ok': ActionCallStatus.OK,
    'error': ActionCallStatus.ERROR,
    'declined': ActionCallStatus.DECLINED,
    'timeout': ActionCallStatus.TIMEOUT,
}

ACTIONS_LIMIT_NOTE = (
    "Do not call any more app actions for this message. Answer the user now "
    "with what you have."
)
UNFINISHED_REPLY = "I couldn't finish that in the app. Please try again."


def _uuid(value: Any) -> UUID:
    """Socket sessions hold ids as UUIDs or strings, depending on where they came from."""
    return value if isinstance(value, UUID) else UUID(str(value))


def _aware(moment: datetime) -> datetime:
    return moment if moment.tzinfo else moment.replace(tzinfo=timezone.utc)


# --- What the page may offer -------------------------------------------------

def page_may_offer_actions(db: Session, widget_id: str, host_origin: Optional[str]) -> bool:
    """Actions run only on a site the widget is limited to: it must have
    allowed domains, and the page's origin must be one of them."""
    widget = WidgetRepository(db).get_widget(widget_id)
    if not widget or not widget.allowed_domains or not host_origin:
        return False
    return allows_embedder(db, widget.allowed_domains, widget.organization_id, host_origin)


def register_page_actions(db: Session, session: dict, names: Iterable[str]) -> List[str]:
    """Record which declared, enabled actions this page supplied code for, and
    return their names. Unknown or disabled names are ignored."""
    repo = AgentActionRepository(db)
    actions = repo.enabled_by_names(_uuid(session['agent_id']), names)
    repo.touch_registered(actions)
    offered = [a.name for a in actions]
    session[OFFERED_KEY] = offered
    return offered


def offered_actions(db: Session, session: dict) -> List[AgentAction]:
    """The actions to give the model this turn: what the page registered and
    is still declared and enabled."""
    names = session.get(OFFERED_KEY) or []
    return AgentActionRepository(db).enabled_by_names(_uuid(session['agent_id']), names)


# --- Pausing and dispatching -------------------------------------------------

def _call_args(call: AgentActionCall) -> Dict[str, Any]:
    if not call.args_ciphertext:
        return {}
    try:
        return json.loads(decrypt_value(call.args_ciphertext) or "{}")
    except (ValueError, TypeError):
        return {}


def _request_payload(call: AgentActionCall, action: Optional[AgentAction]) -> dict:
    return {
        'call_id': str(call.id),
        'name': call.action_name,
        'label': action.label if action else call.action_name,
        'args': _call_args(call),
        # An action deleted since the call was made asks first, to be safe.
        'confirm': action.confirm if action else ActionConfirmPolicy.ALWAYS.value,
        'timeout_s': action.timeout_s if action else settings.ACTION_TIMEOUT_DEFAULT_S,
    }


async def _dispatch(sid: str, call: AgentActionCall, db: Session) -> None:
    action = AgentActionRepository(db).get(call.agent_id, call.action_id) if call.action_id else None
    await sio.emit('action_request', _request_payload(call, action), to=sid, namespace=WIDGET_NAMESPACE)


async def _send(sid: str, session: dict, call: AgentActionCall, db: Session) -> None:
    """Send a call to the page, unless its arguments don't fit the action's
    schema: then the page never sees it and the model is told what to fix."""
    action = AgentActionRepository(db).get(call.agent_id, call.action_id) if call.action_id else None
    problem = argument_problem(action.parameters, _call_args(call)) if action else None
    if problem is None:
        await sio.emit('action_request', _request_payload(call, action), to=sid, namespace=WIDGET_NAMESPACE)
        return
    logger.info(f"Action {call.action_name} call {call.id} not sent: {problem}")
    await _settle(sid, session, call, ActionCallStatus.ERROR, invalid_args_text(problem),
                  error_code='invalid_arguments', confirmed=None, db=db)


async def start_paused_turn(sid: str, session: dict, paused: PausedTurn,
                            actions: Iterable[AgentAction], db: Session, pause_number: int = 1) -> None:
    """Record the calls of a paused step and send the first one to the page."""
    by_name = {a.name: a for a in actions}
    rows = [
        AgentActionCall(
            organization_id=_uuid(session['org_id']),
            agent_id=_uuid(session['agent_id']),
            action_id=by_name[call.tool_name].id if call.tool_name in by_name else None,
            action_name=call.tool_name or '',
            session_id=_uuid(session['session_id']),
            run_id=paused.run_id,
            tool_call_id=call.tool_call_id,
            seq=index,
            args_hash=args_hash(call.tool_args),
            args_ciphertext=encrypt_value(json.dumps(call.tool_args or {}, default=str)),
        )
        for index, call in enumerate(paused.calls)
    ]
    AgentActionCallRepository(db).record_pending(rows)
    session[PAUSES_KEY] = pause_number
    await sio.save_session(sid, session, namespace=WIDGET_NAMESPACE)
    await _send(sid, session, rows[0], db)


async def replay_open_call(sid: str, session_id: str, db: Session) -> None:
    """After a reconnect, send the call the reply is still waiting on again.
    The page caches results by call id, so a call it already ran is not run twice."""
    call = AgentActionCallRepository(db).open_call(_uuid(session_id))
    if call is not None and not _expired(call, db):
        await _dispatch(sid, call, db)


# --- Expiry ------------------------------------------------------------------

def _deadline(call: AgentActionCall, action: Optional[AgentAction]) -> datetime:
    timeout = action.timeout_s if action else settings.ACTION_TIMEOUT_DEFAULT_S
    seconds = timeout + settings.ACTION_GRACE_S
    if action is None or action.confirm != ActionConfirmPolicy.NEVER.value:
        seconds += settings.ACTION_CONFIRM_TIMEOUT_S
    return _aware(call.created_at) + timedelta(seconds=seconds)


def _expired(call: AgentActionCall, db: Session) -> bool:
    """Close a call the page never answered in time, with the rest of its step."""
    action = AgentActionRepository(db).get(call.agent_id, call.action_id) if call.action_id else None
    if datetime.now(timezone.utc) < _deadline(call, action):
        return False
    repo = AgentActionCallRepository(db)
    repo.claim(call, ActionCallStatus.ABANDONED)
    repo.skip_pending(call.run_id)
    logger.info(f"Abandoned host action call {call.tool_call_id} (run {call.run_id})")
    return True


def waiting_on_page(db: Session, session_id: str) -> bool:
    """True while a reply is waiting for the page to answer an action. Stale
    calls are given up on here, so a page that went away never blocks the chat."""
    call = AgentActionCallRepository(db).open_call(_uuid(session_id))
    return call is not None and not _expired(call, db)


# --- Results and resuming ----------------------------------------------------

def _parse_call_id(value: Any) -> Optional[UUID]:
    if not isinstance(value, str):
        return None
    try:
        return UUID(value)
    except ValueError:
        return None


def _first_pending_id(repo: AgentActionCallRepository, run_id: str) -> Optional[UUID]:
    pending = [c for c in repo.batch(run_id) if c.status == ActionCallStatus.PENDING.value]
    return pending[0].id if pending else None


async def handle_page_result(sid: str, session: dict, data: dict, db: Session) -> None:
    """Take the page's answer for one call; send the next call, or resume the
    reply once the whole step has an outcome."""
    call_id = _parse_call_id(data.get('call_id'))
    status = PAGE_OUTCOMES.get(data.get('status'))
    if call_id is None or status is None:
        await sio.emit('error', {'error': 'Invalid action result', 'type': 'validation_error'}, to=sid, namespace=WIDGET_NAMESPACE)
        return

    repo = AgentActionCallRepository(db)
    call = repo.get(call_id, _uuid(session['session_id']))
    # Only the call that was sent may be answered: an answer for a later one
    # (or two at once) would resume the reply early, or twice.
    if call is not None and _first_pending_id(repo, call.run_id) != call.id:
        return
    error = data.get('error')[:200] if isinstance(data.get('error'), str) else None
    confirmed = data.get('confirmed') if isinstance(data.get('confirmed'), bool) else None
    if call is not None:
        await _settle(sid, session, call, status, result_text(status, data.get('result'), error),
                      error_code=error[:48] if error else None, confirmed=confirmed, db=db)


async def _settle(sid: str, session: dict, call: AgentActionCall, status: ActionCallStatus, text: str,
                  *, error_code: Optional[str], confirmed: Optional[bool], db: Session) -> None:
    """Record one call's outcome, then send the next call or resume the reply
    once the whole step has an outcome."""
    repo = AgentActionCallRepository(db)
    claimed = repo.claim(
        call, status,
        error_code=error_code,
        confirmed=confirmed,
        result_ciphertext=encrypt_value(text),
    )
    if not claimed:
        # Already answered, or given up on: a duplicate or late result.
        return

    if status == ActionCallStatus.OK:
        # A step can be done by this action succeeding.
        await sync_journey(sid, session, db, actions=[call.action_name])
    else:
        repo.skip_pending(call.run_id)
    batch = repo.batch(call.run_id)
    next_call = next((c for c in batch if c.status == ActionCallStatus.PENDING.value), None)
    if next_call is not None:
        await _send(sid, session, next_call, db)
        return

    results = {c.tool_call_id: decrypt_value(c.result_ciphertext) if c.result_ciphertext else None for c in batch}
    await resume_reply(sid, session, call.run_id, results, db)


async def resume_reply(sid: str, session: dict, run_id: str, results: Dict[str, Optional[str]], db: Session) -> None:
    """Continue the paused run with the step's outcomes and deliver the reply.
    Past ACTION_PAUSES_PER_TURN the model is told to answer without more actions."""
    pause_number = int(session.get(PAUSES_KEY) or 1)
    at_limit = pause_number >= settings.ACTION_PAUSES_PER_TURN
    if at_limit:
        results = {k: f"{v or ''}\n{ACTIONS_LIMIT_NOTE}".strip() for k, v in results.items()}

    await emit_bot_typing(session['session_id'])
    actions = _actions_for_resume(db, session, run_id)
    agent = await build_widget_agent(session, actions, step_actions_hint(db, session, actions))
    try:
        response = await agent.continue_response(
            run_id, results,
            session_id=session['session_id'],
            org_id=session['org_id'],
            agent_id=session['agent_id'],
            customer_id=session['customer_id'],
        )
    finally:
        await agent.safe_cleanup_mcp_tools()

    if isinstance(response, PausedTurn):
        if not at_limit:
            await start_paused_turn(sid, session, response, actions, db, pause_number + 1)
            return
        # The model ignored the limit: close its calls and answer for it.
        logger.warning(f"Host action pause limit reached in session {session['session_id']}")
        response = _store_unfinished_reply(session, db)
    await deliver_ai_reply(sid, session, response, db)


def _actions_for_resume(db: Session, session: dict, run_id: str) -> List[AgentAction]:
    """What the page offers now plus what this run already called. After a
    reconnect the page may not have registered again yet, and the model must
    still have the tools its own earlier calls refer to."""
    called = [c.action_name for c in AgentActionCallRepository(db).batch(run_id)]
    names = set(session.get(OFFERED_KEY) or []) | set(called)
    return AgentActionRepository(db).enabled_by_names(_uuid(session['agent_id']), names)


def _store_unfinished_reply(session: dict, db: Session) -> ChatResponse:
    """The reply when the model kept calling actions past the limit, stored
    like any other bot turn."""
    ChatRepository(db).create_message({
        "message": UNFINISHED_REPLY,
        "message_type": "bot",
        "session_id": session['session_id'],
        "organization_id": session['org_id'],
        "agent_id": session['agent_id'],
        "customer_id": session['customer_id'],
        "attributes": {"host_action_limit": True},
    })
    return ChatResponse(
        message=UNFINISHED_REPLY, transfer_to_human=False, end_chat=False,
        request_rating=False, create_ticket=False,
    )
