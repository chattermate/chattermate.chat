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


The order and ticket status cards, and the turn's card collector.
"""

import pytest

from app.cards.order_card import mask_tracking, order_card, order_status, ship_to
from app.cards.ticket_card import ticket_card
from app.cards.turn_cards import MAX_CARDS, TurnCards


def _order(**fields):
    base = {
        "id": "55", "name": "#1042", "created_at": "2026-11-03T10:00:00Z",
        "financial_status": "PAID", "fulfillment_status": "UNFULFILLED", "cancelled_at": None,
        "total_price": "45.00", "currency": "GBP",
        "shipping_address": {"address1": "1 Secret Street", "city": "Leeds", "zip": "LS1 4AP", "name": "Jane"},
        "line_items": [{"name": "Mug", "quantity": 2, "price": "20.00", "currency": "GBP",
                        "variant_title": "Default Title", "image": "https://cdn.shopify.com/m.png"}],
        "fulfillments": [],
    }
    return {**base, **fields}


def _shipped(display=None, quantity=2, tracking=True):
    return {"status": "SUCCESS", "display_status": display, "shipped_quantity": quantity,
            "estimated_delivery_at": "2026-11-12T00:00:00Z",
            "tracking_info": [{"company": "UPS", "number": "1ZE2E99991234", "url": "https://ups.example/t/1ZE"}] if tracking else []}


@pytest.mark.parametrize("fields,label,tone", [
    ({"financial_status": "REFUNDED", "cancelled_at": "2026-11-04"}, "Refunded", "neutral"),
    ({"cancelled_at": "2026-11-04T00:00:00Z"}, "Cancelled", "danger"),
    ({"fulfillment_status": "ON_HOLD"}, "On hold", "warning"),
    ({"fulfillment_status": "UNFULFILLED"}, "Processing", "progress"),
    ({"fulfillment_status": "SCHEDULED"}, "Processing", "progress"),
    ({"fulfillment_status": "PARTIALLY_FULFILLED", "fulfillments": [_shipped(quantity=1)]}, "1 of 2 shipped", "progress"),
    ({"fulfillment_status": "FULFILLED", "fulfillments": [_shipped("IN_TRANSIT")]}, "In transit", "info"),
    ({"fulfillment_status": "FULFILLED", "fulfillments": [_shipped("OUT_FOR_DELIVERY")]}, "Out for delivery", "info"),
    ({"fulfillment_status": "FULFILLED", "fulfillments": [_shipped("DELIVERED")]}, "Delivered", "success"),
    ({"fulfillment_status": "FULFILLED", "fulfillments": [_shipped()]}, "Shipped", "info"),
    ({"fulfillment_status": "RESTOCKED"}, "Restocked", "neutral"),
])
def test_order_status(fields, label, tone):
    status, _ = order_status(_order(**fields))
    assert (status.label, status.tone) == (label, tone)


def test_one_delivered_parcel_of_two_is_not_a_delivered_order():
    order = _order(fulfillment_status="FULFILLED", fulfillments=[_shipped("DELIVERED"), _shipped("IN_TRANSIT")])
    assert order_status(order)[0].label == "In transit"
    both = _order(fulfillment_status="FULFILLED", fulfillments=[_shipped("DELIVERED"), _shipped("PICKED_UP")])
    assert order_status(both)[0].label == "Delivered"


@pytest.mark.parametrize("carrier,label,tone", [
    ("ATTEMPTED_DELIVERY", "Delivery attempted", "warning"),
    ("FAILURE", "Delivery problem", "danger"),
    ("READY_FOR_PICKUP", "Ready for pickup", "info"),
    ("PICKED_UP", "Picked up", "success"),
])
def test_more_carrier_states(carrier, label, tone):
    status, _ = order_status(_order(fulfillment_status="FULFILLED", fulfillments=[_shipped(carrier)]))
    assert (status.label, status.tone) == (label, tone)


def test_a_refunded_order_with_a_shipment_shows_no_tracking_or_estimate():
    card = order_card(_order(financial_status="REFUNDED", fulfillment_status="FULFILLED", fulfillments=[_shipped()]))
    assert [a.id for a in card.actions] == ["help"]
    assert {r.label for r in card.rows} == {"Ship to"}


def test_a_delivered_order_has_no_estimate():
    card = order_card(_order(fulfillment_status="FULFILLED", fulfillments=[_shipped("DELIVERED")]))
    assert "Estimated delivery" not in {r.label for r in card.rows}


def test_an_edited_order_counts_what_it_holds_now():
    order = _order(fulfillment_status="PARTIALLY_FULFILLED", fulfillments=[_shipped(quantity=1)],
                   line_items=[{"name": "Mug", "quantity": 3, "current_quantity": 2}])
    assert order_status(order)[0].label == "1 of 2 shipped"


def test_a_cancelled_fulfillment_is_not_where_the_order_is():
    order = _order(fulfillment_status="FULFILLED",
                   fulfillments=[{**_shipped("DELIVERED"), "status": "CANCELLED"}, _shipped("IN_TRANSIT")])
    assert order_status(order)[0].label == "In transit"


def test_the_card_of_a_shipped_order():
    card = order_card(_order(fulfillment_status="FULFILLED", fulfillments=[_shipped("IN_TRANSIT")]))
    assert card.title == "Order #1042" and card.subtitle == "Placed 3 Nov · 2 items"
    assert [(s.label, s.state) for s in card.steps] == [
        ("Ordered", "done"), ("Processing", "done"), ("Shipped", "current"), ("Delivered", "upcoming")]
    assert {r.label: r.value for r in card.rows} == {
        "Estimated delivery": "12 Nov", "Ship to": "Leeds, LS1", "Tracking": "UPS •••• 1234"}
    assert card.actions[0].kind == "link" and card.actions[0].value == "https://ups.example/t/1ZE"
    assert card.actions[1].kind == "reply" and card.actions[1].value == "I need help with order #1042"
    assert card.items[0].meta is None and card.items[0].image == "https://cdn.shopify.com/m.png"
    assert card.total.amount.value == "45.00" and card.fallback_text == "Order #1042: In transit"


def test_the_street_and_the_full_tracking_number_never_reach_the_card():
    dumped = repr(order_card(_order(fulfillment_status="FULFILLED", fulfillments=[_shipped()])).model_dump())
    for private in ("1 Secret Street", "4AP", "1ZE2E99991234", "Jane"):
        assert private not in dumped


def test_a_refunded_order_has_no_steps_and_no_tracking_link():
    card = order_card(_order(financial_status="REFUNDED"))
    assert card.steps == [] and [a.id for a in card.actions] == ["help"]


def test_an_unsafe_tracking_url_is_left_out():
    shipment = _shipped()
    shipment["tracking_info"][0]["url"] = "javascript:alert(1)"
    card = order_card(_order(fulfillment_status="FULFILLED", fulfillments=[shipment]))
    assert [a.id for a in card.actions] == ["help"]


@pytest.mark.parametrize("address,shown", [
    ({"city": "Leeds", "zip": "LS1 4AP"}, "Leeds, LS1"),
    ({"city": "San Francisco", "zip": "94103"}, "San Francisco"),
    ({"city": "Toronto", "zip": "M5V 2T6"}, "Toronto, M5V"),
    ({"city": "", "zip": ""}, None),
    (None, None),
])
def test_ship_to(address, shown):
    assert ship_to(address) == shown


def test_mask_tracking():
    assert mask_tracking("1ZE2E99991234") == "•••• 1234"
    assert mask_tracking("123") == "123"


@pytest.mark.parametrize("status,label,current", [
    ("open", "Received", 0), ("investigating", "Looking into it", 1),
    ("resolved_pending_confirmation", "Resolved, please confirm", 2), ("resolved", "Resolved", 3),
    ("something_new", "Received", 0),
])
def test_ticket_card(status, label, current):
    card = ticket_card("TKT-12", status)
    assert card.status.label == label
    states = [s.state for s in card.steps]
    assert states.index("current") == current if "current" in states else current == 3
    assert {r.label: r.value for r in card.rows} == {"Ticket": "TKT-12"}


class TestTurnCards:
    def test_keeps_cards_in_order_and_replaces_a_repeat(self):
        cards = TurnCards()
        cards.add(ticket_card("TKT-1", "open"))
        cards.add(order_card(_order()))
        cards.add(ticket_card("TKT-1", "investigating"))
        payload = cards.payload()
        assert [c["id"] for c in payload] == ["order-55", "ticket-TKT-1"]
        assert payload[1]["status"]["label"] == "Looking into it"

    def test_caps(self):
        cards = TurnCards()
        for i in range(MAX_CARDS + 2):
            cards.add(ticket_card(f"TKT-{i}", "open"))
        assert len(cards.payload()) == MAX_CARDS
