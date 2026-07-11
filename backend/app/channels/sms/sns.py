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

import asyncio
import base64
import json
import re
from typing import ClassVar, List, Optional
from urllib.parse import urlparse

from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.x509 import load_pem_x509_certificate

from app.channels.base import InboundMessage, SendResult
from app.channels.sms.base import (
    CredentialField, SmsProvider, SmsWebhookRequest,
    get_http_client, inbound, register_provider,
)
from app.models.channels import ChannelAccount
from app.core.logger import get_logger

logger = get_logger(__name__)

# Signed-string field order per SNS message type
_SIGN_FIELDS = {
    "Notification": ["Message", "MessageId", "Subject", "Timestamp", "TopicArn", "Type"],
    "SubscriptionConfirmation": ["Message", "MessageId", "SubscribeURL", "Timestamp", "Token", "TopicArn", "Type"],
    "UnsubscribeConfirmation": ["Message", "MessageId", "SubscribeURL", "Timestamp", "Token", "TopicArn", "Type"],
}
_cert_cache: dict = {}


def _string_to_sign(body: dict) -> Optional[str]:
    fields = _SIGN_FIELDS.get(body.get("Type"))
    if not fields:
        return None
    parts = []
    for key in fields:
        if key in body and body[key] is not None:
            parts.append(f"{key}\n{body[key]}\n")
    return "".join(parts)


# Only genuine SNS endpoints — NOT any *.amazonaws.com (e.g. an attacker could
# host a spoofed cert on *.s3.amazonaws.com). AWS SNS uses sns.<region>.amazonaws.com.
_SNS_HOST_RE = re.compile(r"^sns\.[a-z0-9-]+\.amazonaws\.com$")


def _valid_sns_host(url: str) -> bool:
    parsed = urlparse(url)
    return parsed.scheme == "https" and parsed.hostname is not None and \
        bool(_SNS_HOST_RE.match(parsed.hostname))


class SnsProvider(SmsProvider):
    """AWS SNS / End User Messaging. Outbound via SNS Publish; inbound arrives
    as SNS HTTPS-subscription notifications (two-way SMS → SNS topic)."""

    name: ClassVar[str] = "sns"
    label: ClassVar[str] = "AWS SNS"
    signs_webhook: ClassVar[bool] = True
    credential_fields: ClassVar[List[CredentialField]] = [
        CredentialField("aws_access_key_id", "AWS access key ID"),
        CredentialField("aws_secret_access_key", "AWS secret access key", secret=True),
        CredentialField("region", "AWS region (e.g. us-east-1)"),
        CredentialField("topic_arn", "SNS topic ARN (optional)", optional=True),
    ]

    async def verify_webhook(self, req: SmsWebhookRequest, account: ChannelAccount) -> bool:
        body = req.json_body or {}
        configured_topic = self.credentials(account).get("topic_arn")
        if configured_topic and body.get("TopicArn") != configured_topic:
            return False
        cert_url = body.get("SigningCertURL", "")
        if not _valid_sns_host(cert_url):
            return False
        string_to_sign = _string_to_sign(body)
        signature = body.get("Signature")
        if not string_to_sign or not signature:
            return False
        try:
            cert_pem = await self._fetch_cert(cert_url)
            algorithm = hashes.SHA256() if body.get("SignatureVersion") == "2" else hashes.SHA1()
            public_key = load_pem_x509_certificate(cert_pem).public_key()
            public_key.verify(base64.b64decode(signature), string_to_sign.encode(),
                              padding.PKCS1v15(), algorithm)
            return True
        except Exception as e:
            logger.error(f"SNS signature verification failed: {e}")
            return False

    async def handle_control(self, req: SmsWebhookRequest, account: ChannelAccount) -> bool:
        """Auto-confirm the SNS HTTPS subscription by visiting SubscribeURL."""
        body = req.json_body or {}
        if body.get("Type") == "SubscriptionConfirmation" and body.get("SubscribeURL"):
            # Only fetch AWS-hosted SubscribeURLs — verify_webhook already ran,
            # but restrict here too to avoid any SSRF to an attacker URL.
            if not _valid_sns_host(body["SubscribeURL"]):
                logger.warning(f"Refusing non-SNS SubscribeURL for account {account.id}")
                return True
            try:
                await get_http_client().get(body["SubscribeURL"])
                logger.info(f"Confirmed SNS subscription for account {account.id}")
            except Exception as e:
                logger.error(f"SNS subscription confirmation failed: {e}")
            return True
        return body.get("Type") == "UnsubscribeConfirmation"

    def parse_inbound(self, req: SmsWebhookRequest, account: ChannelAccount) -> List[InboundMessage]:
        body = req.json_body or {}
        if body.get("Type") != "Notification":
            return []
        message = body.get("Message")
        try:
            sms = json.loads(message) if isinstance(message, str) else (message or {})
        except (ValueError, TypeError):
            return []
        sender = sms.get("originationNumber", "")
        text = (sms.get("messageBody") or "").strip()
        if not sender or not text:
            return []
        return [inbound(sms.get("destinationNumber", ""), sender, text, body.get("MessageId", ""))]

    async def send(self, account: ChannelAccount, to: str, text: str) -> SendResult:
        creds = self.credentials(account)
        try:
            message_id = await asyncio.to_thread(self._publish, creds, to, text)
            return SendResult(ok=True, external_message_id=message_id)
        except Exception as e:
            logger.error(f"SNS send failed: {e}")
            return SendResult(ok=False, error=str(e))

    @staticmethod
    def _publish(creds: dict, to: str, text: str) -> str:
        import boto3
        client = boto3.client(
            "sns",
            aws_access_key_id=creds["aws_access_key_id"],
            aws_secret_access_key=creds["aws_secret_access_key"],
            region_name=creds.get("region"),
        )
        result = client.publish(PhoneNumber=to, Message=text)
        return result.get("MessageId", "")

    async def _fetch_cert(self, url: str) -> bytes:
        if url in _cert_cache:
            return _cert_cache[url]
        response = await get_http_client().get(url)
        cert = response.content
        _cert_cache[url] = cert
        return cert

    async def validate_credentials(self, phone_number: str, credentials: dict) -> None:
        for key in ("aws_access_key_id", "aws_secret_access_key", "region"):
            if not credentials.get(key):
                raise ValueError("AWS access key, secret, and region are required")


register_provider(SnsProvider())
