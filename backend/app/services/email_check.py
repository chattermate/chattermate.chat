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

The widget's email check: the visitor proves an email is theirs with a 6-digit
code sent to it, and the conversation may then look up that email's orders
without the visitor typing it (shopify_order_access.py).

- Only a conversation whose agent asked for the check (confirm_email) may send a
  code, so the widget can't be used to mail arbitrary addresses.
- Only a plain address (the strict order-lookup form) gets a code, and it goes
  to that one recipient.
- The code is kept only as an HMAC, bound to the conversation, for ten minutes.
  Five wrong tries per conversation, carried across resends, and ten failures a
  day per email address, end it.
- Sending is limited per conversation (every 30 seconds, a few an hour), per email
  address and per organization. All counters live in Redis; when Redis fails the
  check refuses rather than counting in one process's memory.
- The visitor gets the same answer whether or not the email has orders.
- A proven email lasts an hour for this conversation and this customer only, and
  is forgotten when the conversation ends.

Without Redis there is nowhere safe to keep a code, so the check is not offered.
Every Redis call here is blocking: callers run it off the event loop.
"""

import hashlib
import hmac
import json
import secrets
import time
from dataclasses import dataclass
from typing import Optional, Tuple

from app.core.config import settings
from app.core.logger import get_logger
from app.core.redis import get_redis
from app.tools.shopify_order_access import normalise_email, order_lookup_problem

logger = get_logger(__name__)

CODE_TTL_SECONDS = 600
MAX_ATTEMPTS = 5
RESEND_COOLDOWN_SECONDS = 30
SENDS_PER_HOUR_PER_CONVERSATION = 5
SENDS_PER_HOUR_PER_EMAIL = 10
SENDS_PER_HOUR_PER_ORG = 200
# The history screen's own checks (finding chats from other browsers) have a
# smaller budget of their own: however they are spent, order checks still get theirs
SENDS_PER_HOUR_PER_ORG_HISTORY = 50
HISTORY_PURPOSE = 'history'
FAILURES_PER_DAY_PER_EMAIL = 10
OFFER_TTL_SECONDS = 1800
VERIFIED_TTL_SECONDS = 3600


@dataclass(frozen=True)
class CheckResult:
    ok: bool
    # sent | verified | not_offered | invalid_email | cooldown | too_many | expired
    # | wrong_code | locked | unavailable
    reason: str
    retry_in: int = 0
    attempts_left: int = 0


UNAVAILABLE = CheckResult(False, 'unavailable')


def _client():
    """The Redis client when it answers, else None."""
    client = get_redis()
    if client is None:
        return None
    try:
        client.ping()
        return client
    except Exception as e:
        logger.warning(f"Email check unavailable, Redis did not answer: {e}")
        return None


def available() -> bool:
    """The check needs Redis to keep codes."""
    return _client() is not None


def normalise(email: str) -> str:
    return normalise_email(email)


def valid_email(email: str) -> bool:
    """A plain address only: the strict form order lookups accept (no commas,
    quotes or spaces that would reach more than one recipient)."""
    return len(email) <= 254 and order_lookup_problem(email, "1001") is None


def mask(email: str) -> str:
    """"j•••@acme.com"."""
    local, _, domain = email.partition('@')
    return f"{local[:1]}•••@{domain}"


def _bucket(value: str) -> str:
    return hashlib.sha256(value.encode()).hexdigest()[:32]


def _code_key(session_id: str) -> str:
    return f"email_check:code:{session_id}"


def _tries_key(session_id: str) -> str:
    return f"email_check:tries:{session_id}"


def _offer_key(session_id: str) -> str:
    return f"email_check:offered:{session_id}"


def _verified_key(session_id: str) -> str:
    return f"email_check:verified:{session_id}"


def email_key(email: str, org_id) -> str:
    """A keyed hash of an email proved in one organization's widget, stored on the
    conversation it was proved in (session_to_agents.verified_email_key):
    matched, never readable, and never equal across organizations."""
    key = hmac.new(settings.SECRET_KEY.encode(), b"verified-email", hashlib.sha256).digest()
    return hmac.new(key, f"{org_id}:{normalise(email)}".encode(), hashlib.sha256).hexdigest()


def _failures_key(org_id, email: str) -> str:
    """Wrong codes for an email, counted per organization: a stranger failing in
    one widget never locks the email in another."""
    return f"email_check:fail:{org_id}:{_bucket(email)}"


def _digest(session_id: str, code: str) -> str:
    key = hmac.new(settings.SECRET_KEY.encode(), b"email-check", hashlib.sha256).digest()
    return hmac.new(key, f"{session_id}:{code}".encode(), hashlib.sha256).hexdigest()


def _count(client, key: str, limit: int, window: int) -> bool:
    """One more in a fixed window; True while within `limit`. SET NX EX first,
    so the counter always carries its expiry."""
    client.set(key, 0, nx=True, ex=window)
    return int(client.incr(key)) <= limit


def _org_budget(org_id, purpose: str) -> Tuple[str, int]:
    if purpose == HISTORY_PURPOSE:
        return f"email_check:send:oh:{org_id}", SENDS_PER_HOUR_PER_ORG_HISTORY
    return f"email_check:send:o:{org_id}", SENDS_PER_HOUR_PER_ORG


def new_code() -> str:
    return f"{secrets.randbelow(10 ** 6):06d}"


def offer(session_id: str) -> bool:
    """The agent asked this conversation to confirm an email (confirm_email)."""
    client = _client()
    if client is None:
        return False
    try:
        client.set(_offer_key(session_id), 1, ex=OFFER_TTL_SECONDS)
        return True
    except Exception as e:
        logger.warning(f"Email check offer not kept: {e}")
        return False


def start(session_id: str, org_id: str, email: str, purpose: str = 'chat') -> Tuple[CheckResult, Optional[str]]:
    """Start (or restart) a check: (result, the code to email, or None when none
    is to be sent). The caller sends it; nothing here talks to SMTP."""
    client = _client()
    if client is None:
        return UNAVAILABLE, None
    email = normalise(email)
    try:
        if not client.get(_offer_key(session_id)):
            return CheckResult(False, 'not_offered'), None
        if not valid_email(email):
            return CheckResult(False, 'invalid_email'), None
        existing = client.get(_code_key(session_id))
        if existing:
            wait = int(json.loads(existing).get('sent_at', 0) + RESEND_COOLDOWN_SECONDS - time.time())
            if wait > 0:
                return CheckResult(False, 'cooldown', retry_in=wait), None
        tries = int(client.get(_tries_key(session_id)) or 0)
        failures = int(client.get(_failures_key(org_id, email)) or 0)
        if tries >= MAX_ATTEMPTS or failures >= FAILURES_PER_DAY_PER_EMAIL:
            return CheckResult(False, 'locked'), None
        if not (_count(client, f"email_check:send:s:{session_id}", SENDS_PER_HOUR_PER_CONVERSATION, 3600)
                and _count(client, f"email_check:send:e:{_bucket(email)}", SENDS_PER_HOUR_PER_EMAIL, 3600)
                and _count(client, *_org_budget(org_id, purpose), 3600)):
            return CheckResult(False, 'too_many'), None
        code = new_code()
        record = {'email': email, 'org_id': str(org_id), 'digest': _digest(session_id, code), 'sent_at': time.time()}
        client.set(_code_key(session_id), json.dumps(record), ex=CODE_TTL_SECONDS)
        # Wrong tries carry across resends: a new code is not a new budget.
        client.set(_tries_key(session_id), tries, ex=CODE_TTL_SECONDS)
        return CheckResult(True, 'sent'), code
    except Exception as e:
        logger.error(f"Email check could not start: {e}")
        return UNAVAILABLE, None


def verify(session_id: str, customer_id: str, code: str) -> Tuple[CheckResult, Optional[str]]:
    """Check a code: (result, the proven email on success). Each try is counted
    first (INCR, atomic across workers), then compared."""
    client = _client()
    if client is None:
        return UNAVAILABLE, None
    try:
        raw = client.get(_code_key(session_id))
        if not raw:
            return CheckResult(False, 'expired'), None
        record = json.loads(raw)
        tries = int(client.incr(_tries_key(session_id)))
        if tries > MAX_ATTEMPTS:
            return CheckResult(False, 'locked'), None
        candidate = (code or '').strip()
        if not (candidate.isdigit() and len(candidate) == 6
                and hmac.compare_digest(record['digest'], _digest(session_id, candidate))):
            _count(client, _failures_key(record.get('org_id', ''), record['email']), FAILURES_PER_DAY_PER_EMAIL, 86400)
            left = MAX_ATTEMPTS - tries
            return CheckResult(False, 'wrong_code' if left else 'locked', attempts_left=left), None
        for key in (_code_key(session_id), _tries_key(session_id), _offer_key(session_id)):
            client.delete(key)
        _keep_proof(client, session_id, customer_id, record['email'])
        return CheckResult(True, 'verified'), record['email']
    except Exception as e:
        logger.error(f"Email check could not verify: {e}")
        return UNAVAILABLE, None


def _keep_proof(client, session_id: str, customer_id, email: str) -> None:
    proof = json.dumps({'email': email, 'customer_id': str(customer_id)})
    client.set(_verified_key(session_id), proof, ex=VERIFIED_TTL_SECONDS)


def prove(session_id: str, customer_id, email: str) -> bool:
    """Record `email` as proved for this conversation and customer by something
    other than a code (a store that verified it: shopify_app_proxy). Whether it
    was kept: without Redis, order lookups need the typed email as before."""
    client = _client()
    if client is None or not session_id or not valid_email(email or ''):
        return False
    try:
        _keep_proof(client, str(session_id), customer_id, normalise(email))
        return True
    except Exception as e:
        logger.error(f"Proven email not kept: {e}")
        return False


def verified_email(session_id: Optional[str], customer_id: Optional[str] = None) -> Optional[str]:
    """The email this conversation proved in the last hour, for this customer, or
    None (also when Redis is down: order lookups then need the typed email)."""
    if not session_id:
        return None
    client = get_redis()
    if client is None:
        return None
    try:
        raw = client.get(_verified_key(str(session_id)))
        proof = json.loads(raw) if raw else None
    except Exception as e:
        logger.warning(f"Proven email not read: {e}")
        return None
    if not isinstance(proof, dict) or not proof.get('email'):
        return None
    if customer_id is not None and proof.get('customer_id') != str(customer_id):
        return None
    return proof['email']


def forget(session_id: Optional[str]) -> None:
    """The conversation ended: its proof and any open check go with it."""
    client = get_redis()
    if client is None or not session_id:
        return
    try:
        for key in (_verified_key(session_id), _code_key(session_id), _tries_key(session_id), _offer_key(session_id)):
            client.delete(key)
    except Exception as e:
        logger.warning(f"Email check not cleared: {e}")
