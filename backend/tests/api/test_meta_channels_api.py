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
from app.api.channels.meta import _seal_signup_pages
from app.channels.base import SendResult
from app.repositories.channels import ChannelAccountRepository

BASE = "/api/v1/channels/meta"
WEBHOOK = "/api/v1/webhooks/meta"

APP_SECRET = "test-meta-secret"


@pytest.fixture
def client(db, test_user, test_organization, monkeypatch):
    monkeypatch.setattr(settings, "META_APP_SECRET", APP_SECRET)
    monkeypatch.setattr(settings, "META_WEBHOOK_VERIFY_TOKEN", "vtok")

    # Template sending is inbox-agent work (require_inbox_agent), not an
    # org-admin capability; the shared test_role only carries admin perms.
    from app.models.permission import Permission
    inbox_perm = Permission(name="view_all_chats")
    db.add(inbox_perm)
    test_user.role.permissions.append(inbox_perm)
    db.commit()

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

    def test_connect_messenger_success(self, client, db):
        # A real messaging token carries pages_messaging but not
        # pages_read_engagement, so the page name is unreadable — that must not
        # block the connect, only the label.
        inspect = AsyncMock(return_value=(True, {
            "type": "PAGE", "profile_id": "PAGE9", "is_valid": True,
            "scopes": ["pages_messaging"]}))
        name = AsyncMock(return_value=(False, {"error": {"message": "needs pages_read_engagement"}}))
        with patch("app.api.channels.meta.debug_token", inspect), \
             patch("app.api.channels.meta.graph_get", name), \
             patch("app.api.channels.meta.subscribe_app", AsyncMock(return_value=True)):
            r = client.post(f"{BASE}/messenger", json={
                "page_id": "PAGE9", "page_access_token": "EAAG-x"})
        assert r.status_code == 200
        assert r.json()["display_name"] == "PAGE9"
        account = ChannelAccountRepository(db).get_by_external_id("messenger", "PAGE9")
        assert ChannelAccountRepository(db).get_credentials(account)["access_token"] == "EAAG-x"

    def test_connect_messenger_uses_page_name_when_readable(self, client):
        inspect = AsyncMock(return_value=(True, {
            "type": "PAGE", "profile_id": "PAGE9", "is_valid": True}))
        with patch("app.api.channels.meta.debug_token", inspect), \
             patch("app.api.channels.meta.graph_get", AsyncMock(return_value=(True, {"name": "Acme Support"}))), \
             patch("app.api.channels.meta.subscribe_app", AsyncMock(return_value=True)):
            r = client.post(f"{BASE}/messenger", json={
                "page_id": "PAGE9", "page_access_token": "EAAG-x"})
        assert r.status_code == 200
        assert r.json()["display_name"] == "Acme Support"

    def test_connect_messenger_token_page_mismatch(self, client):
        # Webhooks route on page id; a token for a different page would leave
        # every inbound message unmatched.
        inspect = AsyncMock(return_value=(True, {
            "type": "PAGE", "profile_id": "OTHER_PAGE", "is_valid": True}))
        with patch("app.api.channels.meta.debug_token", inspect):
            r = client.post(f"{BASE}/messenger", json={
                "page_id": "PAGE9", "page_access_token": "EAAG-x"})
        assert r.status_code == 400
        assert "OTHER_PAGE" in r.json()["detail"]

    def test_connect_messenger_rejects_a_user_token(self, client):
        inspect = AsyncMock(return_value=(True, {
            "type": "USER", "profile_id": "PAGE9", "is_valid": True}))
        with patch("app.api.channels.meta.debug_token", inspect):
            r = client.post(f"{BASE}/messenger", json={
                "page_id": "PAGE9", "page_access_token": "EAAG-x"})
        assert r.status_code == 400
        assert "Page access token" in r.json()["detail"]

    def test_connect_messenger_rejects_an_expired_token(self, client):
        inspect = AsyncMock(return_value=(True, {
            "is_valid": False, "error": {"message": "Session has expired"}}))
        with patch("app.api.channels.meta.debug_token", inspect):
            r = client.post(f"{BASE}/messenger", json={
                "page_id": "PAGE9", "page_access_token": "EAAG-x"})
        assert r.status_code == 400
        assert "Session has expired" in r.json()["detail"]

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
        with patch("app.channels.meta_base.graph_get", graph):
            r = client.get(f"{BASE}/whatsapp/{waba_account.id}/templates")

        assert r.status_code == 200
        assert [t["name"] for t in r.json()] == ["hello_world", "promo"]
        # Templates live on the WABA, not the phone number
        assert graph.await_args.args[0] == "WABA9/message_templates"

    def test_list_templates_graph_failure_502(self, client, waba_account):
        graph = AsyncMock(return_value=(False, {"error": {"message": "Bad token"}}))
        with patch("app.channels.meta_base.graph_get", graph):
            r = client.get(f"{BASE}/whatsapp/{waba_account.id}/templates")

        assert r.status_code == 502
        assert r.json()["detail"] == "Bad token"

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
        with patch("app.channels.meta_base.graph_get", graph):
            r = client.get(f"{BASE}/whatsapp/{waba_account.id}/templates")

        assert r.status_code == 200
        assert len(r.json()) == 101
        assert graph.await_args_list[1].kwargs["params"]["after"] == "CUR2"

    def test_list_templates_stops_on_short_page(self, client, waba_account):
        graph = AsyncMock(return_value=(True, {
            "data": [{"name": "only"}], "paging": {"cursors": {"after": "CUR2"}}}))
        with patch("app.channels.meta_base.graph_get", graph):
            r = client.get(f"{BASE}/whatsapp/{waba_account.id}/templates")

        assert r.status_code == 200
        assert graph.await_count == 1

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

    def test_messenger_config_id_returned_for_messenger(self, client, monkeypatch):
        monkeypatch.setattr(settings, "META_MESSENGER_CONFIG_ID", "MCFG")
        monkeypatch.setattr(settings, "META_APP_ID", "APP1")
        body = client.get(f"{BASE}/embedded-signup-config?channel=messenger").json()
        assert (body["enabled"], body["config_id"], body["app_id"]) == (True, "MCFG", "APP1")

    def test_whatsapp_config_id_not_served_to_messenger(self, client, monkeypatch):
        """The WhatsApp config id must not leak on a Messenger request: Messenger
        has its own config, and an unset one means the manual form, not WhatsApp's."""
        monkeypatch.setattr(settings, "META_CONFIG_ID", "CFG1")
        monkeypatch.setattr(settings, "META_MESSENGER_CONFIG_ID", "")
        body = client.get(f"{BASE}/embedded-signup-config?channel=messenger").json()
        assert body["enabled"] is False
        assert body["config_id"] is None

    def test_unknown_channel_404(self, client):
        assert client.get(f"{BASE}/embedded-signup-config?channel=carrier-pigeon").status_code == 404


