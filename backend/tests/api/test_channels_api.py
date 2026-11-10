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

from unittest.mock import AsyncMock, MagicMock, patch
from uuid import uuid4

import pytest
from fastapi import HTTPException
from fastapi.testclient import TestClient

import app.main  # noqa: F401 — ensures routers are registered on the FastAPI app
from app.core.application import app
from app.core.auth import get_current_user, get_current_organization
from app.database import get_db
from app.repositories.channels import ChannelAccountRepository, AgentChannelConfigRepository
from app.services import channel_access

BASE = "/api/v1/channels"
WEBHOOK_BASE = "/api/v1/webhooks"


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
def telegram_account(db, test_organization):
    return ChannelAccountRepository(db).create_account(
        organization_id=test_organization.id,
        channel_type="telegram",
        external_account_id="777",
        credentials={"bot_token": "777:token"},
        display_name="@existingbot",
    )


class TestConnectTelegram:
    def test_connect_success(self, client, db, test_agent):
        with patch("app.api.channels.telegram.telegram_api.get_me",
                   AsyncMock(return_value={"id": 555, "username": "newbot"})), \
             patch("app.api.channels.telegram.telegram_api.set_webhook",
                   AsyncMock(return_value=(True, ""))) as set_webhook:
            response = client.post(f"{BASE}/telegram", json={"bot_token": "555:tok"})

        assert response.status_code == 200
        data = response.json()
        assert data["channel_type"] == "telegram"
        assert data["display_name"] == "@newbot"
        # Webhook registered with the account's secret
        account = ChannelAccountRepository(db).get_by_id(data["id"])
        assert set_webhook.await_args.args[2] == account.webhook_secret
        # Credentials stored encrypted, not plaintext
        assert "555:tok" not in account.encrypted_credentials
        assert ChannelAccountRepository(db).get_credentials(account) == {"bot_token": "555:tok"}

    def test_connect_invalid_token(self, client):
        with patch("app.api.channels.telegram.telegram_api.get_me", AsyncMock(return_value=None)):
            response = client.post(f"{BASE}/telegram", json={"bot_token": "bad"})
        assert response.status_code == 400

    def test_connect_webhook_failure_rolls_back_new_account(self, client, db):
        with patch("app.api.channels.telegram.telegram_api.get_me",
                   AsyncMock(return_value={"id": 556, "username": "failbot"})), \
             patch("app.api.channels.telegram.telegram_api.set_webhook",
                   AsyncMock(return_value=(False, "bad webhook: an HTTPS URL must be provided"))):
            response = client.post(f"{BASE}/telegram", json={"bot_token": "556:tok"})
        assert response.status_code == 502
        assert ChannelAccountRepository(db).get_by_external_id("telegram", "556") is None

    def test_connect_bot_owned_by_other_org(self, client, db, telegram_account):
        # Reassign the existing account to another org
        telegram_account.organization_id = uuid4()
        db.commit()
        with patch("app.api.channels.telegram.telegram_api.get_me",
                   AsyncMock(return_value={"id": 777, "username": "existingbot"})):
            response = client.post(f"{BASE}/telegram", json={"bot_token": "777:token"})
        assert response.status_code == 409


class TestAccountsAndRouting:
    def test_list_accounts(self, client, telegram_account):
        response = client.get(f"{BASE}/accounts")
        assert response.status_code == 200
        accounts = response.json()
        assert len(accounts) == 1
        assert accounts[0]["display_name"] == "@existingbot"
        assert accounts[0]["agent_id"] is None
        assert "encrypted_credentials" not in accounts[0]

    def test_set_and_clear_agent(self, client, db, telegram_account, test_agent):
        response = client.post(f"{BASE}/agent-config/{telegram_account.id}",
                               json={"agent_id": str(test_agent.id)})
        assert response.status_code == 200
        assert response.json()["agent_id"] == str(test_agent.id)

        response = client.delete(f"{BASE}/agent-config/{telegram_account.id}")
        assert response.status_code == 200
        assert AgentChannelConfigRepository(db).get_by_account(telegram_account.id) is None

    def test_set_agent_cross_org_account_404(self, client, test_agent):
        response = client.post(f"{BASE}/agent-config/{uuid4()}",
                               json={"agent_id": str(test_agent.id)})
        assert response.status_code == 404

    def test_disconnect(self, client, db, telegram_account):
        with patch("app.api.channels.telegram.telegram_api.delete_webhook",
                   AsyncMock(return_value=True)):
            response = client.delete(f"{BASE}/telegram/{telegram_account.id}")
        assert response.status_code == 200
        assert ChannelAccountRepository(db).get_by_id(telegram_account.id) is None


