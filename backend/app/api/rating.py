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

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.core.auth import get_current_user, require_permissions
from app.repositories.rating import RatingRepository
from app.repositories.session_to_agent import SessionToAgentRepository
from app.models.user import User
from typing import List, Optional
from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime

router = APIRouter()

class RatingCreate(BaseModel):
    session_id: UUID
    rating: int = Field(..., ge=1, le=5)
    feedback: Optional[str] = None

    class Config:
        from_attributes = True

class RatingResponse(BaseModel):
    id: UUID
    session_id: UUID
    customer_id: Optional[UUID]
    agent_id: Optional[UUID]
    organization_id: UUID
    rating: int
    feedback: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

@router.post("", response_model=RatingResponse)
async def create_rating(
    rating_data: RatingCreate,
    db: Session = Depends(get_db)
):
    """Create a new rating for a chat session"""
    try:
        # Get session details
        session_repo = SessionToAgentRepository(db)
        session = session_repo.get_session(rating_data.session_id)
        
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
            
        # Check if rating already exists
        rating_repo = RatingRepository(db)
        existing_rating = rating_repo.get_rating_by_session(rating_data.session_id)
        if existing_rating:
            raise HTTPException(
                status_code=400,
                detail="Rating already exists for this session"
            )

        # Create rating
        rating = rating_repo.create_rating(
            session_id=rating_data.session_id,
            customer_id=session.customer_id,
            user_id=session.user_id,
            agent_id=session.agent_id,
            organization_id=session.organization_id,
            rating=rating_data.rating,
            feedback=rating_data.feedback
        )

        return rating

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/agent/{agent_id}", response_model=List[RatingResponse])
async def get_agent_ratings(
    agent_id: UUID,
    current_user: User = Depends(require_permissions("view_all", "manage_agents")),
    db: Session = Depends(get_db)
):
    """Get all ratings for an agent"""
    try:
        rating_repo = RatingRepository(db)
        ratings = rating_repo.get_ratings_by_agent(agent_id)
        return ratings
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/agent/{agent_id}/average")
async def get_agent_average_rating(
    agent_id: UUID,
    current_user: User = Depends(require_permissions("view_all", "manage_agents")),
    db: Session = Depends(get_db)
):
    """Get average rating for an agent"""
    try:
        rating_repo = RatingRepository(db)
        average = rating_repo.get_average_rating_by_agent(agent_id)
        return {"average_rating": average}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/organization", response_model=List[RatingResponse])
async def get_organization_ratings(
    limit: int = 100,
    offset: int = 0,
    current_user: User = Depends(require_permissions("view_all", "manage_agents")),
    db: Session = Depends(get_db)
):
    """Get all ratings for the organization with pagination"""
    try:
        rating_repo = RatingRepository(db)
        ratings = rating_repo.get_organization_ratings(
            current_user.organization_id,
            limit=limit,
            offset=offset
        )
        return ratings
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/organization/average")
async def get_organization_average_rating(
    current_user: User = Depends(require_permissions("view_all", "manage_agents")),
    db: Session = Depends(get_db)
):
    """Get average rating for the organization"""
    try:
        rating_repo = RatingRepository(db)
        average = rating_repo.get_organization_average_rating(current_user.organization_id)
        return {"average_rating": average}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 