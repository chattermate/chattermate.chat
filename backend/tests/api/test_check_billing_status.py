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

import pytest
from datetime import datetime, timedelta, timezone
from uuid import uuid4

# Enterprise-only feature; skip cleanly in community checkouts.
pytest.importorskip("app.enterprise.routes.subscription")

from fastapi import FastAPI  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

import app.core.auth as core_auth  # noqa: E402
from app.database import get_db  # noqa: E402
from app.core.auth import get_current_user, get_current_organization  # noqa: E402
from app.enterprise.models.plan import Plan, PlanType  # noqa: E402
from app.enterprise.models.subscription import Subscription, SubscriptionStatus  # noqa: E402
from app.enterprise.routes.subscription import router as subscription_router  # noqa: E402

test_app = FastAPI()
test_app.include_router(subscription_router, prefix="/api/v1/enterprise/subscriptions")

BASE = "/api/v1/enterprise/subscriptions/check-billing-status"


@pytest.fixture
def client(db, test_user, test_organization, monkeypatch) -> TestClient:
    async def override_get_current_user():
        return test_user

    async def override_get_current_organization():
        return test_organization

    def override_get_db():
        try:
            yield db
        finally:
            pass

    # require_permissions closures depend on get_current_user + check_permissions
    monkeypatch.setattr(core_auth, "check_permissions", lambda user, permissions: True)
    test_app.dependency_overrides[get_current_user] = override_get_current_user
    test_app.dependency_overrides[get_current_organization] = override_get_current_organization
    test_app.dependency_overrides[get_db] = override_get_db
    yield TestClient(test_app)
    test_app.dependency_overrides.clear()


def make_plan(db, *, name="Pro", plan_type=PlanType.PRO, usd=9.99, inr=899.0):
    plan = Plan(
        name=name,
        type=plan_type,
        price_per_agent=usd,
        billing_interval="monthly",
        max_agents=None,
        max_knowledge_sources=30,
        max_sub_pages=100,
        max_messages=10000,
        data_retention_days=365,
        features=Plan.get_default_features(plan_type),
        trial_days=None,
        razorpay_plans={
            "INR": {"plan_id": None, "price_per_agent": inr},
            "USD": {"plan_id": None, "price_per_agent": usd},
        },
    )
    db.add(plan)
    db.commit()
    db.refresh(plan)
    return plan


def make_subscription(db, org_id, plan, **overrides):
    now = datetime.now(timezone.utc)
    values = dict(
        organization_id=org_id,
        plan_id=plan.id,
        status=SubscriptionStatus.ACTIVE,
        payment_provider="razorpay",
        payment_provider_subscription_id=f"sub_{uuid4().hex[:12]}",
        quantity=2,
        unit_price=899.0,
        currency="INR",
        current_period_start=now - timedelta(days=10),
        current_period_end=now + timedelta(days=20),
    )
    values.update(overrides)
    subscription = Subscription(**values)
    db.add(subscription)
    db.commit()
    db.refresh(subscription)
    return subscription


class TestCurrencyResolution:
    def test_default_currency_no_subscription(self, client, db):
        plan = make_plan(db)
        response = client.get(f"{BASE}/{plan.id}")
        assert response.status_code == 200
        data = response.json()
        assert data["checkout_provider"] == "razorpay"
        assert data["currency"] == "USD"  # org timezone UTC -> USD default
        assert data["currency_locked"] is False
        assert data["new_plan"]["price_per_agent"] == 9.99
        assert data["new_plan"]["prices"] == {"USD": 9.99, "INR": 899.0}

    def test_explicit_currency_choice(self, client, db):
        plan = make_plan(db)
        response = client.get(f"{BASE}/{plan.id}", params={"currency": "INR"})
        data = response.json()
        assert data["currency"] == "INR"
        assert data["new_plan"]["price_per_agent"] == 899.0
        assert data["upi_cap"] == 15000

    def test_invalid_currency_rejected(self, client, db):
        plan = make_plan(db)
        response = client.get(f"{BASE}/{plan.id}", params={"currency": "EUR"})
        assert response.status_code == 422

    def test_currency_sticky_with_existing_razorpay_sub(self, client, db, test_organization):
        plan = make_plan(db)
        make_subscription(db, test_organization.id, plan, currency="INR")
        # asking for USD must not unlock the currency
        response = client.get(f"{BASE}/{plan.id}", params={"currency": "USD"})
        data = response.json()
        assert data["currency"] == "INR"
        assert data["currency_locked"] is True

    def test_india_timezone_defaults_to_inr(self, client, db, test_organization):
        plan = make_plan(db)
        test_organization.timezone = "Asia/Kolkata"
        db.commit()
        response = client.get(f"{BASE}/{plan.id}")
        assert response.json()["currency"] == "INR"


