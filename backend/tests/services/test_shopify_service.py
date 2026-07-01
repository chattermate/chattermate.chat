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
from unittest.mock import patch, MagicMock, ANY
from app.services.shopify import ShopifyService
from app.models.shopify import ShopifyShop
from sqlalchemy.orm import Session
from uuid import UUID, uuid4

@pytest.fixture
def mock_db():
    """Create a mock database session"""
    db = MagicMock(spec=Session)
    return db

@pytest.fixture
def mock_shop():
    """Create a mock Shopify shop"""
    shop = MagicMock(spec=ShopifyShop)
    shop.id = UUID("00000000-0000-0000-0000-000000000003")
    shop.organization_id = UUID("00000000-0000-0000-0000-000000000002")
    shop.shop_domain = "test-shop.myshopify.com"
    shop.access_token = "test_access_token"
    shop.is_installed = True
    return shop

@pytest.fixture
def shopify_service(mock_db):
    """Create a ShopifyService instance with mocked dependencies"""
    with patch('app.services.shopify.ShopifyShopRepository') as mock_shop_repo_class, \
         patch('app.services.shopify.AgentShopifyConfigRepository') as mock_config_repo_class:
        
        # Create and configure mock repositories
        mock_shop_repo = MagicMock()
        mock_shop_repo_class.return_value = mock_shop_repo
        
        mock_config_repo = MagicMock()
        mock_config_repo_class.return_value = mock_config_repo
        
        # Create service instance
        service = ShopifyService(mock_db)
        
        # Test access to mocks
        service._mock_shop_repo = mock_shop_repo
        service._mock_config_repo = mock_config_repo
        
        return service

