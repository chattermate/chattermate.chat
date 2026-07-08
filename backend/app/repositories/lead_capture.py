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

from sqlalchemy.orm import Session
from typing import Optional
from uuid import UUID

from app.models.lead_capture import LeadCaptureConfig
from app.models.schemas.lead_capture import LeadCaptureConfigUpdate


class LeadCaptureConfigRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_agent(self, agent_id: UUID) -> Optional[LeadCaptureConfig]:
        return (
            self.db.query(LeadCaptureConfig)
            .filter(LeadCaptureConfig.agent_id == agent_id)
            .first()
        )

    def get_or_create(self, agent_id: UUID) -> LeadCaptureConfig:
        """Return the agent's config, lazily creating a default (disabled) row —
        mirrors how AgentCustomization is fetched-or-created."""
        config = self.get_by_agent(agent_id)
        if config is None:
            config = LeadCaptureConfig(agent_id=agent_id, enabled=False)
            self.db.add(config)
            self.db.commit()
            self.db.refresh(config)
        return config

    def update(self, agent_id: UUID, data: LeadCaptureConfigUpdate) -> LeadCaptureConfig:
        """Full-replace the config from a validated payload."""
        config = self.get_or_create(agent_id)
        config.enabled = data.enabled
        config.require_consent = data.require_consent
        config.guidance = data.guidance
        config.fields = [f.model_dump() for f in data.fields]
        config.assignment_mode = data.assignment_mode
        config.assignment_target_user_id = data.assignment_target_user_id
        config.crm_sync_target = data.crm_sync_target
        config.slack_notify_enabled = data.slack_notify_enabled
        self.db.commit()
        self.db.refresh(config)
        return config
