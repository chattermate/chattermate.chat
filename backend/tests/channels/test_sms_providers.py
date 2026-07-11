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

import base64
import hashlib
import hmac
import json
from unittest.mock import MagicMock

import pytest

from app.channels.sms import get_provider, list_providers
from app.channels.sms.base import SmsWebhookRequest
from app.channels.sms.twilio import TwilioProvider


def make_req(params=None, json_body=None, headers=None, url="https://x/api/v1/webhooks/sms/p/abc", raw=b""):
    pairs = list((params or {}).items())
    return SmsWebhookRequest(
        headers={k.lower(): v for k, v in (headers or {}).items()},
        params=params or {}, param_pairs=pairs, json_body=json_body,
        raw_body=raw or (json.dumps(json_body).encode() if json_body else b""), url=url)


def account_with(creds: dict):
    from app.core.security import encrypt_api_key
    acc = MagicMock()
    acc.encrypted_credentials = encrypt_api_key(json.dumps(creds))
    acc.external_account_id = "+15550001111"
    return acc


def test_all_providers_registered():
    names = {p.name for p in list_providers()}
    assert names == {"twilio", "vonage", "messagebird", "plivo", "brevo", "sns"}


class TestTwilio:
    def test_parse(self):
        req = make_req(params={"From": "+44700", "To": "+1555", "Body": " hi ", "MessageSid": "SM1"})
        m = get_provider("twilio").parse_inbound(req, account_with({}))[0]
        assert m.external_conversation_id == "+44700" and m.text == "hi"

    @pytest.mark.asyncio
    async def test_verify_signature(self):
        url = "https://x/api/v1/webhooks/sms/twilio/abc"
        params = {"From": "+44", "Body": "hi", "MessageSid": "SM1"}
        payload = url + "".join(f"{k}{params[k]}" for k in sorted(params))
        sig = base64.b64encode(hmac.new(b"tok", payload.encode(), hashlib.sha1).digest()).decode()
        req = make_req(params=params, url=url, headers={"X-Twilio-Signature": sig})
        assert await get_provider("twilio").verify_webhook(req, account_with({"auth_token": "tok"})) is True
        bad = make_req(params=params, url=url, headers={"X-Twilio-Signature": "bad"})
        assert await get_provider("twilio").verify_webhook(bad, account_with({"auth_token": "tok"})) is False


class TestVonage:
    def test_parse(self):
        req = make_req(params={"msisdn": "+44700", "to": "+1555", "text": "hello", "messageId": "v1"})
        m = get_provider("vonage").parse_inbound(req, account_with({}))[0]
        assert m.external_conversation_id == "+44700" and m.external_message_id == "v1"

    @pytest.mark.asyncio
    async def test_no_signature_secret_accepts(self):
        req = make_req(params={"msisdn": "+44", "text": "x"})
        assert await get_provider("vonage").verify_webhook(req, account_with({})) is True

    @pytest.mark.asyncio
    async def test_hmac_signature(self):
        secret = "sig-sek"
        params = {"msisdn": "+44", "text": "hi", "to": "+1555"}
        parts = "".join(f"&{k}={params[k]}" for k in sorted(params))
        sig = hmac.new(secret.encode(), parts.encode(), hashlib.sha256).hexdigest().upper()
        req = make_req(params={**params, "sig": sig})
        assert await get_provider("vonage").verify_webhook(req, account_with({"signature_secret": secret})) is True
        bad = make_req(params={**params, "sig": "deadbeef"})
        assert await get_provider("vonage").verify_webhook(bad, account_with({"signature_secret": secret})) is False


