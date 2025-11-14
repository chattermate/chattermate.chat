"""
ChatterMate - Ai Setup
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

import traceback
from fastapi import APIRouter, Depends, HTTPException, status
from app.core import config
from app.core.logger import get_logger
from app.database import get_db
from app.models.user import User
from app.core.auth import get_current_user, require_permissions
from app.repositories.ai_config import AIConfigRepository
from app.agents.chat_agent import ChatAgent
from app.models.schemas.ai_config import AIConfigCreate, AIConfigResponse, AISetupResponse, AIConfigUpdate
from sqlalchemy.orm import Session
import os
from enum import Enum

from app.models.ai_config import AIModelType

# Try to import enterprise modules
try:
    from app.enterprise.repositories.subscription import SubscriptionRepository
    from app.enterprise.repositories.plan import PlanRepository
    HAS_ENTERPRISE = True
except ImportError:
    HAS_ENTERPRISE = False

router = APIRouter()
logger = get_logger(__name__)


def check_custom_models_feature_access(current_user: User, db: Session):
    """Check if user has access to custom models feature"""
    if not HAS_ENTERPRISE:
        return  # Allow access in non-enterprise mode
    
    subscription_repo = SubscriptionRepository(db)
    plan_repo = PlanRepository(db)
    
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
    
    # Check if custom models feature is available in the plan
    if not plan_repo.check_feature_availability(str(subscription.plan_id), 'custom_models'):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Custom Models feature is not available in your current plan. Please upgrade to access this feature."
        )


# Define allowed models as Enum to restrict choices
class ModelType(str, Enum):
    GROQ = "GROQ"
    OPENAI = "OPENAI"
    # ANTHROPIC = "ANTHROPIC"
    # OLLAMA = "OLLAMA"
    # CLAUDE = "CLAUDE"
    # MISTRAL = "MISTRAL"
    # COHERE = "COHERE"
    CHATTERMATE = "CHATTERMATE"


# Define allowed models per provider
class GroqModels(str, Enum):
    LLAMA_3_70B = "llama-3.3-70b-versatile"


class OpenAIModels(str, Enum):
    GPT_4O_MINI = "gpt-4o-mini"
    O1_MINI = "o1-mini"
    O3_MINI = "o3-mini"


# Override model validation in the schemas
@router.post("/setup", response_model=AISetupResponse)
async def setup_ai(
    config_data: AIConfigCreate,
    current_user: User = Depends(require_permissions("manage_ai_config")),
    db: Session = Depends(get_db)
):
    """Setup AI configuration for the current user's organization"""
    try:
        logger.info("Setting up AI config")
        
        # Validate model selection based on provider
        validate_model_selection(config_data.model_type, config_data.model_name)
        
        # Check if this is a custom model setup (not ChatterMate)
        is_custom_model = not (config_data.model_type.lower() == 'chattermate' and config_data.model_name.lower() == 'chattermate')
        
        # Check feature access for custom models
        if is_custom_model:
            check_custom_models_feature_access(current_user, db)
        
        # Check if using ChatterMate model
        if HAS_ENTERPRISE and config_data.model_type.lower() == 'chattermate' and config_data.model_name.lower() == 'chattermate':
            # Use Groq as provider with keys from env
            model_type = AIModelType.CHATTERMATE
            model_name = os.getenv('CHATTERMATE_MODEL_NAME', 'gpt-4o-mini')
            api_key = os.getenv('CHATTERMATE_API_KEY', '')
        
            if not api_key:
                logger.error("ChatterMate API key not found in environment")
                raise HTTPException(
                        status_code=500,
                        detail="ChatterMate API configuration missing"
                )
                
            # Create AI configuration
            ai_config_repo = AIConfigRepository(db)
            ai_config = ai_config_repo.create_config(
                org_id=current_user.organization_id,
                model_type=model_type,
                model_name=model_name,
                api_key=api_key
            )
            
            # Prepare response
            response = AISetupResponse(
                message="AI configuration completed successfully",
                config=AIConfigResponse(
                    id=ai_config.id,
                    organization_id=ai_config.organization_id,
                    model_type=ai_config.model_type,
                    model_name=ai_config.model_name,
                    is_active=ai_config.is_active,
                    settings=ai_config.settings
                )
            )
            
            logger.debug(
                f"ChatterMate AI setup completed for org {current_user.organization_id}")
            return response
        
        # Regular custom model setup
        # Test API key before creating config
        try:
            # Only validate API keys for supported providers
            model_type_upper = config_data.model_type.upper()
            if model_type_upper in ["GROQ", "OPENAI"]:
                is_valid = await ChatAgent.test_api_key(
                    api_key=config_data.api_key.get_secret_value(),
                    model_type=config_data.model_type,
                    model_name=config_data.model_name
                )
                if not is_valid:
                    raise HTTPException(
                        status_code=400,
                        detail={
                            "error": "Invalid API key",
                            "type": "invalid_api_key",
                            "details": "The provided API key is invalid or does not have access to the selected model."
                        }
                    )
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail={
                    "error": "API key validation failed",
                    "type": "api_key_validation_error",
                    "details": str(e)
                }
            )


        # Create AI configuration
        ai_config_repo = AIConfigRepository(db)
        ai_config = ai_config_repo.create_config(
            org_id=current_user.organization_id,
            model_type=config_data.model_type,
            model_name=config_data.model_name,
            api_key=config_data.api_key.get_secret_value()
        )

        # Prepare response
        response = AISetupResponse(
            message="AI configuration completed successfully",
            config=AIConfigResponse(
                id=ai_config.id,
                organization_id=ai_config.organization_id,
                model_type=ai_config.model_type,
                model_name=ai_config.model_name,
                is_active=ai_config.is_active,
                settings=ai_config.settings
            )
        )

        logger.info(
            f"AI setup completed for org {current_user.organization_id}")
        return response

    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        logger.error(f"AI setup error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to setup AI configuration"
        )


