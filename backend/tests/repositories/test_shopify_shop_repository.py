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
from unittest.mock import MagicMock, patch, ANY
from sqlalchemy.orm import Session
from app.repositories.shopify_shop_repository import ShopifyShopRepository
from app.models.shopify import ShopifyShop
from app.models.schemas.shopify import ShopifyShopCreate, ShopifyShopUpdate
import uuid
from datetime import datetime, timezone


@pytest.fixture
def mock_db():
    """Create a mock database session"""
    db = MagicMock(spec=Session)
    return db


@pytest.fixture
def sample_shop_data():
    """Sample shop data for testing"""
    return {
        "id": str(uuid.uuid4()),
        "shop_domain": "test-shop.myshopify.com",
        "access_token": "test_access_token",
        "scope": "read_products,write_products",
        "is_installed": True,
        "organization_id": str(uuid.uuid4()),
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc)
    }


@pytest.fixture
def mock_shop(sample_shop_data):
    """Create a mock ShopifyShop instance"""
    shop = MagicMock(spec=ShopifyShop)
    for key, value in sample_shop_data.items():
        setattr(shop, key, value)
    return shop


@pytest.fixture
def repository(mock_db):
    """Create a ShopifyShopRepository instance with mocked dependencies"""
    return ShopifyShopRepository(mock_db)


def test_get_shop(repository, mock_db, mock_shop, sample_shop_data):
    """Test getting a shop by ID"""
    # Arrange
    shop_id = sample_shop_data["id"]
    query_mock = MagicMock()
    filter_mock = MagicMock()
    first_mock = MagicMock(return_value=mock_shop)
    
    mock_db.query.return_value = query_mock
    query_mock.filter.return_value = filter_mock
    filter_mock.first.return_value = mock_shop
    
    # Act
    result = repository.get_shop(shop_id)
    
    # Assert
    assert result == mock_shop
    mock_db.query.assert_called_once_with(ShopifyShop)
    query_mock.filter.assert_called_once()
    filter_mock.first.assert_called_once()
    assert str(result.organization_id) == sample_shop_data["organization_id"]


def test_get_shop_by_domain(repository, mock_db, mock_shop, sample_shop_data):
    """Test getting a shop by domain"""
    # Arrange
    shop_domain = sample_shop_data["shop_domain"]
    query_mock = MagicMock()
    filter_mock = MagicMock()
    first_mock = MagicMock(return_value=mock_shop)
    
    mock_db.query.return_value = query_mock
    query_mock.filter.return_value = filter_mock
    filter_mock.first.return_value = mock_shop
    
    # Act
    result = repository.get_shop_by_domain(shop_domain)
    
    # Assert
    assert result == mock_shop
    mock_db.query.assert_called_once_with(ShopifyShop)
    query_mock.filter.assert_called_once()
    filter_mock.first.assert_called_once()
    assert str(result.organization_id) == sample_shop_data["organization_id"]


def test_get_shop_not_found(repository, mock_db):
    """Test getting a shop that doesn't exist"""
    # Arrange
    shop_id = str(uuid.uuid4())
    query_mock = MagicMock()
    filter_mock = MagicMock()
    first_mock = MagicMock(return_value=None)
    
    mock_db.query.return_value = query_mock
    query_mock.filter.return_value = filter_mock
    filter_mock.first.return_value = None
    
    # Act
    result = repository.get_shop(shop_id)
    
    # Assert
    assert result is None
    mock_db.query.assert_called_once_with(ShopifyShop)
    query_mock.filter.assert_called_once()
    filter_mock.first.assert_called_once()


def test_get_shops(repository, mock_db):
    """Test getting all shops with pagination"""
    # Arrange
    shops = [MagicMock(spec=ShopifyShop) for _ in range(3)]
    for i, shop in enumerate(shops):
        shop.id = str(uuid.uuid4())
        shop.organization_id = str(uuid.uuid4())
    
    query_mock = MagicMock()
    offset_mock = MagicMock()
    limit_mock = MagicMock()
    all_mock = MagicMock(return_value=shops)
    
    mock_db.query.return_value = query_mock
    query_mock.offset.return_value = offset_mock
    offset_mock.limit.return_value = limit_mock
    limit_mock.all.return_value = shops
    
    # Act
    result = repository.get_shops(skip=0, limit=10)
    
    # Assert
    assert result == shops
    assert len(result) == 3
    mock_db.query.assert_called_once_with(ShopifyShop)
    query_mock.offset.assert_called_once_with(0)
    offset_mock.limit.assert_called_once_with(10)
    limit_mock.all.assert_called_once()
    
    # Verify organization_id is properly serialized
    for shop in result:
        assert isinstance(shop.organization_id, str)


