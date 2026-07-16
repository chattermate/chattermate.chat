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

from app.database import Base
from .organization import Organization
from .user import User
from .customer import Customer
from .role import Role
from .permission import Permission
from .ai_config import AIConfig, AIModelType
from .agent import Agent
from .knowledge_to_agent import KnowledgeToAgent
from .knowledge import Knowledge
from .chat_history import ChatHistory
from .session_to_agent import SessionToAgent, SessionStatus
from .rating import Rating
from app.models.jira import JiraToken
from app.models.shopify import ShopifyShop
from app.models.workflow import Workflow
from app.models.workflow_node import WorkflowNode, ExitCondition
from app.models.workflow_connection import WorkflowConnection
from app.models.mcp_tool import MCPTool, MCPToolToAgent, MCPTransportType
from app.models.file_attachment import FileAttachment
from app.models.customer import LeadStage
from app.models.lead_capture import (
    LeadCaptureConfig, LeadCaptureResponse,
    LeadAssignmentMode, CrmSyncTarget,
)
from app.models.channels import (
    ChannelAccount, ChannelType, ChannelConversation, AgentChannelConfig,
)
from app.models.faq_generation_job import (
    FAQGenerationJob, FAQJobType, FAQJobStatus, FAQJobStage,
)
from app.models.faq import FAQ, FAQStatus
from app.models.help_center import (
    HelpCenterSettings, HelpCenterQuery, DomainStatus, SSLStatus,
)
from app.models.ticket import (
    Ticket, TicketSequence, TicketSession,
    TicketStatus, TicketPriority, TicketSource, ResolutionOutcome,
)
from app.models.ticket_activity import TicketActivity, TicketActivityType, TicketActorType
from app.models.ticket_settings import OrganizationTicketSettings
from app.models.investigation import (
    InvestigationRun, InvestigationRunType, InvestigationRunStatus, InvestigationTrigger,
)



# This ensures all models are imported in the correct order
__all__ = [
    "Organization",
    "User",
    "Customer",
    "Permission",
    "Role",
    "AIConfig",
    "AIModelType",
    "Agent",
    "KnowledgeToAgent",
    "Knowledge",
    "ChatHistory",
    "SessionToAgent",
    "SessionStatus",
    "Rating",
    "JiraToken",
    "ShopifyShop",
    "Workflow",
    "WorkflowNode",
    "ExitCondition",
    "WorkflowConnection",
    "MCPTool",
    "MCPToolToAgent",
    "MCPTransportType",
    "FileAttachment",
    "LeadStage",
    "LeadCaptureConfig",
    "LeadCaptureResponse",
    "LeadAssignmentMode",
    "CrmSyncTarget",
    "ChannelAccount",
    "ChannelType",
    "ChannelConversation",
    "AgentChannelConfig",
    "FAQGenerationJob",
    "FAQJobType",
    "FAQJobStatus",
    "FAQJobStage",
    "FAQ",
    "FAQStatus",
    "HelpCenterSettings",
    "HelpCenterQuery",
    "DomainStatus",
    "SSLStatus",
    "Ticket",
    "TicketSequence",
    "TicketSession",
    "TicketStatus",
    "TicketPriority",
    "TicketSource",
    "ResolutionOutcome",
    "TicketActivity",
    "TicketActivityType",
    "TicketActorType",
    "OrganizationTicketSettings",
    "InvestigationRun",
    "InvestigationRunType",
    "InvestigationRunStatus",
    "InvestigationTrigger",
]
