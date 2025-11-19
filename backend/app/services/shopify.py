"""
ChatterMate - Shopify Service
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

import requests
from typing import Dict, Any, List, Optional
from app.core.logger import get_logger
from app.models.shopify import ShopifyShop
from sqlalchemy.orm import Session
from app.repositories.shopify_shop_repository import ShopifyShopRepository
from app.repositories.agent_shopify_config_repository import AgentShopifyConfigRepository
import json
import re # Import regex module
import aiohttp

logger = get_logger(__name__)

class ShopifyService:
    """Service for interacting with the Shopify API."""

    def __init__(self, db: Session):
        self.db = db
        self.shopify_shop_repository = ShopifyShopRepository(db)
        self.agent_shopify_config_repository = AgentShopifyConfigRepository(db)
        self.api_version = "2025-10"

    def _execute_graphql(self, shop: ShopifyShop, query: str, variables: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Execute a GraphQL query against the Shopify Admin API.
        
        Args:
            shop: The ShopifyShop model containing credentials
            query: The GraphQL query string
            variables: Optional variables for the GraphQL query
            
        Returns:
            Dict containing the GraphQL response or error information
        """
        try:
            if not shop or not shop.access_token or not shop.is_installed:
                return {
                    "success": False,
                    "message": "Shop not connected or missing access token"
                }

            url = f"https://{shop.shop_domain}/admin/api/{self.api_version}/graphql.json"
            headers = {
                "X-Shopify-Access-Token": shop.access_token,
                "Content-Type": "application/json"
            }
            
            payload = {
                "query": query
            }
            
            if variables:
                payload["variables"] = variables
            
            response = requests.post(url, headers=headers, json=payload)
            
            if response.status_code != 200:
                logger.error(f"Failed to execute GraphQL query: {response.text}")
                return {
                    "success": False,
                    "message": f"Failed to execute GraphQL query: {response.text}"
                }
                
            result = response.json()
            
            # Check for GraphQL errors
            if "errors" in result:
                logger.error(f"GraphQL errors: {result['errors']}")
                return {
                    "success": False,
                    "errors": result["errors"],
                    "message": result["errors"][0]["message"] if result["errors"] else "Unknown GraphQL error"
                }
            
            return {
                "success": True,
                "data": result.get("data", {}),
                "extensions": result.get("extensions", {})
            }
            
        except Exception as e:
            logger.error(f"Error executing GraphQL query: {str(e)}")
            return {
                "success": False,
                "message": f"Error executing GraphQL query: {str(e)}"
            }
    
    async def _execute_graphql_async(self, shop: ShopifyShop, query: str, variables: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Execute a GraphQL query against the Shopify Admin API asynchronously.
        
        Args:
            shop: The ShopifyShop model containing credentials
            query: The GraphQL query string
            variables: Optional variables for the GraphQL query
            
        Returns:
            Dict containing the GraphQL response or error information
        """
        try:
            if not shop or not shop.access_token or not shop.is_installed:
                return {
                    "success": False,
                    "message": "Shop not connected or missing access token"
                }

            url = f"https://{shop.shop_domain}/admin/api/{self.api_version}/graphql.json"
            headers = {
                "X-Shopify-Access-Token": shop.access_token,
                "Content-Type": "application/json"
            }
            
            payload = {
                "query": query
            }
            
            if variables:
                payload["variables"] = variables
            
            async with aiohttp.ClientSession() as session:
                async with session.post(url, headers=headers, json=payload) as response:
                    if response.status != 200:
                        error_text = await response.text()
                        logger.error(f"Failed to execute GraphQL query: {error_text}")
                        return {
                            "success": False,
                            "message": f"Failed to execute GraphQL query: {error_text}"
                        }
                        
                    result = await response.json()
                    
                    # Check for GraphQL errors
                    if "errors" in result:
                        logger.error(f"GraphQL errors: {result['errors']}")
                        return {
                            "success": False,
                            "errors": result["errors"],
                            "message": result["errors"][0]["message"] if result["errors"] else "Unknown GraphQL error"
                        }
                    
                    return {
                        "success": True,
                        "data": result.get("data", {}),
                        "extensions": result.get("extensions", {})
                    }
        
        except Exception as e:
            logger.error(f"Error executing GraphQL query: {str(e)}")
            return {
                    "success": False,
                "message": f"Error executing GraphQL query: {str(e)}"
            }

    def get_products(self, shop: ShopifyShop, limit: int = 10) -> Dict[str, Any]:
        """
        Get products from a Shopify store using GraphQL.
        
        Args:
            shop: The ShopifyShop model containing credentials
            limit: Maximum number of products to return
            
        Returns:
            Dict containing products or error information
        """
        query = """
        query GetProducts($limit: Int!) {
          products(first: $limit, query: "status:active AND inventory_total:>0") {
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
            "limit": limit
        }
        
        result = self._execute_graphql(shop, query, variables)
        
        if not result.get("success", False):
            return result
        
        # Transform the GraphQL data structure to match the existing format
        transformed_products = []
        edges = result.get("data", {}).get("products", {}).get("edges", [])
        
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
            
            # Transform to previous structure
            transformed_product = {
                "id": node.get("id").split("/")[-1] if node.get("id") else None,  # Extract numeric ID from gid
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

            transformed_products.append(transformed_product)

        return {
            "success": True,
            "products": transformed_products,
            "count": len(transformed_products),
            "has_next_page": result.get("data", {}).get("products", {}).get("pageInfo", {}).get("hasNextPage", False),
            "end_cursor": result.get("data", {}).get("products", {}).get("pageInfo", {}).get("endCursor")
        }
    
    def get_product(self, shop: ShopifyShop, product_id: str) -> Dict[str, Any]:
        """
        Get a specific product from a Shopify store using GraphQL.
        
        Args:
            shop: The ShopifyShop model containing credentials
            product_id: The ID of the product to retrieve
            
        Returns:
            Dict containing the product details or error information
        """
        # In GraphQL, we need the full global ID which is formatted as gid://shopify/Product/{id}
        gid = f"gid://shopify/Product/{product_id}"
        
        query = """
        query GetProduct($id: ID!) {
          product(id: $id) {
            id
            title
            description
            descriptionHtml
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
            images(first: 10) {
              edges {
                node {
                  id
                  url
                  altText
                  width
                  height
                }
              }
            }
            variants(first: 20) {
              edges {
                node {
                  id
                  title
                  price
                  compareAtPrice
                  inventoryQuantity
                  sku
                  barcode
                }
              }
            }
            tags
            collections(first: 5) {
              edges {
                node {
                  id
                  title
                }
              }
            }
            createdAt
            updatedAt
          }
        }
        """
        
        variables = {
            "id": gid
        }
        
        result = self._execute_graphql(shop, query, variables)
        
        if not result.get("success", False):
            return result
        
        product_data = result.get("data", {}).get("product")
        
        if not product_data:
            return {
                "success": False,
                "message": f"Product with ID {product_id} not found"
            }
        
        # Transform GraphQL data to match the expected format
        
        # Process images
        images = []
        for edge in product_data.get("images", {}).get("edges", []):
            node = edge.get("node", {})
            images.append({
                "id": node.get("id").split("/")[-1] if node.get("id") else None,
                "src": node.get("url"),
                "alt": node.get("altText"),
                "width": node.get("width"),
                "height": node.get("height")
            })
        
        # Process variants
        variants = []
        for edge in product_data.get("variants", {}).get("edges", []):
            node = edge.get("node", {})
            variants.append({
                "id": node.get("id").split("/")[-1] if node.get("id") else None,
                "title": node.get("title"),
                "price": node.get("price"),
                "compare_at_price": node.get("compareAtPrice"),
                "inventory_quantity": node.get("inventoryQuantity"),
                "sku": node.get("sku"),
                "barcode": node.get("barcode")
            })
        
        # Process collections
        collections = []
        for edge in product_data.get("collections", {}).get("edges", []):
            node = edge.get("node", {})
            collections.append({
                "id": node.get("id").split("/")[-1] if node.get("id") else None,
                "title": node.get("title")
            })
        
        # Extract price information
        price_range = product_data.get("priceRangeV2", {})
        min_price = price_range.get("minVariantPrice", {}).get("amount")
        max_price = price_range.get("maxVariantPrice", {}).get("amount")
        currency_code = price_range.get("minVariantPrice", {}).get("currencyCode")
        
        # Build transformed product
        transformed_product = {
            "id": product_data.get("id").split("/")[-1] if product_data.get("id") else None,
            "title": product_data.get("title"),
            "description": product_data.get("description"),
            "body_html": product_data.get("descriptionHtml"),
            "handle": product_data.get("handle"),
            "product_type": product_data.get("productType"),
            "vendor": product_data.get("vendor"),
            "total_inventory": product_data.get("totalInventory"),
            "price": min_price,
            "price_max": max_price,
            "currency": currency_code,
            "images": images,
            "image": images[0] if images else None,
            "variants": variants,
            "tags": product_data.get("tags"),
            "collections": collections,
            "created_at": product_data.get("createdAt"),
            "updated_at": product_data.get("updatedAt")
        }
        
        return {
            "success": True,
            "product": transformed_product
            }
    
    def create_product(self, shop: ShopifyShop, product_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a new product in a Shopify store.
        
        Args:
            shop: The ShopifyShop model containing credentials
            product_data: Dictionary containing the product details
            
        Returns:
            Dict containing the created product or error information
        """
        try:
            if not shop or not shop.access_token or not shop.is_installed:
                return {
                    "success": False,
                    "message": "Shop not connected or missing access token"
                }

            url = f"https://{shop.shop_domain}/admin/api/2025-10/products.json"
            headers = {
                "X-Shopify-Access-Token": shop.access_token,
                "Content-Type": "application/json"
            }
            
            # Ensure product_data has the right structure
            payload = {"product": product_data}
            
            response = requests.post(url, headers=headers, json=payload)
            
            if response.status_code not in (200, 201):
                logger.error(f"Failed to create product: {response.text}")
                return {
                    "success": False,
                    "message": f"Failed to create product: {response.text}"
                }
                
            product = response.json().get("product", {})
            
            return {
                "success": True,
                "product": product,
                "message": "Product created successfully"
            }
            
        except Exception as e:
            logger.error(f"Error creating product: {str(e)}")
            return {
                "success": False,
                "message": f"Error creating product: {str(e)}"
            }
    
    def update_product(self, shop: ShopifyShop, product_id: str, product_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Update an existing product in a Shopify store.
        
        Args:
            shop: The ShopifyShop model containing credentials
            product_id: The ID of the product to update
            product_data: Dictionary containing the updated product details
            
        Returns:
            Dict containing the updated product or error information
        """
        try:
            if not shop or not shop.access_token or not shop.is_installed:
                return {
                    "success": False,
                    "message": "Shop not connected or missing access token"
                }

            url = f"https://{shop.shop_domain}/admin/api/2025-10/products/{product_id}.json"
            headers = {
                "X-Shopify-Access-Token": shop.access_token,
                "Content-Type": "application/json"
            }
            
            # Ensure product_data has the right structure
            payload = {"product": product_data}
            
            response = requests.put(url, headers=headers, json=payload)
            
            if response.status_code != 200:
                logger.error(f"Failed to update product: {response.text}")
                return {
                    "success": False,
                    "message": f"Failed to update product: {response.text}"
                }
                
            product = response.json().get("product", {})
            
            return {
                "success": True,
                "product": product,
                "message": "Product updated successfully"
            }
            
        except Exception as e:
            logger.error(f"Error updating product: {str(e)}")
            return {
                "success": False,
                "message": f"Error updating product: {str(e)}"
            }
    
    def delete_product(self, shop: ShopifyShop, product_id: str) -> Dict[str, Any]:
        """
        Delete a product from a Shopify store.
        
        Args:
            shop: The ShopifyShop model containing credentials
            product_id: The ID of the product to delete
            
        Returns:
            Dict containing success status or error information
        """
        try:
            if not shop or not shop.access_token or not shop.is_installed:
                return {
                    "success": False,
                    "message": "Shop not connected or missing access token"
                }

            url = f"https://{shop.shop_domain}/admin/api/2025-10/products/{product_id}.json"
            headers = {
                "X-Shopify-Access-Token": shop.access_token,
                "Content-Type": "application/json"
            }
            
            response = requests.delete(url, headers=headers)
            
            if response.status_code not in (200, 204):
                logger.error(f"Failed to delete product: {response.text}")
                return {
                    "success": False,
                    "message": f"Failed to delete product: {response.text}"
                }
                
            return {
                "success": True,
                "message": "Product deleted successfully"
            }
            
        except Exception as e:
            logger.error(f"Error deleting product: {str(e)}")
            return {
                "success": False,
                "message": f"Error deleting product: {str(e)}"
            }
    
    def search_products(self, shop: ShopifyShop, query: str, limit: int = 10) -> Dict[str, Any]:
        """
        Search for products in a Shopify store using GraphQL.
        
        Args:
            shop: The ShopifyShop model containing credentials
            query: The search query
            limit: Maximum number of products to return
            
        Returns:
            Dict containing matching products or error information
        """
        graphql_query = """
        query SearchProducts($query: String!, $limit: Int!) {
          products(first: $limit, query: $query) {
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
        filtered_query = f"({query}) AND status:active"
        
        variables = {
            "query": filtered_query,
            "limit": limit
        }
        
        result = self._execute_graphql(shop, graphql_query, variables)
        
        if not result.get("success", False):
            return result
        
        # Transform the GraphQL data structure to match the existing format
        transformed_products = []
        edges = result.get("data", {}).get("products", {}).get("edges", [])
        
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
            
            # Transform to previous structure
            transformed_product = {
                "id": node.get("id").split("/")[-1] if node.get("id") else None,  # Extract numeric ID from gid
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
            
            transformed_products.append(transformed_product)
        
        return {
            "success": True,
            "products": transformed_products,
            "count": len(transformed_products),
            "has_next_page": result.get("data", {}).get("products", {}).get("pageInfo", {}).get("hasNextPage", False),
            "end_cursor": result.get("data", {}).get("products", {}).get("pageInfo", {}).get("endCursor")
        }
            
    def search_orders(self, shop: ShopifyShop, params: Dict[str, Any], limit: int = 10) -> Dict[str, Any]:
        """
        Search for orders in a Shopify store using GraphQL.
        
        Args:
            shop: The ShopifyShop model containing credentials
            params: Dictionary containing search parameters
            limit: Maximum number of orders to return
            
        Returns:
            Dict containing matching orders or error information
        """
        # Construct the query string based on the parameters
        query_parts = []
        
        if params.get("query"):
            query_parts.append(params.get("query"))
        
        if params.get("email"):
            query_parts.append(f"email:{params.get('email')}")
        
        if params.get("name"):
            query_parts.append(f"name:{params.get('name')}")
            
        # Combine query parts or use a default query
        query_string = " ".join(query_parts) if query_parts else ""
        
        graphql_query = """
        query SearchOrders($query: String!, $limit: Int!) {
          orders(first: $limit, query: $query) {
            edges {
              node {
                id
                name
                email
                processedAt
                createdAt
                updatedAt
                cancelledAt
                cancelReason
                displayFinancialStatus
                displayFulfillmentStatus
                customerJourneySummary {
                  customerOrderIndex
                  daysToConversion
                }
                customer {
                  id
                  firstName
                  lastName
                  email
                  phone
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
                shippingAddress {
                  address1
                  address2
                  city
                  country
                  zip
                  phone
                  name
                }
                fulfillments {
                  status
                  trackingInfo {
                    number
                    url
                  }
                }
                lineItems(first: 10) {
                  edges {
                    node {
                      id
                      name
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
                        sku
                      }
                    }
                  }
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
        
        variables = {
            "query": query_string,
            "limit": limit
        }
        
        result = self._execute_graphql(shop, graphql_query, variables)
        
        if not result.get("success", False):
            return result
        
        # Transform the GraphQL data structure to match the expected format
        transformed_orders = []
        edges = result.get("data", {}).get("orders", {}).get("edges", [])
        
        for edge in edges:
            node = edge.get("node", {})
            
            # Process line items
            line_items = []
            for li_edge in node.get("lineItems", {}).get("edges", []):
                li_node = li_edge.get("node", {})
                variant = li_node.get("variant", {})
                
                line_item = {
                    "id": li_node.get("id").split("/")[-1] if li_node.get("id") else None,
                    "name": li_node.get("name"),
                    "quantity": li_node.get("quantity"),
                    "price": li_node.get("originalUnitPriceSet", {}).get("shopMoney", {}).get("amount"),
                    "currency": li_node.get("originalUnitPriceSet", {}).get("shopMoney", {}).get("currencyCode"),
                    "variant_id": variant.get("id").split("/")[-1] if variant.get("id") else None,
                    "variant_title": variant.get("title"),
                    "sku": variant.get("sku")
                }
                
                line_items.append(line_item)
            
            # Process fulfillments
            fulfillments = []
            for fulfillment in node.get("fulfillments", []):
                tracking_info = []
                
                for tracking in fulfillment.get("trackingInfo", []):
                    tracking_info.append({
                        "number": tracking.get("number"),
                        "url": tracking.get("url")
                    })
                
                fulfillments.append({
                    "status": fulfillment.get("status"),
                    "tracking_numbers": [t.get("number") for t in tracking_info if t.get("number")],
                    "tracking_urls": [t.get("url") for t in tracking_info if t.get("url")],
                    "tracking_info": tracking_info
                })
            
            # Extract customer info
            customer = node.get("customer", {})
            customer_data = {
                "id": customer.get("id").split("/")[-1] if customer.get("id") else None,
                "first_name": customer.get("firstName"),
                "last_name": customer.get("lastName"),
                "email": customer.get("email"),
                "phone": customer.get("phone")
            } if customer else None
            
            # Process shipping address
            shipping_address = node.get("shippingAddress", {})
            
            # Build transformed order
            transformed_order = {
                "id": node.get("id").split("/")[-1] if node.get("id") else None,
                "name": node.get("name"),
                "email": node.get("email"),
                "processed_at": node.get("processedAt"),
                "created_at": node.get("createdAt"),
                "updated_at": node.get("updatedAt"),
                "cancelled_at": node.get("cancelledAt"),
                "cancel_reason": node.get("cancelReason"),
                "financial_status": node.get("displayFinancialStatus"),
                "fulfillment_status": node.get("displayFulfillmentStatus"),
                "customer": customer_data,
            "total_price": node.get("currentTotalPriceSet", {}).get("shopMoney", {}).get("amount"),
            "currency": node.get("currentTotalPriceSet", {}).get("shopMoney", {}).get("currencyCode"),
            "original_total_price": node.get("originalTotalPriceSet", {}).get("shopMoney", {}).get("amount"),
                "shipping_address": shipping_address,
                "fulfillments": fulfillments,
                "line_items": line_items
            }
            
            transformed_orders.append(transformed_order)
        
        return {
            "success": True,
            "orders": transformed_orders,
            "count": len(transformed_orders),
            "has_next_page": result.get("data", {}).get("orders", {}).get("pageInfo", {}).get("hasNextPage", False),
            "end_cursor": result.get("data", {}).get("orders", {}).get("pageInfo", {}).get("endCursor")
        }
    
    def get_order(self, shop: ShopifyShop, order_id: str) -> Dict[str, Any]:
        """
        Get a specific order from a Shopify store using GraphQL.
        
        Args:
            shop: The ShopifyShop model containing credentials
            order_id: The ID of the order to retrieve
            
        Returns:
            Dict containing the order details or error information
        """
        # In GraphQL, we need the full global ID which is formatted as gid://shopify/Order/{id}
        gid = f"gid://shopify/Order/{order_id}"
        
        query = """
        query GetOrder($id: ID!) {
          order(id: $id) {
            id
            name
            email
            processedAt
            createdAt
            updatedAt
            cancelledAt
            cancelReason
            displayFinancialStatus
            displayFulfillmentStatus
            customerJourneySummary {
              customerOrderIndex
              daysToConversion
            }
            customer {
              id
              firstName
              lastName
              email
              phone
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
            shippingAddress {
              address1
              address2
              city
              country
              zip
              phone
              name
            }
            fulfillments {
              status
              trackingInfo {
                number
                url
              }
            }
            lineItems(first: 50) {
              edges {
                node {
                  id
                  name
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
                    sku
                  }
                }
              }
            }
          }
        }
        """
        
        variables = {
            "id": gid
        }
        
        result = self._execute_graphql(shop, query, variables)
        
        if not result.get("success", False):
            return result
        
        order_data = result.get("data", {}).get("order")
        
        if not order_data:
            return {
                "success": False,
                "message": f"Order with ID {order_id} not found"
            }
        
        # Process line items
        line_items = []
        for li_edge in order_data.get("lineItems", {}).get("edges", []):
            li_node = li_edge.get("node", {})
            variant = li_node.get("variant", {})
            
            line_item = {
                "id": li_node.get("id").split("/")[-1] if li_node.get("id") else None,
                "name": li_node.get("name"),
                "quantity": li_node.get("quantity"),
                "price": li_node.get("originalUnitPriceSet", {}).get("shopMoney", {}).get("amount"),
                "currency": li_node.get("originalUnitPriceSet", {}).get("shopMoney", {}).get("currencyCode"),
                "variant_id": variant.get("id").split("/")[-1] if variant.get("id") else None,
                "variant_title": variant.get("title"),
                "sku": variant.get("sku")
            }
            
            line_items.append(line_item)
        
        # Process fulfillments
        fulfillments = []
        for fulfillment in order_data.get("fulfillments", []):
            tracking_info = []
            
            for tracking in fulfillment.get("trackingInfo", []):
                tracking_info.append({
                    "number": tracking.get("number"),
                    "url": tracking.get("url")
                })
            
            fulfillments.append({
                "status": fulfillment.get("status"),
                "tracking_numbers": [t.get("number") for t in tracking_info if t.get("number")],
                "tracking_urls": [t.get("url") for t in tracking_info if t.get("url")],
                "tracking_info": tracking_info
            })
        
        # Extract customer info
        customer = order_data.get("customer", {})
        customer_data = {
            "id": customer.get("id").split("/")[-1] if customer.get("id") else None,
            "first_name": customer.get("firstName"),
            "last_name": customer.get("lastName"),
            "email": customer.get("email"),
            "phone": customer.get("phone")
        } if customer else None
        
        # Build transformed order
        transformed_order = {
            "id": order_data.get("id").split("/")[-1] if order_data.get("id") else None,
            "name": order_data.get("name"),
            "email": order_data.get("email"),
            "processed_at": order_data.get("processedAt"),
            "created_at": order_data.get("createdAt"),
            "updated_at": order_data.get("updatedAt"),
            "cancelled_at": order_data.get("cancelledAt"),
            "cancel_reason": order_data.get("cancelReason"),
            "financial_status": order_data.get("displayFinancialStatus"),
            "fulfillment_status": order_data.get("displayFulfillmentStatus"),
            "customer": customer_data,
            "total_price": order_data.get("currentTotalPriceSet", {}).get("shopMoney", {}).get("amount"),
            "currency": order_data.get("currentTotalPriceSet", {}).get("shopMoney", {}).get("currencyCode"),
            "original_total_price": order_data.get("originalTotalPriceSet", {}).get("shopMoney", {}).get("amount"),
            "shipping_address": order_data.get("shippingAddress", {}),
            "fulfillments": fulfillments,
            "line_items": line_items
        }
        
        return {
            "success": True,
            "order": transformed_order
            }

    def _make_rest_request(self, shop: ShopifyShop, method: str, endpoint: str, payload: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Make a REST request to the Shopify Admin API.
        
        Args:
            shop: The ShopifyShop model containing credentials.
            method: HTTP method (GET, POST, PUT, DELETE).
            endpoint: API endpoint path (e.g., 'themes.json', 'themes/{theme_id}/assets.json').
            payload: Optional dictionary for request body (for POST/PUT).
            
        Returns:
            Dict containing the API response or error information.
        """
        try:
            if not shop or not shop.access_token or not shop.is_installed:
                return {"success": False, "message": "Shop not connected or missing access token"}

            url = f"https://{shop.shop_domain}/admin/api/{self.api_version}/{endpoint}"
            headers = {
                "X-Shopify-Access-Token": shop.access_token,
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
            
            response = requests.request(method, url, headers=headers, json=payload)
            
            # Handle rate limits (basic example)
            if response.status_code == 429:
                retry_after = response.headers.get("Retry-After", 1)
                logger.warning(f"Shopify rate limit hit. Retrying after {retry_after} seconds.")
                # Consider adding actual retry logic here if needed
                return {"success": False, "message": f"Rate limit exceeded. Try again in {retry_after} seconds.", "status_code": 429}

            if not (200 <= response.status_code < 300):
                logger.error(f"Shopify REST API error ({method} {url}): {response.status_code} - {response.text}")
                return {"success": False, "message": f"API Error: {response.text}", "status_code": response.status_code}
            
            # DELETE might return 204 No Content
            if response.status_code == 204:
                 return {"success": True, "data": {}}
                 
            return {"success": True, "data": response.json()}
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Error making Shopify REST request: {str(e)}")
            return {"success": False, "message": f"Request Exception: {str(e)}"}
        except Exception as e:
            logger.error(f"Unexpected error during Shopify REST request: {str(e)}", exc_info=True)
            return {"success": False, "message": f"Unexpected Error: {str(e)}"}

    async def inject_widget_script(self, shop: ShopifyShop, script_tag: str) -> None:
        """
        Creates a Shopify Script Tag to inject the ChatterMate widget using the scriptTagCreate GraphQL mutation.
        
        Args:
            shop: The ShopifyShop object.
            script_tag: The full HTML script tag string to inject (not used directly in this implementation).
            
        Note:
            This implementation uses Shopify's scriptTagCreate mutation instead of modifying theme files.
            It extracts the script URL from the provided script_tag string and creates a proper Shopify Script Tag.
        """
        logger.info(f"Starting widget script injection for shop: {shop.shop_domain}")
        
        # 1. Extract the script URL from the script_tag string
        # The script_tag is in format: 
        # <script>/* ChatterMate Start */window.chattermateId='widget_id';</script><script src="script_url" async defer></script>
        # We need to extract the script_url
        
        import re
        script_url_match = re.search(r'<script src=["\']([^"\']+)["\']', script_tag)
        widget_id_match = re.search(r"window\.chattermateId=\'([^\']+)\'", script_tag)
        
        if not script_url_match:
            raise Exception("Could not extract script URL from the provided script tag.")
        
        script_url = script_url_match.group(1)
        widget_id = widget_id_match.group(1) if widget_id_match else None
        
        # 2. Check if this script is already installed
        existing_script_query = """
        query {
          scriptTags(first: 50) {
            edges {
              node {
                id
                src
              }
            }
          }
        }
        """
        
        script_response = await self._execute_graphql_async(shop, existing_script_query)
        if not script_response.get("success"):
            raise Exception(f"Failed to fetch existing scripts: {script_response.get('message')}")
        
        # Check if our script is already installed
        script_edges = script_response["data"]["scriptTags"]["edges"]
        for edge in script_edges:
            if edge["node"]["src"] == script_url:
                logger.info(f"ChatterMate script already installed at {script_url}. Skipping injection.")
                return
        
        # 3. Create the script tag using scriptTagCreate mutation
        create_mutation = """
        mutation scriptTagCreate($input: ScriptTagInput!) {
          scriptTagCreate(input: $input) {
            scriptTag {
              id
              src
              displayScope
            }
            userErrors {
              field
              message
            }
          }
        }
        """
        
        create_vars = {
            "input": {
                "src": script_url,
                "displayScope": "ONLINE_STORE",  # Apply to the online store
                "cache": False  # Don't cache the script to ensure updates are applied immediately
            }
        }
        
        create_response = await self._execute_graphql_async(shop, create_mutation, create_vars)
        if not create_response.get("success"):
            raise Exception(f"Failed to create script tag: {create_response.get('message')}")
        
        user_errors = create_response["data"]["scriptTagCreate"]["userErrors"]
        if user_errors:
            error_msg = user_errors[0]["message"]
            logger.error(f"GraphQL error creating script tag: {error_msg}")
            raise Exception(f"Failed to create script tag: {error_msg}")
        
        script_tag_id = create_response["data"]["scriptTagCreate"]["scriptTag"]["id"]
        logger.info(f"Successfully created script tag with ID {script_tag_id} for shop {shop.shop_domain}")
        
        # 4. Store the script tag ID in the database for future reference
        if widget_id:
            # Optional: store the mapping between widget_id and script_tag_id
            # This could be useful for removing the script tag later
            # You'll need to implement this storage mechanism based on your database schema
            logger.info(f"Associated widget {widget_id} with script tag {script_tag_id}")

    async def remove_widget_script(self, shop: ShopifyShop, widget_id: str) -> None:
        """
        Removes the ChatterMate widget script tag using scriptTagDelete GraphQL mutation.
        
        Args:
            shop: The ShopifyShop object.
            widget_id: The ID of the widget to remove (used to identify the correct script tag).
        """
        logger.info(f"Starting widget script removal for shop: {shop.shop_domain}")
        
        # 1. Get all script tags
        script_query = """
        query {
          scriptTags(first: 50) {
            edges {
              node {
                id
                src
              }
            }
          }
        }
        """
        
        script_response = await self._execute_graphql_async(shop, script_query)
        if not script_response.get("success"):
            raise Exception(f"Failed to fetch script tags: {script_response.get('message')}")
        
        # Extract the script edges
        script_edges = script_response["data"]["scriptTags"]["edges"]
        
        # 2. Find scripts matching our widget
        # The approach depends on how your scripts are identified
        # Look for scripts containing your domain and potentially the widget ID
        widget_scripts = []
        for edge in script_edges:
            src = edge["node"]["src"]
            # Match any scripts from your domain and potentially containing the widget ID
            # Adjust this condition based on your script URL structure
            if "chattermate" in src.lower():
                widget_scripts.append(edge["node"]["id"])
        
        if not widget_scripts:
            logger.info(f"No ChatterMate script tags found for shop {shop.shop_domain}. Nothing to remove.")
            return
        
        # 3. Delete each matching script tag
        delete_mutation = """
        mutation scriptTagDelete($id: ID!) {
          scriptTagDelete(id: $id) {
            deletedScriptTagId
            userErrors {
              field
              message
            }
          }
        }
        """
        
        for script_id in widget_scripts:
            delete_vars = {
                "id": script_id
            }
            
            delete_response = await self._execute_graphql_async(shop, delete_mutation, delete_vars)
            if not delete_response.get("success"):
                logger.warning(f"Failed to delete script tag {script_id}: {delete_response.get('message')}")
                continue
            
            user_errors = delete_response["data"]["scriptTagDelete"]["userErrors"]
            if user_errors:
                error_msg = user_errors[0]["message"]
                logger.warning(f"GraphQL error deleting script tag {script_id}: {error_msg}")
                continue
            
            logger.info(f"Successfully removed script tag with ID {script_id} from shop {shop.shop_domain}")
        
        logger.info(f"Completed widget script removal for shop {shop.shop_domain}") 