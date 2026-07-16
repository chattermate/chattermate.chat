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


class TestEmbeddedSignupConfig:
    """Embedded Signup onboards a number under ChatterMate's own approved Meta
    app, so without a config id it structurally cannot work — that is the whole
    gate. Like every other integration, it is not restricted by plan."""

    def test_disabled_without_config_id(self, client, monkeypatch):
        monkeypatch.setattr(settings, "META_CONFIG_ID", "")
        r = client.get(f"{BASE}/embedded-signup-config")

        assert r.status_code == 200
        assert r.json()["enabled"] is False

    def test_enabled_with_config_id(self, client, monkeypatch):
        monkeypatch.setattr(settings, "META_CONFIG_ID", "CFG1")
        monkeypatch.setattr(settings, "META_APP_ID", "APP1")
        r = client.get(f"{BASE}/embedded-signup-config")

        assert r.status_code == 200
        body = r.json()
        assert (body["enabled"], body["config_id"], body["app_id"]) == (True, "CFG1", "APP1")

    def test_config_not_leaked_when_disabled(self, client, monkeypatch):
        monkeypatch.setattr(settings, "META_CONFIG_ID", "")
        monkeypatch.setattr(settings, "META_APP_ID", "APP1")
        body = client.get(f"{BASE}/embedded-signup-config").json()

        assert body["config_id"] is None
        assert body["app_id"] is None

    def test_not_restricted_by_plan(self, client, monkeypatch):
        """Integrations are not plan-gated, so a config id is sufficient — the
        org in these tests has no subscription at all."""
        monkeypatch.setattr(settings, "META_CONFIG_ID", "CFG1")
        assert client.get(f"{BASE}/embedded-signup-config").json()["enabled"] is True


