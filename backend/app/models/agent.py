from sqlalchemy import Column, Integer, String, Text, Boolean, Enum as SQLEnum, ForeignKey, JSON, Table
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base
import enum
import json
import uuid


class AgentType(str, enum.Enum):
    CUSTOMER_SUPPORT = "customer_support"
    SALES = "sales"
    TECH_SUPPORT = "tech_support"
    GENERAL = "general"
    CUSTOM = "custom"


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

    # Relationship
    agent = relationship("Agent", back_populates="customization")


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

    # Relationships
    organization = relationship("Organization", back_populates="agents")
    knowledge_links = relationship(
        "KnowledgeToAgent", back_populates="agent", cascade="all, delete-orphan")
    customization = relationship(
        "AgentCustomization", back_populates="agent", uselist=False)
    widgets = relationship("Widget", back_populates="agent")
    chat_histories = relationship("ChatHistory", back_populates="agent")
    session_assignments = relationship("SessionToAgent", back_populates="agent")
    groups = relationship(
        "UserGroup",
        secondary=agent_usergroup,
        backref="agents",
        lazy="joined"
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