class TestTelegramWebhook:
    UPDATE = {
        "update_id": 1,
        "message": {
            "message_id": 42,
            "from": {"id": 111, "is_bot": False, "first_name": "Ada"},
            "chat": {"id": 222, "type": "private"},
            "date": 1720000000,
            "text": "hello",
        },
    }

    def test_unknown_account_404(self, client):
        response = client.post(f"{WEBHOOK_BASE}/telegram/{uuid4()}", json=self.UPDATE)
        assert response.status_code == 404

    def test_bad_secret_403(self, client, telegram_account):
        response = client.post(
            f"{WEBHOOK_BASE}/telegram/{telegram_account.id}",
            json=self.UPDATE,
            headers={"X-Telegram-Bot-Api-Secret-Token": "wrong"},
        )
        assert response.status_code == 403

    def test_valid_update_processed_in_background(self, client, telegram_account):
        with patch("app.api.webhooks.telegram.process_channel_message", AsyncMock()) as process:
            response = client.post(
                f"{WEBHOOK_BASE}/telegram/{telegram_account.id}",
                json=self.UPDATE,
                headers={"X-Telegram-Bot-Api-Secret-Token": telegram_account.webhook_secret},
            )
        assert response.status_code == 200
        process.assert_awaited_once()
        inbound = process.await_args.args[1]
        assert inbound.text == "hello"
        assert inbound.external_conversation_id == "222"

    def test_non_message_update_ack_without_processing(self, client, telegram_account):
        with patch("app.api.webhooks.telegram.process_channel_message", AsyncMock()) as process:
            response = client.post(
                f"{WEBHOOK_BASE}/telegram/{telegram_account.id}",
                json={"update_id": 9, "edited_message": {}},
                headers={"X-Telegram-Bot-Api-Secret-Token": telegram_account.webhook_secret},
            )
        assert response.status_code == 200
        process.assert_not_awaited()


    def test_a_tap_is_processed_and_answered_in_the_reply(self, client, telegram_account):
        tap = {"update_id": 10, "callback_query": {
            "id": "cb-1", "from": {"id": 111, "first_name": "Ada"}, "data": "qr_0",
            "message": {"message_id": 41, "date": 1720000000, "chat": {"id": 222, "type": "private"},
                        "reply_markup": {"inline_keyboard": [[{"text": "Yes", "callback_data": "qr_0"}]]}}}}
        with patch("app.api.webhooks.telegram.process_channel_message", AsyncMock()) as process:
            response = client.post(
                f"{WEBHOOK_BASE}/telegram/{telegram_account.id}", json=tap,
                headers={"X-Telegram-Bot-Api-Secret-Token": telegram_account.webhook_secret})
        assert response.json() == {"method": "answerCallbackQuery", "callback_query_id": "cb-1"}
        inbound = process.await_args.args[1]
        assert (inbound.interactive.id, inbound.text, inbound.reply_to_message_id) == ("qr_0", "Yes", "41")

    def test_a_second_tap_on_the_same_keyboard_is_answered_but_not_processed(self, client, telegram_account):
        def tap(callback_id, data):
            return {"update_id": 11, "callback_query": {
                "id": callback_id, "from": {"id": 111, "first_name": "Ada"}, "data": data,
                "message": {"message_id": 41, "date": 1720000000, "chat": {"id": 222, "type": "private"},
                            "reply_markup": {"inline_keyboard": [[{"text": "Yes", "callback_data": "qr_0"}],
                                                                 [{"text": "No", "callback_data": "qr_1"}]]}}}}
        headers = {"X-Telegram-Bot-Api-Secret-Token": telegram_account.webhook_secret}
        process, clear, order = AsyncMock(), AsyncMock(), MagicMock()
        order.attach_mock(process, "process")
        order.attach_mock(clear, "clear")
        with patch("app.api.webhooks.telegram.process_channel_message", process), \
             patch("app.api.webhooks.telegram.is_duplicate_message", side_effect=[False, True]), \
             patch("app.channels.telegram.TelegramAdapter.clear_buttons", clear):
            first = client.post(f"{WEBHOOK_BASE}/telegram/{telegram_account.id}", json=tap("cb-1", "qr_0"),
                                headers=headers)
            second = client.post(f"{WEBHOOK_BASE}/telegram/{telegram_account.id}", json=tap("cb-2", "qr_1"),
                                 headers=headers)
        # The reply goes first: a slow keyboard edit never holds it up
        assert [name for name, _, _ in order.mock_calls] == ["process", "clear"]
        assert "text" not in first.json() and second.json()["text"] == "This choice is no longer available"


