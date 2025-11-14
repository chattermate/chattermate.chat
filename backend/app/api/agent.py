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

import os
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Request
from typing import List, Union
from app.core.logger import get_logger
from app.database import get_db
from app.models.user import User, UserGroup
from app.core.auth import get_current_user, require_permissions, get_unified_auth, get_auth_info_from_request
from app.services.shopify_session import require_shopify_or_jwt_auth
from app.repositories.agent import AgentRepository
from app.repositories.knowledge import KnowledgeRepository
from app.models.schemas.agent import AgentUpdate, AgentResponse, AgentCreate, AgentWithCustomizationResponse
from sqlalchemy.orm import Session
from app.models.agent import Agent, AgentCustomization
from app.models.schemas.agent_customization import CustomizationCreate, CustomizationResponse
import aiofiles
from uuid import uuid4
from PIL import Image
from uuid import UUID
from app.core.s3 import upload_file_to_s3, get_s3_signed_url
from app.core.config import settings
from pydantic import BaseModel
from agno.agent import Agent as AgnoAgent
from agno.models.openai import OpenAIChat
from app.utils.agno_utils import create_model
from app.utils.rate_limit import limit_instruction_generation

router = APIRouter()
logger = get_logger(__name__)

UPLOAD_DIR = "uploads/agents"

ALLOWED_MIME_TYPES = {'image/jpeg', 'image/png', 'image/webp'}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

# Model for instruction generation request
class InstructionPrompt(BaseModel):
    prompt: str
    existing_instructions: List[str] = []  # Optional list of existing instructions

# Model for setting active workflow
class SetActiveWorkflowRequest(BaseModel):
    workflow_id: UUID
    use_workflow: bool = True


# Helper functions for agent access control


def verify_agent_access(agent: Agent, auth_info: dict) -> None:
    """Verify that the authenticated user/session has access to the agent"""
    # Compare UUIDs directly (auth_info["organization_id"] is now a UUID, not a string)
    if agent.organization_id != auth_info["organization_id"]:
        # Return 404 instead of 403 for security - don't reveal resource existence
        raise HTTPException(
            status_code=404,
            detail="Agent not found"
        )


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
        file.file.seek(0)
        content = await file.read()
        return await upload_file_to_s3(content, folder, file_name, content_type=file.content_type)
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


@router.post("", response_model=AgentWithCustomizationResponse, status_code=status.HTTP_201_CREATED)
async def create_agent(
    agent_data: AgentCreate,
    current_user: User = Depends(require_permissions("manage_agents")),
    db: Session = Depends(get_db)
):
    """Create a new agent"""
    try:
        agent_repo = AgentRepository(db)
        
        # Check enterprise subscription limits if enterprise module is available
        try:
            from app.enterprise.repositories.subscription import SubscriptionRepository
            HAS_ENTERPRISE = True
        except ImportError:
            HAS_ENTERPRISE = False

        if HAS_ENTERPRISE:
            subscription_repo = SubscriptionRepository(db)

            # Get current subscription
            subscription = subscription_repo.get_by_organization(str(current_user.organization_id))
            if not subscription:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="No active subscription found"
                )

            # Check subscription status
            if not subscription.is_active() and not subscription.is_trial():
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Subscription is not active"
                )

            # Get current agents count
            current_agents_count = agent_repo.count_by_organization(current_user.organization_id)

            # Check if adding this agent would exceed the limit
            if subscription.plan.max_agents is not None and (current_agents_count + 1) > subscription.plan.max_agents:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Cannot create agent: Maximum number of agents ({subscription.plan.max_agents}) exceeded for current plan , please upgrade your plan"
                )

        
        # Check if agent with the same name already exists in the organization
        existing_agent = agent_repo.get_by_name(agent_data.name, current_user.organization_id)
        if existing_agent:
            raise HTTPException(
                status_code=400,
                detail=f"Agent with name '{agent_data.name}' already exists"
            )
        
        # Create agent with organization ID from current user
        agent_dict = agent_data.model_dump()
        
        # Override organization_id with the current user's organization
        agent_dict["organization_id"] = current_user.organization_id
        
        # Set display_name to name if not provided
        if "display_name" not in agent_dict or not agent_dict.get("display_name"):
            agent_dict["display_name"] = agent_dict["name"]
        
        # Check rating feature availability and override ask_for_rating if necessary
        if HAS_ENTERPRISE:
            from app.enterprise.repositories.plan import PlanRepository
            plan_repo = PlanRepository(db)
            if not plan_repo.check_feature_availability(str(subscription.plan_id), 'rating'):
                agent_dict["ask_for_rating"] = False
        
        # Create the agent
        agent = agent_repo.create_agent(**agent_dict)
        
        # Prepare response with empty knowledge list
        response = AgentWithCustomizationResponse(
            id=agent.id,
            name=agent.name,
            display_name=agent.display_name,
            description=agent.description,
            agent_type=agent.agent_type,
            instructions=agent.instructions,
            is_active=agent.is_active,
            organization_id=agent.organization_id,
            customization=None,
            transfer_to_human=agent.transfer_to_human or False,
            ask_for_rating=agent.ask_for_rating or False,
            enable_rate_limiting=agent.enable_rate_limiting or False,
            overall_limit_per_ip=agent.overall_limit_per_ip or 100,
            requests_per_sec=agent.requests_per_sec or 1.0,
            use_workflow=agent.use_workflow or False,
            active_workflow_id=agent.active_workflow_id,
            allow_attachments=agent.allow_attachments or False,
            knowledge=[],
            groups=[]
        )
        
        return response
        
    except HTTPException as e:
        # Re-raise HTTP exceptions
        raise e
    except Exception as e:
        logger.error(f"Error creating agent: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{agent_id}/shopify", response_model=AgentWithCustomizationResponse)
