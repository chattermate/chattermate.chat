"""
ChatterMate - Chat
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

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.models.schemas.chat import ChatOverviewResponse, ChatDetailResponse
from app.core.auth import get_current_user, require_permissions, get_unified_chat_auth
from app.services.shopify_session import require_shopify_or_jwt_auth
from app.models.user import User
from app.database import get_db
from app.repositories.chat import ChatRepository
from app.core.logger import get_logger
from uuid import UUID

from fastapi import status


router = APIRouter()
logger = get_logger(__name__)




@router.get("/")
async def get_chat_history():
    return {"message": "Chat history endpoint"}


@router.get("/recent/shopify", response_model=List[ChatOverviewResponse])
@router.get("/recent", response_model=List[ChatOverviewResponse])
async def get_recent_chats(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    agent_id: Optional[str] = None,
    status: Optional[str] = Query(None, description="Filter by status: 'open', 'closed', or 'transferred'"),
    user_name: Optional[str] = Query(None, description="Filter by user name"),
    user_id: Optional[str] = Query(None, description="Filter by specific user ID"),
    customer_email: Optional[str] = Query(None, description="Filter by customer email"),
    date_from: Optional[datetime] = Query(None, description="Filter conversations from this date"),
    date_to: Optional[datetime] = Query(None, description="Filter conversations to this date"),
    auth_info: dict = Depends(get_unified_chat_auth),
    db: Session = Depends(get_db)
):
    """Get recent chats - supports both JWT and Shopify session token auth"""
    try:
        chat_repo = ChatRepository(db)
        organization_id = auth_info['organization_id']
        
        # For Shopify session token auth, we don't have user permissions, so show all chats for the organization
        if auth_info['auth_type'] == 'shopify_session' or auth_info['auth_type'] == 'shopify':
            return chat_repo.get_recent_chats(
                skip=skip,
                limit=limit,
                agent_id=agent_id,
                status=status,
                organization_id=organization_id,
                user_name=user_name,
                filter_user_id=user_id,
                customer_email=customer_email,
                date_from=date_from,
                date_to=date_to
            )
        
        # For JWT auth, use permissions from auth_info
        current_user = auth_info['current_user']
        can_view_all = auth_info['can_view_all']
        can_view_assigned = auth_info['can_view_assigned']
        
        # Get user's group IDs
        user_group_ids = [str(group.id) for group in current_user.groups]
        logger.debug(f"User groups: {user_group_ids}")
        logger.debug(f"current_user.user_id: {current_user.id}")
        
        # If user can only view assigned chats, filter by user_id and groups
        if not can_view_all and can_view_assigned:
            return chat_repo.get_recent_chats(
                skip=skip,
                limit=limit,
                agent_id=agent_id,
                status=status,
                user_id=current_user.id,  # Pass UUID directly
                user_groups=user_group_ids,
                organization_id=organization_id,
                user_name=user_name,
                filter_user_id=user_id,  # New parameter for filtering by specific user
                customer_email=customer_email,
                date_from=date_from,
                date_to=date_to
            )
        
        # For users with view_all_chats permission
        return chat_repo.get_recent_chats(
            skip=skip,
            limit=limit,
            agent_id=agent_id,
            status=status,
            organization_id=organization_id,
            user_name=user_name,
            filter_user_id=user_id,  # New parameter for filtering by specific user
            customer_email=customer_email,
            date_from=date_from,
            date_to=date_to
        )
    except ValueError as e:
        logger.error(f"Invalid UUID format: {str(e)}")
        raise HTTPException(
            status_code=400,
            detail="Invalid UUID format"
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting recent chats: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to fetch recent chats"
        )

@router.get("/{session_id}/shopify", response_model=ChatDetailResponse)
@router.get("/{session_id}", response_model=ChatDetailResponse)
async def get_chat_detail(
    session_id: str,
    auth_info: dict = Depends(get_unified_chat_auth),
    db: Session = Depends(get_db)
):
    """Get detailed chat history for a session - supports both JWT and Shopify session token auth"""
    logger.info(f"Getting chat detail for session {session_id}")
    
    try:
        # Convert session_id to UUID
        session_id_uuid = UUID(session_id)
        chat_repo = ChatRepository(db)
        organization_id = auth_info['organization_id']
        
        # For Shopify session token auth, we don't have user permissions, so allow access to all org chats
        if auth_info['auth_type'] == 'shopify_session' or auth_info['auth_type'] == 'shopify':
            # Get chat detail
            chat_detail = await chat_repo.get_chat_detail(
                session_id=session_id_uuid,
                org_id=organization_id
            )
        else:
            # For JWT auth, use permissions from auth_info
            current_user = auth_info['current_user']
            can_view_all = auth_info['can_view_all']
            can_view_assigned = auth_info['can_view_assigned']

            # Get user's group IDs
            user_group_ids = [str(group.id) for group in current_user.groups]

            # If user can only view assigned chats, verify access
            if not can_view_all and can_view_assigned:
                has_access = await chat_repo.check_session_access(
                    session_id=session_id_uuid,
                    user_id=current_user.id,
                    user_groups=user_group_ids
                )
                if not has_access:
                    raise HTTPException(
                        status_code=404,
                        detail="Chat session not found"
                    )
            
            # Get chat detail
            chat_detail = await chat_repo.get_chat_detail(
                session_id=session_id_uuid,
                org_id=organization_id
            )
        
        
        if not chat_detail:
            raise HTTPException(
                status_code=404,
                detail="Chat session not found"
            )

        # Process messages to include Shopify data from attributes
        if hasattr(chat_detail, 'messages') and chat_detail.messages:
            for message in chat_detail.messages:
                if hasattr(message, 'attributes') and message.attributes:
                    try:
                        import json
                        attrs = json.loads(message.attributes) if isinstance(message.attributes, str) else message.attributes
                        
                        # Add Shopify-specific data to message if present
                        if 'shopify_data' in attrs:
                            message.shopify_data = attrs['shopify_data']
                        
                        # Handle shopify_output for backward compatibility
                        if 'shopify_output' in attrs:
                            message.message_type = 'product'
                            message.shopify_output = attrs['shopify_output']
                        
                        # Keep other attributes that might be needed
                        message.end_chat = attrs.get('end_chat')
                        
                        # Handle end_chat_reason - validate against enum values
                        end_chat_reason = attrs.get('end_chat_reason')
                        if end_chat_reason is not None:
                            # Check if value is in the enum
                            from app.models.schemas.chat import EndChatReasonType
                            valid_reasons = [reason.value for reason in EndChatReasonType]
                            if end_chat_reason not in valid_reasons:
                                # If invalid value, set to None
                                logger.warning(f"Invalid end_chat_reason value: {end_chat_reason}. Setting to None.")
                                message.end_chat_reason = None
                            else:
                                message.end_chat_reason = end_chat_reason
                        else:
                            message.end_chat_reason = None
                            
                        message.end_chat_description = attrs.get('end_chat_description')
                            
                    except (json.JSONDecodeError, TypeError) as e:
                        logger.warning(f"Failed to parse message attributes: {e}")
                        continue
        elif isinstance(chat_detail, dict) and 'messages' in chat_detail:
            # Handle case where chat_detail is a dict
            for message in chat_detail['messages']:
                if isinstance(message, dict) and 'attributes' in message and message['attributes']:
                    try:
                        import json
                        attrs = json.loads(message['attributes']) if isinstance(message['attributes'], str) else message['attributes']
                        
                        # Add Shopify-specific data to message if present
                        if 'shopify_data' in attrs:
                            message['shopify_data'] = attrs['shopify_data']
                        
                        # Handle shopify_output for backward compatibility
                        if 'shopify_output' in attrs and attrs['shopify_output'] is not None:
                            message['message_type'] = 'product'
                            message['shopify_output'] = attrs['shopify_output']
                        
                        # Keep other attributes that might be needed
                        message['end_chat'] = attrs.get('end_chat')
                        
                        # Handle end_chat_reason - validate against enum values
                        end_chat_reason = attrs.get('end_chat_reason')
                        if end_chat_reason is not None:
                            # Check if value is in the enum
                            from app.models.schemas.chat import EndChatReasonType
                            valid_reasons = [reason.value for reason in EndChatReasonType]
                            if end_chat_reason not in valid_reasons:
                                # If invalid value, set to None
                                logger.warning(f"Invalid end_chat_reason value: {end_chat_reason}. Setting to None.")
                                message['end_chat_reason'] = None
                            else:
                                message['end_chat_reason'] = end_chat_reason
                        else:
                            message['end_chat_reason'] = None
                            
                        message['end_chat_description'] = attrs.get('end_chat_description')
                            
                    except (json.JSONDecodeError, TypeError) as e:
                        logger.warning(f"Failed to parse message attributes: {e}")
                        continue

        return chat_detail

    except ValueError as e:
        logger.error(f"Invalid UUID format: {str(e)}")
        raise HTTPException(
            status_code=400,
            detail="Invalid UUID format"
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting chat detail: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to fetch chat detail"
        )





