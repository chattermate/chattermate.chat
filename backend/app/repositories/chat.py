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

from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from app.models.chat_history import ChatHistory
from app.models.customer import Customer
from uuid import UUID
from sqlalchemy import func, or_, select, text, and_
from sqlalchemy.sql import case
from app.models.agent import Agent
from app.models.session_to_agent import SessionToAgent
from app.core.logger import get_logger
from app.models.user import User
from sqlalchemy.orm import joinedload
from datetime import datetime
from pydantic import BaseModel
from app.core.s3 import get_s3_signed_url
from app.core.config import settings

logger = get_logger(__name__)

class ChatRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_message_count_for_period(
        self,
        org_id: UUID | str,
        start_date: datetime,
        end_date: datetime
    ) -> int:
        """
        Get the total number of bot messages for an organization within a specific date range.
        Only counts messages with message_type='bot'.
        
        Args:
            org_id: Organization ID
            start_date: Start date of the period
            end_date: End date of the period
            
        Returns:
            int: Total number of bot messages in the period
        """
        if isinstance(org_id, str):
            org_id = UUID(org_id)
            
        try:
            # Build filter conditions
            conditions = [
                ChatHistory.organization_id == org_id,
                ChatHistory.message_type == 'bot'  # Only count bot messages
            ]
            
            # Add date range conditions if they are not None
            if start_date is not None:
                conditions.append(ChatHistory.created_at >= start_date)
            if end_date is not None:
                conditions.append(ChatHistory.created_at <= end_date)
            
            count = self.db.query(func.count(ChatHistory.id))\
                .filter(and_(*conditions))\
                .scalar()
            return count or 0
        except Exception as e:
            logger.error(f"Error getting message count: {str(e)}")
            return 0

    def create_message(self, message_data: Dict[str, Any]) -> ChatHistory:
        """Create a new chat message."""
        try:
            # Convert any Pydantic models in attributes to dict
            if 'attributes' in message_data:
                attributes = message_data['attributes']
                if 'shopify_output' in attributes and attributes['shopify_output'] is not None:
                    if isinstance(attributes['shopify_output'], BaseModel):
                        attributes['shopify_output'] = attributes['shopify_output'].dict()
                    elif isinstance(attributes['shopify_output'], dict):
                        # If it's already a dict, ensure all nested objects are serialized
                        if 'products' in attributes['shopify_output']:
                            products = attributes['shopify_output']['products']
                            attributes['shopify_output']['products'] = [
                                p.dict() if isinstance(p, BaseModel) else p 
                                for p in products
                            ]
            
            # Convert string UUIDs to UUID objects
            for field in ['organization_id', 'user_id', 'customer_id', 'agent_id', 'session_id']:
                if field in message_data and message_data[field] is not None:
                    if isinstance(message_data[field], str):
                        message_data[field] = UUID(message_data[field])

            message = ChatHistory(**message_data)
            self.db.add(message)
            self.db.commit()
            self.db.refresh(message)
            return message
        except Exception as e:
            logger.error(f"Error creating message: {str(e)}")
            self.db.rollback()
            raise

    async def get_session_history(self, session_id: str | UUID) -> List[ChatHistory]:
        """Get chat history for a session with joined relationships"""
        if isinstance(session_id, str):
            session_id = UUID(session_id)
        
        messages = (
            self.db.query(ChatHistory)
            .options(
                joinedload(ChatHistory.user),
                joinedload(ChatHistory.agent),
                joinedload(ChatHistory.attachments)
            )
            .filter(ChatHistory.session_id == session_id)
            .order_by(ChatHistory.created_at.asc())
            .all()
        )
        
        # Generate signed URLs for S3 attachments
        if settings.S3_FILE_STORAGE:
            for message in messages:
                if message.attachments:
                    for attachment in message.attachments:
                        if attachment.file_url:
                            try:
                                signed_url = await get_s3_signed_url(attachment.file_url)
                                # Store the signed URL in a temporary attribute
                                attachment.file_url = signed_url
                            except Exception as e:
                                logger.error(f"Error generating signed URL for attachment {attachment.id}: {str(e)}")
                                
        
        return messages

    def get_user_history(self, user_id: str | UUID) -> List[ChatHistory]:
        """Get chat history for a user"""
        if isinstance(user_id, str):
            user_id = UUID(user_id)
            
        return self.db.query(ChatHistory).filter(
            ChatHistory.user_id == user_id
        ).order_by(ChatHistory.created_at.desc()).all()

    def get_recent_chats(
        self,
        skip: int = 0,
        limit: int = 20,
        agent_id: Optional[str | UUID] = None,
        status: Optional[str] = None,
        user_id: Optional[str | UUID] = None,
        user_groups: Optional[List[str]] = None,
        organization_id: Optional[str | UUID] = None,
        user_name: Optional[str] = None,
        filter_user_id: Optional[str | UUID] = None,
        customer_email: Optional[str] = None,
        date_from: Optional[datetime] = None,
        date_to: Optional[datetime] = None
    ) -> List[dict]:
        """Get recent chat overviews grouped by conversation"""
        # Convert string IDs to UUID if needed
        if agent_id and isinstance(agent_id, str):
            agent_id = UUID(agent_id)
        if user_id and isinstance(user_id, str):
            user_id = UUID(user_id)
        if organization_id and isinstance(organization_id, str):
            organization_id = UUID(organization_id)
        if user_groups:
            user_groups = [UUID(g) if isinstance(g, str) else g for g in user_groups]

        query = self.db.query(
            Customer.id.label('customer_id'),
            Customer.email.label('customer_email'),
            Customer.full_name.label('customer_full_name'),
            Agent.id.label('agent_id'),
            Agent.name.label('agent_name'),
            Agent.display_name.label('agent_display_name'),
            SessionToAgent.status.label('status'),
            SessionToAgent.group_id.label('group_id'),
            func.max(ChatHistory.message).label('last_message'),
            func.max(ChatHistory.created_at).label('updated_at'),
            func.count(ChatHistory.id).label('message_count'),
            SessionToAgent.session_id.label('session_id')
        ).join(
            Agent, ChatHistory.agent_id == Agent.id
        ).join(
            Customer, ChatHistory.customer_id == Customer.id
        ).join(
            SessionToAgent, ChatHistory.session_id == SessionToAgent.session_id
        ).outerjoin(
            User, SessionToAgent.user_id == User.id
        )

        # Filter conditions
        if agent_id:
            query = query.filter(Agent.id == agent_id)
        
        # Filter by status if provided
        if status and status != 'all':
            # Handle comma-separated status values
            if ',' in status:
                status_values = [s.strip() for s in status.split(',')]
                query = query.filter(SessionToAgent.status.in_(status_values))
            else:
                query = query.filter(SessionToAgent.status == status)
        
        # Filter by organization
        if organization_id:
            query = query.filter(SessionToAgent.organization_id == organization_id)
        
        # Filter by user name
        if user_name:
            query = query.filter(User.full_name.ilike(f'%{user_name}%'))
        
        # Filter by specific user ID (for agent dropdown)
        if filter_user_id:
            if isinstance(filter_user_id, str):
                filter_user_id = UUID(filter_user_id)
            query = query.filter(SessionToAgent.user_id == filter_user_id)
        
        # Filter by customer email
        if customer_email:
            query = query.filter(Customer.email.ilike(f'%{customer_email}%'))
        
        # Filter by date range
        if date_from:
            query = query.filter(ChatHistory.created_at >= date_from)
        if date_to:
            query = query.filter(ChatHistory.created_at <= date_to)
        
        # Use OR condition for user_id and user_groups
        if user_id and user_groups:
            query = query.filter(
                or_(
                    SessionToAgent.user_id == user_id,
                    SessionToAgent.group_id.in_(user_groups)
                )
            )
        elif user_id:
            query = query.filter(SessionToAgent.user_id == user_id)
        elif user_groups:
            query = query.filter(SessionToAgent.group_id.in_(user_groups))

        # Group by and order
        query = query.group_by(
            Customer.id,
            Customer.email,
            Customer.full_name,
            Agent.id,
            Agent.name,
            Agent.display_name,
            SessionToAgent.status,
            SessionToAgent.group_id,
            SessionToAgent.session_id
        ).order_by(
            # Create a custom ordering to prioritize transferred conversations
            # Using direct SQL expression for the CASE statement with uppercase status values
            text("CASE WHEN session_to_agents.status = 'TRANSFERRED' THEN 0 "
                 "WHEN session_to_agents.status = 'OPEN' THEN 1 "
                 "ELSE 2 END"),
            # Then order by most recent activity
            func.max(ChatHistory.created_at).desc()
        ).offset(skip).limit(limit)

        results = query.all()
        return [{
            'customer': {
                'id': r.customer_id,
                'email': r.customer_email,
                'full_name': r.customer_full_name
            },
            'agent': {
                'id': r.agent_id,
                'name': r.agent_name,
                'display_name': r.agent_display_name
            },
            'last_message': r.last_message,
            'updated_at': r.updated_at,
            'message_count': r.message_count,
            'status': r.status,
            'group_id': str(r.group_id) if r.group_id else None,
            'session_id': r.session_id
        } for r in results]

    async def check_session_access(
        self,
        session_id: str | UUID,
        user_id: str | UUID,
        user_groups: List[str]
    ) -> bool:
        """Check if user has access to a chat session"""
        if isinstance(session_id, str):
            session_id = UUID(session_id)
        if isinstance(user_id, str):
            user_id = UUID(user_id)

        session = (
            self.db.query(SessionToAgent)
            .filter(SessionToAgent.session_id == session_id)
            .first()
        )
        
        if not session:
            return False
            
        return (
            session.user_id == user_id or
            (session.group_id and str(session.group_id) in user_groups)
        )

    async def get_chat_detail(
        self,
        session_id: str | UUID,
        org_id: str | UUID
    ) -> Optional[dict]:
        """Get detailed chat information for a session"""
        if isinstance(session_id, str):
            session_id = UUID(session_id)
        if isinstance(org_id, str):
            org_id = UUID(org_id)

        result = (
            self.db.query(
                Customer.id.label('customer_id'),
                Customer.email.label('customer_email'),
                Customer.full_name.label('customer_full_name'),
                Agent.id.label('agent_id'),
                Agent.name.label('agent_name'),
                Agent.display_name.label('agent_display_name'),
                SessionToAgent.status.label('status'),
                SessionToAgent.group_id.label('group_id'),
                SessionToAgent.session_id.label('session_id'),
                SessionToAgent.user_id.label('user_id'),
                User.full_name.label('user_name'),
                func.min(ChatHistory.created_at).label('created_at'),
                func.max(ChatHistory.created_at).label('updated_at')
            )
            .join(Agent, ChatHistory.agent_id == Agent.id)
            .join(Customer, ChatHistory.customer_id == Customer.id)
            .join(SessionToAgent, ChatHistory.session_id == SessionToAgent.session_id)
            .outerjoin(User, SessionToAgent.user_id == User.id)
            .filter(
                ChatHistory.session_id == session_id,
                SessionToAgent.organization_id == org_id
            )
            .group_by(
                Customer.id,
                Customer.email,
                Customer.full_name,
                Agent.id,
                Agent.name,
                Agent.display_name,
                SessionToAgent.status,
                SessionToAgent.group_id,
                SessionToAgent.session_id,
                SessionToAgent.user_id,
                User.full_name
            )
            .first()
        )

        if not result:
            return None

        # Get messages for the session
        messages = await self.get_session_history(session_id)
        
        # Build messages list with attachments
        messages_list = []
        for msg in messages:
            msg_dict = {
                'message': msg.message,
                'message_type': msg.message_type,
                'created_at': msg.created_at,
                'attributes': msg.attributes
            }
            
            # Add attachments with file info if they exist
            if msg.attachments:
                attachments = []
                for attachment in msg.attachments:
                    att_dict = {
                        'id': attachment.id,
                        'filename': attachment.filename,
                        'file_url': attachment.file_url,
                        'content_type': attachment.content_type,
                        'file_size': attachment.file_size
                    }
                    attachments.append(att_dict)
                msg_dict['attachments'] = attachments
            
            messages_list.append(msg_dict)
        
        # Convert result to dict
        return {
            'customer': {
                'id': result.customer_id,
                'email': result.customer_email,
                'full_name': result.customer_full_name
            },
            'agent': {
                'id': result.agent_id,
                'name': result.agent_name,
                'display_name': result.agent_display_name
            },
            'status': result.status,
            'group_id': str(result.group_id) if result.group_id else None,
            'session_id': result.session_id,
            'user_id': result.user_id,
            'user_name': result.user_name,
            'created_at': result.created_at,
            'updated_at': result.updated_at,
            'messages': messages_list
        }
