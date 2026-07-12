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
from datetime import datetime, timedelta
from typing import Any, Dict
from urllib.parse import urlencode

import requests

from app.core.exceptions import DocuSignAuthError
from app.core.logger import get_logger
from app.services.docusign import config

logger = get_logger(__name__)


class DocuSignOAuth:
    """DocuSign Authorization Code Grant: consent URL, code exchange, refresh,
    and resolving the account's API base URI via /oauth/userinfo. One sync
    implementation shared by the API routes and the token manager."""

    def __init__(self):
        creds = config.oauth_credentials()
        self.client_id = creds["client_id"]
        self.client_secret = creds["client_secret"]
        self.redirect_uri = creds["redirect_uri"]

    def authorization_url(self, state: str) -> str:
        params = {
            "response_type": "code",
            "scope": config.OAUTH_SCOPE,
            "client_id": self.client_id,
            "redirect_uri": self.redirect_uri,
            "state": state,
        }
        return f"{config.auth_base()}/oauth/auth?{urlencode(params)}"

    def exchange_code(self, code: str) -> Dict[str, Any]:
        return self._token_request(
            {"grant_type": "authorization_code", "code": code},
            error="Failed to exchange code for token")

    def refresh(self, refresh_token: str) -> Dict[str, Any]:
        data = self._token_request(
            {"grant_type": "refresh_token", "refresh_token": refresh_token},
            error="Failed to refresh token")
        data["refresh_token"] = data.get("refresh_token") or refresh_token
        return data

    def get_account(self, access_token: str) -> Dict[str, str]:
        """Return the default account's id + REST base URI from /oauth/userinfo."""
        response = requests.get(
            f"{config.auth_base()}/oauth/userinfo",
            headers={"Authorization": f"Bearer {access_token}"},
            timeout=config.HTTP_TIMEOUT_SECONDS,
        )
        if response.status_code != 200:
            raise DocuSignAuthError("Failed to get DocuSign account info")
        accounts = response.json().get("accounts", [])
        if not accounts:
            raise DocuSignAuthError("No DocuSign accounts found for this user")
        account = next((a for a in accounts if a.get("is_default")), accounts[0])
        return {"account_id": account["account_id"], "base_uri": account["base_uri"]}

    def _basic_auth_header(self) -> str:
        raw = f"{self.client_id}:{self.client_secret}".encode()
        return "Basic " + base64.b64encode(raw).decode()

    def _token_request(self, data: Dict[str, str], error: str) -> Dict[str, Any]:
        response = requests.post(
            f"{config.auth_base()}/oauth/token",
            headers={"Authorization": self._basic_auth_header()},
            data=data,
            timeout=config.HTTP_TIMEOUT_SECONDS,
        )
        if response.status_code != 200:
            logger.error(f"{error}: {response.status_code} {response.text[:200]}")
            raise DocuSignAuthError(error)
        payload = response.json()
        return {
            "access_token": payload["access_token"],
            "refresh_token": payload.get("refresh_token"),
            "token_type": payload.get("token_type", "Bearer"),
            "expires_at": datetime.utcnow() + timedelta(seconds=payload["expires_in"]),
        }
