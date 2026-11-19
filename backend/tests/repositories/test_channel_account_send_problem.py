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

from app.api.channels.accounts import to_account_out
from app.channels.base import DeliveryState, SendResult, StatusEvent
from app.repositories.channels import ChannelAccountRepository
from app.repositories.channels.accounts import send_problem


@pytest.fixture
def repo(db):
    return ChannelAccountRepository(db)


@pytest.fixture
def account(repo, test_organization):
    return repo.create_account(
        organization_id=test_organization.id,
        channel_type="whatsapp",
        external_account_id="PN-register",
        credentials={"access_token": "token"},
        display_name="Test Number",
        settings={"meta_app_id": "123"},
    )


def _reloaded(db, repo, account):
    db.expire_all()
    return repo.get_by_id(account.id)


def test_a_new_account_has_no_send_problem(db, account):
    assert send_problem(account) is None
    assert to_account_out(db, account).send_problem is None


def test_a_failure_is_kept_beside_other_settings(db, repo, account):
    repo.set_send_problem(account, "PIN mismatch")

    stored = _reloaded(db, repo, account)
    assert send_problem(stored) == "PIN mismatch"
    assert stored.settings["meta_app_id"] == "123"
    assert to_account_out(db, stored).send_problem == "PIN mismatch"


def test_a_later_successful_register_clears_it(db, repo, account):
    repo.set_send_problem(account, "PIN mismatch")

    repo.set_send_problem(account, None)

    assert _reloaded(db, repo, account).settings == {"meta_app_id": "123"}


def test_an_accepted_send_does_not_clear_it(db, repo, account):
    """The send API accepts messages that fail later, so acceptance proves
    nothing about the account."""
    repo.set_send_problem(account, "PIN mismatch")

    repo.track_send_result(account, SendResult(ok=True, external_message_id="wamid.1"))

    assert send_problem(_reloaded(db, repo, account)) == "PIN mismatch"


def _receipt(status, **overrides):
    return StatusEvent(external_account_id="PN-register", external_message_id="wamid.1",
                       recipient_id="27000", status=status, **overrides)


@pytest.mark.parametrize("status", [DeliveryState.DELIVERED, DeliveryState.READ])
def test_a_delivered_or_read_receipt_clears_it(db, repo, account, status):
    repo.set_send_problem(account, "PIN mismatch")

    repo.track_receipt(account, _receipt(status))

    assert send_problem(_reloaded(db, repo, account)) is None


def test_a_sent_receipt_proves_nothing(db, repo, account):
    repo.set_send_problem(account, "PIN mismatch")

    repo.track_receipt(account, _receipt(DeliveryState.SENT))

    assert send_problem(_reloaded(db, repo, account)) == "PIN mismatch"


def test_a_failure_blamed_on_the_account_sets_it(db, repo, account):
    """tkt-8: replies accepted, then failed as 'Business account has been locked'."""
    repo.track_receipt(account, _receipt(
        DeliveryState.FAILED, error="Business account has been locked.",
        error_code="131031", account_blocked=True))

    stored = _reloaded(db, repo, account)
    assert send_problem(stored) == "Business account has been locked."
    assert stored.settings["meta_app_id"] == "123"


def test_a_failure_about_one_message_leaves_it_alone(db, repo, account):
    repo.track_receipt(account, _receipt(
        DeliveryState.FAILED, error="Re-engagement message", error_code="131047"))

    assert send_problem(_reloaded(db, repo, account)) is None
