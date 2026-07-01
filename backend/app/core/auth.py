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

from fastapi import Depends, HTTPException, status, Cookie, Request
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
from typing import Optional, List

from app.database import get_db
from app.models.user import User
from app.models.organization import Organization
from app.core.security import verify_token
from app.core.logger import get_logger
from app.models.role import Role

logger = get_logger(__name__)

# Enterprise: Personal Access Tokens (PATs). PATs are an enterprise-only feature, so the
# resolver lives in the enterprise package. In the community edition that package is absent
# and this falls back to a no-op, meaning "cmat_" bearer tokens simply fail normal JWT
# verification like any other invalid token. See app/enterprise/services/pat.py.
#
# The enterprise resolver is imported lazily (on first use) rather than at module load: the
# enterprise package pulls in the API routers, which import this module, so an eager import
# here would create a circular import during application start-up.
PAT_TOKEN_PREFIX = "cmat_"
_pat_resolver = None
_pat_resolver_loaded = False


def _resolve_pat_user(token: str, db: Session) -> Optional[User]:
    global _pat_resolver, _pat_resolver_loaded
    if not _pat_resolver_loaded:
        _pat_resolver_loaded = True
        try:
            from app.enterprise.services.pat import resolve_pat_user
            _pat_resolver = resolve_pat_user
        except ImportError:  # community edition / enterprise package not installed
            _pat_resolver = None
    if _pat_resolver is None:
        return None
    return _pat_resolver(token, db)

def check_permissions(user: User, required_permissions: List[str]) -> bool:
    """Check if user has required permissions through their role"""
    if not user.role or not user.role.permissions:
        return False
    user_permissions = [p.name for p in user.role.permissions]
    # If user has super_admin permission, they have access to everything
    if "super_admin" in user_permissions:
        return True
    return all(perm in user_permissions for perm in required_permissions)

def require_permissions(*required_permissions: str):
    """Dependency to check user permissions"""
    async def permission_checker(
        current_user: User = Depends(get_current_user)
    ) -> User:
        if not check_permissions(current_user, list(required_permissions)):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions"
            )
        return current_user
    return permission_checker

async def get_current_user(
    request: Request,
    access_token: Optional[str] = Cookie(None),
    db: Session = Depends(get_db)
) -> User:
    """Get current user from access token cookie"""
    try:
        # Manually extract cookie from request if access_token is not a string
        if access_token is None or not isinstance(access_token, str):
            # Try to get from cookies directly
            cookie_token = request.cookies.get('access_token')
            # Ensure we got a valid string, not a mock or None
            if cookie_token and isinstance(cookie_token, str):
                access_token = cookie_token
            else:
                access_token = None
        
        if not access_token or not isinstance(access_token, str):
            # Try getting token from Authorization header as fallback
            auth_header = request.headers.get('Authorization')
            if auth_header and auth_header.startswith('Bearer '):
                access_token = auth_header.split(' ')[1]
            else:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Not authenticated",
                    headers={"WWW-Authenticate": "Bearer"},
                )

        # Enterprise: a Personal Access Token resolves directly to its owning user.
        if access_token.startswith(PAT_TOKEN_PREFIX):
            pat_user = _resolve_pat_user(access_token, db)
            if pat_user is not None and pat_user.is_active:
                return pat_user
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or revoked access token",
                headers={"WWW-Authenticate": "Bearer"},
            )

        payload = verify_token(access_token)
        if payload is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication token",
                headers={"WWW-Authenticate": "Bearer"},
            )

        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload",
                headers={"WWW-Authenticate": "Bearer"},
            )

        user = db.query(User).filter(User.id == user_id).first()
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found",
                headers={"WWW-Authenticate": "Bearer"},
            )

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User is inactive",
                headers={"WWW-Authenticate": "Bearer"},
            )

        return user

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Authentication error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

async def get_current_organization(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Organization:
    """Get current user's organization"""
    if not current_user.organization_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User is not associated with any organization"
        )
    
    organization = db.query(Organization).filter(
        Organization.id == current_user.organization_id,
        Organization.is_active == True
    ).first()
    
    if not organization:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Organization not found or inactive"
        )
    
    return organization

