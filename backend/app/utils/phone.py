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

import re

# E.164: '+', a non-zero country code digit, then 7-14 more digits. Everything
# that identifies a person by phone stores exactly this shape, because
# customers.phone is a unique identity key — two spellings of one number would
# be two "people". re.ASCII because \d otherwise matches every Unicode decimal
# digit (Arabic-Indic and friends), which would let an undialable, unmatchable
# string become an identity key. Deliberately not libphonenumber:
# country-specific length rules aren't worth a dependency when Meta/the SMS
# provider is the real validator and rejects undialable numbers anyway.
_E164 = re.compile(r"^\+[1-9]\d{7,14}$", re.ASCII)

# What people paste: spaces, dashes, dots, parentheses.
_DECORATION = re.compile(r"[\s\-().]")


def normalize_phone(value: str | None) -> str | None:
    """The canonical E.164 form of a human-supplied phone number, or None.

    Strict: the '+' country prefix is required (decoration — spaces, dashes,
    dots, parentheses — is tolerated). Bare digits are rejected here because a
    person typing "1234567890" means a national number, and prepending '+'
    would silently reassign it to whatever country owns that prefix. An
    identity key corrupted by a guess is worse than a rejected form field.

    Non-strings return None rather than raising: values arrive from AI
    extraction and form payloads, which can hand over lists or numbers.
    """
    if not value or not isinstance(value, str):
        return None
    candidate = _DECORATION.sub("", value.strip())
    return candidate if _E164.fullmatch(candidate) else None


def normalize_msisdn(value: str | None) -> str | None:
    """The canonical E.164 form of a platform-supplied subscriber number.

    Lenient about the prefix in the two shapes platforms actually send:
    bare digits (a WhatsApp wa_id, a Vonage msisdn — E.164 without the '+')
    and the ITU '00' international form some SMS gateways use. Both are
    trustworthy in a way human-typed digits are not. Delegates to
    normalize_phone so there is exactly one definition of the canonical
    shape — the two paths must meet in one column.
    """
    if not value or not isinstance(value, str):
        return None
    candidate = _DECORATION.sub("", value.strip())
    if candidate.startswith("00") and candidate[2:].isascii() and candidate[2:].isdigit():
        candidate = f"+{candidate[2:]}"
    elif not candidate.startswith("+") and candidate.isascii() and candidate.isdigit():
        candidate = f"+{candidate}"
    return normalize_phone(candidate)


def to_wa_id(phone: str) -> str:
    """Meta addresses WhatsApp users by E.164 without the '+'."""
    return phone.lstrip("+")


# Countries where WhatsApp's id for a mobile number has an extra digit the
# number as written lacks: (country code, digits after it as written, the extra
# digit). Mexico's wa_id has a 1 after 52, Argentina's a 9 after 54. Brazil
# goes the other way (whatsapp_equivalents): older accounts drop the 9 that
# starts a mobile number (55 + area code + 9 + 8 digits).
_MX = ("52", 10, "1")
_AR = ("54", 10, "9")


def whatsapp_equivalents(phone: str | None) -> tuple[str, ...]:
    """Every E.164 form that reaches the same WhatsApp user as this number,
    itself first. A STOP or a reply arrives under the wa_id, while an order
    or a form gives the number as people write it; matching on one form
    misses the other."""
    value = normalize_msisdn(phone)
    if value is None:
        return ()
    found = [value]
    digits = value[1:]
    for code, national, extra in (_MX, _AR):
        rest = digits[len(code):]
        if not digits.startswith(code):
            continue
        if len(rest) == national:
            found.append(f"+{code}{extra}{rest}")
        elif len(rest) == national + 1 and rest.startswith(extra):
            found.append(f"+{code}{rest[1:]}")
    if digits.startswith("55"):
        rest = digits[2:]
        area, local = rest[:2], rest[2:]
        if len(local) == 9 and local.startswith("9"):
            found.append(f"+55{area}{local[1:]}")
        elif len(local) == 8 and local[0] in "6789":
            found.append(f"+55{area}9{local}")
    return tuple(found)
