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

import json
import secrets
from typing import Optional, List
from uuid import UUID

from sqlalchemy.orm import Session

from app.models.channels import ChannelAccount
from app.core.security import encrypt_api_key, decrypt_api_key
from app.core.logger import get_logger

logger = get_logger(__name__)


class ChannelAccountRepository:
    """CRUD for connected channel accounts. Credentials are always stored
    Fernet-encrypted; use get_credentials()/create_account() so plaintext
    secrets never touch the table."""

    def __init__(self, db: Session):
        self.db = db

    def create_account(
        self,
        organization_id: UUID,
        channel_type: str,
        external_account_id: str,
        credentials: dict,
        display_name: Optional[str] = None,
        settings: Optional[dict] = None,
    ) -> ChannelAccount:
        try:
            account = ChannelAccount(
                organization_id=organization_id,
                channel_type=channel_type,
                external_account_id=external_account_id,
                display_name=display_name,
                encrypted_credentials=encrypt_api_key(json.dumps(credentials)),
                webhook_secret=secrets.token_urlsafe(32),
                settings=settings or {},
            )
            self.db.add(account)
            self.db.commit()
            self.db.refresh(account)
            logger.info(f"Created {channel_type} channel account for org {organization_id}")
            return account
        except Exception as e:
            logger.error(f"Error creating channel account: {str(e)}")
            self.db.rollback()
            raise

    def get_by_id(self, account_id: UUID) -> Optional[ChannelAccount]:
        try:
            if isinstance(account_id, str):
                account_id = UUID(account_id)
            return self.db.query(ChannelAccount).filter(
                ChannelAccount.id == account_id
            ).first()
        except Exception as e:
            logger.error(f"Error getting channel account: {str(e)}")
            return None

    def get_by_external_id(self, channel_type: str, external_account_id: str) -> Optional[ChannelAccount]:
        """Resolve the account a webhook payload belongs to."""
        try:
            return self.db.query(ChannelAccount).filter(
                ChannelAccount.channel_type == channel_type,
                ChannelAccount.external_account_id == external_account_id,
            ).first()
        except Exception as e:
            logger.error(f"Error getting channel account by external id: {str(e)}")
            return None

    def list_by_org(self, organization_id: UUID, channel_type: Optional[str] = None) -> List[ChannelAccount]:
        try:
            query = self.db.query(ChannelAccount).filter(
                ChannelAccount.organization_id == organization_id
            )
            if channel_type:
                query = query.filter(ChannelAccount.channel_type == channel_type)
            return query.order_by(ChannelAccount.created_at).all()
        except Exception as e:
            logger.error(f"Error listing channel accounts: {str(e)}")
            return []

    def get_credentials(self, account: ChannelAccount) -> dict:
        """Decrypt an account's credential blob."""
        return json.loads(decrypt_api_key(account.encrypted_credentials))

    def update_credentials(self, account: ChannelAccount, credentials: dict) -> ChannelAccount:
        try:
            account.encrypted_credentials = encrypt_api_key(json.dumps(credentials))
            self.db.commit()
            self.db.refresh(account)
            return account
        except Exception as e:
            logger.error(f"Error updating channel account credentials: {str(e)}")
            self.db.rollback()
            raise

    def set_active(self, account: ChannelAccount, is_active: bool) -> ChannelAccount:
        try:
            account.is_active = is_active
            self.db.commit()
            self.db.refresh(account)
            return account
        except Exception as e:
            logger.error(f"Error updating channel account state: {str(e)}")
            self.db.rollback()
            raise

    def delete(self, account: ChannelAccount) -> bool:
        try:
            self.db.delete(account)
            self.db.commit()
            return True
        except Exception as e:
            logger.error(f"Error deleting channel account: {str(e)}")
            self.db.rollback()
            return False
