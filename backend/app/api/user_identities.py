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

The single sign-on accounts linked to a team member: an admin can see them
and unlink one (say, after the person's Google account was recreated, which
SSO refuses to link on its own).
"""

from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.auth import require_permissions
from app.database import get_db
from app.models.schemas.user_identity import UserIdentityResponse
from app.models.user import User
from app.services.sso_accounts import identities_of, unlink

router = APIRouter()


def _team_member(db: Session, user_id: UUID, admin: User) -> User:
    user = db.query(User).filter(User.id == user_id).first()
    if not user or user.organization_id != admin.organization_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user


@router.get("/{user_id}/identities", response_model=List[UserIdentityResponse])
async def list_identities(
    user_id: UUID,
    admin: User = Depends(require_permissions("manage_users")),
    db: Session = Depends(get_db),
):
    """The SSO accounts that sign in as this team member."""
    user = _team_member(db, user_id, admin)
    return identities_of(db, user.id)


@router.delete("/{user_id}/identities/{identity_id}", status_code=status.HTTP_204_NO_CONTENT)
async def unlink_identity(
    user_id: UUID,
    identity_id: UUID,
    admin: User = Depends(require_permissions("manage_users")),
    db: Session = Depends(get_db),
):
    """Unlink one SSO account and end the sessions it opened. Its next sign-in
    links again by e-mail address, if the provider vouches for it."""
    user = _team_member(db, user_id, admin)
    if not unlink(db, user.id, identity_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Linked account not found")
    db.commit()
