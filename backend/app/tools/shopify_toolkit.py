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

from typing import Optional, Dict, Any, List
from agno.tools import Toolkit
from app.core.logger import get_logger
from app.services.shopify import ShopifyService
from app.services.shopify_urls import shopify_admin_url
from app.services.shopify_tokens import admin_headers, call_admin_api
from app.repositories.chat import ChatRepository
from app.tools.shopify_search import match_singulars
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
import requests
from app.core.config import settings
from app.core.redis import get_redis
from app.tools.shopify_order_access import (
    MAX_ORDER_RESULTS,
    missing_from_chat,
    ORDER_NOT_FOUND,
    build_order_search,
    order_belongs_to,
    order_lookup_problem,
    order_number_matches,
)

logger = get_logger(__name__)

# A slow store must not hold the chat turn open.
ORDER_SEARCH_TIMEOUT_SECONDS = 20

ORDER_SEARCH_GRAPHQL = """
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
  }
}
"""

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

def cart_variant_id(node: dict) -> Optional[str]:
    """The variant one click can add: only for a product published to the Online
    Store with a single variant that is on sale. The Admin API also returns products
    the storefront can't sell, whose cart add fails ("Cannot find variant").
    publishedAt, not onlineStoreUrl: the URL is null on a password-protected store.
    With several variants, picking one for the customer could buy the wrong size."""
    if not node.get("publishedAt"):
        return None
    edges = (node.get("variants") or {}).get("edges") or []
    variant = (edges[0].get("node") or {}) if len(edges) == 1 else {}
    if not variant.get("id") or not variant.get("availableForSale"):
        return None
    return variant["id"].split("/")[-1]


def product_from_node(node: dict) -> dict:
    """Flatten one GraphQL product node into the shape the cache and cards use."""
    images = (node.get("images") or {}).get("edges") or []
    image_url = (images[0].get("node") or {}).get("url") if images else None
    price_range = node.get("priceRangeV2") or {}
    min_variant_price = price_range.get("minVariantPrice") or {}
    return {
        "id": node["id"].split("/")[-1] if node.get("id") else None,
        "title": node.get("title"),
        "description": node.get("description"),
        "handle": node.get("handle"),
        "product_type": node.get("productType"),
        "vendor": node.get("vendor"),
        "total_inventory": node.get("totalInventory"),
        "price": min_variant_price.get("amount"),
        "price_max": (price_range.get("maxVariantPrice") or {}).get("amount"),
        "currency": min_variant_price.get("currencyCode"),
        "image": {"src": image_url} if image_url else None,
        "tags": node.get("tags"),
        "created_at": node.get("createdAt"),
        "updated_at": node.get("updatedAt"),
        "cart_variant_id": cart_variant_id(node),
    }


