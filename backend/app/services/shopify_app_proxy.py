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

A customer signed in to a Shopify storefront chats as themselves. The store's
pages ask /apps/chattermate/identity (same origin); Shopify forwards that to us
through the app's App Proxy, signing the query with the app secret and adding
logged_in_customer_id for a signed-in customer. We check the signature, look
the customer's email up in the store, and mint a verified conversation token
for the store's widget, as /generate-token does for an app with an API key.

Without a valid signature, a fresh timestamp, an installed store linked to the
widget's organization and a signed-in customer, there is no token.
"""

import hashlib
import hmac
import time
from typing import Mapping, Optional, Sequence, Tuple

import requests
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import get_existing_valid_token_jti
from app.core.logger import get_logger
from app.models.shopify.shopify_shop import ShopifyShop
from app.models.widget import Widget
from app.repositories.customer import CustomerRepository
from app.repositories.shopify_shop_repository import ShopifyShopRepository
from app.services import conversation_token
from app.services.shopify_tokens import admin_headers, call_admin_api
from app.services.shopify_urls import shopify_admin_url

logger = get_logger(__name__)

# A signed request older (or newer) than this is refused: a copied URL stops working
MAX_AGE_SECONDS = 300
TOKEN_TTL_SECONDS = 3600
ADMIN_TIMEOUT_SECONDS = 8
SOURCE = 'shopify_storefront'

CUSTOMER_GRAPHQL = """
query Customer($id: ID!) {
  customer(id: $id) { email firstName lastName }
}
"""


def signature_valid(query: Sequence[Tuple[str, str]], secret: str, now: Optional[float] = None) -> bool:
    """Shopify's App Proxy signature: HMAC-SHA256 (hex) over the other parameters
    as key=value strings, sorted, joined with nothing; a repeated key joins its
    values with commas. And the timestamp must be recent."""
    if not secret:
        return False
    values: dict = {}
    signature = None
    for key, value in query:
        if key == 'signature':
            signature = value
        else:
            values.setdefault(key, []).append(value)
    if not signature:
        return False
    # Sorted as whole key=value strings, as Shopify does (not by key alone)
    message = ''.join(sorted(f"{key}={','.join(joined)}" for key, joined in values.items()))
    expected = hmac.new(secret.encode(), message.encode(), hashlib.sha256).hexdigest()
    if not hmac.compare_digest(expected, signature):
        return False
    try:
        stamp = int(values.get('timestamp', [''])[0])
    except ValueError:
        return False
    return abs((now if now is not None else time.time()) - stamp) <= MAX_AGE_SECONDS


def _store_widget(db: Session, shop_domain: str, widget_id: str) -> Tuple[Optional[ShopifyShop], Optional[Widget]]:
    """The installed store and the widget it asks for, when they belong together."""
    shop = ShopifyShopRepository(db).get_shop_by_domain(shop_domain)
    if shop is None or not shop.is_installed or shop.organization_id is None:
        return None, None
    try:
        widget = db.query(Widget).filter(Widget.id == widget_id,
                                         Widget.organization_id == shop.organization_id).first()
    except Exception:
        db.rollback()
        return None, None
    return (shop, widget) if widget is not None else (None, None)


def _customer(shop: ShopifyShop, customer_id: str) -> Optional[dict]:
    """The store's customer (email and name), or None."""
    response = call_admin_api(shop, lambda token: requests.post(
        shopify_admin_url(shop.shop_domain, 'graphql.json'),
        headers=admin_headers(token),
        json={'query': CUSTOMER_GRAPHQL, 'variables': {'id': f'gid://shopify/Customer/{customer_id}'}},
        verify=settings.VERIFY_SSL_CERTIFICATES,
        timeout=ADMIN_TIMEOUT_SECONDS,
    ))
    if response is None or response.status_code != 200:
        return None
    return ((response.json() or {}).get('data') or {}).get('customer')


def identity_token(db: Session, query: Sequence[Tuple[str, str]]) -> Optional[dict]:
    """Blocking. {'token', 'expires_in'} for the signed-in customer of a signed
    App Proxy request, else None."""
    if not signature_valid(query, settings.SHOPIFY_API_SECRET):
        return None
    params: Mapping[str, str] = dict(query)
    customer_id = (params.get('logged_in_customer_id') or '').strip()
    if not customer_id.isdigit():
        return None
    shop, widget = _store_widget(db, params.get('shop') or '', params.get('widget_id') or '')
    if widget is None:
        return None
    found = _customer(shop, customer_id)
    email = (found or {}).get('email') or ''
    if not email:
        return None
    name = ' '.join(part for part in ((found or {}).get('firstName'), (found or {}).get('lastName')) if part) or None
    customer = CustomerRepository(db).identify(email=email, organization_id=widget.organization_id, full_name=name)
    # One revocable session per customer and widget, however many pages they open
    jti = get_existing_valid_token_jti(email, str(widget.id), str(customer.id))
    token, _, ttl = conversation_token.mint({
        'sub': str(customer.id),
        'widget_id': str(widget.id),
        'customer_email': email,
        'customer_name': name or customer.full_name,
        'customer_id': str(customer.id),
        'custom_data': {'source': SOURCE},
    }, ttl_seconds=TOKEN_TTL_SECONDS, jti=jti)
    return {'token': token, 'expires_in': ttl}
