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
from datetime import datetime
from uuid import UUID, uuid4
from unittest.mock import patch, MagicMock
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from app.models.user import User
from app.models.role import Role
from app.models.permission import Permission, role_permissions
from app.models.agent import Agent, AgentType
from app.models.jira import AgentJiraConfig, JiraToken
from app.models.organization import Organization
from app.models.user import UserGroup
from app.core.security import get_password_hash
from app.repositories.jira import JiraRepository
from app.models.schemas.jira import AgentWithJiraConfig


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
        name="manage_jira",
        description="Can manage Jira integration"
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
def test_user_group(db: Session, test_organization_id: UUID) -> UserGroup:
    """Create a test user group"""
    group = UserGroup(
        id=uuid4(),
        name="Test Group",
        organization_id=test_organization_id,
        description="Test group for Jira tests"
    )
    db.add(group)
    db.commit()
    db.refresh(group)
    return group


@pytest.fixture
def test_agent(db: Session, test_organization_id: UUID, test_organization, test_user_group: UserGroup) -> Agent:
    """Create a test agent"""
    agent = Agent(
        id=uuid4(),
        organization_id=test_organization_id,
        name="Test Agent",
        display_name="Test Agent Display",
        description="Test agent description",
        instructions="Test instructions",
        tools='["jira"]',
        agent_type=AgentType.CUSTOMER_SUPPORT,
        is_default=False,
        is_active=True,
        transfer_to_human=False,
        ask_for_rating=True
    )
    db.add(agent)
    db.commit()
    db.refresh(agent)
    
    # Set up relationships manually since they might not be auto-loaded
    agent.organization = test_organization
    agent.groups = [test_user_group]
    
    return agent


@pytest.fixture
def test_agent_jira_config(db: Session, test_agent: Agent) -> AgentJiraConfig:
    """Create a test agent Jira configuration"""
    config = AgentJiraConfig(
        agent_id=str(test_agent.id),
        enabled=True,
        project_key="TEST",
        issue_type_id="10001"
    )
    db.add(config)
    db.commit()
    db.refresh(config)
    return config


@pytest.fixture
def test_jira_token(db: Session, test_organization_id: UUID) -> JiraToken:
    """Create a test Jira token"""
    token = JiraToken(
        organization_id=test_organization_id,
        access_token="test_access_token",
        refresh_token="test_refresh_token",
        token_type="Bearer",
        expires_at=datetime.utcnow(),
        cloud_id="test_cloud_id",
        site_url="https://test.atlassian.net"
    )
    db.add(token)
    db.commit()
    db.refresh(token)
    return token


@pytest.fixture
def jira_repo(db):
    """Create a Jira repository instance"""
    return JiraRepository(db)


