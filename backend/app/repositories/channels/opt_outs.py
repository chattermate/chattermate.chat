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

from typing import Iterable, Optional

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.channels import ChannelAccount, ChannelOptOut


class ChannelOptOutRepository:
    def __init__(self, db: Session):
        self.db = db

    def get(self, channel_account_id, contact: str) -> Optional[ChannelOptOut]:
        return (self.db.query(ChannelOptOut)
                .filter(ChannelOptOut.channel_account_id == channel_account_id,
                        ChannelOptOut.contact == contact)
                .first())

    def is_opted_out(self, channel_account_id, contact: Optional[str]) -> bool:
        return bool(contact) and self.get(channel_account_id, contact) is not None

    def opted_out_of(self, channel_account_id, contacts: Iterable[str]) -> set:
        """Which of these contacts told this number STOP (one query for a batch)."""
        wanted = [c for c in set(contacts) if c]
        if not wanted:
            return set()
        rows = (self.db.query(ChannelOptOut.contact)
                .filter(ChannelOptOut.channel_account_id == channel_account_id,
                        ChannelOptOut.contact.in_(wanted))
                .all())
        return {row[0] for row in rows}

    def opt_out(self, account: ChannelAccount, contact: str, source: str) -> bool:
        """Record a STOP. True when it is new (a repeat keeps the first time)."""
        if self.get(account.id, contact) is not None:
            return False
        self.db.add(ChannelOptOut(organization_id=account.organization_id, channel_account_id=account.id,
                                  contact=contact, source=source))
        try:
            self.db.commit()
        except IntegrityError:
            # The same STOP arriving twice at once: the other one recorded it
            self.db.rollback()
            return False
        return True

    def opt_in(self, channel_account_id, contacts: Iterable[str]) -> bool:
        """Clear a STOP (START) under any of these forms of the number. True when there was one."""
        wanted = [c for c in set(contacts) if c]
        if not wanted:
            return False
        removed = (self.db.query(ChannelOptOut)
                   .filter(ChannelOptOut.channel_account_id == channel_account_id,
                           ChannelOptOut.contact.in_(wanted))
                   .delete(synchronize_session=False))
        self.db.commit()
        return removed > 0
