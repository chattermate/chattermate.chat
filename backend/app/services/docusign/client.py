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

from typing import Any, Dict, List, Optional

import requests

from app.core.exceptions import DocuSignAuthError
from app.core.logger import get_logger
from app.services.docusign import config

logger = get_logger(__name__)


class DocuSignClient:
    """Thin synchronous wrapper over the DocuSign eSignature REST API for one
    account. Every call goes through `_request`, so the base URL and auth header
    are built exactly once."""

    def __init__(self, access_token: str, account_id: str, base_uri: str):
        self.access_token = access_token
        self.account_id = account_id
        self.base_uri = base_uri.rstrip("/")

    def _request(self, method: str, path: str, **kwargs) -> requests.Response:
        url = (f"{self.base_uri}/restapi/{config.API_VERSION}/accounts/"
               f"{self.account_id}/{path.lstrip('/')}")
        headers = {
            "Authorization": f"Bearer {self.access_token}",
            "Accept": "application/json",
            "Content-Type": "application/json",
        }
        return requests.request(
            method, url, headers=headers, timeout=config.HTTP_TIMEOUT_SECONDS, **kwargs)

    def list_templates(self) -> List[Dict[str, Any]]:
        response = self._request("GET", "templates")
        if response.status_code != 200:
            raise DocuSignAuthError(f"Failed to list DocuSign templates: {response.text[:200]}")
        return [
            {"templateId": t.get("templateId"), "name": t.get("name")}
            for t in response.json().get("envelopeTemplates", [])
        ]

    def send_envelope_from_template(self, template_id: str, recipient_email: str,
                                    recipient_name: str, role_name: str = "Signer",
                                    email_subject: Optional[str] = None) -> Dict[str, Any]:
        body = {
            "templateId": template_id,
            "templateRoles": [{
                "email": recipient_email,
                "name": recipient_name,
                "roleName": role_name,
            }],
            "status": "sent",
        }
        if email_subject:
            body["emailSubject"] = email_subject
        response = self._request("POST", "envelopes", json=body)
        if response.status_code not in (200, 201):
            raise DocuSignAuthError(f"Failed to send DocuSign envelope: {response.text[:200]}")
        return response.json()

    def get_envelope(self, envelope_id: str) -> Dict[str, Any]:
        response = self._request("GET", f"envelopes/{envelope_id}")
        if response.status_code != 200:
            raise DocuSignAuthError(
                f"Failed to get DocuSign envelope {envelope_id}: {response.text[:200]}")
        return response.json()
