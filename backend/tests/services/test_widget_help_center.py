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

from unittest.mock import patch

import pytest

from app.models.help_center import HelpCenterSettings, SSLStatus
from app.services import widget_help_center
from app.services.widget_help_center import help_center_url


@pytest.fixture
def allowed():
    with patch.object(widget_help_center, "help_center_allowed", return_value=True) as check:
        yield check


def _site(db, organization_id, **fields):
    row = HelpCenterSettings(organization_id=organization_id, **fields)
    db.add(row)
    db.commit()
    return row


class TestHelpCenterUrl:
    def test_a_live_help_center(self, db, test_organization_id, allowed):
        _site(db, test_organization_id, enabled=True, slug="acme")
        with _mode("subdomain"):
            assert help_center_url(db, test_organization_id) == "https://acme.help.example"

    def test_no_help_center(self, db, test_organization_id, allowed):
        assert help_center_url(db, test_organization_id) is None

    def test_a_switched_off_help_center(self, db, test_organization_id, allowed):
        _site(db, test_organization_id, enabled=False, slug="acme")
        assert help_center_url(db, test_organization_id) is None

    def test_a_help_center_without_a_slug(self, db, test_organization_id, allowed):
        _site(db, test_organization_id, enabled=True, slug=None)
        assert help_center_url(db, test_organization_id) is None

    def test_a_plan_that_no_longer_includes_it(self, db, test_organization_id):
        _site(db, test_organization_id, enabled=True, slug="acme")
        with patch.object(widget_help_center, "help_center_allowed", return_value=False):
            assert help_center_url(db, test_organization_id) is None

    def test_path_mode(self, db, test_organization_id, allowed):
        _site(db, test_organization_id, enabled=True, slug="acme")
        with _mode("path"):
            assert help_center_url(db, test_organization_id) == "https://api.acme.example/help/acme"

    def test_a_verified_custom_domain_with_its_certificate(self, db, test_organization_id, allowed):
        _site(db, test_organization_id, enabled=True, slug="acme", **_domain(SSLStatus.ACTIVE))
        with _mode("subdomain"):
            assert help_center_url(db, test_organization_id) == "https://help.acme.com"

    @pytest.mark.parametrize("ssl", [SSLStatus.NONE, SSLStatus.PENDING])
    def test_a_custom_domain_still_waiting_for_its_certificate(self, db, test_organization_id, allowed, ssl):
        # Visitors would hit a TLS error there: the help center's own address instead.
        _site(db, test_organization_id, enabled=True, slug="acme", **_domain(ssl))
        with _mode("subdomain"):
            assert help_center_url(db, test_organization_id) == "https://acme.help.example"

    def test_an_unverified_custom_domain(self, db, test_organization_id, allowed):
        _site(db, test_organization_id, enabled=True, slug="acme",
              custom_domain="help.acme.com", txt_record_verified=True, cname_record_verified=False)
        with _mode("path"):
            assert help_center_url(db, test_organization_id) == "https://api.acme.example/help/acme"


def _domain(ssl):
    return dict(custom_domain="help.acme.com", txt_record_verified=True, cname_record_verified=True, ssl_status=ssl)


def _mode(mode):
    from contextlib import ExitStack
    stack = ExitStack()
    stack.enter_context(patch("app.services.help_center_settings.settings.HELP_CENTER_PUBLIC_MODE", mode))
    stack.enter_context(patch("app.services.help_center_settings.settings.HELP_CENTER_BASE_DOMAIN", "help.example"))
    stack.enter_context(patch("app.services.help_center_settings.settings.BACKEND_URL", "https://api.acme.example/"))
    return stack
