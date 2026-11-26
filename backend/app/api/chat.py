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

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from fastapi.concurrency import run_in_threadpool
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.models.schemas.chat import (
    ChatOverviewResponse, ChatDetailResponse, CustomerInfo, CustomerNameUpdate, InboxCountsResponse,
)
from app.core.auth import get_current_user, require_permissions, get_unified_chat_auth
from app.services.shopify_session import require_shopify_or_jwt_auth
from app.models.user import User
from app.database import get_db
from app.repositories.chat import ChatRepository
from app.repositories.customer import CustomerRepository
from app.repositories.session_to_agent import SessionToAgentRepository
from app.repositories.inbox_views import InboxSort, InboxView
from app.models.session_to_agent import SessionStatus
from app.core.params import MAX_DB_INT
from app.core.logger import get_logger
from uuid import UUID

from fastapi import status


router = APIRouter()
logger = get_logger(__name__)




@router.get("/")
async def get_chat_history():
    return {"message": "Chat history endpoint"}


_STATUS_FILTERS = {s.value for s in SessionStatus}

TODAY_START_HELP = (
    "Where 'today' begins for resolved_by_ai, as the caller's local midnight; "
    "UTC midnight if not given"
)


def _checked_status_filter(value: Optional[str]) -> Optional[str]:
    """'all', one status or a comma-separated list of them. Anything else is
    refused here: compared with the status column it is a database error."""
    if not value or value == "all":
        return value
    unknown = [part for part in (v.strip() for v in value.split(",")) if part not in _STATUS_FILTERS]
    if unknown:
        raise HTTPException(status_code=422, detail=f"Unknown status: {', '.join(unknown)}")
    return value


def _inbox_scope(auth_info: dict) -> dict:
    """The visibility arguments for a caller's inbox, shared by the list and
    its counts so the two always cover the same conversations.

    A Shopify session (no user permissions) and view_all_chats see the whole
    organization. Everyone else sees their own sessions and their groups'
    queue (view_assigned_chats) and/or the unclaimed AI queue
    (view_unassigned_chats).
    """
    if auth_info['auth_type'] in ('shopify_session', 'shopify') or auth_info.get('can_view_all', False):
        return {}
    current_user = auth_info['current_user']
    can_view_assigned = auth_info.get('can_view_assigned', False)
    return {
        'user_id': current_user.id if can_view_assigned else None,
        'user_groups': [str(group.id) for group in current_user.groups] if can_view_assigned else None,
        'include_unassigned': auth_info.get('can_view_unassigned', False),
    }


@router.get("/counts", response_model=InboxCountsResponse)
async def get_inbox_counts(
    today_start: Optional[datetime] = Query(None, description=TODAY_START_HELP),
    auth_info: dict = Depends(get_unified_chat_auth),
    db: Session = Depends(get_db)
):
    """Each inbox view's size, in the same scope as /recent: the navigation
    badges and the inbox's view list."""
    try:
        return await run_in_threadpool(
            ChatRepository(db).get_inbox_counts,
            organization_id=auth_info['organization_id'],
            current_user_id=auth_info.get('user_id'),
            today_start=today_start,
            **_inbox_scope(auth_info),
        )
    except Exception as e:
        logger.error(f"Error counting inbox conversations: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to count conversations")


