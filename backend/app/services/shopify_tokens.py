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

# Shopify expiring offline access tokens.
#
# Every token we ask Shopify for is an expiring offline token (`expiring=1`):
# the access token lasts an hour and comes with a refresh token that lasts 90
# days and rotates on every use. Admin API callers get a token through
# `get_access_token` (or `call_admin_api`), which refreshes it shortly before
# it expires and again if Shopify answers 401.
#
# Rows from before this hold a non-expiring token and no refresh token. The
# first time one is used it is exchanged for an expiring token; Shopify then
# invalidates the old one. Until the exchange succeeds the old token keeps
# being used, as it still works.
#
# Only one refresh per shop may run at a time: each refresh retires the refresh
# token it used, so two at once leave one caller holding a dead token. A
# thread lock serialises refreshes within a process and a row lock
# (SELECT ... FOR UPDATE) across processes. Inside the lock the row is re-read,
# so a caller that waited finds the token already renewed and uses it.

import threading
from contextlib import contextmanager
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from typing import Any, Awaitable, Callable, Dict, Iterator, Optional, Tuple

import requests
from fastapi.concurrency import run_in_threadpool
from sqlalchemy.orm import Session
from sqlalchemy.orm.attributes import set_committed_value

from app import database
from app.core.config import settings
from app.core.logger import get_logger
from app.models.shopify.shopify_shop import ShopifyShop
from app.services.shopify_urls import shopify_oauth_token_url

logger = get_logger(__name__)

TOKEN_EXCHANGE_GRANT = "urn:ietf:params:oauth:grant-type:token-exchange"
ID_TOKEN_TYPE = "urn:ietf:params:oauth:token-type:id_token"
OFFLINE_TOKEN_TYPE = "urn:shopify:params:oauth:token-type:offline-access-token"
REFRESH_TOKEN_GRANT = "refresh_token"

# Renew this long before the access token expires, so a request started just
# before expiry doesn't carry a token that lapses in flight.
REFRESH_MARGIN = timedelta(minutes=5)
TOKEN_REQUEST_TIMEOUT_SECONDS = 15
# After a failed legacy-token exchange, keep using the old token this long
# before trying again, rather than calling Shopify on every request.
MIGRATION_RETRY_AFTER = timedelta(minutes=15)

# Shopify's 403 body once it stops accepting non-expiring tokens (April 2027).
NON_EXPIRING_REJECTED = "Non-expiring access tokens are no longer accepted"

TOKEN_COLUMNS = ("access_token", "refresh_token", "access_token_expires_at", "refresh_token_expires_at", "scope")


class ShopifyTokenError(Exception):
    """Shopify did not issue a token. Transient unless it is a ShopifyReauthRequired."""

    def __init__(self, message: str, status_code: Optional[int] = None):
        super().__init__(message)
        self.status_code = status_code


class ShopifyReauthRequired(ShopifyTokenError):
    """The stored credentials are dead (uninstalled, revoked or a retired refresh
    token). Retrying won't help; the merchant must open the app again, which
    runs the session-token exchange and stores a new token."""


@dataclass(frozen=True)
class IssuedToken:
    access_token: str
    scope: Optional[str]
    refresh_token: Optional[str]
    access_token_expires_at: Optional[datetime]
    refresh_token_expires_at: Optional[datetime]

    @classmethod
    def from_response(cls, data: Dict[str, Any], now: datetime) -> "IssuedToken":
        return cls(
            access_token=data["access_token"],
            scope=data.get("scope"),
            refresh_token=data.get("refresh_token"),
            access_token_expires_at=_expiry(now, data.get("expires_in")),
            refresh_token_expires_at=_expiry(now, data.get("refresh_token_expires_in")),
        )

    def apply_to(self, shop: ShopifyShop) -> None:
        """Store on the row. A refresh answer may leave out scope; keep the old one then."""
        shop.access_token = self.access_token
        shop.refresh_token = self.refresh_token
        shop.access_token_expires_at = self.access_token_expires_at
        shop.refresh_token_expires_at = self.refresh_token_expires_at
        if self.scope:
            shop.scope = self.scope


def _utcnow() -> datetime:
    """Naive UTC, matching the DateTime columns."""
    return datetime.now(timezone.utc).replace(tzinfo=None)


def _expiry(now: datetime, seconds: Any) -> Optional[datetime]:
    try:
        return now + timedelta(seconds=int(seconds)) if seconds is not None else None
    except (TypeError, ValueError):
        return None


# --- Token endpoint -----------------------------------------------------------

def _is_terminal(status_code: int, error: Optional[str]) -> bool:
    """401 is Shopify's answer for an unknown, replaced, expired or revoked
    refresh token; invalid_subject_token means the token we tried to exchange
    is no longer valid. Neither improves on retry."""
    return status_code == 401 or error in ("invalid_subject_token", "invalid_grant")


