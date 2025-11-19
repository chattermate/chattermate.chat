"""
ChatterMate - Shopify Toolkit
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

from typing import Optional, Dict, Any, List
from agno.tools import Toolkit
from app.core.logger import get_logger
from app.services.shopify import ShopifyService
from app.repositories.session_to_agent import SessionToAgentRepository
from app.database import SessionLocal
from app.models.organization import Organization
from app.models.agent import Agent
from app.models.shopify import AgentShopifyConfig, ShopifyShop
from app.repositories.shopify_shop_repository import ShopifyShopRepository
from app.repositories.agent_shopify_config_repository import AgentShopifyConfigRepository
from uuid import UUID
import json
import traceback
from app.core.config import settings
from app.core.redis import get_redis
import time

logger = get_logger(__name__)

def create_minimal_product(product: dict) -> dict:
    """
    Create minimal product object for LLM (remove unnecessary fields to reduce tokens).
    Only includes fields needed for LLM reasoning.
    """
    return {
        "id": product.get("id"),
        "title": product.get("title"),
        "price": product.get("price"),
        "price_max": product.get("price_max"),
        "currency": product.get("currency"),
        "vendor": product.get("vendor"),
        "product_type": product.get("product_type"),
        "total_inventory": product.get("total_inventory"),
        "tags": product.get("tags", [])
    }

class ShopifyTools(Toolkit):
    def __init__(self, agent_id: str, org_id: str, session_id: str):
        super().__init__(name="shopify_tools")
        self.agent_id = agent_id
        self.org_id = org_id
        self.session_id = session_id
        
        # Register the functions
        self.register(self.list_products)
        self.register(self.get_product)
        self.register(self.search_products)
        self.register(self.search_orders)
        self.register(self.get_order_status)
        self.register(self.recommend_products)
    
    def _get_shop_for_agent(self) -> Optional[ShopifyShop]:
        """
        Helper method to get the Shopify shop associated with the agent.
        
        Returns:
            ShopifyShop: The shop associated with the agent, or None if not found or not enabled.
        """
        try:
            logger.debug(f"Getting shop for agent {self.agent_id}")
            
            with SessionLocal() as db:
                # Get the agent's Shopify configuration
                agent_shopify_config_repo = AgentShopifyConfigRepository(db)
                shopify_config = agent_shopify_config_repo.get_agent_shopify_config(str(self.agent_id))
                
                if not shopify_config or not shopify_config.enabled or not shopify_config.shop_id:
                    logger.warning("Shopify integration is not enabled for this agent")
                    return None
                    
                # Get the shop
                shopify_repo = ShopifyShopRepository(db)
                shop = shopify_repo.get_shop(shopify_config.shop_id)
                
                if not shop or not shop.is_installed:
                    logger.warning("Shopify shop not found or not installed")
                    return None
                    
                # Verify the shop belongs to the current organization
                org_uuid = UUID(str(self.org_id))
                if str(shop.organization_id) != str(org_uuid):
                    logger.warning(f"Shop {shop.id} does not belong to organization {self.org_id}")
                    return None
                    
                return shop
            
        except Exception as e:
            logger.error(f"Error getting shop for agent: {str(e)}")
            return None
    
    def list_products(self, limit: int = 10) -> str:
        """
        List products from the Shopify store.
        
        Args:
            limit: Maximum number of products to return (default: 10)
            
        Returns:
            str: JSON string with the list of products or error information
        """
        try:
            # Get the Shopify shop for this agent
            shop = self._get_shop_for_agent()
            
            if not shop:
                return json.dumps({
                    "success": False,
                    "message": "Shopify integration is not enabled for this agent or shop not found"
                })
                
            # List products using context manager for database operations
            with SessionLocal() as db:
                shopify_service = ShopifyService(db)
                result = shopify_service.get_products(shop, limit)
                
                # Convert to more LLM-friendly text format
                if result.get("success") and result.get("products"):
                    products = result["products"]

                    # Try to cache products in Redis
                    redis_client = get_redis()
                    product_cache_key = None

                    if redis_client:
                        try:
                            # Delete old cache entries for this session
                            old_cache_pattern = f"shopify_products:{self.session_id}:*"
                            old_keys = redis_client.keys(old_cache_pattern)
                            if old_keys:
                                redis_client.delete(*old_keys)
                                logger.debug(f"Deleted {len(old_keys)} old cache entries for session {self.session_id}")

                            # Create cache key with session and timestamp
                            timestamp = int(time.time())
                            product_cache_key = f"shopify_products:{self.session_id}:{timestamp}"

                            # Store full products in Redis with 5-minute TTL
                            redis_client.setex(
                                product_cache_key,
                                300,  # 5 minutes
                                json.dumps({
                                    "products": products,
                                    "shop_domain": shop.shop_domain
                                })
                            )
                            logger.debug(f"Cached {len(products)} listed products with key: {product_cache_key}")
                        except Exception as e:
                            logger.error(f"Failed to cache listed products in Redis: {str(e)}")
                            product_cache_key = None

                    # Return minimal products to LLM (reduce tokens while allowing reasoning)
                    # Full products are in Redis cache
                    product_ids = [p.get("id") for p in products]
                    minimal_products = [create_minimal_product(p) for p in products]

                    return json.dumps({
                        "success": True,
                        "message": f"Here are {len(products)} products from the store.",
                        "shopify_output": {
                            "products": minimal_products,
                            "product_cache_key": product_cache_key,
                            "product_ids": product_ids,
                            "total_count": len(products),
                            "shop_domain": shop.shop_domain
                        }
                    })

                return json.dumps(result)
            
        except Exception as e:
            logger.error(f"Error listing products: {str(e)}")
            return json.dumps({
                "success": False,
                "message": f"Error listing products: {str(e)}"
            })
    
    def get_product(self, product_id: str) -> str:
        """
        Get a specific product from the Shopify store.
        
        Args:
            product_id: The ID of the product to retrieve
            
        Returns:
            str: JSON string with the product details or error information
        """
        try:
            # Get the Shopify shop for this agent
            shop = self._get_shop_for_agent()
            
            if not shop:
                return json.dumps({
                    "success": False,
                    "message": "Shopify integration is not enabled for this agent or shop not found"
                })
                
            # Get the product using context manager for database operations
            with SessionLocal() as db:
                shopify_service = ShopifyService(db)
                result = shopify_service.get_product(shop, product_id)
            
            # Check if product was found
            if result.get("success", False) and result.get("product"):
                product = result.get("product")
                tags_str = ", ".join(product.get("tags", [])) if product.get("tags") else "None"
                
                # Create detailed text description for LLM
                text_message = (
                    f"Product Details:\n\n"
                    f"Title: {product.get('title', 'N/A')}\n"
                    f"Price: {product.get('currency', 'USD')} {product.get('price', 'N/A')}\n"
                    f"Vendor: {product.get('vendor', 'N/A')}\n"
                    f"Type: {product.get('product_type', 'N/A')}\n"
                    f"In Stock: {product.get('total_inventory', 'N/A')} units\n"
                    f"Tags: {tags_str}\n"
                )
                
                if product.get('description'):
                    text_message += f"Description: {product['description']}\n"
                
                # Format as a product card
                return json.dumps({
                    "success": True,
                    "message": text_message,
                    "shopify_product": product,
                    "shop_domain": shop.shop_domain  # Add shop domain for frontend URL construction
                })
            else:
                # Product not found or error
                return json.dumps(result)
            
        except Exception as e:
            logger.error(f"Error getting product: {str(e)}")
            return json.dumps({
                "success": False,
                "message": f"Error getting product: {str(e)}"
            })
    
    def search_products(self, query: str, limit: int = 8, cursor: Optional[str] = None, min_price: Optional[float] = None, max_price: Optional[float] = None, vendor: Optional[str] = None) -> str:
        """
        Search for products in the Shopify store using a query string with GraphQL.
        Supports Shopify's search syntax including field specifiers (e.g., 'title:snowboard', 'tag:beginner', 'product_type:skate'),
        operators ('AND', 'OR'), and suffix wildcards ('skate*'). Supports pagination using a cursor.

        Args:
            query: The search query string using Shopify syntax.
            limit: Maximum number of products to return (default: 8)
            cursor: The pagination cursor (endCursor from previous pageInfo) to fetch the next page.
            min_price: Optional minimum price filter (e.g., 100.00 for products >= $100)
            max_price: Optional maximum price filter (e.g., 500.00 for products <= $500)
            vendor: Optional vendor/brand filter (e.g., 'Nike', 'Adidas')

        Returns:
            str: JSON string. If products are found, includes 'shopify_output' with the list of products,
                 'search_query', 'total_count', and 'pageInfo'. If no products are found, returns a success message.
                 On error, returns an error message.
        """
        try:
            # Get the Shopify shop for this agent
            shop = self._get_shop_for_agent()
            
            if not shop:
                return json.dumps({
                    "success": False,
                    "message": "Shopify integration is not enabled for this agent or shop not found"
                })
            
            # Use GraphQL to search products with pagination
            graphql_query = """
            query SearchProducts($searchTerm: String!, $limit: Int!, $cursor: String) {
              products(first: $limit, query: $searchTerm, after: $cursor) {
                edges {
                  node {
                    id
                    title
                    description
                    handle
                    productType
                    vendor
                    totalInventory
                    priceRangeV2 {
                      minVariantPrice {
                        amount
                        currencyCode
                      }
                      maxVariantPrice {
                        amount
                        currencyCode
                      }
                    }
                    images(first: 1) {
                      edges {
                        node {
                          id
                          url
                          altText
                        }
                      }
                    }
                    tags
                    createdAt
                    updatedAt
                  }
                }
                pageInfo {
                  hasNextPage
                  endCursor
                }
              }
            }
            """
            
            # Add status:active filter to only return active products (exclude archived and draft)
            # Add inventory_total:>0 to only return in-stock products
            filtered_query = f"({query}) AND status:active AND inventory_total:>0"

            # Add price filters if provided
            if min_price is not None:
                filtered_query += f" AND price:>={min_price}"
            if max_price is not None:
                filtered_query += f" AND price:<={max_price}"

            # Add vendor filter if provided
            if vendor:
                filtered_query += f" AND vendor:'{vendor}'"

            variables = {
                "searchTerm": filtered_query,
                "limit": limit,
                "cursor": cursor if cursor else None # Pass None instead of empty string
            }
            
            # Execute the GraphQL query
            url = f"https://{shop.shop_domain}/admin/api/2025-10/graphql.json"
            headers = {
                "X-Shopify-Access-Token": shop.access_token,
                "Content-Type": "application/json"
            }
            
            payload = {
                "query": graphql_query,
                "variables": variables
            }
            
            import requests
            verify_ssl = settings.VERIFY_SSL_CERTIFICATES
            response = requests.post(url, headers=headers, json=payload, verify=verify_ssl)
            
            if response.status_code != 200:
                logger.error(f"Failed to search products: {response.text}")
                return json.dumps({
                    "success": False,
                    "message": f"Failed to search products: {response.text}"
                })
            
            result = response.json()
            
            # Check for GraphQL errors
            if "errors" in result:
                logger.error(f"GraphQL errors: {result['errors']}")
                return json.dumps({
                    "success": False,
                    "message": f"GraphQL errors: {result['errors']}"
                })
            
            # Transform the GraphQL data structure
            products_data = result.get("data", {}).get("products", {})
            edges = products_data.get("edges", [])
            page_info = products_data.get("pageInfo", {})
            
            # Extract products from edges
            products = []
            for edge in edges:
                node = edge.get("node", {})
                
                # Extract the first image URL if available
                image_url = None
                images = node.get("images", {}).get("edges", [])
                if images and len(images) > 0:
                    image_url = images[0].get("node", {}).get("url")
                
                # Extract price information
                price_range = node.get("priceRangeV2", {})
                min_price = price_range.get("minVariantPrice", {}).get("amount")
                max_price = price_range.get("maxVariantPrice", {}).get("amount")
                currency_code = price_range.get("minVariantPrice", {}).get("currencyCode")
                
                # Transform to product structure
                transformed_product = {
                    "id": node.get("id").split("/")[-1] if node.get("id") else None,
                    "title": node.get("title"),
                    "description": node.get("description"),
                    "handle": node.get("handle"),
                    "product_type": node.get("productType"),
                    "vendor": node.get("vendor"),
                    "total_inventory": node.get("totalInventory"),
                    "price": min_price,
                    "price_max": max_price,
                    "currency": currency_code,
                    "image": {"src": image_url} if image_url else None,
                    "tags": node.get("tags"),
                    "created_at": node.get("createdAt"),
                    "updated_at": node.get("updatedAt")
                }
                
                products.append(transformed_product)
            
            # Check if search was successful
            if products:
                # Try to cache products in Redis
                redis_client = get_redis()
                product_cache_key = None

                if redis_client:
                    try:
                        # Delete old cache entries for this session
                        old_cache_pattern = f"shopify_products:{self.session_id}:*"
                        old_keys = redis_client.keys(old_cache_pattern)
                        if old_keys:
                            redis_client.delete(*old_keys)
                            logger.debug(f"Deleted {len(old_keys)} old cache entries for session {self.session_id}")

                        # Create cache key with session and timestamp
                        timestamp = int(time.time())
                        product_cache_key = f"shopify_products:{self.session_id}:{timestamp}"

                        # Store full products in Redis with 5-minute TTL
                        redis_client.setex(
                            product_cache_key,
                            300,  # 5 minutes
                            json.dumps({
                                "products": products,
                                "search_query": query,
                                "total_count": len(products),
                                "pageInfo": page_info,
                                "shop_domain": shop.shop_domain
                            })
                        )
                        logger.debug(f"Cached {len(products)} products with key: {product_cache_key}")
                    except Exception as e:
                        logger.error(f"Failed to cache products in Redis: {str(e)}")
                        product_cache_key = None

                # Return minimal products to LLM (reduce tokens while allowing reasoning)
                # Full products are in Redis cache
                text_message = f"Found {len(products)} product(s) matching your search."
                product_ids = [p.get("id") for p in products]
                minimal_products = [create_minimal_product(p) for p in products]

                return json.dumps({
                    "success": True,
                    "message": text_message,
                    "shopify_output": {
                        "products": minimal_products,  # Minimal products for LLM reasoning
                        "product_cache_key": product_cache_key,  # Cache key for backend optimization
                        "product_ids": product_ids,  # Product IDs for reference
                        "search_query": query,
                        "total_count": len(products),
                        "pageInfo": page_info,
                        "shop_domain": shop.shop_domain
                    }
                })
            else:
                # No products found
                return json.dumps({
                    "success": True,
                    "message": f"No products found matching '{query}'. Try a different search term."
                    # Keep shopify_output or make it null/empty based on frontend handling
                    # "shopify_output": {"products": [], "search_query": query}
                })
            
        except Exception as e:
            logger.error(f"Error searching products: {str(e)}")
            logger.error(traceback.format_exc())
            return json.dumps({
                "success": False,
                "message": f"Error searching products: {str(e)}"
            })
    
   
    def search_orders(self, query: str = None, customer_email: str = None, order_number: str = None, limit: int = 10) -> str:
        """
        Search for orders in the Shopify store using GraphQL API.
        
        Args:
            query: General search query for orders
            customer_email: Customer's email address to filter orders
            order_number: Specific order number to search for
            limit: Maximum number of orders to return (default: 10)
            
        Returns:
            str: JSON string with the matching orders or error information
        """
        try:
            # Validate that at least one search parameter is provided
            if not query and not customer_email and not order_number:
                return json.dumps({
                    "success": False,
                    "message": "Please provide at least one search parameter: order number, email address, or search query. Ask the user for this information if not provided.",
                    "requires_user_input": True
                })
            
            # Get the Shopify shop for this agent
            shop = self._get_shop_for_agent()
            
            if not shop:
                return json.dumps({
                    "success": False,
                    "message": "Shopify integration is not enabled for this agent or shop not found"
                })

            # Construct the search query
            search_terms = []
            if query and query.strip():
                search_terms.append(query.strip())
            if customer_email and customer_email.strip():
                search_terms.append(f"email:{customer_email.strip()}")
            if order_number and order_number.strip():
                search_terms.append(f"name:{order_number.strip()}")

            # Join search terms with AND operator
            search_query = " AND ".join(search_terms) if search_terms else ""

            # GraphQL query for orders with correct field names (updated based on Shopify's schema)
            graphql_query = """
            query SearchOrders($query: String, $first: Int!) {
              orders(first: $first, query: $query, sortKey: CREATED_AT, reverse: true) {
                edges {
                  node {
                    id
                    name
                    email
                    phone
                    createdAt
                    displayFinancialStatus
                    displayFulfillmentStatus
                    subtotalLineItemsQuantity
                    currentSubtotalPriceSet {
                      shopMoney {
                        amount
                        currencyCode
                      }
                    }
                    currentTotalPriceSet {
                      shopMoney {
                        amount
                        currencyCode
                      }
                    }
                    originalTotalPriceSet {
                      shopMoney {
                        amount
                        currencyCode
                      }
                    }
                    customer {
                      id
                      firstName
                      lastName
                      email
                    }
                    lineItems(first: 5) {
                      edges {
                        node {
                          title
                          quantity
                          originalUnitPriceSet {
                            shopMoney {
                              amount
                              currencyCode
                            }
                          }
                          variant {
                            id
                            title
                            image {
                              url
                            }
                          }
                        }
                      }
                    }
                    shippingAddress {
                      address1
                      address2
                      city
                      provinceCode
                      zip
                      country
                    }
                    fulfillments {
                      trackingInfo {
                        company
                        number
                        url
                      }
                      status
                    }
                  }
                }
                pageInfo {
                  hasNextPage
                  endCursor
                }
              }
            }
            """

            # Execute the GraphQL query
            url = f"https://{shop.shop_domain}/admin/api/2025-10/graphql.json"
            headers = {
                "X-Shopify-Access-Token": shop.access_token,
                "Content-Type": "application/json"
            }
            
            variables = {
                "query": search_query,
                "first": limit
            }
            
            payload = {
                "query": graphql_query,
                "variables": variables
            }
            
            import requests
            verify_ssl = settings.VERIFY_SSL_CERTIFICATES
            response = requests.post(url, headers=headers, json=payload, verify=verify_ssl)
            
            if response.status_code != 200:
                logger.error(f"Failed to search orders: {response.text}")
                return json.dumps({
                    "success": False,
                    "message": f"Failed to search orders: {response.text}"
                })
            
            result = response.json()
            
            # Check for GraphQL errors
            if "errors" in result:
                logger.error(f"GraphQL errors: {result['errors']}")
                return json.dumps({
                    "success": False,
                    "message": f"GraphQL errors: {result['errors']}"
                })
            
            # Transform the GraphQL data structure
            orders_data = result.get("data", {}).get("orders", {})
            edges = orders_data.get("edges", [])
            page_info = orders_data.get("pageInfo", {})
            
            # Extract orders from edges
            orders = []
            for edge in edges:
                node = edge.get("node", {})
                
                # Transform line items
                line_items = []
                for item_edge in node.get("lineItems", {}).get("edges", []):
                    item_node = item_edge.get("node", {})
                    variant = item_node.get("variant")
                    original_unit_price_set = item_node.get("originalUnitPriceSet", {}).get("shopMoney", {})
                    
                    # Parse price which is now nested
                    try:
                        price_amount = float(original_unit_price_set.get("amount")) if original_unit_price_set.get("amount") is not None else None
                    except (ValueError, TypeError):
                        price_amount = None
                    
                    # Handle case where variant might be None
                    variant_title = None
                    image_url = None
                    if variant:
                        variant_title = variant.get("title")
                        image_data = variant.get("image")
                        if image_data:
                            image_url = image_data.get("url")

                    line_items.append({
                        "title": item_node.get("title"),
                        "quantity": item_node.get("quantity"),
                        "price": price_amount,
                        "variant_title": variant_title,
                        "image_url": image_url
                    })
                
                # Get price information - access via Set and shopMoney
                current_total_set = node.get("currentTotalPriceSet", {}).get("shopMoney", {})
                original_total_set = node.get("originalTotalPriceSet", {}).get("shopMoney", {})
                subtotal_set = node.get("currentSubtotalPriceSet", {}).get("shopMoney", {})
                
                # Process tracking information from fulfillments
                tracking_info = []
                for fulfillment in node.get("fulfillments", []):
                    for tracking in fulfillment.get("trackingInfo", []):
                        tracking_info.append({
                            "company": tracking.get("company"),
                            "number": tracking.get("number"),
                            "url": tracking.get("url")
                        })
                
                # Transform order data
                order = {
                    "id": node.get("id").split("/")[-1] if node.get("id") else None,
                    "name": node.get("name"),
                    "email": node.get("email"),
                    "phone": node.get("phone"),
                    "created_at": node.get("createdAt"),
                    "financial_status": node.get("displayFinancialStatus"),
                    "fulfillment_status": node.get("displayFulfillmentStatus"),
                    "total_items": node.get("subtotalLineItemsQuantity"),
                    "current_total": current_total_set.get("amount"),
                    "original_total": original_total_set.get("amount"),
                    "subtotal": subtotal_set.get("amount"),
                    "currency": current_total_set.get("currencyCode"),
                    "customer": {
                        "id": node.get("customer", {}).get("id"),
                        "first_name": node.get("customer", {}).get("firstName"),
                        "last_name": node.get("customer", {}).get("lastName"),
                        "email": node.get("customer", {}).get("email")
                    },
                    "line_items": line_items,
                    "shipping_address": node.get("shippingAddress"),
                    "tracking_info": tracking_info
                }
                
                orders.append(order)
            
            # Create text summary for LLM
            if orders:
                order_summaries = []
                for idx, order in enumerate(orders, 1):
                    customer_name = f"{order['customer'].get('first_name', '')} {order['customer'].get('last_name', '')}".strip()
                    customer_info = customer_name if customer_name else order.get('email', 'N/A')
                    
                    summary = (
                        f"{idx}. Order {order['name']}\n"
                        f"   - Customer: {customer_info}\n"
                        f"   - Total: {order['currency']} {order['current_total']}\n"
                        f"   - Status: {order['financial_status']}\n"
                        f"   - Fulfillment: {order['fulfillment_status']}\n"
                        f"   - Items: {order['total_items']}\n"
                        f"   - Created: {order['created_at']}"
                    )
                    
                    # Add tracking info if available
                    if order.get('tracking_info'):
                        tracking_numbers = [t.get('number') for t in order['tracking_info'] if t.get('number')]
                        if tracking_numbers:
                            summary += f"\n   - Tracking: {', '.join(tracking_numbers)}"
                    
                    order_summaries.append(summary)
                
                text_message = (
                    f"Found {len(orders)} order(s):\n\n"
                    + "\n\n".join(order_summaries)
                )
            else:
                text_message = "No orders found matching your search criteria."
            
            # Return success response with orders and pagination info
            return json.dumps({
                "success": True,
                "message": text_message,
                "orders": orders,
                "page_info": page_info,
                "shop_domain": shop.shop_domain
            })
            
        except Exception as e:
            logger.error(f"Error searching orders: {str(e)}")
            logger.error(traceback.format_exc())
            return json.dumps({
                "success": False,
                "message": f"Error searching orders: {str(e)}"
            })
    
    def get_order_status(self, order_id: str) -> str:
        """
        Get the status of a specific order from the Shopify store.
        
        Args:
            order_id: The order number (e.g., "1001", "#1001") or internal Shopify order ID
            
        Returns:
            str: JSON string with order status details or error information
        """
        try:
            # Get the Shopify shop for this agent
            shop = self._get_shop_for_agent()
            
            if not shop:
                return json.dumps({
                    "success": False,
                    "message": "Shopify integration is not enabled for this agent or shop not found"
                })
            
            # Clean up order_id - remove # if present
            order_identifier = order_id.strip().lstrip('#')
            logger.debug(f"Order identifier: {order_identifier}")
            
            # Try to determine if this is an order number (name) or internal ID
            # Order numbers are typically shorter (e.g., "1001", "1002")
            # Internal IDs are very long numbers (e.g., "5678901234567890")
            is_order_number = len(order_identifier) < 10 and order_identifier.isdigit()
            logger.debug(f"Is order number: {is_order_number}")
            
            # If it looks like an order number, search for it first to get the internal ID
            if is_order_number:
                logger.debug(f"Searching for order by number: {order_identifier}")
                # Use search_orders to find the order by name (without # prefix in search query)
                search_result = self.search_orders(order_number=order_identifier, limit=1)
               
                search_data = json.loads(search_result)
                
                if search_data.get("success") and search_data.get("orders") and len(search_data.get("orders")) > 0:
                    # Found the order, get its internal ID
                    order_identifier = search_data.get("orders")[0].get("id")
                    logger.debug(f"Found order with internal ID: {order_identifier}")
                else:
                    return json.dumps({
                        "success": False,
                        "message": f"Order {order_id} not found"
                    })
                
            # Get order details using context manager for database operations
            with SessionLocal() as db:
                shopify_service = ShopifyService(db)
                logger.debug(f"Getting order with internal ID: {order_identifier}")
                result = shopify_service.get_order(shop, order_identifier)
            
            # If successful, extract relevant order status information
            if result.get("success", False) and result.get("order"):
                order = result.get("order")
                
                # Filter out cancelled fulfillments - only include active ones
                all_fulfillments = order.get("fulfillments", [])
                active_fulfillments = [
                    f for f in all_fulfillments 
                    if f.get("status") and f.get("status").upper() != "CANCELLED"
                ]
                
                # Extract tracking numbers from active fulfillments only
                tracking_numbers = []
                for fulfillment in active_fulfillments:
                    if fulfillment.get("tracking_number"):
                        tracking_numbers.append(fulfillment.get("tracking_number"))
                    elif fulfillment.get("tracking_numbers"):
                        tracking_numbers.extend(fulfillment.get("tracking_numbers"))
                
                # Create text summary for LLM
                customer = order.get("customer", {})
                customer_name = f"{customer.get('first_name', '')} {customer.get('last_name', '')}".strip()
                customer_info = customer_name if customer_name else customer.get('email', 'N/A')
                
                text_message = (
                    f"Order Status for {order.get('name')}:\n\n"
                    f"Customer: {customer_info}\n"
                    f"Total: {order.get('currency', 'USD')} {order.get('total_price')}\n"
                    f"Payment Status: {order.get('financial_status')}\n"
                    f"Fulfillment Status: {order.get('fulfillment_status')}\n"
                    f"Order Date: {order.get('created_at')}\n"
                )
                
                # Add tracking information
                if tracking_numbers:
                    text_message += f"Tracking Numbers: {', '.join(tracking_numbers)}\n"
                
                # Add shipping address if available
                shipping_addr = order.get("shipping_address")
                if shipping_addr:
                    addr_parts = [
                        shipping_addr.get("address1"),
                        shipping_addr.get("city"),
                        shipping_addr.get("provinceCode"),
                        shipping_addr.get("zip"),
                        shipping_addr.get("country")
                    ]
                    addr_str = ", ".join([p for p in addr_parts if p])
                    text_message += f"Shipping Address: {addr_str}\n"
                
                status_info = {
                    "success": True,
                    "message": text_message,
                    "order_id": order.get("id"),
                    "order_number": order.get("name"),
                    "status": order.get("financial_status"),
                    "fulfillment_status": order.get("fulfillment_status"),
                    "created_at": order.get("created_at"),
                    "processed_at": order.get("processed_at"),
                    "customer": customer,
                    "total_price": order.get("total_price"),
                    "currency": order.get("currency"),
                    "fulfillments": active_fulfillments,  # Only include active fulfillments
                    "shipping_address": shipping_addr,
                    "billing_address": order.get("billing_address"),
                    "tracking_numbers": tracking_numbers,
                    "shop_domain": shop.shop_domain
                }
                
                return json.dumps(status_info)
            
            # Add shop_domain to error result as well
            if isinstance(result, dict):
                result["shop_domain"] = shop.shop_domain
            return json.dumps(result)
            
        except Exception as e:
            logger.error(f"Error getting order status: {str(e)}")
            return json.dumps({
                "success": False,
                "message": f"Error getting order status: {str(e)}"
            })
    
    def recommend_products(self, product_id: Optional[str] = None, product_type: Optional[str] = None, tags: Optional[str] = None, limit: int = 8, cursor: Optional[str] = None, min_price: Optional[float] = None, max_price: Optional[float] = None, vendor: Optional[str] = None) -> str:
        """
        Recommend products based on similarity to a reference product ID, product type, or tags.
        Constructs a Shopify search query based on the provided criteria using GraphQL. Supports pagination.

        Use this when a user asks for recommendations (e.g., "suggest something similar", "show me beginner skateboards").
        Translate the user's request into relevant product_type or tags if possible.

        Args:
            product_id: ID of a reference product. Recommendations will be based on this product's type and tags.
            product_type: Product type to base recommendations on (e.g., 'skateboard', 'snowboard').
            tags: Comma-separated list of tags to base recommendations on (e.g., 'beginner,skate', 'winter,accessory').
            limit: Maximum number of recommendations to return (default: 8).
            cursor: The pagination cursor (endCursor from previous pageInfo) to fetch the next page.
            min_price: Optional minimum price filter (e.g., 100.00 for products >= $100)
            max_price: Optional maximum price filter (e.g., 500.00 for products <= $500)
            vendor: Optional vendor/brand filter (e.g., 'Nike', 'Adidas')

        Returns:
            str: JSON string. If recommendations are found, includes 'shopify_output' with the list of products,
                 'search_type', 'total_count', and 'pageInfo'. If none found, returns a relevant message.
                 On error, returns an error message.
        """
        try:
            shop = self._get_shop_for_agent()
            if not shop:
                return json.dumps({"success": False, "message": "Shopify integration is not enabled for this agent or shop not found"})

            search_query_parts = []
            search_limit = limit
            
            if product_id:
                # Fetch reference product to get its type and tags using GraphQL
                ref_product = None
                
                # Use GraphQL to get product details
                graphql_query = """
                query GetProduct($id: ID!) {
                  product(id: $id) {
                    id
                    title
                    productType
                    tags
                  }
                }
                """
                
                gid = f"gid://shopify/Product/{product_id}"
                variables = {
                    "id": gid
                }
                
                url = f"https://{shop.shop_domain}/admin/api/2025-10/graphql.json"
                headers = {
                    "X-Shopify-Access-Token": shop.access_token,
                    "Content-Type": "application/json"
                }
                
                payload = {
                    "query": graphql_query,
                    "variables": variables
                }
                
                import requests
                verify_ssl = settings.VERIFY_SSL_CERTIFICATES
                response = requests.post(url, headers=headers, json=payload, verify=verify_ssl)
                
                if response.status_code == 200:
                    result = response.json()
                    if "data" in result and "product" in result["data"] and result["data"]["product"]:
                        ref_product = result["data"]["product"]
                
                if ref_product:
                    ref_type = ref_product.get("productType")
                    ref_tags = ref_product.get("tags", [])
                    
                    if ref_type:
                        search_query_parts.append(f"product_type:'{ref_type}'")
                        
                    if ref_tags:
                        # Handle tags as a list
                        if isinstance(ref_tags, list):
                            for tag in ref_tags[:3]:  # Use up to 3 tags for recommendations
                                search_query_parts.append(f"tag:'{tag}'")
                        elif isinstance(ref_tags, str):
                            tags_list = [tag.strip() for tag in ref_tags.split(',') if tag.strip()]
                            for tag in tags_list[:3]:
                                search_query_parts.append(f"tag:'{tag}'")
                    
                    # Exclude the reference product itself
                    search_query_parts.append(f"-id:{product_id}")
                    search_limit = limit + 1
                else:
                    logger.warning(f"Could not fetch reference product ID: {product_id} for recommendations.")
            
            # Add criteria from direct arguments if no product_id or if fallback needed
            if not product_id or not search_query_parts:
                if product_type:
                    search_query_parts.append(f"product_type:'{product_type}'")
                if tags:
                    tag_list = [tag.strip() for tag in tags.split(',') if tag.strip()]
                    for tag in tag_list[:3]:
                        search_query_parts.append(f"tag:'{tag}'")

            # Determine search type and query
            if not search_query_parts:
                # Fallback: Get recent products if no criteria specified
                logger.info("No specific criteria for recommendations, fetching recent products.")

                # Build fallback query with price and vendor filters
                fallback_filters = ["status:active", "inventory_total:>0"]
                if min_price is not None:
                    fallback_filters.append(f"price:>={min_price}")
                if max_price is not None:
                    fallback_filters.append(f"price:<={max_price}")
                if vendor:
                    fallback_filters.append(f"vendor:'{vendor}'")

                fallback_query = " AND ".join(fallback_filters)

                # Use GraphQL to get recent products with pagination
                # Filter to only return active, in-stock products
                graphql_query = f"""
                query GetProducts($limit: Int!, $cursor: String) {{
                  products(first: $limit, query: "{fallback_query}", sortKey: CREATED_AT, reverse: true, after: $cursor) {{
                    edges {{
                      node {{
                        id
                        title
                        description
                        handle
                        productType
                        vendor
                        totalInventory
                        priceRangeV2 {{
                          minVariantPrice {{
                            amount
                            currencyCode
                          }}
                          maxVariantPrice {{
                            amount
                            currencyCode
                          }}
                        }}
                        images(first: 1) {{
                          edges {{
                            node {{
                              id
                              url
                              altText
                            }}
                          }}
                        }}
                        tags
                        createdAt
                        updatedAt
                      }}
                    }}
                    pageInfo {{
                      hasNextPage
                      endCursor
                    }}
                  }}
                }}
                """
                
                variables = {
                    "limit": limit,
                    "cursor": cursor if cursor else None
                }
                
                search_type = "recent products"
            else:
                # Construct final query: Join parts with OR for broader recommendations
                # Add status:active filter to only return active products (exclude archived and draft)
                # Add inventory_total:>0 to only return in-stock products
                search_query = f"({' OR '.join(search_query_parts)}) AND status:active AND inventory_total:>0"

                # Add price filters if provided
                if min_price is not None:
                    search_query += f" AND price:>={min_price}"
                if max_price is not None:
                    search_query += f" AND price:<={max_price}"

                # Add vendor filter if provided
                if vendor:
                    search_query += f" AND vendor:'{vendor}'"

                logger.info(f"Constructed recommendation search query: {search_query}")
                
                # Use GraphQL to search products with pagination
                graphql_query = """
                query SearchProducts($searchTerm: String!, $limit: Int!, $cursor: String) {
                  products(first: $limit, query: $searchTerm, after: $cursor) {
                    edges {
                      node {
                        id
                        title
                        description
                        handle
                        productType
                        vendor
                        totalInventory
                        priceRangeV2 {
                          minVariantPrice {
                            amount
                            currencyCode
                          }
                          maxVariantPrice {
                            amount
                            currencyCode
                          }
                        }
                        images(first: 1) {
                          edges {
                            node {
                              id
                              url
                              altText
                            }
                          }
                        }
                        tags
                        createdAt
                        updatedAt
                      }
                    }
                    pageInfo {
                      hasNextPage
                      endCursor
                    }
                  }
                }
                """
                
                variables = {
                    "searchTerm": search_query,
                    "limit": search_limit,
                    "cursor": cursor if cursor else None
                }
                
                search_type = "recommendations"
            
            # Execute the GraphQL query
            url = f"https://{shop.shop_domain}/admin/api/2025-10/graphql.json"
            headers = {
                "X-Shopify-Access-Token": shop.access_token,
                "Content-Type": "application/json"
            }
            
            payload = {
                "query": graphql_query,
                "variables": variables
            }
            
            import requests
            verify_ssl = settings.VERIFY_SSL_CERTIFICATES
            response = requests.post(url, headers=headers, json=payload, verify=verify_ssl)
            
            if response.status_code != 200:
                logger.error(f"Failed to get recommendations: {response.text}")
                return json.dumps({
                    "success": False,
                    "message": f"Failed to get recommendations: {response.text}"
                })
            
            result = response.json()
            
            # Check for GraphQL errors
            if "errors" in result:
                logger.error(f"GraphQL errors: {result['errors']}")
                return json.dumps({
                    "success": False,
                    "message": f"GraphQL errors: {result['errors']}"
                })
            
            # Transform the GraphQL data structure
            products_data = result.get("data", {}).get("products", {})
            edges = products_data.get("edges", [])
            page_info = products_data.get("pageInfo", {})
            
            # Extract products from edges
            products = []
            for edge in edges:
                node = edge.get("node", {})
                
                # Extract the first image URL if available
                image_url = None
                images = node.get("images", {}).get("edges", [])
                if images and len(images) > 0:
                    image_url = images[0].get("node", {}).get("url")
                
                # Extract price information
                price_range = node.get("priceRangeV2", {})
                min_price = price_range.get("minVariantPrice", {}).get("amount")
                max_price = price_range.get("maxVariantPrice", {}).get("amount")
                currency_code = price_range.get("minVariantPrice", {}).get("currencyCode")
                
                # Transform to product structure
                transformed_product = {
                    "id": node.get("id").split("/")[-1] if node.get("id") else None,
                    "title": node.get("title"),
                    "description": node.get("description"),
                    "handle": node.get("handle"),
                    "product_type": node.get("productType"),
                    "vendor": node.get("vendor"),
                    "total_inventory": node.get("totalInventory"),
                    "price": min_price,
                    "price_max": max_price,
                    "currency": currency_code,
                    "image": {"src": image_url} if image_url else None,
                    "tags": node.get("tags"),
                    "created_at": node.get("createdAt"),
                    "updated_at": node.get("updatedAt")
                }
                
                products.append(transformed_product)
            
            # Filter out the original product_id if it was part of the criteria and fetch limit allowed
            if product_id and search_limit > limit:
                original_gid = f"gid://shopify/Product/{product_id}"
                products = [p for p in products if p.get("id") != original_gid and p.get("id") != product_id][:limit]

            # Process results
            if products:
                # Try to cache products in Redis
                redis_client = get_redis()
                product_cache_key = None

                if redis_client:
                    try:
                        # Delete old cache entries for this session
                        old_cache_pattern = f"shopify_products:{self.session_id}:*"
                        old_keys = redis_client.keys(old_cache_pattern)
                        if old_keys:
                            redis_client.delete(*old_keys)
                            logger.debug(f"Deleted {len(old_keys)} old cache entries for session {self.session_id}")

                        # Create cache key with session and timestamp
                        timestamp = int(time.time())
                        product_cache_key = f"shopify_products:{self.session_id}:{timestamp}"

                        # Store full products in Redis with 5-minute TTL
                        redis_client.setex(
                            product_cache_key,
                            300,  # 5 minutes
                            json.dumps({
                                "products": products,
                                "search_type": search_type,
                                "total_count": len(products),
                                "pageInfo": page_info,
                                "shop_domain": shop.shop_domain
                            })
                        )
                        logger.debug(f"Cached {len(products)} recommended products with key: {product_cache_key}")
                    except Exception as e:
                        logger.error(f"Failed to cache recommended products in Redis: {str(e)}")
                        product_cache_key = None

                # Return minimal products to LLM (reduce tokens while allowing reasoning)
                # Full products are in Redis cache
                product_ids = [p.get("id") for p in products]
                minimal_products = [create_minimal_product(p) for p in products]

                # Customize message header based on initial criteria
                recommendation_header = f"Here are {len(products)} recommendations for you."
                if product_type and not product_id:
                    recommendation_header = f"Here are recommendations in the {product_type} category."
                elif tags and not product_id:
                    recommendation_header = f"Here are products tagged with {tags}."
                elif product_id:
                    recommendation_header = f"Based on the product you viewed, you might like these options."

                return json.dumps({
                    "success": True,
                    "message": recommendation_header,
                    "shopify_output": {
                        "products": minimal_products,  # Minimal products for LLM reasoning
                        "product_cache_key": product_cache_key,  # Cache key for backend optimization
                        "product_ids": product_ids,  # Product IDs for reference
                        "search_type": search_type,
                        "total_count": len(products),
                        "pageInfo": page_info,
                        "shop_domain": shop.shop_domain
                    }
                })

            # No products found or initial search failed
            no_results_message = "Sorry, I couldn't find any product recommendations matching the criteria."
            # Customize message based on input
            if product_type: no_results_message = f"Sorry, I couldn't find recommendations in the {product_type} category."
            elif tags: no_results_message = f"Sorry, I couldn't find recommendations matching the tags: {tags}."
            elif product_id: no_results_message = "Sorry, I couldn't find similar products based on the reference product."
            
            return json.dumps({
                "success": True,
                "message": no_results_message
                # Keep shopify_output or make it null/empty based on frontend handling
                # "shopify_output": {"products": [], "search_type": search_type}
            })

        except Exception as e:
            logger.error(f"Error recommending products: {str(e)}")
            logger.error(traceback.format_exc())
            return json.dumps({
                "success": False,
                "message": f"An error occurred while generating recommendations: {str(e)}"
            }) 