def require_permission(permission: str):
    """Dependency for checking if user has specific permission"""
    async def permission_dependency(
        current_user: User = Depends(get_current_user)
    ) -> User:
        if not current_user.role or not current_user.role.has_permission(permission):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"User does not have required permission: {permission}"
            )
        return current_user
    return permission_dependency

def require_subscription_management(
    current_user: User = Depends(get_current_user)
) -> User:
    """Dependency for checking if user can manage subscriptions"""
    if not current_user.role or not current_user.role.can_manage_subscription():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User does not have permission to manage subscriptions"
        )
    return current_user


# Unified Authentication Functions
def get_auth_info_from_request(request: Request) -> dict:
    """Determine if this is a Shopify request based on the URL path"""
    return {"is_shopify": "/shopify" in str(request.url)}


async def get_unified_auth(request: Request, db: Session = Depends(get_db)) -> dict:
    """Unified authentication that handles both regular JWT and Shopify session tokens"""
    from app.services.shopify_session import require_shopify_or_jwt_auth

    try:
        # Check if this is a Shopify-related endpoint or has query params indicating Shopify context
        url_str = str(request.url)
        query_params = dict(request.query_params)
        is_shopify_context = (
            "/shopify" in url_str or
            url_str.endswith("/shopify") or
            "shop" in query_params or
            "host" in query_params
        )

        if is_shopify_context:
            # For Shopify endpoints or context, use the shopify/JWT auth
            auth_result = await require_shopify_or_jwt_auth(request, db)
            return {
                "auth_type": auth_result.get("auth_type", "shopify"),
                "organization_id": auth_result["organization_id"],
                "user_id": auth_result.get("user_id"),
                "current_user": auth_result.get("current_user")
            }
        else:
            # For regular endpoints, use JWT auth - inline the logic to avoid calling dependency as function
            try:
                # Get token from cookie or Authorization header
                access_token = request.cookies.get('access_token')
                
                if not access_token or not isinstance(access_token, str):
                    # Try getting token from Authorization header as fallback
                    auth_header = request.headers.get('Authorization')
                    if auth_header and auth_header.startswith('Bearer '):
                        access_token = auth_header.split(' ')[1]
                    else:
                        raise HTTPException(
                            status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="Not authenticated",
                            headers={"WWW-Authenticate": "Bearer"},
                        )

                # Enterprise: a Personal Access Token resolves directly to its owning user.
                if access_token.startswith(PAT_TOKEN_PREFIX):
                    current_user = _resolve_pat_user(access_token, db)
                    if current_user is None or not current_user.is_active:
                        raise HTTPException(
                            status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="Invalid or revoked access token",
                            headers={"WWW-Authenticate": "Bearer"},
                        )
                    if not check_permissions(current_user, ["manage_agents"]):
                        raise HTTPException(status_code=403, detail="Not enough permissions")
                    return {
                        "auth_type": "pat",
                        "organization_id": current_user.organization_id,
                        "user_id": current_user.id,
                        "current_user": current_user
                    }

                payload = verify_token(access_token)
                if payload is None:
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="Invalid authentication token",
                        headers={"WWW-Authenticate": "Bearer"},
                    )

                user_id = payload.get("sub")
                if user_id is None:
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="Invalid token payload",
                        headers={"WWW-Authenticate": "Bearer"},
                    )

                current_user = db.query(User).filter(User.id == user_id).first()
                if current_user is None:
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="User not found",
                        headers={"WWW-Authenticate": "Bearer"},
                    )

                if not current_user.is_active:
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="User is inactive",
                        headers={"WWW-Authenticate": "Bearer"},
                    )

                # Check permissions
                if not check_permissions(current_user, ["manage_agents"]):
                    raise HTTPException(
                        status_code=403,
                        detail="Not enough permissions"
                    )
                
                return {
                    "auth_type": "jwt",
                    "organization_id": current_user.organization_id,  # Keep as UUID
                    "user_id": current_user.id,
                    "current_user": current_user
                }
            except HTTPException:
                raise
            except Exception as e:
                logger.error(f"JWT authentication error in unified auth: {str(e)}", exc_info=True)
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Could not validate credentials",
                    headers={"WWW-Authenticate": "Bearer"},
                )
    except HTTPException:
        # Re-raise HTTP exceptions as-is (don't wrap them)
        raise
    except Exception as e:
        logger.error(f"Authentication error: {str(e)}")
        raise HTTPException(status_code=401, detail="Authentication failed")


