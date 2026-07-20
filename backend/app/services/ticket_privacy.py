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

Cross-customer privacy guards for AI ticketing.

The investigator reasons over material that belongs to people other than the
person it is writing to: similar past tickets from the same org, and rows from
a connected database that has no row-level scoping. The same LLM call that
reads all of that also writes `customer_summary`, which is delivered to the
customer — at autonomy L3 with no human in the loop. Prompt wording alone can't
be the control on that, so these are deterministic, applied at the boundary.
"""

import re
from typing import Iterable, Optional, Set

from app.core.logger import get_logger
from app.utils.guardrails import GuardrailAction, PIIDetector

logger = get_logger(__name__)

# Identifiers that must never appear in a message we send out, no matter whose
# they are — a support summary has no legitimate reason to restate them.
ALWAYS_REDACT = ("ssn", "credit_card", "date_of_birth")

# Identifiers that are fine to echo back to their *owner* but not to anyone
# else. Kept when they match the recipient, redacted otherwise.
OWNER_ONLY = ("email", "phone")

THIRD_PARTY_MARKER = "[redacted]"


def _digits(value: str) -> str:
    return re.sub(r"\D", "", value or "")


def _owner_keys(identifiers: Iterable[Optional[str]]) -> Set[str]:
    """Normalized forms of the recipient's own identifiers, so a match is not
    defeated by case or phone formatting."""
    keys: Set[str] = set()
    for raw in identifiers:
        value = (raw or "").strip()
        if not value:
            continue
        keys.add(value.lower())
        digits = _digits(value)
        # 7 digits filters out short numerics (order counts, amounts) that
        # would otherwise whitelist themselves as if they were the phone.
        if len(digits) >= 7:
            keys.add(digits)
    return keys


def scrub_outbound(text: Optional[str], owner_identifiers: Iterable[Optional[str]] = ()) -> Optional[str]:
    """Strip third-party identifiers from a message bound for the customer.

    The recipient's own email/phone survive — telling someone their own address
    is not a leak, and blanking it makes legitimate summaries read as broken.
    Everything else that looks like an identifier is redacted, because in a
    ticket summary it can only have come from another customer's record.
    """
    if not text:
        return text

    owners = _owner_keys(owner_identifiers)
    scrubbed = text

    for pii_type in ALWAYS_REDACT:
        pattern = PIIDetector.PATTERNS.get(pii_type)
        if pattern:
            scrubbed = re.sub(pattern, THIRD_PARTY_MARKER, scrubbed)

    for pii_type in OWNER_ONLY:
        pattern = PIIDetector.PATTERNS.get(pii_type)
        if not pattern:
            continue

        def _replace(match: re.Match) -> str:
            value = match.group()
            if value.lower() in owners or (_digits(value) and _digits(value) in owners):
                return value
            return THIRD_PARTY_MARKER

        scrubbed = re.sub(pattern, _replace, scrubbed)

    if scrubbed != text:
        logger.warning(
            "Redacted third-party identifiers from an outbound ticket message"
        )
    return scrubbed


def redact_reference_text(text: Optional[str]) -> Optional[str]:
    """Strip identifiers from another customer's material before it becomes
    model context.

    Similar past tickets are included to convey *what broke and how it was
    fixed*; the names, addresses and numbers in their titles carry none of that
    signal and are the most likely thing to be echoed into a summary written
    for a different person.
    """
    if not text:
        return text
    result = PIIDetector.detect(text, action=GuardrailAction.REDACT)
    return result.redacted_text or text
