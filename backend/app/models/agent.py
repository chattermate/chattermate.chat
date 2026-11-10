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

from sqlalchemy import Column, DateTime, Integer, String, Text, Boolean, Enum as SQLEnum, ForeignKey, JSON, Table, Float, func
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from app.core.brand import BRAND_COLORS
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
    # Premium design presets
    GLASS = "GLASS"
    TERMINAL = "TERMINAL"
    PLAYFUL = "PLAYFUL"
    CALM_MINT = "CALM_MINT"
    AURORA = "AURORA"
    SUNRISE = "SUNRISE"


class WidgetPosition(str, enum.Enum):
    FLOATING = "FLOATING"
    FIXED = "FIXED"


class AgentCustomization(Base):
    __tablename__ = "agent_customizations"

    id = Column(Integer, primary_key=True, index=True)
    agent_id = Column(UUID(as_uuid=True), ForeignKey("agents.id", ondelete="CASCADE"))
    photo_url = Column(String)
    chat_background_color = Column(String, default="#F8F9FA")
    chat_bubble_color = Column(String, default=BRAND_COLORS["ink"])
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
    # First in-conversation agent bubble shown on open (distinct from welcome_title/subtitle)
    welcome_message = Column(Text, nullable=True)
    chat_initiation_messages = Column(JSON, nullable=True)
    # Predefined quick-action buttons shown beneath the welcome message (list of label strings)
    quick_actions = Column(JSON, nullable=True)
    show_citations = Column(Boolean, default=False, nullable=False)
    # Optionally require the visitor's email before chatting (off by default)
    collect_email = Column(Boolean, default=False, nullable=False)
    # Small footer line telling visitors the replies come from AI. On by default:
    # the honest disclosure is the one users expect, and it is only ever hidden
    # once a human agent takes the conversation over, where it would be untrue.
    show_ai_disclaimer = Column(Boolean, default=True, nullable=False, server_default="true")
    # Lets a visitor abandon the current conversation and start a clean one. Off by
    # default: it closes the session, so a human agent mid-handover would lose the
    # thread — operators opt in when that trade is right for them.
    allow_new_chat = Column(Boolean, default=False, nullable=False, server_default="false")

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
    # Off means the AI never answers on this agent: every chat is queued for the
    # team from the customer's first message. Distinct from transfer_to_human,
    # which only lets the AI hand over when it decides to.
    ai_replies_enabled = Column(Boolean, default=True, nullable=False, server_default="true")
    # Offer the AI's choices as tappable buttons on messaging channels that
    # can show them (WhatsApp, Messenger, Instagram, Telegram); not the widget
    channel_quick_replies = Column(Boolean, default=False, nullable=False, server_default="false")
    ask_for_rating = Column(Boolean, default=True, nullable=True)
    # On human handoff, optionally collect the visitor's contact details
    handoff_collect_email = Column(Boolean, default=True, nullable=False)
    handoff_collect_name = Column(Boolean, default=True, nullable=False)
    enable_rate_limiting = Column(Boolean, default=False, nullable=True)
    overall_limit_per_ip = Column(Integer, default=100, nullable=True)
    requests_per_sec = Column(Float, default=1, nullable=True)
    # Per customer, only messages that reach the model; null = no limit (see services/reply_limits).
    messages_per_customer_per_minute = Column(Integer, nullable=True)
    replies_per_customer_per_day = Column(Integer, nullable=True)
    use_workflow = Column(Boolean, default=False, nullable=True)
    active_workflow_id = Column(UUID(as_uuid=True), ForeignKey("workflows.id"), nullable=True)
    allow_attachments = Column(Boolean, default=False, nullable=False)
    # JSON array of allowed attachment type categories: ['images', 'documents', 'office', 'text']
    # If empty or null, all types are allowed when attachments are enabled
    allowed_attachment_types = Column(JSON, default=None, nullable=True)
    require_token_auth = Column(Boolean, default=False, nullable=False)
    # Per-agent switch for native AI ticketing (org plan must also allow it).
    # Defaults on so paid orgs get ticketing on every agent out of the box.
    ticketing_enabled = Column(Boolean, default=True, nullable=False, server_default="true")
    # Optional one-line business remit for the platform guardrail's topic-scope
    # line (see app.agents.guardrail_policy). Null -> derived from the agent
    # description or the organization name/domain, so it works with zero config.
    # Only the scope DESCRIPTION is tenant-editable; the enforcement text is code.
    topic_scope = Column(Text, nullable=True)
    # Tenant-editable scope rule shown under Instructions in the dashboard.
    # NULL means "use the shipped default" (guardrail_policy.DEFAULT_GUARDRAIL_PROMPT),
    # so the wording can be improved centrally without rewriting every row.
    # Editable because a code-owned topic list is a guess about what a business
    # is NOT — it refused maths for a maths tutor, algorithms for a bootcamp.
    guardrail_prompt = Column(Text, nullable=True)
    # Off means no scope rule at all. Injection and disclosure rules are not
    # covered by this toggle; they stay code-owned.
    guardrail_enabled = Column(Boolean, default=True, nullable=False, server_default="true")
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
    lead_capture_config = relationship(
        "LeadCaptureConfig", back_populates="agent", uselist=False,
        cascade="all, delete-orphan")
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