class TestEmbeddedSignupConnect:
    ES = f"{BASE}/whatsapp/embedded-signup"
    PAYLOAD = {"code": "AQD-code", "waba_id": "WABA9", "phone_number_id": "PN555"}

    @pytest.fixture(autouse=True)
    def enabled(self, monkeypatch):
        monkeypatch.setattr(settings, "META_CONFIG_ID", "CFG1")

    # The WABA's numbers, as Graph lists them for the exchanged token
    WABA_NUMBERS = (True, {"data": [
        {"id": "PN555", "display_phone_number": "1555", "verified_name": "Acme"},
    ]})

    def test_exchanges_code_and_connects_number(self, client, db, monkeypatch):
        exchange = AsyncMock(return_value=(True, {"access_token": "EAAG-business"}))
        register = AsyncMock(return_value=(True, {"success": True}))
        numbers = AsyncMock(return_value=self.WABA_NUMBERS)
        subscribe = AsyncMock(return_value=True)
        with patch("app.api.channels.meta.exchange_signup_code", exchange), \
             patch("app.api.channels.meta.register_phone_number", register), \
             patch("app.api.channels.meta.graph_get", numbers), \
             patch("app.api.channels.meta.subscribe_app", subscribe):
            r = client.post(self.ES, json=self.PAYLOAD)

        assert r.status_code == 200
        assert "Acme" in r.json()["display_name"]
        exchange.assert_awaited_once_with("AQD-code")
        # Same persistence as a manual connect — only the credentials differ
        account = ChannelAccountRepository(db).get_by_external_id("whatsapp", "PN555")
        credentials = ChannelAccountRepository(db).get_credentials(account)
        assert credentials["access_token"] == "EAAG-business"
        assert credentials["waba_id"] == "WABA9"
        # The PIN is kept: re-registering the number later needs the same one
        assert credentials["verification_pin"].isdigit()
        subscribe.assert_awaited_once()
        assert subscribe.await_args.args[0] == "WABA9"

    def test_stale_code_is_400(self, client):
        exchange = AsyncMock(return_value=(False, {"error": {"message": "Code expired"}}))
        with patch("app.api.channels.meta.exchange_signup_code", exchange):
            r = client.post(self.ES, json=self.PAYLOAD)

        assert r.status_code == 400
        assert r.json()["detail"] == "Code expired"

    def test_exchange_without_token_is_400(self, client):
        """A 200 that carries no token must not connect a tokenless account."""
        exchange = AsyncMock(return_value=(True, {}))
        with patch("app.api.channels.meta.exchange_signup_code", exchange):
            r = client.post(self.ES, json=self.PAYLOAD)

        assert r.status_code == 400

    def test_failed_registration_still_connects_without_storing_pin(self, client, db):
        """Registration can be retried; losing the token would mean redoing the
        whole signup, so a failure here must not abort the connect. But a PIN we
        never set must not be stored — Meta cannot read the real one back."""
        with patch("app.api.channels.meta.exchange_signup_code",
                   AsyncMock(return_value=(True, {"access_token": "EAAG-business"}))), \
             patch("app.api.channels.meta.register_phone_number",
                   AsyncMock(return_value=(False, {"error": {"message": "already registered"}}))), \
             patch("app.api.channels.meta.graph_get", AsyncMock(return_value=self.WABA_NUMBERS)), \
             patch("app.api.channels.meta.subscribe_app", AsyncMock(return_value=True)):
            r = client.post(self.ES, json=self.PAYLOAD)

        assert r.status_code == 200
        repo = ChannelAccountRepository(db)
        account = repo.get_by_external_id("whatsapp", "PN555")
        assert account is not None
        assert "verification_pin" not in repo.get_credentials(account)

    def test_rejects_a_number_not_on_the_claimed_waba(self, client, db):
        """The code proves a signup happened, not who owns the number in the
        body. Webhooks route by phone number id with no org scoping, so pairing
        a real code with someone else's number would steal their messages."""
        other_waba = (True, {"data": [{"id": "PN_ATTACKER_OWNS"}]})
        with patch("app.api.channels.meta.exchange_signup_code",
                   AsyncMock(return_value=(True, {"access_token": "EAAG-attacker"}))), \
             patch("app.api.channels.meta.graph_get", AsyncMock(return_value=other_waba)), \
             patch("app.api.channels.meta.register_phone_number", AsyncMock()) as register, \
             patch("app.api.channels.meta.subscribe_app", AsyncMock()):
            r = client.post(self.ES, json={**self.PAYLOAD, "phone_number_id": "PN_VICTIM"})

        assert r.status_code == 400
        register.assert_not_awaited()
        assert ChannelAccountRepository(db).get_by_external_id("whatsapp", "PN_VICTIM") is None

    def test_rejects_a_waba_the_token_cannot_read(self, client, db):
        unreadable = (False, {"error": {"message": "Unsupported get request"}})
        with patch("app.api.channels.meta.exchange_signup_code",
                   AsyncMock(return_value=(True, {"access_token": "EAAG-attacker"}))), \
             patch("app.api.channels.meta.graph_get", AsyncMock(return_value=unreadable)), \
             patch("app.api.channels.meta.subscribe_app", AsyncMock()):
            r = client.post(self.ES, json=self.PAYLOAD)

        assert r.status_code == 400
        assert ChannelAccountRepository(db).get_by_external_id("whatsapp", "PN555") is None

    def test_rejected_without_config_id(self, client, monkeypatch):
        monkeypatch.setattr(settings, "META_CONFIG_ID", "")
        exchange = AsyncMock()
        with patch("app.api.channels.meta.exchange_signup_code", exchange):
            r = client.post(self.ES, json=self.PAYLOAD)

        assert r.status_code == 403
        exchange.assert_not_awaited()

    def test_manual_reconnect_keeps_the_signup_pin_and_waba(self, client, db):
        """A reconnect that omits optional credentials must not drop them: the
        PIN cannot be re-read from Meta, and losing waba_id breaks templates."""
        with patch("app.api.channels.meta.exchange_signup_code",
                   AsyncMock(return_value=(True, {"access_token": "EAAG-business"}))), \
             patch("app.api.channels.meta.register_phone_number",
                   AsyncMock(return_value=(True, {"success": True}))), \
             patch("app.api.channels.meta.graph_get", AsyncMock(return_value=self.WABA_NUMBERS)), \
             patch("app.api.channels.meta.subscribe_app", AsyncMock(return_value=True)):
            client.post(self.ES, json=self.PAYLOAD)

        repo = ChannelAccountRepository(db)
        pin = repo.get_credentials(repo.get_by_external_id("whatsapp", "PN555"))["verification_pin"]

        # Now reconnect manually, entering only a fresh token
        with patch("app.api.channels.meta.graph_get",
                   AsyncMock(return_value=(True, {"verified_name": "Acme"}))), \
             patch("app.api.channels.meta.subscribe_app", AsyncMock(return_value=True)):
            r = client.post(f"{BASE}/whatsapp", json={
                "phone_number_id": "PN555", "access_token": "EAAG-rotated"})

        assert r.status_code == 200
        credentials = repo.get_credentials(repo.get_by_external_id("whatsapp", "PN555"))
        assert credentials["access_token"] == "EAAG-rotated"
        assert credentials["verification_pin"] == pin
        assert credentials["waba_id"] == "WABA9"


