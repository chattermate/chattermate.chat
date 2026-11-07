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

What Shopify's privacy webhooks actually do to the data: customers/redact,
shop/redact and customers/data_request, including after the app is gone.
"""

import json
from unittest.mock import AsyncMock, patch

import pytest
from fastapi.testclient import TestClient

import app.main  # noqa: F401 — registers the shopify router on the app
from app.core.application import app
from app.database import get_db
from app.models.shopify.agent_shopify_config import AgentShopifyConfig
from app.models.shopify.shopify_compliance_event import ShopifyComplianceEvent
from app.models.shopify.shopify_shop import ShopifyShop
from app.services import shopify_privacy
from tests.erasure_footprint import remaining, seed_footprint

SHOP = "ada-store.myshopify.com"
BASE = "/api/v1/shopify/webhooks"


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
    """The allowed-storefront refresh reads every shop; stubbed unless a test watches it."""
    with patch("app.api.shopify.refresh_allowed_storefronts"):
        yield


@pytest.fixture(autouse=True)
def storage():
    """S3 deletes of erased uploads; never reaches a real bucket."""
    with patch("app.api.shopify.delete_file_from_s3", new_callable=AsyncMock) as delete:
        yield delete


@pytest.fixture
def shop(db, test_organization):
    row = ShopifyShop(shop_domain=SHOP, is_installed=True, access_token="shpat_live",
                      organization_id=test_organization.id)
    db.add(row)
    db.commit()
    return row


def post(client, topic, payload, webhook_id=None):
    headers = {"Content-Type": "application/json"}
    if webhook_id:
        headers["X-Shopify-Webhook-Id"] = webhook_id
    return client.post(f"{BASE}/{topic}", content=json.dumps(payload).encode(), headers=headers)


def customer_payload(email="ada@example.com", phone=None, shop_domain=SHOP):
    return {"shop_id": 954889, "shop_domain": shop_domain,
            "customer": {"id": 191167, "email": email, "phone": phone},
            "orders_to_redact": [299938], "orders_requested": [299938],
            "data_request": {"id": 9999}}


def events(db, topic=None):
    query = db.query(ShopifyComplianceEvent)
    if topic:
        query = query.filter_by(topic=topic)
    return query.all()


def uninstall(client, webhook_id="uninstall-1"):
    with patch("app.api.shopify.refresh_allowed_storefronts"):
        response = client.post(f"{BASE}/app-uninstalled", json={"domain": SHOP},
                               headers={"X-Shopify-Webhook-Id": webhook_id})
    assert response.status_code == 200


class TestCustomersRedact:
    def test_a_matching_customer_is_erased_and_the_request_recorded(
            self, client, db, shop, test_organization, test_agent, storage):
        fp = seed_footprint(db, test_organization.id, test_agent.id, email="Ada@Example.com")

        response = post(client, "customers/redact", customer_payload(), webhook_id="w-1")

        assert response.status_code == 200
        assert response.json()["status"] == shopify_privacy.STATUS_COMPLETED
        assert remaining(db, fp) == {}
        storage.assert_awaited_once_with(fp.attachment_url)

        [record] = events(db, shopify_privacy.TOPIC_CUSTOMERS_REDACT)
        assert record.status == shopify_privacy.STATUS_COMPLETED
        assert record.organization_id == test_organization.id
        assert record.subject_ref == "191167"
        assert record.result["customers"] == 1
        # The proof of erasure must not itself hold the person's data.
        assert "ada@example.com" not in json.dumps(record.result).lower()

    def test_a_customer_matched_by_phone_alone_is_erased(
            self, client, db, shop, test_organization, test_agent):
        fp = seed_footprint(db, test_organization.id, test_agent.id,
                            email="anon@visitor.invalid", phone="+447700900123")

        post(client, "customers/redact", customer_payload(email=None, phone="+44 7700 900123"))

        assert remaining(db, fp) == {}

    def test_no_matching_customer_changes_nothing(
            self, client, db, shop, test_organization, test_agent, storage):
        bystander = seed_footprint(db, test_organization.id, test_agent.id, email="grace@example.com")
        before = remaining(db, bystander)

        response = post(client, "customers/redact", customer_payload())

        assert response.json()["status"] == shopify_privacy.STATUS_NO_MATCH
        assert remaining(db, bystander) == before
        storage.assert_not_awaited()
        assert events(db, shopify_privacy.TOPIC_CUSTOMERS_REDACT)[0].status == shopify_privacy.STATUS_NO_MATCH

    def test_a_retry_with_the_same_webhook_id_is_answered_from_the_record(
            self, client, db, shop, test_organization, test_agent):
        seed_footprint(db, test_organization.id, test_agent.id, email="ada@example.com")
        first = post(client, "customers/redact", customer_payload(), webhook_id="w-1")

        with patch("app.services.customer_erasure.erase_customers") as erase:
            again = post(client, "customers/redact", customer_payload(), webhook_id="w-1")

        erase.assert_not_called()
        assert again.status_code == 200
        assert again.json()["duplicate"] is True
        assert again.json()["status"] == first.json()["status"]
        assert len(events(db, shopify_privacy.TOPIC_CUSTOMERS_REDACT)) == 1

    def test_a_repeat_without_a_webhook_id_is_harmless(
            self, client, db, shop, test_organization, test_agent):
        seed_footprint(db, test_organization.id, test_agent.id, email="ada@example.com")
        post(client, "customers/redact", customer_payload())

        again = post(client, "customers/redact", customer_payload())

        assert again.status_code == 200
        assert again.json()["status"] == shopify_privacy.STATUS_NO_MATCH

    def test_a_customer_of_another_organization_is_not_touched(
            self, client, db, shop, test_agent):
        from app.models.organization import Organization
        other = Organization(name="Other", domain="other.com", timezone="UTC")
        db.add(other)
        db.commit()
        fp = seed_footprint(db, other.id, test_agent.id, email="ada@example.com")
        before = remaining(db, fp)

        post(client, "customers/redact", customer_payload())

        assert remaining(db, fp) == before

    def test_an_unknown_shop_is_recorded_and_acknowledged(self, client, db):
        response = post(client, "customers/redact", customer_payload(shop_domain="nobody.myshopify.com"))

        assert response.status_code == 200
        assert response.json()["status"] == shopify_privacy.STATUS_NO_SHOP
        assert events(db)[0].organization_id is None

    def test_after_uninstall_the_customer_is_still_found(
            self, client, db, shop, test_organization, test_agent):
        """The uninstall deletes the shop row at once; the redact arrives later."""
        fp = seed_footprint(db, test_organization.id, test_agent.id, email="ada@example.com")
        uninstall(client)
        assert db.query(ShopifyShop).filter_by(shop_domain=SHOP).count() == 0

        response = post(client, "customers/redact", customer_payload())

        assert response.json()["status"] == shopify_privacy.STATUS_COMPLETED
        assert remaining(db, fp) == {}

    def test_a_failed_erasure_leaves_no_record_so_the_retry_runs(
            self, client, db, shop, test_organization, test_agent):
        fp = seed_footprint(db, test_organization.id, test_agent.id, email="ada@example.com")
        with patch("app.services.customer_erasure.erase_customers", side_effect=RuntimeError("db gone")):
            failed = post(client, "customers/redact", customer_payload(), webhook_id="w-1")
        assert failed.status_code == 500
        assert events(db, shopify_privacy.TOPIC_CUSTOMERS_REDACT) == []

        retried = post(client, "customers/redact", customer_payload(), webhook_id="w-1")

        assert retried.json()["status"] == shopify_privacy.STATUS_COMPLETED
        assert remaining(db, fp) == {}


class TestShopRedact:
    def test_storefront_conversations_go_and_the_rest_of_the_account_stays(
            self, client, db, shop, test_organization, test_agent):
        storefront_only = seed_footprint(db, test_organization.id, test_agent.id,
                                         email="ada@example.com", channel="shopify")
        website_visitor = seed_footprint(db, test_organization.id, test_agent.id,
                                         email="grace@example.com", channel="web")
        before = remaining(db, website_visitor)
        uninstall(client)

        response = post(client, "shop/redact", {"shop_id": 954889, "shop_domain": SHOP})

        assert response.json()["status"] == shopify_privacy.STATUS_COMPLETED
        assert remaining(db, storefront_only) == {}
        assert remaining(db, website_visitor) == before

    def test_a_customer_who_also_chatted_elsewhere_keeps_that_conversation(
            self, client, db, shop, test_organization, test_agent):
        both = seed_footprint(db, test_organization.id, test_agent.id,
                              email="ada@example.com", channel="shopify")
        from app.models.session_to_agent import SessionToAgent
        import uuid
        web_session = uuid.uuid4()
        db.add(SessionToAgent(session_id=web_session, agent_id=test_agent.id,
                              customer_id=both.customer_id, organization_id=test_organization.id,
                              channel="web"))
        db.commit()

        post(client, "shop/redact", {"shop_id": 954889, "shop_domain": SHOP})

        left = remaining(db, both)
        assert "session_to_agents" not in left  # the storefront session
        assert left["customers"] == 1
        assert db.get(SessionToAgent, web_session) is not None

    def test_a_shop_row_still_present_is_deleted_with_its_token_and_configs(
            self, client, db, shop, test_agent):
        db.add(AgentShopifyConfig(id="cfg-1", agent_id=str(test_agent.id), shop_id=str(shop.id), enabled=True))
        db.commit()

        with patch("app.api.shopify.refresh_allowed_storefronts") as refresh:
            post(client, "shop/redact", {"shop_id": 954889, "shop_domain": SHOP})

        assert db.query(ShopifyShop).filter_by(shop_domain=SHOP).count() == 0
        assert db.query(AgentShopifyConfig).count() == 0
        refresh.assert_called_once()

    def test_a_repeat_is_harmless(self, client, db, shop, test_organization, test_agent):
        seed_footprint(db, test_organization.id, test_agent.id, email="ada@example.com")
        uninstall(client)
        post(client, "shop/redact", {"shop_id": 954889, "shop_domain": SHOP}, webhook_id="r-1")

        same = post(client, "shop/redact", {"shop_id": 954889, "shop_domain": SHOP}, webhook_id="r-1")
        fresh = post(client, "shop/redact", {"shop_id": 954889, "shop_domain": SHOP}, webhook_id="r-2")

        assert same.json()["duplicate"] is True
        assert fresh.json()["status"] == shopify_privacy.STATUS_NO_MATCH

    def test_a_shop_never_linked_to_an_organization(self, client, db):
        db.add(ShopifyShop(shop_domain=SHOP, is_installed=True, organization_id=None))
        db.commit()

        response = post(client, "shop/redact", {"shop_id": 954889, "shop_domain": SHOP})

        assert response.json()["status"] == shopify_privacy.STATUS_NO_SHOP
        assert db.query(ShopifyShop).count() == 0


class TestDataRequest:
    def test_a_match_is_recorded_for_export_and_nothing_is_deleted(
            self, client, db, shop, test_organization, test_agent):
        fp = seed_footprint(db, test_organization.id, test_agent.id, email="ada@example.com")
        before = remaining(db, fp)

        response = post(client, "customers/data_request", customer_payload())

        assert response.json()["status"] == shopify_privacy.STATUS_AWAITING_EXPORT
        assert remaining(db, fp) == before
        [record] = events(db, shopify_privacy.TOPIC_DATA_REQUEST)
        assert record.result == {"customer_ids": [str(fp.customer_id)]}
        assert record.subject_ref == "9999"

    def test_no_match(self, client, db, shop):
        response = post(client, "customers/data_request", customer_payload())

        assert response.json()["status"] == shopify_privacy.STATUS_NO_MATCH


class TestOwnershipRecord:
    def test_uninstall_records_the_organization(self, client, db, shop, test_organization):
        uninstall(client)

        [record] = events(db, shopify_privacy.TOPIC_APP_UNINSTALLED)
        assert record.organization_id == test_organization.id
        assert record.webhook_id == "uninstall-1"

    def test_an_uninstall_retry_after_the_row_is_gone_is_acknowledged(self, client, db, shop):
        uninstall(client)
        uninstall(client)

        assert len(events(db, shopify_privacy.TOPIC_APP_UNINSTALLED)) == 1

    def test_the_most_recent_owner_wins(self, db, test_organization):
        """A store moved between organizations: its later requests are about
        the organization it was last linked to."""
        from datetime import datetime, timedelta, timezone
        from app.models.organization import Organization
        newer = Organization(name="Newer", domain="newer.com", timezone="UTC")
        db.add(newer)
        db.commit()
        now = datetime.now(timezone.utc)
        for org, when in ((test_organization, now - timedelta(days=30)), (newer, now)):
            db.add(ShopifyComplianceEvent(topic=shopify_privacy.TOPIC_SHOP_DISCONNECTED, shop_domain=SHOP,
                                          organization_id=org.id, status="recorded", created_at=when))
        db.commit()

        assert shopify_privacy.resolve_shop_organization(db, SHOP) == newer.id

    def test_a_shop_without_an_organization_leaves_no_record(self, db):
        shopify_privacy.remember_shop_owner(
            db, ShopifyShop(shop_domain=SHOP, organization_id=None), shopify_privacy.TOPIC_APP_UNINSTALLED)
        db.commit()

        assert events(db) == []
        assert shopify_privacy.resolve_shop_organization(db, None) is None
