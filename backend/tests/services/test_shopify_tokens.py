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

import threading
import time
from datetime import timedelta
from unittest.mock import MagicMock, patch

import pytest
import requests

from sqlalchemy.exc import IntegrityError

from app.core.config import settings
from app.models.shopify import ShopifyShop
from app.services import shopify_tokens
from app.services.shopify_tokens import (
    OFFLINE_TOKEN_TYPE,
    ShopifyReauthRequired,
    ShopifyTokenError,
    call_admin_api,
    call_admin_api_async,
    get_access_token,
)

SHOP = "token-test.myshopify.com"
NEW_TOKEN = {
    "access_token": "shpat_new", "scope": "read_orders", "expires_in": 3600,
    "refresh_token": "shprt_new", "refresh_token_expires_in": 7776000,
}


def now():
    return shopify_tokens._utcnow()


def token_response(status=200, body=None, text=""):
    return MagicMock(status_code=status, text=text or str(body), json=MagicMock(return_value=body or {}))


@pytest.fixture(autouse=True)
def fresh_module_state(monkeypatch):
    shopify_tokens._migration_failed_at.clear()
    shopify_tokens._dead_refresh_tokens.clear()
    monkeypatch.setattr(settings, "SHOPIFY_MIGRATE_LEGACY_TOKENS", True)
    yield
    shopify_tokens._migration_failed_at.clear()
    shopify_tokens._dead_refresh_tokens.clear()


@pytest.fixture
def token_endpoint():
    with patch("app.services.shopify_tokens.requests.post") as post:
        post.return_value = token_response(body=NEW_TOKEN)
        yield post


def add_shop(db, **columns) -> ShopifyShop:
    shop = ShopifyShop(shop_domain=SHOP, is_installed=True, **columns)
    db.add(shop)
    db.commit()
    return shop


def expiring_shop(db, expires_in=timedelta(minutes=-1)) -> ShopifyShop:
    return add_shop(db, access_token="shpat_old", refresh_token="shprt_old",
                    access_token_expires_at=now() + expires_in,
                    refresh_token_expires_at=now() + timedelta(days=80))


def stored(db) -> ShopifyShop:
    db.expire_all()
    return db.query(ShopifyShop).filter_by(shop_domain=SHOP).one()


# --- Refresh ---------------------------------------------------------------------

def test_a_fresh_token_is_used_without_calling_shopify(db, token_endpoint):
    shop = expiring_shop(db, expires_in=timedelta(minutes=30))

    assert get_access_token(shop) == "shpat_old"
    token_endpoint.assert_not_called()


def test_an_expiring_token_is_refreshed_and_the_rotated_refresh_token_stored(db, token_endpoint):
    shop = expiring_shop(db, expires_in=timedelta(minutes=2))  # inside the refresh margin

    assert get_access_token(shop) == "shpat_new"

    sent = token_endpoint.call_args.kwargs["data"]
    assert sent["grant_type"] == "refresh_token"
    assert sent["refresh_token"] == "shprt_old"
    row = stored(db)
    assert (row.access_token, row.refresh_token) == ("shpat_new", "shprt_new")
    assert row.access_token_expires_at > now() + timedelta(minutes=55)
    assert row.refresh_token_expires_at > now() + timedelta(days=89)


def test_refreshing_updates_the_callers_instance_without_dirtying_its_session(db, token_endpoint):
    """The caller's session must not later write these values back over a newer refresh."""
    shop = expiring_shop(db)

    get_access_token(shop)

    assert shop.access_token == "shpat_new" and shop.refresh_token == "shprt_new"
    assert shop not in db.dirty


def test_a_refresh_answer_without_scope_keeps_the_stored_scope(db, token_endpoint):
    token_endpoint.return_value = token_response(body={k: v for k, v in NEW_TOKEN.items() if k != "scope"})
    shop = expiring_shop(db)
    shop.scope = "read_products"
    db.commit()

    get_access_token(shop)

    assert stored(db).scope == "read_products"


def test_a_dead_refresh_token_asks_for_reauth_and_leaves_the_row_alone(db, token_endpoint):
    token_endpoint.return_value = token_response(401, {"error": "invalid_request"})
    shop = expiring_shop(db)

    with pytest.raises(ShopifyReauthRequired):
        get_access_token(shop)

    row = stored(db)
    assert (row.access_token, row.refresh_token) == ("shpat_old", "shprt_old")


def test_a_dead_refresh_token_is_not_sent_again(db, token_endpoint):
    """Retrying a refresh token Shopify refused can't succeed: later callers
    fail fast instead of calling Shopify on every request."""
    token_endpoint.return_value = token_response(401, {"error": "invalid_request"})
    shop = expiring_shop(db)

    for _ in range(3):
        with pytest.raises(ShopifyReauthRequired):
            get_access_token(shop)

    assert token_endpoint.call_count == 1