class TestSignupAllowlist:
    """While the Meta app is in App Review its login only works for people with
    a role on the app, so SIGNUP_ALLOWED_EMAILS keeps the button off every
    account it would only fail for. Empty means everyone — the end state, and
    what every other test in this file relies on."""

    def test_open_to_everyone_when_unset(self, client, monkeypatch):
        monkeypatch.setattr(settings, "SIGNUP_ALLOWED_EMAILS", "")
        monkeypatch.setattr(settings, "META_CONFIG_ID", "CFG1")
        assert client.get(f"{BASE}/embedded-signup-config").json()["enabled"] is True

    def test_disabled_for_an_account_not_on_the_list(self, client, monkeypatch):
        monkeypatch.setattr(settings, "META_CONFIG_ID", "CFG1")
        monkeypatch.setattr(settings, "META_APP_ID", "APP1")
        monkeypatch.setattr(settings, "SIGNUP_ALLOWED_EMAILS", "someone.else@example.com")
        body = client.get(f"{BASE}/embedded-signup-config").json()

        assert body["enabled"] is False
        # The ids are what make the popup possible, so a gated-out account must
        # not receive them either.
        assert body["config_id"] is None
        assert body["app_id"] is None

    def test_enabled_for_an_account_on_the_list(self, client, monkeypatch):
        monkeypatch.setattr(settings, "META_CONFIG_ID", "CFG1")
        monkeypatch.setattr(settings, "SIGNUP_ALLOWED_EMAILS",
                            "first@example.com, test.user@example.com")
        assert client.get(f"{BASE}/embedded-signup-config").json()["enabled"] is True

    def test_matching_ignores_case_and_padding(self, client, monkeypatch):
        """The list is hand-edited in an env var, so stray spacing or a
        capitalised address must not silently lock the account out."""
        monkeypatch.setattr(settings, "META_CONFIG_ID", "CFG1")
        monkeypatch.setattr(settings, "SIGNUP_ALLOWED_EMAILS", "  Test.User@Example.COM  ,")
        assert client.get(f"{BASE}/embedded-signup-config").json()["enabled"] is True

    def test_connect_is_refused_for_an_account_not_on_the_list(self, client, monkeypatch):
        """The gate is enforced server-side, not just hidden in the UI — the
        config endpoint only decides which pane is shown."""
        monkeypatch.setattr(settings, "META_CONFIG_ID", "CFG1")
        monkeypatch.setattr(settings, "SIGNUP_ALLOWED_EMAILS", "someone.else@example.com")
        exchange = AsyncMock(return_value=(True, {"access_token": "T"}))
        with patch("app.api.channels.meta.exchange_signup_code", exchange):
            r = client.post(f"{BASE}/whatsapp/embedded-signup", json={
                "code": "CODE", "waba_id": "W1", "phone_number_id": "P1"})

        assert r.status_code == 403
        # Refused before the code is spent, so a retry once allowed still works.
        exchange.assert_not_awaited()

    def test_messenger_signup_is_refused_for_an_account_not_on_the_list(
            self, client, monkeypatch):
        monkeypatch.setattr(settings, "META_MESSENGER_CONFIG_ID", "MCFG")
        monkeypatch.setattr(settings, "SIGNUP_ALLOWED_EMAILS", "someone.else@example.com")
        r = client.post(f"{BASE}/messenger/signup/pages",
                        json={"code": "CODE", "redirect_uri": "https://x/cb"})

        assert r.status_code == 403


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