class TestChangeClassification:
    def test_upgrade_billed_from_cycle_end_with_proration(self, client, db, test_organization):
        base_plan = make_plan(db, name="Base", plan_type=PlanType.BASE, usd=3.99, inr=349.0)
        pro_plan = make_plan(db)
        make_subscription(db, test_organization.id, base_plan, unit_price=349.0)

        response = client.get(f"{BASE}/{pro_plan.id}")
        data = response.json()

        assert data["change_type"] == "upgrade"
        # upgrades bill from the current period end; the prorated difference
        # is collected at checkout - no refunds
        assert "future_start_date" in data
        assert "prorata_refund" not in data
        assert data["proration"]["remaining_days"] > 0
        assert data["proration"]["total_days"] >= data["proration"]["remaining_days"]
        assert data["proration"]["current_cycle_total"] == 698.0  # 349 x 2 seats

    def test_downgrade_scheduled_at_period_end(self, client, db, test_organization):
        base_plan = make_plan(db, name="Base", plan_type=PlanType.BASE, usd=3.99, inr=349.0)
        pro_plan = make_plan(db)
        sub = make_subscription(db, test_organization.id, pro_plan)

        response = client.get(f"{BASE}/{base_plan.id}")
        data = response.json()

        assert data["change_type"] == "downgrade"
        assert "future_start_date" in data
        assert "prorata_refund" not in data

    def test_legacy_paypal_forced_future_start_no_refund(self, client, db, test_organization):
        base_plan = make_plan(db, name="Base", plan_type=PlanType.BASE, usd=3.99, inr=349.0)
        pro_plan = make_plan(db)
        make_subscription(
            db, test_organization.id, base_plan,
            payment_provider="paypal", currency="USD", unit_price=3.99,
            payment_provider_subscription_id="I-LEGACY123",
        )

        # even an upgrade is scheduled for legacy PayPal customers
        response = client.get(f"{BASE}/{pro_plan.id}")
        data = response.json()

        assert data["legacy_provider"] is True
        assert data["change_type"] == "upgrade"
        assert "future_start_date" in data
        assert "prorata_refund" not in data
        # legacy USD sub doesn't lock razorpay currency
        assert data["currency_locked"] is False

    def test_past_due_flagged(self, client, db, test_organization):
        plan = make_plan(db)
        make_subscription(db, test_organization.id, plan, status=SubscriptionStatus.PAST_DUE)

        response = client.get(f"{BASE}/{plan.id}")
        assert response.json()["payment_past_due"] is True

    def test_same_plan_active_razorpay_shows_proration_blocks(
        self, client, db, test_organization
    ):
        plan = make_plan(db)
        make_subscription(db, test_organization.id, plan)

        response = client.get(f"{BASE}/{plan.id}")
        data = response.json()

        assert data["change_type"] == "same"
        # seat changes bill from cycle end; increases collect the prorated
        # delta at checkout - frontend computes it from these blocks
        assert "proration" in data
        assert data["proration"]["current_cycle_total"] == 1798.0  # 899 x 2

    def test_plan_not_found(self, client, db):
        response = client.get(f"{BASE}/{uuid4()}")
        assert response.status_code == 404
