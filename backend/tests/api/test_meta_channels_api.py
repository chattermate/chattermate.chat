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
from unittest.mock import AsyncMock, patch
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient

import app.main  # noqa: F401 — ensures routers are registered on the FastAPI app
from app.core.application import app
from app.core.auth import get_current_user, get_current_organization
from app.core.config import settings
from app.database import get_db
from app.channels.base import SendResult
from app.repositories.channels import ChannelAccountRepository

BASE = "/api/v1/channels/meta"
WEBHOOK = "/api/v1/webhooks/meta"

APP_SECRET = "test-meta-secret"


@pytest.fixture
def client(db, test_user, test_organization, monkeypatch):
    monkeypatch.setattr(settings, "META_APP_SECRET", APP_SECRET)
    monkeypatch.setattr(settings, "META_WEBHOOK_VERIFY_TOKEN", "vtok")

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


def signed(payload: dict):
    body = json.dumps(payload).encode()
    sig = "sha256=" + hmac.new(APP_SECRET.encode(), body, hashlib.sha256).hexdigest()
    return body, {"X-Hub-Signature-256": sig, "Content-Type": "application/json"}


@pytest.fixture
def whatsapp_account(db, test_organization):
    return ChannelAccountRepository(db).create_account(
        organization_id=test_organization.id,
        channel_type="whatsapp",
        external_account_id="PN123",
        credentials={"access_token": "EAAG-token"},
        display_name="Acme (+1555…)",
    )


class TestMetaWebhook:
    WA_PAYLOAD = {
        "object": "whatsapp_business_account",
        "entry": [{"changes": [{"value": {
            "metadata": {"phone_number_id": "PN123"},
            "contacts": [{"profile": {"name": "Ada"}, "wa_id": "447"}],
            "messages": [{"from": "447", "id": "wamid.1", "type": "text",
                          "text": {"body": "hi"}, "timestamp": "1720000000"}],
        }}]}],
    }

    def test_get_challenge_ok(self, client):
        r = client.get(WEBHOOK, params={
            "hub.mode": "subscribe", "hub.verify_token": "vtok", "hub.challenge": "42"})
        assert r.status_code == 200
        assert r.text == "42"

    def test_get_challenge_bad_token(self, client):
        r = client.get(WEBHOOK, params={
            "hub.mode": "subscribe", "hub.verify_token": "nope", "hub.challenge": "42"})
        assert r.status_code == 403

    def test_post_bad_signature_403(self, client):
        r = client.post(WEBHOOK, content=json.dumps(self.WA_PAYLOAD),
                        headers={"X-Hub-Signature-256": "sha256=bad",
                                 "Content-Type": "application/json"})
        assert r.status_code == 403

    def test_post_routes_whatsapp_to_processor(self, client, whatsapp_account):
        body, headers = signed(self.WA_PAYLOAD)
        with patch("app.api.webhooks.meta.process_channel_message", AsyncMock()) as process:
            r = client.post(WEBHOOK, content=body, headers=headers)
        assert r.status_code == 200
        process.assert_awaited_once()
        account_id, inbound = process.await_args.args
        assert account_id == whatsapp_account.id
        assert inbound.text == "hi"

    def test_post_unknown_account_acked_not_processed(self, client):
        body, headers = signed(self.WA_PAYLOAD)  # PN123 not connected
        with patch("app.api.webhooks.meta.process_channel_message", AsyncMock()) as process:
            r = client.post(WEBHOOK, content=body, headers=headers)
        assert r.status_code == 200
        process.assert_not_awaited()

    def test_post_unknown_object_ignored(self, client):
        body, headers = signed({"object": "permissions", "entry": []})
        r = client.post(WEBHOOK, content=body, headers=headers)
        assert r.status_code == 200
        assert r.json()["status"] == "ignored"


