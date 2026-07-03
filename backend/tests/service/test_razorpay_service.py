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
import pytest
from datetime import datetime, timedelta, timezone
from unittest.mock import MagicMock
from uuid import uuid4

# Enterprise-only feature; skip cleanly in community checkouts.
pytest.importorskip("app.enterprise.services.razorpay_service")

from razorpay.errors import SignatureVerificationError  # noqa: E402

from app.enterprise.services.razorpay_service import (  # noqa: E402
    RazorpayService,
    _to_minor_units,
    _to_major_units,
    UPI_MANDATE_CAP_INR,
)
from app.enterprise.models.plan import Plan, PlanType  # noqa: E402
from app.enterprise.models.subscription import Subscription, SubscriptionStatus  # noqa: E402
from app.enterprise.models.refund import Refund, RefundStatus  # noqa: E402
from app.core.config import settings  # noqa: E402


TEST_KEY_SECRET = "test_key_secret"
TEST_WEBHOOK_SECRET = "test_webhook_secret"


@pytest.fixture
def service(monkeypatch):
    monkeypatch.setattr(settings, "RAZORPAY_KEY_ID", "rzp_test_dummy")
    monkeypatch.setattr(settings, "RAZORPAY_KEY_SECRET", TEST_KEY_SECRET)
    monkeypatch.setattr(settings, "RAZORPAY_WEBHOOK_SECRET", TEST_WEBHOOK_SECRET)
    svc = RazorpayService()
    # Keep the real client.utility (signature math) but mock the API resources
    svc.client.plan = MagicMock()
    svc.client.subscription = MagicMock()
    svc.client.invoice = MagicMock()
    svc.client.payment = MagicMock()
    return svc


def make_plan(db, *, with_plan_ids=False):
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
            "INR": {"plan_id": "plan_inr_existing" if with_plan_ids else None,
                    "price_per_agent": 899.0},
            "USD": {"plan_id": "plan_usd_existing" if with_plan_ids else None,
                    "price_per_agent": 9.99},
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
        unit_price=9.99,
        currency="USD",
        current_period_start=now - timedelta(days=15),
        current_period_end=now + timedelta(days=15),
    )
    values.update(overrides)
    subscription = Subscription(**values)
    db.add(subscription)
    db.commit()
    db.refresh(subscription)
    return subscription


# -------------------------------------------------------------- unit conversion

class TestUnitConversion:
    def test_paise_conversion(self):
        assert _to_minor_units(9.99) == 999
        assert _to_minor_units(349.0) == 34900
        assert _to_minor_units(0.5) == 50

    def test_float_artifacts_rounded(self):
        # 19.98 * 100 = 1997.9999... in floats; must round, not truncate
        assert _to_minor_units(19.98) == 1998
        assert _to_minor_units(3.99 * 3) == 1197

    def test_major_units(self):
        assert _to_major_units(1998) == 19.98
        assert _to_major_units(None) == 0.0


# ------------------------------------------------------------------ ensure_plan

class TestEnsurePlan:
    def test_reuses_existing_plan_id(self, service, db):
        plan = make_plan(db, with_plan_ids=True)
        assert service.ensure_plan(plan, "INR", db) == "plan_inr_existing"
        service.client.plan.create.assert_not_called()

    def test_creates_and_persists_plan_id(self, service, db):
        plan = make_plan(db)
        service.client.plan.create.return_value = {"id": "plan_new_inr"}

        assert service.ensure_plan(plan, "INR", db) == "plan_new_inr"

        payload = service.client.plan.create.call_args[0][0]
        assert payload["period"] == "monthly"
        assert payload["interval"] == 1
        assert payload["item"]["amount"] == 89900  # 899.0 INR in paise
        assert payload["item"]["currency"] == "INR"

        db.refresh(plan)
        assert plan.get_razorpay_plan_id("INR") == "plan_new_inr"
        # USD entry untouched
        assert plan.get_razorpay_price("USD") == 9.99

    def test_unsupported_currency_rejected(self, service, db):
        plan = make_plan(db)
        with pytest.raises(ValueError, match="Unsupported currency"):
            service.ensure_plan(plan, "EUR", db)

    def test_missing_price_rejected(self, service, db):
        plan = make_plan(db)
        plan.razorpay_plans = {"USD": {"plan_id": None, "price_per_agent": 9.99}}
        db.commit()
        with pytest.raises(ValueError, match="no INR price"):
            service.ensure_plan(plan, "INR", db)

    def test_find_plan_currency(self, service, db):
        plan = make_plan(db, with_plan_ids=True)
        assert service.find_plan_currency(plan, "plan_inr_existing") == "INR"
        assert service.find_plan_currency(plan, "plan_unknown") is None


