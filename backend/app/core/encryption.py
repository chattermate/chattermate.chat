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

Encryption of user content at rest.

Conversation content (chat messages, AI-written session summaries, the agno agent
memory blob) is stored as ciphertext so that a database dump, a stolen backup or a
stray `psql` session does not expose it. The application decrypts transparently.

Stored format is ``enc:<key_id>:<fernet-token>``. The key id is what makes key
rotation possible without a schema change: a future key is added to KEYS as ``v2``,
CURRENT_KEY_ID moves to it, and ``v1`` stays in the registry so old rows keep
reading while a backfill re-encrypts them.

This module deliberately depends on nothing but the standard library, cryptography,
SQLAlchemy and app.core.{logger,config} (both light), so the backfill script can load
it by file path on the host without importing the `app` package — whose __init__
pulls in the FastAPI app and the whole ML stack.
"""

import base64
import json
import os
from functools import lru_cache
from typing import Any, Dict, Optional

from cryptography.fernet import Fernet
from sqlalchemy import JSON, Text
from sqlalchemy.types import TypeDecorator

from app.core.config import ENCRYPTION_KEY_HINT, is_throwaway_environment
from app.core.logger import get_logger

logger = get_logger(__name__)

# Wire format. Nothing outside this module should restate these.
ENCRYPTED_PREFIX = "enc"
SEPARATOR = ":"
CURRENT_KEY_ID = "v1"
# Key under which an encrypted JSON blob is stored, so an encrypted dict is
# distinguishable from a plaintext one written before this change.
JSON_MARKER = "__enc__"

ENCRYPTION_KEY_ENV = "ENCRYPTION_KEY"


# Indented for the multi-line error messages below; the command itself is defined
# once in app.core.config so this and the startup audit cannot drift apart.
GENERATE_KEY_HINT = f"  {ENCRYPTION_KEY_HINT}"


def load_key() -> bytes:
    """Return the raw Fernet key from ``ENCRYPTION_KEY``.

    The env var holds the Fernet key base64-encoded a second time, which is the
    format already in use for API-key encryption — decoding must stay identical or
    every existing encrypted API key becomes unreadable.

    Outside development and tests a missing or malformed key is fatal: chat
    messages, session summaries and agent memory are all encrypted with it.

    Usability of the key is checked here rather than left to ``Fernet()`` in
    get_keys(), so that the .env.example placeholder and the common near-miss of
    pasting a raw ``Fernet.generate_key()`` (base64-encoded once, not twice) both
    surface the message below instead of a bare "must be 32 url-safe base64-encoded
    bytes" from deep inside the library.
    """
    env_key = os.getenv(ENCRYPTION_KEY_ENV)
    if env_key:
        try:
            key = base64.b64decode(env_key)
            Fernet(key)
            return key
        except Exception as e:
            logger.error(f"Invalid encryption key format: {str(e)}")
            if not is_throwaway_environment():
                raise RuntimeError(
                    f"{ENCRYPTION_KEY_ENV} is set but is not a usable Fernet key. "
                    "Encrypted data cannot be read; refusing to start with a "
                    f"different key. Generate one with:\n{GENERATE_KEY_HINT}"
                ) from e

    if not is_throwaway_environment():
        raise RuntimeError(
            f"{ENCRYPTION_KEY_ENV} is not set. It encrypts chat messages, session "
            "summaries and agent memory at rest, so starting without it would make "
            f"existing conversations unreadable. Generate one with:\n{GENERATE_KEY_HINT}"
        )

    key = Fernet.generate_key()
    logger.info(
        f"Generated a throwaway encryption key. Set "
        f"{ENCRYPTION_KEY_ENV}={base64.b64encode(key).decode()} to keep data readable"
    )
    return key


@lru_cache(maxsize=1)
def get_keys() -> Dict[str, Fernet]:
    """Every key we can still decrypt with, by key id. Add an id here to rotate.

    Loaded on first use rather than at import: a module import must not depend on
    environment setup, and the explicit check belongs in verify_encryption_key()
    at startup where the failure is legible.
    """
    return {CURRENT_KEY_ID: Fernet(load_key())}


def verify_encryption_key() -> None:
    """Fail fast at startup if the key is missing or unusable.

    Without this the first customer message would be the thing that discovers a
    misconfigured deployment — after the app has already accepted traffic.
    """
    get_keys()  # raises with an actionable message if the key is missing or invalid
    if decrypt_value(encrypt_value("verify")) != "verify":
        raise RuntimeError(f"{ENCRYPTION_KEY_ENV} does not round-trip; refusing to start")


def is_encrypted(value: Any) -> bool:
    """True when the value is already in the stored ciphertext format."""
    return isinstance(value, str) and value.startswith(ENCRYPTED_PREFIX + SEPARATOR)


def encrypt_value(value: Optional[str]) -> Optional[str]:
    """Encrypt a string for storage. Idempotent: already-encrypted input is returned
    untouched, so it is safe to call on a value of unknown provenance."""
    if value is None:
        return None
    if is_encrypted(value):
        return value
    # Outside the try: a missing key raises a RuntimeError explaining itself, and
    # wrapping that in "failed to encrypt" would hide the actual problem.
    fernet = get_keys()[CURRENT_KEY_ID]
    try:
        token = fernet.encrypt(str(value).encode()).decode()
    except Exception as e:
        logger.error(f"Encryption error: {str(e)}")
        raise ValueError("Failed to encrypt value")
    return SEPARATOR.join((ENCRYPTED_PREFIX, CURRENT_KEY_ID, token))


def decrypt_value(value: Optional[str]) -> Optional[str]:
    """Decrypt a stored string.

    Values without the ``enc:`` prefix are returned unchanged — that is a row the
    backfill has not reached yet, and reads must keep working throughout the
    migration. A key we no longer hold, or a corrupt token, logs and returns None
    rather than raising: one damaged row must not fail the whole request.
    """
    if not is_encrypted(value):
        return value

    parts = value.split(SEPARATOR, 2)
    if len(parts) != 3:
        logger.error("Malformed ciphertext: missing key id or token")
        return None
    _, key_id, token = parts

    fernet = get_keys().get(key_id)
    if fernet is None:
        logger.error(f"No encryption key registered for key id '{key_id}'")
        return None

    try:
        return fernet.decrypt(token.encode()).decode()
    except Exception as e:
        logger.error(f"Decryption error: {str(e)}")
        return None


def encrypt_json(value: Optional[Any]) -> Optional[Dict[str, str]]:
    """Encrypt a JSON-serialisable object into a single-key marker dict."""
    if value is None:
        return None
    if isinstance(value, dict) and JSON_MARKER in value:
        return value
    return {JSON_MARKER: encrypt_value(json.dumps(value))}


def decrypt_json(value: Optional[Any]) -> Optional[Any]:
    """Inverse of encrypt_json. A plaintext object written before this change is
    returned as-is; an undecryptable blob degrades to None."""
    if not isinstance(value, dict) or JSON_MARKER not in value:
        return value

    plaintext = decrypt_value(value[JSON_MARKER])
    if plaintext is None:
        return None
    try:
        return json.loads(plaintext)
    except ValueError as e:
        logger.error(f"Decrypted blob is not valid JSON: {str(e)}")
        return None


class EncryptedText(TypeDecorator):
    """Text column whose value is encrypted at rest and decrypted on read.

    Underlying storage stays unbounded text, so applying this to an existing
    String/Text column needs no schema migration.
    """

    impl = Text
    cache_ok = True

    def process_bind_param(self, value, dialect):
        return encrypt_value(value)

    def process_result_value(self, value, dialect):
        return decrypt_value(value)


class EncryptedJSON(TypeDecorator):
    """JSON column whose value is stored as an ``encrypt_json`` marker object.

    Storage stays JSON, so applying this to an existing JSON column needs no
    schema change, and a plaintext object written before the change reads back
    unchanged until the backfill reaches it. The whole value is one ciphertext:
    nothing inside it can be queried in SQL, which is the point for secrets.
    """

    impl = JSON
    cache_ok = True

    def process_bind_param(self, value, dialect):
        return encrypt_json(value)

    def process_result_value(self, value, dialect):
        return decrypt_json(value)
