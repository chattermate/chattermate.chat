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

Hides passwords, API keys and card numbers a visitor pastes into chat before
the message is stored or reaches the model. The widget's composer warns about
the same patterns first (frontend/src/utils/secretGuard.ts); this is the
backstop for anything that gets past it.
"""

import re

HIDDEN = "[hidden]"

# Keys whose shape is distinctive enough to hide on sight.
_KEY_PATTERNS = [
    re.compile(r"\bsk-(?:proj-|ant-)?[A-Za-z0-9_\-]{20,}"),  # OpenAI / Anthropic
    re.compile(r"\bcmat_[A-Za-z0-9_\-]{16,}"),                # ChatterMate tokens
    re.compile(r"\bAKIA[0-9A-Z]{16}\b"),                      # AWS access keys
    re.compile(r"\bgh[pousr]_[A-Za-z0-9]{30,}"),               # GitHub tokens
    re.compile(r"\bxox[abposr]-[A-Za-z0-9\-]{10,}"),          # Slack tokens
]
# "password: hunter2", "pwd=…", "passcode is …": hide what follows the label.
_LABELLED = re.compile(r"(?i)\b(password|passwd|pwd|passcode|api[ _-]?key|secret)(\s*(?:is|:|=)\s*)(\S+)")
# 13–19 digits, optionally grouped by spaces or dashes; only hidden when Luhn-valid.
_CARD = re.compile(r"\b(?:\d[ -]?){12,18}\d\b")


def _luhn_valid(digits: str) -> bool:
    total = 0
    for index, char in enumerate(reversed(digits)):
        value = int(char)
        if index % 2 == 1:
            value *= 2
            if value > 9:
                value -= 9
        total += value
    return total % 10 == 0


def _hide_card(match: re.Match) -> str:
    digits = re.sub(r"\D", "", match.group(0))
    return HIDDEN if 13 <= len(digits) <= 19 and _luhn_valid(digits) else match.group(0)


def redact_secrets(text: str) -> tuple[str, bool]:
    """The text with secrets hidden, and whether anything was hidden."""
    if not text:
        return text, False
    redacted = text
    for pattern in _KEY_PATTERNS:
        redacted = pattern.sub(HIDDEN, redacted)
    redacted = _LABELLED.sub(lambda m: f"{m.group(1)}{m.group(2)}{HIDDEN}", redacted)
    redacted = _CARD.sub(_hide_card, redacted)
    return redacted, redacted != text