def test_an_expired_refresh_token_is_not_sent(db, token_endpoint):
    shop = expiring_shop(db)
    shop.refresh_token_expires_at = now() - timedelta(minutes=1)
    db.commit()

    with pytest.raises(ShopifyReauthRequired):
        get_access_token(shop)
    token_endpoint.assert_not_called()


def test_a_new_token_revives_a_shop_whose_refresh_token_died(db, token_endpoint):
    token_endpoint.return_value = token_response(401, {"error": "invalid_request"})
    shop = expiring_shop(db)
    with pytest.raises(ShopifyReauthRequired):
        get_access_token(shop)

    token_endpoint.return_value = token_response(body=NEW_TOKEN)
    shopify_tokens.acquire_token(db, SHOP, lambda: shopify_tokens.exchange_session_token(SHOP, "session"))
    db.query(ShopifyShop).filter_by(shop_domain=SHOP).update(
        {"access_token_expires_at": now() - timedelta(minutes=1)})
    db.commit()
    token_endpoint.return_value = token_response(body={**NEW_TOKEN, "access_token": "shpat_newer"})

    assert get_access_token(stored(db)) == "shpat_newer"


def test_a_transient_refresh_failure_keeps_using_a_token_that_has_not_expired(db, token_endpoint):
    token_endpoint.return_value = token_response(503, text="unavailable")
    shop = expiring_shop(db, expires_in=timedelta(minutes=2))

    assert get_access_token(shop) == "shpat_old"
    assert stored(db).refresh_token == "shprt_old"


def test_a_transient_refresh_failure_with_an_expired_token_is_raised(db, token_endpoint):
    token_endpoint.side_effect = requests.ConnectionError("down")
    shop = expiring_shop(db, expires_in=timedelta(minutes=-1))

    with pytest.raises(ShopifyTokenError) as exc_info:
        get_access_token(shop)
    assert not isinstance(exc_info.value, ShopifyReauthRequired)


def test_a_store_with_no_row_left_asks_for_reauth(db, token_endpoint):
    shop = ShopifyShop(shop_domain=SHOP, access_token="shpat_old", refresh_token="shprt_old",
                       access_token_expires_at=now() - timedelta(minutes=1))

    with pytest.raises(ShopifyReauthRequired):
        get_access_token(shop)
    token_endpoint.assert_not_called()


def test_concurrent_callers_refresh_once_and_share_the_new_token(db, token_endpoint):
    """Each refresh retires the refresh token it used, so a second refresh in
    parallel would fail; waiters must pick up the first one's result."""
    expiring_shop(db)

    def slow_refresh(*args, **kwargs):
        time.sleep(0.05)
        return token_response(body=NEW_TOKEN)
    token_endpoint.side_effect = slow_refresh

    results, errors = [], []

    def worker():
        # Each caller has its own (stale) copy of the row, as separate requests would.
        mine = ShopifyShop(shop_domain=SHOP, access_token="shpat_old", refresh_token="shprt_old",
                           access_token_expires_at=now() - timedelta(minutes=1))
        try:
            results.append(get_access_token(mine))
        except Exception as e:  # pragma: no cover - reported below
            errors.append(e)

    threads = [threading.Thread(target=worker) for _ in range(8)]
    for t in threads:
        t.start()
    for t in threads:
        t.join()

    assert errors == []
    assert results == ["shpat_new"] * 8
    assert token_endpoint.call_count == 1


# --- 401 from the Admin API --------------------------------------------------------

def test_a_401_refreshes_once_and_retries_with_the_new_token(db, token_endpoint):
    shop = expiring_shop(db, expires_in=timedelta(minutes=30))  # looks fresh, but revoked
    sent_with = []

    def send(token):
        sent_with.append(token)
        return MagicMock(status_code=401 if token == "shpat_old" else 200, text="")

    response = call_admin_api(shop, send)

    assert response.status_code == 200
    assert sent_with == ["shpat_old", "shpat_new"]
    assert token_endpoint.call_count == 1


def test_a_401_for_a_token_someone_already_replaced_uses_theirs(db, token_endpoint):
    expiring_shop(db, expires_in=timedelta(minutes=30))
    db.query(ShopifyShop).filter_by(shop_domain=SHOP).update({"access_token": "shpat_by_other_worker"})
    db.commit()
    stale = ShopifyShop(shop_domain=SHOP, access_token="shpat_old", refresh_token="shprt_old",
                        access_token_expires_at=now() + timedelta(minutes=30))

    assert get_access_token(stale, rejected_token="shpat_old") == "shpat_by_other_worker"
    token_endpoint.assert_not_called()


