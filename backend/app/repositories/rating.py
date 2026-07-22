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
from app.models.rating import Rating
from typing import Optional, List
from uuid import UUID
from sqlalchemy import func


class RatingRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_rating(self, session_id: UUID, customer_id: UUID, user_id: UUID, agent_id: UUID, 
                     organization_id: UUID, rating: int, feedback: Optional[str] = None) -> Rating:
        """Create a new rating"""
        db_rating = Rating(
            session_id=session_id,
            customer_id=customer_id,
            user_id=user_id,
            agent_id=agent_id,
            organization_id=organization_id,
            rating=rating,
            feedback=feedback
        )
        self.db.add(db_rating)
        self.db.commit()
        self.db.refresh(db_rating)
        return db_rating

    def upsert_rating(self, session_id: UUID, customer_id: UUID, user_id: UUID, agent_id: UUID,
                      organization_id: UUID, rating: int, feedback: Optional[str] = None) -> Rating:
        """Record the customer's rating for a session, replacing any earlier one.

        One row per session: the widget can re-show the rating prompt, and
        without this a customer could pile up rows that skew agent/org averages
        and, since the score now flows onto the ticket, spam its activity feed.
        """
        existing = self.get_rating_by_session(session_id)
        if existing is None:
            return self.create_rating(
                session_id=session_id, customer_id=customer_id, user_id=user_id,
                agent_id=agent_id, organization_id=organization_id,
                rating=rating, feedback=feedback,
            )
        existing.rating = rating
        existing.feedback = feedback
        self.db.commit()
        self.db.refresh(existing)
        return existing

    def get_rating_by_session(self, session_id: UUID) -> Optional[Rating]:
        """Get rating by session ID"""
        return self.db.query(Rating).filter(Rating.session_id == session_id).first()

    def get_ratings_by_agent(self, agent_id: UUID) -> List[Rating]:
        """Get all ratings for an agent"""
        return self.db.query(Rating).filter(Rating.agent_id == agent_id).all()

    def get_ratings_by_customer(self, customer_id: UUID) -> List[Rating]:
        """Get all ratings from a customer"""
        return self.db.query(Rating).filter(Rating.customer_id == customer_id).all()

    def get_average_rating_by_agent(self, agent_id: UUID) -> float:
        """Get average rating for an agent"""
        result = self.db.query(func.avg(Rating.rating)).filter(
            Rating.agent_id == agent_id
        ).scalar()
        return float(result) if result else 0.0

    def get_organization_ratings(self, organization_id: UUID, 
                               limit: int = 100, offset: int = 0) -> List[Rating]:
        """Get all ratings for an organization with pagination"""
        return self.db.query(Rating).filter(
            Rating.organization_id == organization_id
        ).order_by(Rating.created_at.desc()).offset(offset).limit(limit).all()

    def get_organization_average_rating(self, organization_id: UUID) -> float:
        """Get average rating for an organization"""
        result = self.db.query(func.avg(Rating.rating)).filter(
            Rating.organization_id == organization_id
        ).scalar()
        return float(result) if result else 0.0 