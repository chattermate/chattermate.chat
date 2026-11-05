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
from unittest.mock import patch, MagicMock
from app.tools.shopify_toolkit import ShopifyTools
from agno.tools.function import Function, FunctionCall
from app.tools.shopify_order_access import (
    EMAIL_REQUIRED,
    INVALID_ORDER_NUMBER,
    ORDER_NOT_FOUND,
    ORDER_NUMBER_REQUIRED,
)
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
        tool._customer_messages = lambda: [f"orders 1001 and 9999, {OWNER_EMAIL} or someone.else@example.com"]

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

OWNER_EMAIL = "john.doe@example.com"


def _order_node(name="#1001", email=OWNER_EMAIL, customer=None):
    """One GraphQL order node as Shopify's order search returns it."""
    return {
        "id": "gid://shopify/Order/987654321",
        "name": name,
        "email": email,
        "phone": None,
        "createdAt": "2023-01-01T00:00:00Z",
        "displayFinancialStatus": "PAID",
        "displayFulfillmentStatus": "FULFILLED",
        "subtotalLineItemsQuantity": 1,
        "currentSubtotalPriceSet": {"shopMoney": {"amount": "24.99", "currencyCode": "USD"}},
        "currentTotalPriceSet": {"shopMoney": {"amount": "29.99", "currencyCode": "USD"}},
        "originalTotalPriceSet": {"shopMoney": {"amount": "29.99", "currencyCode": "USD"}},
        "customer": customer,
        "lineItems": {"edges": [{"node": {
            "title": "Test Product",
            "quantity": 1,
            "originalUnitPriceSet": {"shopMoney": {"amount": "19.99", "currencyCode": "USD"}},
            "variant": {"id": "variant-id", "title": "Default", "image": {"url": "https://example.com/image.jpg"}},
        }}]},
        "shippingAddress": {"address1": "123 Test St", "city": "Testville", "provinceCode": "CA",
                            "zip": "12345", "country": "US"},
        "fulfillments": [{"trackingInfo": [{"company": "USPS", "number": "12345",
                                            "url": "https://tracking.usps.com/12345"}],
                          "status": "SUCCESS"}],
    }


def _orders_response(*nodes):
    response = MagicMock()
    response.status_code = 200
    response.json.return_value = {"data": {"orders": {
        "edges": [{"node": node} for node in nodes],
        "pageInfo": {"hasNextPage": False, "endCursor": "cursor-value"},
    }}}
    return response


def _sent_search(mock_post):
    return mock_post.call_args.kwargs["json"]["variables"]["query"]


def test_search_orders(shopify_tools):
    with patch("requests.post", return_value=_orders_response(_order_node())) as mock_post:
        result = json.loads(shopify_tools.search_orders(customer_email=" John.Doe@Example.com ", order_number="#1001"))

    assert result["success"] is True
    assert len(result["orders"]) == 1
    assert result["orders"][0]["name"] == "#1001"
    assert result["orders"][0]["financial_status"] == "PAID"
    assert result["orders"][0]["tracking_info"][0]["number"] == "12345"
    assert _sent_search(mock_post) == "email:john.doe@example.com AND name:1001"
    assert mock_post.call_args.args[0] == "https://test-shop.myshopify.com/admin/api/2025-10/graphql.json"


def test_search_orders_honours_the_admin_base_override(shopify_tools, monkeypatch):
    monkeypatch.setattr("app.services.shopify_urls.SHOPIFY_ADMIN_BASE", "http://127.0.0.1:14020/shopify")
    with patch("requests.post", return_value=_orders_response(_order_node())) as mock_post:
        shopify_tools.search_orders(customer_email="john.doe@example.com", order_number="#1001")

    assert mock_post.call_args.args[0] == (
        "http://127.0.0.1:14020/shopify/test-shop.myshopify.com/admin/api/2025-10/graphql.json"
    )


def test_search_orders_matches_the_customer_record_email(shopify_tools):
    node = _order_node(email="checkout@example.com", customer={"id": "c1", "firstName": "John",
                                                               "lastName": "Doe", "email": OWNER_EMAIL})
    with patch("requests.post", return_value=_orders_response(node)):
        result = json.loads(shopify_tools.search_orders(customer_email=OWNER_EMAIL, order_number="1001"))

    assert result["success"] is True
    assert "John Doe" in result["message"]


@pytest.mark.parametrize("email", [None, "", "not-an-email", "*@example.com",
                                   "a@example.com OR name:1001", 'a"@example.com'])
def test_search_orders_needs_a_plain_email(shopify_tools, email):
    with patch("requests.post") as mock_post:
        result = json.loads(shopify_tools.search_orders(customer_email=email, order_number="1001"))

    assert result["success"] is False
    assert result["requires_user_input"] is True
    mock_post.assert_not_called()


