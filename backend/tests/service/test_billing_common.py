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
pytest.importorskip("app.enterprise.services.billing_common")

from app.enterprise.services.billing_common import (  # noqa: E402
    calculate_prorata_refund,
    estimate_unused_amount,
    disable_excess_users,
    apply_renewal,
)
from app.enterprise.models.plan import Plan, PlanType  # noqa: E402
from app.enterprise.models.subscription import Subscription, SubscriptionStatus  # noqa: E402
from app.models.user import User  # noqa: E402
from app.core.security import get_password_hash  # noqa: E402


# --------------------------------------------------------------------- helpers

def make_plan(db, price=9.99):
    plan = Plan(
        name="Pro",
        type=PlanType.PRO,
        price_per_agent=price,
        billing_interval="monthly",
        max_agents=None,
        max_knowledge_sources=30,
        max_sub_pages=100,
        max_messages=10000,
        data_retention_days=365,
        features=Plan.get_default_features(PlanType.PRO),
        trial_days=None,
        razorpay_plans={
            "INR": {"plan_id": None, "price_per_agent": 899.0},
            "USD": {"plan_id": None, "price_per_agent": 9.99},
        },
    )
    db.add(plan)
    db.commit()
    db.refresh(plan)
    return plan


def make_subscription(db, org_id, plan, *, quantity=2, unit_price=9.99,
                      period_start=None, period_end=None, status=SubscriptionStatus.ACTIVE,
                      currency="USD"):
    now = datetime.now(timezone.utc)
    subscription = Subscription(
        organization_id=org_id,
        plan_id=plan.id,
        status=status,
        payment_provider="razorpay",
        payment_provider_subscription_id=f"sub_{uuid4().hex[:12]}",
        quantity=quantity,
        unit_price=unit_price,
        currency=currency,
        current_period_start=period_start or (now - timedelta(days=15)),
        current_period_end=period_end or (now + timedelta(days=15)),
    )
    db.add(subscription)
    db.commit()
    db.refresh(subscription)
    return subscription


def make_user(db, org_id, created_at, name):
    user = User(
        id=uuid4(),
        email=f"{name}@test.com",
        hashed_password=get_password_hash("password"),
        full_name=name,
        organization_id=org_id,
        is_active=True,
    )
    db.add(user)
    db.commit()
    # created_at ordering drives which users get disabled first
    user.created_at = created_at
    db.commit()
    db.refresh(user)
    return user


# ------------------------------------------------------- calculate_prorata_refund

class TestCalculateProrataRefund:
    def test_mid_cycle_refund(self):
        start = datetime(2026, 7, 1, tzinfo=timezone.utc)
        end = start + timedelta(days=30)
        current = start + timedelta(days=15)
        # 15 of 30 days unused on a 30.0 payment -> 15.0
        assert calculate_prorata_refund(30.0, start, end, current) == 15.0

    def test_last_day_no_refund(self):
        start = datetime(2026, 7, 1, tzinfo=timezone.utc)
        end = start + timedelta(days=30)
        assert calculate_prorata_refund(30.0, start, end, end) == 0.0

    def test_past_cycle_no_refund(self):
        start = datetime(2026, 7, 1, tzinfo=timezone.utc)
        end = start + timedelta(days=30)
        assert calculate_prorata_refund(30.0, start, end, end + timedelta(days=5)) == 0.0

    def test_before_cycle_full_refund(self):
        start = datetime(2026, 7, 10, tzinfo=timezone.utc)
        end = start + timedelta(days=30)
        # current before start clamps used days to 0 -> full amount
        assert calculate_prorata_refund(30.0, start, end, start - timedelta(days=2)) == 30.0

    def test_zero_length_cycle_no_refund(self):
        start = datetime(2026, 7, 1, tzinfo=timezone.utc)
        assert calculate_prorata_refund(30.0, start, start, start) == 0.0

    def test_rounding_two_decimals(self):
        start = datetime(2026, 7, 1, tzinfo=timezone.utc)
        end = start + timedelta(days=30)
        current = start + timedelta(days=10)
        # 19.98 * 20/30 = 13.32
        assert calculate_prorata_refund(19.98, start, end, current) == 13.32

    def test_mixed_timezone_inputs(self):
        # naive current date with tz-aware cycle must not blow up or skew
        start = datetime(2026, 7, 1, tzinfo=timezone.utc)
        end = start + timedelta(days=30)
        result = calculate_prorata_refund(30.0, start, end)
        assert 0.0 <= result <= 30.0