# ---------------------------------------------------------- create_subscription

class TestCreateSubscription:
    def test_payload_shape(self, service, db, test_organization):
        plan = make_plan(db, with_plan_ids=True)
        service.client.subscription.create.return_value = {
            "id": "sub_123", "status": "created", "short_url": "https://rzp.io/i/x",
        }

        result = service.create_subscription(
            test_organization.id, plan, quantity=3, currency="USD", db=db,
        )

        payload = service.client.subscription.create.call_args[0][0]
        assert payload["plan_id"] == "plan_usd_existing"
        assert payload["quantity"] == 3
        assert payload["total_count"] == 120  # monthly
        assert payload["customer_notify"] == 1
        assert payload["notes"]["org_id"] == str(test_organization.id)
        assert payload["notes"]["plan_id"] == str(plan.id)
        assert "start_at" not in payload
        assert result == {
            "subscription_id": "sub_123", "status": "created",
            "short_url": "https://rzp.io/i/x",
        }

    def test_future_start_at_epoch(self, service, db, test_organization):
        plan = make_plan(db, with_plan_ids=True)
        service.client.subscription.create.return_value = {"id": "sub_f", "status": "created"}
        start_at = datetime.now(timezone.utc) + timedelta(days=10)

        service.create_subscription(
            test_organization.id, plan, quantity=1, currency="INR", db=db, start_at=start_at,
        )

        payload = service.client.subscription.create.call_args[0][0]
        assert payload["start_at"] == int(start_at.timestamp())
        assert payload["plan_id"] == "plan_inr_existing"

    def test_yearly_total_count(self, service, db, test_organization):
        plan = make_plan(db, with_plan_ids=True)
        plan.billing_interval = "yearly"
        db.commit()
        service.client.subscription.create.return_value = {"id": "sub_y", "status": "created"}

        service.create_subscription(test_organization.id, plan, quantity=1, currency="USD", db=db)

        assert service.client.subscription.create.call_args[0][0]["total_count"] == 10


# ------------------------------------------------------------------ cancelation

class TestCancelSubscription:
    def test_cancel_at_cycle_end_flag(self, service):
        service.client.subscription.cancel.return_value = {"status": "active"}
        service.cancel_subscription("sub_1", at_cycle_end=True)
        service.client.subscription.cancel.assert_called_once_with(
            "sub_1", {"cancel_at_cycle_end": 1}
        )

    def test_cancel_immediately(self, service):
        service.client.subscription.cancel.return_value = {"status": "cancelled"}
        service.cancel_subscription("sub_1", at_cycle_end=False)
        service.client.subscription.cancel.assert_called_once_with(
            "sub_1", {"cancel_at_cycle_end": 0}
        )

    def test_unstarted_falls_back_to_pause(self, service):
        # Razorpay rejects cancel for created/authenticated subs
        service.client.subscription.cancel.side_effect = Exception(
            "Subscription is not cancellable in authenticated status"
        )
        service.client.subscription.pause.return_value = {"status": "cancelled"}

        result = service.cancel_unstarted_subscription("sub_a")

        service.client.subscription.pause.assert_called_once_with("sub_a", {"pause_at": "now"})
        assert result["status"] == "cancelled"


# ---------------------------------------------------------------- refund_unused

def _mock_invoices(service, payment_id="pay_1", amount_paise=1998, created_at=100):
    service.client.invoice.all.return_value = {
        "items": [
            {"status": "paid", "payment_id": payment_id,
             "amount_paid": amount_paise, "amount": amount_paise,
             "currency": "USD", "created_at": created_at},
            {"status": "issued", "payment_id": None,
             "amount": amount_paise, "currency": "USD", "created_at": created_at + 1},
        ]
    }


