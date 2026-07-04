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

import hashlib
import hmac
import json
import pytest
from datetime import datetime, timedelta, timezone
from uuid import uuid4

# Enterprise-only feature; skip cleanly in community checkouts.
pytest.importorskip("app.enterprise.routes.razorpay")

from fastapi import FastAPI  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

from app.database import get_db  # noqa: E402
from app.core.config import settings  # noqa: E402
from app.core.security import get_password_hash  # noqa: E402
from app.models.user import User  # noqa: E402
from app.enterprise.models.plan import Plan, PlanType  # noqa: E402
from app.enterprise.models.pending_plan_change import PendingPlanChange
from app.enterprise.models.subscription import Subscription, SubscriptionStatus  # noqa: E402
from app.enterprise.routes.razorpay import router as razorpay_router  # noqa: E402
from app.enterprise.services.razorpay_service import RazorpayService  # noqa: E402

WEBHOOK_SECRET = "test_webhook_secret"
WEBHOOK_URL = "/api/v1/enterprise/payment/razorpay/webhook"

test_app = FastAPI()
test_app.include_router(razorpay_router, prefix="/api/v1/enterprise/payment")


@pytest.fixture
def client(db, monkeypatch) -> TestClient:
    monkeypatch.setattr(settings, "RAZORPAY_WEBHOOK_SECRET", WEBHOOK_SECRET)
    monkeypatch.setattr(settings, "RAZORPAY_KEY_ID", "rzp_test_dummy")
    monkeypatch.setattr(settings, "RAZORPAY_KEY_SECRET", "dummy_secret")

    def override_get_db():
        try:
            yield db
        finally:
            pass

    test_app.dependency_overrides[get_db] = override_get_db
    yield TestClient(test_app)
    test_app.dependency_overrides.pop(get_db, None)


@pytest.fixture
def rzp_mocks(monkeypatch):
    """Neutralize outbound Razorpay API calls made by webhook handlers."""
    calls = {"refund": [], "cancel": []}

    def fake_refund_unused(self, old_subscription, db):
        calls["refund"].append(str(old_subscription.id))
        return {"status": "processed"}

    def fake_cancel(self, rzp_sub_id, at_cycle_end):
        calls["cancel"].append((rzp_sub_id, at_cycle_end))
        return {"status": "cancelled"}

    calls["cancel_unstarted"] = []

    def fake_cancel_unstarted(self, rzp_sub_id):
        calls["cancel_unstarted"].append(rzp_sub_id)
        return {"status": "cancelled"}

    monkeypatch.setattr(RazorpayService, "refund_unused", fake_refund_unused)
    monkeypatch.setattr(RazorpayService, "cancel_subscription", fake_cancel)
    monkeypatch.setattr(RazorpayService, "cancel_unstarted_subscription", fake_cancel_unstarted)
    return calls


def sign(body: bytes, secret: str = WEBHOOK_SECRET) -> str:
    return hmac.new(secret.encode(), body, hashlib.sha256).hexdigest()


def post_event(client, event_type, payload, event_id=None, secret=WEBHOOK_SECRET):
    body = json.dumps({
        "entity": "event",
        "event": event_type,
        "contains": list(payload.keys()),
        "payload": payload,
    }).encode()
    headers = {
        "X-Razorpay-Signature": sign(body, secret),
        "x-razorpay-event-id": event_id or f"evt_{uuid4().hex[:12]}",
        "Content-Type": "application/json",
    }
    return client.post(WEBHOOK_URL, content=body, headers=headers)


def subscription_payload(rzp_sub_id, org_id, plan, *, rzp_plan_id=None, quantity=2,
                         status="active", start=None, end=None, start_at=None,
                         payment_amount=None, apply_now=False, created_at=None):
    now = datetime.now(timezone.utc)
    entity = {
        "id": rzp_sub_id,
        "entity": "subscription",
        "plan_id": rzp_plan_id or plan.get_razorpay_plan_id("INR"),
        "status": status,
        "quantity": quantity,
        "current_start": int((start or now).timestamp()),
        "current_end": int((end or (now + timedelta(days=30))).timestamp()),
        "notes": {"org_id": str(org_id), "plan_id": str(plan.id),
                  "apply_now": "true" if apply_now else "false"},
    }
    if start_at:
        entity["start_at"] = int(start_at.timestamp())
    if created_at:
        entity["created_at"] = int(created_at.timestamp())
    payload = {"subscription": {"entity": entity}}
    if payment_amount is not None:
        payload["payment"] = {"entity": {"id": f"pay_{uuid4().hex[:10]}", "amount": payment_amount}}
    return payload