@router.get("/recent/shopify", response_model=List[ChatOverviewResponse])
@router.get("/recent", response_model=List[ChatOverviewResponse])
async def get_recent_chats(
    skip: int = Query(0, ge=0, le=MAX_DB_INT),
    limit: int = Query(20, ge=1, le=100),
    agent_id: Optional[str] = None,
    status: Optional[str] = Query(None, description="Filter by status: 'open', 'closed', or 'transferred'"),
    user_name: Optional[str] = Query(None, description="Filter by user name"),
    user_id: Optional[str] = Query(None, description="Filter by specific user ID"),
    customer_email: Optional[str] = Query(None, description="Filter by customer email"),
    date_from: Optional[datetime] = Query(None, description="Filter conversations from this date"),
    date_to: Optional[datetime] = Query(None, description="Filter conversations to this date"),
    view: Optional[InboxView] = Query(None, description="An inbox view: mine, waiting, open, ai, resolved_by_ai, closed or negative"),
    channel: Optional[str] = Query(None, max_length=32, description="Only this channel ('web', 'whatsapp', ...)"),
    q: Optional[str] = Query(None, max_length=100, description="Customer name, email, phone or custom data (an order number) containing this"),
    sort: Optional[InboxSort] = Query(None, description="newest, or waiting_longest; by default waiting chats come first"),
    today_start: Optional[datetime] = Query(None, description=TODAY_START_HELP),
    auth_info: dict = Depends(get_unified_chat_auth),
    db: Session = Depends(get_db)
):
    """Get recent chats - supports both JWT and Shopify session token auth"""
    status = _checked_status_filter(status)
    try:
        # Off the event loop: a sync query here stalls every socket and request
        return await run_in_threadpool(
            ChatRepository(db).get_recent_chats,
            view=view,
            channel=channel,
            search=q.strip() if q and q.strip() else None,
            sort=sort,
            current_user_id=auth_info.get('user_id'),
            today_start=today_start,
            skip=skip,
            limit=limit,
            agent_id=agent_id,
            status=status,
            organization_id=auth_info['organization_id'],
            user_name=user_name,
            filter_user_id=user_id,
            customer_email=customer_email,
            date_from=date_from,
            date_to=date_to,
            **_inbox_scope(auth_info),
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

async def _require_chat_access(chat_repo: ChatRepository, auth_info: dict, session_id: UUID) -> None:
    """404 unless this caller may see the conversation.

    Shopify session auth carries no user permissions and sees all of the
    org's chats. Scoped readers must own the session, share its group, or —
    with view_unassigned_chats — find it unclaimed.
    """
    if auth_info['auth_type'] in ('shopify_session', 'shopify'):
        return
    if auth_info.get('can_view_all', False):
        return
    current_user = auth_info['current_user']
    can_view_assigned = auth_info.get('can_view_assigned', False)
    user_group_ids = [str(group.id) for group in current_user.groups]
    has_access = await chat_repo.check_session_access(
        session_id=session_id,
        user_id=current_user.id if can_view_assigned else None,
        user_groups=user_group_ids if can_view_assigned else [],
        include_unassigned=auth_info.get('can_view_unassigned', False)
    )
    if not has_access:
        raise HTTPException(status_code=404, detail="Chat session not found")


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
        
        await _require_chat_access(chat_repo, auth_info, session_id_uuid)
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


@router.patch("/{session_id}/customer", response_model=CustomerInfo)
async def rename_chat_customer(
    session_id: UUID,
    request: CustomerNameUpdate,
    auth_info: dict = Depends(get_unified_chat_auth),
    db: Session = Depends(get_db)
):
    """Name the customer of a conversation from the inbox.

    Channels like Messenger and LINE often give us only an id ("Line user
    U56c…"); whoever can see the chat can say who it is. Same customer record
    as People, so the name shows everywhere.
    """
    await _require_chat_access(ChatRepository(db), auth_info, session_id)
    customer = await run_in_threadpool(_rename_session_customer, db, session_id,
                                       auth_info['organization_id'], request.full_name)
    if customer is None:
        raise HTTPException(status_code=404, detail="Chat session not found")
    return customer


def _rename_session_customer(db: Session, session_id: UUID, organization_id,
                             full_name: str) -> Optional[CustomerInfo]:
    """The session's customer renamed, or None when the session is not this org's."""
    session_record = SessionToAgentRepository(db).get_session(session_id)
    if session_record is None or session_record.customer_id is None \
            or str(session_record.organization_id) != str(organization_id):
        return None
    customer = CustomerRepository(db).get_by_id(session_record.customer_id)
    if customer is None:
        return None
    customer.full_name = full_name
    db.commit()
    db.refresh(customer)
    return CustomerInfo.model_validate(customer, from_attributes=True)