class TestMessageBird:
    def test_parse_json(self):
        req = make_req(json_body={"originator": "+44700", "recipient": "+1555", "payload": "hey", "id": "mb1"})
        m = get_provider("messagebird").parse_inbound(req, account_with({}))[0]
        assert m.external_conversation_id == "+44700" and m.text == "hey"

    @pytest.mark.asyncio
    async def test_signature(self):
        key = "signkey"
        body = b'{"originator":"+44","payload":"hi"}'
        ts = "1720000000"
        url = "https://x/api/v1/webhooks/sms/messagebird/abc"
        body_hash = hashlib.sha256(body).digest()
        parts = ts.encode() + b"\n" + url.encode() + b"\n" + body_hash
        sig = base64.b64encode(hmac.new(key.encode(), parts, hashlib.sha256).digest()).decode()
        req = make_req(json_body=json.loads(body), url=url, raw=body,
                       headers={"MessageBird-Request-Timestamp": ts, "MessageBird-Signature": sig})
        assert await get_provider("messagebird").verify_webhook(req, account_with({"signing_key": key})) is True


class TestPlivo:
    def test_parse(self):
        req = make_req(params={"From": "+44700", "To": "+1555", "Text": "yo", "MessageUUID": "pl1"})
        m = get_provider("plivo").parse_inbound(req, account_with({}))[0]
        assert m.external_conversation_id == "+44700" and m.external_message_id == "pl1"

    @pytest.mark.asyncio
    async def test_signature_v3(self):
        token, nonce = "authtok", "n123"
        url = "https://x/api/v1/webhooks/sms/plivo/abc"
        sig = base64.b64encode(hmac.new(token.encode(), (url + nonce).encode(), hashlib.sha256).digest()).decode()
        req = make_req(url=url, headers={"X-Plivo-Signature-V3": sig, "X-Plivo-Signature-V3-Nonce": nonce})
        assert await get_provider("plivo").verify_webhook(req, account_with({"auth_token": token})) is True


class TestBrevo:
    def test_parse(self):
        req = make_req(json_body={"from": "+44700", "to": "+1555", "text": "hi there"})
        m = get_provider("brevo").parse_inbound(req, account_with({}))[0]
        assert m.text == "hi there"


class TestSns:
    def test_parse_notification(self):
        sms = {"originationNumber": "+44700", "destinationNumber": "+1555", "messageBody": "sns hi"}
        req = make_req(json_body={"Type": "Notification", "MessageId": "sns1", "Message": json.dumps(sms)})
        m = get_provider("sns").parse_inbound(req, account_with({}))[0]
        assert m.external_conversation_id == "+44700" and m.text == "sns hi"

    def test_subscription_confirmation_not_a_message(self):
        req = make_req(json_body={"Type": "SubscriptionConfirmation", "SubscribeURL": "https://sns.x"})
        assert get_provider("sns").parse_inbound(req, account_with({})) == []

    @pytest.mark.asyncio
    async def test_non_sns_cert_host_rejected(self):
        # An attacker-hosted cert on S3 (or anywhere off sns.<region>.amazonaws.com) is refused
        for host in ("https://evil.com/c.pem",
                     "https://attacker.s3.amazonaws.com/c.pem",
                     "https://sns.amazonaws.com/c.pem"):  # no region segment
            req = make_req(json_body={"Type": "Notification", "SigningCertURL": host,
                                      "Signature": "x", "Message": "{}", "MessageId": "1",
                                      "Timestamp": "t", "TopicArn": "arn"})
            assert await get_provider("sns").verify_webhook(req, account_with({})) is False

    @pytest.mark.asyncio
    async def test_valid_sns_host_bad_signature_rejected(self):
        req = make_req(json_body={"Type": "Notification",
                                  "SigningCertURL": "https://sns.us-east-1.amazonaws.com/c.pem",
                                  "Signature": base64.b64encode(b"bad").decode(),
                                  "Message": "{}", "MessageId": "1", "Timestamp": "t", "TopicArn": "arn"})
        # Valid host but signature verification fails (no real cert)
        assert await get_provider("sns").verify_webhook(req, account_with({})) is False

    @pytest.mark.asyncio
    async def test_topic_arn_mismatch_rejected(self):
        req = make_req(json_body={"Type": "Notification", "TopicArn": "arn:other",
                                  "SigningCertURL": "https://sns.us-east-1.amazonaws.com/c.pem", "Signature": "x"})
        assert await get_provider("sns").verify_webhook(
            req, account_with({"topic_arn": "arn:mine"})) is False
