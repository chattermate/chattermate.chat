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
from app.models.knowledge_to_agent import KnowledgeToAgent
from typing import List, Optional
from uuid import UUID

class KnowledgeToAgentRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_ids(self, knowledge_id: int, agent_id: UUID) -> Optional[KnowledgeToAgent]:
        """Get a link by knowledge_id and agent_id"""
        return self.db.query(KnowledgeToAgent).filter(
            KnowledgeToAgent.knowledge_id == knowledge_id,
            KnowledgeToAgent.agent_id == agent_id
        ).first()

    def get_by_agent(self, agent_id: UUID) -> List[KnowledgeToAgent]:
        """Get all knowledge sources for an agent"""
        return self.db.query(KnowledgeToAgent).filter(
            KnowledgeToAgent.agent_id == agent_id
        ).all()

    def get_by_org(self, org_id: UUID) -> List[KnowledgeToAgent]:
        """Get all knowledge sources for an organization"""
        return self.db.query(KnowledgeToAgent).filter(
            KnowledgeToAgent.organization_id == org_id
        ).all()

    def create(self, knowledge_source: KnowledgeToAgent) -> KnowledgeToAgent:
        """Create a new knowledge source"""
        # Check if link already exists
        existing = self.get_by_ids(
            knowledge_source.knowledge_id,
            knowledge_source.agent_id
        )

        if existing:
            return existing

        self.db.add(knowledge_source)
        self.db.commit()
        self.db.refresh(knowledge_source)
        return knowledge_source

    def delete(self, source_id: int) -> bool:
        """Delete a knowledge source"""
        source = self.db.query(KnowledgeToAgent).filter(
            KnowledgeToAgent.id == source_id
        ).first()
        if source:
            self.db.delete(source)
            self.db.commit()
            return True
        return False

    def delete_by_ids(self, knowledge_id: int, agent_id: UUID) -> bool:
        """Delete a link by knowledge and agent IDs"""
        result = self.db.query(KnowledgeToAgent)\
            .filter(
                KnowledgeToAgent.knowledge_id == knowledge_id,
                KnowledgeToAgent.agent_id == agent_id
        ).delete()
        self.db.commit()
        return bool(result)
