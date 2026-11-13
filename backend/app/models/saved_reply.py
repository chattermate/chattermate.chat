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

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from app.database import Base


class SavedReply(Base):
    """A reply the team writes once and sends many times (the inbox's ⚡ picker).

    The body may hold variables ({{customer.first_name}}, {{agent.name}}), which
    the inbox fills in when it inserts the reply. Shared by the organization.
    """
    __tablename__ = 'saved_replies'
    __table_args__ = (UniqueConstraint('organization_id', 'shortcut', name='uq_saved_replies_org_shortcut'),)

    id = Column(Integer, primary_key=True)
    organization_id = Column(UUID(as_uuid=True), ForeignKey('organizations.id', ondelete='CASCADE'),
                             nullable=False, index=True)
    title = Column(String(100), nullable=False)
    body = Column(Text, nullable=False)
    # Typed after "/" to find it fast ("refund-eu"); unique in the organization
    shortcut = Column(String(40), nullable=True)
    created_by = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='SET NULL'), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
