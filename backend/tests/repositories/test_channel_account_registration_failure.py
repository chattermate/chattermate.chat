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
from app.channels.base import SendResult
from app.repositories.channels import ChannelAccountRepository
from app.repositories.channels.accounts import registration_failure


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


def test_a_new_account_has_no_registration_failure(db, account):
    assert registration_failure(account) is None
    assert to_account_out(db, account).registration_error is None


def test_a_failure_is_kept_beside_other_settings(db, repo, account):
    repo.set_registration_failure(account, "PIN mismatch")

    stored = _reloaded(db, repo, account)
    assert registration_failure(stored) == "PIN mismatch"
    assert stored.settings["meta_app_id"] == "123"
    assert to_account_out(db, stored).registration_error == "PIN mismatch"


def test_a_later_successful_register_clears_it(db, repo, account):
    repo.set_registration_failure(account, "PIN mismatch")

    repo.set_registration_failure(account, None)

    assert _reloaded(db, repo, account).settings == {"meta_app_id": "123"}


def test_a_reply_that_got_out_clears_it(db, repo, account):
    """The number was registered some other way, so the warning is stale."""
    repo.set_registration_failure(account, "PIN mismatch")

    repo.track_send_result(account, SendResult(ok=True))

    assert registration_failure(_reloaded(db, repo, account)) is None


def test_a_failed_reply_keeps_it(db, repo, account):
    repo.set_registration_failure(account, "PIN mismatch")

    repo.track_send_result(account, SendResult(ok=False, error="Business account has been locked."))

    assert registration_failure(_reloaded(db, repo, account)) == "PIN mismatch"