# ------------------------------------------------------- estimate_unused_amount

class TestEstimateUnusedAmount:
    def test_active_mid_cycle(self, db, test_organization):
        plan = make_plan(db)
        sub = make_subscription(db, test_organization.id, plan, quantity=2, unit_price=9.99)
        estimate = estimate_unused_amount(sub)
        assert estimate is not None
        assert estimate["currency"] == "USD"
        # ~half of 19.98 with day-granularity rounding
        assert 8.0 < estimate["amount"] < 12.0
        assert estimate["billing_cycle"]["start"] == sub.current_period_start.isoformat()

    def test_no_period_returns_none(self, db, test_organization):
        plan = make_plan(db)
        sub = make_subscription(db, test_organization.id, plan)
        sub.current_period_end = None
        db.commit()
        assert estimate_unused_amount(sub) is None

    def test_expired_period_returns_none(self, db, test_organization):
        plan = make_plan(db)
        now = datetime.now(timezone.utc)
        sub = make_subscription(
            db, test_organization.id, plan,
            period_start=now - timedelta(days=40),
            period_end=now - timedelta(days=10),
        )
        assert estimate_unused_amount(sub) is None

    def test_none_subscription(self):
        assert estimate_unused_amount(None) is None


# --------------------------------------------------------- disable_excess_users

class TestDisableExcessUsers:
    def test_disables_most_recent_first(self, db, test_organization):
        base = datetime(2026, 1, 1, tzinfo=timezone.utc)
        oldest = make_user(db, test_organization.id, base, "oldest")
        middle = make_user(db, test_organization.id, base + timedelta(days=1), "middle")
        newest = make_user(db, test_organization.id, base + timedelta(days=2), "newest")

        disabled = disable_excess_users(db, test_organization.id, allowed_quantity=1)

        assert disabled == 2
        db.refresh(oldest); db.refresh(middle); db.refresh(newest)
        assert oldest.is_active is True
        assert middle.is_active is False
        assert newest.is_active is False

    def test_no_excess_no_change(self, db, test_organization):
        base = datetime(2026, 1, 1, tzinfo=timezone.utc)
        user = make_user(db, test_organization.id, base, "only")
        assert disable_excess_users(db, test_organization.id, allowed_quantity=5) == 0
        db.refresh(user)
        assert user.is_active is True


# ----------------------------------------------------------------- apply_renewal

class TestApplyRenewal:
    def test_advances_period(self, db, test_organization):
        plan = make_plan(db)
        now = datetime.now(timezone.utc)
        sub = make_subscription(
            db, test_organization.id, plan,
            period_start=now - timedelta(days=30), period_end=now,
            status=SubscriptionStatus.PAST_DUE,
        )
        new_start, new_end = now, now + timedelta(days=30)

        assert apply_renewal(sub, new_start, new_end, db) is True
        db.refresh(sub)
        # SQLite drops tzinfo on round-trip; compare in naive UTC
        stored_end = sub.current_period_end.replace(tzinfo=timezone.utc)
        assert stored_end == new_end
        assert sub.status == SubscriptionStatus.ACTIVE

    def test_duplicate_delivery_skipped(self, db, test_organization):
        plan = make_plan(db)
        now = datetime.now(timezone.utc)
        sub = make_subscription(
            db, test_organization.id, plan,
            period_start=now, period_end=now + timedelta(days=30),
        )
        # Same period redelivered -> no change
        assert apply_renewal(sub, now, now + timedelta(days=30), db) is False

    def test_out_of_order_shorter_period_skipped_but_status_recovers(self, db, test_organization):
        plan = make_plan(db)
        now = datetime.now(timezone.utc)
        sub = make_subscription(
            db, test_organization.id, plan,
            period_start=now, period_end=now + timedelta(days=30),
            status=SubscriptionStatus.PAST_DUE,
        )
        # An older charge event arrives late: period untouched, status healed
        assert apply_renewal(sub, now - timedelta(days=30), now, db) is False
        db.refresh(sub)
        assert sub.current_period_end.replace(tzinfo=timezone.utc) >= now
        assert sub.status == SubscriptionStatus.ACTIVE
