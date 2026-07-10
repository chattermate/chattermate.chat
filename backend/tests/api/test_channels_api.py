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
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient

import app.main  # noqa: F401 — ensures routers are registered on the FastAPI app
from app.core.application import app
from app.core.auth import get_current_user, get_current_organization
from app.database import get_db
from app.repositories.channels import ChannelAccountRepository, AgentChannelConfigRepository

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
