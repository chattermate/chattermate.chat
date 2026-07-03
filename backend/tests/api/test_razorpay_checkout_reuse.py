"""
ChatterMate - Razorpay Checkout Reuse Guard Tests
Copyright (C) 2024 ChatterMate

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>
"""

from unittest.mock import MagicMock, patch

import pytest

from app.enterprise.routes import razorpay as razorpay_routes


CACHED = {"subscription_id": "sub_cached123", "status": "created",
          "currency": "INR", "amount": 349.0, "due_now": 0.0,
          "start_at": None, "upi_blocked": False, "change_type": "new"}


def make_service(provider_status):
    service = MagicMock()
    service.fetch_subscription.return_value = {"id": "sub_cached123",
                                               "status": provider_status}
    return service


@pytest.mark.asyncio
async def test_reuses_checkout_still_in_created_state():
    service = make_service("created")
    with patch.object(razorpay_routes, "_cached_checkout", return_value=dict(CACHED)):
        result = await razorpay_routes._reusable_checkout("key", service)
    assert result["subscription_id"] == "sub_cached123"


@pytest.mark.asyncio
@pytest.mark.parametrize("provider_status", ["authenticated", "active", "cancelled"])
async def test_drops_cache_when_subscription_already_used(provider_status):
    """Subscribe at qty 1 -> upgrade to 2 -> reduce back to 1 collides with the
    original (now active) checkout's cache key; reusing it fails at Razorpay."""
    service = make_service(provider_status)
    with patch.object(razorpay_routes, "_cached_checkout", return_value=dict(CACHED)), \
         patch.object(razorpay_routes, "_drop_cached_checkout") as drop:
        result = await razorpay_routes._reusable_checkout("key", service)
    assert result is None
    drop.assert_called_once_with("key")


@pytest.mark.asyncio
async def test_drops_cache_when_provider_lookup_fails():
    service = MagicMock()
    service.fetch_subscription.side_effect = RuntimeError("provider down")
    with patch.object(razorpay_routes, "_cached_checkout", return_value=dict(CACHED)), \
         patch.object(razorpay_routes, "_drop_cached_checkout") as drop:
        result = await razorpay_routes._reusable_checkout("key", service)
    assert result is None
    drop.assert_called_once_with("key")


@pytest.mark.asyncio
async def test_no_cache_entry_returns_none_without_provider_call():
    service = MagicMock()
    with patch.object(razorpay_routes, "_cached_checkout", return_value=None):
        result = await razorpay_routes._reusable_checkout("key", service)
    assert result is None
    service.fetch_subscription.assert_not_called()
