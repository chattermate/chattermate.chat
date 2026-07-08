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

from pydantic import BaseModel, ConfigDict, Field, field_validator
from typing import Optional, List, Dict, Any
from uuid import UUID

# Reuse the ORM enums so the API contract can never drift from the DB.
from app.models.lead_capture import LeadAssignmentMode, CrmSyncTarget

# Guardrails to keep the config small.
MAX_FIELDS = 30


class LeadField(BaseModel):
    """A detail to collect. Standard fields (email/name/company/phone) carry
    standard=True; custom fields add a label and optional allowed values — which
    the agent uses to steer/normalise the answer in conversation (no form)."""
    key: str
    standard: bool = False
    enabled: bool = True
    required: bool = False
    label: Optional[str] = Field(default=None, max_length=100)
    options: Optional[List[str]] = None


class LeadCaptureConfigBase(BaseModel):
    enabled: bool = False
    # GDPR: require the visitor's explicit consent before recording a lead.
    require_consent: bool = True
    # Optional free-text steering, appended to the agent's prompt.
    guidance: Optional[str] = Field(default=None, max_length=2000)
    fields: List[LeadField] = Field(default_factory=list, max_length=MAX_FIELDS)
    # Routing config — persisted only; no CRM/Slack/assignment side effects in phase 1.
    assignment_mode: LeadAssignmentMode = LeadAssignmentMode.NONE
    assignment_target_user_id: Optional[UUID] = None
    crm_sync_target: CrmSyncTarget = CrmSyncTarget.NONE
    slack_notify_enabled: bool = False


class LeadCaptureConfigUpdate(LeadCaptureConfigBase):
    """Full-replace payload for the whole Lead Capture tab (mirrors how the
    customization tab saves its entire object in one call)."""
    pass


class LeadCaptureConfigResponse(LeadCaptureConfigBase):
    model_config = ConfigDict(from_attributes=True)

    agent_id: UUID

    @field_validator("fields", mode="before")
    @classmethod
    def _coerce_null_json(cls, v):
        # JSON column defaults to NULL in the DB; present it as an empty list.
        return v or []