def request_token(shop_domain: str, params: Dict[str, str]) -> IssuedToken:
    """POST to the shop's token endpoint with our client credentials."""
    body = {
        "client_id": settings.SHOPIFY_API_KEY,
        "client_secret": settings.SHOPIFY_API_SECRET,
        **params,
    }
    now = _utcnow()
    try:
        response = requests.post(
            shopify_oauth_token_url(shop_domain),
            data=body,
            verify=settings.VERIFY_SSL_CERTIFICATES,
            timeout=TOKEN_REQUEST_TIMEOUT_SECONDS,
        )
    except requests.RequestException as e:
        raise ShopifyTokenError(f"Shopify token request failed: {e}") from e

    if response.status_code != 200:
        try:
            error = (response.json() or {}).get("error")
        except ValueError:
            error = None
        message = f"Shopify token request failed ({response.status_code}): {error or response.text[:200]}"
        error_class = ShopifyReauthRequired if _is_terminal(response.status_code, error) else ShopifyTokenError
        raise error_class(message, status_code=response.status_code)

    try:
        data = response.json()
    except ValueError as e:
        raise ShopifyTokenError("Shopify token response was not JSON", status_code=200) from e
    if not data.get("access_token"):
        raise ShopifyTokenError("Shopify token response had no access_token", status_code=200)
    return IssuedToken.from_response(data, now)


def exchange_session_token(shop_domain: str, session_token: str) -> IssuedToken:
    """An expiring offline token for the shop whose embedded app sent `session_token`."""
    return request_token(shop_domain, {
        "grant_type": TOKEN_EXCHANGE_GRANT,
        "subject_token": session_token,
        "subject_token_type": ID_TOKEN_TYPE,
        "requested_token_type": OFFLINE_TOKEN_TYPE,
        "expiring": "1",
    })


def exchange_authorization_code(shop_domain: str, code: str) -> IssuedToken:
    """An expiring offline token for an authorization-code grant."""
    return request_token(shop_domain, {"code": code, "expiring": "1"})


def refresh_access_token(shop_domain: str, refresh_token: str) -> IssuedToken:
    """A new access token and a new (rotated) refresh token."""
    return request_token(shop_domain, {"grant_type": REFRESH_TOKEN_GRANT, "refresh_token": refresh_token})


def migrate_legacy_token(shop_domain: str, legacy_token: str) -> IssuedToken:
    """Swap a non-expiring offline token for an expiring one. Shopify invalidates
    the old token; repeating the request within seven days returns the same pair,
    so a response lost before we stored it is recovered by trying again."""
    return request_token(shop_domain, {
        "grant_type": TOKEN_EXCHANGE_GRANT,
        "subject_token": legacy_token,
        "subject_token_type": OFFLINE_TOKEN_TYPE,
        "requested_token_type": OFFLINE_TOKEN_TYPE,
        "expiring": "1",
    })


# --- Per-shop serialisation ---------------------------------------------------

_shop_locks: Dict[str, threading.Lock] = {}
_shop_locks_guard = threading.Lock()
_migration_failed_at: Dict[str, datetime] = {}


@contextmanager
def shop_token_lock(shop_domain: str) -> Iterator[None]:
    """Hold this process's lock for the shop's token. Pair it with
    `lock_shop_row` for the lock across processes."""
    with _shop_locks_guard:
        lock = _shop_locks.setdefault(shop_domain, threading.Lock())
    with lock:
        yield


def lock_shop_row(db: Session, shop_domain: str) -> Optional[ShopifyShop]:
    """The shop's row, freshly read and locked until `db` commits or rolls back."""
    return (
        db.query(ShopifyShop)
        .filter(ShopifyShop.shop_domain == shop_domain)
        .with_for_update()
        .populate_existing()
        .first()
    )


def acquire_token(db: Session, shop_domain: str, issue: Callable[[], IssuedToken]) -> ShopifyShop:
    """Get a new token with `issue` (session-token exchange or code grant) and
    store it on the shop's row, creating the row for a new install.

    Runs under the same locks as a refresh: a new token retires every other
    refresh token for the store, so it must not overlap one."""
    with shop_token_lock(shop_domain):
        shop = lock_shop_row(db, shop_domain)
        try:
            issued = issue()
        except Exception:
            db.rollback()
            raise
        if shop is None:
            shop = ShopifyShop(shop_domain=shop_domain)
            db.add(shop)
        issued.apply_to(shop)
        shop.is_installed = True
        db.commit()
        db.refresh(shop)
        _migration_failed_at.pop(shop_domain, None)
        return shop


# --- Using a token ------------------------------------------------------------

def _is_legacy(shop: ShopifyShop) -> bool:
    return bool(shop.access_token) and not shop.refresh_token


def needs_renewal(shop: ShopifyShop, now: Optional[datetime] = None) -> bool:
    """True when the stored token should be refreshed (or migrated) before use."""
    if not shop.access_token:
        return False
    now = now or _utcnow()
    if _is_legacy(shop):
        if not settings.SHOPIFY_MIGRATE_LEGACY_TOKENS:
            return False
        failed_at = _migration_failed_at.get(shop.shop_domain)
        return failed_at is None or now - failed_at >= MIGRATION_RETRY_AFTER
    expires_at = shop.access_token_expires_at
    return expires_at is None or expires_at - REFRESH_MARGIN <= now