class TestEmailConnectSmtp:
    def test_gmail_auth_error_hints_app_password(self, client):
        import smtplib
        err = smtplib.SMTPAuthenticationError(535, b"5.7.8 Username and Password not accepted")
        with patch("app.api.channels.email.validate_smtp", side_effect=err):
            r = client.post("/api/v1/channels/email", json={
                "inbound_address": "support@acme.com",
                "smtp_host": "smtp.gmail.com", "smtp_port": 587,
                "smtp_username": "me@gmail.com", "smtp_password": "wrong"})
        assert r.status_code == 400
        assert "App Password" in r.json()["detail"]

    def test_non_gmail_auth_error_generic(self, client):
        import smtplib
        err = smtplib.SMTPAuthenticationError(535, b"bad creds")
        with patch("app.api.channels.email.validate_smtp", side_effect=err):
            r = client.post("/api/v1/channels/email", json={
                "inbound_address": "support@acme.com",
                "smtp_host": "smtp.acme.com", "smtp_port": 587,
                "smtp_username": "u", "smtp_password": "p"})
        assert r.status_code == 400
        assert "authentication failed" in r.json()["detail"].lower()

    def test_smtp_omitted_uses_platform(self, client, db):
        from app.repositories.channels import ChannelAccountRepository
        r = client.post("/api/v1/channels/email", json={"inbound_address": "help@acme.com"})
        assert r.status_code == 200
        account = ChannelAccountRepository(db).get_by_external_id("email", "help@acme.com")
        assert ChannelAccountRepository(db).get_credentials(account) == {}  # platform fallback


