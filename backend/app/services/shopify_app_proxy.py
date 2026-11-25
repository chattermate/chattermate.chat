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
widget's organization and a signed-in customer whose email the store has
verified, there is no token. A classic customer account can be opened with any
address, unconfirmed: that email names nobody.
"""

import hashlib
import hmac
import re
import time
from typing import Any, Callable, Dict, Mapping, Optional, Sequence, Tuple
from urllib.parse import urlencode

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
from app.services.feature_gate import plan_flag_on
from app.services.widget_plan import KNOWN_CUSTOMERS_FEATURE
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
  customer(id: $id) { email verifiedEmail firstName lastName }
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
    # Shopify signs a repeated key as one comma-joined value, but whoever reads it
    # takes one of the copies: a request that repeats any key is not taken at all.
    if not signature or any(len(joined) > 1 for joined in values.values()):
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
    if shop is not None:
        remember_storefront_prefix(db, shop, params)
    # Signed-in customers are a Pro plan's (widget_plan.py); a failed plan read
    # leaves the visitor anonymous
    if widget is None or not plan_flag_on(db, widget.organization_id, KNOWN_CUSTOMERS_FEATURE, otherwise=False):
        return None
    found = _customer(shop, customer_id) or {}
    email = found.get('email') or ''
    if not email or found.get('verifiedEmail') is not True:
        return None
    name = ' '.join(part for part in (found.get('firstName'), found.get('lastName')) if part) or None
    customer = CustomerRepository(db).identify(email=email, organization_id=widget.organization_id, full_name=name)
    # One revocable session per customer and widget, however many pages they open
    jti = get_existing_valid_token_jti(email, str(widget.id), str(customer.id))
    token, _, ttl = conversation_token.mint({
        # Top-level, where POST /generate-token can't write: only this mint vouches
        # that the store verified the email (store_verified_email)
        'source': SOURCE,
        'sub': str(customer.id),
        'widget_id': str(widget.id),
        'customer_email': email,
        'customer_name': name or customer.full_name,
        'customer_id': str(customer.id),
        # Which store customer it is for: the storefront drops it when another signs in
        'custom_data': {'source': SOURCE, 'shopify_customer_id': customer_id},
    }, ttl_seconds=TOKEN_TTL_SECONDS, jti=jti)
    return {'token': token, 'expires_in': ttl}


def store_verified_email(token_data: Optional[Mapping[str, Any]]) -> Optional[str]:
    """The email a signed-in store customer's conversation token carries, or None.
    Only identity_token sets the top-level source, and only for an email the store
    verified, so this email counts as proved like a code (email_proof.accept_store_sign_in)."""
    if not isinstance(token_data, Mapping) or token_data.get('source') != SOURCE:
        return None
    email = token_data.get('customer_email')
    return email if isinstance(email, str) and email else None


# ---- Actions: storefront forms posted through the App Proxy ----

# (db, the installed and linked store, the signed query, the posted fields) ->
# (HTTP status, JSON body). The store comes only from the signed query.
ProxyAction = Callable[[Session, ShopifyShop, Dict[str, str], Dict[str, Any]], Tuple[int, dict]]
_actions: Dict[str, ProxyAction] = {}
UNAVAILABLE = {'status': 'unavailable'}


def register_proxy_action(name: str, action: ProxyAction) -> None:
    """Answer POST /apps/<subpath>/<name> on the storefront (enterprise
    features register theirs at start)."""
    _actions[name] = action


def run_proxy_action(db: Session, name: str, query: Sequence[Tuple[str, str]],
                     fields: Dict[str, Any]) -> Tuple[int, dict]:
    """A signed storefront post: 404 for no such action, 401 for a bad or stale
    signature; a store that isn't installed and linked gets `unavailable`.
    Only the query is signed, so the posted fields are untrusted input."""
    action = _actions.get(name)
    if action is None:
        return 404, {'error': 'not_found'}
    if not signature_valid(query, settings.SHOPIFY_API_SECRET):
        return 401, {'error': 'invalid_signature'}
    params = dict(query)
    shop = ShopifyShopRepository(db).get_shop_by_domain(params.get('shop') or '')
    if shop is None or not shop.is_installed or shop.organization_id is None:
        return 200, dict(UNAVAILABLE)
    remember_storefront_prefix(db, shop, params)
    return action(db, shop, params, fields if isinstance(fields, dict) else {})


# ---- Pages: storefront pages served through the App Proxy ----

# Where the App Proxy lives on a storefront (shopify.app.toml: prefix/subpath), and
# under it the pages extensions register: /apps/chattermate/page/<name>
STOREFRONT_PREFIX = '/apps/chattermate'
PAGE_PATH = 'page'
# The paths Shopify lets a merchant move the proxy to: one of its four prefixes and a subpath
PROXY_PREFIX = re.compile(r'^/(apps|a|community|tools)/[A-Za-z0-9_-]{1,60}$')

# (db, the installed and linked store, the signed query, "GET" or "POST") ->
# (HTTP status, HTML). Shopify shows the HTML as it is, on the store's own domain.
ProxyPage = Callable[[Session, ShopifyShop, Dict[str, str], str], Tuple[int, str]]
_pages: Dict[str, ProxyPage] = {}
NOT_FOUND_PAGE = '<!doctype html><meta charset="utf-8"><title>Not found</title><p>This page doesn\'t exist.</p>'


def register_proxy_page(name: str, page: ProxyPage) -> None:
    """Serve GET and POST /apps/chattermate/page/<name> on the storefront
    (enterprise features register theirs at start)."""
    _pages[name] = page


def storefront_prefix(shop: ShopifyShop) -> str:
    """Where `shop`'s storefront has the App Proxy: the path Shopify last sent, or the default."""
    return shop.storefront_proxy_prefix or STOREFRONT_PREFIX


def remember_storefront_prefix(db: Session, shop: ShopifyShop, params: Mapping[str, str]) -> None:
    """Keep the proxy's path from a signed request (path_prefix is signed by
    Shopify), so links point where the merchant put it. Written only when it
    changes; a failed write never stops the request."""
    prefix = (params.get('path_prefix') or '').strip()
    if not PROXY_PREFIX.match(prefix) or prefix == storefront_prefix(shop):
        return
    try:
        shop.storefront_proxy_prefix = None if prefix == STOREFRONT_PREFIX else prefix
        db.commit()
    except Exception as e:
        db.rollback()
        logger.warning(f"Couldn't keep the App Proxy path for {shop.shop_domain}: {e}")


def storefront_page_url(store_url: str, name: str, params: Optional[Mapping[str, str]] = None,
                        prefix: str = STOREFRONT_PREFIX) -> str:
    """A registered page's address on the store's own domain, under its App Proxy path."""
    query = f"?{urlencode(params)}" if params else ''
    return f"{store_url.rstrip('/')}{prefix}/{PAGE_PATH}/{name}{query}"


def run_proxy_page(db: Session, name: str, query: Sequence[Tuple[str, str]], method: str) -> Tuple[int, str]:
    """A signed storefront page: 404 for no such page or a store that isn't
    installed and linked, 401 for a bad or stale signature."""
    page = _pages.get(name)
    if page is None:
        return 404, NOT_FOUND_PAGE
    if not signature_valid(query, settings.SHOPIFY_API_SECRET):
        return 401, NOT_FOUND_PAGE
    params = dict(query)
    shop = ShopifyShopRepository(db).get_shop_by_domain(params.get('shop') or '')
    if shop is None or not shop.is_installed or shop.organization_id is None:
        return 404, NOT_FOUND_PAGE
    remember_storefront_prefix(db, shop, params)
    return page(db, shop, params, method)

