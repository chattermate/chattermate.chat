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
from typing import List, Optional
from app.models.session_to_agent import SessionToAgent, SessionStatus, EndChatReasonType
from uuid import UUID
from datetime import datetime, timedelta
from app.core.logger import get_logger
from sqlalchemy import or_, func

from app.models.user import User
from app.models.chat_history import ChatHistory

logger = get_logger(__name__)

class SessionToAgentRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_session(self, session_id: UUID | str, agent_id: UUID | str = None, customer_id: UUID | str = None, user_id: UUID | str = None, organization_id: UUID | str = None) -> SessionToAgent:
        """Create a new session assignment"""
        try:
            # Convert string IDs to UUID objects
            if isinstance(session_id, str):
                session_id = UUID(session_id)
            if isinstance(agent_id, str):
                agent_id = UUID(agent_id)
            if isinstance(customer_id, str):
                customer_id = UUID(customer_id)
            if isinstance(user_id, str):
                user_id = UUID(user_id)
            if isinstance(organization_id, str):
                organization_id = UUID(organization_id)
                
            workflow_id = None
            
            # Check if agent has an active workflow (only if agent_id is provided)
            if agent_id is not None:
                from app.models.agent import Agent
                agent = self.db.query(Agent).filter(Agent.id == agent_id).first()
                
                if agent:
                    logger.info(f"Agent {agent_id} has use_workflow: {agent.use_workflow} and active_workflow_id: {agent.active_workflow_id}")
                    if agent.use_workflow and agent.active_workflow_id:
                        workflow_id = agent.active_workflow_id
                        logger.info(f"Agent {agent_id} has active workflow {workflow_id}, adding to session")
            
            session = SessionToAgent(
                session_id=session_id,
                agent_id=agent_id,
                customer_id=customer_id,
                user_id=user_id,
                organization_id=organization_id,
                status=SessionStatus.OPEN,
                workflow_id=workflow_id
            )
            self.db.add(session)
            self.db.commit()
            self.db.refresh(session)
            return session
        except Exception as e:
            logger.error(f"Error creating session: {str(e)}")
            self.db.rollback()
            raise

    def get_session(self, session_id: UUID | str) -> Optional[SessionToAgent]:
        """Get session by ID"""
        try:
            if isinstance(session_id, str):
                session_id = UUID(session_id)
            return self.db.query(SessionToAgent).filter(
                SessionToAgent.session_id == session_id
            ).first()
        except Exception as e:
            logger.error(f"Error getting session: {str(e)}")
            return None

    def assign_user(self, session_id: UUID | str, user_id: UUID | str) -> bool:
        """Assign a user to a session"""
        try:
            session = self.get_session(session_id)
            if not session:
                return False
            
            # Convert string user_id to UUID if needed
            if isinstance(user_id, str):
                user_id = UUID(user_id)
            
            session.user_id = user_id
            session.status = SessionStatus.TRANSFERRED
            self.db.commit()
            return True
        except Exception as e:
            logger.error(f"Error assigning user to session: {str(e)}")
            self.db.rollback()
            return False

    def close_session(self, session_id: UUID | str) -> bool:
        """Close a session"""
        try:
            session = self.get_session(session_id)
            if not session:
                return False
            
            session.status = SessionStatus.CLOSED
            session.closed_at = datetime.utcnow()
            self.db.commit()
            return True
        except Exception as e:
            logger.error(f"Error closing session: {str(e)}")
            self.db.rollback()
            return False

    def get_agent_sessions(self, agent_id: UUID | str, status: SessionStatus = None) -> List[SessionToAgent]:
        """Get all sessions for an agent"""
        try:
            query = self.db.query(SessionToAgent).filter(
                SessionToAgent.agent_id == agent_id
            )
            if status:
                query = query.filter(SessionToAgent.status == status)
            return query.all()
        except Exception as e:
            logger.error(f"Error getting agent sessions: {str(e)}")
            return []

    def get_user_sessions(self, user_id: UUID | str, status: SessionStatus = None) -> List[SessionToAgent]:
        """Get all sessions assigned to a user"""
        try:
            query = self.db.query(SessionToAgent).filter(
                SessionToAgent.user_id == user_id
            )
            if status:
                query = query.filter(SessionToAgent.status == status)
            return query.all()
        except Exception as e:
            logger.error(f"Error getting user sessions: {str(e)}")
            return []

    def get_open_sessions(self) -> List[SessionToAgent]:
        """Get all open sessions"""
        try:
            return self.db.query(SessionToAgent).filter(
                SessionToAgent.status == SessionStatus.OPEN
            ).all()
        except Exception as e:
            logger.error(f"Error getting open sessions: {str(e)}")
            return []

    def get_customer_sessions(self, customer_id: UUID | str, status: SessionStatus = None) -> List[SessionToAgent]:
        """Get all sessions for a customer"""
        try:
            query = self.db.query(
                SessionToAgent,
                User.full_name.label('user_full_name'),
                User.profile_pic.label('user_profile_pic')
            ).outerjoin(
                User, SessionToAgent.user_id == User.id
            ).filter(
                SessionToAgent.customer_id == customer_id
            )
            if status:
                query = query.filter(SessionToAgent.status == status)

            return query.order_by(SessionToAgent.assigned_at.desc()).all()
        except Exception as e:
            logger.error(f"Error getting customer sessions: {str(e)}")
            return []

    def get_active_customer_session(self, customer_id: UUID | str, agent_id: UUID | str = None) -> Optional[SessionToAgent]:
        """Get active session for a customer"""
        try:
            query = self.db.query(SessionToAgent).filter(
                SessionToAgent.customer_id == customer_id,
                or_(
                    SessionToAgent.status == SessionStatus.OPEN,
                    SessionToAgent.status == SessionStatus.TRANSFERRED
                )
            )
            if agent_id:
                query = query.filter(SessionToAgent.agent_id == agent_id)
            
            return query.order_by(SessionToAgent.assigned_at.desc()).first()
        except Exception as e:
            logger.error(f"Error getting active customer session: {str(e)}")
            return None

    def get_agent_customer_sessions(self, agent_id: UUID | str, customer_id: UUID | str, status: SessionStatus = None) -> List[SessionToAgent]:
        """Get all sessions between an agent and customer"""
        try:
            query = self.db.query(SessionToAgent).filter(
                SessionToAgent.agent_id == agent_id,
                SessionToAgent.customer_id == customer_id
            )
            if status:
                query = query.filter(SessionToAgent.status == status)
            
            return query.order_by(SessionToAgent.assigned_at.desc()).all()
        except Exception as e:
            logger.error(f"Error getting agent-customer sessions: {str(e)}")
            return []

    def reopen_closed_session(self, session_id: UUID | str) -> bool:
        """Reopen a closed session"""
        try:
            session = self.get_session(session_id)
            if not session:
                return False
            
            if session.status == SessionStatus.CLOSED:
                session.status = SessionStatus.OPEN
                self.db.commit()
                return True
            return False  # Session was not closed
        except Exception as e:
            logger.error(f"Error reopening session: {str(e)}")
            self.db.rollback()
            return False
            
    def get_latest_customer_session(self, customer_id: UUID | str, agent_id: UUID | str = None) -> Optional[SessionToAgent]:
        """Get the latest session for a customer regardless of status"""
        try:
            query = self.db.query(SessionToAgent).filter(
                SessionToAgent.customer_id == customer_id
            )
            if agent_id:
                query = query.filter(SessionToAgent.agent_id == agent_id)
            
            return query.order_by(SessionToAgent.assigned_at.desc()).first()
        except Exception as e:
            logger.error(f"Error getting latest customer session: {str(e)}")
            return None

    def update_session(self, session_id: UUID | str, data: dict) -> bool:
        """Update a session"""
        try:
            session = self.get_session(session_id)
            if not session:
                logger.error(f"Session {session_id} not found for update")
                return False
            
            logger.info(f"Updating session {session_id} with data: {data}")
            
            # Direct assignment instead of setattr for better SQLAlchemy JSON handling
            if 'workflow_state' in data:
                session.workflow_state = data['workflow_state']
                logger.info(f"Set workflow_state = {data['workflow_state']}")
                
            if 'current_node_id' in data:
                session.current_node_id = data['current_node_id']
                logger.info(f"Set current_node_id = {data['current_node_id']}")
                
            # Handle other fields with setattr
            for key, value in data.items():
                if key not in ['workflow_state', 'current_node_id']:
                    setattr(session, key, value)
                    logger.info(f"Set {key} = {value}")
            
            # Mark the session as dirty to ensure SQLAlchemy tracks the changes
            self.db.flush()
            self.db.commit()
            
            # Verify the update by refreshing from database
            self.db.refresh(session)
            logger.info(f"Session after update - workflow_state: {session.workflow_state}")
            logger.info(f"Session after update - current_node_id: {session.current_node_id}")
            
            return True
        except Exception as e:
            logger.error(f"Error updating session: {str(e)}")
            self.db.rollback()
            return False

    def takeover_session(self, session_id: str, user_id: str) -> bool:
        """Take over a chat session"""
        try:
            session = self.get_session(session_id)
            if not session:
                return False

            # Check if session is already taken
            if session.user_id is not None:
                return False

            # Update session
            session.user_id = UUID(user_id)
            session.group_id = None  # Remove group assignment
            session.status = SessionStatus.OPEN  # Keep status as open
            
            self.db.commit()
            return True
            
        except Exception as e:
            logger.error(f"Error taking over session: {str(e)}")
            self.db.rollback()
            return False

    def reassign_session(self, session_id: str, to_user_id: str) -> bool:
        """Reassign a chat session to another user regardless of current assignee"""
        try:
            session = self.get_session(session_id)
            if not session:
                return False

            # Update assignment
            session.user_id = UUID(to_user_id)
            session.group_id = None
            session.status = SessionStatus.OPEN
            session.updated_at = datetime.utcnow()

            self.db.commit()
            return True
        except Exception as e:
            logger.error(f"Error reassigning session: {str(e)}")
            self.db.rollback()
            return False

    def update_workflow_state(self, session_id: UUID | str, current_node_id: Optional[UUID], workflow_state: dict) -> bool:
        """Update workflow state and current node for a session"""
        try:
            from sqlalchemy.orm.attributes import flag_modified
            
            session = self.get_session(session_id)
            if not session:
                logger.error(f"Session {session_id} not found for workflow state update")
                return False
            
            logger.info(f"Updating workflow state for session {session_id}")
            logger.info(f"Setting current_node_id to: {current_node_id}")
            logger.info(f"Setting workflow_state to: {workflow_state}")
            
            # Update fields
            session.current_node_id = current_node_id
            session.workflow_state = workflow_state.copy() if workflow_state else {}
            session.updated_at = datetime.utcnow()
            
            # Explicitly mark JSON field as modified for SQLAlchemy
            flag_modified(session, 'workflow_state')
            
            # Commit changes
            self.db.commit()
            self.db.refresh(session)
            
            # Verify the update
            logger.info(f"Verified - current_node_id: {session.current_node_id}")
            logger.info(f"Verified - workflow_state: {session.workflow_state}")
            
            return True
        except Exception as e:
            logger.error(f"Error updating workflow state: {str(e)}")
            self.db.rollback()
            return False

    def update_session_status(self, session_id: UUID | str, status: str) -> Optional[SessionToAgent]:
        """Update the status of a session"""
        try:
            session = self.db.query(SessionToAgent).filter(SessionToAgent.session_id == session_id).first()
            if not session:
                logger.error(f"Session {session_id} not found")
                return None
                
            # Convert string status to enum if needed
            if isinstance(status, str):
                try:
                    status = SessionStatus[status]
                except KeyError:
                    logger.error(f"Invalid session status: {status}")
                    return None
            
            session.status = status
            session.updated_at = datetime.utcnow()
            
            self.db.commit()
            self.db.refresh(session)
            logger.info(f"Updated session {session_id} status to {status}")
            return session
        except Exception as e:
            logger.error(f"Error updating session status: {str(e)}")
            self.db.rollback()
            return None

    def add_workflow_history_entry(self, session_id: UUID | str, node_id: UUID | str, entry_type: str, data: dict) -> bool:
        """Add an entry to the workflow history with proper multi-language Unicode support"""
        try:
            import json
            import copy
            from sqlalchemy.orm.attributes import flag_modified
            
            session = self.get_session(session_id)
            if not session:
                logger.error(f"Session {session_id} not found for workflow history update")
                return False
            
            # Initialize workflow_history if None
            if session.workflow_history is None:
                session.workflow_history = []
            
            # Create a deep copy of the data to avoid modifying the original
            data_copy = copy.deepcopy(data)
            
            # Create history entry
            history_entry = {
                "node_id": str(node_id),
                "type": entry_type,
                "timestamp": datetime.utcnow().isoformat(),
                "data": data_copy
            }
            
            # Convert to JSON with ensure_ascii=False to preserve Unicode characters
            # Then parse it back to ensure it's properly formatted for SQLAlchemy
            json_str = json.dumps(history_entry, ensure_ascii=False, separators=(',', ':'))
            unicode_safe_entry = json.loads(json_str)
            
            # Add to history
            session.workflow_history.append(unicode_safe_entry)
            
            # Mark as modified for SQLAlchemy
            flag_modified(session, 'workflow_history')
            
            # Commit changes
            self.db.commit()
            self.db.refresh(session)
            
            logger.info(f"Added workflow history entry for session {session_id}: {entry_type}")
            return True
        except Exception as e:
            logger.error(f"Error adding workflow history entry: {str(e)}")
            self.db.rollback()
            return False
    
    def get_workflow_history(self, session_id: UUID | str) -> list:
        """Get the workflow history for a session"""
        try:
            session = self.get_session(session_id)
            if not session:
                logger.error(f"Session {session_id} not found")
                return []
            
            return session.workflow_history or []
        except Exception as e:
            logger.error(f"Error getting workflow history: {str(e)}")
            return []
    
    def auto_close_inactive_agent_chats(self) -> int:
        """
        Auto-close chats that are handled by agents (not users) and have been inactive for more than 1 day.
        Returns the number of chats that were closed.
        """
        try:
            # Calculate the cutoff time (24 hours ago)
            cutoff_time = datetime.utcnow() - timedelta(days=1)
            
            # Find open sessions handled by agents (user_id is None) where the last message is older than 1 day
            sessions_to_close = (
                self.db.query(SessionToAgent)
                .join(
                    ChatHistory,
                    SessionToAgent.session_id == ChatHistory.session_id
                )
                .filter(
                    SessionToAgent.status == SessionStatus.OPEN,
                    SessionToAgent.user_id.is_(None),  # Handled by agent, not user
                    SessionToAgent.agent_id.is_not(None)  # Must have an agent assigned
                )
                .group_by(SessionToAgent.session_id)
                .having(
                    func.max(ChatHistory.created_at) < cutoff_time
                )
                .all()
            )
            
            closed_count = 0
            
            for session in sessions_to_close:
                try:
                    # Update session status to closed
                    session.status = SessionStatus.CLOSED
                    session.end_chat_reason = EndChatReasonType.ISSUE_RESOLVED
                    session.end_chat_description = "Inactive for more than one day"
                    session.updated_at = datetime.utcnow()
                    
                    closed_count += 1
                    logger.info(f"Auto-closed inactive chat session {session.session_id}")
                    
                except Exception as e:
                    logger.error(f"Error closing session {session.session_id}: {str(e)}")
                    continue
            
            # Commit all changes
            if closed_count > 0:
                self.db.commit()
                logger.info(f"Auto-closed {closed_count} inactive agent chats")
            
            return closed_count
            
        except Exception as e:
            logger.error(f"Error in auto_close_inactive_agent_chats: {str(e)}")
            self.db.rollback()
            return 0