@router.put("/{agent_id}", response_model=AgentWithCustomizationResponse)
async def update_agent(
    agent_id: UUID,
    update_data: AgentUpdate,
    auth_info: dict = Depends(get_unified_auth),
    db: Session = Depends(get_db)
):
    """Update agent details - supports both JWT and Shopify session token auth"""
    try:
        
        agent_repo = AgentRepository(db)
        knowledge_repo = KnowledgeRepository(db)

        # Get existing agent
        agent = agent_repo.get_by_id(agent_id)
        if not agent:
            raise HTTPException(status_code=404, detail="Agent not found")

        # Verify organization access
        verify_agent_access(agent, auth_info)
        logger.info(f"Updating agent {agent_id} with data: {update_data}")
        
        # Check enterprise subscription limits if enterprise module is available
        try:
            from app.enterprise.repositories.subscription import SubscriptionRepository
            HAS_ENTERPRISE = True
        except ImportError:
            HAS_ENTERPRISE = False

        # Update agent with provided fields, excluding photo_url
        update_dict = update_data.model_dump(
            exclude={'photo_url'}, exclude_unset=True)
        
        # Check rating feature availability and override ask_for_rating if necessary
        if HAS_ENTERPRISE and auth_info['auth_type'] == 'jwt':
            from app.enterprise.repositories.plan import PlanRepository
            subscription_repo = SubscriptionRepository(db)
            subscription = subscription_repo.get_by_organization(auth_info["organization_id"])
            
            if subscription:
                plan_repo = PlanRepository(db)
                if not plan_repo.check_feature_availability(str(subscription.plan_id), 'rating'):
                    # If rating feature is not available, force ask_for_rating to False
                    update_dict["ask_for_rating"] = False
        
        agent = agent_repo.update_agent(agent_id, **update_dict)
        # Get knowledge sources for response
        knowledge_items = knowledge_repo.get_by_agent(agent.id)

        # Get signed URL for photo if using S3
        customization = agent.customization
        if settings.S3_FILE_STORAGE and customization and customization.photo_url:
            try:
                customization.photo_url = await get_s3_signed_url(customization.photo_url)
            except Exception as e:
                logger.error(f"Error getting signed URL for agent photo: {str(e)}")
                # Don't fail the request if we can't get the signed URL
                pass

        # Prepare response
        response = AgentWithCustomizationResponse(
            id=agent.id,
            name=agent.name,
            display_name=agent.display_name,
            description=agent.description,
            agent_type=agent.agent_type,
            instructions=agent.instructions,
            is_active=agent.is_active,
            use_workflow=agent.use_workflow,
            active_workflow_id=agent.active_workflow_id,
            organization_id=agent.organization_id,
            customization=customization,
            transfer_to_human=agent.transfer_to_human,
            ask_for_rating=agent.ask_for_rating,
            enable_rate_limiting=agent.enable_rate_limiting,
            overall_limit_per_ip=agent.overall_limit_per_ip,
            requests_per_sec=agent.requests_per_sec,
            allow_attachments=agent.allow_attachments,
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


@router.get("/list/shopify", response_model=List[AgentWithCustomizationResponse])
@router.get("/list", response_model=List[AgentWithCustomizationResponse])
async def get_organization_agents(
    auth_info: dict = Depends(get_unified_auth),
    db: Session = Depends(get_db)
):
    """Get organization agents - supports both JWT and Shopify session token auth"""
    try:
        
        agent_repo = AgentRepository(db)
        knowledge_repo = KnowledgeRepository(db)
        agents = agent_repo.get_all_agents(auth_info["organization_id"])

        response = []
        for agent in agents:
            knowledge_items = knowledge_repo.get_by_agent(agent.id)
            
            # Create a copy of the customization to modify the photo_url
            customization = agent.customization
            if settings.S3_FILE_STORAGE and customization and customization.photo_url:
                # Get signed URL for the photo
                customization.photo_url = await get_s3_signed_url(customization.photo_url)
            
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
                ask_for_rating=agent.ask_for_rating or False,
                enable_rate_limiting=agent.enable_rate_limiting or False,
                overall_limit_per_ip=agent.overall_limit_per_ip or 100,
                requests_per_sec=agent.requests_per_sec or 1.0,
                use_workflow=agent.use_workflow or False,
                active_workflow_id=agent.active_workflow_id,
                created_at=agent.created_at,
                updated_at=agent.updated_at,
                allow_attachments=agent.allow_attachments or False,
                knowledge=[{
                    "id": k.id,
                    "name": k.source,
                    "type": k.source_type
                } for k in knowledge_items],
                customization=customization,
                groups=agent.groups
            )
            response.append(agent_data)

        return response

    except Exception as e:
        logger.error(f"Error getting agents: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{agent_id}/customization/shopify", response_model=CustomizationResponse)
