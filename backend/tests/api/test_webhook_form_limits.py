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

from unittest.mock import AsyncMock, patch

import pytest
from fastapi.testclient import TestClient

import app.main  # noqa: F401 — ensures routers are registered on the FastAPI app
from app.core.application import app
from app.core.auth import get_current_user, get_current_organization
from app.database import get_db
from app.repositories.channels import ChannelAccountRepository

# Starlette's own defaults for request.form(); a body past either one is refused.
MAX_FIELDS = 1000
MAX_FIELD_BYTES = 1024 * 1024


@pytest.fixture
def client(db, test_user, test_organization):
    async def override_user():
        return test_user

    async def override_org():
        return test_organization

    def override_db():
        yield db

    app.dependency_overrides[get_current_user] = override_user
    app.dependency_overrides[get_current_organization] = override_org
    app.dependency_overrides[get_db] = override_db
    yield TestClient(app)
    app.dependency_overrides.clear()


@pytest.fixture
def sms_account(db, test_organization):
    return ChannelAccountRepository(db).create_account(
        organization_id=test_organization.id, channel_type="sms",
        external_account_id="+15550001111",
        credentials={"api_key": "k", "api_secret": "s"},
        display_name="SMS", settings={"provider": "vonage"})


@pytest.fixture
def email_account(db, test_organization):
    return ChannelAccountRepository(db).create_account(
        organization_id=test_organization.id, channel_type="email",
        external_account_id="support@example.com",
        credentials={"api_key": "k"},
        display_name="Email", settings={})


def sms_url(account):
    return f"/api/v1/webhooks/sms/vonage/{account.id}?token={account.webhook_secret}"


def email_url(account):
    return f"/api/v1/webhooks/email/{account.id}?token={account.webhook_secret}"


class TestWebhookFormLimits:
    """Providers post urlencoded bodies to these routes. Starlette enforces the
    form field-count and field-size caps (it silently ignored them for
    urlencoded bodies before 1.3.1, which was the DoS). What matters here is the
    status we answer with: a 5xx tells Twilio and friends to redeliver, so an
    oversized body has to come back as a 4xx or one bad request becomes a
    retry storm.
    """

    def test_normal_form_body_is_still_processed(self, client, sms_account):
        with patch("app.api.webhooks.sms.process_channel_message", AsyncMock()) as proc:
            response = client.post(sms_url(sms_account), data={
                "msisdn": "+44700", "to": sms_account.external_account_id,
                "text": "hello", "messageId": "m1"})

        assert response.status_code == 200
        proc.assert_awaited_once()
        assert proc.await_args.args[1].text == "hello"

    def test_too_many_fields_is_rejected_without_a_retry_signal(self, client, sms_account):
        payload = {f"f{i}": "v" for i in range(MAX_FIELDS + 500)}

        with patch("app.api.webhooks.sms.process_channel_message", AsyncMock()) as proc:
            response = client.post(sms_url(sms_account), data=payload)

        assert response.status_code == 400
        assert response.status_code < 500, "5xx would make the provider redeliver"
        proc.assert_not_awaited()

    def test_oversized_field_is_rejected(self, client, sms_account):
        payload = {"text": "x" * (MAX_FIELD_BYTES + 1024)}

        with patch("app.api.webhooks.sms.process_channel_message", AsyncMock()) as proc:
            response = client.post(sms_url(sms_account), data=payload)

        assert response.status_code == 400
        proc.assert_not_awaited()

    def test_email_webhook_rejects_an_oversized_body_too(self, client, email_account):
        payload = {f"f{i}": "v" for i in range(MAX_FIELDS + 500)}

        response = client.post(email_url(email_account), data=payload)

        assert response.status_code == 400
