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
"""

from datetime import datetime
from typing import Any, List, Optional, Tuple

from app.models.schemas.cards import (
    CardAction, CardItem, CardRow, CardStatus, CardStep, CardTotal, Money, StatusCard,
)

STEP_LABELS = ('Ordered', 'Processing', 'Shipped', 'Delivered')
MAX_ITEMS = 6

# Carrier states (FulfillmentDisplayStatus) that say where a shipped order is.
_IN_TRANSIT = {'IN_TRANSIT': 'In transit', 'OUT_FOR_DELIVERY': 'Out for delivery'}
_PROCESSING = {'UNFULFILLED', 'PENDING_FULFILLMENT', 'OPEN', 'SCHEDULED', 'IN_PROGRESS'}


def _upper(value: Any) -> str:
    return str(value or '').upper()


def _title_case(value: str) -> str:
    return value.replace('_', ' ').capitalize() if value else 'Unknown'


def _carrier_statuses(order: dict) -> List[str]:
    return [_upper(f.get('display_status')) for f in order.get('fulfillments') or []
            if _upper(f.get('status')) != 'CANCELLED']


def _shipped_counts(order: dict) -> Tuple[int, int]:
    """(items shipped, items ordered), from fulfillment line-item quantities."""
    ordered = sum(int(li.get('quantity') or 0) for li in order.get('line_items') or [])
    shipped = sum(int(f.get('shipped_quantity') or 0) for f in order.get('fulfillments') or []
                  if _upper(f.get('status')) != 'CANCELLED')
    return min(shipped, ordered), ordered


def order_status(order: dict) -> Tuple[CardStatus, int]:
    """The status pill and how far along the Ordered → Delivered steps it is (the
    current step's index, -1 when the order will not get there). First match wins."""
    financial = _upper(order.get('financial_status'))
    fulfillment = _upper(order.get('fulfillment_status'))
    carriers = _carrier_statuses(order)
    if financial == 'REFUNDED':
        return CardStatus(key='refunded', label='Refunded', tone='neutral'), -1
    if order.get('cancelled_at'):
        return CardStatus(key='cancelled', label='Cancelled', tone='danger'), -1
    if fulfillment == 'ON_HOLD':
        return CardStatus(key='on_hold', label='On hold', tone='warning'), 1
    if fulfillment in _PROCESSING:
        return CardStatus(key='processing', label='Processing', tone='progress'), 1
    if fulfillment == 'PARTIALLY_FULFILLED':
        shipped, ordered = _shipped_counts(order)
        label = f'{shipped} of {ordered} shipped' if ordered and shipped else 'Partly shipped'
        return CardStatus(key='partial', label=label, tone='progress'), 2
    if 'DELIVERED' in carriers or fulfillment == 'DELIVERED':
        return CardStatus(key='delivered', label='Delivered', tone='success'), 3
    if fulfillment == 'FULFILLED':
        for carrier, label in _IN_TRANSIT.items():
            if carrier in carriers:
                return CardStatus(key=carrier.lower(), label=label, tone='info'), 2
        return CardStatus(key='shipped', label='Shipped', tone='info'), 2
    return CardStatus(key=fulfillment.lower() or 'unknown', label=_title_case(fulfillment), tone='neutral'), 0


def _steps(current: int) -> List[CardStep]:
    if current < 0:
        return []
    return [CardStep(label=label, state='done' if i < current else 'current' if i == current else 'upcoming')
            for i, label in enumerate(STEP_LABELS)]


def _date(value: Any) -> Optional[str]:
    """"3 Nov" from an ISO timestamp."""
    try:
        parsed = datetime.fromisoformat(str(value).replace('Z', '+00:00'))
    except ValueError:
        return None
    return f'{parsed.day} {parsed.strftime("%b")}'


def ship_to(address: Optional[dict]) -> Optional[str]:
    """"Leeds, LS1": the city and the first half of the postcode, never the street."""
    if not address:
        return None
    city = (address.get('city') or '').strip()
    postcode = (address.get('zip') or '').strip().split(' ')[0][:4]
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


def _estimated_delivery(order: dict) -> Optional[str]:
    for fulfillment in order.get('fulfillments') or []:
        shown = _date(fulfillment.get('estimated_delivery_at')) if fulfillment.get('estimated_delivery_at') else None
        if shown:
            return shown
    return None


def _items(order: dict) -> List[CardItem]:
    items = []
    for li in (order.get('line_items') or [])[:MAX_ITEMS]:
        variant = li.get('variant_title')
        image = li.get('image') or ''
        items.append(CardItem(
            title=li.get('name') or 'Item',
            meta=variant if variant and variant != 'Default Title' else None,
            image=image if image.startswith('https://') else None,
            quantity=li.get('quantity'),
            amount=Money(value=str(li['price']), currency=li.get('currency') or '') if li.get('price') else None,
        ))
    return items


def order_card(order: dict) -> StatusCard:
    name = order.get('name') or 'Your order'
    status, current = order_status(order)
    count = sum(int(li.get('quantity') or 0) for li in order.get('line_items') or [])
    placed = _date(order.get('created_at'))
    subtitle = ' · '.join(p for p in (
        f'Placed {placed}' if placed else None,
        f'{count} item{"" if count == 1 else "s"}' if count else None,
    ) if p) or None

    tracking, carrier, tracking_url = _tracking(order)
    rows = [CardRow(label=label, value=value) for label, value in (
        ('Estimated delivery', _estimated_delivery(order)),
        ('Ship to', ship_to(order.get('shipping_address'))),
        ('Tracking', f'{carrier} {tracking}'.strip() if tracking and carrier else tracking),
    ) if value]

    actions = []
    if tracking_url:
        actions.append(CardAction(id='track', label='Track with carrier', kind='link', value=tracking_url, style='primary'))
    actions.append(CardAction(id='help', label='Get help with this order', kind='reply',
                              value=f'I need help with order {name}'))

    total = None
    if order.get('total_price'):
        total = CardTotal(label='Total', amount=Money(value=str(order['total_price']), currency=order.get('currency') or ''))

    return StatusCard(
        id=f'order-{order.get("id") or name}',
        kind='order',
        title=f'Order {name}',
        subtitle=subtitle,
        status=status,
        steps=_steps(current),
        rows=rows,
        items=_items(order),
        total=total,
        actions=actions,
        fallback_text=f'Order {name}: {status.label}',
    )