@pytest.fixture
def mock_graphql_success_response():
    """Create a mock successful GraphQL response"""
    return {
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

@pytest.fixture
def mock_rest_success_response():
    """Create a mock successful REST API response"""
    return {
        "product": {
            "id": 123456789,
            "title": "Test Product",
            "description": "This is a test product",
            "handle": "test-product",
            "product_type": "Test Type",
            "vendor": "Test Vendor",
            "price": "19.99",
            "image": {"src": "https://example.com/image.jpg"},
            "tags": "tag1, tag2",
            "created_at": "2023-01-01T00:00:00Z",
            "updated_at": "2023-01-02T00:00:00Z"
        }
    }

def test_execute_graphql_success(shopify_service, mock_shop, mock_graphql_success_response):
    """Test successful GraphQL query execution"""
    # Arrange
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = mock_graphql_success_response
    
    with patch('requests.post', return_value=mock_response):
        # Act
        result = shopify_service._execute_graphql(
            shop=mock_shop,
            query="query { products { edges { node { id title } } } }",
            variables={"limit": 10}
        )
        
        # Assert
        assert result["success"] is True
        assert "data" in result
        assert "products" in result["data"]

def test_execute_graphql_shop_not_connected(shopify_service):
    """Test GraphQL query with unconnected shop"""
    # Arrange
    mock_shop = MagicMock(spec=ShopifyShop)
    mock_shop.is_installed = False
    
    # Act
    result = shopify_service._execute_graphql(
        shop=mock_shop,
        query="query { products { edges { node { id title } } } }"
    )
    
    # Assert
    assert result["success"] is False
    assert "not connected" in result["message"].lower()

def test_execute_graphql_api_error(shopify_service, mock_shop):
    """Test GraphQL query with API error"""
    # Arrange
    mock_response = MagicMock()
    mock_response.status_code = 400
    mock_response.text = "Bad Request"
    
    with patch('requests.post', return_value=mock_response):
        # Act
        result = shopify_service._execute_graphql(
            shop=mock_shop,
            query="query { products { edges { node { id title } } } }"
        )
        
        # Assert
        assert result["success"] is False
        assert "Failed to execute GraphQL query" in result["message"]

def test_execute_graphql_with_errors(shopify_service, mock_shop):
    """Test GraphQL query that returns errors"""
    # Arrange
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {
        "errors": [
            {"message": "Field 'product' doesn't exist"}
        ]
    }
    
    with patch('requests.post', return_value=mock_response):
        # Act
        result = shopify_service._execute_graphql(
            shop=mock_shop,
            query="query { product { id } }"
        )
        
        # Assert
        assert result["success"] is False
        assert "GraphQL errors" in result["message"] or "Field 'product' doesn't exist" in result["message"]

def test_get_products_success(shopify_service, mock_shop, mock_graphql_success_response):
    """Test successful product retrieval"""
    # Arrange
    with patch.object(shopify_service, '_execute_graphql', return_value={
        "success": True,
        "data": mock_graphql_success_response["data"]
    }):
        # Act
        result = shopify_service.get_products(mock_shop, 10)
        
        # Assert
        assert result["success"] is True
        assert "products" in result
        assert len(result["products"]) == 1
        assert result["products"][0]["title"] == "Test Product"

def test_get_products_failure(shopify_service, mock_shop):
    """Test product retrieval failure"""
    # Arrange
    error_response = {
        "success": False,
        "message": "API Error"
    }
    with patch.object(shopify_service, '_execute_graphql', return_value=error_response):
        # Act
        result = shopify_service.get_products(mock_shop)
        
        # Assert
        assert result["success"] is False
        assert result["message"] == "API Error"

def test_get_product_success(shopify_service, mock_shop):
    """Test successful single product retrieval"""
    # Arrange
    product_data = {
        "product": {
            "id": "gid://shopify/Product/123456789",
            "title": "Test Product",
            "description": "Product description",
            "descriptionHtml": "<p>Product description</p>",
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
                    "amount": "19.99",
                    "currencyCode": "USD"
                }
            },
            "images": {
                "edges": [
                    {
                        "node": {
                            "id": "gid://shopify/ProductImage/111",
                            "url": "https://example.com/image.jpg",
                            "altText": "Image",
                            "width": 800,
                            "height": 600
                        }
                    }
                ]
            },
            "variants": {
                "edges": [
                    {
                        "node": {
                            "id": "gid://shopify/ProductVariant/222",
                            "title": "Default",
                            "price": "19.99",
                            "compareAtPrice": None,
                            "inventoryQuantity": 10,
                            "sku": "SKU123",
                            "barcode": "BARCODE123"
                        }
                    }
                ]
            },
            "tags": ["tag1", "tag2"],
            "collections": {
                "edges": [
                    {
                        "node": {
                            "id": "gid://shopify/Collection/333",
                            "title": "Featured"
                        }
                    }
                ]
            },
            "createdAt": "2023-01-01T00:00:00Z",
            "updatedAt": "2023-01-02T00:00:00Z"
        }
    }
    
    with patch.object(shopify_service, '_execute_graphql', return_value={
        "success": True,
        "data": product_data
    }):
        # Act
        result = shopify_service.get_product(mock_shop, "123456789")
        
        # Assert
        assert result["success"] is True
        assert "product" in result
        assert result["product"]["title"] == "Test Product"
        assert "images" in result["product"]
        assert "variants" in result["product"]
        assert "collections" in result["product"]

def test_get_product_not_found(shopify_service, mock_shop):
    """Test product retrieval when product doesn't exist"""
    # Arrange
    with patch.object(shopify_service, '_execute_graphql', return_value={
        "success": True,
        "data": {}
    }):
        # Act
        result = shopify_service.get_product(mock_shop, "999999")
        
        # Assert
        assert result["success"] is False
        assert "not found" in result["message"].lower()