def test_a_replacement_token_that_is_itself_expired_is_renewed(db, token_endpoint):
    expiring_shop(db, expires_in=timedelta(minutes=-10))
    db.query(ShopifyShop).filter_by(shop_domain=SHOP).update({"access_token": "shpat_by_other_worker"})
    db.commit()
    stale = ShopifyShop(shop_domain=SHOP, access_token="shpat_old", refresh_token="shprt_old",
                        access_token_expires_at=now() + timedelta(minutes=30))

    assert get_access_token(stale, rejected_token="shpat_old") == "shpat_new"
    assert token_endpoint.call_count == 1


def test_a_200_response_body_is_not_read_for_the_rejection_check(db, token_endpoint):
    shop = expiring_shop(db, expires_in=timedelta(minutes=30))
    response = MagicMock(status_code=200)
    type(response).text = property(lambda self: pytest.fail("body decoded for a 200"))

    assert call_admin_api(shop, lambda token: response) is response


def test_a_401_that_cannot_be_renewed_returns_shopifys_answer(db, token_endpoint):
    token_endpoint.return_value = token_response(401, {"error": "invalid_request"})
    shop = expiring_shop(db, expires_in=timedelta(minutes=30))
    send = MagicMock(return_value=MagicMock(status_code=401, text="Unauthorized"))

    response = call_admin_api(shop, send)

    assert response.status_code == 401
    assert send.call_count == 1


@pytest.mark.asyncio
async def test_the_async_caller_also_refreshes_and_retries_on_401(db, token_endpoint):
    shop = expiring_shop(db, expires_in=timedelta(minutes=30))
    sent_with = []

    async def send(token):
        sent_with.append(token)
        return (401, "") if token == "shpat_old" else (200, '{"data": {}}')

    assert await call_admin_api_async(shop, send) == (200, '{"data": {}}')
    assert sent_with == ["shpat_old", "shpat_new"]


# --- Legacy (non-expiring) tokens -----------------------------------------------------

def test_a_legacy_token_is_exchanged_for_an_expiring_one_on_first_use(db, token_endpoint):
    shop = add_shop(db, access_token="shpat_legacy")

    assert get_access_token(shop) == "shpat_new"

    sent = token_endpoint.call_args.kwargs["data"]
    assert sent["grant_type"] == "urn:ietf:params:oauth:grant-type:token-exchange"
    assert sent["subject_token"] == "shpat_legacy"
    assert sent["subject_token_type"] == OFFLINE_TOKEN_TYPE
    assert sent["requested_token_type"] == OFFLINE_TOKEN_TYPE
    assert sent["expiring"] == "1"
    row = stored(db)
    assert (row.access_token, row.refresh_token) == ("shpat_new", "shprt_new")
    assert row.access_token_expires_at is not None


def test_a_failed_migration_keeps_the_legacy_token_and_backs_off(db, token_endpoint):
    token_endpoint.return_value = token_response(503, text="unavailable")
    shop = add_shop(db, access_token="shpat_legacy")

    assert get_access_token(shop) == "shpat_legacy"
    assert get_access_token(shop) == "shpat_legacy"
    assert token_endpoint.call_count == 1  # the second use waits out the back-off
    assert stored(db).refresh_token is None


def test_migration_is_retried_after_the_back_off(db, token_endpoint):
    shop = add_shop(db, access_token="shpat_legacy")
    shopify_tokens._migration_failed_at[SHOP] = now() - shopify_tokens.MIGRATION_RETRY_AFTER

    assert get_access_token(shop) == "shpat_new"


def test_a_legacy_token_shopify_no_longer_accepts_is_migrated_and_retried(db, token_endpoint):
    """From April 2027 Shopify answers 403 to non-expiring tokens."""
    shop = add_shop(db, access_token="shpat_legacy")
    shopify_tokens._migration_failed_at[SHOP] = now()  # skip the proactive migration
    sent_with = []

    def send(token):
        sent_with.append(token)
        if token == "shpat_legacy":
            return MagicMock(status_code=403, text='{"errors":"Non-expiring access tokens are no longer accepted for the Admin API"}')
        return MagicMock(status_code=200, text="")

    assert call_admin_api(shop, send).status_code == 200
    assert sent_with == ["shpat_legacy", "shpat_new"]


def test_migration_can_be_paused(db, token_endpoint, monkeypatch):
    monkeypatch.setattr(settings, "SHOPIFY_MIGRATE_LEGACY_TOKENS", False)
    shop = add_shop(db, access_token="shpat_legacy")

    assert get_access_token(shop) == "shpat_legacy"
    token_endpoint.assert_not_called()


# --- New tokens ---------------------------------------------------------------------

