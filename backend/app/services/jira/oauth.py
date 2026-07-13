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

from datetime import datetime, timedelta
from typing import Any, Dict, List
from urllib.parse import urlencode

import requests

from app.core.exceptions import JiraAuthError
from app.core.logger import get_logger
from app.services.jira import config

logger = get_logger(__name__)


class JiraOAuth:
    """Atlassian OAuth 2.0 (3LO): authorization URL, code exchange, refresh, and
    resolving the accessible Jira Cloud site. One synchronous implementation used
    by both the API routes and the token manager (no duplicated refresh logic)."""

    def __init__(self):
        creds = config.oauth_credentials()
        self.client_id = creds["client_id"]
        self.client_secret = creds["client_secret"]
        self.redirect_uri = creds["redirect_uri"]

    def authorization_url(self, state: str) -> str:
        params = {
            "audience": "api.atlassian.com",
            "client_id": self.client_id,
            "scope": config.OAUTH_SCOPE,
            "redirect_uri": self.redirect_uri,
            "state": state,
            "response_type": "code",
            "prompt": "consent",
        }
        return f"{config.AUTH_URL}?{urlencode(params)}"

    def exchange_code(self, code: str) -> Dict[str, Any]:
        return self._token_request({
            "grant_type": "authorization_code",
            "client_id": self.client_id,
            "client_secret": self.client_secret,
            "code": code,
            "redirect_uri": self.redirect_uri,
        }, error="Failed to exchange code for token")

    def refresh(self, refresh_token: str) -> Dict[str, Any]:
        data = self._token_request({
            "grant_type": "refresh_token",
            "client_id": self.client_id,
            "client_secret": self.client_secret,
            "refresh_token": refresh_token,
        }, error="Failed to refresh token")
        # Atlassian may not return a new refresh token; keep the existing one.
        data["refresh_token"] = data.get("refresh_token") or refresh_token
        return data

    def get_accessible_resources(self, access_token: str) -> List[Dict[str, str]]:
        response = requests.get(
            config.ACCESSIBLE_RESOURCES_URL,
            headers={"Authorization": f"Bearer {access_token}", "Accept": "application/json"},
            timeout=config.HTTP_TIMEOUT_SECONDS,
        )
        if response.status_code != 200:
            raise JiraAuthError("Failed to get Jira accessible resources")
        resources = response.json()
        if not resources:
            raise JiraAuthError("No Jira Cloud instances found")
        return resources

    def _token_request(self, data: Dict[str, str], error: str) -> Dict[str, Any]:
        response = requests.post(config.TOKEN_URL, data=data, timeout=config.HTTP_TIMEOUT_SECONDS)
        if response.status_code != 200:
            logger.error(f"{error}: {response.status_code} {response.text[:200]}")
            raise JiraAuthError(error)
        payload = response.json()
        return {
            "access_token": payload["access_token"],
            "refresh_token": payload.get("refresh_token"),
            "token_type": payload["token_type"],
            "expires_at": datetime.utcnow() + timedelta(seconds=payload["expires_in"]),
        }