class TestMessengerSignup:
    """Facebook Login for Business: the code exchanges to a user token, we list
    the customer's Pages, and connect the one they pick. The Page tokens ride
    back to step 2 sealed in signup_token, never through the browser."""

    PAGES = f"{BASE}/messenger/signup/pages"
    CONNECT = f"{BASE}/messenger/signup/connect"

    # As /me/accounts lists them for the exchanged user token
    TWO_PAGES = [
        {"id": "PAGE1", "name": "Acme Support", "access_token": "EAAG-page1"},
        {"id": "PAGE2", "name": "Acme Sales", "access_token": "EAAG-page2"},
    ]

    @pytest.fixture(autouse=True)
    def enabled(self, monkeypatch):
        monkeypatch.setattr(settings, "META_MESSENGER_CONFIG_ID", "MCFG")

    def _list_pages(self, client, pages=None,
                    long_lived=(True, {"access_token": "LONGLIVED"})):
        """Drive step 1, returning (response, graph_list_all mock)."""
        lister = AsyncMock(return_value=(True, self.TWO_PAGES if pages is None else pages))
        with patch("app.api.channels.meta.exchange_signup_code",
                   AsyncMock(return_value=(True, {"access_token": "USERTOKEN"}))), \
             patch("app.api.channels.meta.exchange_for_long_lived_token",
                   AsyncMock(return_value=long_lived)), \
             patch("app.api.channels.meta.graph_list_all", lister):
            r = client.post(self.PAGES, json={
                "code": "FB-code", "redirect_uri": "https://app.test/meta-oauth-callback.html"})
        return r, lister

    def _signup_token(self, client):
        return self._list_pages(client)[0].json()["signup_token"]

    def test_lists_pages_without_leaking_their_tokens(self, client):
        r, _ = self._list_pages(client)
        assert r.status_code == 200
        body = r.json()
        assert [p["id"] for p in body["pages"]] == ["PAGE1", "PAGE2"]
        assert all(set(p.keys()) == {"id", "name"} for p in body["pages"])
        # The whole point of the sealed token: no page token in the wire response
        assert "EAAG-page1" not in r.text and "EAAG-page2" not in r.text

    def test_connect_stores_the_token_meta_gave_us_for_that_page(self, client, db):
        token = self._signup_token(client)
        subscribe = AsyncMock(return_value=True)
        with patch("app.api.channels.meta.subscribe_app", subscribe):
            r = client.post(self.CONNECT, json={"signup_token": token, "page_id": "PAGE2"})

        assert r.status_code == 200
        assert r.json()["display_name"] == "Acme Sales"
        repo = ChannelAccountRepository(db)
        account = repo.get_by_external_id("messenger", "PAGE2")
        assert repo.get_credentials(account)["access_token"] == "EAAG-page2"
        subscribe.assert_awaited_once_with(
            "PAGE2", "EAAG-page2", subscribed_fields="messages,messaging_postbacks")

    def test_rejects_a_page_that_was_not_in_the_signup(self, client, db):
        """page_id is a selector into a list we fetched, not a claim — a Page the
        signup never offered cannot be connected, and its token is unknown to us."""
        token = self._signup_token(client)
        with patch("app.api.channels.meta.subscribe_app", AsyncMock()) as subscribe:
            r = client.post(self.CONNECT, json={"signup_token": token, "page_id": "PAGE_I_DO_NOT_OWN"})

        assert r.status_code == 400
        subscribe.assert_not_awaited()
        assert ChannelAccountRepository(db).get_by_external_id("messenger", "PAGE_I_DO_NOT_OWN") is None

    def test_rejects_another_orgs_signup_token(self, client, db):
        """A blob sealed for one org must not connect under another — it is bound
        to the org id inside the ciphertext, not just handed to the browser."""
        foreign = _seal_signup_pages(uuid4(), self.TWO_PAGES)
        r = client.post(self.CONNECT, json={"signup_token": foreign, "page_id": "PAGE1"})

        assert r.status_code == 400
        assert ChannelAccountRepository(db).get_by_external_id("messenger", "PAGE1") is None

    def test_rejects_an_expired_signup_token(self, client, monkeypatch):
        monkeypatch.setattr("app.api.channels.meta.SIGNUP_TOKEN_TTL_SECONDS", -10)
        token = self._signup_token(client)
        r = client.post(self.CONNECT, json={"signup_token": token, "page_id": "PAGE1"})
        assert r.status_code == 400

    def test_rejects_a_forged_signup_token(self, client):
        """A garbage token is a clean 400, not a 500 — decrypt's ValueError is caught."""
        r = client.post(self.CONNECT, json={"signup_token": "not-a-real-token", "page_id": "PAGE1"})
        assert r.status_code == 400

    def test_no_pages_is_a_clear_400(self, client):
        r, _ = self._list_pages(client, pages=[])
        assert r.status_code == 400
        assert "No Facebook Pages" in r.json()["detail"]

    def test_stale_code_is_400(self, client):
        with patch("app.api.channels.meta.exchange_signup_code",
                   AsyncMock(return_value=(False, {"error": {"message": "Code expired"}}))):
            r = client.post(self.PAGES, json={
                "code": "FB-code", "redirect_uri": "https://app.test/meta-oauth-callback.html"})
        assert r.status_code == 400
        assert r.json()["detail"] == "Code expired"

    def test_signup_uses_the_long_lived_token_for_page_lookup(self, client):
        """Page tokens inherit the user token's life, so the lookup must use the
        extended token — otherwise every Page dies about an hour after launch."""
        _, lister = self._list_pages(client)
        assert lister.await_args.args[0] == "me/accounts"
        assert lister.await_args.args[1] == "LONGLIVED"

    def test_pages_still_listed_when_extension_fails(self, client):
        r, lister = self._list_pages(client, long_lived=(False, {"error": {"message": "nope"}}))
        assert r.status_code == 200
        assert lister.await_args.args[1] == "USERTOKEN"

    def test_rejected_without_messenger_config_id(self, client, monkeypatch):
        monkeypatch.setattr(settings, "META_MESSENGER_CONFIG_ID", "")
        exchange = AsyncMock()
        with patch("app.api.channels.meta.exchange_signup_code", exchange):
            r = client.post(self.PAGES, json={
                "code": "FB-code", "redirect_uri": "https://app.test/meta-oauth-callback.html"})
        assert r.status_code == 403
        exchange.assert_not_awaited()