class ShopifyTools(Toolkit):
    def __init__(self, agent_id: str, org_id: str, session_id: str):
        super().__init__(name="shopify_tools")
        self.agent_id = agent_id
        self.org_id = org_id
        self.session_id = session_id
        # True once a product tool has fetched+cached products during this turn.
        # Lets the backend attach products deterministically (via product_cache_key)
        # even if the LLM forgets to echo the key in its structured shopify_output.
        # Per-request instance, so this cannot leak across turns.
        self.has_cached_products: bool = False

        # Register the functions
        self.register(self.list_products)
        self.register(self.get_product)
        self.register(self.search_products)
        self.register(self.search_orders)
        self.register(self.get_order_status)
        self.register(self.recommend_products)

    @property
    def product_cache_key(self) -> str:
        """Redis key holding this session's most recent product result.

        Org-scoped for multi-tenant isolation. Single source of truth: the
        backend re-hydrates products from this exact key, so every producer must
        build it here rather than repeating the format.
        """
        return f"{self.org_id}:shopify_products:{self.session_id}"


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
                            # Use fixed cache key per session with org_id for multi-tenant isolation
                            # Format: {org_id}:shopify_products:{session_id}
                            product_cache_key = self.product_cache_key

                            # Store full products in Redis with 5-minute TTL
                            # setex will overwrite any previous value automatically
                            redis_client.setex(
                                product_cache_key,
                                300,  # 5 minutes
                                json.dumps({
                                    "products": products,
                                    "shop_domain": shop.shop_domain
                                })
                            )
                            logger.debug(f"Cached {len(products)} listed products with key: {product_cache_key}")
                            self.has_cached_products = True
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
                    publishedAt
                    variants(first: 2) { edges { node { id availableForSale } } }
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
            filtered_query = f"({match_singulars(query)}) AND status:active AND inventory_total:>0"

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
            url = shopify_admin_url(shop.shop_domain, "graphql.json")
            
            payload = {
                "query": graphql_query,
                "variables": variables
            }
            
            verify_ssl = settings.VERIFY_SSL_CERTIFICATES
            response = call_admin_api(shop, lambda token: requests.post(
                url, headers=admin_headers(token), json=payload, verify=verify_ssl))
            
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
            
            products = [product_from_node(edge.get("node", {})) for edge in edges]
            
            # Check if search was successful
            if products:
                # Try to cache products in Redis
                redis_client = get_redis()
                product_cache_key = None

                if redis_client:
                    try:
                        # Use fixed cache key per session with org_id for multi-tenant isolation
                        # Format: {org_id}:shopify_products:{session_id}
                        product_cache_key = self.product_cache_key

                        # Store full products in Redis with 5-minute TTL
                        # setex will overwrite any previous value automatically
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
                        self.has_cached_products = True
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
    
   
    def search_orders(self, customer_email: str, order_number: str) -> str:
        """
        Get the full details of one order: items, totals, shipping address and tracking.
        Needs both the order number and the email address the customer used at checkout;
        ask the customer for whichever is missing. Never guess the email or take it from
        anywhere else. This cannot list a customer's orders.

        Args:
            customer_email: The email address the customer used at checkout
            order_number: The order number, e.g. "1001" or "#1001"

        Returns:
            str: JSON string with the matching order or error information
        """
        try:
            problem = self._lookup_problem(customer_email, order_number)
            if problem:
                return json.dumps({"success": False, "message": problem, "requires_user_input": True})

            shop = self._get_shop_for_agent()
            if not shop:
                return json.dumps({
                    "success": False,
                    "message": "Shopify integration is not enabled for this agent or shop not found"
                })

            found = self._find_customer_orders(shop, customer_email, order_number)
            if not found["success"]:
                return json.dumps(found)
            orders = found["orders"]
            if not orders:
                return json.dumps({"success": False, "message": ORDER_NOT_FOUND})

            return json.dumps({
                "success": True,
                "message": self._summarise_orders(orders),
                "orders": orders,
                "shop_domain": shop.shop_domain
            })

        except Exception as e:
            logger.error(f"Error searching orders: {str(e)}")
            logger.error(traceback.format_exc())
            return json.dumps({"success": False, "message": "Couldn't search the store's orders right now."})

    def _customer_messages(self) -> List[str]:
        with SessionLocal() as db:
            return ChatRepository(db).get_customer_messages(self.session_id)

    def _lookup_problem(self, customer_email: Optional[str], order_number: Optional[str]) -> Optional[str]:
        """What to ask the customer before this lookup can run, or None when it can."""
        return (order_lookup_problem(customer_email, order_number)
                or missing_from_chat(customer_email, order_number, self._customer_messages()))

    def _find_customer_orders(self, shop: ShopifyShop, customer_email: str, order_number: str) -> Dict[str, Any]:
        """The order with this number placed with this email. Shopify's search is fuzzy,
        so every result is re-checked for an exact email and number match."""
        response = call_admin_api(shop, lambda token: requests.post(
            shopify_admin_url(shop.shop_domain, "graphql.json"),
            headers=admin_headers(token),
            json={
                "query": ORDER_SEARCH_GRAPHQL,
                "variables": {"query": build_order_search(customer_email, order_number), "first": MAX_ORDER_RESULTS},
            },
            verify=settings.VERIFY_SSL_CERTIFICATES,
            timeout=ORDER_SEARCH_TIMEOUT_SECONDS,
        ))
        if response.status_code != 200:
            logger.error(f"Failed to search orders: {response.status_code} {response.text}")
            return {"success": False, "message": "Couldn't reach the store's orders right now."}

        result = response.json()
        if "errors" in result:
            logger.error(f"GraphQL errors: {result['errors']}")
            return {"success": False, "message": "Couldn't search the store's orders right now."}

        orders_data = (result.get("data") or {}).get("orders") or {}
        orders = [self._order_from_node(edge.get("node") or {}) for edge in orders_data.get("edges", [])]
        return {
            "success": True,
            "orders": [o for o in orders
                       if order_belongs_to(o, customer_email) and order_number_matches(o, order_number)],
        }

    @staticmethod
    def _order_from_node(node: Dict[str, Any]) -> Dict[str, Any]:
        """Flatten one GraphQL order node into the shape the agent receives."""
        line_items = []
        for item_edge in (node.get("lineItems") or {}).get("edges", []):
            item_node = item_edge.get("node") or {}
            variant = item_node.get("variant") or {}
            unit_price = (item_node.get("originalUnitPriceSet") or {}).get("shopMoney") or {}
            try:
                price_amount = float(unit_price["amount"]) if unit_price.get("amount") is not None else None
            except (ValueError, TypeError):
                price_amount = None
            line_items.append({
                "title": item_node.get("title"),
                "quantity": item_node.get("quantity"),
                "price": price_amount,
                "variant_title": variant.get("title"),
                "image_url": (variant.get("image") or {}).get("url")
            })

        tracking_info = [
            {"company": tracking.get("company"), "number": tracking.get("number"), "url": tracking.get("url")}
            for fulfillment in node.get("fulfillments") or []
            for tracking in fulfillment.get("trackingInfo") or []
        ]

        def money(field: str) -> Dict[str, Any]:
            return (node.get(field) or {}).get("shopMoney") or {}

        customer = node.get("customer") or {}
        return {
            "id": node["id"].split("/")[-1] if node.get("id") else None,
            "name": node.get("name"),
            "email": node.get("email"),
            "phone": node.get("phone"),
            "created_at": node.get("createdAt"),
            "financial_status": node.get("displayFinancialStatus"),
            "fulfillment_status": node.get("displayFulfillmentStatus"),
            "total_items": node.get("subtotalLineItemsQuantity"),
            "current_total": money("currentTotalPriceSet").get("amount"),
            "original_total": money("originalTotalPriceSet").get("amount"),
            "subtotal": money("currentSubtotalPriceSet").get("amount"),
            "currency": money("currentTotalPriceSet").get("currencyCode"),
            "customer": {
                "id": customer.get("id"),
                "first_name": customer.get("firstName"),
                "last_name": customer.get("lastName"),
                "email": customer.get("email")
            },
            "line_items": line_items,
            "shipping_address": node.get("shippingAddress"),
            "tracking_info": tracking_info
        }

    @staticmethod
    def _summarise_orders(orders: List[Dict[str, Any]]) -> str:
        """Short text version of the orders for the LLM."""
        summaries = []
        for idx, order in enumerate(orders, 1):
            customer_name = f"{order['customer'].get('first_name') or ''} {order['customer'].get('last_name') or ''}".strip()
            summary = (
                f"{idx}. Order {order['name']}\n"
                f"   - Customer: {customer_name or order.get('email') or 'N/A'}\n"
                f"   - Total: {order['currency']} {order['current_total']}\n"
                f"   - Status: {order['financial_status']}\n"
                f"   - Fulfillment: {order['fulfillment_status']}\n"
                f"   - Items: {order['total_items']}\n"
                f"   - Created: {order['created_at']}"
            )
            tracking_numbers = [t["number"] for t in order["tracking_info"] if t.get("number")]
            if tracking_numbers:
                summary += f"\n   - Tracking: {', '.join(tracking_numbers)}"
            summaries.append(summary)
        return f"Found {len(orders)} order(s):\n\n" + "\n\n".join(summaries)

    def get_order_status(self, order_number: str, customer_email: str) -> str:
        """
        Get the status and tracking of one order. Needs both the order number and the
        email address the customer used at checkout; ask the customer for whichever is
        missing. Never guess the email or take it from anywhere else.

        Args:
            order_number: The order number, e.g. "1001" or "#1001"
            customer_email: The email address the customer used at checkout

        Returns:
            str: JSON string with order status details or error information
        """
        try:
            problem = self._lookup_problem(customer_email, order_number)
            if problem:
                return json.dumps({"success": False, "message": problem, "requires_user_input": True})

            shop = self._get_shop_for_agent()
            if not shop:
                return json.dumps({
                    "success": False,
                    "message": "Shopify integration is not enabled for this agent or shop not found"
                })

            found = self._find_customer_orders(shop, customer_email, order_number)
            if not found["success"]:
                return json.dumps(found)
            if not found["orders"]:
                return json.dumps({"success": False, "message": ORDER_NOT_FOUND})

            with SessionLocal() as db:
                result = ShopifyService(db).get_order(shop, found["orders"][0]["id"])

            order = result.get("order") if result.get("success", False) else None
            if not order:
                result["shop_domain"] = shop.shop_domain
                return json.dumps(result)
            # The full record is fetched separately, so check ownership on it too.
            if not order_belongs_to(order, customer_email):
                return json.dumps({"success": False, "message": ORDER_NOT_FOUND})

            # Filter out cancelled fulfillments - only include active ones
            active_fulfillments = [
                f for f in order.get("fulfillments") or []
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
            customer = order.get("customer") or {}
            customer_name = f"{customer.get('first_name') or ''} {customer.get('last_name') or ''}".strip()
            text_message = (
                f"Order Status for {order.get('name')}:\n\n"
                f"Customer: {customer_name or customer.get('email') or 'N/A'}\n"
                f"Total: {order.get('currency', 'USD')} {order.get('total_price')}\n"
                f"Payment Status: {order.get('financial_status')}\n"
                f"Fulfillment Status: {order.get('fulfillment_status')}\n"
                f"Order Date: {order.get('created_at')}\n"
            )
            if tracking_numbers:
                text_message += f"Tracking Numbers: {', '.join(tracking_numbers)}\n"

            shipping_addr = order.get("shipping_address")
            if shipping_addr:
                addr_parts = [
                    shipping_addr.get("address1"),
                    shipping_addr.get("city"),
                    shipping_addr.get("provinceCode"),
                    shipping_addr.get("zip"),
                    shipping_addr.get("country")
                ]
                text_message += f"Shipping Address: {', '.join(p for p in addr_parts if p)}\n"

            return json.dumps({
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
                "fulfillments": active_fulfillments,
                "shipping_address": shipping_addr,
                "billing_address": order.get("billing_address"),
                "tracking_numbers": tracking_numbers,
                "shop_domain": shop.shop_domain
            })

        except Exception as e:
            logger.error(f"Error getting order status: {str(e)}")
            logger.error(traceback.format_exc())
            return json.dumps({"success": False, "message": "Couldn't look up that order right now."})

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
                
                url = shopify_admin_url(shop.shop_domain, "graphql.json")
                
                payload = {
                    "query": graphql_query,
                    "variables": variables
                }
                
                verify_ssl = settings.VERIFY_SSL_CERTIFICATES
                response = call_admin_api(shop, lambda token: requests.post(
                    url, headers=admin_headers(token), json=payload, verify=verify_ssl))
                
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
                        publishedAt
                        variants(first: 2) {{ edges {{ node {{ id availableForSale }} }} }}
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
                        publishedAt
                        variants(first: 2) { edges { node { id availableForSale } } }
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
            url = shopify_admin_url(shop.shop_domain, "graphql.json")
            
            payload = {
                "query": graphql_query,
                "variables": variables
            }
            
            verify_ssl = settings.VERIFY_SSL_CERTIFICATES
            response = call_admin_api(shop, lambda token: requests.post(
                url, headers=admin_headers(token), json=payload, verify=verify_ssl))
            
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
            
            products = [product_from_node(edge.get("node", {})) for edge in edges]
            
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
                        # Use fixed cache key per session with org_id for multi-tenant isolation
                        # Format: {org_id}:shopify_products:{session_id}
                        product_cache_key = self.product_cache_key

                        # Store full products in Redis with 5-minute TTL
                        # setex will overwrite any previous value automatically
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
                        self.has_cached_products = True
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