async def get_unified_chat_auth(request: Request, db: Session = Depends(get_db)) -> dict:
    """Unified authentication that handles both regular JWT and Shopify session tokens for chat endpoints"""
    from app.services.shopify_session import require_shopify_or_jwt_auth
    
    try:
        if "/shopify" in str(request.url):
            # For Shopify endpoints, use the shopify auth
            auth_result = await require_shopify_or_jwt_auth(request, db)
            return {
                "auth_type": auth_result.get("auth_type", "shopify"),
                "organization_id": auth_result["organization_id"],
                "user_id": auth_result.get("user_id"),
                "current_user": auth_result.get("current_user")
            }
        else:
            # For regular endpoints, use JWT auth with chat permissions - inline the logic
            try:
                # Get token from cookie or Authorization header
                access_token = request.cookies.get('access_token')
                
                if not access_token or not isinstance(access_token, str):
                    # Try getting token from Authorization header as fallback
                    auth_header = request.headers.get('Authorization')
                    if auth_header and auth_header.startswith('Bearer '):
                        access_token = auth_header.split(' ')[1]
                    else:
                        raise HTTPException(
                            status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="Not authenticated",
                            headers={"WWW-Authenticate": "Bearer"},
                        )

                # Enterprise: a Personal Access Token resolves directly to its owning user.
                if access_token.startswith(PAT_TOKEN_PREFIX):
                    current_user = _resolve_pat_user(access_token, db)
                    if current_user is None or not current_user.is_active:
                        raise HTTPException(
                            status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="Invalid or revoked access token",
                            headers={"WWW-Authenticate": "Bearer"},
                        )
                    pat_permissions = {p.name for p in current_user.role.permissions}
                    pat_can_view_all = "view_all_chats" in pat_permissions
                    pat_can_view_assigned = "view_assigned_chats" in pat_permissions
                    if not (pat_can_view_all or pat_can_view_assigned):
                        raise HTTPException(status_code=403, detail="Not enough permissions")
                    return {
                        "auth_type": "pat",
                        "organization_id": current_user.organization_id,
                        "user_id": current_user.id,
                        "current_user": current_user,
                        "can_view_all": pat_can_view_all,
                        "can_view_assigned": pat_can_view_assigned
                    }

                payload = verify_token(access_token)
                if payload is None:
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="Invalid authentication token",
                        headers={"WWW-Authenticate": "Bearer"},
                    )

                user_id = payload.get("sub")
                if user_id is None:
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="Invalid token payload",
                        headers={"WWW-Authenticate": "Bearer"},
                    )

                current_user = db.query(User).filter(User.id == user_id).first()
                if current_user is None:
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="User not found",
                        headers={"WWW-Authenticate": "Bearer"},
                    )

                if not current_user.is_active:
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="User is inactive",
                        headers={"WWW-Authenticate": "Bearer"},
                    )

                # Check chat permissions
                user_permissions = {p.name for p in current_user.role.permissions}
                can_view_all = "view_all_chats" in user_permissions
                can_view_assigned = "view_assigned_chats" in user_permissions

                if not (can_view_all or can_view_assigned):
                    raise HTTPException(
                        status_code=403,
                        detail="Not enough permissions"
                    )
                
                return {
                    "auth_type": "jwt",
                    "organization_id": current_user.organization_id,  # Keep as UUID
                    "user_id": current_user.id,
                    "current_user": current_user,
                    "can_view_all": can_view_all,
                    "can_view_assigned": can_view_assigned
                }
            except HTTPException:
                raise
            except Exception as e:
                logger.error(f"JWT authentication error in unified chat auth: {str(e)}", exc_info=True)
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Could not validate credentials",
                    headers={"WWW-Authenticate": "Bearer"},
                )
    except HTTPException:
        # Re-raise HTTP exceptions as-is (don't wrap them)
        raise
    except Exception as e:
        logger.error(f"Chat authentication error: {str(e)}")
        raise HTTPException(status_code=401, detail="Authentication failed")