class TestInstagramLogin:
    """Instagram Login needs no Facebook Page: the business signs in with
    Instagram, so one account comes back and there is nothing to pick."""

    CONNECT = f"{BASE}/instagram/login/connect"
    PAYLOAD = {"code": "IG-code", "redirect_uri": "https://app.test/meta-oauth-callback.html"}

    @pytest.fixture(autouse=True)
    def enabled(self, monkeypatch):
        monkeypatch.setattr(settings, "INSTAGRAM_APP_ID", "IGAPP")
        monkeypatch.setattr(settings, "INSTAGRAM_APP_SECRET", "IGSECRET")

    def _connect(self, client, exchange=None, long_lived=(True, {"access_token": "IGLong"})):
        exchange = exchange or AsyncMock(
            return_value=(True, {"access_token": "IGShort", "user_id": "17841400"}))
        with patch("app.api.channels.meta.exchange_instagram_code", exchange), \
             patch("app.api.channels.meta.exchange_instagram_long_lived",
                   AsyncMock(return_value=long_lived)), \
             patch("app.api.channels.meta.graph_get",
                   AsyncMock(return_value=(True, {"username": "acme"}))), \
             patch("app.api.channels.meta.subscribe_instagram_app",
                   AsyncMock(return_value=True)):
            return client.post(self.CONNECT, json=self.PAYLOAD), exchange

    def test_connects_the_account_that_logged_in(self, client, db):
        r, exchange = self._connect(client)

        assert r.status_code == 200
        assert r.json()["display_name"] == "@acme"
        repo = ChannelAccountRepository(db)
        account = repo.get_by_external_id("instagram", "17841400")
        assert account is not None
        # The long-lived token is what gets stored, not the ~1h login token.
        assert repo.get_credentials(account)["access_token"] == "IGLong"
        exchange.assert_awaited_once_with("IG-code", "https://app.test/meta-oauth-callback.html")

    def test_keys_the_account_on_the_id_webhooks_route_by(self, client, db):
        """/me's user_id is the professional account id that arrives as the
        webhook's entry.id; the login response's can be app-scoped. Keying on
        the wrong one drops every inbound DM silently."""
        with patch("app.api.channels.meta.exchange_instagram_code",
                   AsyncMock(return_value=(True, {"access_token": "IGShort", "user_id": "APPSCOPED"}))), \
             patch("app.api.channels.meta.exchange_instagram_long_lived",
                   AsyncMock(return_value=(True, {"access_token": "IGLong"}))), \
             patch("app.api.channels.meta.graph_get",
                   AsyncMock(return_value=(True, {"user_id": "17841400", "username": "acme"}))), \
             patch("app.api.channels.meta.subscribe_instagram_app", AsyncMock(return_value=True)):
            r = client.post(self.CONNECT, json=self.PAYLOAD)

        assert r.status_code == 200
        repo = ChannelAccountRepository(db)
        assert repo.get_by_external_id("instagram", "17841400") is not None
        assert repo.get_by_external_id("instagram", "APPSCOPED") is None

    def test_accepts_the_wrapped_token_response_shape(self, client, db):
        """Instagram also returns the token inside a `data` list."""
        wrapped = AsyncMock(return_value=(True, {
            "data": [{"access_token": "IGShort", "user_id": "17841400"}]}))
        r, _ = self._connect(client, exchange=wrapped)

        assert r.status_code == 200
        assert ChannelAccountRepository(db).get_by_external_id("instagram", "17841400") is not None

    def test_falls_back_to_the_short_token_when_extension_fails(self, client, db):
        r, _ = self._connect(client, long_lived=(False, {"error": {"message": "nope"}}))

        assert r.status_code == 200
        repo = ChannelAccountRepository(db)
        account = repo.get_by_external_id("instagram", "17841400")
        assert repo.get_credentials(account)["access_token"] == "IGShort"

    def test_stale_code_is_400(self, client, db):
        stale = AsyncMock(return_value=(False, {"error": {"message": "Code expired"}}))
        r, _ = self._connect(client, exchange=stale)

        assert r.status_code == 400
        assert r.json()["detail"] == "Code expired"
        assert ChannelAccountRepository(db).get_by_external_id("instagram", "17841400") is None

    def test_a_response_without_a_token_is_400(self, client):
        empty = AsyncMock(return_value=(True, {}))
        r, _ = self._connect(client, exchange=empty)
        assert r.status_code == 400

    def test_rejected_without_instagram_app_credentials(self, client, monkeypatch):
        monkeypatch.setattr(settings, "INSTAGRAM_APP_ID", "")
        exchange = AsyncMock()
        with patch("app.api.channels.meta.exchange_instagram_code", exchange):
            r = client.post(self.CONNECT, json=self.PAYLOAD)
        assert r.status_code == 403
        exchange.assert_not_awaited()

    def test_config_serves_the_instagram_app_id_and_no_config_id(self, client, monkeypatch):
        """The frontend builds the Instagram authorize URL from the Instagram
        app id; the Facebook config id is meaningless here."""
        monkeypatch.setattr(settings, "META_APP_ID", "FBAPP")
        body = client.get(f"{BASE}/embedded-signup-config?channel=instagram").json()
        assert (body["enabled"], body["app_id"], body["config_id"]) == (True, "IGAPP", None)


