"""
ChatterMate - Agent
Copyright (C) 2024 ChatterMate

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>
"""

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from typing import List
from app.core.logger import get_logger
from app.database import get_db
from app.models.user import User, UserGroup
from app.core.auth import get_current_user, require_permissions
from app.repositories.agent import AgentRepository
from app.repositories.knowledge import KnowledgeRepository
from app.models.schemas.agent import AgentUpdate, AgentResponse, AgentCreate, AgentWithCustomizationResponse
from sqlalchemy.orm import Session
from app.models.agent import Agent, AgentCustomization
from app.models.schemas.agent_customization import CustomizationCreate, CustomizationResponse
import aiofiles
import os
from uuid import uuid4
from PIL import Image
from uuid import UUID
from app.core.s3 import upload_file_to_s3
from app.core.config import settings

router = APIRouter()
logger = get_logger(__name__)

UPLOAD_DIR = "uploads/agents"

ALLOWED_MIME_TYPES = {'image/jpeg', 'image/png', 'image/webp'}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB


async def save_file(file: UploadFile, organization_id: UUID) -> str:
    """Save uploaded file and return the file path"""
    # Validate file size
    file.file.seek(0, 2)  # Seek to end
    size = file.file.tell()
    file.file.seek(0)  # Reset file position

    if size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File size exceeds maximum limit of {
                MAX_FILE_SIZE // 1024 // 1024}MB"
        )

    # Validate image type
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Only JPEG, PNG and WebP images are allowed"
        )

    try:
        # Verify it's a valid image
        img = Image.open(file.file)
        img.verify()
        file.file.seek(0)
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid image file"
        )

    file_ext = os.path.splitext(file.filename)[1].lower()
    file_name = f"{uuid4()}{file_ext}"
    
    if settings.S3_FILE_STORAGE:
        folder = f"agents/{organization_id}"
        return await upload_file_to_s3(file, folder, file_name, content_type=file.content_type)
    else:
        # Local storage
        upload_dir = f"uploads/agents/{organization_id}"
        if not os.path.exists(upload_dir):
            os.makedirs(upload_dir)

        file_path = os.path.join(upload_dir, file_name)
        async with aiofiles.open(file_path, 'wb') as f:
            content = await file.read()
            await f.write(content)

        return f"/{file_path}"


@router.put("/{agent_id}", response_model=AgentWithCustomizationResponse)
async def update_agent(
    agent_id: UUID,
    update_data: AgentUpdate,
    current_user: User = Depends(require_permissions("manage_agents")),
    db: Session = Depends(get_db)
):
    """Update agent details"""
    try:
        agent_repo = AgentRepository(db)
        knowledge_repo = KnowledgeRepository(db)

        # Get existing agent
        agent = agent_repo.get_by_id(agent_id)
        if not agent:
            raise HTTPException(status_code=404, detail="Agent not found")

        # Verify organization access
        if agent.organization_id != current_user.organization_id:
            raise HTTPException(
                status_code=403,
                detail="Not authorized to update this agent"
            )

        # Update agent with provided fields, excluding photo_url
        update_dict = update_data.model_dump(
            exclude={'photo_url'}, exclude_unset=True)
        agent = agent_repo.update_agent(agent_id, **update_dict)
        # Get knowledge sources for response
        knowledge_items = knowledge_repo.get_by_agent(agent.id)

        # Prepare response
        response = AgentWithCustomizationResponse(
            id=agent.id,
            name=agent.name,
            display_name=agent.display_name,
            description=agent.description,
            agent_type=agent.agent_type,
            instructions=agent.instructions,
            is_active=agent.is_active,
            organization_id=agent.organization_id,
            customization=agent.customization,
            transfer_to_human=agent.transfer_to_human,
            knowledge=[{
                "id": k.id,
                "name": k.source,
                "type": k.source_type
            } for k in knowledge_items],
            groups=agent.groups
        )

        return response

    except HTTPException as e:
        # Re-raise HTTP exceptions
        raise e
    except Exception as e:
        logger.error(f"Agent update error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/list", response_model=List[AgentWithCustomizationResponse])
async def get_organization_agents(
    current_user: User = Depends(require_permissions("view_all", "manage_agents")),
    db: Session = Depends(get_db)
):
    """Get all agents for the current user's organization"""
    try:
        agent_repo = AgentRepository(db)
        knowledge_repo = KnowledgeRepository(db)
        agents = agent_repo.get_all_agents(current_user.organization_id)

        response = []
        for agent in agents:
            knowledge_items = knowledge_repo.get_by_agent(agent.id)
            agent_data = AgentWithCustomizationResponse(
                id=agent.id,
                name=agent.name,
                display_name=agent.display_name,
                description=agent.description,
                agent_type=agent.agent_type,
                instructions=agent.instructions,
                is_active=agent.is_active,
                organization_id=agent.organization_id,
                transfer_to_human=agent.transfer_to_human or False,
                knowledge=[{
                    "id": k.id,
                    "name": k.source,
                    "type": k.source_type
                } for k in knowledge_items],
                customization=agent.customization,
                groups=agent.groups
            )
            response.append(agent_data)

        return response

    except Exception as e:
        logger.error(f"Error getting agents: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{agent_id}/customization", response_model=CustomizationResponse)
