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

WhatsApp numbers and Messenger Pages connected from the customer's own Meta
app: their own webhook address, checked with their app's secret, and how
connecting, reconnecting and disconnecting set that up.
"""

import hashlib
import hmac
import json
from unittest.mock import AsyncMock, patch
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient

import app.main  # noqa: F401 — registers the routers
from app.api.channels.accounts import to_account_out
from app.api.channels.meta import _upsert_account
from app.services.meta_own_app import APP_ID_SETTING
from app.core.application import app
from app.core.auth import get_current_organization, get_current_user
from app.core.config import settings
from app.database import get_db
from app.models.organization import Organization
from app.repositories.channels import ChannelAccountRepository

BASE = "/api/v1/channels/meta"
WEBHOOK = "/api/v1/webhooks/meta"
OUR_SECRET = "chattermate-app-secret"
OUR_APP_ID = "APP_CHATTERMATE"
THEIR_SECRET = "customer-app-secret"
THEIR_APP_ID = "APP_THEIRS"
OVERRIDE_RELEASED = {"webhook_configuration": {"override_callback_uri": ""}}


def _wa_message(phone_number_id="PN1"):
    return {"object": "whatsapp_business_account", "entry": [{"changes": [{"value": {
        "metadata": {"phone_number_id": phone_number_id},
        "contacts": [{"profile": {"name": "Ada"}, "wa_id": "447"}],
        "messages": [{"from": "447", "id": f"wamid.{uuid4().hex[:8]}", "type": "text",
                      "text": {"body": "hi"}, "timestamp": "1720000000"}],
    }}]}]}


WA_RECEIPT = {"object": "whatsapp_business_account", "entry": [{"changes": [{"value": {
    "metadata": {"phone_number_id": "PN1"},
    "statuses": [{"id": "wamid.out", "status": "delivered", "timestamp": "1720000001", "recipient_id": "447"}],
}}]}]}


def _page_entry(page_id):
    return {"id": page_id, "time": 1720000000, "messaging": [{
        "sender": {"id": "PSID1"}, "recipient": {"id": page_id}, "timestamp": 1720000000,
        "message": {"mid": f"m.{uuid4().hex[:8]}", "text": "hello"}}]}


@pytest.fixture
def client(db, test_user, test_organization, monkeypatch):
    monkeypatch.setattr(settings, "META_APP_SECRET", OUR_SECRET)
    monkeypatch.setattr(settings, "META_APP_ID", OUR_APP_ID)

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


def _account(db, organization_id, channel_type="whatsapp", external_id="PN1", app_id=THEIR_APP_ID):
    """An account as a connect leaves it: from the customer's app when app_id is set."""
    credentials = {"access_token": "EAAG-theirs"}
    if app_id:
        credentials["app_secret"] = THEIR_SECRET
    return ChannelAccountRepository(db).create_account(
        organization_id=organization_id, channel_type=channel_type, external_account_id=external_id,
        credentials=credentials, display_name=external_id,
        settings={APP_ID_SETTING: app_id} if app_id else None)


def _signed(payload: dict, secret: str = THEIR_SECRET):
    body = json.dumps(payload).encode()
    signature = "sha256=" + hmac.new(secret.encode(), body, hashlib.sha256).hexdigest()
    return body, {"X-Hub-Signature-256": signature, "Content-Type": "application/json"}


def _post(client, account_id, payload, secret=THEIR_SECRET):
    body, headers = _signed(payload, secret)
    with patch("app.api.webhooks.meta.process_channel_message", AsyncMock()) as process, \
         patch("app.api.webhooks.meta.process_status_event", AsyncMock()) as status:
        response = client.post(f"{WEBHOOK}/{account_id}", content=body, headers=headers)
    return response, process, status


def _processed_for(process):
    return [call.args[0] for call in process.await_args_list]


