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

from app.tools.shopify_order_access import (
    EMAIL_REQUIRED,
    INVALID_ORDER_NUMBER,
    ORDER_NUMBER_REQUIRED,
    build_order_search,
    order_belongs_to,
    missing_from_chat,
    order_lookup_problem,
    order_number_matches,
)


@pytest.mark.parametrize("email", ["a@example.com", "First.Last+tag@shop.co.uk", " A@Example.com "])
def test_plain_emails_pass(email):
    assert order_lookup_problem(email, "1001") is None


@pytest.mark.parametrize("email", [None, "", "a@b", "a b@example.com", "*@example.com",
                                   "a@example.com OR name:1", 'a"@example.com', "a@(example).com"])
def test_emails_that_could_widen_the_search_are_refused(email):
    assert order_lookup_problem(email, "1001") == EMAIL_REQUIRED


@pytest.mark.parametrize("number", [None, "", "   ", "#", " # "])
def test_an_order_number_is_always_required(number):
    assert order_lookup_problem("a@example.com", number) == ORDER_NUMBER_REQUIRED


@pytest.mark.parametrize("number", ["#1001", "1001", " #1001 ", "# 1001", "SHOP-1001-UK"])
def test_order_number_formats_pass(number):
    assert order_lookup_problem("a@example.com", number) is None


@pytest.mark.parametrize("number", ["10 OR 1", "-1001", "1001*", "name:1001"])
def test_order_numbers_with_search_syntax_are_refused(number):
    assert order_lookup_problem("a@example.com", number) == INVALID_ORDER_NUMBER


def test_build_order_search():
    assert build_order_search(" A@Example.com ", "#1001") == "email:a@example.com AND name:1001"
    assert build_order_search("a@example.com", "1001") == "email:a@example.com AND name:1001"


def test_order_belongs_to_order_or_customer_email():
    assert order_belongs_to({"email": "A@example.com"}, "a@example.com")
    assert order_belongs_to({"email": None, "customer": {"email": "a@example.com"}}, "a@example.com")
    assert not order_belongs_to({"email": "b@example.com", "customer": None}, "a@example.com")
    assert not order_belongs_to({"email": None, "customer": None}, "")


def test_order_number_matches_exactly():
    assert order_number_matches({"name": "#1001"}, "1001")
    assert order_number_matches({"name": "#1001"}, "#1001")
    assert order_number_matches({"name": "#SHOP-1001"}, "shop-1001")
    assert not order_number_matches({"name": "#10010"}, "1001")


@pytest.mark.parametrize("number", [None, "", " # "])
def test_no_number_matches_no_order(number):
    assert not order_number_matches({"name": "#1001"}, number)
    assert not order_number_matches({"name": None}, number)


@pytest.mark.parametrize("email,number,messages", [
    ("a@example.com", "1001", ["order 1001, a@example.com"]),
    ("a@example.com", "#1001", ["Order #1001", "A@Example.COM"]),
    ("a@example.com", "1001", ["it's 1001.", "email: a@example.com."]),
    ("a@example.com", "shop-1001-uk", ["SHOP-1001-UK / a@example.com"]),
    ("a@example.com", "1001", ["order No.1001, a@example.com"]),
    ("a@example.com", "1001", ["(#1001) <a@example.com>"]),
])
def test_written_details_pass(email, number, messages):
    assert missing_from_chat(email, number, messages) is None


@pytest.mark.parametrize("email,number,messages,problem", [
    ("a@example.com", "1001", [], EMAIL_REQUIRED),
    ("a@example.com", "1001", ["1001"], EMAIL_REQUIRED),
    ("a@example.com", "1001", ["1001 aa@example.com"], EMAIL_REQUIRED),
    ("a@example.com", "1001", ["1001 x.a@example.com"], EMAIL_REQUIRED),
    ("a@example.com", "1001", ["1001 a@example.community"], EMAIL_REQUIRED),
    ("a@example.com", "1001", ["a@example.com"], ORDER_NUMBER_REQUIRED),
    ("a@example.com", "1001", ["a@example.com 21001"], ORDER_NUMBER_REQUIRED),
    ("a@example.com", "1001", ["a@example.com 10010"], ORDER_NUMBER_REQUIRED),
    ("a@example.com", "1001", ["a@example.com shop-1001"], ORDER_NUMBER_REQUIRED),
    # A number that only appears inside an email was not given as an order number
    ("1001@example.com", "1001", ["1001@example.com"], ORDER_NUMBER_REQUIRED),
])
def test_details_not_written_are_asked_for(email, number, messages, problem):
    assert missing_from_chat(email, number, messages) == problem



def test_a_proven_email_need_not_be_typed():
    """An email proven with a code (email_check) counts as given; the number still must be."""
    assert missing_from_chat("jane@acme.com", "1001", ["it's #1001"], verified_email="Jane@Acme.com") is None
    assert missing_from_chat("jane@acme.com", "1001", ["hi"], verified_email="jane@acme.com") is not None
    assert missing_from_chat("other@acme.com", "1001", ["#1001"], verified_email="jane@acme.com") is not None