class TestGraphErrorDetail:
    """Meta's `message` is often a generic OAuth string; error_user_msg is the
    one that names the actual asset and rule.

    Tested directly rather than through an endpoint: it is a pure function used
    by every Graph-facing route, and pinning it to whichever route happens to
    exist is what made this class need rewriting when template delete went away.
    """

    # A real Graph body, kept for its shape: a generic OAuth `message` paired
    # with a specific error_user_msg.
    UNVERIFIED = {"error": {
        "message": "Application does not have permission for this action",
        "code": 10,
        "type": "OAuthException",
        "error_subcode": 2388185,
        "error_user_title": "Cannot create message template",
        "error_user_msg": "This WhatsApp Business account does not have permission "
                          "to create message template",
    }}

    def test_prefers_metas_human_readable_reason(self):
        from app.channels.meta_base import graph_detail

        # Not the useless "Application does not have permission for this action"
        assert graph_detail(self.UNVERIFIED, "fallback") == (
            "This WhatsApp Business account does not have permission to create message template"
        )

    def test_falls_back_to_message_when_there_is_no_user_msg(self):
        from app.channels.meta_base import graph_detail

        assert graph_detail({"error": {"message": "Invalid parameter"}}, "fallback") == (
            "Invalid parameter")

    def test_falls_back_to_our_own_text_when_graph_says_nothing(self):
        from app.channels.meta_base import graph_detail

        assert graph_detail({}, "Could not read templates") == "Could not read templates"

    def test_survives_an_error_that_is_not_an_object(self):
        from app.channels.meta_base import graph_detail

        assert graph_detail({"error": "boom"}, "fallback") == "fallback"


