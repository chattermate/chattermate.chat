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

- The code is kept only as an HMAC, bound to the conversation, in Redis for ten
  minutes; five wrong tries end it.
- Sending is limited: once every 30 seconds per conversation, and a few times an
  hour per conversation and per email address.
- The visitor gets the same answer whether or not the email has orders or an
  account: the code is simply sent.
- A proven email lasts for the day, for this conversation only.

Without Redis there is nowhere safe to keep a code, so the check is not offered.
"""

import hashlib
import hmac
import json
import re
import secrets
import time
from dataclasses import dataclass
from typing import Optional

from app.core.config import settings
from app.core.redis import get_redis
from app.services.public_rate_limit import allow_request

CODE_TTL_SECONDS = 600
MAX_ATTEMPTS = 5
RESEND_COOLDOWN_SECONDS = 30
SENDS_PER_HOUR = 5
VERIFIED_TTL_SECONDS = 24 * 3600

_EMAIL = re.compile(r"^[^@\s]{1,64}@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)+$")
_CODE = re.compile(r"^[0-9]{6}$")


@dataclass(frozen=True)
class CheckResult:
    ok: bool
    # sent | verified | invalid_email | cooldown | too_many | expired | wrong_code | locked | unavailable
    reason: str
    retry_in: int = 0
    attempts_left: int = 0


def available() -> bool:
    """The check needs Redis to keep codes."""
    return get_redis() is not None


def normalise(email: str) -> str:
    return (email or '').strip().lower()


def valid_email(email: str) -> bool:
    return len(email) <= 254 and bool(_EMAIL.match(email))


def mask(email: str) -> str:
    """"j•••@acme.com"."""
    local, _, domain = email.partition('@')
    return f"{local[:1]}•••@{domain}"


def _key(session_id: str) -> str:
    return f"email_check:{session_id}"


def _verified_key(session_id: str) -> str:
    return f"email_check:verified:{session_id}"


def _digest(session_id: str, code: str) -> str:
    return hmac.new(settings.SECRET_KEY.encode(), f"{session_id}:{code}".encode(), hashlib.sha256).hexdigest()


def _email_bucket(email: str) -> str:
    return hashlib.sha256(email.encode()).hexdigest()[:32]


def new_code() -> str:
    return f"{secrets.randbelow(10 ** 6):06d}"


def start(session_id: str, email: str) -> tuple[CheckResult, Optional[str]]:
    """Start (or restart) a check: (result, the code to email, or None when none
    is to be sent). The caller sends it; nothing here talks to SMTP."""
    client = get_redis()
    if client is None:
        return CheckResult(False, 'unavailable'), None
    email = normalise(email)
    if not valid_email(email):
        return CheckResult(False, 'invalid_email'), None
    existing = client.get(_key(session_id))
    if existing:
        sent_at = json.loads(existing).get('sent_at', 0)
        wait = int(sent_at + RESEND_COOLDOWN_SECONDS - time.time())
        if wait > 0:
            return CheckResult(False, 'cooldown', retry_in=wait), None
    if not (allow_request(f"email_check:session:{session_id}", SENDS_PER_HOUR, 3600)
            and allow_request(f"email_check:email:{_email_bucket(email)}", SENDS_PER_HOUR, 3600)):
        return CheckResult(False, 'too_many'), None
    code = new_code()
    record = {'email': email, 'digest': _digest(session_id, code), 'attempts': 0, 'sent_at': time.time()}
    client.set(_key(session_id), json.dumps(record), ex=CODE_TTL_SECONDS)
    return CheckResult(True, 'sent'), code


def verify(session_id: str, code: str) -> tuple[CheckResult, Optional[str]]:
    """Check a code: (result, the proven email on success)."""
    client = get_redis()
    if client is None:
        return CheckResult(False, 'unavailable'), None
    raw = client.get(_key(session_id))
    if not raw:
        return CheckResult(False, 'expired'), None
    record = json.loads(raw)
    if record['attempts'] >= MAX_ATTEMPTS:
        return CheckResult(False, 'locked'), None
    if not _CODE.match((code or '').strip()) or not hmac.compare_digest(record['digest'], _digest(session_id, code.strip())):
        record['attempts'] += 1
        ttl = client.ttl(_key(session_id))
        client.set(_key(session_id), json.dumps(record), ex=ttl if ttl and ttl > 0 else CODE_TTL_SECONDS)
        left = MAX_ATTEMPTS - record['attempts']
        return CheckResult(False, 'wrong_code' if left else 'locked', attempts_left=left), None
    client.delete(_key(session_id))
    client.set(_verified_key(session_id), record['email'], ex=VERIFIED_TTL_SECONDS)
    return CheckResult(True, 'verified'), record['email']


def verified_email(session_id: Optional[str]) -> Optional[str]:
    """The email this conversation proved today, or None."""
    client = get_redis()
    if client is None or not session_id:
        return None
    value = client.get(_verified_key(str(session_id)))
    return value if isinstance(value, str) and value else None
