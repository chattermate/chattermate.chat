"""
ChatterMate - Test Workflow Node Service
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

import pytest
from unittest.mock import Mock, MagicMock, patch
from uuid import uuid4, UUID
from datetime import datetime

from app.services.workflow_node import WorkflowNodeService, sanitize_utf8_text
from app.models.workflow_node import WorkflowNode, NodeType
from app.models.workflow_connection import WorkflowConnection
from app.models.workflow import Workflow, WorkflowStatus


@pytest.fixture
def mock_db():
    """Create a mock database session."""
    db = MagicMock()
    db.add = MagicMock()
    db.commit = MagicMock()
    db.refresh = MagicMock()
    db.delete = MagicMock()
    db.rollback = MagicMock()
    db.query = MagicMock()
    return db


@pytest.fixture
def test_organization_id():
    """Create a test organization ID."""
    return uuid4()


@pytest.fixture
def test_user_id():
    """Create a test user ID."""
    return uuid4()


@pytest.fixture
def test_workflow(test_organization_id, test_user_id):
    """Create a mock workflow."""
    workflow = Mock(spec=Workflow)
    workflow.id = uuid4()
    workflow.name = "Test Workflow"
    workflow.description = "Test workflow"
    workflow.status = WorkflowStatus.PUBLISHED
    workflow.version = 1
    workflow.is_template = False
    workflow.default_language = "en"
    workflow.canvas_data = {
        "nodes": [
            {
                "id": "start",
                "type": "message",
                "data": {"label": "Start"}
            }
        ]
    }
    workflow.settings = {}
    workflow.organization_id = test_organization_id
    workflow.created_by = test_user_id
    workflow.nodes = []  # Empty list for node iteration
    return workflow


@pytest.fixture
def test_workflow_node(test_workflow):
    """Create a mock workflow node."""
    node = Mock(spec=WorkflowNode)
    node.id = uuid4()
    node.workflow_id = test_workflow.id
    node.node_type = NodeType.MESSAGE
    node.name = "Start Node"
    node.description = None
    node.position_x = 100
    node.position_y = 100
    node.config = {"label": "Start Node"}
    node.created_at = datetime.utcnow()
    node.updated_at = datetime.utcnow()
    node.workflow = test_workflow
    node.outgoing_connections = []
    node.incoming_connections = []
    return node


@pytest.fixture
def test_workflow_connection(test_workflow):
    """Create a mock workflow connection."""
    source_node = Mock(spec=WorkflowNode)
    source_node.id = uuid4()
    source_node.workflow_id = test_workflow.id
    source_node.node_type = NodeType.MESSAGE
    source_node.name = "Source Node"

    target_node = Mock(spec=WorkflowNode)
    target_node.id = uuid4()
    target_node.workflow_id = test_workflow.id
    target_node.node_type = NodeType.END
    target_node.name = "Target Node"

    connection = Mock(spec=WorkflowConnection)
    connection.id = uuid4()
    connection.workflow_id = test_workflow.id
    connection.source_node_id = source_node.id
    connection.target_node_id = target_node.id
    connection.label = "Test Connection"

    return connection


@pytest.fixture
def workflow_node_service(mock_db):
    """Create WorkflowNodeService instance with mocked repositories."""
    with patch('app.services.workflow_node.WorkflowNodeRepository') as MockNodeRepo, \
         patch('app.services.workflow_node.WorkflowRepository') as MockWorkflowRepo:

        mock_node_repo = MagicMock()
        mock_workflow_repo = MagicMock()
        MockNodeRepo.return_value = mock_node_repo
        MockWorkflowRepo.return_value = mock_workflow_repo

        service = WorkflowNodeService(mock_db)
        service.node_repo = mock_node_repo
        service.workflow_repo = mock_workflow_repo

        return service


class TestSanitizeUtf8Text:
    """Test the sanitize_utf8_text utility function"""

    def test_sanitize_utf8_text_normal_text(self):
        """Test sanitization with normal text"""
        text = "Hello World"
        result = sanitize_utf8_text(text)
        assert result == "Hello World"

    def test_sanitize_utf8_text_with_surrogates(self):
        """Test sanitization with surrogate characters"""
        text = "Hello\udcac\udd16World"
        result = sanitize_utf8_text(text)
        assert result == "HelloWorld"

    def test_sanitize_utf8_text_empty_string(self):
        """Test sanitization with empty string"""
        text = ""
        result = sanitize_utf8_text(text)
        assert result == ""

    def test_sanitize_utf8_text_none(self):
        """Test sanitization with None"""
        text = None
        result = sanitize_utf8_text(text)
        assert result is None

    def test_sanitize_utf8_text_with_unicode_error(self):
        """Test sanitization when unicode error occurs during encoding"""
        # Test with a string that will trigger the UnicodeError exception handling
        text = "test with unicode issues"

        # Test that the function handles encoding errors gracefully by testing the fallback path
        # We create a mock that will fail on encode but allow re.sub to work
        with patch('app.services.workflow_node.re.sub', side_effect=lambda pattern, replacement, text: text):
            # Use a text object that will raise UnicodeError when encode() is called
            class MockString(str):
                def encode(self, encoding='utf-8', errors='strict'):
                    if errors == 'ignore':
                        return b'fallback_text'
                    else:
                        raise UnicodeError("Mock encoding error")

                def decode(self, encoding='utf-8'):
                    return "fallback_text"

            mock_text = MockString(text)
            result = sanitize_utf8_text(mock_text)

            # Function should handle the error gracefully and return a string
            assert isinstance(result, str)


class TestWorkflowNodeService:

    def test_workflow_node_created_successfully(self, test_workflow_node, test_workflow):
        """Test that workflow node has the right properties"""
        assert test_workflow_node.workflow_id == test_workflow.id
        assert test_workflow_node.node_type == NodeType.MESSAGE
        assert test_workflow_node.name == "Start Node"
        assert test_workflow_node.position_x == 100
        assert test_workflow_node.position_y == 100

    def test_node_type_enum_values(self):
        """Test that NodeType enum has the expected values"""
        assert hasattr(NodeType, 'MESSAGE')
        assert hasattr(NodeType, 'LLM')
        assert hasattr(NodeType, 'CONDITION')
        assert hasattr(NodeType, 'FORM')
        assert hasattr(NodeType, 'ACTION')
        assert hasattr(NodeType, 'HUMAN_TRANSFER')
        assert hasattr(NodeType, 'WAIT')
        assert hasattr(NodeType, 'END')
        assert hasattr(NodeType, 'LANDING_PAGE')

    def test_workflow_node_service_initialization(self, workflow_node_service):
        """Test that WorkflowNodeService can be initialized"""
        assert workflow_node_service is not None
        assert hasattr(workflow_node_service, 'db')

    def test_workflow_node_model_fields(self, test_workflow_node):
        """Test that WorkflowNode model has expected fields"""
        assert hasattr(test_workflow_node, 'id')
        assert hasattr(test_workflow_node, 'workflow_id')
        assert hasattr(test_workflow_node, 'node_type')
        assert hasattr(test_workflow_node, 'name')
        assert hasattr(test_workflow_node, 'description')
        assert hasattr(test_workflow_node, 'position_x')
        assert hasattr(test_workflow_node, 'position_y')
        assert hasattr(test_workflow_node, 'config')
        assert hasattr(test_workflow_node, 'created_at')
        assert hasattr(test_workflow_node, 'updated_at')

    def test_workflow_node_relationships(self, test_workflow_node):
        """Test that WorkflowNode model has expected relationships"""
        assert hasattr(test_workflow_node, 'workflow')
        assert hasattr(test_workflow_node, 'outgoing_connections')
        assert hasattr(test_workflow_node, 'incoming_connections')

    def test_workflow_node_config_structure(self, test_workflow_node):
        """Test that the workflow node config is properly structured"""
        assert isinstance(test_workflow_node.config, dict)
        assert test_workflow_node.config.get("label") == "Start Node"

    def test_get_workflow_nodes_and_connections_success(
        self, workflow_node_service, test_workflow, test_organization_id
    ):
        """Test getting workflow nodes and connections successfully"""
        workflow_node_service.workflow_repo.get_by_id.return_value = test_workflow
        workflow_node_service.node_repo.get_nodes_by_workflow.return_value = []
        workflow_node_service.node_repo.get_connections_by_workflow.return_value = []

        result = workflow_node_service.get_workflow_nodes_and_connections(
            test_workflow.id, test_organization_id
        )

        assert "nodes" in result
        assert "connections" in result
        assert isinstance(result["nodes"], list)
        assert isinstance(result["connections"], list)

    def test_get_workflow_nodes_and_connections_workflow_not_found(
        self, workflow_node_service, test_organization_id
    ):
        """Test getting workflow nodes and connections with non-existent workflow"""
        workflow_node_service.workflow_repo.get_by_id.return_value = None
        non_existent_id = uuid4()

        with pytest.raises(ValueError, match="Workflow not found"):
            workflow_node_service.get_workflow_nodes_and_connections(
                non_existent_id, test_organization_id
            )

    def test_get_workflow_nodes_and_connections_wrong_organization(
        self, workflow_node_service, test_workflow
    ):
        """Test getting workflow nodes and connections with wrong organization"""
        workflow_node_service.workflow_repo.get_by_id.return_value = test_workflow
        wrong_org_id = uuid4()

        with pytest.raises(ValueError, match="Workflow does not belong to your organization"):
            workflow_node_service.get_workflow_nodes_and_connections(
                test_workflow.id, wrong_org_id
            )

    def test_update_single_node_success(
        self, workflow_node_service, test_workflow_node, test_workflow, test_organization_id
    ):
        """Test updating a single node successfully"""
        test_workflow.organization_id = test_organization_id
        workflow_node_service.workflow_repo.get_by_id.return_value = test_workflow
        workflow_node_service.node_repo.get_node_by_id.return_value = test_workflow_node

        updated_node = Mock(spec=WorkflowNode)
        updated_node.name = "Updated Node Name"
        updated_node.description = "Updated description"
        workflow_node_service.node_repo.update_node.return_value = updated_node

        update_data = {
            "name": "Updated Node Name",
            "description": "Updated description",
            "config": {"new_field": "new_value"}
        }

        result = workflow_node_service.update_single_node(
            test_workflow_node.workflow_id,
            test_workflow_node.id,
            update_data,
            test_organization_id
        )

        assert result is not None
        assert result.name == "Updated Node Name"
        assert result.description == "Updated description"

    def test_update_single_node_workflow_not_found(
        self, workflow_node_service, test_workflow_node, test_organization_id
    ):
        """Test updating node with non-existent workflow"""
        workflow_node_service.workflow_repo.get_by_id.return_value = None
        non_existent_workflow_id = uuid4()

        with pytest.raises(ValueError, match="Workflow not found"):
            workflow_node_service.update_single_node(
                non_existent_workflow_id,
                test_workflow_node.id,
                {"name": "New Name"},
                test_organization_id
            )

    def test_update_single_node_wrong_organization(
        self, workflow_node_service, test_workflow_node, test_workflow
    ):
        """Test updating node with wrong organization"""
        workflow_node_service.workflow_repo.get_by_id.return_value = test_workflow
        wrong_org_id = uuid4()

        with pytest.raises(ValueError, match="Workflow does not belong to your organization"):
            workflow_node_service.update_single_node(
                test_workflow_node.workflow_id,
                test_workflow_node.id,
                {"name": "New Name"},
                wrong_org_id
            )

    def test_update_single_node_node_not_found(
        self, workflow_node_service, test_workflow, test_organization_id
    ):
        """Test updating non-existent node"""
        test_workflow.organization_id = test_organization_id
        workflow_node_service.workflow_repo.get_by_id.return_value = test_workflow
        workflow_node_service.node_repo.get_node_by_id.return_value = None
        non_existent_node_id = uuid4()

        with pytest.raises(ValueError, match="Node not found"):
            workflow_node_service.update_single_node(
                test_workflow.id,
                non_existent_node_id,
                {"name": "New Name"},
                test_organization_id
            )

    def test_update_single_node_wrong_workflow(
        self, workflow_node_service, test_workflow_node, test_workflow, test_organization_id
    ):
        """Test updating node that belongs to different workflow"""
        test_workflow.organization_id = test_organization_id
        workflow_node_service.workflow_repo.get_by_id.return_value = test_workflow

        # Create a node that belongs to a different workflow
        node_from_other_workflow = Mock(spec=WorkflowNode)
        node_from_other_workflow.id = uuid4()
        node_from_other_workflow.workflow_id = uuid4()  # Different workflow
        workflow_node_service.node_repo.get_node_by_id.return_value = node_from_other_workflow

        with pytest.raises(ValueError, match="Node does not belong to this workflow"):
            workflow_node_service.update_single_node(
                test_workflow.id,
                node_from_other_workflow.id,
                {"name": "New Name"},
                test_organization_id
            )

    def test_get_single_node_success(
        self, workflow_node_service, test_workflow_node, test_workflow, test_organization_id
    ):
        """Test getting a single node successfully"""
        test_workflow.organization_id = test_organization_id
        test_workflow_node.workflow_id = test_workflow.id
        workflow_node_service.workflow_repo.get_by_id.return_value = test_workflow
        workflow_node_service.node_repo.get_node_by_id.return_value = test_workflow_node

        result = workflow_node_service.get_single_node(
            test_workflow_node.workflow_id,
            test_workflow_node.id,
            test_organization_id
        )

        assert result is not None
        assert result.id == test_workflow_node.id
        assert result.name == test_workflow_node.name

    def test_get_single_node_workflow_not_found(
        self, workflow_node_service, test_workflow_node, test_organization_id
    ):
        """Test getting node with non-existent workflow"""
        workflow_node_service.workflow_repo.get_by_id.return_value = None
        non_existent_workflow_id = uuid4()

        with pytest.raises(ValueError, match="Workflow not found"):
            workflow_node_service.get_single_node(
                non_existent_workflow_id,
                test_workflow_node.id,
                test_organization_id
            )

    def test_get_single_node_wrong_organization(
        self, workflow_node_service, test_workflow_node, test_workflow
    ):
        """Test getting node with wrong organization"""
        workflow_node_service.workflow_repo.get_by_id.return_value = test_workflow
        wrong_org_id = uuid4()

        with pytest.raises(ValueError, match="Workflow does not belong to your organization"):
            workflow_node_service.get_single_node(
                test_workflow_node.workflow_id,
                test_workflow_node.id,
                wrong_org_id
            )

    def test_get_single_node_node_not_found(
        self, workflow_node_service, test_workflow, test_organization_id
    ):
        """Test getting non-existent node"""
        test_workflow.organization_id = test_organization_id
        workflow_node_service.workflow_repo.get_by_id.return_value = test_workflow
        workflow_node_service.node_repo.get_node_by_id.return_value = None
        non_existent_node_id = uuid4()

        with pytest.raises(ValueError, match="Node not found"):
            workflow_node_service.get_single_node(
                test_workflow.id,
                non_existent_node_id,
                test_organization_id
            )

    def test_replace_workflow_nodes_and_connections_success(
        self, workflow_node_service, test_workflow, test_organization_id
    ):
        """Test replacing workflow nodes and connections successfully"""
        test_workflow.organization_id = test_organization_id
        workflow_node_service.workflow_repo.get_by_id.return_value = test_workflow
        workflow_node_service.node_repo.get_connections_by_workflow.return_value = []
        workflow_node_service.node_repo.get_nodes_by_workflow.return_value = []

        # Mock node creation
        created_nodes = []
        def mock_create_node(**kwargs):
            node = Mock(spec=WorkflowNode)
            node.id = kwargs.get('id', uuid4())
            node.name = kwargs.get('name', 'Node')
            node.node_type = kwargs.get('node_type', NodeType.MESSAGE)
            node.config = kwargs.get('config', {})
            created_nodes.append(node)
            return node

        workflow_node_service.node_repo.create_node.side_effect = mock_create_node

        # Mock connection creation
        created_connections = []
        def mock_create_connection(**kwargs):
            conn = Mock(spec=WorkflowConnection)
            conn.id = kwargs.get('id', uuid4())
            conn.source_node_id = kwargs.get('source_node_id')
            conn.target_node_id = kwargs.get('target_node_id')
            conn.label = kwargs.get('label')
            created_connections.append(conn)
            return conn

        workflow_node_service.node_repo.create_connection.side_effect = mock_create_connection

        # After creation, return the created items
        def get_final_nodes(workflow_id):
            return created_nodes

        def get_final_connections(workflow_id):
            return created_connections

        # Override returns for final fetch
        workflow_node_service.node_repo.get_nodes_by_workflow.side_effect = [[], get_final_nodes(test_workflow.id)]
        workflow_node_service.node_repo.get_connections_by_workflow.side_effect = [[], get_final_connections(test_workflow.id)]

        nodes_data = [
            {
                "id": str(uuid4()),
                "node_type": "message",
                "name": "Test Message Node",
                "position_x": 100,
                "position_y": 100,
                "message_text": "Hello World",
                "config": {}
            },
            {
                "id": str(uuid4()),
                "node_type": "end",
                "name": "Test End Node",
                "position_x": 200,
                "position_y": 200,
                "final_message": "Goodbye",
                "config": {}
            }
        ]

        connections_data = [
            {
                "id": str(uuid4()),
                "source_node_id": nodes_data[0]["id"],
                "target_node_id": nodes_data[1]["id"],
                "label": "Next"
            }
        ]

        result = workflow_node_service.replace_workflow_nodes_and_connections(
            test_workflow.id, nodes_data, connections_data, test_organization_id
        )

        assert "nodes" in result
        assert "connections" in result

    def test_replace_workflow_nodes_and_connections_workflow_not_found(
        self, workflow_node_service, test_organization_id
    ):
        """Test replacing nodes with non-existent workflow"""
        workflow_node_service.workflow_repo.get_by_id.return_value = None
        non_existent_workflow_id = uuid4()

        with pytest.raises(ValueError, match="Workflow not found"):
            workflow_node_service.replace_workflow_nodes_and_connections(
                non_existent_workflow_id, [], [], test_organization_id
            )

    def test_replace_workflow_nodes_and_connections_wrong_organization(
        self, workflow_node_service, test_workflow
    ):
        """Test replacing nodes with wrong organization"""
        workflow_node_service.workflow_repo.get_by_id.return_value = test_workflow
        wrong_org_id = uuid4()

        with pytest.raises(ValueError, match="Workflow does not belong to your organization"):
            workflow_node_service.replace_workflow_nodes_and_connections(
                test_workflow.id, [], [], wrong_org_id
            )

    def test_replace_workflow_nodes_with_sanitization(
        self, workflow_node_service, test_workflow, test_organization_id
    ):
        """Test replacing workflow nodes with text that needs sanitization"""
        test_workflow.organization_id = test_organization_id
        workflow_node_service.workflow_repo.get_by_id.return_value = test_workflow
        workflow_node_service.node_repo.get_connections_by_workflow.return_value = []
        workflow_node_service.node_repo.get_nodes_by_workflow.return_value = []

        created_nodes = []
        def mock_create_node(**kwargs):
            node = Mock(spec=WorkflowNode)
            node.id = kwargs.get('id', uuid4())
            # The name should be sanitized before create_node is called
            node.name = kwargs.get('name', 'Node')
            node.config = kwargs.get('config', {})
            created_nodes.append(node)
            return node

        workflow_node_service.node_repo.create_node.side_effect = mock_create_node
        workflow_node_service.node_repo.get_nodes_by_workflow.side_effect = [[], lambda wf_id: created_nodes]
        workflow_node_service.node_repo.get_connections_by_workflow.side_effect = [[], []]

        nodes_data = [
            {
                "id": str(uuid4()),
                "node_type": "message",
                "name": "Test\udcacNode\udd16",  # Contains surrogate characters
                "message_text": "Hello\udcac World\udd16",
                "position_x": 100,
                "position_y": 100
            }
        ]

        result = workflow_node_service.replace_workflow_nodes_and_connections(
            test_workflow.id, nodes_data, [], test_organization_id
        )

        # Verify the create_node was called (sanitization happens before the call)
        workflow_node_service.node_repo.create_node.assert_called_once()

        # Verify the call arguments were sanitized
        call_kwargs = workflow_node_service.node_repo.create_node.call_args[1]
        assert "\udcac" not in call_kwargs.get('name', '')
        assert "\udd16" not in call_kwargs.get('name', '')

    def test_replace_workflow_with_database_rollback(
        self, workflow_node_service, test_workflow, test_organization_id, mock_db
    ):
        """Test that database rollback works when error occurs during replacement"""
        test_workflow.organization_id = test_organization_id
        workflow_node_service.workflow_repo.get_by_id.return_value = test_workflow
        workflow_node_service.node_repo.get_connections_by_workflow.return_value = []
        workflow_node_service.node_repo.get_nodes_by_workflow.return_value = []
        workflow_node_service.node_repo.create_node.side_effect = Exception("Database error")

        nodes_data = [{"id": "node-1", "node_type": "message", "name": "Test", "position_x": 0, "position_y": 0}]

        with pytest.raises(Exception):
            workflow_node_service.replace_workflow_nodes_and_connections(
                test_workflow.id, nodes_data, [], test_organization_id
            )

    def test_update_single_node_with_sanitization(
        self, workflow_node_service, test_workflow_node, test_workflow, test_organization_id
    ):
        """Test updating node with text that needs sanitization"""
        test_workflow.organization_id = test_organization_id
        test_workflow_node.workflow_id = test_workflow.id
        workflow_node_service.workflow_repo.get_by_id.return_value = test_workflow
        workflow_node_service.node_repo.get_node_by_id.return_value = test_workflow_node

        updated_node = Mock(spec=WorkflowNode)
        updated_node.name = "Updated Node"  # Sanitized name
        updated_node.description = "Updated description"  # Sanitized description
        workflow_node_service.node_repo.update_node.return_value = updated_node

        update_data = {
            "name": "Updated\udcac Node\udd16",
            "description": "Updated\udcac description\udd16"
        }

        result = workflow_node_service.update_single_node(
            test_workflow_node.workflow_id,
            test_workflow_node.id,
            update_data,
            test_organization_id
        )

        # Verify update_node was called with sanitized data
        workflow_node_service.node_repo.update_node.assert_called_once()
        call_kwargs = workflow_node_service.node_repo.update_node.call_args[1]
        assert "\udcac" not in call_kwargs.get('name', '')
        assert "\udd16" not in call_kwargs.get('name', '')

    def test_update_single_node_database_rollback(
        self, workflow_node_service, test_workflow_node, test_workflow, test_organization_id
    ):
        """Test that database rollback works when error occurs during node update"""
        test_workflow.organization_id = test_organization_id
        test_workflow_node.workflow_id = test_workflow.id
        workflow_node_service.workflow_repo.get_by_id.return_value = test_workflow
        workflow_node_service.node_repo.get_node_by_id.return_value = test_workflow_node
        workflow_node_service.node_repo.update_node.side_effect = Exception("Database error")

        with pytest.raises(Exception):
            workflow_node_service.update_single_node(
                test_workflow_node.workflow_id,
                test_workflow_node.id,
                {"name": "New Name"},
                test_organization_id
            )


class TestUniqueNodeNameGeneration:
    """Tests for unique node name generation."""

    def test_generate_unique_node_name_no_conflict(
        self, workflow_node_service, test_workflow
    ):
        """Test name generation when there's no conflict."""
        test_workflow.nodes = []
        workflow_node_service.workflow_repo.get_by_id.return_value = test_workflow

        result = workflow_node_service._generate_unique_node_name(
            test_workflow.id, "New Node"
        )

        assert result == "New Node"

    def test_generate_unique_node_name_with_conflict(
        self, workflow_node_service, test_workflow
    ):
        """Test name generation when there's a conflict."""
        existing_node = Mock(spec=WorkflowNode)
        existing_node.id = uuid4()
        existing_node.name = "New Node"
        test_workflow.nodes = [existing_node]
        workflow_node_service.workflow_repo.get_by_id.return_value = test_workflow

        result = workflow_node_service._generate_unique_node_name(
            test_workflow.id, "New Node"
        )

        assert result == "New Node_001"

    def test_validate_node_name_uniqueness_true(
        self, workflow_node_service, test_workflow
    ):
        """Test validation returns True for unique name."""
        test_workflow.nodes = []
        workflow_node_service.workflow_repo.get_by_id.return_value = test_workflow

        result = workflow_node_service._validate_node_name_uniqueness(
            test_workflow.id, "Unique Name"
        )

        assert result is True

    def test_validate_node_name_uniqueness_false(
        self, workflow_node_service, test_workflow
    ):
        """Test validation returns False for duplicate name."""
        existing_node = Mock(spec=WorkflowNode)
        existing_node.id = uuid4()
        existing_node.name = "Duplicate Name"
        test_workflow.nodes = [existing_node]
        workflow_node_service.workflow_repo.get_by_id.return_value = test_workflow

        result = workflow_node_service._validate_node_name_uniqueness(
            test_workflow.id, "Duplicate Name"
        )

        assert result is False
