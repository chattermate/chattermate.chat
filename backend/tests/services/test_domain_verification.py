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

Domain verification tests with mocked DNS/HTTPS: claim/reset semantics,
per-record outcomes, verified transitions and SSL probe states, plus the
domain API endpoints.
"""

from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient

import app.main  # noqa: F401 — ensures routers are registered
from app.core.application import app
from app.core.auth import get_current_user
from app.database import get_db
from app.models.help_center import HelpCenterSettings, DomainStatus, SSLStatus
from app.services import domain_verification as dv

BASE = "/api/v1/help-center"


@pytest.fixture
def row(db, test_organization):
    settings_row = HelpCenterSettings(organization_id=test_organization.id, slug="test-org")
    db.add(settings_row)
    db.commit()
    db.refresh(settings_row)
    return settings_row


@pytest.fixture
def client(db, test_user):
    from app.models.permission import Permission
    perm = Permission(name="manage_knowledge")
    db.add(perm)
    test_user.role.permissions.append(perm)
    db.commit()

    async def override_user():
        return test_user

    def override_db():
        yield db

    app.dependency_overrides[get_current_user] = override_user
    app.dependency_overrides[get_db] = override_db
    yield TestClient(app)
    app.dependency_overrides.clear()


def test_set_domain_generates_token_and_resets_state(db, row):
    row = dv.set_custom_domain(db, row, "help.customer.com")
    assert row.custom_domain == "help.customer.com"
    assert len(row.domain_verification_token) == 32
    assert row.domain_status == DomainStatus.PENDING
    first_token = row.domain_verification_token
    # Re-claiming rotates the token and resets verification.
    row.txt_record_verified = True
    db.commit()
    row = dv.set_custom_domain(db, row, "support.customer.com")
    assert row.domain_verification_token != first_token
    assert row.txt_record_verified is False


def test_set_domain_rejects_base_domain_hosts(db, row):
    with pytest.raises(ValueError):
        dv.set_custom_domain(db, row, "acme.chattermate.help")


def test_verify_partial_records_stay_pending(db, row):
    dv.set_custom_domain(db, row, "help.customer.com")
    with patch.object(dv, "check_txt_record", return_value=True), \
         patch.object(dv, "check_cname_record", return_value=False):
        row = dv.verify_custom_domain(db, row)
    assert row.txt_record_verified is True
    assert row.cname_record_verified is False
    assert row.domain_status == DomainStatus.PENDING
    assert row.ssl_status == SSLStatus.NONE.value
    assert row.domain_verified_at is None


def test_verify_both_records_marks_verified_and_probes_ssl(db, row):
    dv.set_custom_domain(db, row, "help.customer.com")
    with patch.object(dv, "check_txt_record", return_value=True), \
         patch.object(dv, "check_cname_record", return_value=True), \
         patch.object(dv, "probe_ssl", return_value=False):
        row = dv.verify_custom_domain(db, row)
    assert row.domain_status == DomainStatus.VERIFIED
    assert row.domain_verified_at is not None
    assert row.ssl_status == SSLStatus.PENDING.value

    with patch.object(dv, "check_txt_record", return_value=True), \
         patch.object(dv, "check_cname_record", return_value=True), \
         patch.object(dv, "probe_ssl", return_value=True):
        row = dv.verify_custom_domain(db, row)
    assert row.ssl_status == SSLStatus.ACTIVE.value


def test_verify_regression_unverifies(db, row):
    dv.set_custom_domain(db, row, "help.customer.com")
    with patch.object(dv, "check_txt_record", return_value=True), \
         patch.object(dv, "check_cname_record", return_value=True), \
         patch.object(dv, "probe_ssl", return_value=True):
        row = dv.verify_custom_domain(db, row)
    assert row.domain_status == DomainStatus.VERIFIED
    # Records later removed at the DNS provider.
    with patch.object(dv, "check_txt_record", return_value=False), \
         patch.object(dv, "check_cname_record", return_value=True):
        row = dv.verify_custom_domain(db, row)
    assert row.domain_status == DomainStatus.PENDING
    assert row.ssl_status == SSLStatus.NONE.value


def test_clear_domain(db, row):
    dv.set_custom_domain(db, row, "help.customer.com")
    row = dv.clear_custom_domain(db, row)
    assert row.custom_domain is None
    assert row.domain_status == DomainStatus.UNVERIFIED


# ---------- endpoints ----------

def test_domain_endpoints_flow(client, db, test_organization):
    set_response = client.post(f"{BASE}/domain", json={"domain": "Help.Customer.COM"})
    assert set_response.status_code == 200
    body = set_response.json()
    assert body["custom_domain"] == "help.customer.com"
    assert body["domain_status"] == "pending"
    assert [r["type"] for r in body["records"]] == ["CNAME", "TXT"]
    assert body["records"][1]["host"] == "_chattermate.help.customer.com"

    with patch.object(dv, "check_txt_record", return_value=True), \
         patch.object(dv, "check_cname_record", return_value=True), \
         patch.object(dv, "probe_ssl", return_value=True):
        verify_response = client.post(f"{BASE}/domain/verify")
    assert verify_response.status_code == 200
    assert verify_response.json()["domain_status"] == "verified"
    assert verify_response.json()["ssl_status"] == "active"

    status_response = client.get(f"{BASE}/domain/status")
    assert status_response.json()["domain_status"] == "verified"

    removed = client.delete(f"{BASE}/domain")
    assert removed.json()["custom_domain"] is None


def test_verify_without_domain_400(client):
    assert client.post(f"{BASE}/domain/verify").status_code == 400


def test_set_domain_rejects_invalid_hostnames(client):
    assert client.post(f"{BASE}/domain", json={"domain": "not a domain"}).status_code == 422
    assert client.post(f"{BASE}/domain", json={"domain": "x.chattermate.help"}).status_code == 400
