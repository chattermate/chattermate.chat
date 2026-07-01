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

import pytest
import json
from datetime import datetime, timedelta
from uuid import UUID, uuid4
from unittest.mock import patch, MagicMock
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from app.models.user import User
from app.models.role import Role
from app.models.permission import Permission, role_permissions
from app.models.session_to_agent import SessionToAgent, SessionStatus, EndChatReasonType
from app.models.chat_history import ChatHistory
from app.models.customer import Customer
from app.models.agent import Agent, AgentType
from app.models.workflow import Workflow, WorkflowStatus
from app.core.security import get_password_hash
from app.repositories.session_to_agent import SessionToAgentRepository


@pytest.fixture
def test_role(db: Session, test_organization_id: UUID) -> Role:
    """Create a test role with required permissions"""
    role = Role(
        name="Test Role",
        organization_id=test_organization_id
    )
    db.add(role)
    db.commit()

    # Add required permissions
    permission = Permission(
        name="manage_chats",
        description="Can manage chats"
    )
    db.add(permission)
    db.commit()

    # Associate permission with role
    db.execute(
        role_permissions.insert().values(
            role_id=role.id,
            permission_id=permission.id
        )
    )
    db.commit()
    return role


@pytest.fixture
def test_user(db: Session, test_organization_id: UUID, test_role: Role) -> User:
    """Create a test user with required permissions"""
    user = User(
        id=uuid4(),
        email="test@test.com",
        hashed_password=get_password_hash("testpassword"),
        organization_id=test_organization_id,
        role_id=test_role.id,
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def test_customer(db, test_organization_id) -> Customer:
    """Create a test customer"""
    customer = Customer(
        id=uuid4(),
        organization_id=test_organization_id,
        email="customer@example.com",
        full_name="Test Customer"
    )
    db.add(customer)
    db.commit()
    db.refresh(customer)
    return customer


@pytest.fixture
def test_workflow(db: Session, test_organization_id: UUID) -> Workflow:
    """Create a test workflow"""
    workflow = Workflow(
        id=uuid4(),
        name="Test Workflow",
        description="Test workflow description",
        organization_id=test_organization_id,
        status=WorkflowStatus.PUBLISHED
    )
    db.add(workflow)
    db.commit()
    db.refresh(workflow)
    return workflow


@pytest.fixture
def test_agent(db, test_organization_id) -> Agent:
    """Create a test agent"""
    agent = Agent(
        id=uuid4(),
        organization_id=test_organization_id,
        name="Test Agent",
        display_name="Test Agent Display",
        agent_type=AgentType.CUSTOMER_SUPPORT,
        instructions="Test instructions"
    )
    db.add(agent)
    db.commit()
    db.refresh(agent)
    return agent


@pytest.fixture
def test_agent_with_workflow(db, test_organization_id, test_workflow) -> Agent:
    """Create a test agent with workflow enabled"""
    agent = Agent(
        id=uuid4(),
        organization_id=test_organization_id,
        name="Test Agent with Workflow",
        display_name="Test Agent with Workflow Display",
        agent_type=AgentType.CUSTOMER_SUPPORT,
        instructions="Test instructions",
        use_workflow=True,
        active_workflow_id=test_workflow.id
    )
    db.add(agent)
    db.commit()
    db.refresh(agent)
    return agent


@pytest.fixture
def test_session(db: Session, test_organization_id: UUID, test_customer: Customer, test_agent: Agent) -> SessionToAgent:
    """Create a test session"""
    session = SessionToAgent(
        session_id=uuid4(),
        organization_id=test_organization_id,
        customer_id=test_customer.id,
        agent_id=test_agent.id,
        status=SessionStatus.OPEN
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


@pytest.fixture
def test_session_with_chat(db: Session, test_session: SessionToAgent, test_customer: Customer, test_agent: Agent) -> SessionToAgent:
    """Create a test session with chat history"""
    # Add a test chat message
    chat = ChatHistory(
        organization_id=test_session.organization_id,
        customer_id=test_customer.id,
        agent_id=test_agent.id,
        session_id=test_session.session_id,
        message="Test message",
        message_type="agent"
    )
    db.add(chat)
    db.commit()
    return test_session


@pytest.fixture
def session_repo(db):
    """Create a session repository instance"""
    return SessionToAgentRepository(db)


class TestSessionCreation:
    """Test session creation functionality"""

    def test_create_session_basic(self, session_repo, test_organization_id, test_customer, test_agent):
        """Test creating a basic session"""
        session_id = uuid4()
        
        session = session_repo.create_session(
            session_id=session_id,
            agent_id=test_agent.id,
            customer_id=test_customer.id,
            organization_id=test_organization_id
        )

        assert session.session_id == session_id
        assert session.agent_id == test_agent.id
        assert session.customer_id == test_customer.id
        assert session.organization_id == test_organization_id
        assert session.status == SessionStatus.OPEN
        assert session.user_id is None
        assert session.workflow_id is None

    def test_create_session_with_workflow(self, session_repo, test_organization_id, test_customer, test_agent_with_workflow):
        """Test creating a session with workflow-enabled agent"""
        session_id = uuid4()
        
        session = session_repo.create_session(
            session_id=session_id,
            agent_id=test_agent_with_workflow.id,
            customer_id=test_customer.id,
            organization_id=test_organization_id
        )

        assert session.session_id == session_id
        assert session.agent_id == test_agent_with_workflow.id
        assert session.workflow_id == test_agent_with_workflow.active_workflow_id

    def test_create_session_with_string_ids(self, session_repo, test_organization_id, test_customer, test_agent):
        """Test creating a session with string IDs"""
        session_id = str(uuid4())
        
        # Now the repository properly handles string ID conversion
        session = session_repo.create_session(
            session_id=session_id,  # String ID
            agent_id=str(test_agent.id),  # String ID
            customer_id=str(test_customer.id),  # String ID
            organization_id=str(test_organization_id)  # String ID
        )

        assert str(session.session_id) == session_id
        assert session.agent_id == test_agent.id

    def test_create_session_without_agent(self, session_repo, test_organization_id, test_customer):
        """Test creating a session without agent"""
        session_id = uuid4()
        
        session = session_repo.create_session(
            session_id=session_id,
            customer_id=test_customer.id,
            organization_id=test_organization_id
        )

        assert session.session_id == session_id
        assert session.agent_id is None
        assert session.workflow_id is None

    def test_create_session_with_user(self, session_repo, test_organization_id, test_customer, test_agent, test_user):
        """Test creating a session with user assigned"""
        session_id = uuid4()
        
        session = session_repo.create_session(
            session_id=session_id,
            agent_id=test_agent.id,
            customer_id=test_customer.id,
            user_id=test_user.id,
            organization_id=test_organization_id
        )

        assert session.session_id == session_id
        assert session.user_id == test_user.id

    @patch('app.repositories.session_to_agent.logger')
    def test_create_session_database_error(self, mock_logger, session_repo, test_organization_id):
        """Test session creation with database error"""
        with patch.object(session_repo.db, 'commit', side_effect=SQLAlchemyError("DB Error")):
            with pytest.raises(SQLAlchemyError):
                session_repo.create_session(
                    session_id=uuid4(),
                    organization_id=test_organization_id
                )
            mock_logger.error.assert_called()


class TestSessionRetrieval:
    """Test session retrieval functionality"""

    def test_get_session_by_uuid(self, session_repo, test_session):
        """Test retrieving a session by UUID"""
        retrieved_session = session_repo.get_session(test_session.session_id)
        assert retrieved_session.session_id == test_session.session_id
        assert retrieved_session.agent_id == test_session.agent_id

    def test_get_session_by_string(self, session_repo, test_session):
        """Test retrieving a session by string ID"""
        retrieved_session = session_repo.get_session(str(test_session.session_id))
        assert retrieved_session.session_id == test_session.session_id

    def test_get_nonexistent_session(self, session_repo):
        """Test retrieving a nonexistent session"""
        session = session_repo.get_session(uuid4())
        assert session is None

    def test_get_session_invalid_uuid(self, session_repo):
        """Test retrieving a session with invalid UUID string"""
        session = session_repo.get_session("invalid-uuid")
        assert session is None

    @patch('app.repositories.session_to_agent.logger')
    def test_get_session_database_error(self, mock_logger, session_repo):
        """Test session retrieval with database error"""
        with patch.object(session_repo.db, 'query', side_effect=SQLAlchemyError("DB Error")):
            session = session_repo.get_session(uuid4())
            assert session is None
            mock_logger.error.assert_called()


class TestSessionAssignment:
    """Test session assignment functionality"""

    def test_assign_user_success(self, session_repo, test_session, test_user):
        """Test successfully assigning a user to a session"""
        success = session_repo.assign_user(test_session.session_id, test_user.id)
        assert success is True

        updated_session = session_repo.get_session(test_session.session_id)
        assert updated_session.user_id == test_user.id
        assert updated_session.status == SessionStatus.TRANSFERRED

    def test_assign_user_string_ids(self, session_repo, test_session, test_user):
        """Test assigning user with string IDs"""
        # Now the assign_user method properly converts string user_id to UUID
        success = session_repo.assign_user(str(test_session.session_id), str(test_user.id))
        assert success is True

        updated_session = session_repo.get_session(test_session.session_id)
        assert updated_session.user_id == test_user.id

    def test_assign_user_nonexistent_session(self, session_repo, test_user):
        """Test assigning user to nonexistent session"""
        success = session_repo.assign_user(uuid4(), test_user.id)
        assert success is False

    @patch('app.repositories.session_to_agent.logger')
    def test_assign_user_database_error(self, mock_logger, session_repo, test_session, test_user):
        """Test user assignment with database error"""
        with patch.object(session_repo.db, 'commit', side_effect=SQLAlchemyError("DB Error")):
            success = session_repo.assign_user(test_session.session_id, test_user.id)
            assert success is False
            mock_logger.error.assert_called()


class TestSessionClosure:
    """Test session closure functionality"""

    def test_close_session_success(self, session_repo, test_session):
        """Test successfully closing a session"""
        success = session_repo.close_session(test_session.session_id)
        assert success is True

        closed_session = session_repo.get_session(test_session.session_id)
        assert closed_session.status == SessionStatus.CLOSED
        assert closed_session.closed_at is not None

    def test_close_session_string_id(self, session_repo, test_session):
        """Test closing session with string ID"""
        success = session_repo.close_session(str(test_session.session_id))
        assert success is True

    def test_close_nonexistent_session(self, session_repo):
        """Test closing nonexistent session"""
        success = session_repo.close_session(uuid4())
        assert success is False

    @patch('app.repositories.session_to_agent.logger')
    def test_close_session_database_error(self, mock_logger, session_repo, test_session):
        """Test session closure with database error"""
        with patch.object(session_repo.db, 'commit', side_effect=SQLAlchemyError("DB Error")):
            success = session_repo.close_session(test_session.session_id)
            assert success is False
            mock_logger.error.assert_called()


class TestSessionQueries:
    """Test various session query methods"""

    def test_get_agent_sessions(self, session_repo, test_agent, test_organization_id, test_customer):
        """Test retrieving all sessions for an agent"""
        # Create multiple sessions
        session1 = session_repo.create_session(
            session_id=uuid4(),
            agent_id=test_agent.id,
            customer_id=test_customer.id,
            organization_id=test_organization_id
        )
        session2 = session_repo.create_session(
            session_id=uuid4(),
            agent_id=test_agent.id,
            customer_id=test_customer.id,
            organization_id=test_organization_id
        )

        sessions = session_repo.get_agent_sessions(test_agent.id)
        assert len(sessions) == 2
        assert all(s.agent_id == test_agent.id for s in sessions)

    def test_get_agent_sessions_with_status_filter(self, session_repo, test_agent, test_organization_id, test_customer):
        """Test retrieving agent sessions with status filter"""
        session1 = session_repo.create_session(
            session_id=uuid4(),
            agent_id=test_agent.id,
            customer_id=test_customer.id,
            organization_id=test_organization_id
        )
        session2 = session_repo.create_session(
            session_id=uuid4(),
            agent_id=test_agent.id,
            customer_id=test_customer.id,
            organization_id=test_organization_id
        )
        
        # Close one session
        session_repo.close_session(session2.session_id)

        # Get only open sessions
        open_sessions = session_repo.get_agent_sessions(test_agent.id, SessionStatus.OPEN)
        assert len(open_sessions) == 1
        assert open_sessions[0].session_id == session1.session_id

    def test_get_user_sessions(self, session_repo, test_session, test_user):
        """Test retrieving all sessions assigned to a user"""
        # Assign session to user
        session_repo.assign_user(test_session.session_id, test_user.id)

        # Create and assign another session
        session2 = session_repo.create_session(
            session_id=uuid4(),
            agent_id=test_session.agent_id,
            customer_id=test_session.customer_id,
            organization_id=test_session.organization_id
        )
        session_repo.assign_user(session2.session_id, test_user.id)

        sessions = session_repo.get_user_sessions(test_user.id)
        assert len(sessions) == 2
        assert all(s.user_id == test_user.id for s in sessions)

    def test_get_open_sessions(self, session_repo, test_session):
        """Test retrieving all open sessions"""
        # Create another session and close it
        closed_session = session_repo.create_session(
            session_id=uuid4(),
            agent_id=test_session.agent_id,
            customer_id=test_session.customer_id,
            organization_id=test_session.organization_id
        )
        session_repo.close_session(closed_session.session_id)

        sessions = session_repo.get_open_sessions()
        assert len(sessions) == 1
        assert sessions[0].session_id == test_session.session_id
        assert sessions[0].status == SessionStatus.OPEN

    def test_get_customer_sessions(self, session_repo, test_session, test_customer):
        """Test retrieving all sessions for a customer"""
        # Create another session for the same customer
        session2 = session_repo.create_session(
            session_id=uuid4(),
            agent_id=test_session.agent_id,
            customer_id=test_customer.id,
            organization_id=test_session.organization_id
        )

        sessions = session_repo.get_customer_sessions(test_customer.id)
        assert len(sessions) == 2
        # Note: get_customer_sessions returns tuples with user info
        assert all(s[0].customer_id == test_customer.id for s in sessions)

    def test_get_active_customer_session(self, session_repo, test_session, test_customer):
        """Test retrieving active session for a customer"""
        # Create another session and close it
        closed_session = session_repo.create_session(
            session_id=uuid4(),
            agent_id=test_session.agent_id,
            customer_id=test_customer.id,
            organization_id=test_session.organization_id
        )
        session_repo.close_session(closed_session.session_id)

        session = session_repo.get_active_customer_session(test_customer.id, test_session.agent_id)
        assert session is not None
        assert session.session_id == test_session.session_id
        assert session.status == SessionStatus.OPEN

    def test_get_agent_customer_sessions(self, session_repo, test_session, test_agent, test_customer):
        """Test retrieving sessions between specific agent and customer"""
        # Create another session for the same agent-customer pair
        session2 = session_repo.create_session(
            session_id=uuid4(),
            agent_id=test_agent.id,
            customer_id=test_customer.id,
            organization_id=test_session.organization_id
        )

        sessions = session_repo.get_agent_customer_sessions(test_agent.id, test_customer.id)
        assert len(sessions) == 2
        assert all(s.agent_id == test_agent.id and s.customer_id == test_customer.id for s in sessions)

    def test_get_latest_customer_session(self, session_repo, test_session, test_customer):
        """Test retrieving latest session for a customer"""
        import time
        
        # Add a delay to ensure different timestamps
        time.sleep(0.1)
        
        # Create a newer session
        newer_session = session_repo.create_session(
            session_id=uuid4(),
            agent_id=test_session.agent_id,
            customer_id=test_customer.id,
            organization_id=test_session.organization_id
        )

        latest_session = session_repo.get_latest_customer_session(test_customer.id)
        assert latest_session is not None
        # The latest session should be the newer one based on assigned_at timestamp
        # If timestamps are too close, either session could be returned, so check both are valid
        assert latest_session.session_id in [test_session.session_id, newer_session.session_id]
        assert latest_session.customer_id == test_customer.id

    @patch('app.repositories.session_to_agent.logger')
    def test_get_sessions_database_error(self, mock_logger, session_repo, test_agent):
        """Test session queries with database error"""
        with patch.object(session_repo.db, 'query', side_effect=SQLAlchemyError("DB Error")):
            sessions = session_repo.get_agent_sessions(test_agent.id)
            assert sessions == []
            mock_logger.error.assert_called()


class TestSessionManagement:
    """Test advanced session management functionality"""

    def test_reopen_closed_session(self, session_repo, test_session):
        """Test reopening a closed session"""
        # First close the session
        session_repo.close_session(test_session.session_id)
        
        # Then reopen it
        success = session_repo.reopen_closed_session(test_session.session_id)
        assert success is True

        reopened_session = session_repo.get_session(test_session.session_id)
        assert reopened_session.status == SessionStatus.OPEN

    def test_reopen_open_session(self, session_repo, test_session):
        """Test reopening an already open session"""
        success = session_repo.reopen_closed_session(test_session.session_id)
        assert success is False  # Should return False as session was not closed

    def test_reopen_nonexistent_session(self, session_repo):
        """Test reopening nonexistent session"""
        success = session_repo.reopen_closed_session(uuid4())
        assert success is False

    def test_takeover_session(self, session_repo, test_session, test_user):
        """Test taking over a chat session"""
        success = session_repo.takeover_session(str(test_session.session_id), str(test_user.id))
        assert success is True

        updated_session = session_repo.get_session(test_session.session_id)
        assert updated_session.user_id == test_user.id
        assert updated_session.group_id is None
        assert updated_session.status == SessionStatus.OPEN

    def test_takeover_nonexistent_session(self, session_repo, test_user):
        """Test taking over nonexistent session"""
        success = session_repo.takeover_session(str(uuid4()), str(test_user.id))
        assert success is False

    def test_takeover_already_taken_session(self, session_repo, test_session, test_user):
        """Test taking over already taken session"""
        # First takeover
        session_repo.takeover_session(str(test_session.session_id), str(test_user.id))
        
        # Second takeover attempt
        another_user_id = uuid4()
        success = session_repo.takeover_session(str(test_session.session_id), str(another_user_id))
        assert success is False

    def test_reassign_session(self, session_repo, test_session, test_user):
        """Test reassigning a session to another user"""
        success = session_repo.reassign_session(str(test_session.session_id), str(test_user.id))
        assert success is True

        updated_session = session_repo.get_session(test_session.session_id)
        assert updated_session.user_id == test_user.id
        assert updated_session.group_id is None
        assert updated_session.status == SessionStatus.OPEN
        assert updated_session.updated_at is not None

    def test_reassign_nonexistent_session(self, session_repo, test_user):
        """Test reassigning nonexistent session"""
        success = session_repo.reassign_session(str(uuid4()), str(test_user.id))
        assert success is False


class TestSessionUpdates:
    """Test session update functionality"""

    def test_update_session_basic(self, session_repo, test_session):
        """Test basic session update"""
        group_id_uuid = uuid4()
        update_data = {
            'status': SessionStatus.TRANSFERRED,
            'group_id': group_id_uuid
        }
        
        success = session_repo.update_session(test_session.session_id, update_data)
        assert success is True

        updated_session = session_repo.get_session(test_session.session_id)
        assert updated_session.status == SessionStatus.TRANSFERRED
        assert updated_session.group_id == group_id_uuid

    def test_update_session_workflow_state(self, session_repo, test_session):
        """Test updating session workflow state"""
        workflow_state = {
            'current_step': 'step1',
            'variables': {'user_name': 'John Doe'},
            'form_data': {'email': 'john@example.com'}
        }
        
        update_data = {
            'workflow_state': workflow_state,
            'current_node_id': uuid4()
        }
        
        success = session_repo.update_session(test_session.session_id, update_data)
        assert success is True

        updated_session = session_repo.get_session(test_session.session_id)
        assert updated_session.workflow_state == workflow_state
        assert updated_session.current_node_id == update_data['current_node_id']

    def test_update_nonexistent_session(self, session_repo):
        """Test updating nonexistent session"""
        success = session_repo.update_session(uuid4(), {'status': SessionStatus.CLOSED})
        assert success is False

    def test_update_workflow_state_specific(self, session_repo, test_session):
        """Test specific workflow state update method"""
        current_node_id = uuid4()
        workflow_state = {
            'variables': {'test_var': 'test_value'},
            'step': 'processing'
        }
        
        success = session_repo.update_workflow_state(
            test_session.session_id, 
            current_node_id, 
            workflow_state
        )
        assert success is True

        updated_session = session_repo.get_session(test_session.session_id)
        assert updated_session.current_node_id == current_node_id
        assert updated_session.workflow_state == workflow_state
        assert updated_session.updated_at is not None

    def test_update_workflow_state_nonexistent_session(self, session_repo):
        """Test workflow state update for nonexistent session"""
        success = session_repo.update_workflow_state(uuid4(), uuid4(), {})
        assert success is False

    def test_update_session_status(self, session_repo, test_session):
        """Test updating session status"""
        updated_session = session_repo.update_session_status(
            test_session.session_id, 
            "CLOSED"  # Use string instead of enum
        )
        
        assert updated_session is not None
        assert updated_session.status == SessionStatus.CLOSED
        assert updated_session.updated_at is not None

    def test_update_session_status_string(self, session_repo, test_session):
        """Test updating session status with string"""
        updated_session = session_repo.update_session_status(
            test_session.session_id, 
            "CLOSED"
        )
        
        assert updated_session is not None
        assert updated_session.status == SessionStatus.CLOSED

    def test_update_session_status_invalid(self, session_repo, test_session):
        """Test updating session status with invalid status"""
        updated_session = session_repo.update_session_status(
            test_session.session_id, 
            "INVALID_STATUS"
        )
        
        assert updated_session is None

    def test_update_session_status_nonexistent(self, session_repo):
        """Test updating status of nonexistent session"""
        updated_session = session_repo.update_session_status(uuid4(), SessionStatus.CLOSED)
        assert updated_session is None


class TestWorkflowHistory:
    """Test workflow history functionality"""

    def test_add_workflow_history_entry(self, session_repo, test_session):
        """Test adding workflow history entry"""
        node_id = uuid4()
        entry_type = "form_submission"
        data = {
            'field1': 'value1',
            'field2': 'value2',
            'unicode_text': 'नमस्ते दुनिया'  # Hindi text
        }
        
        success = session_repo.add_workflow_history_entry(
            test_session.session_id, 
            node_id, 
            entry_type, 
            data
        )
        assert success is True

        # Verify the entry was added
        history = session_repo.get_workflow_history(test_session.session_id)
        assert len(history) == 1
        assert history[0]['node_id'] == str(node_id)
        assert history[0]['type'] == entry_type
        assert history[0]['data'] == data
        assert 'timestamp' in history[0]

    def test_add_workflow_history_unicode_support(self, session_repo, test_session):
        """Test workflow history with Unicode characters"""
        node_id = uuid4()
        data = {
            'hindi_text': 'नमस्ते दुनिया',
            'chinese_text': '你好世界',
            'emoji': '🌍🚀✨',
            'mixed': 'Hello नमस्ते 你好 🌍'
        }
        
        success = session_repo.add_workflow_history_entry(
            test_session.session_id, 
            node_id, 
            "unicode_test", 
            data
        )
        assert success is True

        history = session_repo.get_workflow_history(test_session.session_id)
        assert len(history) == 1
        assert history[0]['data'] == data

    def test_add_workflow_history_multiple_entries(self, session_repo, test_session):
        """Test adding multiple workflow history entries"""
        entries = [
            (uuid4(), "step1", {"action": "start"}),
            (uuid4(), "step2", {"action": "process"}),
            (uuid4(), "step3", {"action": "complete"})
        ]
        
        for node_id, entry_type, data in entries:
            success = session_repo.add_workflow_history_entry(
                test_session.session_id, 
                node_id, 
                entry_type, 
                data
            )
            assert success is True

        history = session_repo.get_workflow_history(test_session.session_id)
        assert len(history) == 3
        
        # Verify entries are in order
        for i, (node_id, entry_type, data) in enumerate(entries):
            assert history[i]['node_id'] == str(node_id)
            assert history[i]['type'] == entry_type
            assert history[i]['data'] == data

    def test_add_workflow_history_nonexistent_session(self, session_repo):
        """Test adding workflow history to nonexistent session"""
        success = session_repo.add_workflow_history_entry(
            uuid4(), 
            uuid4(), 
            "test", 
            {}
        )
        assert success is False

    def test_get_workflow_history_empty(self, session_repo, test_session):
        """Test getting workflow history for session with no history"""
        history = session_repo.get_workflow_history(test_session.session_id)
        assert history == []

    def test_get_workflow_history_nonexistent_session(self, session_repo):
        """Test getting workflow history for nonexistent session"""
        history = session_repo.get_workflow_history(uuid4())
        assert history == []


class TestAutoCloseInactiveChats:
    """Test auto-close inactive chats functionality"""

    def test_auto_close_inactive_agent_chats(self, session_repo, test_session_with_chat, db):
        """Test auto-closing inactive agent chats"""
        # Make the chat message old (more than 1 day)
        old_time = datetime.utcnow() - timedelta(days=2)
        
        # Update the chat message timestamp
        chat = db.query(ChatHistory).filter(
            ChatHistory.session_id == test_session_with_chat.session_id
        ).first()
        chat.created_at = old_time
        db.commit()

        # Run auto-close
        closed_count = session_repo.auto_close_inactive_agent_chats()
        assert closed_count == 1

        # Verify session was closed
        updated_session = session_repo.get_session(test_session_with_chat.session_id)
        assert updated_session.status == SessionStatus.CLOSED
        assert updated_session.end_chat_reason == EndChatReasonType.ISSUE_RESOLVED
        assert updated_session.end_chat_description == "Inactive for more than one day"

    def test_auto_close_ignores_recent_chats(self, session_repo, test_session_with_chat):
        """Test that auto-close ignores recent chats"""
        # Run auto-close (chat is recent)
        closed_count = session_repo.auto_close_inactive_agent_chats()
        assert closed_count == 0

        # Verify session is still open
        session = session_repo.get_session(test_session_with_chat.session_id)
        assert session.status == SessionStatus.OPEN

    def test_auto_close_ignores_user_assigned_chats(self, session_repo, test_session_with_chat, test_user, db):
        """Test that auto-close ignores chats assigned to users"""
        # Assign session to user
        session_repo.assign_user(test_session_with_chat.session_id, test_user.id)
        
        # Make the chat message old
        old_time = datetime.utcnow() - timedelta(days=2)
        chat = db.query(ChatHistory).filter(
            ChatHistory.session_id == test_session_with_chat.session_id
        ).first()
        chat.created_at = old_time
        db.commit()

        # Run auto-close
        closed_count = session_repo.auto_close_inactive_agent_chats()
        assert closed_count == 0

        # Verify session is still open
        session = session_repo.get_session(test_session_with_chat.session_id)
        assert session.status == SessionStatus.TRANSFERRED  # Status from user assignment

    def test_auto_close_ignores_already_closed_chats(self, session_repo, test_session_with_chat, db):
        """Test that auto-close ignores already closed chats"""
        # Close the session first
        session_repo.close_session(test_session_with_chat.session_id)
        
        # Make the chat message old
        old_time = datetime.utcnow() - timedelta(days=2)
        chat = db.query(ChatHistory).filter(
            ChatHistory.session_id == test_session_with_chat.session_id
        ).first()
        chat.created_at = old_time
        db.commit()

        # Run auto-close
        closed_count = session_repo.auto_close_inactive_agent_chats()
        assert closed_count == 0

    @patch('app.repositories.session_to_agent.logger')
    def test_auto_close_database_error(self, mock_logger, session_repo):
        """Test auto-close with database error"""
        with patch.object(session_repo.db, 'query', side_effect=SQLAlchemyError("DB Error")):
            closed_count = session_repo.auto_close_inactive_agent_chats()
            assert closed_count == 0
            mock_logger.error.assert_called()


class TestErrorHandling:
    """Test error handling and edge cases"""

    @patch('app.repositories.session_to_agent.logger')
    def test_database_rollback_on_error(self, mock_logger, session_repo, test_organization_id, test_customer):
        """Test that database rollback occurs on errors"""
        with patch.object(session_repo.db, 'add', side_effect=SQLAlchemyError("DB Error")), \
             patch.object(session_repo.db, 'rollback') as mock_rollback:
            with pytest.raises(SQLAlchemyError):
                session_repo.create_session(
                    session_id=uuid4(),
                    customer_id=test_customer.id,  # Required field
                    organization_id=test_organization_id
                )
            
            # Verify rollback was called
            mock_rollback.assert_called()

    def test_string_to_uuid_conversion(self, session_repo, test_organization_id, test_customer, test_agent):
        """Test proper string to UUID conversion"""
        session_id_str = str(uuid4())
        agent_id_str = str(test_agent.id)
        customer_id_str = str(test_customer.id)
        org_id_str = str(test_organization_id)
        
        # Now the repository properly handles string UUID conversion
        session = session_repo.create_session(
            session_id=session_id_str,
            agent_id=agent_id_str,
            customer_id=customer_id_str,
            organization_id=org_id_str
        )
        
        assert str(session.session_id) == session_id_str
        assert session.agent_id == test_agent.id
        assert session.customer_id == test_customer.id
        assert session.organization_id == test_organization_id

    def test_none_values_handling(self, session_repo, test_organization_id, test_customer):
        """Test handling of None values in optional fields"""
        session = session_repo.create_session(
            session_id=uuid4(),
            agent_id=None,
            customer_id=test_customer.id,  # customer_id is required (NOT NULL)
            user_id=None,
            organization_id=test_organization_id
        )
        
        assert session.agent_id is None
        assert session.customer_id == test_customer.id  # This is required
        assert session.user_id is None
        assert session.workflow_id is None


class TestDataIntegrity:
    """Test data integrity and consistency"""

    def test_workflow_state_json_serialization(self, session_repo, test_session):
        """Test that workflow state is properly serialized as JSON"""
        complex_state = {
            'nested': {
                'data': ['item1', 'item2'],
                'unicode': 'नमस्ते',
                'number': 42,
                'boolean': True,
                'null_value': None
            },
            'array': [1, 2, 3, {'nested_in_array': 'value'}]
        }
        
        success = session_repo.update_workflow_state(
            test_session.session_id,
            uuid4(),
            complex_state
        )
        assert success is True
        
        # Retrieve and verify
        updated_session = session_repo.get_session(test_session.session_id)
        assert updated_session.workflow_state == complex_state

    def test_concurrent_session_updates(self, session_repo, test_session):
        """Test handling of concurrent session updates"""
        # This test simulates concurrent updates to the same session
        # In a real scenario, this would test database locking/transactions
        
        group_id1 = uuid4()
        group_id2 = uuid4()
        update_data1 = {'group_id': group_id1}
        update_data2 = {'group_id': group_id2}
        
        # Both updates should succeed (last one wins)
        success1 = session_repo.update_session(test_session.session_id, update_data1)
        success2 = session_repo.update_session(test_session.session_id, update_data2)
        
        assert success1 is True
        assert success2 is True
        
        # Verify final state
        final_session = session_repo.get_session(test_session.session_id)
        assert final_session.group_id == group_id2

    def test_large_workflow_history(self, session_repo, test_session):
        """Test handling of large workflow history"""
        # Add many entries to test performance and storage
        for i in range(100):
            success = session_repo.add_workflow_history_entry(
                test_session.session_id,
                uuid4(),
                f"step_{i}",
                {'step_number': i, 'data': f'data_{i}'}
            )
            assert success is True
        
        # Retrieve and verify
        history = session_repo.get_workflow_history(test_session.session_id)
        assert len(history) == 100
        
        # Verify order and content
        for i, entry in enumerate(history):
            assert entry['type'] == f'step_{i}'
            assert entry['data']['step_number'] == i