class TestJiraRepository:
    """Test Jira repository functionality"""

    def test_get_agent_with_jira_config_success(self, jira_repo, test_agent, test_agent_jira_config):
        """Test successfully retrieving agent with Jira configuration"""
        result = jira_repo.get_agent_with_jira_config(str(test_agent.id))
        
        assert result is not None
        assert isinstance(result, AgentWithJiraConfig)
        assert result.id == test_agent.id
        assert result.name == test_agent.name
        assert result.display_name == test_agent.display_name
        assert result.description == test_agent.description
        assert result.instructions == test_agent.instructions
        assert result.tools == ["jira"]  # Parsed from JSON string
        assert result.agent_type == test_agent.agent_type
        assert result.is_default == test_agent.is_default
        assert result.is_active == test_agent.is_active
        assert result.organization_id == test_agent.organization_id
        assert result.transfer_to_human == test_agent.transfer_to_human
        assert result.ask_for_rating == test_agent.ask_for_rating
        
        # Check Jira-specific fields
        assert result.jira_enabled is True
        assert result.jira_project_key == "TEST"
        assert result.jira_issue_type_id == "10001"

    def test_get_agent_with_jira_config_uuid_input(self, jira_repo, test_agent, test_agent_jira_config):
        """Test retrieving agent with UUID input"""
        result = jira_repo.get_agent_with_jira_config(test_agent.id)
        
        assert result is not None
        assert result.id == test_agent.id
        assert result.jira_enabled is True

    def test_get_agent_with_jira_config_no_jira_config(self, jira_repo, test_agent):
        """Test retrieving agent without Jira configuration"""
        result = jira_repo.get_agent_with_jira_config(str(test_agent.id))
        
        assert result is not None
        assert isinstance(result, AgentWithJiraConfig)
        assert result.id == test_agent.id
        assert result.name == test_agent.name
        
        # Check default Jira fields
        assert result.jira_enabled is False
        assert result.jira_project_key is None
        assert result.jira_issue_type_id is None

    def test_get_agent_with_jira_config_nonexistent_agent(self, jira_repo):
        """Test retrieving nonexistent agent"""
        result = jira_repo.get_agent_with_jira_config(str(uuid4()))
        assert result is None

    def test_get_agent_with_jira_config_invalid_uuid(self, jira_repo):
        """Test retrieving agent with invalid UUID string"""
        result = jira_repo.get_agent_with_jira_config("invalid-uuid")
        assert result is None

    def test_get_agent_with_jira_config_empty_string(self, jira_repo):
        """Test retrieving agent with empty string"""
        result = jira_repo.get_agent_with_jira_config("")
        assert result is None

    def test_get_agent_with_jira_config_none_input(self, jira_repo):
        """Test retrieving agent with None input"""
        result = jira_repo.get_agent_with_jira_config(None)
        assert result is None

    @patch('app.repositories.jira.logger')
    def test_get_agent_with_jira_config_database_error(self, mock_logger, jira_repo):
        """Test agent retrieval with database error"""
        with patch.object(jira_repo.db, 'query', side_effect=SQLAlchemyError("DB Error")):
            result = jira_repo.get_agent_with_jira_config(str(uuid4()))
            assert result is None
            mock_logger.error.assert_called()

    @patch('app.repositories.jira.logger')
    def test_get_agent_with_jira_config_uuid_conversion_error(self, mock_logger, jira_repo):
        """Test agent retrieval with UUID conversion error"""
        result = jira_repo.get_agent_with_jira_config("not-a-valid-uuid")
        assert result is None
        mock_logger.error.assert_called()

    def test_get_agent_with_jira_config_disabled_jira(self, jira_repo, test_agent, db):
        """Test retrieving agent with disabled Jira configuration"""
        # Create disabled Jira config
        config = AgentJiraConfig(
            agent_id=str(test_agent.id),
            enabled=False,
            project_key="TEST",
            issue_type_id="10001"
        )
        db.add(config)
        db.commit()
        
        result = jira_repo.get_agent_with_jira_config(str(test_agent.id))
        
        assert result is not None
        assert result.jira_enabled is False
        assert result.jira_project_key == "TEST"  # Still populated even if disabled
        assert result.jira_issue_type_id == "10001"

    def test_get_agent_with_jira_config_partial_jira_config(self, jira_repo, test_agent, db):
        """Test retrieving agent with partial Jira configuration"""
        # Create config with only some fields
        config = AgentJiraConfig(
            agent_id=str(test_agent.id),
            enabled=True,
            project_key="TEST",
            issue_type_id=None  # Missing issue type
        )
        db.add(config)
        db.commit()
        
        result = jira_repo.get_agent_with_jira_config(str(test_agent.id))
        
        assert result is not None
        assert result.jira_enabled is True
        assert result.jira_project_key == "TEST"
        assert result.jira_issue_type_id is None

    def test_get_agent_with_jira_config_relationships_loaded(self, jira_repo, test_agent, test_agent_jira_config):
        """Test that agent relationships are properly loaded"""
        result = jira_repo.get_agent_with_jira_config(str(test_agent.id))
        
        assert result is not None
        # Check that relationships are included (even if empty lists)
        assert hasattr(result, 'groups')
        assert hasattr(result, 'organization')
        assert hasattr(result, 'knowledge')
        assert result.knowledge == []  # Default empty list

    def test_get_agent_with_jira_config_multiple_configs(self, jira_repo, test_agent, db):
        """Test retrieving agent when multiple Jira configs exist (should get first)"""
        # Create multiple configs (this shouldn't happen in practice, but test edge case)
        config1 = AgentJiraConfig(
            agent_id=str(test_agent.id),
            enabled=True,
            project_key="TEST1",
            issue_type_id="10001"
        )
        config2 = AgentJiraConfig(
            agent_id=str(test_agent.id),
            enabled=False,
            project_key="TEST2",
            issue_type_id="10002"
        )
        db.add(config1)
        db.add(config2)
        db.commit()
        
        result = jira_repo.get_agent_with_jira_config(str(test_agent.id))
        
        assert result is not None
        # Should get the first config found
        assert result.jira_enabled is True
        assert result.jira_project_key == "TEST1"
        assert result.jira_issue_type_id == "10001"

    def test_get_agent_with_jira_config_string_agent_id_in_config(self, jira_repo, test_agent, db):
        """Test that agent_id is properly converted to string for Jira config lookup"""
        # Create config with string agent_id
        config = AgentJiraConfig(
            agent_id=str(test_agent.id),  # Explicitly string
            enabled=True,
            project_key="TEST",
            issue_type_id="10001"
        )
        db.add(config)
        db.commit()
        
        # Test with both string and UUID inputs
        result1 = jira_repo.get_agent_with_jira_config(str(test_agent.id))
        result2 = jira_repo.get_agent_with_jira_config(test_agent.id)
        
        assert result1 is not None
        assert result2 is not None
        assert result1.jira_enabled is True
        assert result2.jira_enabled is True

    @patch('app.repositories.jira.logger')
    def test_get_agent_with_jira_config_exception_in_agent_data_creation(self, mock_logger, jira_repo, test_agent, db):
        """Test exception handling during AgentWithJiraConfig creation"""
        # Create a mock agent that will cause an exception during AgentWithJiraConfig creation
        with patch('app.repositories.jira.AgentWithJiraConfig', side_effect=Exception("Schema Error")):
            result = jira_repo.get_agent_with_jira_config(str(test_agent.id))
            assert result is None
            mock_logger.error.assert_called()

    def test_get_agent_with_jira_config_all_agent_fields_mapped(self, jira_repo, test_agent, test_agent_jira_config):
        """Test that all agent fields are properly mapped to AgentWithJiraConfig"""
        result = jira_repo.get_agent_with_jira_config(str(test_agent.id))

        assert result is not None

        # Verify all agent fields are mapped
        agent_fields = [
            'id', 'name', 'display_name', 'description', 'instructions',
            'agent_type', 'is_default', 'is_active',
            'organization_id', 'transfer_to_human', 'ask_for_rating'
        ]

        for field in agent_fields:
            assert hasattr(result, field)
            assert getattr(result, field) == getattr(test_agent, field)
        
        # Special check for tools field (parsed from JSON)
        assert hasattr(result, 'tools')
        assert result.tools == ["jira"]  # Parsed from JSON string

    def test_get_agent_with_jira_config_jira_fields_default_values(self, jira_repo, test_agent):
        """Test that Jira fields have correct default values when no config exists"""
        result = jira_repo.get_agent_with_jira_config(str(test_agent.id))
        
        assert result is not None
        assert result.jira_enabled is False
        assert result.jira_project_key is None
        assert result.jira_issue_type_id is None

    def test_get_agent_with_jira_config_knowledge_field_default(self, jira_repo, test_agent, test_agent_jira_config):
        """Test that knowledge field is set to empty list by default"""
        result = jira_repo.get_agent_with_jira_config(str(test_agent.id))
        
        assert result is not None
        assert result.knowledge == []
        assert isinstance(result.knowledge, list)


