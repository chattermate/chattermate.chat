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

from sqlalchemy import Column, DateTime, ForeignKey, String, func
from sqlalchemy.dialects.postgresql import UUID
import uuid

from app.database import Base


class AuthSession(Base):
    """One signed-in dashboard session: a login and every refresh after it.

    Access and refresh JWTs carry the row's id as their `sid` claim. The tokens
    themselves are stateless, so this row is what makes signing out stick:
    revoking it rejects both tokens before they expire.
    """

    __tablename__ = "auth_sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    revoked_at = Column(DateTime(timezone=True), nullable=True)
    # How the session was opened ("password", "signup", "sso"), and through
    # which linked SSO account, so unlinking an account or a sign-in policy
    # can end exactly the sessions it opened. NULL on sessions from before.
    auth_method = Column(String, nullable=True)
    identity_id = Column(
        UUID(as_uuid=True),
        ForeignKey("user_identities.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