class TestTemplateLibraryLink:
    """Templates are written in Meta's Template Library, so the UI needs a link
    into it scoped to this number's Business Account."""

    def _url(self, client, account):
        return client.get(f"{BASE}/whatsapp/{account.id}/template-library")

    OWNER = (True, {"owner_business_info": {"id": "BIZ1", "name": "Acme"}})

    def test_links_to_the_library_for_this_waba_and_business(self, client, waba_account):
        with patch("app.api.channels.whatsapp_messaging.graph_get", AsyncMock(return_value=self.OWNER)):
            r = self._url(client, waba_account)

        assert r.status_code == 200
        url = r.json()["url"]
        assert url.startswith("https://business.facebook.com/latest/whatsapp_manager/template_library")
        assert "asset_id=WABA9" in url
        assert "business_id=BIZ1" in url

    def test_still_links_when_the_business_cannot_be_read(self, client, waba_account):
        # A worse link, not a dead button: Meta resolves the page from asset_id.
        with patch("app.api.channels.whatsapp_messaging.graph_get",
                   AsyncMock(return_value=(False, {"error": {"message": "nope"}}))):
            r = self._url(client, waba_account)

        assert r.status_code == 200
        assert "asset_id=WABA9" in r.json()["url"]
        assert "business_id" not in r.json()["url"]

    def test_omits_business_id_when_graph_returns_none(self, client, waba_account):
        with patch("app.api.channels.whatsapp_messaging.graph_get", AsyncMock(return_value=(True, {}))):
            r = self._url(client, waba_account)

        assert "business_id" not in r.json()["url"]

    def test_requires_waba_id(self, client, whatsapp_account):
        r = self._url(client, whatsapp_account)
        assert r.status_code == 400

    def test_rejects_other_orgs_account(self, client, db, waba_account):
        waba_account.organization_id = uuid4()
        db.commit()
        assert self._url(client, waba_account).status_code == 404


