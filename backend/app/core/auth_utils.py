"""
ChatterMate - Auth Utils
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

from typing import Optional, Tuple
import http.cookies
from app.core.security import verify_conversation_token, verify_token, create_access_token
from app.core.logger import get_logger
from app.database import get_db
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
                db = next(get_db())
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
    Authenticate widget socket connection using conversation token
    Returns: (widget_id, org_id, customer_id, conversation_token)
    """
    try:
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
        db = next(get_db())
        widget = db.query(Widget).filter(Widget.id == widget_id).first()
        if not widget:
            return None, None, None, None

        org_id = widget.organization_id
        db.close()
        return widget_id, org_id, customer_id, conversation_token

    except Exception as e:
        logger.error(f"Widget authentication error for sid {sid}: {str(e)}")
        return None, None, None, None
