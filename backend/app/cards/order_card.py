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

The order card: a Shopify order (ShopifyService.get_order) as the visitor sees
it. Only for an order the visitor proved is theirs (get_order_status checks the
number and the checkout email). Shortened before it is sent or stored: the
ship-to is a city and the start of the postcode, tracking numbers are masked.
Words come from the visitor's language table (labels.py).
"""

from datetime import datetime
from typing import Any, List, Optional, Tuple

from app.cards.labels import ENGLISH, CardLabels
from app.models.schemas.cards import (
    CardAction, CardItem, CardRow, CardStatus, CardStep, CardTotal, Money, StatusCard,
)

STEP_KEYS = ('step_ordered', 'step_processing', 'step_shipped', 'step_delivered')
MAX_ITEMS = 6

# Carrier states (FulfillmentDisplayStatus) of a shipped order, least advanced
# first: an order with several parcels reads as its least advanced one, so one
# delivered parcel never makes the whole order "Delivered".
_ARRIVED = {'DELIVERED', 'PICKED_UP'}
# Carrier status → (label key, tone), most urgent first
_CARRIER = [
    ('FAILURE', 'delivery_problem', 'danger'),
    ('NOT_DELIVERED', 'delivery_problem', 'danger'),
    ('ATTEMPTED_DELIVERY', 'delivery_attempted', 'warning'),
    ('IN_TRANSIT', 'in_transit', 'info'),
    ('OUT_FOR_DELIVERY', 'out_for_delivery', 'info'),
    ('READY_FOR_PICKUP', 'ready_for_pickup', 'info'),
]
_PROCESSING = {'UNFULFILLED', 'PENDING_FULFILLMENT', 'OPEN', 'SCHEDULED', 'IN_PROGRESS'}


def _upper(value: Any) -> str:
    return str(value or '').upper()


def _title_case(value: str, labels: CardLabels) -> str:
    """A status Shopify added after this table was written, as Shopify spells it."""
    return value.replace('_', ' ').capitalize() if value else labels.text('unknown')


def _carrier_statuses(order: dict) -> List[str]:
    return [_upper(f.get('display_status')) for f in order.get('fulfillments') or []
            if _upper(f.get('status')) != 'CANCELLED']


def _quantity(line_item: dict) -> int:
    """What the order holds now (an edited order can have fewer), else as placed."""
    current = line_item.get('current_quantity')
    return int(current if current is not None else line_item.get('quantity') or 0)


def _shipped_counts(order: dict) -> Tuple[int, int]:
    """(items shipped, items ordered), from fulfillment line-item quantities."""
    ordered = sum(_quantity(li) for li in order.get('line_items') or [])
    shipped = sum(int(f.get('shipped_quantity') or 0) for f in order.get('fulfillments') or []
                  if _upper(f.get('status')) != 'CANCELLED')
    return min(shipped, ordered), ordered


def order_status(order: dict, labels: CardLabels = ENGLISH) -> Tuple[CardStatus, int]:
    """The status pill and how far along the Ordered → Delivered steps it is (the
    current step's index, -1 when the order will not get there). First match wins."""
    say = labels.text
    financial = _upper(order.get('financial_status'))
    fulfillment = _upper(order.get('fulfillment_status'))
    carriers = _carrier_statuses(order)
    if financial == 'REFUNDED':
        return CardStatus(key='refunded', label=say('refunded'), tone='neutral'), -1
    if order.get('cancelled_at'):
        return CardStatus(key='cancelled', label=say('cancelled'), tone='danger'), -1
    if fulfillment == 'ON_HOLD':
        return CardStatus(key='on_hold', label=say('on_hold'), tone='warning'), 1
    if fulfillment in _PROCESSING:
        return CardStatus(key='processing', label=say('processing'), tone='progress'), 1
    if fulfillment == 'PARTIALLY_FULFILLED':
        shipped, ordered = _shipped_counts(order)
        label = say('partial', shipped=shipped, ordered=ordered) if ordered and shipped else say('partly_shipped')
        return CardStatus(key='partial', label=label, tone='progress'), 2
    if fulfillment == 'DELIVERED' or (carriers and all(c in _ARRIVED for c in carriers)):
        label = say('picked_up') if carriers and all(c == 'PICKED_UP' for c in carriers) else say('delivered')
        return CardStatus(key='delivered', label=label, tone='success'), 3
    if fulfillment == 'FULFILLED':
        for carrier, key, tone in _CARRIER:
            if carrier in carriers:
                return CardStatus(key=carrier.lower(), label=say(key), tone=tone), 2
        return CardStatus(key='shipped', label=say('shipped'), tone='info'), 2
    return CardStatus(key=fulfillment.lower() or 'unknown', label=_title_case(fulfillment, labels), tone='neutral'), 0


def _steps(current: int, labels: CardLabels) -> List[CardStep]:
    if current < 0:
        return []
    return [CardStep(label=labels.text(key), state='done' if i < current else 'current' if i == current else 'upcoming')
            for i, key in enumerate(STEP_KEYS)]


def _date(value: Any, labels: CardLabels) -> Optional[str]:
    """"3 Nov" (in the visitor's language) from an ISO timestamp."""
    try:
        parsed = datetime.fromisoformat(str(value).replace('Z', '+00:00'))
    except ValueError:
        return None
    return labels.date(parsed)


def ship_to(address: Optional[dict]) -> Optional[str]:
    """"Leeds, LS1": the city and the first half of the postcode, never the street."""
    if not address:
        return None
    city = (address.get('city') or '').strip()
    # The district of a two-part postcode (UK, Canada, Netherlands); a one-part
    # code (a US ZIP) is left out, since cutting it would read as a typo.
    parts = (address.get('zip') or '').strip().split()
    postcode = parts[0] if len(parts) > 1 else ''
    shown = ', '.join(part for part in (city, postcode) if part)
    return shown or None


def mask_tracking(number: str) -> str:
    """"•••• 1234": enough to match it with the carrier's email."""
    digits = number.strip()
    return f'•••• {digits[-4:]}' if len(digits) > 4 else digits


def _tracking(order: dict) -> Tuple[Optional[str], Optional[str], Optional[str]]:
    """(masked number, carrier, http(s) tracking URL) of the latest active fulfillment."""
    for fulfillment in reversed(order.get('fulfillments') or []):
        if _upper(fulfillment.get('status')) == 'CANCELLED':
            continue
        for info in fulfillment.get('tracking_info') or []:
            number = info.get('number') or ''
            url = info.get('url') or ''
            if number or url:
                return (mask_tracking(number) if number else None, info.get('company') or None,
                        url if url.startswith(('https://', 'http://')) else None)
    return None, None, None


def _estimated_delivery(order: dict, labels: CardLabels) -> Optional[str]:
    """The latest active shipment's estimate."""
    for fulfillment in reversed(order.get('fulfillments') or []):
        if _upper(fulfillment.get('status')) == 'CANCELLED':
            continue
        shown = _date(fulfillment.get('estimated_delivery_at'), labels) if fulfillment.get('estimated_delivery_at') else None
        if shown:
            return shown
    return None


def _items(order: dict, labels: CardLabels) -> List[CardItem]:
    items = []
    for li in (order.get('line_items') or [])[:MAX_ITEMS]:
        variant = li.get('variant_title')
        image = li.get('image') or ''
        items.append(CardItem(
            title=li.get('name') or labels.text('item'),
            meta=variant if variant and variant != 'Default Title' else None,
            image=image if image.startswith('https://') else None,
            quantity=_quantity(li),
            amount=Money(value=str(li['price']), currency=li.get('currency') or '') if li.get('price') else None,
        ))
    return items


def order_card(order: dict, labels: CardLabels = ENGLISH) -> StatusCard:
    say = labels.text
    name = order.get('name') or ''
    title = say('order_title', name=name) if name else say('your_order')
    status, current = order_status(order, labels)
    count = sum(_quantity(li) for li in order.get('line_items') or [])
    placed = _date(order.get('created_at'), labels)
    subtitle = ' · '.join(p for p in (
        say('placed', date=placed) if placed else None,
        labels.items(count) if count else None,
    ) if p) or None

    # A refunded or cancelled order has nothing to track; an arrived one no estimate.
    tracking, carrier, tracking_url = _tracking(order) if current >= 0 else (None, None, None)
    rows = [CardRow(label=say(key), value=value) for key, value in (
        ('estimated_delivery', _estimated_delivery(order, labels) if current == 2 else None),
        ('ship_to', ship_to(order.get('shipping_address'))),
        ('tracking', f'{carrier} {tracking}'.strip() if tracking and carrier else tracking),
    ) if value]

    actions = []
    if tracking_url:
        actions.append(CardAction(id='track', label=say('track'), kind='link', value=tracking_url, style='primary'))
    actions.append(CardAction(id='help', label=say('get_help'), kind='reply',
                              value=say('help_message', name=name or title)))

    total = None
    if order.get('total_price'):
        total = CardTotal(label=say('total'), amount=Money(value=str(order['total_price']), currency=order.get('currency') or ''))

    return StatusCard(
        id=f'order-{order.get("id") or name}',
        kind='order',
        lang=labels.language,
        title=title,
        subtitle=subtitle,
        status=status,
        steps=_steps(current, labels),
        rows=rows,
        items=_items(order, labels),
        total=total,
        actions=actions,
        fallback_text=f'{title}: {status.label}',
    )


def recent_orders_card(orders: List[dict], labels: CardLabels = ENGLISH) -> StatusCard:
    """A confirmed email's recent orders (list_my_orders): one tap asks about one."""
    say = labels.text
    rows, actions = [], []
    for order in orders:
        name = order.get('order_number') or ''
        if not name:
            continue
        status, _ = order_status({'financial_status': order.get('financial_status'),
                                  'fulfillment_status': order.get('fulfillment_status')}, labels)
        placed = _date(order.get('created_at'), labels)
        rows.append(CardRow(label=f'{name} · {placed}' if placed else name, value=status.label))
        actions.append(CardAction(id=f'order-{name}', label=say('order_title', name=name), kind='reply',
                                  value=say('recent_message', name=name)))
    title = say('recent_title')
    return StatusCard(id='recent-orders', kind='order', lang=labels.language, title=title, rows=rows,
                      actions=actions, fallback_text=f'{title}: ' + ', '.join(r.label for r in rows))