class TestTemplateUpsert:
    """Meta writes authentication copy itself per language, so one upsert call
    yields a reviewable template per language."""

    def test_upsert_creates_one_template_per_language(self, client, waba_account):
        graph = AsyncMock(return_value=(True, {"data": [
            {"id": "T1", "status": "PENDING", "language": "en_US"},
            {"id": "T2", "status": "PENDING", "language": "es_ES"},
        ]}))
        with patch("app.api.channels.meta.graph_post_json", graph):
            r = client.post(f"{BASE}/whatsapp/{waba_account.id}/templates/upsert", json={
                "name": "verification_code",
                "category": "AUTHENTICATION",
                "languages": ["en_US", "es_ES"],
                "components": [{"type": "BODY", "add_security_recommendation": True}]})

        assert r.status_code == 200
        body = r.json()
        assert [t["language"] for t in body] == ["en_US", "es_ES"]
        # Graph echoes id/status/language only; name comes from the request
        assert {t["name"] for t in body} == {"verification_code"}
        assert graph.await_args.args[0] == "WABA9/upsert_message_templates"
        assert graph.await_args.args[2]["languages"] == ["en_US", "es_ES"]

    def test_upsert_requires_at_least_one_language(self, client, waba_account):
        r = client.post(f"{BASE}/whatsapp/{waba_account.id}/templates/upsert", json={
            "name": "x", "category": "AUTHENTICATION", "languages": [], "components": []})
        assert r.status_code == 422

    def test_upsert_surfaces_the_graph_reason(self, client, waba_account):
        graph = AsyncMock(return_value=(False, {"error": {"message": "Invalid language"}}))
        with patch("app.api.channels.meta.graph_post_json", graph):
            r = client.post(f"{BASE}/whatsapp/{waba_account.id}/templates/upsert", json={
                "name": "x", "category": "AUTHENTICATION",
                "languages": ["zz_ZZ"], "components": []})

        assert r.status_code == 502
        assert r.json()["detail"] == "Invalid language"

    def test_upsert_rejects_a_malformed_response(self, client, waba_account):
        graph = AsyncMock(return_value=(True, {"data": {"not": "a list"}}))
        with patch("app.api.channels.meta.graph_post_json", graph):
            r = client.post(f"{BASE}/whatsapp/{waba_account.id}/templates/upsert", json={
                "name": "x", "category": "AUTHENTICATION",
                "languages": ["en_US"], "components": []})
        assert r.status_code == 502

    def test_upsert_requires_waba_id(self, client, whatsapp_account):
        r = client.post(f"{BASE}/whatsapp/{whatsapp_account.id}/templates/upsert", json={
            "name": "x", "category": "AUTHENTICATION",
            "languages": ["en_US"], "components": []})
        assert r.status_code == 400

    def test_upsert_rejects_other_orgs_account(self, client, db, waba_account):
        waba_account.organization_id = uuid4()
        db.commit()
        r = client.post(f"{BASE}/whatsapp/{waba_account.id}/templates/upsert", json={
            "name": "x", "category": "AUTHENTICATION",
            "languages": ["en_US"], "components": []})
        assert r.status_code == 404


class TestTemplatePreview:
    """Meta writes and localises authentication copy — sentence order and the
    button label both change per language — so the form asks rather than guesses."""

    # Exactly what Graph returned for a real WABA
    REAL = (True, {"data": [
        {"language": "en_US",
         "body": "*{{1}}* is your verification code. For your security, do not share this code.",
         "footer": "Expires in 5 minutes.",
         "buttons": [{"text": "Copy code", "autofill_text": "Autofill"}]},
        {"language": "es_ES",
         "body": "Tu código de verificación es *{{1}}*. Por tu seguridad, no lo compartas.",
         "footer": "Vence en 5 minutos.",
         "buttons": [{"text": "Copiar código", "autofill_text": "Autocompletar"}]},
    ]})

    def _url(self, account):
        return f"{BASE}/whatsapp/{account.id}/templates/preview"

    def test_returns_metas_copy_per_language(self, client, waba_account):
        graph = AsyncMock(return_value=self.REAL)
        with patch("app.api.channels.meta.graph_get", graph):
            r = client.get(self._url(waba_account), params={
                "languages": "en_US,es_ES",
                "add_security_recommendation": "true",
                "code_expiration_minutes": 5})

        assert r.status_code == 200
        body = r.json()
        assert [p["language"] for p in body] == ["en_US", "es_ES"]
        # The Spanish body puts the code mid-sentence — the reason this is fetched
        assert body[1]["body"].startswith("Tu código")
        assert body[1]["buttons"][0]["text"] == "Copiar código"
        assert graph.await_args.args[0] == "WABA9/message_template_previews"

    def test_passes_the_options_through_to_graph(self, client, waba_account):
        graph = AsyncMock(return_value=self.REAL)
        with patch("app.api.channels.meta.graph_get", graph):
            client.get(self._url(waba_account), params={
                "languages": "en_US",
                "add_security_recommendation": "false",
                "code_expiration_minutes": 10})

        params = graph.await_args.kwargs["params"]
        assert params["category"] == "AUTHENTICATION"
        assert params["button_types"] == "OTP"
        assert params["add_security_recommendation"] == "false"
        assert params["code_expiration_minutes"] == 10

    def test_omits_expiry_when_not_given(self, client, waba_account):
        graph = AsyncMock(return_value=self.REAL)
        with patch("app.api.channels.meta.graph_get", graph):
            client.get(self._url(waba_account), params={"languages": "en_US"})

        # No footer is wanted, so Meta must not be told to add one
        assert "code_expiration_minutes" not in graph.await_args.kwargs["params"]

    def test_surfaces_the_graph_reason(self, client, waba_account):
        graph = AsyncMock(return_value=(False, {"error": {"message": "Invalid language"}}))
        with patch("app.api.channels.meta.graph_get", graph):
            r = client.get(self._url(waba_account), params={"languages": "zz_ZZ"})

        assert r.status_code == 502
        assert r.json()["detail"] == "Invalid language"

    def test_requires_waba_id(self, client, whatsapp_account):
        r = client.get(f"{BASE}/whatsapp/{whatsapp_account.id}/templates/preview",
                       params={"languages": "en_US"})
        assert r.status_code == 400

    def test_rejects_other_orgs_account(self, client, db, waba_account):
        waba_account.organization_id = uuid4()
        db.commit()
        r = client.get(self._url(waba_account), params={"languages": "en_US"})
        assert r.status_code == 404