class TestOwnAppWebhook:
    def test_a_message_signed_with_the_apps_secret_is_processed(self, client, db, test_organization):
        account = _account(db, test_organization.id)
        response, process, _ = _post(client, account.id, _wa_message())
        assert response.status_code == 200
        account_id, inbound = process.await_args.args
        assert (account_id, inbound.text) == (account.id, "hi")

    def test_receipts_reach_the_status_processor(self, client, db, test_organization):
        account = _account(db, test_organization.id)
        _, _, status = _post(client, account.id, WA_RECEIPT)
        assert status.await_args.args[0] == account.id

    @pytest.mark.parametrize("secret", [OUR_SECRET, "guess"])
    def test_any_other_secret_is_refused(self, client, db, test_organization, secret):
        """ChatterMate's own secret included: this address answers to one app only."""
        account = _account(db, test_organization.id)
        response, process, _ = _post(client, account.id, _wa_message(), secret)
        assert response.status_code == 403
        process.assert_not_awaited()

    def test_it_takes_the_orgs_other_numbers_from_the_same_app(self, client, db, test_organization):
        """One app can hold several numbers; Meta may send any of them here."""
        first = _account(db, test_organization.id, external_id="PN1")
        second = _account(db, test_organization.id, external_id="PN2")
        _, process, _ = _post(client, first.id, _wa_message("PN2"))
        assert _processed_for(process) == [second.id]

    def test_one_messenger_callback_serves_every_page_of_the_app(self, client, db, test_organization):
        """Messenger has one callback per app, and Meta batches Pages."""
        page_a = _account(db, test_organization.id, "messenger", "PAGE_A")
        page_b = _account(db, test_organization.id, "messenger", "PAGE_B")
        payload = {"object": "page", "entry": [_page_entry("PAGE_A"), _page_entry("PAGE_B")]}
        _, process, _ = _post(client, page_a.id, payload)
        assert sorted(map(str, _processed_for(process))) == sorted([str(page_a.id), str(page_b.id)])

    def test_it_never_reaches_another_organization_or_app(self, client, db, test_organization):
        """The secret is one the customer chose: a payload naming anyone
        else's number goes nowhere, even though it is signed with it."""
        ours = _account(db, test_organization.id, external_id="PN-MINE")
        other_org = Organization(name="Other", domain="other.example", timezone="UTC")
        db.add(other_org)
        db.commit()
        _account(db, other_org.id, external_id="PN-THEIRS")  # same app id, other org
        _account(db, test_organization.id, external_id="PN-OTHER-APP", app_id="APP_ELSE")
        _account(db, test_organization.id, external_id="PN-SHARED", app_id=None)  # via ChatterMate's app
        for number in ("PN-THEIRS", "PN-OTHER-APP", "PN-SHARED"):
            response, process, status = _post(client, ours.id, _wa_message(number))
            assert response.status_code == 200
            process.assert_not_awaited()
        _, _, status = _post(client, ours.id, {**WA_RECEIPT, "entry": [{"changes": [{"value": {
            "metadata": {"phone_number_id": "PN-THEIRS"}, "statuses": WA_RECEIPT["entry"][0]["changes"][0]["value"]["statuses"]}}]}]})
        status.assert_not_awaited()

    def test_another_products_payload_is_ignored(self, client, db, test_organization):
        account = _account(db, test_organization.id)
        response, process, _ = _post(client, account.id, {"object": "page", "entry": [_page_entry("PN1")]})
        assert response.json() == {"status": "ignored"}
        process.assert_not_awaited()

    @pytest.mark.parametrize("state", ["unknown", "disconnected", "shared_app"])
    def test_an_address_with_no_own_app_account_is_acked_and_ignored(self, client, db, test_organization, state):
        """A 403 would make Meta retry and in time disable the customer's webhook."""
        account = _account(db, test_organization.id, app_id=None if state == "shared_app" else THEIR_APP_ID)
        if state == "disconnected":
            ChannelAccountRepository(db).set_active(account, False)
        account_id = uuid4() if state == "unknown" else account.id
        with patch("app.api.webhooks.meta.logger") as logger:
            response, process, _ = _post(client, account_id, _wa_message())
        assert (response.status_code, response.json()) == (200, {"status": "ignored"})
        process.assert_not_awaited()
        # To the customer the messages just vanish: the log is the only trace
        assert f"account {account_id} ignored" in logger.info.call_args.args[0]

    def test_an_unreadable_secret_is_acked_not_a_500(self, client, db, test_organization):
        """A 500 would make Meta retry for hours and disable the customer's webhook."""
        account = _account(db, test_organization.id)
        account.encrypted_credentials = "not-decryptable"
        db.commit()
        response, process, _ = _post(client, account.id, _wa_message())
        assert (response.status_code, response.json()) == (200, {"status": "ignored"})
        process.assert_not_awaited()

    def test_the_handshake_needs_the_accounts_verify_token(self, client, db, test_organization):
        account = _account(db, test_organization.id)
        ok = client.get(f"{WEBHOOK}/{account.id}", params={
            "hub.mode": "subscribe", "hub.verify_token": account.webhook_secret, "hub.challenge": "42"})
        assert (ok.status_code, ok.text) == (200, "42")
        for token in ("wrong", "ünïcode", ""):
            bad = client.get(f"{WEBHOOK}/{account.id}", params={
                "hub.mode": "subscribe", "hub.verify_token": token, "hub.challenge": "42"})
            assert bad.status_code == 403

    def test_no_handshake_for_an_account_from_chattermates_app(self, client, db, test_organization):
        account = _account(db, test_organization.id, app_id=None)
        response = client.get(f"{WEBHOOK}/{account.id}", params={
            "hub.mode": "subscribe", "hub.verify_token": account.webhook_secret, "hub.challenge": "42"})
        assert response.status_code == 403

    def test_the_shared_address_still_refuses_the_customers_secret(self, client, db, test_organization):
        _account(db, test_organization.id)
        body, headers = _signed(_wa_message())
        assert client.post(WEBHOOK, content=body, headers=headers).status_code == 403


