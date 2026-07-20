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

Cross-customer leakage guards: the investigator reads other customers' tickets
and unscoped database rows, then writes a summary delivered to one customer.
"""

from app.services.ticket_privacy import (
    THIRD_PARTY_MARKER,
    redact_reference_text,
    scrub_outbound,
)

OWNER_EMAIL = "arun@chattermate.chat"
OWNER_PHONE = "+441234567890"


class TestScrubOutbound:
    def test_other_customers_email_is_redacted(self):
        text = "We saw the same fault on the account for bob@othercorp.com."
        out = scrub_outbound(text, (OWNER_EMAIL, OWNER_PHONE))
        assert "bob@othercorp.com" not in out
        assert THIRD_PARTY_MARKER in out

    def test_recipients_own_email_survives(self):
        # Blanking the recipient's own address makes legitimate summaries read
        # as broken, and telling someone their own address leaks nothing.
        text = f"We updated the profile picture on {OWNER_EMAIL}."
        assert scrub_outbound(text, (OWNER_EMAIL,)) == text

    def test_own_email_matched_case_insensitively(self):
        text = "Your account Arun@ChatterMate.Chat is fixed."
        assert scrub_outbound(text, (OWNER_EMAIL,)) == text

    def test_own_phone_survives_reformatting(self):
        text = "We called you on 441234567890."
        assert scrub_outbound(text, (OWNER_PHONE,)) == text

    def test_third_party_phone_redacted(self):
        text = "The other merchant on 555-867-5309 hit this too."
        out = scrub_outbound(text, (OWNER_EMAIL, OWNER_PHONE))
        assert "555-867-5309" not in out

    def test_card_and_ssn_always_redacted_even_for_owner(self):
        # No support summary has a reason to restate these, whoever owns them.
        text = "Card 4111 1111 1111 1111 and SSN 123-45-6789."
        out = scrub_outbound(text, (OWNER_EMAIL, "4111 1111 1111 1111"))
        assert "4111" not in out
        assert "123-45-6789" not in out

    def test_short_numbers_do_not_whitelist_themselves(self):
        # An order count must not be treated as the owner's phone and thereby
        # whitelist an unrelated number.
        out = scrub_outbound("Contact 555-867-5309 about it.", ("42",))
        assert "555-867-5309" not in out

    def test_clean_message_untouched(self):
        text = "We found a missing configuration value and corrected it."
        assert scrub_outbound(text, (OWNER_EMAIL,)) == text

    def test_handles_empty(self):
        assert scrub_outbound(None, (OWNER_EMAIL,)) is None
        assert scrub_outbound("", (OWNER_EMAIL,)) == ""

    def test_no_owner_identifiers_redacts_everything(self):
        out = scrub_outbound("Reach bob@othercorp.com", ())
        assert "bob@othercorp.com" not in out


class TestRedactReferenceText:
    def test_strips_identifiers_from_another_customers_ticket(self):
        out = redact_reference_text(
            "TKT-3 [resolved] Payout failed for bob@othercorp.com — resolution: retried"
        )
        assert "bob@othercorp.com" not in out
        # The signal — what broke and how it was fixed — must survive.
        assert "Payout failed" in out
        assert "retried" in out

    def test_handles_empty(self):
        assert redact_reference_text(None) is None
        assert redact_reference_text("") == ""
