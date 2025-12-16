"""
ChatterMate - Widget Token Generation API
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

from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import jwt
import logging
import time
from typing import Optional, Dict, Any
import uuid

from app.database import get_db
from app.models.widget import Widget
from app.models.customer import Customer
from app.core.config import settings
from app.core.security import CONVERSATION_SECRET_KEY, ALGORITHM
from pydantic import BaseModel

router = APIRouter()
logger = logging.getLogger(__name__)

# ============================================================================
# MODELS
# ============================================================================

class GenerateTokenRequest(BaseModel):
    """Request to generate widget token - requires API key in Authorization header"""
    widget_id: str
    customer_email: Optional[str] = None
    customer_name: Optional[str] = None
    custom_data: Optional[Dict[str, Any]] = None
    ttl_seconds: Optional[int] = 3600  # Default 1 hour

class RevokeTokenRequest(BaseModel):
    """Request to revoke a token"""
    token: str
    reason: Optional[str] = None

class RevokeByEmailRequest(BaseModel):
    """Request to revoke all sessions for a user by email"""
    email: str
    widget_id: Optional[str] = None  # If provided, revoke only sessions for this widget
    reason: Optional[str] = None

class RevokeTokenResponse(BaseModel):
    """Response for token revocation"""
    success: bool
    message: str
    revoked_at: Optional[str] = None

class RevokeByEmailResponse(BaseModel):
    """Response for revoking sessions by email"""
    success: bool
    message: str
    revoked_count: int
    revoked_at: Optional[str] = None

class UserSessionInfo(BaseModel):
    """Information about active sessions for a user"""
    email: str
    active_session_count: int
    session_jtis: list

class AllSessionsResponse(BaseModel):
    """Response with all active sessions"""
    success: bool
    total_users: int
    total_sessions: int
    users: Dict[str, Any]  # email -> {active_session_count, session_jtis}

class TokenData(BaseModel):
    """Token response data"""
    token: str
    widget_id: str
    expires_in: int
    expires_at: str
    created_at: str

class GenerateTokenResponse(BaseModel):
    """Response with generated token"""
    success: bool
    data: TokenData
    message: Optional[str] = None

# ============================================================================
# DEPENDENCIES
# ============================================================================

async def validate_api_key(request: Request):
    """Validate API key from Authorization header (Bearer token)"""
    auth_header = request.headers.get("Authorization", "")
    
    if not auth_header.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid Authorization header. Use 'Bearer YOUR_API_KEY'",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    api_key = auth_header[len("Bearer "):]
    
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="API key cannot be empty",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Validate API key against settings
    if api_key != settings.WIDGET_API_KEY:
        logger.warning(f"Invalid API key attempt")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API key",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return api_key

# ============================================================================
# ENDPOINTS
# ============================================================================

@router.post("/generate-token", response_model=GenerateTokenResponse, status_code=status.HTTP_201_CREATED)
async def generate_widget_token(
    body: GenerateTokenRequest,
    db: Session = Depends(get_db),
    api_key: str = Depends(validate_api_key)
):
    """
    Generate a JWT token for widget authentication.
    
    Only calls with valid API key (in Authorization header) will succeed.
    Frontend receives this token and must pass it to the widget.
    
    The token is signed with CONVERSATION_SECRET_KEY and can be verified by the widget.
    
    Args:
        body: GenerateTokenRequest with widget_id, customer_email, customer_name, ttl_seconds
        db: Database session
        api_key: Validated API key from Authorization header
    
    Returns:
        GenerateTokenResponse with JWT token
    
    Raises:
        HTTPException 401: Invalid or missing API key
        HTTPException 404: Widget not found
        HTTPException 400: Invalid widget_id
    
    Example:
        POST /api/v1/generate-token
        Authorization: Bearer YOUR_API_KEY
        {
            "widget_id": "widget-123",
            "customer_email": "user@example.com",
            "customer_name": "John Doe",
            "ttl_seconds": 3600
        }
        
        Response:
        {
            "success": true,
            "data": {
                "token": "eyJhbGciOiJIUzI1NiIs...",
                "widget_id": "widget-123",
                "expires_in": 3600,
                "expires_at": "2024-11-09T15:00:00",
                "created_at": "2024-11-09T14:00:00"
            }
        }
    """
    try:
        # Validate widget exists
        widget = db.query(Widget).filter(
            Widget.id == body.widget_id
        ).first()
        
        if not widget:
            logger.error(f"Widget not found: {body.widget_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Widget '{body.widget_id}' not found"
            )
        
        # Create or update customer
        customer = None
        
        if body.customer_email:
            # Get or create customer by email
            customer = db.query(Customer).filter(
                Customer.email == body.customer_email,
                Customer.organization_id == widget.organization_id
            ).first()
            
            if not customer:
                # Create new customer with email
                customer = Customer(
                    email=body.customer_email,
                    full_name=body.customer_name,
                    organization_id=widget.organization_id
                )
                db.add(customer)
                db.commit()
                db.refresh(customer)
                logger.info(f"Created new customer: {customer.id} with email {body.customer_email}")
            else:
                # Update existing customer with new name if provided
                if body.customer_name and customer.full_name != body.customer_name:
                    customer.full_name = body.customer_name
                    db.commit()
                    logger.info(f"Updated customer {customer.id} name to {body.customer_name}")
        else:
            # No email provided - create anonymous customer
            # Generate a unique email for anonymous customers
            import time
            timestamp = int(time.time() * 1000)
            anonymous_email = f"anonymous-{timestamp}@{widget.organization_id}.local"
            
            customer = Customer(
                email=anonymous_email,
                full_name=body.customer_name or "Anonymous",
                organization_id=widget.organization_id
            )
            db.add(customer)
            db.commit()
            db.refresh(customer)
            logger.info(f"Created anonymous customer: {customer.id}")
        
        # Validate TTL
        ttl = body.ttl_seconds or 3600
        if ttl < 60 or ttl > 86400:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="ttl_seconds must be between 60 and 86400 (1 minute to 24 hours) for security and performance reasons"
            )
        
        # Check for existing valid token for this customer/widget combination
        # This prevents token multiplication when user refreshes page
        customer_email = body.customer_email or customer.email
        from app.core.security import get_existing_valid_token, verify_conversation_token
        
        existing_jti = get_existing_valid_token(customer_email, body.widget_id, str(customer.id))
        
        # Always generate a new token with a new JTI and expiration
        now = datetime.utcnow()
        expires_at = now + timedelta(seconds=ttl)
        
        # Generate JTI for token tracking and revocation
        jti = str(uuid.uuid4())
        
        token_payload = {
            "sub": str(customer.id),  # Sub is now always the customer_id
            "widget_id": body.widget_id,
            "customer_email": customer_email,
            "customer_name": body.customer_name or customer.full_name,
            "customer_id": str(customer.id),  # Explicit customer_id claim
            "jti": jti,  # Add JTI for revocation support
            "iat": int(now.timestamp()),
            "exp": int(expires_at.timestamp()),
            "type": "conversation"
        }
        
        # Include custom data if provided
        if body.custom_data:
            token_payload["custom_data"] = body.custom_data
        
        # Generate JWT token
        token = jwt.encode(
            token_payload,
            CONVERSATION_SECRET_KEY,
            algorithm=ALGORITHM
        )
        
        # Store token in Redis for revocation support with email and widget_id (only if new)
        if not existing_jti:
            from app.core.security import _store_token_in_redis
            _store_token_in_redis(
                jti, 
                ttl, 
                email=customer_email,
                widget_id=body.widget_id
            )
            logger.info(f"Generated new widget token for widget_id={body.widget_id}, customer_email={customer_email}, expires_in={ttl}s")
        else:
            logger.info(f"Reused existing widget token for widget_id={body.widget_id}, customer_email={customer_email}, jti={jti[:8]}...")
        
        return GenerateTokenResponse(
            success=True,
            data=TokenData(
                token=token,
                widget_id=body.widget_id,
                expires_in=ttl,
                expires_at=expires_at.isoformat(),
                created_at=now.isoformat()
            ),
            message=f"Token generated successfully. Expires in {ttl} seconds."
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Error generating token: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate token"
        )

@router.post("/verify-token")
async def verify_widget_token(
    token: str,
    widget_id: str,
    db: Session = Depends(get_db),
    api_key: str = Depends(validate_api_key)
):
    """
    Verify a widget token (for backend validation).
    
    Args:
        token: JWT token to verify
        widget_id: Widget ID to match against token
        db: Database session
        api_key: Validated API key from Authorization header
    
    Returns:
        Token data if valid, error if invalid
    
    Example:
        POST /api/v1/verify-token?token=eyJ...&widget_id=widget-123
        Authorization: Bearer YOUR_API_KEY
    """
    try:
        # Verify JWT signature
        payload = jwt.decode(
            token,
            CONVERSATION_SECRET_KEY,
            algorithms=[ALGORITHM]
        )
        
        # Verify widget_id matches
        if payload.get("widget_id") != widget_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Token widget_id does not match provided widget_id"
            )
        
        logger.info(f"Token verified successfully for widget_id={widget_id}")
        
        return {
            "valid": True,
            "token_data": payload
        }
        
    except jwt.ExpiredSignatureError:
        logger.warning(f"Token expired for widget_id={widget_id}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token has expired"
        )
    except jwt.InvalidTokenError as e:
        logger.warning(f"Invalid token: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid token"
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Error verifying token: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to verify token"
        )

@router.post("/revoke-token", response_model=RevokeTokenResponse, status_code=status.HTTP_200_OK)
async def revoke_widget_token(
    body: RevokeTokenRequest,
    db: Session = Depends(get_db),
    api_key: str = Depends(validate_api_key)
):
    """
    Revoke a widget authentication token immediately.
    
    Once revoked, a token becomes invalid even if it hasn't expired naturally.
    
    Use cases:
    - User logout: Revoke tokens when user logs out
    - Permission changes: Invalidate tokens when user role/permissions change
    - Security incident: Revoke compromised tokens
    - Manual revocation: Admin/portal revokes a specific token
    
    Args:
        body: RevokeTokenRequest with token and optional reason
        db: Database session
        api_key: Validated API key from Authorization header
    
    Returns:
        RevokeTokenResponse indicating success/failure
    
    Example:
        POST /api/v1/revoke-token
        Authorization: Bearer YOUR_API_KEY
        {
            "token": "eyJhbGciOiJIUzI1NiIs...",
            "reason": "User logged out"
        }
        
        Response:
        {
            "success": true,
            "message": "Token revoked successfully",
            "revoked_at": "2024-11-09T14:05:00"
        }
    """
    try:
        token = body.token
        reason = body.reason or "Manual revocation via API"
        
        if not token:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Token cannot be empty"
            )
        
        # Verify and decode the token
        try:
            payload = jwt.decode(
                token,
                CONVERSATION_SECRET_KEY,
                algorithms=[ALGORITHM],
                options={"verify_exp": False}  # Allow revocation of expired tokens
            )
        except jwt.InvalidTokenError as e:
            logger.warning(f"Invalid token format for revocation: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid token format"
            )
        
        # Extract token information
        jti = payload.get("jti")
        
        if not jti:
            logger.warning("Token does not have JTI claim, cannot revoke")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Token does not support revocation (missing JTI claim)"
            )
        
        # Revoke the token
        from app.core.security import revoke_token
        revoke_token(jti)
        
        revoked_at = datetime.utcnow()
        
        logger.info(
            f"Token revoked: jti={jti[:8]}... reason={reason}"
        )
        
        return RevokeTokenResponse(
            success=True,
            message=f"Token revoked successfully. Reason: {reason}",
            revoked_at=revoked_at.isoformat()
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Error revoking token: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to revoke token"
        )


@router.post("/revoke-by-email", response_model=RevokeByEmailResponse, status_code=status.HTTP_200_OK)
async def revoke_user_sessions(
    body: RevokeByEmailRequest,
    db: Session = Depends(get_db),
    api_key: str = Depends(validate_api_key)
):
    """
    Revoke all active sessions for a user by email address.
    
    This endpoint allows the backend to revoke all tokens for a user.
    Optionally filter by widget_id to revoke sessions for a specific widget only.
    
    This is useful when:
    - A user's email is compromised
    - A user is deleted from the system
    - Administrative action is taken on a user
    - A user is terminated in the portal
    - A user is removed from a specific widget
    
    Args:
        body: RevokeByEmailRequest with:
            - email: User's email address (required)
            - widget_id: Optional widget ID to revoke sessions only for that widget
            - reason: Optional revocation reason
        db: Database session
        api_key: Validated API key from Authorization header
    
    Returns:
        RevokeByEmailResponse with count of revoked sessions
    
    Examples:
        # Revoke ALL sessions for user across all widgets:
        POST /api/v1/revoke-by-email
        Authorization: Bearer YOUR_API_KEY
        {
            "email": "user@example.com",
            "reason": "User terminated in portal"
        }
        
        Response:
        {
            "success": true,
            "message": "All 3 session(s) revoked for user. Reason: User terminated in portal",
            "revoked_count": 3,
            "revoked_at": "2025-12-16T05:53:16.469718"
        }
        
        # Revoke sessions ONLY for a specific widget:
        POST /api/v1/revoke-by-email
        Authorization: Bearer YOUR_API_KEY
        {
            "email": "user@example.com",
            "widget_id": "widget-123",
            "reason": "User removed from widget"
        }
        
        Response:
        {
            "success": true,
            "message": "All 1 session(s) revoked for user in widget 'widget-123'. Reason: User removed from widget",
            "revoked_count": 1,
            "revoked_at": "2025-12-16T05:53:16.469718"
        }
    """
    try:
        email = body.email.strip().lower()
        widget_id = body.widget_id.strip() if body.widget_id else None
        reason = body.reason or "Revoked by administrator"
        
        if not email or "@" not in email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid email format"
            )
        
        # Revoke sessions for this email
        from app.core.security import revoke_user_sessions, revoke_user_sessions_by_widget, get_user_active_sessions
        
        # Get count before revocation
        active_sessions = get_user_active_sessions(email, widget_id=widget_id)
        revoked_count = len(active_sessions)
        
        # Revoke sessions based on whether widget_id is specified
        if widget_id:
            revoke_user_sessions_by_widget(email, widget_id)
            scope_message = f"in widget '{widget_id}'"
        else:
            revoke_user_sessions(email)
            scope_message = "across all widgets"
        
        revoked_at = datetime.utcnow()
        
        logger.info(
            f"Sessions revoked for user: {email} {scope_message} count={revoked_count} reason={reason}"
        )
        
        return RevokeByEmailResponse(
            success=True,
            message=f"All {revoked_count} session(s) revoked for user {scope_message}. Reason: {reason}",
            revoked_count=revoked_count,
            revoked_at=revoked_at.isoformat()
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Error revoking sessions by email: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to revoke sessions"
        )


@router.get("/active-sessions", response_model=AllSessionsResponse, status_code=status.HTTP_200_OK)
async def get_all_active_sessions(
    api_key: str = Depends(validate_api_key),
    db: Session = Depends(get_db)
):
    """
    Get all currently active sessions across all users.
    
    This endpoint returns information about all active user sessions tracked in Redis.
    It's useful for:
    - Monitoring active sessions
    - Finding sessions to terminate
    - Administrative oversight
    - Portal integration to check if session is still active
    
    Args:
        api_key: Validated API key from Authorization header
        db: Database session
    
    Returns:
        AllSessionsResponse with all active sessions grouped by email
    
    Example:
        GET /api/v1/active-sessions
        Authorization: Bearer YOUR_API_KEY
        
        Response:
        {
            "success": true,
            "total_users": 2,
            "total_sessions": 3,
            "users": {
                "user1@example.com": {
                    "active_session_count": 2,
                    "session_jtis": ["uuid-1", "uuid-2"]
                },
                "user2@example.com": {
                    "active_session_count": 1,
                    "session_jtis": ["uuid-3"]
                }
            }
        }
    """
    try:
        from app.core.security import get_all_active_sessions
        
        # Get all active sessions
        all_sessions = get_all_active_sessions()
        
        # Build response with user details
        total_sessions = 0
        users_data = {}
        
        for email, jtis in all_sessions.items():
            session_count = len(jtis)
            total_sessions += session_count
            users_data[email] = {
                "active_session_count": session_count,
                "session_jtis": jtis
            }
        
        logger.info(
            f"Retrieved active sessions: total_users={len(users_data)} total_sessions={total_sessions}"
        )
        
        return AllSessionsResponse(
            success=True,
            total_users=len(users_data),
            total_sessions=total_sessions,
            users=users_data
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Error retrieving active sessions: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve active sessions"
        )
