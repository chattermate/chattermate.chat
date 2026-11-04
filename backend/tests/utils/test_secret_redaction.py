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

import pytest

from app.utils.secret_redaction import HIDDEN, redact_secrets


@pytest.mark.parametrize("text", [
    "my key is sk-proj-abcdefghijklmnopqrstuvwxyz123456",
    "token cmat_abcdefghijklmnop1234",
    "AKIAABCDEFGHIJKLMNOP",
    "ghp_abcdefghijklmnopqrstuvwxyz0123456789",
    "card 4242 4242 4242 4242 exp 12/30",
    "4111-1111-1111-1111",
])
def test_hides_keys_and_valid_cards(text):
    redacted, changed = redact_secrets(text)
    assert changed and HIDDEN in redacted


@pytest.mark.parametrize("text, expected", [
    ("password: hunter2 thanks", f"password: {HIDDEN} thanks"),
    ("My PASSWORD is Tr0ub4dor&3", f"My PASSWORD is {HIDDEN}"),
    ("api key=abc123", f"api key={HIDDEN}"),
])
def test_hides_what_follows_a_label(text, expected):
    assert redact_secrets(text) == (expected, True)


@pytest.mark.parametrize("text", [
    "Order 1234567890123 arrived late",   # not Luhn-valid
    "Call me on +44 7700 900123",
    "I forgot my password, can you help?",
    "",
])
def test_leaves_ordinary_text(text):
    assert redact_secrets(text) == (text, False)
