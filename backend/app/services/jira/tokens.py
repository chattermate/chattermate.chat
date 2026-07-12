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

from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import Any, Dict, Optional

from sqlalchemy.orm import Session

from app.core.exceptions import JiraAuthError
from app.core.logger import get_logger
from app.core.security import decrypt_api_key, encrypt_api_key
from app.models.jira import JiraToken
from app.services.jira import config
from app.services.jira.oauth import JiraOAuth

logger = get_logger(__name__)


@dataclass
class JiraCredentials:
    """Decrypted, ready-to-use Jira credentials for one organization."""
    access_token: str
    cloud_id: str
    site_url: str


def store_token(db: Session, organization_id, token_data: Dict[str, Any],
                cloud_id: str, site_url: str) -> JiraToken:
    """Create or replace the org's Jira token, encrypting secrets at rest."""
    token = db.query(JiraToken).filter(JiraToken.organization_id == organization_id).first()
    if token is None:
        token = JiraToken(organization_id=organization_id)
        db.add(token)
    token.access_token = encrypt_api_key(token_data["access_token"])
    token.refresh_token = encrypt_api_key(token_data["refresh_token"])
    token.token_type = token_data["token_type"]
    token.expires_at = token_data["expires_at"]
    token.cloud_id = cloud_id
    token.site_url = site_url
    db.commit()
    return token


def _is_fresh(token: JiraToken) -> bool:
    leeway = timedelta(seconds=config.TOKEN_REFRESH_LEEWAY_SECONDS)
    return token.expires_at > datetime.utcnow() + leeway


def get_credentials(db: Session, organization_id) -> JiraCredentials:
    """Return decrypted, non-expired Jira credentials for the org, refreshing the
    access token in place when needed. Raises JiraAuthError if the org has no
    connection or the refresh fails."""
    token = db.query(JiraToken).filter(JiraToken.organization_id == organization_id).first()
    if token is None:
        raise JiraAuthError("No Jira connection found")

    if not _is_fresh(token):
        try:
            refreshed = JiraOAuth().refresh(decrypt_api_key(token.refresh_token))
        except Exception as e:
            logger.error(f"Failed to refresh Jira token: {e}")
            raise JiraAuthError("Jira token expired and could not be refreshed")
        token.access_token = encrypt_api_key(refreshed["access_token"])
        token.refresh_token = encrypt_api_key(refreshed["refresh_token"])
        token.token_type = refreshed["token_type"]
        token.expires_at = refreshed["expires_at"]
        db.commit()

    return JiraCredentials(
        access_token=decrypt_api_key(token.access_token),
        cloud_id=token.cloud_id,
        site_url=token.site_url,
    )


def get_token_row(db: Session, organization_id) -> Optional[JiraToken]:
    """The raw token row (encrypted) — for status/disconnect checks only."""
    return db.query(JiraToken).filter(JiraToken.organization_id == organization_id).first()
