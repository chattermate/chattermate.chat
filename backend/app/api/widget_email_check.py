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

The widget's email check (app/services/email_check.py):
  email_check_start {email, purpose?}  -> email_check_sent {email_masked}
    (purpose 'history': the history screen asks, to find chats from other browsers;
     a Pro plan's, widget_plan.py)
  email_check_verify {code}  -> email_check_verified {email_masked}
Either can answer email_check_error {reason, retry_in?, attempts_left?}.
"""

import asyncio
import smtplib
from email.headerregistry import Address
from email.message import EmailMessage

from app.api.widget_actions import authenticated_session
from app.core.logger import get_logger
from app.core.socketio import sio
from app.database import SessionLocal
from app.services import email_check, shopify_app_proxy, visitor_history, widget_plan
from app.services.socket_rate_limit import socket_rate_limit
from app.services.ticket_email import resolve_org_smtp, send_smtp
from app.services.widget_reply import PANEL_SESSION_KEY, WIDGET_NAMESPACE

logger = get_logger(__name__)

SUBJECT = 'Your verification code'



def _message(cfg: dict, to: str, code: str) -> EmailMessage:
    message = EmailMessage()
    message['From'] = cfg['from_email']
    # One plain recipient, built as an address (valid_email already refused commas)
    message['To'] = Address(addr_spec=to)
    message['Subject'] = SUBJECT
    message.set_content(
        f"Your verification code is {code}.\n\n"
        f"Enter it in the chat to continue. It expires in {email_check.CODE_TTL_SECONDS // 60} minutes.\n\n"
        "If you didn't ask for this code, you can ignore this email."
    )
    return message


def _send_code(org_id: str, to: str, code: str) -> None:
    """Blocking: the SMTP send, from the org's own inbox when it has one, to that
    one address only. A refused recipient reads as sent: the answer must not say
    which mailboxes exist."""
    with SessionLocal() as db:
        cfg = resolve_org_smtp(db, org_id)
    try:
        send_smtp(cfg, _message(cfg, to, code), to_addrs=[to])
    except smtplib.SMTPRecipientsRefused:
        logger.info("Email check code refused by the recipient's server")


def _link_history(session: dict, email: str) -> None:
    with SessionLocal() as db:
        visitor_history.link_proven_email(db, session, email)


def accept_store_sign_in(session: dict, token_data: dict) -> bool:
    """Blocking. A customer signed in to the Shopify store (their token came from
    the App Proxy) has the email the store verified: proved for this conversation
    like a code, so My orders and their other browsers' chats need no code. On a
    plan with known customers only. Whether it was accepted."""
    email = shopify_app_proxy.store_verified_email(token_data)
    if not email or not widget_plan.session_allows(session, widget_plan.KNOWN_CUSTOMERS_FEATURE):
        return False
    if not email_check.prove(session.get('session_id'), session.get('customer_id'), email):
        return False
    try:
        _link_history(session, email)
    except Exception as e:
        # The proof stands; only the other browsers won't see this one's chats
        logger.error(f"Store-verified email not linked to the visitor's conversations: {e}")
    return True


async def _error(sid: str, result: email_check.CheckResult) -> None:
    await sio.emit('email_check_error', {
        'reason': result.reason, 'retry_in': result.retry_in, 'attempts_left': result.attempts_left,
    }, to=sid, namespace=WIDGET_NAMESPACE)


def _text(data, field: str) -> str:
    value = data.get(field) if isinstance(data, dict) else None
    return value if isinstance(value, str) else ''


@sio.on('email_check_start', namespace=WIDGET_NAMESPACE)
@socket_rate_limit(namespace=WIDGET_NAMESPACE)
async def handle_email_check_start(sid, data):
    session = await authenticated_session(sid)
    if session is None:
        return
    email = email_check.normalise(_text(data, 'email'))
    # The widget panel's history screen asks for the check itself, to find the
    # visitor's chats from their other browsers (its own, smaller send budget);
    # otherwise only the agent offers it (confirm_email).
    purpose = email_check.HISTORY_PURPOSE if _text(data, 'purpose') == email_check.HISTORY_PURPOSE else 'chat'
    if purpose == email_check.HISTORY_PURPOSE:
        if not session.get(PANEL_SESSION_KEY) \
                or not widget_plan.session_allows(session, widget_plan.KNOWN_CUSTOMERS_FEATURE):
            await _error(sid, email_check.CheckResult(False, 'not_offered'))
            return
        await asyncio.to_thread(email_check.offer, str(session['session_id']))
    result, code = await asyncio.to_thread(email_check.start, session['session_id'], session['org_id'], email, purpose)
    if not result.ok or code is None:
        await _error(sid, result)
        return
    try:
        await asyncio.to_thread(_send_code, session['org_id'], email, code)
    except Exception as e:
        logger.error(f"Email check code could not be sent: {e}")
        await _error(sid, email_check.CheckResult(False, 'send_failed'))
        return
    await sio.emit('email_check_sent', {'email_masked': email_check.mask(email)}, to=sid, namespace=WIDGET_NAMESPACE)


@sio.on('email_check_verify', namespace=WIDGET_NAMESPACE)
@socket_rate_limit(namespace=WIDGET_NAMESPACE)
async def handle_email_check_verify(sid, data):
    session = await authenticated_session(sid)
    if session is None:
        return
    result, email = await asyncio.to_thread(
        email_check.verify, session['session_id'], session.get('customer_id'), _text(data, 'code'))
    if not result.ok or email is None:
        await _error(sid, result)
        return
    try:
        await asyncio.to_thread(_link_history, session, email)
    except Exception as e:
        # The proof stands; only the other browsers won't see this one's chats
        logger.error(f"Proven email not linked to the visitor's conversations: {e}")
    await sio.emit('email_check_verified', {'email_masked': email_check.mask(email)}, to=sid, namespace=WIDGET_NAMESPACE)
