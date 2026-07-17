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

from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from uuid import UUID
from datetime import datetime

from app.models.customer import LeadStage


class PersonListItem(BaseModel):
    id: UUID
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    is_anonymous: bool = False
    lead_stage: LeadStage
    qualified: bool = False
    source: Optional[Dict[str, Any]] = None
    captured_at: Optional[datetime] = None
    last_activity: Optional[datetime] = None
    synced: bool = False  # phase 1: CRM sync not implemented


class PeopleListResponse(BaseModel):
    items: List[PersonListItem]
    total: int
    page: int
    page_size: int


class PeopleStats(BaseModel):
    total_people: int
    # Engaged-but-unidentified browser sessions — the lead-capture funnel's
    # raw top, shown as a count beside the tabs, not as directory rows.
    anonymous: int = 0
    new_leads_7d: int
    customers: int
    synced_to_crm: int = 0  # phase 1: always 0


class TimelineEntry(BaseModel):
    stage: str
    at: datetime


class PersonConversation(BaseModel):
    session_id: UUID
    agent_name: Optional[str] = None
    status: Optional[str] = None
    last_message: Optional[str] = None
    created_at: Optional[datetime] = None


class PersonDetail(BaseModel):
    id: UUID
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    # True when something can reach/recognize this person (real email, phone,
    # or a qualifying capture). Gates Mark-as-customer and outbound actions.
    identified: bool = False
    is_anonymous: bool = False
    lead_stage: LeadStage
    qualified: bool = False
    source: Optional[Dict[str, Any]] = None
    created_at: Optional[datetime] = None
    lead_qualified_at: Optional[datetime] = None
    meta_data: Optional[Dict[str, Any]] = None
    # AI-written qualification summary from the conversation.
    summary: Optional[str] = None
    # Contact/detail fields captured across submissions.
    captured_attributes: Dict[str, Any] = {}
    timeline: List[TimelineEntry] = []
    conversations: List[PersonConversation] = []


class PersonUpdateRequest(BaseModel):
    """Drawer edit: both fields optional; phone "" clears the number."""
    full_name: Optional[str] = None
    phone: Optional[str] = None