PROOF_ERROR = (False, {"error": {"message": "Invalid appsecret_proof provided in the API argument", "code": 100}})


def _connect_whatsapp(client, app_secret=THEIR_SECRET, app=(True, {"id": THEIR_APP_ID}),
                      override_ok=True, token="EAAG-x", waba_id="WABA9"):
    lookup = AsyncMock(return_value=(True, {"display_phone_number": "1555", "verified_name": "Acme"}))
    check = AsyncMock(return_value=app)
    graph_post = AsyncMock(return_value=(override_ok, {} if override_ok else {"error": {"message": "nope"}}))
    with patch("app.api.channels.meta.graph_get", lookup), \
         patch("app.api.channels.meta.subscribe_app", AsyncMock(return_value=True)), \
         patch("app.services.meta_own_app.graph_get", check), \
         patch("app.services.meta_own_app.graph_post_json", graph_post):
        response = client.post(f"{BASE}/whatsapp", json={
            "phone_number_id": "PN9", "access_token": token, "waba_id": waba_id, "app_secret": app_secret})
    return response, check, graph_post


def _stored(db, channel="whatsapp", external_id="PN9"):
    repo = ChannelAccountRepository(db)
    account = repo.get_by_external_id(channel, external_id)
    return account, repo.get_credentials(account)