@pytest.mark.parametrize("number", [None, "", "   ", "#"])
def test_an_email_alone_lists_nothing(shopify_tools, number):
    """A typed email proves nothing, so it must not reach the store at all."""
    with patch("requests.post") as mock_post:
        result = json.loads(shopify_tools.search_orders(customer_email=OWNER_EMAIL, order_number=number))

    assert result == {"success": False, "message": ORDER_NUMBER_REQUIRED, "requires_user_input": True}
    mock_post.assert_not_called()


@pytest.mark.parametrize("number", ["10 OR 1", "1001*", "-1001", "name:1001", "1001 OR email:a@b.co", '1001"'])
def test_search_orders_refuses_order_numbers_with_search_syntax(shopify_tools, number):
    with patch("requests.post") as mock_post:
        result = json.loads(shopify_tools.search_orders(customer_email=OWNER_EMAIL, order_number=number))

    assert result == {"success": False, "message": INVALID_ORDER_NUMBER, "requires_user_input": True}
    mock_post.assert_not_called()


@pytest.mark.parametrize("number", ["#1001", "1001", " #1001 ", "# 1001"])
def test_search_orders_takes_either_number_format(shopify_tools, number):
    with patch("requests.post", return_value=_orders_response(_order_node())) as mock_post:
        result = json.loads(shopify_tools.search_orders(customer_email=OWNER_EMAIL, order_number=number))

    assert result["success"] is True
    assert _sent_search(mock_post) == f"email:{OWNER_EMAIL} AND name:1001"


def test_search_orders_returns_only_the_order_asked_for(shopify_tools):
    """Shopify's name search is fuzzy, so one search can bring back near misses."""
    near_misses = [_order_node(name="#10010"), _order_node(name="#1001"), _order_node(name="#21001")]
    with patch("requests.post", return_value=_orders_response(*near_misses)):
        result = json.loads(shopify_tools.search_orders(customer_email=OWNER_EMAIL, order_number="1001"))

    assert [order["name"] for order in result["orders"]] == ["#1001"]


def test_a_right_number_and_wrong_email_match_a_missing_order(shopify_tools):
    """Same answer for both, so the reply never confirms that an order exists."""
    with patch("requests.post", return_value=_orders_response(_order_node(email="owner@example.com"))):
        wrong_email = json.loads(shopify_tools.search_orders(customer_email=OWNER_EMAIL, order_number="1001"))
    with patch("requests.post", return_value=_orders_response()):
        no_order = json.loads(shopify_tools.search_orders(customer_email=OWNER_EMAIL, order_number="1001"))

    assert wrong_email == no_order == {"success": False, "message": ORDER_NOT_FOUND}


@pytest.mark.parametrize("written,asked_for", [
    # The live model filled in the account email and the "#1001" from its own prompt
    ([], EMAIL_REQUIRED),
    (["where is my order?"], EMAIL_REQUIRED),
    (["it's order 1001"], EMAIL_REQUIRED),
    ([f"my email is {OWNER_EMAIL}"], ORDER_NUMBER_REQUIRED),
    ([f"my email is {OWNER_EMAIL}, order 21001"], ORDER_NUMBER_REQUIRED),
])
@pytest.mark.parametrize("tool", ["search_orders", "get_order_status"])
def test_only_what_the_customer_wrote_counts(shopify_tools, mock_shopify_service, tool, written, asked_for):
    shopify_tools._customer_messages = lambda: written
    with patch("requests.post") as mock_post:
        result = json.loads(getattr(shopify_tools, tool)(customer_email=OWNER_EMAIL, order_number="1001"))

    assert result == {"success": False, "message": asked_for, "requires_user_input": True}
    mock_post.assert_not_called()
    mock_shopify_service.get_order.assert_not_called()


@pytest.mark.parametrize("tool", ["search_orders", "get_order_status"])
def test_the_details_can_come_in_separate_messages(shopify_tools, mock_shopify_service, tool):
    shopify_tools._customer_messages = lambda: ["It's #1001.", "hi", OWNER_EMAIL.upper()]
    with patch("requests.post", return_value=_orders_response(_order_node())) as mock_post:
        getattr(shopify_tools, tool)(customer_email=OWNER_EMAIL, order_number="1001")

    mock_post.assert_called_once()


def test_the_customer_messages_come_from_this_conversation(mock_db):
    tools = ShopifyTools(agent_id="agent", org_id="org", session_id="session")
    with patch("app.tools.shopify_toolkit.SessionLocal") as session_local, \
         patch("app.tools.shopify_toolkit.ChatRepository") as repository:
        session_local.return_value.__enter__.return_value = mock_db
        repository.return_value.get_customer_messages.return_value = ["hello"]

        assert tools._customer_messages() == ["hello"]

    repository.assert_called_once_with(mock_db)
    repository.return_value.get_customer_messages.assert_called_once_with("session")


@pytest.mark.parametrize("tool", ["search_orders", "get_order_status"])
def test_an_unreadable_conversation_shares_nothing(shopify_tools, tool):
    def unreadable():
        raise RuntimeError("database down")
    shopify_tools._customer_messages = unreadable
    with patch("requests.post") as mock_post:
        result = json.loads(getattr(shopify_tools, tool)(customer_email=OWNER_EMAIL, order_number="1001"))

    assert result["success"] is False
    assert "database down" not in result["message"]
    mock_post.assert_not_called()