class TestJiraRepositoryErrorHandling:
    """Test error handling and edge cases"""

    @patch('app.repositories.jira.logger')
    def test_database_connection_error(self, mock_logger, jira_repo):
        """Test handling of database connection errors"""
        with patch.object(jira_repo.db, 'query', side_effect=SQLAlchemyError("Connection lost")):
            result = jira_repo.get_agent_with_jira_config(str(uuid4()))
            assert result is None
            mock_logger.error.assert_called_with("Error getting agent with Jira config: Connection lost")

    @patch('app.repositories.jira.logger')
    def test_invalid_uuid_format(self, mock_logger, jira_repo):
        """Test handling of various invalid UUID formats"""
        invalid_uuids = [
            "not-a-uuid",
            "12345",
            "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
            "123e4567-e89b-12d3-a456-42661417400",  # Too short
            "123e4567-e89b-12d3-a456-426614174000x",  # Too long
        ]
        
        for invalid_uuid in invalid_uuids:
            result = jira_repo.get_agent_with_jira_config(invalid_uuid)
            assert result is None
        
        # Should have logged errors for each invalid UUID
        assert mock_logger.error.call_count >= len(invalid_uuids)

    def test_empty_and_whitespace_inputs(self, jira_repo):
        """Test handling of empty and whitespace-only inputs"""
        inputs = ["", "   ", "\t", "\n", None]
        
        for input_val in inputs:
            result = jira_repo.get_agent_with_jira_config(input_val)
            assert result is None

    @patch('app.repositories.jira.logger')
    def test_query_timeout_simulation(self, mock_logger, jira_repo):
        """Test handling of query timeouts"""
        with patch.object(jira_repo.db, 'query', side_effect=SQLAlchemyError("Query timeout")):
            result = jira_repo.get_agent_with_jira_config(str(uuid4()))
            assert result is None
            mock_logger.error.assert_called()