@router.post("/{agent_id}/customization", response_model=CustomizationResponse)
async def create_agent_customization(
    agent_id: UUID,
    customization_data: CustomizationCreate,
    auth_info: dict = Depends(get_unified_auth),
    db: Session = Depends(get_db)
):
    """Create or update agent customization - supports both JWT and Shopify session token auth"""
    try:
        
        # Get agent
        agent = db.query(Agent).filter(Agent.id == agent_id).first()
        if not agent:
            raise HTTPException(status_code=404, detail="Agent not found")

        # Verify organization access
        verify_agent_access(agent, auth_info)

        # Get existing customization or create new one
        db_customization = db.query(AgentCustomization).filter(
            AgentCustomization.agent_id == agent_id
        ).first()

        if db_customization:
            # Update existing customization
            for field, value in customization_data.model_dump(exclude_unset=True).items():
                if field != 'id':  # Don't update the ID
                    setattr(db_customization, field, value)
        else:
            # Create new customization
            db_customization = AgentCustomization(
                agent_id=agent_id,
                **customization_data.model_dump(exclude={'id'})
            )
            db.add(db_customization)

        db.commit()
        db.refresh(db_customization)

        # Generate signed URL if using S3 storage
        if settings.S3_FILE_STORAGE and db_customization.photo_url:
            db_customization.photo_url = await get_s3_signed_url(db_customization.photo_url)

        return db_customization

    except HTTPException as e:
        # Re-raise HTTP exceptions
        raise e
    except Exception as e:
        logger.error(f"Error creating agent customization: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{agent_id}/customization/photo/shopify", response_model=CustomizationResponse)
