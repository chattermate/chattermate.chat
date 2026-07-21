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

Customer-identity capture on native ticket creation: the email/name the
customer states in chat must be validated, folded onto the (usually anonymous)
customer, and surfaced to the investigator — the …@noemail.com placeholder must
never be presented as a real identity.
"""

from types import SimpleNamespace

from app.tools.ticket_toolkit import _clean_email, _clean_name


class TestCleanEmail:
    def test_normalizes_and_lowercases(self):
        assert _clean_email("  Admin@ChatterMate.Chat ") == "admin@chattermate.chat"

    def test_rejects_junk(self):
        for bad in (None, "", "not-an-email", "no@domain", "@no-local.com", "a b@c.com"):
            assert _clean_email(bad) is None


class TestCleanName:
    def test_trims(self):
        assert _clean_name("  Arun  ") == "Arun"

    def test_empty_is_none(self):
        assert _clean_name(None) is None
        assert _clean_name("   ") is None


class TestCustomerIdentitySection:
    """The worker's trusted identity block fed to the investigator."""

    def _section(self, **customer_fields):
        from app.workers.ticket_investigator import _customer_identity_section

        fields = {"full_name": None, "email": None, "phone": None, "meta_data": None}
        fields.update(customer_fields)
        customer = SimpleNamespace(**fields)
        ticket = SimpleNamespace(customer=customer)
        return _customer_identity_section(ticket)

    def test_none_without_customer(self):
        from app.workers.ticket_investigator import _customer_identity_section

        assert _customer_identity_section(SimpleNamespace(customer=None)) is None

    def test_real_identity_included(self):
        section = self._section(
            full_name="Arun Kumar", email="admin@chattermate.chat", phone="+441234567890"
        )
        assert section is not None
        assert "admin@chattermate.chat" in section
        assert "Arun Kumar" in section
        assert "+441234567890" in section

    def test_placeholder_email_omitted(self):
        # Anonymous widget visitor with no real identity -> no section at all.
        assert self._section(email="1784547346351@noemail.com") is None

    def test_placeholder_email_but_real_name_keeps_name_only(self):
        section = self._section(
            full_name="Arun", email="1784547346351@noemail.com"
        )
        assert section is not None
        assert "Arun" in section
        assert "noemail.com" not in section

    def test_meta_data_identifiers_included(self):
        section = self._section(
            full_name="Arun", meta_data={"account_id": "acc_991", "plan": "pro"}
        )
        assert "acc_991" in section
