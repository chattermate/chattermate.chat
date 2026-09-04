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

from fastapi import APIRouter, Depends, Header, HTTPException, status, Request
from sqlalchemy.orm import Session
from datetime import datetime, timezone
import logging
import time
from typing import Optional, Dict, Any

from app.database import get_db
from app.models.widget import Widget
from app.models.customer import Customer
from app.core.config import settings
from app.core.security import (
    verify_conversation_token,
    get_existing_valid_token_jti,
    revoke_token as security_revoke_token,
)
from app.services import conversation_token
from app.repositories.widget_app import WidgetAppRepository
from app.repositories.customer import CustomerRepository
from pydantic import BaseModel, field_validator
import json

router = APIRouter()
logger = logging.getLogger(__name__)

# custom_data is embedded in both the JWT and the customer's stored meta_data, so cap
# its size to keep tokens small and prevent unbounded growth of the DB column.
CUSTOM_DATA_MAX_KEYS = 20
CUSTOM_DATA_MAX_BYTES = 4096

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

    @field_validator('custom_data')
    @classmethod
    def validate_custom_data_size(cls, value):
        if value is None:
            return value
        if len(value) > CUSTOM_DATA_MAX_KEYS:
            raise ValueError(f"custom_data supports at most {CUSTOM_DATA_MAX_KEYS} keys")
        size = len(json.dumps(value))
        if size > CUSTOM_DATA_MAX_BYTES:
            raise ValueError(f"custom_data must be at most {CUSTOM_DATA_MAX_BYTES} bytes when serialized")
        return value

class RefreshTokenRequest(BaseModel):
    """Request to rotate a still-valid conversation token"""
    widget_id: str

class RevokeTokenRequest(BaseModel):
    """Request to revoke a token"""
    token: str
    reason: Optional[str] = None

class RevokeTokenResponse(BaseModel):
    """Response for token revocation"""
    success: bool
    message: str
    revoked_at: Optional[str] = None

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

async def validate_api_key(request: Request, db: Session = Depends(get_db)):
    """
    Validate API key from Authorization header (Bearer token).

    Now validates against widget_apps table instead of hardcoded WIDGET_API_KEY.
    Uses Redis caching for performance.
    """
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

    # Validate against database (with Redis caching)
    repo = WidgetAppRepository(db)
    widget_app = repo.validate_api_key(api_key)

    if not widget_app:
        logger.warning(f"Invalid API key attempt")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API key",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Store widget_app in request state for downstream use
    request.state.widget_app = widget_app

    return api_key

# ============================================================================
# ENDPOINTS
# ============================================================================

@router.post("/generate-token", response_model=GenerateTokenResponse, status_code=status.HTTP_201_CREATED)
async def generate_widget_token(
    body: GenerateTokenRequest,
    request: Request,
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
        request: FastAPI request object (contains widget_app from API key validation)
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
        # Get widget_app from request state (set by validate_api_key)
        widget_app = request.state.widget_app

        # SECURITY: Validate widget exists AND belongs to same organization as the API key
        # This prevents cross-organization token generation
        widget = db.query(Widget).filter(
            Widget.id == body.widget_id,
            Widget.organization_id == widget_app.organization_id
        ).first()

        if not widget:
            logger.error(f"Widget not found or access denied: {body.widget_id}")
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
                # Create new customer with email. The embedding app supplied a known
                # identity, so this is an authenticated/integration customer (excluded
                # from the People/leads views), not an organic lead.
                customer = Customer(
                    email=body.customer_email,
                    full_name=body.customer_name,
                    meta_data=body.custom_data,
                    is_authenticated=True,
                    organization_id=widget.organization_id
                )
                db.add(customer)
                db.commit()
                db.refresh(customer)
                logger.info(f"Created new customer: {customer.id} with email {body.customer_email}")
            else:
                # An existing customer identified via the authenticated integration flow.
                if not customer.is_authenticated:
                    customer.is_authenticated = True
                    db.commit()
                # Update existing customer with new name if provided
                if body.customer_name and customer.full_name != body.customer_name:
                    customer.full_name = body.customer_name
                    db.commit()
                    logger.info(f"Updated customer {customer.id} name to {body.customer_name}")
                # Merge in any new/changed custom_data (e.g. student_name, center_name)
                # so agents see the latest values in the inbox; existing keys not
                # present in this call are preserved.
                if body.custom_data:
                    customer = CustomerRepository(db).update_meta_data(customer.id, body.custom_data) or customer
        else:
            # No email provided - create anonymous customer
            # Generate a unique email for anonymous customers
            import time
            timestamp = int(time.time() * 1000)
            anonymous_email = f"anonymous-{timestamp}@{widget.organization_id}.local"

            customer = Customer(
                email=anonymous_email,
                full_name=body.customer_name or "Anonymous",
                meta_data=body.custom_data,
                organization_id=widget.organization_id
            )
            db.add(customer)
            db.commit()
            db.refresh(customer)
            logger.info(f"Created anonymous customer: {customer.id}")
        
        # Validate TTL
        if not conversation_token.is_ttl_supported(body.ttl_seconds):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"ttl_seconds must be between {conversation_token.MIN_TTL_SECONDS} and "
                    f"{conversation_token.MAX_TTL_SECONDS} (1 minute to 24 hours) for security "
                    "and performance reasons"
                )
            )

        # Check for existing valid token for this customer/widget combination
        # This prevents token multiplication when user refreshes page
        customer_email = body.customer_email or customer.email
        existing_jti = get_existing_valid_token_jti(customer_email, body.widget_id, str(customer.id))
        if existing_jti:
            # Only the JTI is kept in Redis, so the token itself is re-signed - reusing
            # the ID keeps this customer to one revocable session per widget.
            logger.info(f"Found existing valid token for customer {customer.id} in widget {body.widget_id}, reusing JTI")

        token, expires_at, ttl = conversation_token.mint(
            {
                "sub": str(customer.id),  # Sub is now always the customer_id
                "widget_id": body.widget_id,
                "customer_email": customer_email,
                "customer_name": body.customer_name or customer.full_name,
                "customer_id": str(customer.id),  # Explicit customer_id claim
                "custom_data": body.custom_data,
            },
            ttl_seconds=body.ttl_seconds,
            jti=existing_jti,
        )
        now = datetime.now(timezone.utc)

        if not existing_jti:
            logger.info(f"Generated new widget token for widget_id={body.widget_id}, customer_email={customer_email}, expires_in={ttl}s")
        else:
            logger.info(f"Reused JTI and refreshed Redis TTL for widget_id={body.widget_id}, customer_email={customer_email}, jti={existing_jti[:8]}...")
        
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

