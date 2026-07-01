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

from sqlalchemy.orm import Session
from typing import Optional
from fastapi import Request
from fastapi.responses import RedirectResponse, HTMLResponse
from app.core.logger import get_logger
from app.core.config import settings
from app.models.organization import Organization
from app.repositories.widget import WidgetRepository
from app.services.shopify_auth_service import ShopifyAuthService
from urllib.parse import quote
import hmac
import hashlib
import base64

logger = get_logger(__name__)


class ShopifyHelperService:
    """Service for Shopify helper functions and utilities"""
    
    @staticmethod
    def get_shop_agents_list(db: Session, organization_id: str) -> list[dict]:
        """
        Get all agents for a shop's organization and convert to dict format.
        
        Args:
            db: Database session
            organization_id: Organization ID (string UUID)
            
        Returns:
            List of agent dictionaries with id, name, display_name, description, is_active
        """
        from app.repositories.agent import AgentRepository
        agent_repository = AgentRepository(db)
        agents = agent_repository.get_active_agents(organization_id)
        
        # Convert agents to dict format
        agents_list = [
            {
                "id": str(agent.id),
                "name": agent.name,
                "display_name": agent.display_name,
                "description": agent.description,
                "is_active": agent.is_active
            }
            for agent in agents
        ]
        
        return agents_list

    @staticmethod
    def get_shop_widget_id(db: Session, configs: list, default: str = None) -> Optional[str]:
        """
        Get the widget ID for the first configured agent.
        
        Args:
            db: Database session
            configs: List of agent Shopify configs
            default: Default value if no widget found
            
        Returns:
            Widget ID as string or None
        """
        if configs and len(configs) > 0:
            widget_repo = WidgetRepository(db)
            widgets = widget_repo.get_widgets_by_agent(configs[0].agent_id)
            if widgets and len(widgets) > 0:
                return str(widgets[0].id)
        return default

    @staticmethod
    def exchange_oauth_code_for_token(shop: str, code: str) -> tuple[str, str]:
        """
        Exchange OAuth authorization code for access token.
        
        Args:
            shop: Shop domain
            code: OAuth authorization code
            
        Returns:
            Tuple of (access_token, scope)
            
        Raises:
            HTTPException: If token exchange fails
        """
        import requests
        from fastapi import HTTPException
        
        token_url = f"https://{shop}/admin/oauth/access_token"
        payload = {
            "client_id": settings.SHOPIFY_API_KEY,
            "client_secret": settings.SHOPIFY_API_SECRET,
            "code": code
        }
        
        # Check if we should verify SSL certificates (default to True for production)
        verify_ssl = settings.VERIFY_SSL_CERTIFICATES
        logger.info(f"Exchanging OAuth code for token - Shop: {shop}")
        logger.info(f"Verify SSL Certificates: {verify_ssl}")
        logger.info(f"Token URL: {token_url}")
        
        try:
            response = requests.post(token_url, json=payload, verify=verify_ssl)
            response.raise_for_status()
            token_data = response.json()
            
            access_token = token_data.get("access_token")
            scope = token_data.get("scope")
            
            if not access_token:
                logger.error(f"Failed to get access token for shop: {shop}")
                raise HTTPException(status_code=400, detail="Failed to obtain access token")
            
            logger.info(f"Successfully obtained access token for shop: {shop}")
            return access_token, scope
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Error exchanging OAuth code for token: {str(e)}")
            if isinstance(e, requests.exceptions.SSLError):
                logger.error("SSL Certificate verification failed. If this is a development environment, consider setting VERIFY_SSL_CERTIFICATES=False in settings.")
            raise HTTPException(status_code=500, detail=f"Failed to exchange OAuth code: {str(e)}")

    @staticmethod
    def verify_shopify_webhook(request_headers, request_body) -> bool:
        """
        Validate Shopify HMAC signature for webhooks.
        
        Args:
            request_headers: Request headers containing X-Shopify-Hmac-Sha256
            request_body: Raw request body bytes
            
        Returns:
            True if signature is valid, False otherwise
        """
        shopify_hmac = request_headers.get('X-Shopify-Hmac-Sha256')
        if not shopify_hmac:
            return False
        
        digest = hmac.new(
            settings.SHOPIFY_API_SECRET.encode('utf-8'),
            request_body,
            hashlib.sha256
        ).digest()
        
        computed_hmac = base64.b64encode(digest).decode('utf-8')
        return hmac.compare_digest(computed_hmac, shopify_hmac)

    @staticmethod
    def validate_shop_request(request: Request, shop: str, hmac_param: str) -> bool:
        """
        Validate the OAuth request from Shopify using HMAC validation.
        
        Args:
            request: FastAPI Request object
            shop: Shop domain
            hmac_param: HMAC parameter from query string
            
        Returns:
            True if request is valid, False otherwise
        """
        # Check if the shop URL is a valid Shopify domain
        if not shop.endswith('.myshopify.com'):
            logger.warning(f"Invalid shop domain: {shop}")
            return False
        
        # Get query parameters as dictionary
        query_params = dict(request.query_params)
        
        # Remove hmac from params for validation
        if 'hmac' in query_params:
            query_params.pop('hmac')
        
        logger.info(f"Query params: {query_params}")
        logger.info(f"HMAC param: {hmac_param}")
        
        # Sort and encode parameters
        sorted_params = "&".join([f"{key}={quote(value)}" for key, value in sorted(query_params.items())])
        
        # Generate HMAC
        digest = hmac.new(
            settings.SHOPIFY_API_SECRET.encode('utf-8'),
            sorted_params.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()
        
        # Compare with provided HMAC
        is_valid = hmac.compare_digest(digest, hmac_param)
        if not is_valid:
            logger.warning(f"HMAC validation failed for shop: {shop}")
        
        return is_valid

