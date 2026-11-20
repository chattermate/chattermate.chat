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


Redact hooks (shopify_privacy.register_redact_hook): an extension's own
records of a store's shoppers are erased with the core's, in the same
transaction, on customers/redact and shop/redact, and never on a data request.
"""

import pytest

from app.models.shopify.shopify_compliance_event import ShopifyComplianceEvent
from app.models.shopify.shopify_shop import ShopifyShop
from app.services import shopify_privacy

SHOP = "ada-store.myshopify.com"


@pytest.fixture(autouse=True)
def hooks(monkeypatch):
    """Registered hooks and what each was asked; no extension loads in these tests."""
    monkeypatch.setattr("app.channels.app_hooks.load_extensions", lambda: None)
    shopify_privacy.reset_redact_hooks()
    asked = []

    def hook(db, request):
        asked.append(request)
        return 2
    shopify_privacy.register_redact_hook("extension_rows", hook)
    yield asked
    shopify_privacy.reset_redact_hooks()


@pytest.fixture
def shop(db, test_organization):
    row = ShopifyShop(shop_domain=SHOP, is_installed=True, organization_id=test_organization.id)
    db.add(row)
    db.commit()
    return row


def customer_payload(email="maya@example.com"):
    return {"shop_domain": SHOP, "shop_id": 1, "customer": {"id": 7, "email": email, "phone": "+447700900123"}}


def test_customers_redact_runs_the_hooks_for_that_shopper(db, shop, hooks, test_organization):
    outcome = shopify_privacy.handle_customers_redact(db, customer_payload(), "wh-1")
    [request] = hooks
    assert request == shopify_privacy.RedactRequest(
        topic="customers/redact", shop_domain=SHOP, organization_id=test_organization.id,
        email="maya@example.com", phone="+447700900123")
    # No core customer matched, but the hook erased rows: the request is done
    assert outcome.status == shopify_privacy.STATUS_COMPLETED
    assert outcome.result["extension_rows"] == 2
    record = db.query(ShopifyComplianceEvent).filter_by(webhook_id="wh-1").one()
    assert record.result["extension_rows"] == 2


def test_shop_redact_runs_the_hooks_for_the_whole_store(db, shop, hooks):
    shopify_privacy.handle_shop_redact(db, {"shop_domain": SHOP, "shop_id": 1}, "wh-2")
    [request] = hooks
    assert (request.topic, request.shop_domain, request.email, request.phone) == ("shop/redact", SHOP, None, None)


def test_the_hooks_run_after_the_shop_is_gone(db, hooks):
    """An uninstalled store's rows still go: matched by its domain."""
    outcome = shopify_privacy.handle_customers_redact(db, customer_payload(), "wh-3")
    [request] = hooks
    assert request.organization_id is None and request.shop_domain == SHOP
    assert outcome.status == shopify_privacy.STATUS_NO_SHOP


def test_a_hook_that_erased_nothing_leaves_no_match(db, shop, hooks):
    shopify_privacy.register_redact_hook("extension_rows", lambda db, request: 0)
    outcome = shopify_privacy.handle_customers_redact(db, customer_payload(), "wh-4")
    assert outcome.status == shopify_privacy.STATUS_NO_MATCH and "extension_rows" not in outcome.result


def test_a_failing_hook_fails_the_request_so_shopify_retries(db, shop):
    def broken(db, request):
        raise RuntimeError("db down")
    shopify_privacy.register_redact_hook("extension_rows", broken)
    with pytest.raises(RuntimeError):
        shopify_privacy.handle_customers_redact(db, customer_payload(), "wh-5")
    db.rollback()
    assert db.query(ShopifyComplianceEvent).filter_by(webhook_id="wh-5").first() is None


def test_a_retry_doesnt_run_the_hooks_again(db, shop, hooks):
    shopify_privacy.handle_customers_redact(db, customer_payload(), "wh-6")
    again = shopify_privacy.handle_customers_redact(db, customer_payload(), "wh-6")
    assert again.duplicate and len(hooks) == 1


def test_a_data_request_never_erases(db, shop, hooks):
    shopify_privacy.handle_data_request(db, {**customer_payload(), "data_request": {"id": 9}}, "wh-7")
    assert hooks == []


def test_the_extension_is_loaded_before_the_hooks_run(db, shop, monkeypatch):
    loaded = []
    monkeypatch.setattr("app.channels.app_hooks.load_extensions", lambda: loaded.append(True))
    shopify_privacy.handle_shop_redact(db, {"shop_domain": SHOP}, "wh-8")
    assert loaded == [True]
