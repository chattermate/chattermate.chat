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
import uuid
from unittest.mock import MagicMock, patch
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from app.repositories.agent_shopify_config_repository import AgentShopifyConfigRepository
from app.models.shopify.agent_shopify_config import AgentShopifyConfig
from app.models.schemas.shopify.agent_shopify_config import (
    AgentShopifyConfigCreate,
    AgentShopifyConfigUpdate
)


@pytest.fixture
def mock_db():
    """Create a mock database session"""
    db = MagicMock(spec=Session)
    return db


@pytest.fixture
def sample_config_data():
    """Sample agent shopify config data for testing"""
    return {
        "id": str(uuid.uuid4()),
        "agent_id": str(uuid.uuid4()),
        "shop_id": str(uuid.uuid4()),
        "enabled": True,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc)
    }


@pytest.fixture
def mock_config(sample_config_data):
    """Create a mock AgentShopifyConfig instance"""
    config = MagicMock(spec=AgentShopifyConfig)
    for key, value in sample_config_data.items():
        setattr(config, key, value)
    return config


@pytest.fixture
def repository(mock_db):
    """Create an AgentShopifyConfigRepository instance with mocked dependencies"""
    return AgentShopifyConfigRepository(mock_db)


class TestAgentShopifyConfigRepository:
    """Test cases for AgentShopifyConfigRepository"""

    def test_get_agent_shopify_config_success(self, repository, mock_db, mock_config, sample_config_data):
        """Test getting an agent shopify config by agent_id"""
        # Arrange
        agent_id = sample_config_data["agent_id"]
        query_mock = MagicMock()
        filter_mock = MagicMock()
        
        mock_db.query.return_value = query_mock
        query_mock.filter.return_value = filter_mock
        filter_mock.first.return_value = mock_config
        
        # Act
        result = repository.get_agent_shopify_config(agent_id)
        
        # Assert
        assert result == mock_config
        mock_db.query.assert_called_once_with(AgentShopifyConfig)
        query_mock.filter.assert_called_once()
        filter_mock.first.assert_called_once()
        assert result.agent_id == sample_config_data["agent_id"]

    def test_get_agent_shopify_config_not_found(self, repository, mock_db):
        """Test getting an agent shopify config that doesn't exist"""
        # Arrange
        agent_id = str(uuid.uuid4())
        query_mock = MagicMock()
        filter_mock = MagicMock()
        
        mock_db.query.return_value = query_mock
        query_mock.filter.return_value = filter_mock
        filter_mock.first.return_value = None
        
        # Act
        result = repository.get_agent_shopify_config(agent_id)
        
        # Assert
        assert result is None
        mock_db.query.assert_called_once_with(AgentShopifyConfig)
        query_mock.filter.assert_called_once()
        filter_mock.first.assert_called_once()

    def test_get_config_by_agent_and_shop_success(self, repository, mock_db, mock_config, sample_config_data):
        """Test getting config by agent and shop combination"""
        # Arrange
        agent_id = sample_config_data["agent_id"]
        shop_id = sample_config_data["shop_id"]
        query_mock = MagicMock()
        filter_mock = MagicMock()
        
        mock_db.query.return_value = query_mock
        query_mock.filter.return_value = filter_mock
        filter_mock.first.return_value = mock_config
        
        # Act
        result = repository.get_config_by_agent_and_shop(agent_id, shop_id)
        
        # Assert
        assert result == mock_config
        mock_db.query.assert_called_once_with(AgentShopifyConfig)
        query_mock.filter.assert_called_once()
        filter_mock.first.assert_called_once()

    def test_get_config_by_agent_and_shop_not_found(self, repository, mock_db):
        """Test getting config by agent and shop when it doesn't exist"""
        # Arrange
        agent_id = str(uuid.uuid4())
        shop_id = str(uuid.uuid4())
        query_mock = MagicMock()
        filter_mock = MagicMock()
        
        mock_db.query.return_value = query_mock
        query_mock.filter.return_value = filter_mock
        filter_mock.first.return_value = None
        
        # Act
        result = repository.get_config_by_agent_and_shop(agent_id, shop_id)
        
        # Assert
        assert result is None
        mock_db.query.assert_called_once_with(AgentShopifyConfig)
        query_mock.filter.assert_called_once()
        filter_mock.first.assert_called_once()

    def test_get_configs_by_shop_all(self, repository, mock_db):
        """Test getting all configs for a shop"""
        # Arrange
        shop_id = str(uuid.uuid4())
        configs = [MagicMock(spec=AgentShopifyConfig) for _ in range(3)]
        for i, config in enumerate(configs):
            config.id = str(uuid.uuid4())
            config.agent_id = str(uuid.uuid4())
            config.shop_id = shop_id
            config.enabled = i % 2 == 0  # Mix of enabled/disabled
        
        query_mock = MagicMock()
        filter_mock = MagicMock()
        
        mock_db.query.return_value = query_mock
        query_mock.filter.return_value = filter_mock
        filter_mock.all.return_value = configs
        
        # Act
        result = repository.get_configs_by_shop(shop_id)
        
        # Assert
        assert result == configs
        assert len(result) == 3
        mock_db.query.assert_called_once_with(AgentShopifyConfig)
        query_mock.filter.assert_called_once()
        filter_mock.all.assert_called_once()

    def test_get_configs_by_shop_enabled_only(self, repository, mock_db):
        """Test getting only enabled configs for a shop"""
        # Arrange
        shop_id = str(uuid.uuid4())
        enabled_configs = [MagicMock(spec=AgentShopifyConfig) for _ in range(2)]
        for config in enabled_configs:
            config.id = str(uuid.uuid4())
            config.agent_id = str(uuid.uuid4())
            config.shop_id = shop_id
            config.enabled = True
        
        query_mock = MagicMock()
        filter_mock1 = MagicMock()
        filter_mock2 = MagicMock()
        
        mock_db.query.return_value = query_mock
        query_mock.filter.return_value = filter_mock1
        filter_mock1.filter.return_value = filter_mock2
        filter_mock2.all.return_value = enabled_configs
        
        # Act
        result = repository.get_configs_by_shop(shop_id, enabled_only=True)
        
        # Assert
        assert result == enabled_configs
        assert len(result) == 2
        mock_db.query.assert_called_once_with(AgentShopifyConfig)
        # Should be called twice - once for shop_id, once for enabled filter
        assert query_mock.filter.call_count == 1
        assert filter_mock1.filter.call_count == 1
        filter_mock2.all.assert_called_once()

    def test_get_enabled_configs_for_org(self, repository, mock_db):
        """Test getting enabled configs for an organization"""
        # Arrange
        organization_id = str(uuid.uuid4())
        configs = [MagicMock(spec=AgentShopifyConfig) for _ in range(2)]
        for config in configs:
            config.id = str(uuid.uuid4())
            config.agent_id = str(uuid.uuid4())
            config.enabled = True
        
        query_mock = MagicMock()
        join_mock = MagicMock()
        filter_mock = MagicMock()
        
        mock_db.query.return_value = query_mock
        query_mock.join.return_value = join_mock
        join_mock.filter.return_value = filter_mock
        filter_mock.all.return_value = configs
        
        # Act
        result = repository.get_enabled_configs_for_org(organization_id)
        
        # Assert
        assert result == configs
        assert len(result) == 2
        mock_db.query.assert_called_once_with(AgentShopifyConfig)
        query_mock.join.assert_called_once()
        join_mock.filter.assert_called_once()
        filter_mock.all.assert_called_once()

    def test_create_agent_shopify_config(self, repository, mock_db, sample_config_data):
        """Test creating a new agent shopify config"""
        # Arrange
        config_create_data = {
            "agent_id": sample_config_data["agent_id"],
            "shop_id": sample_config_data["shop_id"],
            "enabled": sample_config_data["enabled"]
        }
        config_create = AgentShopifyConfigCreate(**config_create_data)
        
        # Mock the database operations
        mock_db.add = MagicMock()
        mock_db.commit = MagicMock()
        mock_db.refresh = MagicMock()
        
        # Act
        with patch('uuid.uuid4', return_value=uuid.UUID(sample_config_data["id"])):
            result = repository.create_agent_shopify_config(config_create)
        
        # Assert
        assert isinstance(result, AgentShopifyConfig)
        assert result.agent_id == config_create.agent_id
        assert result.shop_id == config_create.shop_id
        assert result.enabled == config_create.enabled
        assert result.id == sample_config_data["id"]
        
        mock_db.add.assert_called_once()
        mock_db.commit.assert_called_once()
        mock_db.refresh.assert_called_once()

    def test_create_or_update_agent_shopify_config_create_new(self, repository, mock_db, sample_config_data):
        """Test create_or_update when no existing config exists (creates new)"""
        # Arrange
        config_create_data = {
            "agent_id": sample_config_data["agent_id"],
            "shop_id": sample_config_data["shop_id"],
            "enabled": sample_config_data["enabled"]
        }
        config_create = AgentShopifyConfigCreate(**config_create_data)
        
        # Mock get_agent_shopify_config to return None (no existing config)
        repository.get_agent_shopify_config = MagicMock(return_value=None)
        
        # Mock the database operations
        mock_db.add = MagicMock()
        mock_db.commit = MagicMock()
        mock_db.refresh = MagicMock()
        
        # Act
        with patch('uuid.uuid4', return_value=uuid.UUID(sample_config_data["id"])):
            result = repository.create_or_update_agent_shopify_config(config_create)
        
        # Assert
        assert isinstance(result, AgentShopifyConfig)
        assert result.agent_id == config_create.agent_id
        assert result.shop_id == config_create.shop_id
        assert result.enabled == config_create.enabled
        
        repository.get_agent_shopify_config.assert_called_once_with(config_create.agent_id)
        mock_db.add.assert_called_once()
        mock_db.commit.assert_called_once()
        mock_db.refresh.assert_called_once()

    def test_create_or_update_agent_shopify_config_update_existing(self, repository, mock_db, mock_config, sample_config_data):
        """Test create_or_update when existing config exists (updates existing)"""
        # Arrange
        new_shop_id = str(uuid.uuid4())
        config_create_data = {
            "agent_id": sample_config_data["agent_id"],
            "shop_id": new_shop_id,
            "enabled": False  # Different from original
        }
        config_create = AgentShopifyConfigCreate(**config_create_data)
        
        # Mock get_agent_shopify_config to return existing config
        repository.get_agent_shopify_config = MagicMock(return_value=mock_config)
        
        # Mock the database operations
        mock_db.commit = MagicMock()
        mock_db.refresh = MagicMock()
        
        # Act
        result = repository.create_or_update_agent_shopify_config(config_create)
        
        # Assert
        assert result == mock_config
        assert mock_config.shop_id == new_shop_id
        assert mock_config.enabled == False
        
        repository.get_agent_shopify_config.assert_called_once_with(config_create.agent_id)
        mock_db.commit.assert_called_once()
        mock_db.refresh.assert_called_once_with(mock_config)

    def test_update_agent_shopify_config_success(self, repository, mock_db, mock_config, sample_config_data):
        """Test updating an existing agent shopify config"""
        # Arrange
        agent_id = sample_config_data["agent_id"]
        update_data = {
            "enabled": False,
            "shop_id": str(uuid.uuid4())
        }
        
        # Create a mock update object instead of real Pydantic model
        mock_config_update = MagicMock()
        mock_config_update.dict.return_value = update_data
        
        # Mock get_agent_shopify_config to return the mock_config
        repository.get_agent_shopify_config = MagicMock(return_value=mock_config)
        
        # Mock the database operations
        mock_db.commit = MagicMock()
        mock_db.refresh = MagicMock()
        
        # Act
        result = repository.update_agent_shopify_config(agent_id, mock_config_update)
        
        # Assert
        assert result == mock_config
        repository.get_agent_shopify_config.assert_called_once_with(agent_id)
        
        # Verify the dict method was called with exclude_unset=True
        mock_config_update.dict.assert_called_once_with(exclude_unset=True)
        
        # Verify the fields were updated
        assert mock_config.enabled == update_data["enabled"]
        assert mock_config.shop_id == update_data["shop_id"]
        
        mock_db.commit.assert_called_once()
        mock_db.refresh.assert_called_once_with(mock_config)

    def test_update_agent_shopify_config_not_found(self, repository, mock_db):
        """Test updating an agent shopify config that doesn't exist"""
        # Arrange
        agent_id = str(uuid.uuid4())
        update_data = {
            "enabled": False,
            "shop_id": str(uuid.uuid4())
        }
        config_update = AgentShopifyConfigUpdate(**update_data)
        
        # Mock get_agent_shopify_config to return None (config not found)
        repository.get_agent_shopify_config = MagicMock(return_value=None)
        
        # Act
        result = repository.update_agent_shopify_config(agent_id, config_update)
        
        # Assert
        assert result is None
        repository.get_agent_shopify_config.assert_called_once_with(agent_id)
        mock_db.commit.assert_not_called()
        mock_db.refresh.assert_not_called()

    def test_delete_agent_shopify_config_success(self, repository, mock_db, mock_config):
        """Test deleting an agent shopify config"""
        # Arrange
        agent_id = mock_config.agent_id
        
        # Mock get_agent_shopify_config to return the mock_config
        repository.get_agent_shopify_config = MagicMock(return_value=mock_config)
        
        # Mock the database operations
        mock_db.delete = MagicMock()
        mock_db.commit = MagicMock()
        
        # Act
        result = repository.delete_agent_shopify_config(agent_id)
        
        # Assert
        assert result is True
        repository.get_agent_shopify_config.assert_called_once_with(agent_id)
        mock_db.delete.assert_called_once_with(mock_config)
        mock_db.commit.assert_called_once()

    def test_delete_agent_shopify_config_not_found(self, repository, mock_db):
        """Test deleting an agent shopify config that doesn't exist"""
        # Arrange
        agent_id = str(uuid.uuid4())
        
        # Mock get_agent_shopify_config to return None (config not found)
        repository.get_agent_shopify_config = MagicMock(return_value=None)
        
        # Act
        result = repository.delete_agent_shopify_config(agent_id)
        
        # Assert
        assert result is False
        repository.get_agent_shopify_config.assert_called_once_with(agent_id)
        mock_db.delete.assert_not_called()
        mock_db.commit.assert_not_called()

    def test_update_config_object(self, repository, mock_db, mock_config):
        """Test updating an existing config object directly"""
        # Arrange
        mock_db.commit = MagicMock()
        mock_db.refresh = MagicMock()
        
        # Act
        result = repository.update(mock_config)
        
        # Assert
        assert result == mock_config
        mock_db.commit.assert_called_once()
        mock_db.refresh.assert_called_once_with(mock_config)

    def test_get_configs_by_shop_empty_result(self, repository, mock_db):
        """Test getting configs for a shop with no results"""
        # Arrange
        shop_id = str(uuid.uuid4())
        query_mock = MagicMock()
        filter_mock = MagicMock()
        
        mock_db.query.return_value = query_mock
        query_mock.filter.return_value = filter_mock
        filter_mock.all.return_value = []
        
        # Act
        result = repository.get_configs_by_shop(shop_id)
        
        # Assert
        assert result == []
        mock_db.query.assert_called_once_with(AgentShopifyConfig)
        query_mock.filter.assert_called_once()
        filter_mock.all.assert_called_once()

    def test_get_enabled_configs_for_org_empty_result(self, repository, mock_db):
        """Test getting enabled configs for an organization with no results"""
        # Arrange
        organization_id = str(uuid.uuid4())
        query_mock = MagicMock()
        join_mock = MagicMock()
        filter_mock = MagicMock()
        
        mock_db.query.return_value = query_mock
        query_mock.join.return_value = join_mock
        join_mock.filter.return_value = filter_mock
        filter_mock.all.return_value = []
        
        # Act
        result = repository.get_enabled_configs_for_org(organization_id)
        
        # Assert
        assert result == []
        mock_db.query.assert_called_once_with(AgentShopifyConfig)
        query_mock.join.assert_called_once()
        join_mock.filter.assert_called_once()
        filter_mock.all.assert_called_once()
