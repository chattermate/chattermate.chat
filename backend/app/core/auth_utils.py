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

from typing import Optional, Tuple
import http.cookies
from app.core.security import verify_conversation_token, verify_token, create_access_token
from app.core.logger import get_logger
from app.database import get_db, SessionLocal
from app.models.user import User
from sqlalchemy.orm import Session
from app.core.socketio import sio
from app.models.widget import Widget

logger = get_logger(__name__)


async def refresh_access_token(refresh_token: str, db: Session) -> str | None:
    """Refresh access token using refresh token"""
    try:
        payload = verify_token(refresh_token)
        if not payload or payload.get("type") != "refresh":
            return None

        user_id = payload.get("sub")
        org_id = payload.get("org")

        if not user_id or not org_id:
            return None

        # Verify user exists and is active
        user = db.query(User).filter(User.id == user_id).first()
        if not user or not user.is_active:
            return None

        # Generate new access token
        token_data = {"sub": user_id, "org": org_id}
        return create_access_token(token_data)

    except Exception as e:
        logger.error(f"Token refresh failed: {str(e)}")
        return None


async def authenticate_socket(sid: str, environ: dict) -> Tuple[Optional[str], Optional[int], Optional[int]]:
    """
    Authenticate socket connection using cookies
    Returns: (access_token, user_id, org_id)
    """
    try:
        # Extract cookies from environ
        cookie_str = environ.get('HTTP_COOKIE', environ.get('headers', {}).get('Cookie', ''))
        cookies = http.cookies.SimpleCookie()
        cookies.load(cookie_str)

        # Get access token from cookies
        access_token = None
        if 'access_token' in cookies:
            access_token = cookies['access_token'].value

        if not access_token:
            logger.info("No access token found in cookies")
            # Try to refresh using refresh token
            if 'refresh_token' in cookies:
                refresh_token = cookies['refresh_token'].value
                with SessionLocal() as db:
                    access_token = await refresh_access_token(refresh_token, db)

                # Emit cookie_set event with the new token
                await sio.emit('cookie_set', {
                    'access_token': access_token
                }, to=sid)
                logger.info(f"New access token generated for sid {sid}")

        if not access_token:
            return None, None, None

        # Verify token and get user info
        payload = verify_token(access_token)
        if not payload:
            return None, None, None

        user_id = payload.get('sub')
        org_id = payload.get('org')

        return access_token, user_id, org_id

    except Exception as e:
        logger.error(f"Authentication error for sid {sid}: {str(e)}")
        return None, None, None


async def authenticate_socket_conversation_token(sid: str, auth: dict) -> Tuple[Optional[str], Optional[str], Optional[str], Optional[str]]:
    """
    Authenticate widget socket connection using conversation token.
    Supports both token-required and optional-token authentication modes.
    
    Returns: (widget_id, org_id, customer_id, conversation_token)
    Returns (None, None, None, None) if authentication fails
    """
    try:
        if not auth or not isinstance(auth, dict):
            logger.warning(f"Socket auth failed: No auth data for sid {sid}")
            return None, None, None, None
        conversation_token = None
        
        # Get token from Socket.IO auth data
        conversation_token = auth.get('conversation_token', '')
        
                
        if not conversation_token:
            logger.info("No conversation token found in auth data or cookies")
            return None, None, None, None

        # Verify token and get info
        token_data = verify_conversation_token(conversation_token)
        if not token_data:
            return None, None, None, None

        widget_id = token_data.get('widget_id')
        customer_id = token_data.get('sub')
        token_type = token_data.get('type')

        # Verify token type
        if token_type != "conversation":
            logger.info(f"Invalid token type: {token_type}")
            return None, None, None, None

        logger.info(f"Authenticated widget {widget_id} for customer {customer_id}")

        # Get widget to verify and get org_id
        with SessionLocal() as db:
            widget = db.query(Widget).filter(Widget.id == widget_id).first()
            if not widget:
                return None, None, None, None

            org_id = widget.organization_id

            # Resolve merged customers: if this device's token still carries an
            # anonymous customer that was merged into an identified one (lead
            # capture matched an existing email), continue as the merged target so
            # returning visitors keep their identity and history.
            if customer_id:
                from app.models.customer import Customer
                seen = set()
                current = customer_id
                while current and current not in seen:
                    seen.add(current)
                    merged_into = db.query(Customer.merged_into_customer_id).filter(
                        Customer.id == current).scalar()
                    if not merged_into:
                        break
                    logger.info(f"Customer {current} was merged; continuing as {merged_into}")
                    current = str(merged_into)
                customer_id = current
        return widget_id, org_id, customer_id, conversation_token

    except Exception as e:
        logger.error(f"Widget authentication error for sid {sid}: {str(e)}")
        return None, None, None, None