class TestOutboundConversation:
    """POST /whatsapp/{account_id}/conversations — start a conversation from a
    phone number. The identity, window and rollback rules live here."""

    URL = lambda self, a: f"{BASE}/whatsapp/{a.id}/conversations"

    APPROVED_UTILITY = [{
        "name": "order_update", "language": "en_US", "status": "APPROVED",
        "category": "UTILITY",
        "components": [{"type": "BODY", "text": "Hi {{1}}, your order {{2}} shipped."}],
    }]

    BODY_PARAMS = [{"type": "body", "parameters": [
        {"type": "text", "text": "Priya"}, {"type": "text", "text": "A-12"}]}]

    @pytest.fixture
    def routed(self, db, waba_account, test_agent):
        from app.repositories.channels import AgentChannelConfigRepository
        AgentChannelConfigRepository(db).set_agent(waba_account.id, test_agent.id)
        return waba_account

    def _send(self, client, account, templates=None, send_ok=True, **overrides):
        from unittest.mock import MagicMock
        payload = {"to": "+91 12345 67890", "template_name": "order_update",
                   "language": "en_US", "components": self.BODY_PARAMS, **overrides}
        adapter = MagicMock()
        adapter.send_template = AsyncMock(return_value=SendResult(
            ok=send_ok, external_message_id="wamid.OUT1" if send_ok else None,
            error=None if send_ok else "Recipient not on WhatsApp"))
        with patch("app.services.whatsapp_outbound.fetch_message_templates",
                   AsyncMock(return_value=(True, templates or self.APPROVED_UTILITY))), \
             patch("app.services.whatsapp_outbound.get_adapter", lambda _: adapter):
            return client.post(self.URL(account), json=payload), adapter

    def test_creates_person_session_and_windowless_conversation(self, client, db, routed):
        from app.models.customer import Customer
        from app.models.chat_history import ChatHistory
        from app.repositories.channels import ChannelConversationRepository

        r, adapter = self._send(client, routed, customer_name="Priya")

        assert r.status_code == 200
        session_id = r.json()["session_id"]

        customer = db.query(Customer).filter(Customer.phone == "+911234567890").one()
        assert customer.full_name == "Priya"
        assert customer.email == "911234567890@whatsapp.channel"
        assert customer.lead_source == {"channel": "whatsapp", "via": "outbound"}

        conversation = ChannelConversationRepository(db).get_by_session(session_id)
        # The window lie: no inbound message means no open 24h window.
        assert conversation.last_inbound_at is None
        assert conversation.extra["outbound_template"] == "Hi Priya, your order A-12 shipped."

        from uuid import UUID as _UUID
        row = db.query(ChatHistory).filter(
            ChatHistory.session_id == _UUID(session_id)).one()
        assert row.message == "Hi Priya, your order A-12 shipped."
        assert row.message_type == "bot"
        assert row.attributes["outbound_template"] == "order_update"

        adapter.send_template.assert_awaited_once()

    def test_picked_person_at_someone_elses_number_is_refused(self, client, db, routed):
        """`to` and `customer_id` arrive as independent fields. Binding Alice to
        Bob's number is unrecoverable: Bob's reply resolves BY PHONE to Bob, so
        history splits and the thread never appears on the profile it claims."""
        from app.repositories.customer import CustomerRepository
        repo = CustomerRepository(db)
        alice = repo.create_customer(email="alice@example.com",
                                     organization_id=routed.organization_id,
                                     full_name="Alice")
        repo.create_customer(email="bob@example.com",
                             organization_id=routed.organization_id,
                             full_name="Bob", phone="+911234567890")

        r, adapter = self._send(client, routed, customer_id=str(alice.id))

        assert r.status_code == 400
        assert "already belongs to Bob" in r.json()["detail"]
        adapter.send_template.assert_not_awaited()

    def test_picked_person_with_a_different_number_is_refused(self, client, db, routed):
        """Their own number is on file and it isn't this one — silently sending
        anyway is how a person acquires a second, unlinked identity."""
        from app.repositories.customer import CustomerRepository
        alice = CustomerRepository(db).create_customer(
            email="alice@example.com", organization_id=routed.organization_id,
            full_name="Alice", phone="+911111111111")

        r, adapter = self._send(client, routed, customer_id=str(alice.id))

        assert r.status_code == 400
        assert "different number on file" in r.json()["detail"]
        adapter.send_template.assert_not_awaited()

    def test_picked_person_without_a_number_adopts_the_typed_one(self, client, db, routed):
        """The drawer's real use: message a known person at a number you type.
        No conflict, so it binds and backfills — no duplicate row."""
        from app.models.customer import Customer
        from app.repositories.customer import CustomerRepository
        alice = CustomerRepository(db).create_customer(
            email="alice@example.com", organization_id=routed.organization_id,
            full_name="Alice")

        r, _ = self._send(client, routed, customer_id=str(alice.id))

        assert r.status_code == 200
        db.refresh(alice)
        assert alice.phone == "+911234567890"
        # And no second person was minted for the number.
        assert db.query(Customer).filter(
            Customer.phone == "+911234567890").count() == 1

    def test_window_reports_expired_until_they_reply(self, client, db, routed):
        from app.channels import get_adapter
        from app.channels.base import WindowStatus
        from app.repositories.channels import ChannelConversationRepository

        r, _ = self._send(client, routed)
        conversation = ChannelConversationRepository(db).get_by_session(r.json()["session_id"])
        assert get_adapter("whatsapp").check_delivery_window(conversation) \
            == WindowStatus.TEMPLATE_REQUIRED

    def test_second_send_reuses_the_open_session(self, client, db, routed):
        r1, _ = self._send(client, routed)
        r2, _ = self._send(client, routed)
        assert r1.json()["session_id"] == r2.json()["session_id"]

    def test_attaches_to_an_existing_person_by_phone(self, client, db, routed, test_organization):
        from app.models.customer import Customer
        from app.repositories.customer import CustomerRepository
        existing = CustomerRepository(db).create_customer(
            email="priya@example.com", organization_id=test_organization.id,
            full_name="Priya", phone="+911234567890")

        r, _ = self._send(client, routed)

        assert r.status_code == 200
        # No junk row: the conversation belongs to the person who owns the phone.
        assert db.query(Customer).filter(Customer.phone == "+911234567890").count() == 1
        from app.repositories.channels import ChannelConversationRepository
        conversation = ChannelConversationRepository(db).get_by_session(r.json()["session_id"])
        assert conversation.customer_id == existing.id

    def test_failed_send_leaves_no_empty_thread(self, client, db, routed):
        from app.models.channels import ChannelConversation
        from app.models.session_to_agent import SessionToAgent

        r, _ = self._send(client, routed, send_ok=False)

        assert r.status_code == 502
        assert "Recipient not on WhatsApp" in r.json()["detail"]
        assert db.query(ChannelConversation).filter(
            ChannelConversation.external_conversation_id == "911234567890").count() == 0
        assert db.query(SessionToAgent).count() == 0

    def test_marketing_templates_cannot_start_conversations(self, client, routed):
        marketing = [{**self.APPROVED_UTILITY[0], "category": "MARKETING"}]
        r, _ = self._send(client, routed, templates=marketing)
        assert r.status_code == 400
        assert "Marketing" in r.json()["detail"]

    def test_marketing_is_allowed_once_a_conversation_exists(self, client, db, routed):
        """The Utility/Auth rule is about business-INITIATED contact. Reaching
        an open conversation is the reopen case — the customer did message us,
        which is why Meta accepts Marketing there and why the inbox picker has
        never been gated. Gating it here refused a legal send, and made the
        same template succeed from the inbox and fail from the modal."""
        marketing = [{**self.APPROVED_UTILITY[0], "category": "MARKETING"}]

        first, _ = self._send(client, routed)          # Utility opens the thread
        assert first.status_code == 200

        second, adapter = self._send(client, routed, templates=marketing)

        assert second.status_code == 200
        assert second.json()["session_id"] == first.json()["session_id"]
        adapter.send_template.assert_awaited_once()

    def test_unapproved_template_is_refused(self, client, routed):
        pending = [{**self.APPROVED_UTILITY[0], "status": "PENDING"}]
        r, _ = self._send(client, routed, templates=pending)
        assert r.status_code == 400
        assert "not approved" in r.json()["detail"]

    def test_requires_a_routed_agent(self, client, waba_account):
        r, _ = self._send(client, waba_account)  # nothing routed
        assert r.status_code == 400
        assert "Route an agent" in r.json()["detail"]

    def test_rejects_a_number_without_country_code(self, client, routed):
        r, _ = self._send(client, routed, to="1234567890")
        assert r.status_code == 400
        assert "international format" in r.json()["detail"]

    def test_rejects_other_orgs_account(self, client, db, routed):
        routed.organization_id = uuid4()
        db.commit()
        r, _ = self._send(client, routed)
        assert r.status_code == 404


