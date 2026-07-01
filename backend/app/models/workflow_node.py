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

from sqlalchemy import Column, String, Text, ForeignKey, JSON, Float, DateTime, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.database import Base
import enum
import uuid


class NodeType(str, enum.Enum):
    MESSAGE = "message"
    LLM = "llm"
    CONDITION = "condition"
    FORM = "form"
    ACTION = "action"
    HUMAN_TRANSFER = "human_transfer"
    WAIT = "wait"
    END = "end"
    LANDING_PAGE = "landing_page"
    USER_INPUT = "user_input"
    GUARDRAILS = "guardrails"


class ActionType(str, enum.Enum):
    WEBHOOK = "webhook"
    DATABASE = "database"
    EMAIL = "email"
    NOTIFICATION = "notification"
    CUSTOM = "custom"


class ExitCondition(str, enum.Enum):
    SINGLE_EXECUTION = "single_execution"
    CONTINUOUS_EXECUTION = "continuous_execution"


class WorkflowNode(Base):
    __tablename__ = "workflow_nodes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workflow_id = Column(UUID(as_uuid=True), ForeignKey("workflows.id", ondelete="CASCADE"), nullable=False)
    node_type = Column(Enum(NodeType), nullable=False)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    position_x = Column(Float, default=0)  # X coordinate on canvas
    position_y = Column(Float, default=0)  # Y coordinate on canvas
    config = Column(JSON, default={})  # Node-specific configuration
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    


    # Relationships
    workflow = relationship("Workflow", back_populates="nodes")
    outgoing_connections = relationship(
        "WorkflowConnection", 
        foreign_keys="[WorkflowConnection.source_node_id]", 
        back_populates="source_node",
        cascade="all, delete-orphan"
    )
    incoming_connections = relationship(
        "WorkflowConnection", 
        foreign_keys="[WorkflowConnection.target_node_id]", 
        back_populates="target_node",
        cascade="all, delete-orphan"
    )

    class Config:
        orm_mode = True 