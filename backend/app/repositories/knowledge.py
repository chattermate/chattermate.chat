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
from app.models.knowledge import Knowledge
from typing import List, Optional
from sqlalchemy import func
from sqlalchemy.sql import text
import logging
from uuid import UUID
from app.models.knowledge_to_agent import KnowledgeToAgent

logger = logging.getLogger(__name__)


class KnowledgeRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, knowledge_id: int) -> Optional[Knowledge]:
        """Get knowledge source by ID"""
        return self.db.query(Knowledge)\
            .filter(Knowledge.id == knowledge_id)\
            .first()

    def get_by_agent(self, agent_id: UUID, skip: int = 0, limit: int = 100):
        """Get paginated knowledge items for an agent"""
        
        query = (self.db.query(Knowledge)
                .join(KnowledgeToAgent)
                .filter(
                    KnowledgeToAgent.knowledge_id == Knowledge.id,
                    KnowledgeToAgent.agent_id == agent_id
                )
                .order_by(Knowledge.id)
                .offset(skip)
                .limit(limit))
        
        result = query.all()

        return result

    def count_by_agent(self, agent_id: UUID) -> int:
        """Get total count of knowledge items for an agent"""
        
        query = (self.db.query(func.count(Knowledge.id))
                .join(KnowledgeToAgent)
                .filter(
                    KnowledgeToAgent.knowledge_id == Knowledge.id,
                    KnowledgeToAgent.agent_id == agent_id
                ))
        
        result = query.scalar() or 0
        return result

    def get_by_org(self, org_id: UUID) -> List[Knowledge]:
        """Get all knowledge sources for an organization"""
        return self.db.query(Knowledge)\
            .filter(Knowledge.organization_id == org_id)\
            .all()

    def create(self, knowledge: Knowledge) -> Knowledge:
        """Create a new knowledge source or get existing"""
        existing = self.db.query(Knowledge)\
            .filter(
                Knowledge.organization_id == knowledge.organization_id,
                Knowledge.source == knowledge.source
        ).first()

        if existing:
            return existing

        self.db.add(knowledge)
        self.db.commit()
        self.db.refresh(knowledge)
        return knowledge

    def delete(self, knowledge_id: int) -> bool:
        """Delete a knowledge source"""
        knowledge = self.db.query(Knowledge)\
            .filter(Knowledge.id == knowledge_id)\
            .first()
        if knowledge:
            self.db.delete(knowledge)
            self.db.commit()
            return True
        return False

    def count_by_organization(self, org_id: UUID) -> int:
        """Get total count of knowledge items for an organization"""
        
        query = (self.db.query(func.count(Knowledge.id))
                .filter(Knowledge.organization_id == org_id))
        
        result = query.scalar() or 0
        return result

    def get_by_organization(
        self,
        org_id: UUID,
        skip: int = 0,
        limit: int = 10
    ) -> List[Knowledge]:
        """Get paginated knowledge items for an organization"""
        
        query = (self.db.query(Knowledge)
                .filter(Knowledge.organization_id == org_id)
                .order_by(Knowledge.id)
                .offset(skip)
                .limit(limit))
        
        result = query.all()
        return result

    def get_by_sources(self, organization_id: UUID, sources: List[str]):
        """Get knowledge items by source URLs for an organization"""
        return self.db.query(Knowledge)\
            .filter(
                Knowledge.organization_id == organization_id,
                Knowledge.source.in_(sources)
            ).all()

    def delete_with_data(self, knowledge_id: int) -> bool:
        """Delete knowledge source and its associated data"""
        try:
            knowledge = self.get_by_id(knowledge_id)
            if not knowledge:
                return False

            # Delete from knowledge_to_agent table first
            self.db.execute(
                text("DELETE FROM knowledge_to_agents WHERE knowledge_id = :kid"),
                {"kid": knowledge_id}
            )

            # If table_name and schema exist, delete the actual data
            if knowledge.table_name and knowledge.schema:
                try:
                    # Delete data from the specific table
                    self.db.execute(
                        text(f'DELETE FROM {knowledge.schema}."{ knowledge.table_name}" WHERE name = :source'),
                        {"source": knowledge.source}
                    )
                except Exception as e:
                    logger.error(f"Error deleting data from {
                                 knowledge.table_name}: {str(e)}")
                    # Continue with knowledge deletion even if data deletion fails

            # Delete the knowledge entry
            self.db.delete(knowledge)
            self.db.commit()
            return True

        except Exception as e:
            self.db.rollback()
            logger.error(f"Error in delete_with_data: {str(e)}")
            raise
