"""
ChatterMate - Channel access
Copyright (C) 2024 ChatterMate

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>

Whether an org may connect a new channel. Only a new connection is checked: a
plan that lost channels keeps the ones it has, and refreshing one that expired
must still work, or its customers' messages stop reaching the team.
"""

from uuid import UUID

from sqlalchemy.orm import Session

from app.services.feature_gate import check_feature_access, feature_allowed

CHANNELS_FEATURE = "channels"

UPGRADE_MESSAGE = "Your plan doesn't include channels. Upgrade to connect one."


def channels_allowed(db: Session, organization_id: UUID) -> bool:
    """Non-raising check, for the OAuth callback that answers with a redirect."""
    return feature_allowed(db, organization_id, CHANNELS_FEATURE)


def check_channel_access(db: Session, organization_id: UUID) -> None:
    """Raising check for connect endpoints (403 with the upgrade message)."""
    check_feature_access(db, organization_id, CHANNELS_FEATURE, UPGRADE_MESSAGE)