async def create_agent_customization(
    agent_id: UUID,
    customization_data: CustomizationCreate,
    current_user: User = Depends(require_permissions("manage_agents")),
    db: Session = Depends(get_db)
):
    """Create or update agent customization"""
    try:
        # Get agent
        agent = db.query(Agent).filter(Agent.id == agent_id).first()
        if not agent:
            raise HTTPException(status_code=404, detail="Agent not found")

        # Verify organization access
        if agent.organization_id != current_user.organization_id:
            raise HTTPException(
                status_code=403,
                detail="Not authorized to update this agent"
            )

        # Get existing customization or create new one
        db_customization = db.query(AgentCustomization).filter(
            AgentCustomization.agent_id == agent_id
        ).first()

        if db_customization:
            for key, value in customization_data.model_dump(exclude_unset=True).items():
                setattr(db_customization, key, value)
        else:
            db_customization = AgentCustomization(
                agent_id=agent_id,
                **customization_data.model_dump(exclude_unset=True)
            )
            db.add(db_customization)

        db.commit()
        db.refresh(db_customization)

        return db_customization

    except HTTPException as e:
        # Re-raise HTTP exceptions
        raise e
    except Exception as e:
        logger.error(f"Error creating agent customization: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{agent_id}/customization/photo", response_model=CustomizationResponse)
async def upload_agent_photo(
    agent_id: str,
    photo: UploadFile = File(...),
    current_user: User = Depends(require_permissions("manage_agents")),
    db: Session = Depends(get_db)
):
    """Upload agent profile photo"""
    try:
        agent = db.query(Agent).filter(Agent.id == agent_id).first()
        if not agent:
            raise HTTPException(status_code=404, detail="Agent not found")

        # Verify organization access
        if agent.organization_id != current_user.organization_id:
            raise HTTPException(status_code=403, detail="Not authorized")

        # Get existing customization to check for old photo
        db_customization = db.query(AgentCustomization).filter(
            AgentCustomization.agent_id == agent_id
        ).first()

        # Delete old photo if it exists
        if db_customization and db_customization.photo_url:
            if settings.S3_FILE_STORAGE:
                from app.core.s3 import delete_file_from_s3
                await delete_file_from_s3(db_customization.photo_url)
            else:
                old_photo_path = db_customization.photo_url.lstrip('/')
                if os.path.exists(old_photo_path):
                    os.remove(old_photo_path)

        # Save new photo file
        photo_url = await save_file(photo, current_user.organization_id)

        # Update or create customization
        if db_customization:
            db_customization.photo_url = photo_url
        else:
            db_customization = AgentCustomization(
                agent_id=agent_id,
                photo_url=photo_url
            )
            db.add(db_customization)

        db.commit()
        db.refresh(db_customization)
        return db_customization

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error uploading agent photo: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to upload photo"
        )


@router.put("/{agent_id}/groups", response_model=AgentWithCustomizationResponse)
async def update_agent_groups(
    agent_id: UUID,
    group_ids: List[UUID],
    current_user: User = Depends(require_permissions("manage_agents")),
    db: Session = Depends(get_db)
):
    """Update agent's assigned groups"""
    try:
        # Get agent
        agent = db.query(Agent).filter(Agent.id == agent_id).first()
        if not agent or agent.organization_id != current_user.organization_id:
            raise HTTPException(status_code=404, detail="Agent not found")

        # Verify all groups exist and belong to same organization
        groups = db.query(UserGroup).filter(
            UserGroup.id.in_(group_ids),
            UserGroup.organization_id == current_user.organization_id
        ).all()

        if len(groups) != len(group_ids):
            raise HTTPException(status_code=400, detail="Invalid group IDs provided")

        # Update agent's groups
        agent.groups = groups
        db.commit()
        db.refresh(agent)

        # Prepare response
        knowledge_repo = KnowledgeRepository(db)
        knowledge_items = knowledge_repo.get_by_agent(agent.id)
        
        return AgentWithCustomizationResponse(
            id=agent.id,
            name=agent.name,
            display_name=agent.display_name,
            description=agent.description,
            agent_type=agent.agent_type,
            instructions=agent.instructions,
            is_active=agent.is_active,
            organization_id=agent.organization_id,
            customization=agent.customization,
            transfer_to_human=agent.transfer_to_human,
            groups=agent.groups,
            knowledge=[{
                "id": k.id,
                "name": k.source,
                "type": k.source_type
            } for k in knowledge_items]
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating agent groups: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update agent groups"
        )


@router.get("/{agent_id}", response_model=AgentWithCustomizationResponse)
async def get_agent_by_id(
    agent_id: UUID,
    current_user: User = Depends(require_permissions("view_all", "manage_agents")),
    db: Session = Depends(get_db)
):
    """Get agent by ID"""
    try:
        # Get agent
        agent = db.query(Agent).filter(Agent.id == agent_id).first()
        if not agent or agent.organization_id != current_user.organization_id:
            raise HTTPException(status_code=404, detail="Agent not found")

        # Return agent
        return agent

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting agent by id: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get agent by id"
        )