@router.get("/config", response_model=AIConfigResponse)
async def get_organization_ai_config(
    current_user: User = Depends(require_permissions("view_ai_config")),
    db: Session = Depends(get_db)
):
    """Get active AI configuration for the current user's organization"""
    try:
        ai_config_repo = AIConfigRepository(db)
        ai_config = ai_config_repo.get_active_config(
            current_user.organization_id)

        if not ai_config:
            raise HTTPException(
                status_code=404,
                detail="No active AI configuration found"
            )

        return AIConfigResponse(
            id=ai_config.id,
            organization_id=ai_config.organization_id,
            model_type=ai_config.model_type,
            model_name=ai_config.model_name,
            is_active=ai_config.is_active,
            settings=ai_config.settings
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting AI config: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to get AI configuration"
        )


@router.put("/config", response_model=AISetupResponse)
async def update_ai_config(
    config_data: AIConfigUpdate,
    current_user: User = Depends(require_permissions("manage_ai_config")),
    db: Session = Depends(get_db)
):
    """Update AI configuration for the current user's organization"""
    try:
        logger.info(f"Updating AI config for org {current_user.organization_id}")
        
        # Validate model selection based on provider
        validate_model_selection(config_data.model_type, config_data.model_name)
        
        # Check if this is a custom model setup (not ChatterMate)
        is_custom_model = not (config_data.model_type.lower() == 'chattermate' and config_data.model_name.lower() == 'chattermate')
        
        # Check feature access for custom models
        if is_custom_model:
            check_custom_models_feature_access(current_user, db)
        
        # Get current config
        ai_config_repo = AIConfigRepository(db)
        current_config = ai_config_repo.get_active_config(current_user.organization_id)
        
        if not current_config:
            raise HTTPException(
                status_code=404,
                detail="No active AI configuration found to update"
            )
        
        # Check if using ChatterMate model
        if HAS_ENTERPRISE and config_data.model_type.lower() == 'chattermate' and config_data.model_name.lower() == 'chattermate':
            # Use Groq as provider with keys from env
            model_type = AIModelType.CHATTERMATE
            model_name = os.getenv('CHATTERMATE_MODEL_NAME', 'gpt-4o-mini')
            api_key = os.getenv('CHATTERMATE_API_KEY', '')
            
            if not api_key:
                logger.error("ChatterMate API key not found in environment")
                raise HTTPException(
                    status_code=500,
                    detail="ChatterMate API configuration missing"
                )
                
            # Update AI configuration
            updated_config = ai_config_repo.update_config(
                config_id=current_config.id,
                model_type=model_type,
                model_name=model_name,
                api_key=api_key
            )
            
            logger.info(f"ChatterMate AI config updated for org {current_user.organization_id}")
        else:
            # For custom model, validate API key first if provided
            if config_data.api_key:
                model_type_upper = config_data.model_type.upper()
                if model_type_upper in ["GROQ", "OPENAI"]:
                    try:
                        is_valid = await ChatAgent.test_api_key(
                            api_key=config_data.api_key.get_secret_value(),
                            model_type=config_data.model_type,
                            model_name=config_data.model_name
                        )
                        if not is_valid:
                            raise HTTPException(
                                status_code=400,
                                detail={
                                    "error": "Invalid API key",
                                    "type": "invalid_api_key",
                                    "details": "The provided API key is invalid or does not have access to the selected model."
                                }
                            )
                    except Exception as e:
                        raise HTTPException(
                            status_code=400,
                            detail={
                                "error": "API key validation failed",
                                "type": "api_key_validation_error",
                                "details": str(e)
                            }
                        )
            
            # Determine the API key to use
            api_key = None  # None indicates no change
            if config_data.api_key:
                api_key = config_data.api_key.get_secret_value()
            
            # Update AI configuration
            updated_config = ai_config_repo.update_config(
                config_id=current_config.id,
                model_type=config_data.model_type,
                model_name=config_data.model_name,
                api_key=api_key
            )
            
            logger.info(f"AI config updated for org {current_user.organization_id}")
        
        # Prepare response
        response = AISetupResponse(
            message="AI configuration updated successfully",
            config=AIConfigResponse(
                id=updated_config.id,
                organization_id=updated_config.organization_id,
                model_type=updated_config.model_type,
                model_name=updated_config.model_name,
                is_active=updated_config.is_active,
                settings=updated_config.settings
            )
        )
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"AI config update error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to update AI configuration"
        )


