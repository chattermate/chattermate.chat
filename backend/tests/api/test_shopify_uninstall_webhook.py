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

The app/uninstalled webhook against a real database. Shopify's payload is the
shop object: `domain` is the store's primary domain (a custom domain once the
merchant has one), while shops are stored by their .myshopify.com domain.
"""

import json
from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient

import app.main  # noqa: F401 — registers the shopify router on the app
from app.api.shopify import _uninstalled_shop_domain
from app.core.application import app
from app.database import get_db
from app.models.shopify.agent_shopify_config import AgentShopifyConfig
from app.models.shopify.shopify_compliance_event import ShopifyComplianceEvent
from app.models.shopify.shopify_shop import ShopifyShop
from app.services import shopify_privacy

SHOP = "kite-store.myshopify.com"
CUSTOM = "www.kite-store.com"
URL = "/api/v1/shopify/webhooks/app-uninstalled"


@pytest.fixture
def client(db):
    def override_get_db():
        yield db

    app.dependency_overrides[get_db] = override_get_db
    yield TestClient(app, raise_server_exceptions=False)
    app.dependency_overrides.clear()


@pytest.fixture(autouse=True)
def signed():
    with patch("app.api.shopify.ShopifyHelperService.verify_shopify_webhook", return_value=True):
        yield


@pytest.fixture(autouse=True)
def storefronts():
    with patch("app.api.shopify.refresh_allowed_storefronts") as refresh:
        yield refresh


def add_shop(db, domain=SHOP, organization_id=None):
    row = ShopifyShop(shop_domain=domain, is_installed=True, access_token="shpat_x",
                      organization_id=organization_id)
    db.add(row)
    db.commit()
    return row


def shop_payload(domain=CUSTOM, myshopify_domain=SHOP):
    """The fields of Shopify's shop object that matter here."""
    payload = {"id": 548380009, "name": "Kite Store", "email": "owner@example.com"}
    if domain is not None:
        payload["domain"] = domain
    if myshopify_domain is not None:
        payload["myshopify_domain"] = myshopify_domain
    return payload


def post(client, payload, headers=None):
    return client.post(URL, content=json.dumps(payload).encode(),
                       headers={"Content-Type": "application/json", **(headers or {})})


def shop_exists(db, domain=SHOP):
    return db.query(ShopifyShop).filter_by(shop_domain=domain).first() is not None


class TestUninstallFindsTheStore:
    def test_a_store_with_a_custom_domain_is_removed(self, client, db):
        add_shop(db)

        response = post(client, shop_payload())

        assert response.status_code == 200
        assert response.json()["success"] is True
        assert not shop_exists(db)

    def test_the_shop_domain_header_fills_in_when_the_payload_lacks_it(self, client, db):
        add_shop(db)

        response = post(client, shop_payload(myshopify_domain=None),
                        headers={"X-Shopify-Shop-Domain": SHOP})

        assert response.status_code == 200
        assert not shop_exists(db)

    def test_a_payload_naming_only_the_myshopify_domain_still_works(self, client, db):
        add_shop(db)

        response = post(client, {"domain": SHOP})

        assert response.status_code == 200
        assert not shop_exists(db)

    def test_the_domain_is_matched_without_case_or_spaces(self, client, db):
        add_shop(db)

        response = post(client, shop_payload(myshopify_domain=f"  {SHOP.upper()} "))

        assert response.status_code == 200
        assert not shop_exists(db)

    def test_other_stores_are_left_alone(self, client, db):
        add_shop(db)
        add_shop(db, domain="other-store.myshopify.com")

        post(client, shop_payload())

        assert not shop_exists(db)
        assert shop_exists(db, "other-store.myshopify.com")


class TestWhatUninstallCleansUp:
    def test_an_unlinked_store_is_removed_without_an_ownership_record(self, client, db):
        add_shop(db)

        post(client, shop_payload())

        assert not shop_exists(db)
        assert db.query(ShopifyComplianceEvent).count() == 0

    def test_a_linked_store_remembers_its_owner_and_loses_its_agent_configs(
            self, client, db, test_organization, test_agent):
        shop = add_shop(db, organization_id=test_organization.id)
        db.add(AgentShopifyConfig(id="cfg-1", agent_id=str(test_agent.id), shop_id=str(shop.id), enabled=True))
        db.commit()

        response = post(client, shop_payload(), headers={"X-Shopify-Webhook-Id": "uninstall-7"})

        assert response.json()["configs_deleted"] == 1
        assert not shop_exists(db)
        assert db.query(AgentShopifyConfig).count() == 0
        remembered = db.query(ShopifyComplianceEvent).one()
        assert remembered.topic == shopify_privacy.TOPIC_APP_UNINSTALLED
        assert remembered.shop_domain == SHOP
        assert remembered.organization_id == test_organization.id

    def test_the_allowed_storefronts_are_refreshed(self, client, db, storefronts):
        add_shop(db)

        post(client, shop_payload())

        storefronts.assert_called_once()