class TestSmsChannel:
    def test_list_providers(self, client):
        r = client.get("/api/v1/channels/sms/providers")
        assert r.status_code == 200
        names = {p["name"] for p in r.json()}
        assert {"twilio", "vonage", "messagebird", "plivo", "brevo", "sns"} <= names

    def test_connect_twilio(self, client, db):
        from app.repositories.channels import ChannelAccountRepository
        with patch("app.channels.sms.twilio.TwilioProvider.validate_credentials", AsyncMock()):
            r = client.post("/api/v1/channels/sms", json={
                "provider": "twilio", "phone_number": "+15551230000",
                "credentials": {"account_sid": "AC1", "auth_token": "tok"}})
        assert r.status_code == 200
        data = r.json()
        assert data["channel_type"] == "sms"
        assert "/webhooks/sms/twilio/" in data["webhook_url"]
        acc = ChannelAccountRepository(db).get_by_external_id("sms", "+15551230000")
        assert (acc.settings or {}).get("provider") == "twilio"

    def test_connect_vonage_stores_provider(self, client, db):
        from app.repositories.channels import ChannelAccountRepository
        r = client.post("/api/v1/channels/sms", json={
            "provider": "vonage", "phone_number": "+15551230001",
            "credentials": {"api_key": "k", "api_secret": "s"}})
        assert r.status_code == 200
        acc = ChannelAccountRepository(db).get_by_external_id("sms", "+15551230001")
        assert acc.settings["provider"] == "vonage"
        assert "/webhooks/sms/vonage/" in r.json()["webhook_url"]

    def test_connect_unknown_provider(self, client):
        r = client.post("/api/v1/channels/sms", json={
            "provider": "nope", "phone_number": "+1", "credentials": {}})
        assert r.status_code == 400

    def test_connect_invalid_credentials(self, client):
        r = client.post("/api/v1/channels/sms", json={
            "provider": "vonage", "phone_number": "+1", "credentials": {}})
        assert r.status_code == 400  # missing api_key/secret

    def test_webhook_routes_to_processor(self, client, db, test_organization):
        from app.repositories.channels import ChannelAccountRepository
        acc = ChannelAccountRepository(db).create_account(
            organization_id=test_organization.id, channel_type="sms",
            external_account_id="+15551239999",
            credentials={"api_key": "k", "api_secret": "s"},
            display_name="SMS", settings={"provider": "vonage"})
        with patch("app.api.webhooks.sms.process_channel_message", AsyncMock()) as proc:
            r = client.post(f"/api/v1/webhooks/sms/vonage/{acc.id}?token={acc.webhook_secret}",
                            data={"msisdn": "+44700", "to": "+15551239999",
                                  "text": "hello", "messageId": "v9"})
        assert r.status_code == 200
        proc.assert_awaited_once()
        assert proc.await_args.args[1].text == "hello"

    def test_webhook_without_token_rejected_for_unsigned_provider(self, client, db, test_organization):
        """Providers with no webhook signature (here Vonage with no signature secret)
        must be authenticated by the per-account token, or anyone knowing the account
        id could forge inbound SMS."""
        from app.repositories.channels import ChannelAccountRepository
        acc = ChannelAccountRepository(db).create_account(
            organization_id=test_organization.id, channel_type="sms",
            external_account_id="+15551237777",
            credentials={"api_key": "k", "api_secret": "s"},
            display_name="SMS", settings={"provider": "vonage"})
        payload = {"msisdn": "+44700", "to": "+15551237777", "text": "hi", "messageId": "v10"}

        with patch("app.api.webhooks.sms.process_channel_message", AsyncMock()) as proc:
            no_token = client.post(f"/api/v1/webhooks/sms/vonage/{acc.id}", data=payload)
            wrong_token = client.post(
                f"/api/v1/webhooks/sms/vonage/{acc.id}?token=not-the-secret", data=payload)

        assert no_token.status_code == 403
        assert wrong_token.status_code == 403
        proc.assert_not_awaited()

    def test_webhook_provider_mismatch_404(self, client, db, test_organization):
        from app.repositories.channels import ChannelAccountRepository
        acc = ChannelAccountRepository(db).create_account(
            organization_id=test_organization.id, channel_type="sms",
            external_account_id="+15551238888", credentials={"auth_token": "t"},
            display_name="SMS", settings={"provider": "twilio"})
        r = client.post(f"/api/v1/webhooks/sms/vonage/{acc.id}", data={"msisdn": "+44"})
        assert r.status_code == 404


def plan_refuses(monkeypatch):
    def refuse(db, organization_id, feature, message):
        raise HTTPException(status_code=403, detail=message)
    monkeypatch.setattr(channel_access, "check_feature_access", refuse)