class TestJiraRepositoryPerformance:
    """Test performance-related aspects"""

    def test_single_query_optimization(self, jira_repo, test_agent, test_agent_jira_config):
        """Test that the method uses optimized queries with proper joins"""
        with patch.object(jira_repo.db, 'query') as mock_query:
            # Set up the mock chain
            mock_query_result = MagicMock()
            mock_query_result.options.return_value.filter.return_value.first.return_value = test_agent
            mock_query.return_value = mock_query_result
            
            # Also mock the Jira config query
            mock_jira_query = MagicMock()
            mock_jira_query.filter.return_value.first.return_value = test_agent_jira_config
            
            # Set up side effect to return different mocks for different queries
            def query_side_effect(model):
                if model == Agent:
                    return mock_query_result
                elif model == AgentJiraConfig:
                    return mock_jira_query
                return MagicMock()
            
            mock_query.side_effect = query_side_effect
            
            result = jira_repo.get_agent_with_jira_config(str(test_agent.id))
            
            # Verify that query was called (optimization check)
            assert mock_query.called
            # Verify that joinedload was used for relationships
            mock_query_result.options.assert_called()

    def test_minimal_data_transfer(self, jira_repo, test_agent, test_agent_jira_config):
        """Test that only necessary data is loaded and transferred"""
        result = jira_repo.get_agent_with_jira_config(str(test_agent.id))
        
        assert result is not None
        # Verify that the result contains only the expected fields
        expected_fields = {
            'id', 'name', 'display_name', 'description', 'instructions',
            'tools', 'agent_type', 'is_default', 'is_active', 'organization_id',
            'transfer_to_human', 'ask_for_rating', 'groups', 'organization',
            'knowledge', 'jira_enabled', 'jira_project_key', 'jira_issue_type_id'
        }
        
        result_dict = result.dict()
        result_fields = set(result_dict.keys())
        
        # All expected fields should be present
        assert expected_fields.issubset(result_fields)


class TestJiraRepositoryDataIntegrity:
    """Test data integrity and consistency"""

    def test_agent_data_consistency(self, jira_repo, test_agent, test_agent_jira_config):
        """Test that agent data remains consistent between source and result"""
        result = jira_repo.get_agent_with_jira_config(str(test_agent.id))
        
        assert result is not None
        
        # Test all scalar fields for exact match
        scalar_fields = [
            'id', 'name', 'display_name', 'description', 'instructions',
            'agent_type', 'is_default', 'is_active', 'organization_id',
            'transfer_to_human', 'ask_for_rating'
        ]
        
        for field in scalar_fields:
            assert getattr(result, field) == getattr(test_agent, field), f"Field {field} mismatch"

    def test_jira_config_data_consistency(self, jira_repo, test_agent, test_agent_jira_config):
        """Test that Jira config data is consistently mapped"""
        result = jira_repo.get_agent_with_jira_config(str(test_agent.id))
        
        assert result is not None
        assert result.jira_enabled == test_agent_jira_config.enabled
        assert result.jira_project_key == test_agent_jira_config.project_key
        assert result.jira_issue_type_id == test_agent_jira_config.issue_type_id

    def test_tools_list_integrity(self, jira_repo, test_agent, test_agent_jira_config):
        """Test that tools list is properly handled"""
        result = jira_repo.get_agent_with_jira_config(str(test_agent.id))
        
        assert result is not None
        assert result.tools == ["jira"]  # Parsed from JSON string
        assert isinstance(result.tools, list)

    def test_boolean_field_integrity(self, jira_repo, test_agent, test_agent_jira_config):
        """Test that boolean fields maintain their types and values"""
        result = jira_repo.get_agent_with_jira_config(str(test_agent.id))
        
        assert result is not None
        
        # Test boolean fields
        boolean_fields = ['is_default', 'is_active', 'transfer_to_human', 'ask_for_rating', 'jira_enabled']
        
        for field in boolean_fields:
            value = getattr(result, field)
            assert isinstance(value, bool), f"Field {field} should be boolean, got {type(value)}"

    def test_uuid_field_integrity(self, jira_repo, test_agent, test_agent_jira_config):
        """Test that UUID fields maintain their types"""
        result = jira_repo.get_agent_with_jira_config(str(test_agent.id))
        
        assert result is not None
        assert isinstance(result.id, UUID)
        assert isinstance(result.organization_id, UUID)
        assert result.id == test_agent.id
        assert result.organization_id == test_agent.organization_id