class TestUninstallEdgeCases:
    def test_a_database_error_is_retried_by_shopify(self, client, db):
        add_shop(db)

        with patch("app.api.shopify.ShopifyShopRepository.delete_shop", side_effect=RuntimeError("db down")):
            response = post(client, shop_payload())

        assert response.status_code == 500
        assert response.json()["success"] is False
        assert shop_exists(db)

        response = post(client, shop_payload())

        assert response.status_code == 200
        assert not shop_exists(db)

    def test_a_header_naming_another_store_does_not_override_the_signed_payload(self, client, db):
        add_shop(db)
        add_shop(db, domain="victim.myshopify.com")

        post(client, shop_payload(), headers={"X-Shopify-Shop-Domain": "victim.myshopify.com"})

        assert not shop_exists(db)
        assert shop_exists(db, "victim.myshopify.com")

    def test_a_stored_domain_in_mixed_case_is_still_found(self, client, db):
        add_shop(db, domain="Kite-Store.myshopify.com")

        response = post(client, shop_payload())

        assert response.status_code == 200
        assert not shop_exists(db, "Kite-Store.myshopify.com")

    def test_an_unknown_store_is_acknowledged(self, client, db):
        response = post(client, shop_payload(myshopify_domain="never-seen.myshopify.com"))

        assert response.status_code == 200
        assert response.json()["message"] == "Shop not found, no action needed"

    def test_a_retry_after_removal_is_harmless(self, client, db):
        add_shop(db)
        post(client, shop_payload())

        response = post(client, shop_payload())

        assert response.status_code == 200
        assert not shop_exists(db)

    def test_a_payload_without_any_domain_is_refused(self, client, db):
        add_shop(db)

        response = post(client, shop_payload(domain=None, myshopify_domain=None))

        assert response.status_code == 400
        assert shop_exists(db)

    def test_a_bad_signature_is_refused_and_nothing_changes(self, client, db):
        add_shop(db)
        with patch("app.api.shopify.ShopifyHelperService.verify_shopify_webhook", return_value=False):
            response = post(client, shop_payload())

        assert response.status_code == 401
        assert shop_exists(db)

    def test_a_payload_that_is_not_an_object_is_refused(self, client, db):
        add_shop(db)

        response = post(client, [SHOP])

        assert response.status_code == 400
        assert shop_exists(db)

    def test_invalid_json_is_refused(self, client, db):
        add_shop(db)

        response = client.post(URL, content=b"{not json", headers={"Content-Type": "application/json"})

        assert response.status_code == 400
        assert shop_exists(db)


class TestUninstalledShopDomain:
    def test_the_signed_myshopify_domain_wins_over_the_header(self):
        assert _uninstalled_shop_domain({"X-Shopify-Shop-Domain": "b.myshopify.com"},
                                        shop_payload()) == SHOP

    def test_the_header_wins_over_the_primary_domain(self):
        assert _uninstalled_shop_domain({"X-Shopify-Shop-Domain": SHOP},
                                        shop_payload(myshopify_domain=None)) == SHOP

    def test_myshopify_domain_wins_over_the_primary_domain(self):
        assert _uninstalled_shop_domain({}, shop_payload()) == SHOP

    def test_the_primary_domain_is_the_last_resort(self):
        assert _uninstalled_shop_domain({}, {"domain": SHOP}) == SHOP

    def test_blank_and_non_string_values_are_skipped(self):
        headers = {"X-Shopify-Shop-Domain": "  "}
        assert _uninstalled_shop_domain(headers, {"myshopify_domain": 42, "domain": SHOP}) == SHOP

    def test_nothing_usable_gives_none(self):
        assert _uninstalled_shop_domain({}, {}) is None
