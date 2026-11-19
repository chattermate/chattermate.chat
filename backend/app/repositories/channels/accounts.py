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
from datetime import datetime, timezone
from typing import Iterable, Optional, List
from uuid import UUID

from sqlalchemy.orm import Session

from app.channels.base import DeliveryState, SendResult, StatusEvent
from app.models.channels import ChannelAccount, ChannelConversation
from app.models.session_to_agent import SessionToAgent, SessionStatus
from app.core.security import decrypt_credentials, encrypt_api_key
from app.core.logger import get_logger

logger = get_logger(__name__)

# settings key set while the platform rejects the account's credentials:
# {"error": <platform message>, "at": <ISO time>}. Absent means healthy.
AUTH_FAILURE_SETTING = "auth_failure"
# settings key set while the platform will not let a connected account send
# (WhatsApp: Meta refused to register the number, or its account is blocked):
# {"error": <the platform's message>, "at": <ISO time>}
SEND_PROBLEM_SETTING = "send_problem"


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
        return decrypt_credentials(account.encrypted_credentials)

    def update_settings(self, account: ChannelAccount, updates: dict,
                        remove: Iterable[str] = ()) -> ChannelAccount:
        """Merge non-secret settings into the account (and drop `remove`)."""
        merged = {**(account.settings or {}), **updates}
        for key in remove:
            merged.pop(key, None)
        try:
            account.settings = merged
            self.db.commit()
            self.db.refresh(account)
            return account
        except Exception as e:
            logger.error(f"Error updating channel account settings: {str(e)}")
            self.db.rollback()
            raise

    def update_credentials(self, account: ChannelAccount, credentials: dict) -> ChannelAccount:
        try:
            account.encrypted_credentials = encrypt_api_key(json.dumps(credentials))
            # New credentials are a fresh chance; the next send proves them
            account.settings = _without_auth_failure(account.settings)
            self.db.commit()
            self.db.refresh(account)
            return account
        except Exception as e:
            logger.error(f"Error updating channel account credentials: {str(e)}")
            self.db.rollback()
            raise

    def track_send_result(self, account: ChannelAccount, result: SendResult) -> None:
        """Keep the account's needs-reconnect flag in step with what the
        platform just said about its credentials."""
        if result.auth_failed:
            self.record_auth_failure(account, result.error)
        elif result.ok:
            self.clear_auth_failure(account)

    def track_receipt(self, account: ChannelAccount, event: StatusEvent) -> None:
        """Keep the account's send problem in step with delivery receipts.

        Only a receipt proves anything: the send API accepts messages that
        fail later. A delivered or read message shows the account can send; a
        failure the platform blames on the account shows it cannot."""
        if event.account_blocked:
            if send_problem(account) != event.error:
                self.set_send_problem(account, event.error or "The platform is blocking this account from sending.")
        elif event.status in (DeliveryState.DELIVERED, DeliveryState.READ) and send_problem(account):
            self.set_send_problem(account, None)

    def set_send_problem(self, account: ChannelAccount, error: Optional[str]) -> None:
        """Record why the platform will not let the account send, or clear an
        earlier problem when `error` is None."""
        if error:
            self._update_settings_quietly(account, {SEND_PROBLEM_SETTING: {
                "error": error, "at": datetime.now(timezone.utc).isoformat()}})
        elif send_problem(account):
            self._update_settings_quietly(account, {}, remove=(SEND_PROBLEM_SETTING,))

    def record_auth_failure(self, account: ChannelAccount, error: Optional[str]) -> None:
        """Mark the account as needing reconnection after the platform refused
        its credentials. Keeps the first failure's time so the UI can say since
        when."""
        if needs_reconnect(account):
            return
        logger.warning(f"{account.channel_type} account {account.id} needs reconnecting: {error}")
        self._update_settings_quietly(account, {AUTH_FAILURE_SETTING: {
            "error": error, "at": datetime.now(timezone.utc).isoformat()}})

    def clear_auth_failure(self, account: ChannelAccount) -> None:
        """A send went through, so the credentials work again."""
        if needs_reconnect(account):
            self._update_settings_quietly(account, {}, remove=(AUTH_FAILURE_SETTING,))

    def _update_settings_quietly(self, account: ChannelAccount, updates: dict,
                                 remove: Iterable[str] = ()) -> None:
        # Bookkeeping beside a send or a connect: failing to record it must not
        # fail what it describes
        try:
            self.update_settings(account, updates, remove=remove)
        except Exception as e:
            logger.warning(f"Could not update settings of {account.channel_type} account {account.id}: {e}")

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

    def _close_open_sessions(self, account: ChannelAccount) -> None:
        """Close the sessions belonging to this account's conversations.

        Deleting the account cascade-deletes its channel_conversations, but the
        sessions they point at are not owned by the account and would survive as
        open-but-unreachable: an agent could take one over while the customer's
        next message — finding no conversation — starts a fresh thread that the
        AI answers. Closing them first keeps the two from diverging.
        """
        session_ids = [
            row.session_id
            for row in self.db.query(ChannelConversation.session_id)
            .filter(ChannelConversation.channel_account_id == account.id)
            .all()
        ]
        if not session_ids:
            return
        closed = (
            self.db.query(SessionToAgent)
            .filter(
                SessionToAgent.session_id.in_(session_ids),
                SessionToAgent.status != SessionStatus.CLOSED,
            )
            .update({SessionToAgent.status: SessionStatus.CLOSED},
                    synchronize_session=False)
        )
        if closed:
            logger.info(f"Closed {closed} open session(s) for disconnected "
                        f"{account.channel_type} account {account.id}")

    def delete(self, account: ChannelAccount) -> bool:
        try:
            self._close_open_sessions(account)
            self.db.delete(account)
            self.db.commit()
            return True
        except Exception as e:
            logger.error(f"Error deleting channel account: {str(e)}")
            self.db.rollback()
            return False


def needs_reconnect(account: ChannelAccount) -> bool:
    return bool((account.settings or {}).get(AUTH_FAILURE_SETTING))


def send_problem(account: ChannelAccount) -> Optional[str]:
    """The platform's reason the account cannot send, if it cannot."""
    failure = (account.settings or {}).get(SEND_PROBLEM_SETTING)
    return failure.get("error") if isinstance(failure, dict) else None


def _without_auth_failure(settings: Optional[dict]) -> dict:
    # A new dict, not an in-place pop: the JSON column only notices reassignment
    return {k: v for k, v in (settings or {}).items() if k != AUTH_FAILURE_SETTING}
