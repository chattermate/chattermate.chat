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

import json
from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient

import app.main  # noqa: F401 — registers the shopify router on the app
from app.core.application import app
from app.database import get_db

# Shopify's three mandatory GDPR webhooks. They are unauthenticated apart from
# the HMAC, so what they say on failure is public.
WEBHOOKS = [
    "/api/v1/shopify/webhooks/customers/data_request",
    "/api/v1/shopify/webhooks/customers/redact",
    "/api/v1/shopify/webhooks/shop/redact",
]

VALID_PAYLOAD = {
    "shop_id": 1,
    "shop_domain": "example.myshopify.com",
    "customer": {"id": 2, "email": "someone@example.com", "phone": "+15550000000"},
    "orders_requested": [],
    "orders_to_redact": [],
}


@pytest.fixture
def client(db):
    def override_get_db():
        yield db

    app.dependency_overrides[get_db] = override_get_db
    yield TestClient(app, raise_server_exceptions=False)
    app.dependency_overrides.clear()


@pytest.fixture
def signed():
    """Accept the HMAC, so the tests exercise what happens after it."""
    with patch(
        "app.api.shopify.ShopifyHelperService.verify_shopify_webhook", return_value=True
    ) as verify:
        yield verify


@pytest.mark.parametrize("url", WEBHOOKS)
class TestShopifyGdprWebhooks:
    def test_an_unsigned_request_is_rejected(self, client, url):
        with patch(
            "app.api.shopify.ShopifyHelperService.verify_shopify_webhook", return_value=False
        ):
            response = client.post(url, json=VALID_PAYLOAD)

        assert response.status_code == 401

    def test_a_signed_request_is_acknowledged(self, client, signed, url):
        response = client.post(url, json=VALID_PAYLOAD)

        assert response.status_code == 200
        assert response.json()["success"] is True

    def test_malformed_json_is_a_400(self, client, signed, url):
        response = client.post(
            url, content=b"{not json", headers={"Content-Type": "application/json"}
        )

        assert response.status_code == 400

    def test_a_failure_does_not_echo_the_exception(self, client, signed, url):
        """A JSON array parses fine, then payload.get() raises inside the handler.

        The reply used to be f"Error processing webhook: {str(e)}", handing the
        caller our exception text on an endpoint that anyone on the internet can
        reach. Shopify only needs the acknowledgement.
        """
        response = client.post(
            url, content=json.dumps([]).encode(), headers={"Content-Type": "application/json"}
        )

        assert response.status_code == 200
        body = response.json()
        assert body["success"] is False
        assert body["message"] == "Error processing webhook"
        # The AttributeError's text must not travel with it.
        assert "attribute" not in response.text
        assert "list" not in response.text