class TestMetaConnect:
    def test_connect_whatsapp_success(self, client, db):
        graph = AsyncMock(return_value=(True, {"display_phone_number": "1555", "verified_name": "Acme"}))
        with patch("app.api.channels.meta.graph_get", graph), \
             patch("app.api.channels.meta.subscribe_app", AsyncMock(return_value=True)):
            r = client.post(f"{BASE}/whatsapp", json={
                "phone_number_id": "PN9", "access_token": "EAAG-x", "waba_id": "WABA9"})
        assert r.status_code == 200
        data = r.json()
        assert data["channel_type"] == "whatsapp"
        assert "Acme" in data["display_name"]
        account = ChannelAccountRepository(db).get_by_external_id("whatsapp", "PN9")
        assert ChannelAccountRepository(db).get_credentials(account)["access_token"] == "EAAG-x"

    def test_connect_whatsapp_invalid_credentials(self, client):
        graph = AsyncMock(return_value=(False, {"error": {"message": "Invalid OAuth token"}}))
        with patch("app.api.channels.meta.graph_get", graph):
            r = client.post(f"{BASE}/whatsapp", json={
                "phone_number_id": "PN9", "access_token": "bad"})
        assert r.status_code == 400

    def test_connect_messenger_token_page_mismatch(self, client):
        graph = AsyncMock(return_value=(True, {"id": "OTHER_PAGE", "name": "Nope"}))
        with patch("app.api.channels.meta.graph_get", graph):
            r = client.post(f"{BASE}/messenger", json={
                "page_id": "PAGE9", "page_access_token": "EAAG-x"})
        assert r.status_code == 400

    def test_connect_instagram_success(self, client, db):
        graph = AsyncMock(return_value=(True, {"id": "IG7", "username": "acme"}))
        with patch("app.api.channels.meta.graph_get", graph):
            r = client.post(f"{BASE}/instagram", json={
                "ig_id": "IG7", "page_access_token": "EAAG-x"})
        assert r.status_code == 200
        assert r.json()["display_name"] == "@acme"

    def test_reconnect_other_org_409(self, client, db, whatsapp_account):
        whatsapp_account.organization_id = uuid4()
        db.commit()
        graph = AsyncMock(return_value=(True, {"display_phone_number": "1555", "verified_name": "Acme"}))
        with patch("app.api.channels.meta.graph_get", graph), \
             patch("app.api.channels.meta.subscribe_app", AsyncMock(return_value=True)):
            r = client.post(f"{BASE}/whatsapp", json={
                "phone_number_id": "PN123", "access_token": "EAAG-x"})
        assert r.status_code == 409

    def test_disconnect(self, client, db, whatsapp_account):
        r = client.delete(f"{BASE}/{whatsapp_account.id}")
        assert r.status_code == 200
        assert ChannelAccountRepository(db).get_by_id(whatsapp_account.id) is None


class TestTemplateSend:
    def test_send_template(self, client, db, whatsapp_account, test_agent, test_customer, test_organization):
        from app.repositories.channels import ChannelConversationRepository
        from app.repositories.session_to_agent import SessionToAgentRepository
        session = SessionToAgentRepository(db).create_session(
            session_id=uuid4(), agent_id=test_agent.id, customer_id=test_customer.id,
            organization_id=test_organization.id, channel="whatsapp")
        ChannelConversationRepository(db).create(
            channel_account_id=whatsapp_account.id, channel_type="whatsapp",
            external_conversation_id="447", external_user_id="447",
            session_id=session.session_id, organization_id=test_organization.id)

        send = AsyncMock(return_value=SendResult(ok=True, external_message_id="wamid.T"))
        with patch("app.channels.whatsapp.WhatsAppAdapter.send_template", send):
            r = client.post(f"{BASE}/whatsapp/{whatsapp_account.id}/send-template", json={
                "session_id": str(session.session_id),
                "template_name": "hello_world"})
        assert r.status_code == 200
        assert r.json()["external_message_id"] == "wamid.T"
        assert send.await_args.kwargs["template_name"] == "hello_world"

    def test_send_template_unknown_session_404(self, client, whatsapp_account):
        r = client.post(f"{BASE}/whatsapp/{whatsapp_account.id}/send-template", json={
            "session_id": str(uuid4()), "template_name": "hello_world"})
        assert r.status_code == 404


@pytest.fixture
def waba_account(db, test_organization):
    """A number connected with its WABA id — the prerequisite for templates."""
    return ChannelAccountRepository(db).create_account(
        organization_id=test_organization.id,
        channel_type="whatsapp",
        external_account_id="PN777",
        credentials={"access_token": "EAAG-token", "waba_id": "WABA9"},
        display_name="Acme (+1777…)",
    )