def _renew(shop: ShopifyShop, rejected: bool) -> Optional[IssuedToken]:
    """A new token for the locked row, or None to keep the current one.

    `rejected`: Shopify refused the current access token, so keeping it is no
    use and a failure is raised instead."""
    if _is_legacy(shop):
        if not settings.SHOPIFY_MIGRATE_LEGACY_TOKENS:
            # Shopify refused a non-expiring token; only the merchant reopening
            # the app gets a new one while migration is paused.
            raise ShopifyReauthRequired(f"Shopify rejected the non-expiring token for {shop.shop_domain}")
        try:
            issued = migrate_legacy_token(shop.shop_domain, shop.access_token)
        except ShopifyTokenError as e:
            _migration_failed_at[shop.shop_domain] = _utcnow()
            if rejected:
                raise
            logger.warning(f"Could not migrate {shop.shop_domain} to an expiring token, still using the old one: {e}")
            return None
        _migration_failed_at.pop(shop.shop_domain, None)
        logger.info(f"Migrated {shop.shop_domain} to an expiring offline token")
        return issued

    try:
        return refresh_access_token(shop.shop_domain, shop.refresh_token)
    except ShopifyReauthRequired:
        logger.error(f"Shopify refresh token for {shop.shop_domain} is no longer valid; the merchant must reopen the app")
        raise
    except ShopifyTokenError as e:
        still_valid = shop.access_token_expires_at is not None and shop.access_token_expires_at > _utcnow()
        if rejected or not still_valid:
            raise
        logger.warning(f"Shopify token refresh for {shop.shop_domain} failed, using the current token until it expires: {e}")
        return None


def _mirror(target: ShopifyShop, source: ShopifyShop) -> None:
    """Copy the token columns onto the caller's instance without marking it
    dirty: a later commit of the caller's session must not write these values
    back over a newer refresh."""
    if target is source:
        return
    for column in TOKEN_COLUMNS:
        set_committed_value(target, column, getattr(source, column))


def get_access_token(shop: ShopifyShop, *, rejected_token: Optional[str] = None) -> str:
    """A usable access token for `shop`, renewing the stored one first if it is
    due. Pass `rejected_token` after Shopify answered 401 to it.

    Renewal uses its own session, so it never commits the caller's work and
    `shop` may be detached."""
    if rejected_token is None and not needs_renewal(shop):
        return shop.access_token

    with shop_token_lock(shop.shop_domain), Session(bind=database.engine, autoflush=False) as db:
        row = lock_shop_row(db, shop.shop_domain)
        if row is None or not row.access_token:
            db.rollback()
            raise ShopifyReauthRequired(f"No Shopify token stored for {shop.shop_domain}")

        if rejected_token is not None:
            # Someone renewed it while we waited: theirs is the one to use.
            due = row.access_token == rejected_token
        else:
            due = needs_renewal(row)

        issued = _renew(row, rejected=rejected_token is not None) if due else None
        if issued is not None:
            issued.apply_to(row)
        db.commit()
        _mirror(shop, row)
        return row.access_token


async def get_access_token_async(shop: ShopifyShop, *, rejected_token: Optional[str] = None) -> str:
    """`get_access_token` for async callers: renewal blocks, so it runs off the loop."""
    if rejected_token is None and not needs_renewal(shop):
        return shop.access_token
    return await run_in_threadpool(get_access_token, shop, rejected_token=rejected_token)


def admin_headers(access_token: str) -> Dict[str, str]:
    """Headers for an Admin API JSON request."""
    return {
        "X-Shopify-Access-Token": access_token,
        "Content-Type": "application/json",
        "Accept": "application/json",
    }


def is_token_rejected(status_code: int, body: str) -> bool:
    """Shopify refused the token itself, as opposed to the request."""
    return status_code == 401 or (status_code == 403 and NON_EXPIRING_REJECTED in (body or ""))


def call_admin_api(shop: ShopifyShop, send: Callable[[str], requests.Response]) -> requests.Response:
    """Run `send(access_token)` — one Admin API request — with a fresh token,
    renewing once and retrying if Shopify rejects the token. If renewal fails
    the rejected response is returned for the caller's usual error handling."""
    token = get_access_token(shop)
    response = send(token)
    if not is_token_rejected(response.status_code, response.text):
        return response
    try:
        token = get_access_token(shop, rejected_token=token)
    except ShopifyTokenError as e:
        logger.error(f"Shopify rejected the token for {shop.shop_domain} and it could not be renewed: {e}")
        return response
    return send(token)


async def call_admin_api_async(
    shop: ShopifyShop, send: Callable[[str], Awaitable[Tuple[int, str]]]
) -> Tuple[int, str]:
    """`call_admin_api` for async callers; `send` returns (status, body text)."""
    token = await get_access_token_async(shop)
    status, body = await send(token)
    if not is_token_rejected(status, body):
        return status, body
    try:
        token = await get_access_token_async(shop, rejected_token=token)
    except ShopifyTokenError as e:
        logger.error(f"Shopify rejected the token for {shop.shop_domain} and it could not be renewed: {e}")
        return status, body
    return await send(token)