class TestConnectOnAPlanWithoutChannels:
    def bot(self, bot_id):
        return patch("app.api.channels.telegram.telegram_api.get_me",
                     AsyncMock(return_value={"id": bot_id, "username": "bot"}))

    def test_a_new_telegram_bot_is_refused_and_nothing_is_stored(self, client, db, test_organization, monkeypatch):
        plan_refuses(monkeypatch)
        with self.bot(555), patch("app.api.channels.telegram.telegram_webhooks.register",
                                  AsyncMock(return_value=(True, ""))) as register:
            r = client.post(f"{BASE}/telegram", json={"bot_token": "555:t"})

        assert r.status_code == 403
        assert r.json()["detail"] == channel_access.UPGRADE_MESSAGE
        register.assert_not_awaited()
        assert ChannelAccountRepository(db).get_by_external_id("telegram", "555") is None

    def test_a_channel_it_already_has_can_be_refreshed(self, client, db, telegram_account, monkeypatch):
        plan_refuses(monkeypatch)
        with self.bot(777), patch("app.api.channels.telegram.telegram_webhooks.register",
                                  AsyncMock(return_value=(True, ""))):
            r = client.post(f"{BASE}/telegram", json={"bot_token": "777:new"})

        assert r.status_code == 200

    def test_it_can_still_disconnect(self, client, telegram_account, monkeypatch):
        plan_refuses(monkeypatch)
        with patch("app.api.channels.telegram.telegram_api.delete_webhook", AsyncMock(return_value=True)):
            r = client.delete(f"{BASE}/telegram/{telegram_account.id}")

        assert r.status_code == 200

    def test_a_new_line_account_is_refused(self, client, db, monkeypatch):
        plan_refuses(monkeypatch)
        with patch("app.api.channels.line.line_api.get_bot_info",
                   AsyncMock(return_value={"userId": "U1", "displayName": "Bot"})):
            r = client.post(f"{BASE}/line", json={"channel_access_token": "t", "channel_secret": "s"})

        assert r.status_code == 403
        assert ChannelAccountRepository(db).get_by_external_id("line", "U1") is None

    def test_a_new_email_address_is_refused(self, client, db, monkeypatch):
        plan_refuses(monkeypatch)
        r = client.post(f"{BASE}/email", json={"inbound_address": "help@acme.test"})

        assert r.status_code == 403
        assert ChannelAccountRepository(db).get_by_external_id("email", "help@acme.test") is None

    def test_a_new_sms_number_is_refused(self, client, db, monkeypatch):
        plan_refuses(monkeypatch)
        provider = MagicMock(label="Twilio", validate_credentials=AsyncMock())
        with patch("app.api.channels.sms.get_provider", return_value=provider):
            r = client.post(f"{BASE}/sms", json={"phone_number": "+15550001", "provider": "twilio",
                                                 "credentials": {"sid": "x"}})

        assert r.status_code == 403
        assert ChannelAccountRepository(db).get_by_external_id("sms", "+15550001") is None


class TestSlackInstallOnAPlanWithoutChannels:
    @pytest.fixture(autouse=True)
    def fake_slack(self):
        self.slack = AsyncMock()

    def callback(self, client, team_id, organization_id):
        response = MagicMock()
        response.json.return_value = {"ok": True, "access_token": "x", "bot_user_id": "B",
                                      "team": {"id": team_id, "name": "Acme"}}
        http = MagicMock(post=AsyncMock(return_value=response))
        http.__aenter__ = AsyncMock(return_value=http)
        http.__aexit__ = AsyncMock(return_value=None)
        with patch("app.api.channels.slack.pop_state", return_value=str(organization_id)), \
             patch("app.api.channels.slack.httpx.AsyncClient", return_value=http), \
             patch("app.api.channels.slack.channels_allowed", return_value=False), \
             patch("app.api.channels.slack.slack_api", self.slack):
            return client.get(f"{BASE}/slack/callback?code=c&state=s", follow_redirects=False)

    def test_a_new_workspace_goes_back_with_the_reason(self, client, db, test_organization):
        r = self.callback(client, "T1", test_organization.id)

        assert "status=failure" in r.headers["location"]
        assert "reason=plan_required" in r.headers["location"]
        assert ChannelAccountRepository(db).get_by_external_id("slack", "T1") is None
        # The install can't be kept, so the token it made shouldn't outlive it
        self.slack.assert_awaited_once_with("auth.revoke", "x", {}, form=True)

    def test_a_workspace_it_already_has_reconnects(self, client, db, test_organization):
        ChannelAccountRepository(db).create_account(
            organization_id=test_organization.id, channel_type="slack", external_account_id="T2",
            credentials={"access_token": "old"}, display_name="Acme")

        r = self.callback(client, "T2", test_organization.id)

        assert "status=success" in r.headers["location"]