class TestTemplateManagement:
    def test_list_templates(self, client, waba_account):
        graph = AsyncMock(return_value=(True, {"data": [
            {"name": "hello_world", "status": "APPROVED", "category": "UTILITY",
             "language": "en_US", "components": [{"type": "BODY", "text": "Hi"}]},
            {"name": "promo", "status": "PENDING", "category": "MARKETING"},
        ]}))
        with patch("app.api.channels.meta.graph_get", graph):
            r = client.get(f"{BASE}/whatsapp/{waba_account.id}/templates")

        assert r.status_code == 200
        assert [t["name"] for t in r.json()] == ["hello_world", "promo"]
        # Templates live on the WABA, not the phone number
        assert graph.await_args.args[0] == "WABA9/message_templates"

    def test_list_templates_graph_failure_502(self, client, waba_account):
        graph = AsyncMock(return_value=(False, {"error": {"message": "Bad token"}}))
        with patch("app.api.channels.meta.graph_get", graph):
            r = client.get(f"{BASE}/whatsapp/{waba_account.id}/templates")

        assert r.status_code == 502
        assert r.json()["detail"] == "Bad token"

    def test_create_template(self, client, waba_account):
        graph = AsyncMock(return_value=(True, {"id": "T1", "status": "PENDING",
                                               "category": "UTILITY"}))
        with patch("app.api.channels.meta.graph_post_json", graph):
            r = client.post(f"{BASE}/whatsapp/{waba_account.id}/templates", json={
                "name": "order_update", "category": "UTILITY", "language": "en_US",
                "components": [{"type": "BODY", "text": "Your order {{1}} shipped"}]})

        assert r.status_code == 200
        body = r.json()
        assert (body["id"], body["name"], body["status"]) == ("T1", "order_update", "PENDING")

    def test_create_template_rejects_unknown_category(self, client, waba_account):
        r = client.post(f"{BASE}/whatsapp/{waba_account.id}/templates", json={
            "name": "x", "category": "NONSENSE", "components": []})
        assert r.status_code == 422

    def test_create_template_graph_failure_surfaces_reason(self, client, waba_account):
        graph = AsyncMock(return_value=(False, {"error": {"message": "name already exists"}}))
        with patch("app.api.channels.meta.graph_post_json", graph):
            r = client.post(f"{BASE}/whatsapp/{waba_account.id}/templates", json={
                "name": "dupe", "category": "UTILITY", "components": []})

        assert r.status_code == 502
        assert r.json()["detail"] == "name already exists"

    def test_delete_template(self, client, waba_account):
        graph = AsyncMock(return_value=(True, {"success": True}))
        with patch("app.api.channels.meta.graph_delete", graph):
            r = client.delete(f"{BASE}/whatsapp/{waba_account.id}/templates?name=promo")

        assert r.status_code == 200
        assert graph.await_args.args[0] == "WABA9/message_templates"
        assert graph.await_args.args[2] == {"name": "promo"}

    def test_templates_require_waba_id(self, client, whatsapp_account):
        """Numbers connected without a WABA id can message but not manage
        templates — that must be a clear 400, not a Graph failure."""
        r = client.get(f"{BASE}/whatsapp/{whatsapp_account.id}/templates")
        assert r.status_code == 400
        assert "WhatsApp Business Account ID" in r.json()["detail"]

    def test_templates_reject_non_whatsapp_account(self, client, db, test_organization):
        messenger = ChannelAccountRepository(db).create_account(
            organization_id=test_organization.id, channel_type="messenger",
            external_account_id="PAGE9", credentials={"access_token": "t"},
            display_name="Page")
        r = client.get(f"{BASE}/whatsapp/{messenger.id}/templates")
        assert r.status_code == 404

    def test_templates_reject_other_orgs_account(self, client, db, waba_account):
        waba_account.organization_id = uuid4()
        db.commit()
        r = client.get(f"{BASE}/whatsapp/{waba_account.id}/templates")
        assert r.status_code == 404

    def test_list_templates_follows_paging_cursor(self, client, waba_account):
        """A template that exists but isn't listed can't be picked to reopen a
        window, so a full page must be followed by the next one."""
        first = {"data": [{"name": f"t{i}"} for i in range(100)],
                 "paging": {"cursors": {"after": "CUR2"}}}
        second = {"data": [{"name": "t100"}]}
        graph = AsyncMock(side_effect=[(True, first), (True, second)])
        with patch("app.api.channels.meta.graph_get", graph):
            r = client.get(f"{BASE}/whatsapp/{waba_account.id}/templates")

        assert r.status_code == 200
        assert len(r.json()) == 101
        assert graph.await_args_list[1].kwargs["params"]["after"] == "CUR2"

    def test_list_templates_stops_on_short_page(self, client, waba_account):
        graph = AsyncMock(return_value=(True, {
            "data": [{"name": "only"}], "paging": {"cursors": {"after": "CUR2"}}}))
        with patch("app.api.channels.meta.graph_get", graph):
            r = client.get(f"{BASE}/whatsapp/{waba_account.id}/templates")

        assert r.status_code == 200
        assert graph.await_count == 1

    def test_delete_template_refused_in_body_is_not_success(self, client, waba_account):
        graph = AsyncMock(return_value=(True, {"success": False}))
        with patch("app.api.channels.meta.graph_delete", graph):
            r = client.delete(f"{BASE}/whatsapp/{waba_account.id}/templates?name=promo")

        assert r.status_code == 502