def test_get_shops_by_organization(repository, mock_db):
    """Test getting shops by organization ID"""
    # Arrange
    organization_id = str(uuid.uuid4())
    shops = [MagicMock(spec=ShopifyShop) for _ in range(2)]
    for shop in shops:
        shop.id = str(uuid.uuid4())
        shop.organization_id = organization_id
    
    query_mock = MagicMock()
    filter_mock = MagicMock()
    offset_mock = MagicMock()
    limit_mock = MagicMock()
    all_mock = MagicMock(return_value=shops)
    
    mock_db.query.return_value = query_mock
    query_mock.filter.return_value = filter_mock
    filter_mock.offset.return_value = offset_mock
    offset_mock.limit.return_value = limit_mock
    limit_mock.all.return_value = shops
    
    # Act
    result = repository.get_shops_by_organization(organization_id, skip=0, limit=10)
    
    # Assert
    assert result == shops
    assert len(result) == 2
    mock_db.query.assert_called_once_with(ShopifyShop)
    query_mock.filter.assert_called_once()
    filter_mock.offset.assert_called_once_with(0)
    offset_mock.limit.assert_called_once_with(10)
    limit_mock.all.assert_called_once()


def test_create_shop(repository, mock_db, sample_shop_data):
    """Test creating a new shop"""
    # Arrange
    shop_create_data = {
        "shop_domain": sample_shop_data["shop_domain"],
        "access_token": sample_shop_data["access_token"],
        "scope": sample_shop_data["scope"],
        "is_installed": sample_shop_data["is_installed"],
        "organization_id": sample_shop_data["organization_id"]
    }
    shop_create = ShopifyShopCreate(**shop_create_data)
    
    # Mock the database operations
    mock_db.add = MagicMock()
    mock_db.commit = MagicMock()
    mock_db.refresh = MagicMock()
    
    # Act
    with patch('uuid.uuid4', return_value=uuid.UUID(sample_shop_data["id"])):
        result = repository.create_shop(shop_create)
    
    # Assert
    assert isinstance(result, ShopifyShop)
    assert result.shop_domain == shop_create.shop_domain
    assert result.access_token == shop_create.access_token
    assert result.is_installed == shop_create.is_installed
    assert str(result.organization_id) == shop_create.organization_id
    
    mock_db.add.assert_called_once()
    mock_db.commit.assert_called_once()
    mock_db.refresh.assert_called_once()


def test_update_shop(repository, mock_db, mock_shop, sample_shop_data):
    """Test updating an existing shop"""
    # Arrange
    shop_id = sample_shop_data["id"]
    update_data = {
        "access_token": "new_access_token",
        "is_installed": False
    }
    shop_update = ShopifyShopUpdate(**update_data)
    
    # Mock the get_shop method to return the mock_shop
    repository.get_shop = MagicMock(return_value=mock_shop)
    
    # Mock the database operations
    mock_db.commit = MagicMock()
    mock_db.refresh = MagicMock()
    
    # Act
    result = repository.update_shop(shop_id, shop_update)
    
    # Assert
    assert result == mock_shop
    repository.get_shop.assert_called_once_with(shop_id)
    
    # Verify the fields were updated
    assert mock_shop.access_token == update_data["access_token"]
    assert mock_shop.is_installed == update_data["is_installed"]
    
    mock_db.commit.assert_called_once()
    mock_db.refresh.assert_called_once_with(mock_shop)


def test_update_shop_not_found(repository, mock_db):
    """Test updating a shop that doesn't exist"""
    # Arrange
    shop_id = str(uuid.uuid4())
    update_data = {
        "access_token": "new_access_token",
        "is_installed": False
    }
    shop_update = ShopifyShopUpdate(**update_data)
    
    # Mock the get_shop method to return None (shop not found)
    repository.get_shop = MagicMock(return_value=None)
    
    # Act
    result = repository.update_shop(shop_id, shop_update)
    
    # Assert
    assert result is None
    repository.get_shop.assert_called_once_with(shop_id)
    mock_db.commit.assert_not_called()
    mock_db.refresh.assert_not_called()


def test_delete_shop(repository, mock_db, mock_shop):
    """Test deleting a shop"""
    # Arrange
    shop_id = mock_shop.id
    
    # Mock the get_shop method to return the mock_shop
    repository.get_shop = MagicMock(return_value=mock_shop)
    
    # Mock the database operations
    mock_db.delete = MagicMock()
    mock_db.commit = MagicMock()
    
    # Act
    result = repository.delete_shop(shop_id)
    
    # Assert
    assert result is True
    repository.get_shop.assert_called_once_with(shop_id)
    mock_db.delete.assert_called_once_with(mock_shop)
    mock_db.commit.assert_called_once()


def test_delete_shop_not_found(repository, mock_db):
    """Test deleting a shop that doesn't exist"""
    # Arrange
    shop_id = str(uuid.uuid4())
    
    # Mock the get_shop method to return None (shop not found)
    repository.get_shop = MagicMock(return_value=None)
    
    # Act
    result = repository.delete_shop(shop_id)
    
    # Assert
    assert result is False
    repository.get_shop.assert_called_once_with(shop_id)
    mock_db.delete.assert_not_called()
    mock_db.commit.assert_not_called() 