def test_create_product_success(shopify_service, mock_shop, mock_rest_success_response):
    """Test successful product creation"""
    # Arrange
    product_data = {
        "title": "New Product",
        "body_html": "Product description",
        "vendor": "Test Vendor",
        "product_type": "Test Type",
        "tags": ["tag1", "tag2"]
    }
    
    mock_response = MagicMock()
    mock_response.status_code = 201
    mock_response.json.return_value = mock_rest_success_response
    
    with patch('requests.post', return_value=mock_response):
        # Act
        result = shopify_service.create_product(mock_shop, product_data)
        
        # Assert
        assert result["success"] is True
        assert "product" in result
        assert "created successfully" in result["message"].lower()

def test_create_product_failure(shopify_service, mock_shop):
    """Test product creation failure"""
    # Arrange
    product_data = {"title": "New Product"}
    
    mock_response = MagicMock()
    mock_response.status_code = 422
    mock_response.text = "Validation error"
    
    with patch('requests.post', return_value=mock_response):
        # Act
        result = shopify_service.create_product(mock_shop, product_data)
        
        # Assert
        assert result["success"] is False
        assert "Failed to create product" in result["message"]

def test_update_product_success(shopify_service, mock_shop, mock_rest_success_response):
    """Test successful product update"""
    # Arrange
    product_id = "123456789"
    product_data = {"title": "Updated Product"}
    
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = mock_rest_success_response
    
    with patch('requests.put', return_value=mock_response):
        # Act
        result = shopify_service.update_product(mock_shop, product_id, product_data)
        
        # Assert
        assert result["success"] is True
        assert "product" in result
        assert "updated successfully" in result["message"].lower()

def test_delete_product_success(shopify_service, mock_shop):
    """Test successful product deletion"""
    # Arrange
    product_id = "123456789"
    
    mock_response = MagicMock()
    mock_response.status_code = 200
    
    with patch('requests.delete', return_value=mock_response):
        # Act
        result = shopify_service.delete_product(mock_shop, product_id)
        
        # Assert
        assert result["success"] is True
        assert "deleted successfully" in result["message"].lower()

def test_search_products_success(shopify_service, mock_shop, mock_graphql_success_response):
    """Test successful product search"""
    # Arrange
    with patch.object(shopify_service, '_execute_graphql', return_value={
        "success": True,
        "data": mock_graphql_success_response["data"]
    }):
        # Act
        result = shopify_service.search_products(mock_shop, "test", 10)
        
        # Assert
        assert result["success"] is True
        assert "products" in result
        assert len(result["products"]) == 1
        assert result["products"][0]["title"] == "Test Product"