@router.post("/refresh-token", response_model=GenerateTokenResponse)
async def refresh_widget_token(
    body: RefreshTokenRequest,
    authorization: Optional[str] = Header(None)
):
    """
    Rotate a still-valid conversation token, keeping the visitor's identity.

    The widget calls this before its token lapses, so a page left open longer than
    `ttl_seconds` doesn't silently drop an identified visitor back to anonymous.

    No API key: the request is authenticated by the conversation token it carries,
    which the caller already holds, so rotating it grants nothing new. An expired or
    revoked token is refused - only POST /generate-token (API key) can assert an
    identity - and rotation stops once the chain reaches its absolute ceiling.

    Args:
        body: RefreshTokenRequest with the widget_id the token was issued for
        authorization: `Bearer <conversation token>`

    Returns:
        GenerateTokenResponse with the replacement token

    Raises:
        HTTPException 401: missing, invalid, expired or revoked conversation token
    """
    token = authorization[len("Bearer "):].strip() if authorization and authorization.startswith("Bearer ") else None
    state = conversation_token.inspect(token, body.widget_id)

    if not state.is_live:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "code": (
                    conversation_token.IDENTITY_EXPIRED_CODE if state.identity_lost
                    else conversation_token.INVALID_TOKEN_CODE
                ),
                "message": "Conversation token is no longer valid. Issue a new one with /generate-token.",
            },
        )

    rotated = conversation_token.rotate(state.payload)
    if not rotated:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "code": conversation_token.IDENTITY_EXPIRED_CODE,
                "message": "Conversation token has reached its maximum lifetime. Issue a new one with /generate-token.",
            },
        )

    new_token, expires_at, ttl = rotated
    logger.info(f"Rotated conversation token for widget_id={body.widget_id}, expires_in={ttl}s")

    return GenerateTokenResponse(
        success=True,
        data=TokenData(
            token=new_token,
            widget_id=body.widget_id,
            expires_in=ttl,
            expires_at=expires_at.isoformat(),
            created_at=datetime.now(timezone.utc).isoformat()
        ),
        message=f"Token refreshed successfully. Expires in {ttl} seconds."
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
        # Verify JWT signature AND check Redis revocation status
        # This ensures revoked tokens are rejected
        payload = verify_conversation_token(token)

        if not payload:
            logger.warning(f"Token invalid or revoked for widget_id={widget_id}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Token is invalid or has been revoked"
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
        
        # Expired tokens stay revocable: only the signature has to hold up here.
        payload = conversation_token.claims_ignoring_expiry(token)
        if payload is None:
            logger.warning("Invalid token format for revocation")
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
        security_revoke_token(jti)
        
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