def make_plan(db):
    plan = Plan(
        name="Pro",
        type=PlanType.PRO,
        price_per_agent=9.99,
        billing_interval="monthly",
        max_agents=None,
        max_knowledge_sources=30,
        max_sub_pages=100,
        max_messages=10000,
        data_retention_days=365,
        features=Plan.get_default_features(PlanType.PRO),
        trial_days=None,
        razorpay_plans={
            "INR": {"plan_id": "plan_inr_1", "price_per_agent": 899.0},
            "USD": {"plan_id": "plan_usd_1", "price_per_agent": 9.99},
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




def get_pending(db, org_id):
    return db.query(PendingPlanChange).filter(
        PendingPlanChange.organization_id == org_id
    ).first()


def get_db_sub(db, rzp_sub_id):
    return db.query(Subscription).filter(
        Subscription.payment_provider_subscription_id == rzp_sub_id
    ).first()


class TestWebhookSecurity:
    def test_invalid_signature_rejected(self, client, db, test_organization):
        plan = make_plan(db)
        body = json.dumps({"event": "subscription.activated", "payload": {}}).encode()
        response = client.post(WEBHOOK_URL, content=body, headers={
            "X-Razorpay-Signature": sign(body, "wrong_secret"),
            "x-razorpay-event-id": "evt_bad",
            "Content-Type": "application/json",
        })
        assert response.status_code == 400

    def test_missing_signature_rejected(self, client):
        body = b'{"event": "subscription.activated", "payload": {}}'
        response = client.post(WEBHOOK_URL, content=body,
                               headers={"Content-Type": "application/json"})
        assert response.status_code == 400

    def test_duplicate_event_id_acknowledged_once(self, client, db, test_organization, rzp_mocks):
        plan = make_plan(db)
        payload = subscription_payload("sub_dup", test_organization.id, plan)

        first = post_event(client, "subscription.activated", payload, event_id="evt_same")
        second = post_event(client, "subscription.activated", payload, event_id="evt_same")

        assert first.status_code == 200
        assert second.status_code == 200
        assert second.json()["status"] == "duplicate"
        assert get_db_sub(db, "sub_dup") is not None


class TestActivation:
    def test_activated_creates_subscription(self, client, db, test_organization, rzp_mocks):
        plan = make_plan(db)
        end = datetime.now(timezone.utc) + timedelta(days=30)
        payload = subscription_payload(
            "sub_new1", test_organization.id, plan, quantity=3, end=end
        )

        response = post_event(client, "subscription.activated", payload)

        assert response.status_code == 200
        sub = get_db_sub(db, "sub_new1")
        assert sub is not None
        assert sub.status == SubscriptionStatus.ACTIVE
        assert sub.quantity == 3
        assert sub.currency == "INR"
        assert sub.unit_price == 899.0
        assert abs((sub.current_period_end.replace(tzinfo=timezone.utc) - end).total_seconds()) < 2

    def test_activated_replaces_old_sub_with_refund(self, client, db, test_organization, rzp_mocks):
        plan = make_plan(db)
        old = make_subscription(db, test_organization.id, plan)
        payload = subscription_payload("sub_upgrade", test_organization.id, plan, quantity=4)

        response = post_event(client, "subscription.activated", payload)

        assert response.status_code == 200
        db.refresh(old)
        assert old.status == SubscriptionStatus.CANCELLED
        assert rzp_mocks["refund"] == [str(old.id)]
        assert (old.payment_provider_subscription_id, False) in rzp_mocks["cancel"]
        new = get_db_sub(db, "sub_upgrade")
        assert new.status == SubscriptionStatus.ACTIVE
        assert new.quantity == 4

    def test_trial_replaced_without_refund(self, client, db, test_organization, rzp_mocks):
        plan = make_plan(db)
        now = datetime.now(timezone.utc)
        trial = Subscription(
            organization_id=test_organization.id,
            plan_id=plan.id,
            status=SubscriptionStatus.TRIAL,
            trial_start=now - timedelta(days=2),
            trial_end=now + timedelta(days=12),
            quantity=1,
            unit_price=899.0,
        )
        db.add(trial)
        db.commit()

        response = post_event(
            client, "subscription.activated",
            subscription_payload("sub_paid", test_organization.id, plan)
        )

        assert response.status_code == 200
        db.refresh(trial)
        assert trial.status == SubscriptionStatus.CANCELLED
        assert rzp_mocks["refund"] == []  # trials have no payment to refund
        assert get_db_sub(db, "sub_paid").status == SubscriptionStatus.ACTIVE

    def test_unknown_razorpay_plan_rejected(self, client, db, test_organization, rzp_mocks):
        plan = make_plan(db)
        payload = subscription_payload(
            "sub_forged", test_organization.id, plan, rzp_plan_id="plan_not_ours"
        )

        response = post_event(client, "subscription.activated", payload)

        assert response.status_code == 200  # acknowledged, not retried
        assert response.json()["status"] == "error"
        assert get_db_sub(db, "sub_forged") is None

    def test_excess_users_disabled(self, client, db, test_organization, rzp_mocks):
        plan = make_plan(db)
        base = datetime(2026, 1, 1, tzinfo=timezone.utc)
        users = []
        for i in range(3):
            user = User(
                id=uuid4(),
                email=f"seat{i}@test.com",
                hashed_password=get_password_hash("password"),
                full_name=f"Seat {i}",
                organization_id=test_organization.id,
                is_active=True,
            )
            db.add(user)
            db.commit()
            user.created_at = base + timedelta(days=i)
            db.commit()
            users.append(user)

        response = post_event(
            client, "subscription.activated",
            subscription_payload("sub_seats", test_organization.id, plan, quantity=1)
        )

        assert response.status_code == 200
        for user in users:
            db.refresh(user)
        # newest two disabled, oldest kept
        assert [u.is_active for u in users] == [True, False, False]


class TestPaidUpgradeAuthentication:
    def test_authenticated_upgrade_applies_seats_immediately(
        self, client, db, test_organization, rzp_mocks
    ):
        """Paid upgrade: prorated delta collected at checkout -> the current
        subscription gets the new quantity, plan AND unit price right away,
        the old mandate is scheduled to cancel at cycle end, and no refund is
        attempted."""
        plan = make_plan(db)
        # sub still on the old (cheaper) plan's rate - the upgrade must move it
        old = make_subscription(db, test_organization.id, plan, quantity=2,
                                unit_price=349.0)
        start_at = datetime.now(timezone.utc) + timedelta(days=15)

        response = post_event(
            client, "subscription.authenticated",
            subscription_payload("sub_upg_paid", test_organization.id, plan,
                                 quantity=3, status="authenticated",
                                 start_at=start_at, apply_now=True)
        )

        assert response.status_code == 200
        db.refresh(old)
        assert old.quantity == 3  # seats granted immediately
        assert old.status == SubscriptionStatus.ACTIVE  # keeps running until cycle end
        assert (old.payment_provider_subscription_id, True) in rzp_mocks["cancel"]
        assert rzp_mocks["refund"] == []  # never refunds under the delta model
        # unit price follows the upgraded plan - the display total and the
        # next change's proration baseline depend on it
        assert old.unit_price == 899.0
        # the future mandate is tracked so a later change can supersede it
        pending = get_pending(db, test_organization.id)
        assert pending.razorpay_subscription_id == "sub_upg_paid"
        assert pending.quantity == 3

    def test_scheduled_downgrade_supersedes_upgrade_mandate(
        self, client, db, test_organization, rzp_mocks
    ):
        """Upgrade (apply_now) then downgrade before cycle end: the upgrade's
        future mandate must be cancelled or both start at the boundary."""
        plan = make_plan(db)
        old = make_subscription(db, test_organization.id, plan, quantity=2)
        start_at = datetime.now(timezone.utc) + timedelta(days=15)

        post_event(
            client, "subscription.authenticated",
            subscription_payload("sub_upg_mandate", test_organization.id, plan,
                                 quantity=3, status="authenticated",
                                 start_at=start_at, apply_now=True)
        )
        post_event(
            client, "subscription.authenticated",
            subscription_payload("sub_down_mandate", test_organization.id, plan,
                                 quantity=1, status="authenticated",
                                 start_at=start_at, apply_now=False)
        )

        db.refresh(old)
        assert "sub_upg_mandate" in rzp_mocks["cancel_unstarted"]
        pending = get_pending(db, test_organization.id)
        assert pending.razorpay_subscription_id == "sub_down_mandate"
        assert pending.quantity == 1
        assert old.quantity == 3  # granted seats stay until the boundary

    def test_authenticated_downgrade_does_not_apply_early(
        self, client, db, test_organization, rzp_mocks
    ):
        plan = make_plan(db)
        old = make_subscription(db, test_organization.id, plan, quantity=3)
        start_at = datetime.now(timezone.utc) + timedelta(days=15)

        post_event(
            client, "subscription.authenticated",
            subscription_payload("sub_down_sched", test_organization.id, plan,
                                 quantity=2, status="authenticated",
                                 start_at=start_at, apply_now=False)
        )

        db.refresh(old)
        assert old.quantity == 3  # unchanged until the new sub activates
        assert (old.payment_provider_subscription_id, True) in rzp_mocks["cancel"]
        # ...but the pending change is persisted for the subscription page
        pending = get_pending(db, test_organization.id)
        assert pending is not None
        assert pending.razorpay_subscription_id == "sub_down_sched"
        assert pending.quantity == 2
        assert pending.plan_name == "Pro"
        assert pending.start_at.date() == start_at.date()

    def test_new_scheduled_change_supersedes_previous(
        self, client, db, test_organization, rzp_mocks
    ):
        """Scheduling change B after change A must cancel A's future mandate,
        or both would start (and charge) at the cycle boundary."""
        plan = make_plan(db)
        old = make_subscription(db, test_organization.id, plan, quantity=3)
        start_at = datetime.now(timezone.utc) + timedelta(days=15)

        post_event(
            client, "subscription.authenticated",
            subscription_payload("sub_sched_a", test_organization.id, plan,
                                 quantity=2, status="authenticated",
                                 start_at=start_at, apply_now=False)
        )
        post_event(
            client, "subscription.authenticated",
            subscription_payload("sub_sched_b", test_organization.id, plan,
                                 quantity=1, status="authenticated",
                                 start_at=start_at, apply_now=False)
        )

        db.refresh(old)
        assert "sub_sched_a" in rzp_mocks["cancel_unstarted"]
        pending = get_pending(db, test_organization.id)
        assert pending.razorpay_subscription_id == "sub_sched_b"
        assert pending.quantity == 1


class TestCancelledReactivation:
    def make_transition_state(self, db, org_id, plan):
        """Post-cancellation state: cancelled paid sub (still in period) plus
        the future free-fallback row that /current serves (no mandate)."""
        now = datetime.now(timezone.utc)
        cancelled = make_subscription(
            db, org_id, plan, quantity=3, unit_price=899.0, currency="INR",
            status=SubscriptionStatus.CANCELLED,
        )
        free_row = make_subscription(
            db, org_id, plan, quantity=1, unit_price=0.0, currency="USD",
            payment_provider=None, payment_provider_subscription_id=None,
            current_period_start=now + timedelta(days=20),
            current_period_end=now + timedelta(days=50),
        )
        return cancelled, free_row

    def test_resubscribe_records_pending_mandate_on_both_rows(
        self, client, db, test_organization, rzp_mocks
    ):
        plan = make_plan(db)
        cancelled, free_row = self.make_transition_state(db, test_organization.id, plan)
        start_at = datetime.now(timezone.utc) + timedelta(days=20)

        response = post_event(
            client, "subscription.authenticated",
            subscription_payload("sub_reactivate", test_organization.id, plan,
                                 quantity=3, status="authenticated",
                                 start_at=start_at, apply_now=False)
        )

        assert response.status_code == 200
        # nothing to cancel at the provider - the current row has no mandate
        assert rzp_mocks["cancel"] == []
        pending = get_pending(db, test_organization.id)
        assert pending.razorpay_subscription_id == "sub_reactivate"
        assert pending.quantity == 3
        # currency follows the cancelled paid sub, not the free row's USD default
        assert pending.currency == "INR"
        assert pending.unit_price == 899.0

    def test_second_resubscribe_supersedes_first_mandate(
        self, client, db, test_organization, rzp_mocks
    ):
        plan = make_plan(db)
        cancelled, free_row = self.make_transition_state(db, test_organization.id, plan)
        start_at = datetime.now(timezone.utc) + timedelta(days=20)

        post_event(
            client, "subscription.authenticated",
            subscription_payload("sub_react_a", test_organization.id, plan,
                                 quantity=3, status="authenticated",
                                 start_at=start_at, apply_now=False)
        )
        post_event(
            client, "subscription.authenticated",
            subscription_payload("sub_react_b", test_organization.id, plan,
                                 quantity=2, status="authenticated",
                                 start_at=start_at, apply_now=False)
        )

        assert "sub_react_a" in rzp_mocks["cancel_unstarted"]
        pending = get_pending(db, test_organization.id)
        assert pending.razorpay_subscription_id == "sub_react_b"


class TestOutOfOrderAuthentication:
    def test_late_event_for_older_mandate_does_not_supersede(
        self, client, db, test_organization, rzp_mocks
    ):
        """Webhooks are unordered: the customer authorized A then B, but B's
        event arrives first. A's late event must cancel A (the stale choice),
        not B (the customer's latest)."""
        plan = make_plan(db)
        make_subscription(db, test_organization.id, plan, quantity=3)
        now = datetime.now(timezone.utc)
        start_at = now + timedelta(days=15)

        post_event(
            client, "subscription.authenticated",
            subscription_payload("sub_newer_b", test_organization.id, plan,
                                 quantity=1, status="authenticated",
                                 start_at=start_at, created_at=now)
        )
        post_event(
            client, "subscription.authenticated",
            subscription_payload("sub_older_a", test_organization.id, plan,
                                 quantity=2, status="authenticated",
                                 start_at=start_at,
                                 created_at=now - timedelta(minutes=5))
        )

        # the stale incoming mandate is cancelled, the newest choice survives
        assert "sub_older_a" in rzp_mocks["cancel_unstarted"]
        assert "sub_newer_b" not in rzp_mocks["cancel_unstarted"]
        pending = get_pending(db, test_organization.id)
        assert pending.razorpay_subscription_id == "sub_newer_b"


class TestPendingClearedOnActivation:
    def test_activation_of_pending_mandate_deletes_record(
        self, client, db, test_organization, rzp_mocks
    ):
        plan = make_plan(db)
        old = make_subscription(db, test_organization.id, plan, quantity=3)
        start_at = datetime.now(timezone.utc) + timedelta(days=15)

        post_event(
            client, "subscription.authenticated",
            subscription_payload("sub_boundary", test_organization.id, plan,
                                 quantity=2, status="authenticated",
                                 start_at=start_at, apply_now=False)
        )
        assert get_pending(db, test_organization.id) is not None

        # the boundary arrives: the scheduled mandate activates
        post_event(
            client, "subscription.activated",
            subscription_payload("sub_boundary", test_organization.id, plan, quantity=2)
        )

        assert get_pending(db, test_organization.id) is None
        new_sub = get_db_sub(db, "sub_boundary")
        assert new_sub is not None and new_sub.quantity == 2

    def test_activation_of_other_mandate_supersedes_stale_pending(
        self, client, db, test_organization, rzp_mocks
    ):
        """An immediate activation must kill a stale scheduled mandate, or
        both would charge."""
        plan = make_plan(db)
        old = make_subscription(db, test_organization.id, plan, quantity=3)
        start_at = datetime.now(timezone.utc) + timedelta(days=15)

        post_event(
            client, "subscription.authenticated",
            subscription_payload("sub_stale_sched", test_organization.id, plan,
                                 quantity=2, status="authenticated",
                                 start_at=start_at, apply_now=False)
        )
        post_event(
            client, "subscription.activated",
            subscription_payload("sub_fresh_now", test_organization.id, plan, quantity=1)
        )

        assert "sub_stale_sched" in rzp_mocks["cancel_unstarted"]
        assert get_pending(db, test_organization.id) is None


class TestRenewal:
    def test_charged_extends_period(self, client, db, test_organization, rzp_mocks):
        plan = make_plan(db)
        sub = make_subscription(db, test_organization.id, plan)
        rzp_id = sub.payment_provider_subscription_id
        new_start = datetime.now(timezone.utc) + timedelta(days=20)
        new_end = new_start + timedelta(days=30)

        response = post_event(
            client, "subscription.charged",
            subscription_payload(rzp_id, test_organization.id, plan,
                                 start=new_start, end=new_end,
                                 payment_amount=int(899.0 * 2 * 100))
        )

        assert response.status_code == 200
        db.refresh(sub)
        assert abs((sub.current_period_end.replace(tzinfo=timezone.utc) - new_end).total_seconds()) < 2
        assert sub.status == SubscriptionStatus.ACTIVE

    def test_duplicate_charged_different_event_id_no_double_extend(
        self, client, db, test_organization, rzp_mocks
    ):
        plan = make_plan(db)
        sub = make_subscription(db, test_organization.id, plan)
        rzp_id = sub.payment_provider_subscription_id
        new_start = datetime.now(timezone.utc) + timedelta(days=20)
        new_end = new_start + timedelta(days=30)
        payload = subscription_payload(rzp_id, test_organization.id, plan,
                                       start=new_start, end=new_end)

        post_event(client, "subscription.charged", payload, event_id="evt_c1")
        post_event(client, "subscription.charged", payload, event_id="evt_c2")

        db.refresh(sub)
        assert abs((sub.current_period_end.replace(tzinfo=timezone.utc) - new_end).total_seconds()) < 2

    def test_charged_before_activated_upserts(self, client, db, test_organization, rzp_mocks):
        plan = make_plan(db)
        payload = subscription_payload("sub_race", test_organization.id, plan)

        charged = post_event(client, "subscription.charged", payload)
        activated = post_event(client, "subscription.activated", payload)

        assert charged.status_code == 200
        assert activated.status_code == 200
        subs = db.query(Subscription).filter(
            Subscription.payment_provider_subscription_id == "sub_race"
        ).all()
        assert len(subs) == 1
        assert subs[0].status == SubscriptionStatus.ACTIVE


class TestStateTransitions:
    def test_pending_sets_past_due(self, client, db, test_organization, rzp_mocks):
        plan = make_plan(db)
        sub = make_subscription(db, test_organization.id, plan)

        response = post_event(
            client, "subscription.pending",
            subscription_payload(sub.payment_provider_subscription_id,
                                 test_organization.id, plan, status="pending")
        )

        assert response.status_code == 200
        db.refresh(sub)
        assert sub.status == SubscriptionStatus.PAST_DUE

    def test_halted_then_charged_recovers(self, client, db, test_organization, rzp_mocks):
        plan = make_plan(db)
        sub = make_subscription(db, test_organization.id, plan)
        rzp_id = sub.payment_provider_subscription_id

        post_event(client, "subscription.halted",
                   subscription_payload(rzp_id, test_organization.id, plan, status="halted"))
        db.refresh(sub)
        assert sub.status == SubscriptionStatus.PAST_DUE

        new_start = datetime.now(timezone.utc) + timedelta(days=25)
        post_event(client, "subscription.charged",
                   subscription_payload(rzp_id, test_organization.id, plan,
                                        start=new_start, end=new_start + timedelta(days=30)))
        db.refresh(sub)
        assert sub.status == SubscriptionStatus.ACTIVE

    def test_cancelled_marks_subscription(self, client, db, test_organization, rzp_mocks):
        plan = make_plan(db)
        sub = make_subscription(db, test_organization.id, plan)

        response = post_event(
            client, "subscription.cancelled",
            subscription_payload(sub.payment_provider_subscription_id,
                                 test_organization.id, plan, status="cancelled")
        )

        assert response.status_code == 200
        db.refresh(sub)
        assert sub.status == SubscriptionStatus.CANCELLED

    def test_unknown_subscription_events_acknowledged(self, client, db, test_organization, rzp_mocks):
        plan = make_plan(db)
        # No DB subscription exists for this id - must still 200 (no retry storm)
        response = post_event(
            client, "subscription.cancelled",
            subscription_payload("sub_ghost", test_organization.id, plan, status="cancelled")
        )
        assert response.status_code == 200
