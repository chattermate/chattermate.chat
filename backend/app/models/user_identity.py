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

from sqlalchemy import Column, DateTime, ForeignKey, String, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid

from app.database import Base


class UserIdentity(Base):
    """A single sign-on account linked to a dashboard user.

    The e-mail address is only used once, to link the account on its first
    sign-in. After that the user is found by the provider's stable subject
    (`iss` + `sub`), so a changed or spoofed address can't reach someone
    else's account.
    """

    __tablename__ = "user_identities"
    __table_args__ = (
        UniqueConstraint("provider", "issuer", "subject", name="uq_user_identities_provider_issuer_subject"),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    provider = Column(String, nullable=False)
    issuer = Column(String, nullable=False)
    subject = Column(String, nullable=False)
    # The address the account was linked with, for support and audit.
    email = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_login_at = Column(DateTime(timezone=True), nullable=True)

    user = relationship("User", back_populates="identities")