@router.post("/{agent_id}/customization/photo", response_model=CustomizationResponse)
async def upload_agent_photo(
    agent_id: str,
    photo: UploadFile = File(...),
    auth_info: dict = Depends(get_unified_auth),
    db: Session = Depends(get_db)
):
    """Upload agent profile photo - supports both JWT and Shopify session token auth"""
    try:
        
        agent = db.query(Agent).filter(Agent.id == agent_id).first()
        if not agent:
            raise HTTPException(status_code=404, detail="Agent not found")

        # Verify organization access
        verify_agent_access(agent, auth_info)

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
        photo_url = await save_file(photo, auth_info["organization_id"])

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

        # Generate signed URL if using S3 storage
        if settings.S3_FILE_STORAGE and db_customization.photo_url:
            db_customization.photo_url = await get_s3_signed_url(db_customization.photo_url)

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
        customization = agent.customization
        if settings.S3_FILE_STORAGE and customization and customization.photo_url:
            customization.photo_url = await get_s3_signed_url(customization.photo_url)
        return AgentWithCustomizationResponse(
            id=agent.id,
            name=agent.name,
            display_name=agent.display_name,
            description=agent.description,
            agent_type=agent.agent_type,
            instructions=agent.instructions,
            is_active=agent.is_active,
            use_workflow=agent.use_workflow,
            active_workflow_id=agent.active_workflow_id,
            organization_id=agent.organization_id,
            customization=customization,
            transfer_to_human=agent.transfer_to_human,
            ask_for_rating=agent.ask_for_rating,
            enable_rate_limiting=agent.enable_rate_limiting,
            overall_limit_per_ip=agent.overall_limit_per_ip,
            requests_per_sec=agent.requests_per_sec,
            allow_attachments=agent.allow_attachments,
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


@router.get("/{agent_id}/shopify", response_model=AgentWithCustomizationResponse)
@router.get("/{agent_id}", response_model=AgentWithCustomizationResponse)
async def get_agent_by_id(
    agent_id: UUID,
    auth_info: dict = Depends(get_unified_auth),
    db: Session = Depends(get_db)
):
    """Get agent by ID with customization - supports both JWT and Shopify session token auth"""
    
    agent_repo = AgentRepository(db)
    agent = agent_repo.get_by_id(agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    # Check if agent belongs to the authenticated organization
    verify_agent_access(agent, auth_info)
    
    # Get signed URL for photo if using S3
    if settings.S3_FILE_STORAGE and agent.customization and agent.customization.photo_url:
        try:
            agent.customization.photo_url = await get_s3_signed_url(agent.customization.photo_url)
        except Exception as e:
            logger.error(f"Error getting signed URL for agent photo: {str(e)}")
            # Don't fail the request if we can't get the signed URL
            pass
    
    return agent












@router.post("/generate-instructions", response_model=List[str])
@limit_instruction_generation
async def generate_instructions(
    request: Request,
    prompt_data: InstructionPrompt,
    current_user: User = Depends(require_permissions("manage_agents")),
    db: Session = Depends(get_db)
):
    """Generate agent instructions using AI"""
    try:
        # Get prompt and existing instructions from request
        prompt = prompt_data.prompt.strip()
        existing_instructions = prompt_data.existing_instructions
        
        # Validate prompt
        if not prompt:
            raise HTTPException(
                status_code=400,
                detail="Prompt cannot be empty"
            )
        
        if len(prompt) > 1000:
            raise HTTPException(
                status_code=400,
                detail="Prompt exceeds maximum length of 1000 characters"
            )
        
        # Check if enterprise module is available
        try:
            from app.enterprise.repositories.subscription import SubscriptionRepository
            HAS_ENTERPRISE = True
        except ImportError:
            HAS_ENTERPRISE = False
        
        # Get API key and model - first check for ChatterMate config if enterprise is available
        api_key = ""
        model_name = ""
        model_type = ""
        
        if HAS_ENTERPRISE:
            # Use Groq/OpenAI with keys from env for ChatterMate model
            model_type = 'OPENAI'
            model_name = os.getenv('CHATTERMATE_MODEL_NAME', 'gpt-4o-mini')
            api_key = os.getenv('CHATTERMATE_API_KEY', '')
            
            if not api_key:
                logger.error("ChatterMate API key not found in environment")
                raise HTTPException(
                    status_code=500,
                    detail="ChatterMate API configuration missing"
                )
        else:
            # Get from organization's AI config
            from app.repositories.ai_config import AIConfigRepository
            ai_config_repo = AIConfigRepository(db)
            ai_config = ai_config_repo.get_active_config(current_user.organization_id)
            
            if not ai_config:
                raise HTTPException(
                    status_code=404,
                    detail="No AI configuration found for your organization"
                )
            
            model_type = ai_config.model_type
            model_name = ai_config.model_name
            api_key = ai_config.api_key
            
            if not api_key:
                raise HTTPException(
                    status_code=500,
                    detail="API configuration missing from your organization settings"
                )
        
        # Create an instruction generation system message with context
        system_message = """
        You are an expert at creating instructions for AI assistants from scratch or modify existing instructions based on user's prompt.
        Your task is to generate a set of clear, concise, and effective instructions based on the user's prompt.
        
        Follow these guidelines:
        1. Each instruction should be specific and actionable
        2. Avoid contradictions between instructions
        3. Cover different aspects of the agent's behavior and knowledge
        4. Include limitations and boundaries where appropriate
        5. Format your response as a list of instructions, with each instruction separated by a newline
        6. Return between 3-7 instructions total
        7. Each instruction should be 1-3 sentences for clarity
        8. Focus on creating versatile instructions that will work well for customer service
        
        If existing instructions are provided:
        1. Review and understand the existing instructions
        2. Avoid duplicating existing instructions
        3. Focus on complementing or enhancing the existing instructions
        4. If modifying existing instructions, preserve their core intent while improving clarity
        5. Maintain the existing instructions' order and format when adding new instructions, dont add at starting if existing instructions has starting phrase, rewrite to fit in existing instructions
        
        Final output append with existing instruction and give complete one
        Return ONLY the instructions as a list, with no additional explanation or commentary.
        The instructions should be immediately usable in an AI agent configuration.
        """
        
        # Create a temporary agent for generation using the utility function
        model = create_model(
            model_type=model_type,
            api_key=api_key,
            model_name=model_name,
            max_tokens=800
        )
        
        generator = AgnoAgent(
            name="Instruction Generator",
            model=model,
            instructions=system_message,
            debug_mode=settings.ENVIRONMENT == "development"
        )
        
        # Generate instructions with context
        user_message = f"Please generate instructions for an AI agent with the following purpose: {prompt}"
        if existing_instructions:
            existing_instructions_text = "\n".join(f"- {instr}" for instr in existing_instructions)
            user_message += f"\n\nExisting instructions for context:\n{existing_instructions_text}"
        
        response = await generator.arun(user_message)
        
        # Parse response to get instructions list
        response_text = response.content if hasattr(response, 'content') else str(response)
        
        # Split the response into separate instructions
        instructions = []
        for line in response_text.strip().split('\n'):
            line = line.strip()
            # Skip empty lines and list markers
            if line and not line.startswith('```') and not line.endswith('```'):
                # Remove list markers if present (1., -, *, etc.)
                clean_line = line
                if line[0].isdigit() and line[1:3] in ['. ', '- ', ') ']:
                    clean_line = line[3:].strip()
                elif line[0] in ['-', '*', '•']:
                    clean_line = line[1:].strip()
                
                if clean_line:
                    instructions.append(clean_line)
        
        # Ensure the instructions are within limits
        total_length = sum(len(instruction) for instruction in instructions)
        if total_length > 2000:
            # Trim instructions to fit within 1500 characters
            result = []
            current_length = 0
            for instruction in instructions:
                if current_length + len(instruction) <= 1500:
                    result.append(instruction)
                    current_length += len(instruction)
                else:
                    # Try to add a truncated version of the instruction
                    remaining = 2000 - current_length
                    if remaining > 50:  # Only add if we can include something meaningful
                        truncated = instruction[:remaining - 3] + "..."
                        result.append(truncated)
                    break
            instructions = result
        
        return instructions
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating instructions: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to generate instructions"
        )