class TestConnect:
    def test_whatsapp_with_a_secret_reports_to_its_own_address(self, client, db):
        response, check, graph_post = _connect_whatsapp(client)
        assert response.status_code == 200
        account, credentials = _stored(db)
        assert credentials["app_secret"] == THEIR_SECRET
        assert account.settings[APP_ID_SETTING] == THEIR_APP_ID
        # The secret is proven against the token's own app
        proof = check.await_args.kwargs["params"]["appsecret_proof"]
        assert proof == hmac.new(THEIR_SECRET.encode(), b"EAAG-x", hashlib.sha256).hexdigest()
        # Meta is asked to send this number's webhooks to its own address
        node, token, body = graph_post.await_args.args
        assert (node, token) == ("PN9", "EAAG-x")
        assert body["webhook_configuration"] == {
            "override_callback_uri": f"{settings.BACKEND_URL.rstrip('/')}/api/v1/webhooks/meta/{account.id}",
            "verify_token": account.webhook_secret}
        data = response.json()
        assert data["webhook_url"].endswith(f"/webhooks/meta/{account.id}")
        assert (data["webhook_verify_token"], data["webhook_auto_configured"]) == (account.webhook_secret, True)
        assert THEIR_SECRET not in response.text

    def test_the_address_answers_meta_during_the_override(self, client, db):
        """Meta checks the address inside the override call, so the account
        must already be marked as from its own app by then."""
        seen = {}

        async def override(node, token, body):
            account = ChannelAccountRepository(db).get_by_external_id("whatsapp", node)
            seen["status"] = client.get(f"{WEBHOOK}/{account.id}", params={
                "hub.mode": "subscribe", "hub.verify_token": body["webhook_configuration"]["verify_token"],
                "hub.challenge": "7"}).text
            return True, {}
        with patch("app.api.channels.meta.graph_get", AsyncMock(return_value=(True, {"verified_name": "Acme"}))), \
             patch("app.api.channels.meta.subscribe_app", AsyncMock(return_value=True)), \
             patch("app.services.meta_own_app.graph_get", AsyncMock(return_value=(True, {"id": THEIR_APP_ID}))), \
             patch("app.services.meta_own_app.graph_post_json", override):
            client.post(f"{BASE}/whatsapp", json={
                "phone_number_id": "PN9", "access_token": "EAAG-x", "waba_id": "W", "app_secret": THEIR_SECRET})
        assert seen["status"] == "7"

    def test_a_wrong_secret_is_refused_and_nothing_is_saved(self, client, db):
        response, _, graph_post = _connect_whatsapp(client, app=PROOF_ERROR)
        assert response.status_code == 400
        assert "App settings" in response.json()["detail"]
        assert ChannelAccountRepository(db).get_by_external_id("whatsapp", "PN9") is None
        graph_post.assert_not_awaited()

    def test_when_meta_cant_be_asked_it_says_so(self, client, db):
        """A Meta error is not a wrong secret, and Meta's own words are shown."""
        response, _, _ = _connect_whatsapp(client, app=(False, {"error": {
            "message": "Service temporarily unavailable", "code": 2}}))
        assert response.status_code == 502
        assert "try again (Service temporarily unavailable)" in response.json()["detail"]
        assert ChannelAccountRepository(db).get_by_external_id("whatsapp", "PN9") is None

    def test_our_own_network_errors_stay_in_the_log(self, client):
        response, _, _ = _connect_whatsapp(client, app=(False, {"error": {"message": "[Errno 8] nodename nor servname"}}))
        assert response.status_code == 502
        assert "Errno" not in response.json()["detail"]

    @pytest.mark.parametrize("app_secret", [None, "", "  "])
    def test_their_apps_token_without_a_secret_is_refused(self, client, db, app_secret):
        """Without it the number could send but never receive, so it isn't
        connected at all."""
        response, _, graph_post = _connect_whatsapp(client, app_secret=app_secret)
        assert response.status_code == 400
        assert "Enter your Meta app's secret" in response.json()["detail"]
        graph_post.assert_not_awaited()
        assert ChannelAccountRepository(db).get_by_external_id("whatsapp", "PN9") is None

    def test_refused_without_the_secret_then_connected_with_it(self, client, db):
        """The refusal leaves nothing half-done: entering the secret next connects normally."""
        refused, _, _ = _connect_whatsapp(client, app_secret=None)
        assert refused.status_code == 400
        response, _, graph_post = _connect_whatsapp(client)
        assert response.status_code == 200
        assert _stored(db)[1]["app_secret"] == THEIR_SECRET
        assert response.json()["webhook_url"].endswith(f"/webhooks/meta/{_stored(db)[0].id}")
        graph_post.assert_awaited_once()

    def test_an_app_that_insists_on_a_proof_is_refused_without_its_secret(self, client, db):
        """Checked with our secret, a token from an app requiring proofs fails
        Meta's proof check: that means a secret is missing, not a wrong one."""
        response, _, _ = _connect_whatsapp(client, app_secret=None, app=PROOF_ERROR)
        assert response.status_code == 400
        assert "Enter your Meta app's secret" in response.json()["detail"]
        assert ChannelAccountRepository(db).get_by_external_id("whatsapp", "PN9") is None

    def test_our_own_apps_token_needs_no_secret(self, client, db, monkeypatch):
        """A one-click number reconnected by hand: its token is ChatterMate's,
        proven with our secret, and keeps the shared address."""
        monkeypatch.setattr(settings, "META_APP_SECRET", "our-secret")
        response, check, graph_post = _connect_whatsapp(client, app_secret=None, app=(True, {"id": OUR_APP_ID}))
        assert response.status_code == 200
        assert check.await_args.kwargs["params"]["appsecret_proof"] == hmac.new(
            b"our-secret", b"EAAG-x", hashlib.sha256).hexdigest()
        assert response.json()["webhook_url"] is None
        assert "app_secret" not in _stored(db)[1]
        graph_post.assert_not_awaited()

    def test_messenger_from_their_app_without_a_secret_is_refused(self, client, db):
        with patch("app.api.channels.meta.debug_token", AsyncMock(return_value=(True, {
                    "type": "PAGE", "profile_id": "PAGE9", "is_valid": True}))), \
             patch("app.services.meta_own_app.graph_get", AsyncMock(return_value=(True, {"id": THEIR_APP_ID}))):
            response = client.post(f"{BASE}/messenger", json={"page_id": "PAGE9", "page_access_token": "EAAG-p"})
        assert response.status_code == 400
        assert ChannelAccountRepository(db).get_by_external_id("messenger", "PAGE9") is None

    def test_chattermates_own_app_needs_no_address(self, client, db):
        """A self-hoster's number in the app ChatterMate runs on already
        reaches the shared address: nothing is stored or re-pointed."""
        response, _, graph_post = _connect_whatsapp(client, app=(True, {"id": OUR_APP_ID}))
        assert response.status_code == 200
        assert "app_secret" not in _stored(db)[1]
        graph_post.assert_not_awaited()
        assert response.json()["webhook_url"] is None

    def test_a_failed_override_is_reported_on_the_card(self, client):
        response, _, _ = _connect_whatsapp(client, override_ok=False)
        assert response.status_code == 200
        assert response.json()["webhook_auto_configured"] is False
        assert response.json()["webhook_verify_token"]  # shown to paste by hand

    def test_a_reconnect_checks_the_secret_against_the_new_token(self, client, db):
        _connect_whatsapp(client)
        response, check, _ = _connect_whatsapp(client, token="EAAG-rotated")
        assert response.status_code == 200
        assert _stored(db)[1]["app_secret"] == THEIR_SECRET
        assert check.await_args.kwargs["params"]["appsecret_proof"] == hmac.new(
            THEIR_SECRET.encode(), b"EAAG-rotated", hashlib.sha256).hexdigest()

    def test_a_reconnect_without_the_secret_keeps_the_old_connection(self, client, db):
        _connect_whatsapp(client)
        response, _, _ = _connect_whatsapp(client, app_secret=None, token="EAAG-rotated")
        assert response.status_code == 400
        assert _stored(db)[1]["access_token"] == "EAAG-x"  # untouched

    def test_a_reconnect_with_another_apps_token_and_the_old_secret_is_refused(self, client, db):
        _connect_whatsapp(client)
        response, _, _ = _connect_whatsapp(client, app=PROOF_ERROR, token="EAAG-other-app")
        assert response.status_code == 400
        assert "App settings → Basic" in response.json()["detail"]
        assert _stored(db)[1]["access_token"] == "EAAG-x"  # untouched

    def test_a_reconnect_from_another_app_moves_the_callback(self, client, db):
        """The old app's override is the old app's: released with its token
        before the new app points the number at us."""
        _connect_whatsapp(client)
        _, _, graph_post = _connect_whatsapp(client, app_secret="new-secret", app=(True, {"id": "APP_NEW"}),
                                             token="EAAG-new-app")
        account, credentials = _stored(db)
        assert (credentials["app_secret"], account.settings[APP_ID_SETTING]) == ("new-secret", "APP_NEW")
        released, pointed = graph_post.await_args_list
        assert released.args == ("PN9", "EAAG-x", OVERRIDE_RELEASED)
        assert pointed.args[1] == "EAAG-new-app" and pointed.args[2]["webhook_configuration"]["override_callback_uri"]

    def test_a_reconnect_with_a_rotated_secret_keeps_the_callback(self, client, db):
        _connect_whatsapp(client)
        _, _, graph_post = _connect_whatsapp(client, app_secret="rotated-secret")
        assert _stored(db)[1]["app_secret"] == "rotated-secret"
        assert graph_post.await_count == 1  # pointed again, nothing released

    def test_another_orgs_number_is_a_409_before_meta_is_asked(self, client, db):
        other_org = Organization(name="Other", domain="other.example", timezone="UTC")
        db.add(other_org)
        db.commit()
        _account(db, other_org.id, external_id="PN9")
        response, check, _ = _connect_whatsapp(client, app=PROOF_ERROR)
        assert response.status_code == 409
        check.assert_not_awaited()

    def test_messenger_with_a_secret_shows_the_address_to_paste(self, client, db):
        inspect = AsyncMock(return_value=(True, {"type": "PAGE", "profile_id": "PAGE9", "is_valid": True}))
        graph_post = AsyncMock(return_value=(True, {}))
        with patch("app.api.channels.meta.debug_token", inspect), \
             patch("app.api.channels.meta.graph_get", AsyncMock(return_value=(False, {}))), \
             patch("app.api.channels.meta.subscribe_app", AsyncMock(return_value=True)), \
             patch("app.services.meta_own_app.graph_get", AsyncMock(return_value=(True, {"id": THEIR_APP_ID}))), \
             patch("app.services.meta_own_app.graph_post_json", graph_post):
            response = client.post(f"{BASE}/messenger", json={
                "page_id": "PAGE9", "page_access_token": "EAAG-p", "app_secret": THEIR_SECRET})
        assert response.status_code == 200
        account, _ = _stored(db, "messenger", "PAGE9")
        data = response.json()
        assert data["webhook_url"].endswith(f"/webhooks/meta/{account.id}")
        assert data["webhook_verify_token"] == account.webhook_secret
        assert data["webhook_auto_configured"] is None
        graph_post.assert_not_awaited()  # Meta has no per-Page override

    def test_messenger_with_a_wrong_secret_is_refused(self, client, db):
        with patch("app.api.channels.meta.debug_token", AsyncMock(return_value=(True, {
                    "type": "PAGE", "profile_id": "PAGE9", "is_valid": True}))), \
             patch("app.services.meta_own_app.graph_get", AsyncMock(return_value=PROOF_ERROR)):
            response = client.post(f"{BASE}/messenger", json={
                "page_id": "PAGE9", "page_access_token": "EAAG-p", "app_secret": "wrong"})
        assert response.status_code == 400
        assert ChannelAccountRepository(db).get_by_external_id("messenger", "PAGE9") is None

    def _embedded_signup(self, client, monkeypatch):
        monkeypatch.setattr(settings, "META_CONFIG_ID", "CFG1")
        numbers = (True, {"data": [{"id": "PN9", "display_phone_number": "1555", "verified_name": "Acme"}]})
        graph_post = AsyncMock(return_value=(True, {}))
        with patch("app.api.channels.meta.exchange_signup_code",
                   AsyncMock(return_value=(True, {"access_token": "EAAG-business"}))), \
             patch("app.api.channels.meta.register_phone_number", AsyncMock(return_value=(True, {}))), \
             patch("app.api.channels.meta.graph_get", AsyncMock(return_value=numbers)), \
             patch("app.api.channels.meta.subscribe_app", AsyncMock(return_value=True)), \
             patch("app.services.meta_own_app.graph_post_json", graph_post):
            response = client.post(f"{BASE}/whatsapp/embedded-signup", json={
                "code": "AQD", "waba_id": "WABA9", "phone_number_id": "PN9"})
        return response, graph_post

    def test_embedded_signup_hands_the_number_back_with_the_customers_token(self, client, db, monkeypatch):
        """The override belongs to the customer's app, so only their token
        can take it back."""
        _connect_whatsapp(client)
        response, graph_post = self._embedded_signup(client, monkeypatch)
        assert response.status_code == 200
        account, credentials = _stored(db)
        assert "app_secret" not in credentials and APP_ID_SETTING not in (account.settings or {})
        assert response.json()["webhook_url"] is None
        assert graph_post.await_args.args == ("PN9", "EAAG-x", OVERRIDE_RELEASED)

    def test_embedded_signup_of_a_fresh_number_touches_no_callback(self, client, monkeypatch):
        _, graph_post = self._embedded_signup(client, monkeypatch)
        graph_post.assert_not_awaited()

    def test_a_signup_reconnect_forgets_the_secret(self, db, test_organization):
        """Messenger signup passes the same `forget`: the Page is now in our app."""
        _account(db, test_organization.id, "messenger", "PAGE1")
        account = _upsert_account(db, test_organization, "messenger", "PAGE1",
                                  {"access_token": "EAAG-ours"}, "Acme", forget=("app_secret",))
        assert ChannelAccountRepository(db).get_credentials(account) == {"access_token": "EAAG-ours"}

    def test_disconnect_hands_the_number_back(self, client, db):
        _connect_whatsapp(client)
        account, _ = _stored(db)
        graph_post = AsyncMock(return_value=(True, {}))
        with patch("app.services.meta_own_app.graph_post_json", graph_post):
            assert client.delete(f"{BASE}/{account.id}").status_code == 200
        assert graph_post.await_args.args == ("PN9", "EAAG-x", OVERRIDE_RELEASED)

    def test_disconnect_never_fails_over_the_callback(self, client, db, test_organization):
        account = _account(db, test_organization.id)
        account.encrypted_credentials = "not-decryptable"
        db.commit()
        assert client.delete(f"{BASE}/{account.id}").status_code == 200
        assert ChannelAccountRepository(db).get_by_id(account.id) is None

    def test_a_messenger_disconnect_has_no_callback_to_release(self, client, db, test_organization):
        account = _account(db, test_organization.id, "messenger", "PAGE1")
        graph_post = AsyncMock(return_value=(True, {}))
        with patch("app.services.meta_own_app.graph_post_json", graph_post):
            assert client.delete(f"{BASE}/{account.id}").status_code == 200
        graph_post.assert_not_awaited()

    def test_people_who_cant_manage_the_org_never_see_the_token(self, db, test_organization):
        account = _account(db, test_organization.id)
        out = to_account_out(db, account, None, include_webhook_url=False)
        assert (out.webhook_url, out.webhook_verify_token, out.webhook_auto_configured) == (None, None, None)