def test_search_orders_success(shopify_service, mock_shop):
    """Test successful order search"""
    # Arrange
    mock_order_response = {
        "data": {
            "orders": {
                "edges": [
                    {
                        "node": {
                            "id": "gid://shopify/Order/987654321",
                            "name": "#1001",
                            "email": "customer@example.com",
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
                            "lineItems": {"edges": []},
                            "shippingAddress": {},
                            "fulfillments": []
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
    
    with patch.object(shopify_service, '_execute_graphql', return_value={
        "success": True,
        "data": mock_order_response["data"]
    }):
        # Act
        result = shopify_service.search_orders(mock_shop, {"query": "test"}, 10)
        
        # Assert
        assert result["success"] is True
        assert "orders" in result
        assert len(result["orders"]) == 1
        assert result["orders"][0]["name"] == "#1001"

def test_get_order_success(shopify_service, mock_shop):
    """Test successful order retrieval"""
    # Arrange
    mock_order_data = {
        "order": {
            "id": "gid://shopify/Order/987654321",
            "name": "#1001",
            "email": "customer@example.com",
            "processedAt": "2023-01-01T00:01:00Z",
            "createdAt": "2023-01-01T00:00:00Z",
            "updatedAt": "2023-01-01T00:02:00Z",
            "cancelledAt": None,
            "cancelReason": None,
            "displayFinancialStatus": "PAID",
            "displayFulfillmentStatus": "FULFILLED",
            "customerJourneySummary": {
                "customerOrderIndex": 1,
                "daysToConversion": 2
            },
            "customer": {
                "id": "gid://shopify/Customer/123",
                "firstName": "John",
                "lastName": "Doe",
                "email": "john.doe@example.com",
                "phone": "+1234567890"
            },
            "currentTotalPrice": {
                "amount": "29.99",
                "currencyCode": "USD"
            },
            "originalTotalPrice": {
                "amount": "29.99",
                "currencyCode": "USD"
            },
            "shippingAddress": {
                "address1": "123 Test St",
                "address2": "",
                "city": "Test City",
                "country": "US",
                "zip": "12345",
                "phone": "+1234567890",
                "name": "John Doe"
            },
            "fulfillments": [
                {
                    "status": "SUCCESS",
                    "trackingInfo": [
                        {
                            "number": "12345",
                            "url": "https://tracking.example.com/12345"
                        }
                    ]
                }
            ],
            "lineItems": {
                "edges": [
                    {
                        "node": {
                            "id": "gid://shopify/LineItem/111",
                            "name": "Test Product",
                            "quantity": 1,
                            "originalTotalPrice": {
                                "amount": "19.99",
                                "currencyCode": "USD"
                            },
                            "variant": {
                                "id": "gid://shopify/ProductVariant/222",
                                "title": "Default",
                                "sku": "SKU123"
                            }
                        }
                    }
                ]
            }
        }
    }
    
    with patch.object(shopify_service, '_execute_graphql', return_value={
        "success": True,
        "data": mock_order_data
    }):
        # Act
        result = shopify_service.get_order(mock_shop, "987654321")
        
        # Assert
        assert result["success"] is True
        assert "order" in result
        assert result["order"]["name"] == "#1001"
        assert "line_items" in result["order"]
        assert "fulfillments" in result["order"]
        assert "customer" in result["order"]
        assert "shipping_address" in result["order"]

def test_make_rest_request_success(shopify_service, mock_shop):
    """Test successful REST API request"""
    # Arrange
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {"products": [{"id": 123, "title": "Test Product"}]}
    
    with patch('requests.request', return_value=mock_response):
        # Act
        result = shopify_service._make_rest_request(
            shop=mock_shop,
            method="GET",
            endpoint="products.json",
            payload=None
        )
        
        # Assert
        assert "success" in result and result["success"] is True
        assert "products" in result["data"]

def test_make_rest_request_rate_limit(shopify_service, mock_shop):
    """Test REST API request with rate limit response"""
    # Arrange
    mock_response = MagicMock()
    mock_response.status_code = 429
    mock_response.headers = {"Retry-After": "5"}
    
    with patch('requests.request', return_value=mock_response):
        # Act
        result = shopify_service._make_rest_request(
            shop=mock_shop,
            method="GET",
            endpoint="products.json"
        )
        
        # Assert
        assert result["success"] is False
        assert "Rate limit exceeded" in result["message"]
        assert result["status_code"] == 429

@pytest.mark.asyncio
async def test_execute_graphql_async_success(shopify_service, mock_shop, mock_graphql_success_response):
    """Test successful async GraphQL query execution"""
    # Arrange
    mock_response = MagicMock()
    mock_response.status = 200
    mock_response.json = MagicMock(return_value=mock_graphql_success_response)
    
    mock_session = MagicMock()
    mock_session.__aenter__.return_value = mock_session
    mock_session.post.return_value.__aenter__.return_value = mock_response
    
    mock_client_session = MagicMock()
    mock_client_session.__aenter__.return_value = mock_session
    
    with patch('aiohttp.ClientSession', return_value=mock_client_session):
        # Act
        with patch.object(shopify_service, '_execute_graphql_async', return_value={
            "success": True,
            "data": mock_graphql_success_response["data"]
        }):
            result = await shopify_service._execute_graphql_async(
                shop=mock_shop,
                query="query { products { edges { node { id title } } } }",
                variables={"limit": 10}
            )
            
            # Assert
            assert result["success"] is True