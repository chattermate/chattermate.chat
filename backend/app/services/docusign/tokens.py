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

from app.core.exceptions import DocuSignAuthError
from app.core.logger import get_logger
from app.core.security import decrypt_api_key, encrypt_api_key
from app.models.docusign import DocuSignToken
from app.services.docusign import config
from app.services.docusign.oauth import DocuSignOAuth

logger = get_logger(__name__)


@dataclass
class DocuSignCredentials:
    """Decrypted, ready-to-use DocuSign credentials for one organization."""
    access_token: str
    account_id: str
    base_uri: str


def store_token(db: Session, organization_id, token_data: Dict[str, Any],
                account_id: str, base_uri: str) -> DocuSignToken:
    """Create or replace the org's DocuSign token, encrypting secrets at rest."""
    token = db.query(DocuSignToken).filter(
        DocuSignToken.organization_id == organization_id).first()
    if token is None:
        token = DocuSignToken(organization_id=organization_id)
        db.add(token)
    token.access_token = encrypt_api_key(token_data["access_token"])
    # Providers may omit a refresh token; store empty rather than crashing the
    # OAuth callback (refresh will then fail cleanly and prompt a reconnect).
    token.refresh_token = encrypt_api_key(token_data.get("refresh_token") or "")
    token.token_type = token_data["token_type"]
    token.expires_at = token_data["expires_at"]
    token.account_id = account_id
    token.base_uri = base_uri
    db.commit()
    return token


def _is_fresh(token: DocuSignToken) -> bool:
    leeway = timedelta(seconds=config.TOKEN_REFRESH_LEEWAY_SECONDS)
    return token.expires_at > datetime.utcnow() + leeway


def get_credentials(db: Session, organization_id) -> DocuSignCredentials:
    """Return decrypted, non-expired DocuSign credentials, refreshing in place
    when needed. Raises DocuSignAuthError if not connected or refresh fails."""
    token = db.query(DocuSignToken).filter(
        DocuSignToken.organization_id == organization_id).first()
    if token is None:
        raise DocuSignAuthError("No DocuSign connection found")

    if not _is_fresh(token):
        try:
            refreshed = DocuSignOAuth().refresh(decrypt_api_key(token.refresh_token))
        except Exception as e:
            logger.error(f"Failed to refresh DocuSign token: {e}")
            raise DocuSignAuthError("DocuSign token expired and could not be refreshed")
        token.access_token = encrypt_api_key(refreshed["access_token"])
        token.refresh_token = encrypt_api_key(refreshed["refresh_token"])
        token.token_type = refreshed["token_type"]
        token.expires_at = refreshed["expires_at"]
        db.commit()

    return DocuSignCredentials(
        access_token=decrypt_api_key(token.access_token),
        account_id=token.account_id,
        base_uri=token.base_uri,
    )


def get_token_row(db: Session, organization_id) -> Optional[DocuSignToken]:
    """The raw token row (encrypted) — for status/disconnect checks only."""
    return db.query(DocuSignToken).filter(
        DocuSignToken.organization_id == organization_id).first()