def test_acquiring_for_a_new_store_another_process_just_created_keeps_our_token(db, token_endpoint):
    """Two first loads of a new install: the other process inserted the row
    between our lock (no row yet) and our insert. Our token is the newer one."""
    real_commit = db.commit
    calls = {"n": 0}

    def commit_after_rival_insert():
        calls["n"] += 1
        if calls["n"] == 1:
            db.rollback()
            db.add(ShopifyShop(shop_domain=SHOP, is_installed=True, access_token="shpat_rival",
                               refresh_token="shprt_rival"))
            real_commit()
            raise IntegrityError("insert", {}, Exception("duplicate shop_domain"))
        real_commit()

    db.commit = commit_after_rival_insert
    try:
        shopify_tokens.acquire_token(db, SHOP, lambda: shopify_tokens.exchange_session_token(SHOP, "session"))
    finally:
        db.commit = real_commit

    row = stored(db)
    assert (row.access_token, row.refresh_token) == ("shpat_new", "shprt_new")
    assert db.query(ShopifyShop).count() == 1


# --- Keep-alive -----------------------------------------------------------------------

def test_keep_alive_renews_a_refresh_token_that_is_getting_old(db, token_endpoint):
    shop = expiring_shop(db, expires_in=timedelta(minutes=30))
    shop.refresh_token_expires_at = now() + timedelta(days=20)
    db.commit()

    assert shopify_tokens.keep_alive(shop) is True
    assert stored(db).refresh_token == "shprt_new"


def test_a_request_never_refreshes_just_because_the_refresh_token_is_old(db, token_endpoint):
    """Only the sweep looks at the refresh token's age, so a short-lived refresh
    token can't turn every request into a refresh."""
    shop = expiring_shop(db, expires_in=timedelta(minutes=30))
    shop.refresh_token_expires_at = now() + timedelta(days=20)
    db.commit()

    assert get_access_token(shop) == "shpat_old"
    token_endpoint.assert_not_called()


def test_keep_alive_leaves_healthy_tokens_alone(db, token_endpoint):
    shop = expiring_shop(db, expires_in=timedelta(minutes=30))

    assert shopify_tokens.keep_alive(shop) is False
    token_endpoint.assert_not_called()


def test_the_sweep_migrates_idle_legacy_stores_and_reports_dead_ones(db, token_endpoint):
    from app.workers.shopify_token_keepalive import keep_tokens_alive
    add_shop(db, access_token="shpat_legacy")
    dead = ShopifyShop(shop_domain="dead.myshopify.com", is_installed=True, access_token="shpat_x",
                       refresh_token="shprt_x", access_token_expires_at=now() - timedelta(hours=2),
                       refresh_token_expires_at=now() - timedelta(days=1))
    healthy = ShopifyShop(shop_domain="fine.myshopify.com", is_installed=True, access_token="shpat_y",
                          refresh_token="shprt_y", access_token_expires_at=now() + timedelta(minutes=30),
                          refresh_token_expires_at=now() + timedelta(days=85))
    uninstalled = ShopifyShop(shop_domain="gone.myshopify.com", is_installed=False, access_token="shpat_z")
    db.add_all([dead, healthy, uninstalled])
    db.commit()

    assert keep_tokens_alive() == {"renewed": 1, "reauth_required": 1, "failed": 0}
    assert token_endpoint.call_args.kwargs["data"]["subject_token"] == "shpat_legacy"
    assert stored(db).refresh_token == "shprt_new"


def test_one_failing_store_does_not_stop_the_sweep(db, token_endpoint):
    from app.workers.shopify_token_keepalive import keep_tokens_alive
    add_shop(db, access_token="shpat_legacy")
    db.add(ShopifyShop(shop_domain="other.myshopify.com", is_installed=True, access_token="shpat_o",
                       refresh_token="shprt_o", access_token_expires_at=now() - timedelta(hours=1)))
    db.commit()

    def answer(url, **kwargs):
        if "other.myshopify.com" in url:
            raise RuntimeError("boom")
        return token_response(body=NEW_TOKEN)
    token_endpoint.side_effect = answer

    counts = keep_tokens_alive()

    assert counts["renewed"] == 1
    assert counts["failed"] == 1


def test_acquiring_a_token_replaces_the_stored_pair(db, token_endpoint):
    expiring_shop(db, expires_in=timedelta(minutes=30))

    shop = shopify_tokens.acquire_token(db, SHOP, lambda: shopify_tokens.exchange_authorization_code(SHOP, "code"))

    assert token_endpoint.call_args.kwargs["data"]["expiring"] == "1"
    assert (shop.access_token, shop.refresh_token, shop.is_installed) == ("shpat_new", "shprt_new", True)
    assert db.query(ShopifyShop).count() == 1