class TestGraphErrorDetail:
    """Meta's `message` is often a generic OAuth string; error_user_msg is the
    one that tells the user what to do about it."""

    # Verbatim from Graph when an unverified business creates an auth template
    UNVERIFIED = (False, {"error": {
        "message": "Application does not have permission for this action",
        "code": 10,
        "type": "OAuthException",
        "error_subcode": 2388185,
        "error_user_title": "Cannot create message template",
        "error_user_msg": "This WhatsApp Business account does not have permission "
                          "to create message template",
    }})

    def test_prefers_metas_human_readable_reason(self, client, waba_account):
        with patch("app.api.channels.meta.graph_post_json", AsyncMock(return_value=self.UNVERIFIED)):
            r = client.post(f"{BASE}/whatsapp/{waba_account.id}/templates", json={
                "name": "x", "category": "AUTHENTICATION", "components": []})

        assert r.status_code == 502
        # Not the useless "Application does not have permission for this action"
        assert r.json()["detail"].startswith(
            "This WhatsApp Business account does not have permission to create message template"
        )

    def test_says_how_to_fix_a_cause_we_recognise(self, client, waba_account):
        """Meta names the symptom; 2388185 means business verification."""
        with patch("app.api.channels.meta.graph_post_json", AsyncMock(return_value=self.UNVERIFIED)):
            r = client.post(f"{BASE}/whatsapp/{waba_account.id}/templates", json={
                "name": "x", "category": "AUTHENTICATION", "components": []})

        detail = r.json()["detail"]
        assert "Complete business verification in Meta Business Settings" in detail
        # One sentence break, not "...message template. Verification-code..."
        # doubled onto Meta's own trailing full stop.
        assert "template.. " not in detail

    def test_adds_nothing_to_a_cause_we_do_not_recognise(self, client, waba_account):
        graph = AsyncMock(return_value=(False, {"error": {
            "message": "Template name already exists", "error_subcode": 2388024}}))
        with patch("app.api.channels.meta.graph_post_json", graph):
            r = client.post(f"{BASE}/whatsapp/{waba_account.id}/templates", json={
                "name": "x", "category": "UTILITY", "components": []})

        assert r.json()["detail"] == "Template name already exists"

    def test_falls_back_to_message_when_there_is_no_user_msg(self, client, waba_account):
        graph = AsyncMock(return_value=(False, {"error": {"message": "Invalid parameter"}}))
        with patch("app.api.channels.meta.graph_post_json", graph):
            r = client.post(f"{BASE}/whatsapp/{waba_account.id}/templates", json={
                "name": "x", "category": "UTILITY", "components": []})

        assert r.json()["detail"] == "Invalid parameter"

    def test_falls_back_to_our_own_text_when_graph_says_nothing(self, client, waba_account):
        with patch("app.api.channels.meta.graph_post_json", AsyncMock(return_value=(False, {}))):
            r = client.post(f"{BASE}/whatsapp/{waba_account.id}/templates", json={
                "name": "x", "category": "UTILITY", "components": []})

        assert r.json()["detail"] == "Could not create template"
