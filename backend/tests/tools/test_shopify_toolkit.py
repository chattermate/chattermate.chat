"""
ChatterMate - Test Shopify Toolkit
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
import json
from unittest.mock import patch, MagicMock
from app.tools.shopify_toolkit import ShopifyTools
from app.models.shopify import AgentShopifyConfig, ShopifyShop
from app.models.organization import Organization
from app.models.agent import Agent
from uuid import UUID, uuid4
import requests

@pytest.fixture
def mock_db():
    db = MagicMock()
    return db

@pytest.fixture
def mock_agent():
    agent = MagicMock()
    agent.id = UUID("00000000-0000-0000-0000-000000000001")
    agent.organization_id = UUID("00000000-0000-0000-0000-000000000002")
    return agent

@pytest.fixture
def mock_org():
    org = MagicMock()
    org.id = UUID("00000000-0000-0000-0000-000000000002")
    return org

@pytest.fixture
def mock_shopify_config():
    shopify_config = MagicMock()
    shopify_config.enabled = True
    shopify_config.shop_id = UUID("00000000-0000-0000-0000-000000000003")
    return shopify_config

@pytest.fixture
def mock_shop():
    shop = MagicMock()
    shop.id = UUID("00000000-0000-0000-0000-000000000003")
    shop.organization_id = UUID("00000000-0000-0000-0000-000000000002")
    shop.shop_domain = "test-shop.myshopify.com"
    shop.access_token = "test_access_token"
    shop.is_installed = True
    return shop

@pytest.fixture
def mock_shopify_service():
    service = MagicMock()
    service.get_products.return_value = {
        "success": True,
        "products": [
            {
                "id": "123456789",
                "title": "Test Product",
                "description": "This is a test product",
                "price": "19.99",
                "currency": "USD",
                "vendor": "Test Vendor",
                "product_type": "Test Type",
                "total_inventory": 10,
                "tags": ["tag1", "tag2"],
                "image": {"src": "https://example.com/image.jpg"}
            }
        ],
        "count": 1,
        "has_next_page": False,
        "end_cursor": None
    }
    service.get_product.return_value = {
        "success": True,
        "product": {
            "id": "123456789",
            "title": "Test Product",
            "description": "This is a test product",
            "price": "19.99",
            "currency": "USD",
            "vendor": "Test Vendor",
            "product_type": "Test Type",
            "total_inventory": 10,
            "tags": ["tag1", "tag2"],
            "image": {"src": "https://example.com/image.jpg"}
        }
    }
    service.get_order.return_value = {
        "success": True,
        "order": {
            "id": "987654321",
            "name": "#1001",
            "financial_status": "paid",
            "fulfillment_status": "fulfilled",
            "created_at": "2023-01-01T00:00:00Z",
            "processed_at": "2023-01-01T00:01:00Z",
            "total_price": "29.99",
            "currency": "USD",
            "customer": {
                "first_name": "John",
                "last_name": "Doe",
                "email": "john.doe@example.com"
            },
            "fulfillments": [
                {
                    "tracking_number": "12345",
                    "tracking_company": "USPS",
                    "status": "SUCCESS"
                }
            ]
        }
    }
    return service

@pytest.fixture
def shopify_tools(mock_db, mock_agent, mock_org, mock_shopify_config, mock_shop, mock_shopify_service):
    """Create a ShopifyTools instance with all dependencies mocked"""
    agent_id = "00000000-0000-0000-0000-000000000001"
    org_id = "00000000-0000-0000-0000-000000000002"
    session_id = "test_session_id"

    with patch('app.tools.shopify_toolkit.SessionLocal') as mock_session_local, \
         patch('app.tools.shopify_toolkit.ShopifyService') as mock_service_class, \
         patch('app.tools.shopify_toolkit.ShopifyShopRepository') as mock_shop_repo_class, \
         patch('app.tools.shopify_toolkit.AgentShopifyConfigRepository') as mock_config_repo_class, \
         patch('app.tools.shopify_toolkit.get_redis') as mock_get_redis:

        # Configure session to return our mock db
        mock_session_local.return_value.__enter__.return_value = mock_db

        # Configure mocks
        mock_service_class.return_value = mock_shopify_service

        # Mock Redis
        mock_redis = MagicMock()
        mock_redis.setex.return_value = True
        mock_get_redis.return_value = mock_redis

        # Create mock repository instances
        mock_shop_repo = MagicMock()
        mock_shop_repo_class.return_value = mock_shop_repo
        mock_shop_repo.get_shop.return_value = mock_shop

        mock_config_repo = MagicMock()
        mock_config_repo_class.return_value = mock_config_repo
        mock_config_repo.get_agent_shopify_config.return_value = mock_shopify_config

        # Create tool instance
        tool = ShopifyTools(agent_id=agent_id, org_id=org_id, session_id=session_id)

        # Mock the _get_shop_for_agent method directly to avoid database operations
        with patch.object(tool, '_get_shop_for_agent', return_value=mock_shop):
            yield tool

def test_list_products(shopify_tools, mock_shopify_service):
    # Act
    result_str = shopify_tools.list_products(limit=10)
    result = json.loads(result_str)
    
    # Assert
    assert result["success"] is True
    assert "message" in result  # Now includes text summary
    assert "shopify_output" in result
    assert "products" in result["shopify_output"]
    assert len(result["shopify_output"]["products"]) == 1
    assert result["shopify_output"]["products"][0]["title"] == "Test Product"
    mock_shopify_service.get_products.assert_called_once()

def test_get_product(shopify_tools, mock_shopify_service):
    # Act
    result_str = shopify_tools.get_product(product_id="123456789")
    result = json.loads(result_str)
    
    # Assert
    assert result["success"] is True
    assert "message" in result  # Now includes text summary
    assert "shopify_product" in result
    assert result["shopify_product"]["title"] == "Test Product"
    # Verify message contains key product details
    assert "Test Product" in result["message"]
    assert "19.99" in result["message"]
    assert "Test Vendor" in result["message"]
    mock_shopify_service.get_product.assert_called_once()

def test_search_products(shopify_tools):
    # Mock the requests.post response
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {
        "data": {
            "products": {
                "edges": [
                    {
                        "node": {
                            "id": "gid://shopify/Product/123456789",
                            "title": "Test Product",
                            "description": "This is a test product",
                            "handle": "test-product",
                            "productType": "Test Type",
                            "vendor": "Test Vendor",
                            "totalInventory": 10,
                            "priceRangeV2": {
                                "minVariantPrice": {
                                    "amount": "19.99",
                                    "currencyCode": "USD"
                                },
                                "maxVariantPrice": {
                                    "amount": "29.99",
                                    "currencyCode": "USD"
                                }
                            },
                            "images": {
                                "edges": [
                                    {
                                        "node": {
                                            "id": "image-id",
                                            "url": "https://example.com/image.jpg",
                                            "altText": "Test Image"
                                        }
                                    }
                                ]
                            },
                            "tags": ["tag1", "tag2"],
                            "createdAt": "2023-01-01T00:00:00Z",
                            "updatedAt": "2023-01-02T00:00:00Z"
                        }
                    }
                ],
                "pageInfo": {
                    "hasNextPage": False,
                    "endCursor": "cursor-value"
                }
            }
        }
    }
    
    with patch("requests.post", return_value=mock_response):
        # Act
        result_str = shopify_tools.search_products(query="test", limit=5)
        result = json.loads(result_str)
        
        # Assert
        assert result["success"] is True
        assert "shopify_output" in result
        assert "products" in result["shopify_output"]
        assert len(result["shopify_output"]["products"]) == 1
        assert result["shopify_output"]["products"][0]["title"] == "Test Product"
        assert result["shopify_output"]["search_query"] == "test"
        assert "pageInfo" in result["shopify_output"]

def test_get_order_status(shopify_tools, mock_shopify_service):
    # Use a Shopify GID format to avoid triggering the order number search
    order_id = "gid://shopify/Order/987654321"
    
    # Act
    result_str = shopify_tools.get_order_status(order_id=order_id)
    result = json.loads(result_str)
    
    # Assert
    assert result["success"] is True
    assert result["order_number"] == "#1001"
    assert result["status"] == "paid"
    assert result["fulfillment_status"] == "fulfilled"
    assert "tracking_numbers" in result
    assert result["tracking_numbers"][0] == "12345"
    assert "shop_domain" in result
    assert result["shop_domain"] == "test-shop.myshopify.com"
    mock_shopify_service.get_order.assert_called_once()

def test_search_orders(shopify_tools):
    # Mock the requests.post response
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {
        "data": {
            "orders": {
                "edges": [
                    {
                        "node": {
                            "id": "gid://shopify/Order/987654321",
                            "name": "#1001",
                            "email": "customer@example.com",
                            "phone": "+1234567890",
                            "createdAt": "2023-01-01T00:00:00Z",
                            "displayFinancialStatus": "PAID",
                            "displayFulfillmentStatus": "FULFILLED",
                            "subtotalLineItemsQuantity": 2,
                            "currentSubtotalPriceSet": {
                                "shopMoney": {
                                    "amount": "24.99",
                                    "currencyCode": "USD"
                                }
                            },
                            "currentTotalPriceSet": {
                                "shopMoney": {
                                    "amount": "29.99",
                                    "currencyCode": "USD"
                                }
                            },
                            "originalTotalPriceSet": {
                                "shopMoney": {
                                    "amount": "29.99",
                                    "currencyCode": "USD"
                                }
                            },
                            "customer": {
                                "id": "customer-id",
                                "firstName": "John",
                                "lastName": "Doe",
                                "email": "john.doe@example.com"
                            },
                            "lineItems": {
                                "edges": [
                                    {
                                        "node": {
                                            "title": "Test Product",
                                            "quantity": 1,
                                            "originalUnitPriceSet": {
                                                "shopMoney": {
                                                    "amount": "19.99",
                                                    "currencyCode": "USD"
                                                }
                                            },
                                            "variant": {
                                                "id": "variant-id",
                                                "title": "Default",
                                                "image": {
                                                    "url": "https://example.com/image.jpg"
                                                }
                                            }
                                        }
                                    }
                                ]
                            },
                            "shippingAddress": {
                                "address1": "123 Test St",
                                "city": "Testville",
                                "provinceCode": "CA",
                                "zip": "12345",
                                "country": "US"
                            },
                            "fulfillments": [
                                {
                                    "trackingInfo": [
                                        {
                                            "company": "USPS",
                                            "number": "12345",
                                            "url": "https://tracking.usps.com/12345"
                                        }
                                    ],
                                    "status": "SUCCESS"
                                }
                            ]
                        }
                    }
                ],
                "pageInfo": {
                    "hasNextPage": False,
                    "endCursor": "cursor-value"
                }
            }
        }
    }
    
    with patch("requests.post", return_value=mock_response):
        # Act
        result_str = shopify_tools.search_orders(query="test", limit=10)
        result = json.loads(result_str)
        
        # Assert
        assert result["success"] is True
        assert "orders" in result
        assert len(result["orders"]) == 1
        assert result["orders"][0]["name"] == "#1001"
        assert result["orders"][0]["financial_status"] == "PAID"
        assert "line_items" in result["orders"][0]
        assert "page_info" in result

def test_recommend_products(shopify_tools):
    # Mock the first requests.post response (product details)
    mock_product_response = MagicMock()
    mock_product_response.status_code = 200
    mock_product_response.json.return_value = {
        "data": {
            "product": {
                "id": "gid://shopify/Product/123456789",
                "title": "Test Product",
                "productType": "Test Type",
                "tags": ["tag1", "tag2"]
            }
        }
    }
    
    # Mock the second requests.post response (recommendations)
    mock_recommendations_response = MagicMock()
    mock_recommendations_response.status_code = 200
    mock_recommendations_response.json.return_value = {
        "data": {
            "products": {
                "edges": [
                    {
                        "node": {
                            "id": "gid://shopify/Product/987654321",
                            "title": "Recommended Product",
                            "description": "This is a recommended product",
                            "handle": "recommended-product",
                            "productType": "Test Type",
                            "vendor": "Test Vendor",
                            "totalInventory": 5,
                            "priceRangeV2": {
                                "minVariantPrice": {
                                    "amount": "24.99",
                                    "currencyCode": "USD"
                                },
                                "maxVariantPrice": {
                                    "amount": "24.99",
                                    "currencyCode": "USD"
                                }
                            },
                            "images": {
                                "edges": [
                                    {
                                        "node": {
                                            "id": "image-id",
                                            "url": "https://example.com/image2.jpg",
                                            "altText": "Recommended Image"
                                        }
                                    }
                                ]
                            },
                            "tags": ["tag1", "tag3"],
                            "createdAt": "2023-01-01T00:00:00Z",
                            "updatedAt": "2023-01-02T00:00:00Z"
                        }
                    }
                ],
                "pageInfo": {
                    "hasNextPage": False,
                    "endCursor": "cursor-value"
                }
            }
        }
    }
    
    with patch("requests.post", side_effect=[mock_product_response, mock_recommendations_response]):
        # Act
        result_str = shopify_tools.recommend_products(product_id="123456789", limit=3)
        result = json.loads(result_str)
        
        # Assert
        assert result["success"] is True
        assert "shopify_output" in result
        assert "products" in result["shopify_output"]
        assert len(result["shopify_output"]["products"]) == 1
        assert result["shopify_output"]["products"][0]["title"] == "Recommended Product"
        assert result["shopify_output"]["search_type"] == "recommendations"
        assert "pageInfo" in result["shopify_output"]

def test_integration_disabled():
    """Test when Shopify integration is disabled for the agent"""
    agent_id = "00000000-0000-0000-0000-000000000001"
    org_id = "00000000-0000-0000-0000-000000000002"
    session_id = "test_session_id"
    
    # Create disabled config
    mock_config = MagicMock()
    mock_config.enabled = False
    
    with patch('app.tools.shopify_toolkit.SessionLocal'), \
         patch('app.tools.shopify_toolkit.ShopifyService'), \
         patch('app.tools.shopify_toolkit.ShopifyShopRepository'), \
         patch('app.tools.shopify_toolkit.AgentShopifyConfigRepository') as mock_config_repo_class:
        
        # Configure config repo to return disabled config
        mock_config_repo = MagicMock()
        mock_config_repo_class.return_value = mock_config_repo
        mock_config_repo.get_agent_shopify_config.return_value = mock_config
        
        # Create tool instance
        tool = ShopifyTools(agent_id=agent_id, org_id=org_id, session_id=session_id)
        
        # Act
        result_str = tool.list_products()
        result = json.loads(result_str)
        
        # Assert
        assert result["success"] is False
        assert "not enabled" in result["message"].lower()

def test_shop_not_found():
    """Test when shop is not found for the agent"""
    agent_id = "00000000-0000-0000-0000-000000000001"
    org_id = "00000000-0000-0000-0000-000000000002"
    session_id = "test_session_id"
    
    # Create config with a shop ID
    mock_config = MagicMock()
    mock_config.enabled = True
    mock_config.shop_id = UUID("00000000-0000-0000-0000-000000000003")
    
    with patch('app.tools.shopify_toolkit.SessionLocal'), \
         patch('app.tools.shopify_toolkit.ShopifyService'), \
         patch('app.tools.shopify_toolkit.ShopifyShopRepository') as mock_shop_repo_class, \
         patch('app.tools.shopify_toolkit.AgentShopifyConfigRepository') as mock_config_repo_class:
        
        # Configure repos
        mock_config_repo = MagicMock()
        mock_config_repo_class.return_value = mock_config_repo
        mock_config_repo.get_agent_shopify_config.return_value = mock_config
        
        mock_shop_repo = MagicMock()
        mock_shop_repo_class.return_value = mock_shop_repo
        mock_shop_repo.get_shop.return_value = None  # Shop not found
        
        # Create tool instance
        tool = ShopifyTools(agent_id=agent_id, org_id=org_id, session_id=session_id)
        
        # Act
        result_str = tool.list_products()
        result = json.loads(result_str)
        
        # Assert
        assert result["success"] is False
        assert "not found" in result["message"].lower() or "not enabled" in result["message"].lower()

def test_api_error(shopify_tools, mock_shopify_service):
    """Test when an API error occurs"""
    # Set up service method to raise an exception
    mock_shopify_service.get_products.side_effect = Exception("API Error")
    
    # Act
    result_str = shopify_tools.list_products()
    result = json.loads(result_str)
    
    # Assert
    assert result["success"] is False
    assert "error" in result["message"].lower() 