def test_the_model_is_told_both_details_are_required(shopify_tools):
    schema = Function.from_callable(shopify_tools.search_orders).to_dict()["parameters"]
    assert set(schema["required"]) == {"customer_email", "order_number"}
    assert "limit" not in schema["properties"]


def test_a_call_that_leaves_out_the_number_never_reaches_the_store(shopify_tools):
    """What agno does with a model that ignores the schema."""
    function = shopify_tools.functions["search_orders"]
    with patch("requests.post") as mock_post:
        call = FunctionCall(function=function, arguments={"customer_email": OWNER_EMAIL})
        call.execute()

    mock_post.assert_not_called()


def test_search_orders_hides_other_customers_orders(shopify_tools):
    # Shopify's search is fuzzy; anything not placed with this exact email is dropped.
    stranger = _order_node(email="someone.else@example.com")
    with patch("requests.post", return_value=_orders_response(stranger)):
        result = json.loads(shopify_tools.search_orders(customer_email=OWNER_EMAIL, order_number="1001"))

    assert result == {"success": False, "message": ORDER_NOT_FOUND}


def test_search_orders_needs_the_exact_order_number(shopify_tools):
    with patch("requests.post", return_value=_orders_response(_order_node(name="#10010"))):
        result = json.loads(shopify_tools.search_orders(customer_email=OWNER_EMAIL, order_number="1001"))

    assert result == {"success": False, "message": ORDER_NOT_FOUND}


def test_search_orders_hides_shopify_error_details(shopify_tools):
    response = MagicMock(status_code=500, text="internal detail")
    with patch("requests.post", return_value=response):
        result = json.loads(shopify_tools.search_orders(customer_email=OWNER_EMAIL, order_number="1001"))

    assert result["success"] is False
    assert "internal detail" not in result["message"]


def test_get_order_status(shopify_tools, mock_shopify_service):
    with patch("requests.post", return_value=_orders_response(_order_node())) as mock_post:
        result = json.loads(shopify_tools.get_order_status(order_number="#1001", customer_email=OWNER_EMAIL))

    assert result["success"] is True
    assert result["order_number"] == "#1001"
    assert result["status"] == "paid"
    assert result["fulfillment_status"] == "fulfilled"
    assert result["tracking_numbers"][0] == "12345"
    assert result["shop_domain"] == "test-shop.myshopify.com"
    assert _sent_search(mock_post) == "email:john.doe@example.com AND name:1001"
    mock_shopify_service.get_order.assert_called_once()
    assert mock_shopify_service.get_order.call_args.args[1] == "987654321"


@pytest.mark.parametrize("order_number,email", [("1001", None), ("1001", ""), (None, OWNER_EMAIL),
                                                ("", OWNER_EMAIL), ("10 OR 1", OWNER_EMAIL)])
def test_get_order_status_needs_number_and_email(shopify_tools, mock_shopify_service, order_number, email):
    with patch("requests.post") as mock_post:
        result = json.loads(shopify_tools.get_order_status(order_number=order_number, customer_email=email))

    assert result["success"] is False
    assert result["requires_user_input"] is True
    mock_post.assert_not_called()
    mock_shopify_service.get_order.assert_not_called()


def test_get_order_status_wrong_email_looks_like_a_missing_order(shopify_tools, mock_shopify_service):
    with patch("requests.post", return_value=_orders_response(_order_node())):
        wrong_email = json.loads(shopify_tools.get_order_status(order_number="1001",
                                                                customer_email="someone.else@example.com"))
    with patch("requests.post", return_value=_orders_response()):
        missing = json.loads(shopify_tools.get_order_status(order_number="9999", customer_email=OWNER_EMAIL))

    assert wrong_email == missing == {"success": False, "message": ORDER_NOT_FOUND}
    mock_shopify_service.get_order.assert_not_called()


def test_get_order_status_rechecks_the_full_record(shopify_tools, mock_shopify_service):
    mock_shopify_service.get_order.return_value["order"]["customer"]["email"] = "someone.else@example.com"
    with patch("requests.post", return_value=_orders_response(_order_node())):
        result = json.loads(shopify_tools.get_order_status(order_number="1001", customer_email=OWNER_EMAIL))

    assert result == {"success": False, "message": ORDER_NOT_FOUND}


def test_get_order_status_guest_checkout(shopify_tools, mock_shopify_service):
    order = mock_shopify_service.get_order.return_value["order"]
    order["customer"] = None
    order["email"] = OWNER_EMAIL
    with patch("requests.post", return_value=_orders_response(_order_node())):
        result = json.loads(shopify_tools.get_order_status(order_number="1001", customer_email=OWNER_EMAIL))

    assert result["success"] is True
    assert result["customer"] == {}

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