class TestRefundUnused:
    def test_happy_path_refund_capped_and_processed(self, service, db, test_organization):
        plan = make_plan(db)
        sub = make_subscription(db, test_organization.id, plan)
        _mock_invoices(service)
        service.client.payment.fetch.return_value = {
            "status": "captured", "amount_refunded": 0,
        }
        service.client.payment.refund.return_value = {"id": "rfnd_1"}

        result = service.refund_unused(sub, db)

        assert result["status"] == RefundStatus.PROCESSED
        assert result["provider_refund_id"] == "rfnd_1"
        refund_args = service.client.payment.refund.call_args
        assert refund_args[0][0] == "pay_1"
        # ~half of 19.98 remains; must never exceed the captured amount
        assert 0 < refund_args[0][1]["amount"] <= 1998

    def test_cap_at_unrefunded_amount(self, service, db, test_organization):
        plan = make_plan(db)
        sub = make_subscription(db, test_organization.id, plan)
        _mock_invoices(service)
        # 15.00 already refunded of 19.98 -> at most 4.98 refundable
        service.client.payment.fetch.return_value = {
            "status": "captured", "amount_refunded": 1500,
        }
        service.client.payment.refund.return_value = {"id": "rfnd_2"}

        result = service.refund_unused(sub, db)

        assert result["status"] == RefundStatus.PROCESSED
        assert service.client.payment.refund.call_args[0][1]["amount"] <= 498

    def test_non_captured_payment_not_refunded(self, service, db, test_organization):
        plan = make_plan(db)
        sub = make_subscription(db, test_organization.id, plan)
        _mock_invoices(service)
        # disputed / already fully refunded payments must not be touched
        service.client.payment.fetch.return_value = {"status": "refunded"}

        result = service.refund_unused(sub, db)

        assert result["status"] == RefundStatus.FAILED
        service.client.payment.refund.assert_not_called()

    def test_no_paid_invoice_marks_failed(self, service, db, test_organization):
        plan = make_plan(db)
        sub = make_subscription(db, test_organization.id, plan)
        service.client.invoice.all.return_value = {"items": []}

        result = service.refund_unused(sub, db)

        assert result["status"] == RefundStatus.FAILED
        service.client.payment.refund.assert_not_called()

    def test_duplicate_refund_guard(self, service, db, test_organization):
        plan = make_plan(db)
        sub = make_subscription(db, test_organization.id, plan)
        _mock_invoices(service)
        service.client.payment.fetch.return_value = {"status": "captured", "amount_refunded": 0}
        service.client.payment.refund.return_value = {"id": "rfnd_1"}

        first = service.refund_unused(sub, db)
        assert first["status"] == RefundStatus.PROCESSED

        # Replayed activation webhook must not refund twice
        assert service.refund_unused(sub, db) is None
        assert service.client.payment.refund.call_count == 1

    def test_provider_error_marks_failed_without_raising(self, service, db, test_organization):
        plan = make_plan(db)
        sub = make_subscription(db, test_organization.id, plan)
        _mock_invoices(service)
        service.client.payment.fetch.return_value = {"status": "captured", "amount_refunded": 0}
        service.client.payment.refund.side_effect = Exception("gateway down")

        result = service.refund_unused(sub, db)  # must not raise

        assert result["status"] == RefundStatus.FAILED
        assert "gateway down" in result["error"]

    def test_expired_cycle_nothing_to_refund(self, service, db, test_organization):
        plan = make_plan(db)
        now = datetime.now(timezone.utc)
        sub = make_subscription(
            db, test_organization.id, plan,
            current_period_start=now - timedelta(days=45),
            current_period_end=now - timedelta(days=15),
        )
        assert service.refund_unused(sub, db) is None
        service.client.invoice.all.assert_not_called()


# ----------------------------------------------------------------- verification

def _sign(body: bytes, secret: str) -> str:
    return hmac.new(secret.encode(), body, hashlib.sha256).hexdigest()


class TestVerification:
    def test_webhook_valid_signature(self, service):
        body = b'{"event": "subscription.charged"}'
        assert service.verify_webhook(body, _sign(body, TEST_WEBHOOK_SECRET)) is True

    def test_webhook_invalid_signature(self, service):
        body = b'{"event": "subscription.charged"}'
        assert service.verify_webhook(body, _sign(body, "wrong_secret")) is False

    def test_webhook_tampered_body(self, service):
        signature = _sign(b'{"amount": 100}', TEST_WEBHOOK_SECRET)
        assert service.verify_webhook(b'{"amount": 999}', signature) is False

    def test_webhook_missing_signature(self, service):
        assert service.verify_webhook(b"{}", None) is False

    def test_webhook_missing_secret_config(self, service, monkeypatch):
        monkeypatch.setattr(settings, "RAZORPAY_WEBHOOK_SECRET", "")
        body = b"{}"
        assert service.verify_webhook(body, _sign(body, "")) is False

    def test_checkout_valid_signature(self, service):
        msg = "pay_123|sub_456".encode()
        assert service.verify_checkout_signature(
            "pay_123", "sub_456", _sign(msg, TEST_KEY_SECRET)
        ) is True

    def test_checkout_invalid_signature(self, service):
        assert service.verify_checkout_signature("pay_123", "sub_456", "deadbeef") is False

    def test_checkout_swapped_ids_rejected(self, service):
        msg = "sub_456|pay_123".encode()  # wrong order
        assert service.verify_checkout_signature(
            "pay_123", "sub_456", _sign(msg, TEST_KEY_SECRET)
        ) is False
