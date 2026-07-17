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

from app.utils.phone import normalize_msisdn, normalize_phone, to_wa_id


class TestNormalizePhone:
    """Human-typed input: '+' is required, decoration is forgiven."""

    @pytest.mark.parametrize("raw,expected", [
        ("+916366602824", "+916366602824"),
        ("+91 63666 02824", "+916366602824"),
        ("+1 (555) 000-1111", "+15550001111"),
        ("+44.7700.900123", "+447700900123"),
        ("  +916366602824  ", "+916366602824"),
    ])
    def test_canonicalizes_decorated_e164(self, raw, expected):
        assert normalize_phone(raw) == expected

    @pytest.mark.parametrize("raw", [
        None,
        "",
        "   ",
        "not a number",
        "+0123456789",        # country codes never start with 0
        "+12345",             # too short to be E.164
        "+1234567890123456",  # too long (max 15 digits)
        "+91-abc-602824",
    ])
    def test_rejects_what_is_not_e164(self, raw):
        assert normalize_phone(raw) is None

    def test_bare_digits_are_rejected_not_guessed_at(self):
        # "6366602824" typed by a person is a national number; prepending '+'
        # would silently hand it to whatever country owns prefix 63 (the
        # Philippines). An identity key must never be a guess.
        assert normalize_phone("6366602824") is None
        assert normalize_phone("916366602824") is None


class TestNormalizeMsisdn:
    """Platform-supplied ids (wa_id, SMS sender): bare digits ARE E.164-minus-plus."""

    @pytest.mark.parametrize("raw,expected", [
        ("916366602824", "+916366602824"),   # WhatsApp wa_id
        ("447700900123", "+447700900123"),   # Vonage-style msisdn, no '+'
        ("+15550001111", "+15550001111"),    # Twilio-style, '+' included
    ])
    def test_trusts_platform_shapes(self, raw, expected):
        assert normalize_msisdn(raw) == expected

    def test_same_canonical_form_as_the_strict_path(self):
        # Both normalizers must land in one column shape, or one person
        # becomes two.
        assert normalize_msisdn("916366602824") == normalize_phone("+91 63666 02824")

    def test_accepts_the_itu_00_international_form(self):
        # Some SMS gateways deliver '00'-prefixed international numbers.
        assert normalize_msisdn("00447700900123") == "+447700900123"

    @pytest.mark.parametrize("raw", [None, "", "12345", "garbage"])
    def test_still_rejects_non_numbers(self, raw):
        assert normalize_msisdn(raw) is None

    def test_rejects_unicode_digits(self):
        # str.isdigit() is True for Arabic-Indic digits and \d matches them
        # without re.ASCII — either slip would store an undialable identity key.
        assert normalize_msisdn("1٢٣٤٥٦٧٨") is None
        assert normalize_phone("+1٢٣٤٥٦٧٨") is None

    def test_tolerates_non_string_input(self):
        # AI-extracted field_values can hand over lists or numbers; a crash
        # here would roll back the whole contact update.
        assert normalize_phone(["+916366602824"]) is None
        assert normalize_msisdn(916366602824) is None


class TestToWaId:
    def test_strips_the_plus(self):
        assert to_wa_id("+916366602824") == "916366602824"
