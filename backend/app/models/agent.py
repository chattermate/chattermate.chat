"""
ChatterMate - Agent
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
"""

from sqlalchemy import Column, DateTime, Integer, String, Text, Boolean, Enum as SQLEnum, ForeignKey, JSON, Table, Float, func
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base
import enum
import json
import uuid
from typing import Optional


class AgentType(str, enum.Enum):
    CUSTOMER_SUPPORT = "customer_support"
    SALES = "sales"
    TECH_SUPPORT = "tech_support"
    GENERAL = "general"
    CUSTOM = "custom"


class ChatStyle(str, enum.Enum):
    CHATBOT = "CHATBOT"
    ASK_ANYTHING = "ASK_ANYTHING"


class WidgetPosition(str, enum.Enum):
    FLOATING = "FLOATING"
    FIXED = "FIXED"


class AgentCustomization(Base):
    __tablename__ = "agent_customizations"

    id = Column(Integer, primary_key=True, index=True)
    agent_id = Column(UUID(as_uuid=True), ForeignKey("agents.id", ondelete="CASCADE"))
    photo_url = Column(String)
    chat_background_color = Column(String, default="#F8F9FA")
    chat_bubble_color = Column(String, default="#E9ECEF")
    chat_text_color = Column(String, default="#212529")
    icon_url = Column(String)
    icon_color = Column(String, default="#6C757D")
    accent_color = Column(String, default="#f34611")
    font_family = Column(String, default="Inter, system-ui, sans-serif")
    custom_css = Column(Text)
    customization_metadata = Column(JSON, default={})
    chat_style = Column(SQLEnum(ChatStyle), default=ChatStyle.CHATBOT, nullable=False)
    widget_position = Column(SQLEnum(WidgetPosition), default=WidgetPosition.FLOATING, nullable=False)
    welcome_title = Column(String, nullable=True)
    welcome_subtitle = Column(String, nullable=True)
    chat_initiation_messages = Column(JSON, nullable=True)

    # Relationship
    agent = relationship("Agent", back_populates="customization")

    @property
    def photo_url_signed(self) -> Optional[str]:
        """Get signed URL for photo if using S3"""
        if not self.photo_url:
            return None
        
        from app.core.config import settings
        if settings.S3_FILE_STORAGE:
            from app.core.s3 import get_s3_signed_url
            import asyncio
            return asyncio.run(get_s3_signed_url(self.photo_url))
        return self.photo_url




# Association table for agent-usergroup relationship
agent_usergroup = Table(
    'agent_usergroup',
    Base.metadata,
    Column('agent_id', UUID(as_uuid=True), ForeignKey('agents.id', ondelete='CASCADE')),
    Column('group_id', UUID(as_uuid=True), ForeignKey('groups.id', ondelete='CASCADE'))
)


class Agent(Base):
    __tablename__ = "agents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    display_name = Column(String(100), nullable=True)
    description = Column(Text)
    agent_type = Column(SQLEnum(AgentType), nullable=False)
    _instructions = Column('instructions', Text, nullable=False)
    tools = Column(Text)  # Stored as JSON array of tool configurations
    is_active = Column(Boolean, default=False)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"))
    is_default = Column(Boolean, default=False)
    transfer_to_human = Column(Boolean, default=False, nullable=False)
    ask_for_rating = Column(Boolean, default=True, nullable=True)
    enable_rate_limiting = Column(Boolean, default=False, nullable=True)
    overall_limit_per_ip = Column(Integer, default=100, nullable=True)
    requests_per_sec = Column(Float, default=1, nullable=True)
    use_workflow = Column(Boolean, default=False, nullable=True)
    active_workflow_id = Column(UUID(as_uuid=True), ForeignKey("workflows.id"), nullable=True)
    allow_attachments = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    # Relationships
    organization = relationship("Organization", back_populates="agents")
    knowledge_links = relationship(
        "KnowledgeToAgent", back_populates="agent", cascade="all, delete-orphan")
    mcp_tool_links = relationship(
        "MCPToolToAgent", back_populates="agent", cascade="all, delete-orphan")
    customization = relationship(
        "AgentCustomization", back_populates="agent", uselist=False)
    widgets = relationship("Widget", back_populates="agent")
    chat_histories = relationship("ChatHistory", back_populates="agent")
    session_assignments = relationship("SessionToAgent", back_populates="agent")
    ratings = relationship("Rating", back_populates="agent")
    groups = relationship(
        "UserGroup",
        secondary=agent_usergroup,
        backref="agents",
        lazy="joined"
    )
    active_workflow = relationship(
        "Workflow", 
        foreign_keys=[active_workflow_id],
        backref="active_agents"
    )
    workflows = relationship(
        "Workflow", 
        foreign_keys="[Workflow.agent_id]",
        back_populates="agent"
    )

    @property
    def instructions(self):
        """Get instructions as a list"""
        if not self._instructions:
            return []
        try:
            return json.loads(self._instructions)
        except json.JSONDecodeError:
            return [self._instructions]

    @instructions.setter
    def instructions(self, value):
        """Set instructions, converting to JSON string if needed"""
        if isinstance(value, list):
            self._instructions = json.dumps(value)
        elif isinstance(value, str):
            try:
                # Try to parse as JSON first
                parsed = json.loads(value)
                if isinstance(parsed, list):
                    self._instructions = value
                else:
                    self._instructions = json.dumps([value])
            except json.JSONDecodeError:
                # If not valid JSON, treat as single instruction
                self._instructions = json.dumps([value])
        else:
            raise ValueError("Instructions must be a list or string")

    class Config:
        orm_mode = True
