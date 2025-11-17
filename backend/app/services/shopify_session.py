"""
ChatterMate - Shopify Session Token Validation
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

import jwt
import time
from typing import Optional, Dict, Any
from fastapi import Request, HTTPException, Depends
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.logger import get_logger
from app.database import get_db

logger = get_logger(__name__)


class ShopifySessionService:
    """Service for handling Shopify session token validation"""
    
    @staticmethod
    def get_session_token_from_request(request: Request) -> Optional[str]:
        """
        Get session token from request header or URL parameter.
        Per Shopify docs, session token can be in:
        1. Authorization header: Bearer <token>
        2. URL query parameter: id_token
        """
        # Try to get from Authorization header first
        auth_header = request.headers.get('authorization', '')
        if auth_header.startswith('Bearer '):
            token = auth_header.replace('Bearer ', '').strip()
            if token:
                return token
        
        # Try to get from URL query parameter
        id_token = request.query_params.get('id_token')
        if id_token:
            return id_token
        
        return None
    
    @staticmethod
    def validate_session_token(token: str) -> Dict[str, Any]:
        """
        Validate and decode Shopify session token.
        Returns decoded token payload if valid.
        Raises HTTPException if invalid.
        """
        try:
            # Decode without verification first to get the shop
            unverified = jwt.decode(token, options={"verify_signature": False})
            
            # Verify the token with Shopify's public key
            # Note: In production, you should fetch and cache Shopify's public keys
            # For now, we'll do basic validation
            decoded = jwt.decode(
                token,
                settings.SHOPIFY_API_SECRET,
                algorithms=["HS256"],
                audience=settings.SHOPIFY_API_KEY
            )
            
            # Check expiration
            exp = decoded.get('exp')
            if exp and exp < time.time():
                raise HTTPException(status_code=401, detail="Session token expired")
            
            # Check nbf (not before)
            nbf = decoded.get('nbf')
            if nbf and nbf > time.time():
                raise HTTPException(status_code=401, detail="Session token not yet valid")
            
            logger.info(f"Session token validated for shop: {decoded.get('dest')}")
            return decoded
            
        except jwt.ExpiredSignatureError:
            logger.warning("Session token expired")
            raise HTTPException(
                status_code=401,
                detail="Session token expired",
                headers={"X-Shopify-Retry-Invalid-Session-Request": "1"}
            )
        except jwt.InvalidTokenError as e:
            logger.warning(f"Invalid session token: {str(e)}")
            raise HTTPException(
                status_code=401,
                detail="Invalid session token",
                headers={"X-Shopify-Retry-Invalid-Session-Request": "1"}
            )
    
    @staticmethod
    def is_document_request(request: Request) -> bool:
        """
        Check if this is a document request (initial page load) vs API request.
        Document requests typically don't have Authorization header.
        """
        return not request.headers.get("authorization")
    

# FastAPI dependency for session token validation
async def require_shopify_session(
    request: Request,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    FastAPI dependency to validate Shopify session token.
    Extracts shop from token and looks up organization.
    Returns decoded token with db_shop and organization_id.
    
    Usage:
        @router.get("/some-endpoint")
        async def some_endpoint(
            shopify_session: dict = Depends(require_shopify_session),
            db: Session = Depends(get_db)
        ):
            shop_id = shopify_session['shop_id']
            org_id = shopify_session['organization_id']
            db_shop = shopify_session['db_shop']
            # ... use the shop info
    """
    from app.repositories.shopify_shop_repository import ShopifyShopRepository
    
    session_token = ShopifySessionService.get_session_token_from_request(request)
    
    if not session_token:
        raise HTTPException(
            status_code=401,
            detail="Session token required for embedded app",
            headers={"X-Shopify-Retry-Invalid-Session-Request": "1"}
        )
    
    # Validate and decode token
    decoded = ShopifySessionService.validate_session_token(session_token)
    
    # Extract shop domain from token
    shop_domain = decoded.get('dest', '').replace('https://', '').replace('http://', '')
    
    # Look up shop in database
    shop_repository = ShopifyShopRepository(db)
    db_shop = shop_repository.get_shop_by_domain(shop_domain)
    
    if not db_shop or not db_shop.is_installed:
        raise HTTPException(status_code=403, detail="Shop not installed or not found")
    
    # Add shop info to decoded token for easy access
    decoded['db_shop'] = db_shop
    decoded['shop_id'] = str(db_shop.id)
    decoded['shop_domain'] = shop_domain
    decoded['organization_id'] = db_shop.organization_id if db_shop.organization_id else None

    logger.info(f"Session token validated for shop: {shop_domain}, org: {decoded['organization_id']}")

    return decoded


async def require_shopify_or_jwt_auth(
    request: Request,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Hybrid authentication dependency that tries Shopify session token first,
    then falls back to JWT authentication.
    Returns authentication info with type indicator.
    
    Usage:
        @router.get("/some-endpoint")
        async def some_endpoint(
            auth_info: dict = Depends(require_shopify_or_jwt_auth),
            db: Session = Depends(get_db)
        ):
            if auth_info['auth_type'] == 'shopify_session':
                org_id = auth_info['organization_id']
                shop_id = auth_info['shop_id']
                user_id = None  # No user for session token auth
            else:  # jwt
                org_id = auth_info['organization_id']
                user_id = auth_info['user_id']
                current_user = auth_info['current_user']
    """
    from app.core.auth import get_current_user
    from app.repositories.shopify_shop_repository import ShopifyShopRepository
    
    # First try Shopify session token
    session_token = ShopifySessionService.get_session_token_from_request(request)
    
    if session_token:
        try:
            # Validate and decode the session token
            decoded = ShopifySessionService.validate_session_token(session_token)
            
            # Extract shop domain from token
            shop_domain = decoded.get('dest', '').replace('https://', '').replace('http://', '')
            
            if shop_domain:
                # Look up shop in database
                shop_repository = ShopifyShopRepository(db)
                db_shop = shop_repository.get_shop_by_domain(shop_domain)
                
                if db_shop and db_shop.is_installed and db_shop.organization_id:
                    logger.info(f"Using Shopify session token auth for shop: {shop_domain}")
                    return {
                        'auth_type': 'shopify_session',
                        'shop_domain': shop_domain,
                        'shop_id': str(db_shop.id),
                        'organization_id': db_shop.organization_id,  # Keep as UUID for consistency
                        'db_shop': db_shop,
                        'decoded_token': decoded,
                        'user_id': None  # No user_id for session token auth
                    }
        except Exception as e:
            logger.debug(f"Shopify session token validation failed, trying JWT: {str(e)}")
    
    # Fall back to JWT authentication
    try:
        current_user = await get_current_user(request=request, db=db)
        logger.info(f"Using JWT auth for user: {current_user.id}")
        return {
            'auth_type': 'jwt',
            'organization_id': current_user.organization_id,  # Keep as UUID for consistency
            'user_id': current_user.id,
            'current_user': current_user
        }
    except Exception as e:
        logger.error(f"Both Shopify session token and JWT authentication failed: {str(e)}")
        raise HTTPException(
            status_code=401,
            detail="Authentication required"
        )

