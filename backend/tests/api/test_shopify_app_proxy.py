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


A storefront's signed-in Shopify customer chats as themselves: the App Proxy
request is checked, and only then is a verified token minted.
"""

import hashlib
import hmac
import time
from types import SimpleNamespace
from unittest.mock import patch
from urllib.parse import parse_qsl, urlencode
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient

from app.models.shopify.shopify_shop import ShopifyShop
from app.services import conversation_token
from app.services import shopify_app_proxy as proxy

SECRET = "app-secret"
DOC_QUERY = ("extra=1&extra=2&shop=shop-name.myshopify.com&logged_in_customer_id=1"
             "&path_prefix=%2Fapps%2Fawesome_reviews&timestamp=1317327555"
             "&signature=4c68c8624d737112c91818c11017d24d334b524cb5c2b8ba08daa056f7395ddb")


def _signed(secret=SECRET, **params):
    params.setdefault("timestamp", str(int(time.time())))
    params.setdefault("path_prefix", "/apps/chattermate")
    message = "".join(sorted(f"{k}={v}" for k, v in params.items()))
    signature = hmac.new(secret.encode(), message.encode(), hashlib.sha256).hexdigest()
    return list(params.items()) + [("signature", signature)]


class TestSignature:
    def test_shopifys_documented_example(self):
        assert proxy.signature_valid(parse_qsl(DOC_QUERY), "hush", now=1317327555)

    def test_a_changed_parameter_breaks_it(self):
        tampered = DOC_QUERY.replace("logged_in_customer_id=1", "logged_in_customer_id=2")
        assert not proxy.signature_valid(parse_qsl(tampered), "hush", now=1317327555)

    @pytest.mark.parametrize("secret", ["", "other"])
    def test_another_or_no_secret(self, secret):
        assert not proxy.signature_valid(parse_qsl(DOC_QUERY), secret, now=1317327555)

    def test_no_signature(self):
        assert not proxy.signature_valid([("shop", "a.myshopify.com"), ("timestamp", "1")], SECRET, now=1)

    @pytest.mark.parametrize("age,ok", [(0, True), (proxy.MAX_AGE_SECONDS, True), (proxy.MAX_AGE_SECONDS + 1, False),
                                        (-proxy.MAX_AGE_SECONDS - 1, False)])
    def test_an_old_request_is_refused(self, age, ok):
        assert proxy.signature_valid(parse_qsl(DOC_QUERY), "hush", now=1317327555 + age) is ok

    def test_a_bad_timestamp(self):
        query = _signed(timestamp="soon", shop="a.myshopify.com")
        assert not proxy.signature_valid(query, SECRET)

    def test_sorted_as_whole_strings(self):
        """'a-b=…' sorts before 'a=…' ('-' < '='), though 'a' < 'a-b' as keys."""
        query = _signed(**{"a": "1", "a-b": "2", "shop": "s.myshopify.com"})
        assert proxy.signature_valid(query, SECRET)


@pytest.fixture
def store(db, test_widget):
    shop = ShopifyShop(id=str(uuid4()), shop_domain="demo.myshopify.com", access_token="t", is_installed=True,
                       organization_id=test_widget.organization_id)
    db.add(shop)
    db.commit()
    return shop


def _query(widget, **extra):
    return _signed(shop="demo.myshopify.com", widget_id=str(widget.id), logged_in_customer_id="77", **extra)


@pytest.fixture
def signed_in(monkeypatch):
    monkeypatch.setattr(proxy.settings, "SHOPIFY_API_SECRET", SECRET)
    seen = {}

    def customer(shop, customer_id):
        seen["asked"] = (shop.shop_domain, customer_id)
        return {"email": "jane@acme.com", "firstName": "Jane", "lastName": "Doe"}

    monkeypatch.setattr(proxy, "_customer", customer)
    monkeypatch.setattr(proxy, "get_existing_valid_token_jti", lambda *a: None)
    return seen


class TestToken:
    def test_a_signed_in_customer_gets_a_verified_token(self, db, test_widget, store, signed_in):
        result = proxy.identity_token(db, _query(test_widget))
        assert signed_in["asked"] == ("demo.myshopify.com", "77")
        claims = conversation_token.claims_ignoring_expiry(result["token"])
        assert claims["customer_email"] == "jane@acme.com" and claims["widget_id"] == str(test_widget.id)
        assert claims["customer_name"] == "Jane Doe"
        assert conversation_token.is_identified(claims)
        assert conversation_token.is_verified_scope(conversation_token.conversation_scope(claims))

    def test_a_visitor_not_signed_in_gets_none(self, db, test_widget, store, signed_in):
        query = [(k, v) for k, v in _signed(shop="demo.myshopify.com", widget_id=str(test_widget.id),
                                            logged_in_customer_id="")]
        assert proxy.identity_token(db, query) is None
        assert "asked" not in signed_in

    def test_a_forged_customer_id_gets_none(self, db, test_widget, store, signed_in):
        query = [(k, "999" if k == "logged_in_customer_id" else v) for k, v in _query(test_widget)]
        assert proxy.identity_token(db, query) is None
        assert "asked" not in signed_in

    def test_another_organizations_widget_gets_none(self, db, test_widget, store, signed_in):
        query = _signed(shop="demo.myshopify.com", widget_id=str(uuid4()), logged_in_customer_id="77")
        assert proxy.identity_token(db, query) is None

    @pytest.mark.parametrize("change", ["uninstalled", "unlinked", "unknown shop"])
    def test_a_store_that_is_not_installed_and_linked(self, db, test_widget, store, signed_in, change):
        if change == "uninstalled":
            store.is_installed = False
        elif change == "unlinked":
            store.organization_id = None
        db.commit()
        query = _query(test_widget) if change != "unknown shop" else _signed(
            shop="other.myshopify.com", widget_id=str(test_widget.id), logged_in_customer_id="77")
        assert proxy.identity_token(db, query) is None

    def test_no_secret_configured_means_no_token(self, db, test_widget, store, signed_in, monkeypatch):
        monkeypatch.setattr(proxy.settings, "SHOPIFY_API_SECRET", "")
        assert proxy.identity_token(db, _query(test_widget)) is None

    def test_a_customer_without_an_email(self, db, test_widget, store, signed_in, monkeypatch):
        monkeypatch.setattr(proxy, "_customer", lambda shop, customer_id: {"email": None})
        assert proxy.identity_token(db, _query(test_widget)) is None

    def test_a_widget_id_that_is_not_a_uuid(self, db, test_widget, store, signed_in):
        query = _signed(shop="demo.myshopify.com", widget_id="not-a-uuid", logged_in_customer_id="77")
        assert proxy.identity_token(db, query) is None


class TestRoute:
    def test_answers_never_cached(self, monkeypatch):
        from app.main import app
        monkeypatch.setattr(proxy, "identity_token", lambda db, query: {"token": "t", "expires_in": 3600})
        response = TestClient(app).get("/api/v1/shopify/proxy/identity?" + urlencode(
            {"shop": "demo.myshopify.com", "signature": "x"}))
        assert response.status_code == 200
        assert response.json() == {"token": "t", "expires_in": 3600}
        assert "no-store" in response.headers["cache-control"]

    def test_a_failure_reads_as_no_token(self, monkeypatch):
        from app.main import app

        def broken(db, query):
            raise RuntimeError("db down")

        monkeypatch.setattr(proxy, "identity_token", broken)
        response = TestClient(app).get("/api/v1/shopify/proxy/identity")
        assert response.json() == {"token": None}