def validate_model_selection(model_type: str, model_name: str):
    """Validate that the selected model is allowed for the chosen provider"""
    
    # ChatterMate is a special case handled separately
    if model_type.upper() == "CHATTERMATE" and model_name.lower() == "chattermate":
        return True
    
    # For GROQ, only allow specific models
    if model_type.upper() == "GROQ":
        try:
            GroqModels(model_name)
        except ValueError:
            valid_models = ", ".join([m.value for m in GroqModels])
            raise HTTPException(
                status_code=400,
                detail={
                    "error": "Invalid model selection",
                    "type": "invalid_model",
                    "details": f"For Groq, only these models are supported: {valid_models}"
                }
            )
    
    # For OpenAI, only allow specific models
    elif model_type.upper() == "OPENAI":
        try:
            OpenAIModels(model_name)
        except ValueError:
            valid_models = ", ".join([m.value for m in OpenAIModels])
            raise HTTPException(
                status_code=400,
                detail={
                    "error": "Invalid model selection",
                    "type": "invalid_model",
                    "details": f"For OpenAI, only these models are supported: {valid_models}"
                }
            )
    
    # Other providers are not supported for now
    else:
        valid_providers = ", ".join([m.value for m in ModelType])
        raise HTTPException(
            status_code=400,
            detail={
                "error": "Unsupported provider",
                "type": "invalid_provider",
                "details": f"Currently only these providers are supported: {valid_providers}"
            }
        )