class TestInboxAgentCanActuallyReachTheFeature:
    """A support agent with ONLY view_all_chats — no manage_organization.

    Every other test in this file runs as an admin who was also given
    view_all_chats, so none of them could observe that the endpoints the
    picker READS were still admin-only while the sends they feed had been
    loosened. That mismatch made the whole feature unreachable for exactly
    the role it was opened up for.
    """

    @pytest.fixture
    def inbox_client(self, db, test_organization, waba_account, test_agent, monkeypatch):
        from app.models.permission import Permission
        from app.models.role import Role
        from app.models.user import User
        from app.core.security import get_password_hash
        from app.repositories.channels import AgentChannelConfigRepository

        monkeypatch.setattr(settings, "META_APP_SECRET", APP_SECRET)
        AgentChannelConfigRepository(db).set_agent(waba_account.id, test_agent.id)

        role = Role(name="Support Agent", organization_id=test_organization.id)
        role.permissions = [Permission(name="view_all_chats")]
        db.add(role); db.commit(); db.refresh(role)
        agent_user = User(
            id=uuid4(), organization_id=test_organization.id,
            email="support@example.com", full_name="Support",
            hashed_password=get_password_hash("pw"), is_active=True,
            role_id=role.id)
        db.add(agent_user); db.commit()

        app.dependency_overrides[get_current_user] = lambda: agent_user
        app.dependency_overrides[get_current_organization] = lambda: test_organization
        app.dependency_overrides[get_db] = lambda: (yield db)
        yield TestClient(app)
        app.dependency_overrides.clear()

    def test_can_list_the_templates_the_picker_needs(self, inbox_client, waba_account):
        templates = [{"name": "order_update", "language": "en_US",
                      "status": "APPROVED", "category": "UTILITY",
                      "components": [{"type": "BODY", "text": "Hi {{1}}"}]}]
        with patch("app.api.channels.whatsapp_messaging.fetch_message_templates",
                   AsyncMock(return_value=(True, templates))):
            r = inbox_client.get(f"{BASE}/whatsapp/{waba_account.id}/templates")
        assert r.status_code == 200
        assert r.json()[0]["name"] == "order_update"

    def test_can_see_the_accounts_that_gate_the_new_conversation_button(
            self, inbox_client, waba_account):
        r = inbox_client.get("/api/v1/channels/accounts")
        assert r.status_code == 200
        assert any(a["channel_type"] == "whatsapp" for a in r.json())

    def test_still_cannot_reach_the_template_library_link(self, inbox_client, waba_account):
        """Loosened for reading and sending, not for authoring: the route into
        WhatsApp Manager, where templates are written, stays org-admin."""
        r = inbox_client.get(f"{BASE}/whatsapp/{waba_account.id}/template-library")
        assert r.status_code == 403
