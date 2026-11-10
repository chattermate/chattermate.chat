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

"""Who may see a Shopify order through the chat agent.

Order numbers are sequential, so a number alone proves nothing, and anyone can type
an email, so an email alone proves nothing either. A shopper sees an order only when
they give both its number and the email it was placed with, and both match that order
exactly. A wrong email and a missing order get the same answer, so the reply never
confirms that an order number exists.

"Give" means the customer wrote it in this conversation. The model can see an account
email and example order numbers, and left to a prompt rule it fills them in itself.
"""

import re
from typing import Any, Dict, Iterable, Optional

# Same reply for "no such order" and "not your order": never confirm an order exists.
ORDER_NOT_FOUND = (
    "No order matches that order number and email address. "
    "Ask the customer to check both against their order confirmation email."
)
EMAIL_REQUIRED = (
    "Ask the customer for the email address they used at checkout. "
    "Orders are only shared with the person who placed them."
)
ORDER_NUMBER_REQUIRED = "Ask the customer for their order number (for example #1001)."
INVALID_ORDER_NUMBER = "That doesn't look like an order number. Ask the customer to check it."

MAX_ORDER_RESULTS = 10

# Restricted to characters that are inert in Shopify search syntax (no spaces,
# quotes, colons, brackets or the * wildcard), so a value can't widen the query.
_EMAIL = re.compile(r"^[A-Za-z0-9.!#$%&'+/=?^_`{|}~-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)+$")
# Shopify order names can carry a custom prefix or suffix (e.g. "SHOP-1001-UK").
_ORDER_NUMBER = re.compile(r"^[A-Za-z0-9][A-Za-z0-9-]{0,31}$")


def normalise_email(email: Optional[str]) -> str:
    return (email or "").strip().lower()


def normalise_order_number(order_number: Optional[str]) -> str:
    return (order_number or "").strip().lstrip("#").strip().lower()


def order_lookup_problem(customer_email: Optional[str], order_number: Optional[str]) -> Optional[str]:
    """Why this lookup can't run, or None when it can."""
    if not _EMAIL.match(normalise_email(customer_email)):
        return EMAIL_REQUIRED
    number = normalise_order_number(order_number)
    if not number:
        return ORDER_NUMBER_REQUIRED
    if not _ORDER_NUMBER.match(number):
        return INVALID_ORDER_NUMBER
    return None


def _written_in(value: str, text: str, part_of_a_word: str) -> bool:
    """True when `value` stands on its own in `text`, with none of the characters in
    `part_of_a_word` directly before it, and no letter, digit, @, _ or - after it."""
    return re.search(rf"(?<![{part_of_a_word}]){re.escape(value)}(?![a-z0-9@_-])", text) is not None


def missing_from_chat(customer_email: str, order_number: str, customer_messages: Iterable[str]) -> Optional[str]:
    """What the customer has not written themselves, or None when they gave both.
    Inputs must already pass order_lookup_problem."""
    written = "\n".join(customer_messages).lower()
    # a@b.co is not in x.a@b.co, but 1001 is in "No.1001"
    if not _written_in(normalise_email(customer_email), written, r"a-z0-9@.+_\-"):
        return EMAIL_REQUIRED
    if not _written_in(normalise_order_number(order_number), written, r"a-z0-9@_\-"):
        return ORDER_NUMBER_REQUIRED
    return None


def build_order_search(customer_email: str, order_number: str) -> str:
    """Shopify search syntax for one customer's order. Inputs must already pass
    order_lookup_problem, which limits them to characters inert in the syntax."""
    return f"email:{normalise_email(customer_email)} AND name:{normalise_order_number(order_number)}"


def order_belongs_to(order: Dict[str, Any], customer_email: str) -> bool:
    """True when the email given matches the order's own email or its customer's."""
    wanted = normalise_email(customer_email)
    customer = order.get("customer") or {}
    return bool(wanted) and wanted in {
        normalise_email(order.get("email")),
        normalise_email(customer.get("email")),
    }


def order_number_matches(order: Dict[str, Any], order_number: Optional[str]) -> bool:
    """Exact match on the order name, so #1005 never returns #10050."""
    number = normalise_order_number(order_number)
    return bool(number) and normalise_order_number(order.get("name")) == number
