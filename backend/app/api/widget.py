"""
ChatterMate - Widget
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

from fastapi import APIRouter, Depends, HTTPException, Response, Cookie, Header
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session, class_mapper
from typing import List, Optional
from jose import JWTError
import json

from app.models.widget import Widget
from app.models.user import User

from app.core.auth import get_current_user
from app.database import get_db
from app.repositories.widget import create_widget, get_widget, get_widgets, delete_widget
from app.repositories.agent import AgentRepository
from app.core.security import create_conversation_token, verify_conversation_token
from app.repositories.customer import CustomerRepository
from app.models.schemas.widget import WidgetCreate, WidgetResponse
from app.core.logger import get_logger
from app.repositories.session_to_agent import SessionToAgentRepository
from app.models.session_to_agent import SessionStatus
from app.core.config import settings
from app.core.s3 import get_s3_signed_url

router = APIRouter()
logger = get_logger(__name__)

@router.post("", response_model=WidgetResponse)
def create_new_widget(
    widget: WidgetCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Create a new widget for the organization"""
    return create_widget(db, widget, current_user.organization_id)


@router.get("/{widget_id}/data", response_class=HTMLResponse)
async def get_widget_ui(
    widget_id: str,
    response: Response,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """Get widget UI and handle customer authentication"""
    
    widget = db.query(Widget).filter(Widget.id == widget_id).first()
    if not widget:
        raise HTTPException(status_code=404, detail="Widget not found")

    # Get agent data
    agent_repo = AgentRepository(db)
    agent = agent_repo.get_by_id(widget.agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    # Check existing conversation token first
    customer_id = None
    if authorization and authorization.startswith('Bearer '):
        token = authorization.split(' ')[1]
        
        try:
            token_data = verify_conversation_token(token)
         
            if token_data and token_data.get("widget_id") == widget_id:
                customer_id = token_data.get("sub")
                return HTMLResponse(await get_widget_html(
                    widget_id=widget_id,
                    agent_name=agent.display_name or agent.name,
                    agent_customization=agent.customization,
                    customer_id=customer_id
                ))
        except (JWTError, ValueError) as e:
            # Invalid token, create new one
            pass

    # No valid token, create new one
    token = create_conversation_token(widget_id=widget_id)
    
    return HTMLResponse(await get_widget_html(
        widget_id=widget_id,
        agent_name=agent.display_name or agent.name,
        agent_customization=agent.customization,
        customer_id=customer_id,
        initial_token=token,
    ))

async def get_widget_html(widget_id: str, agent_name: str, agent_customization: dict, customer_id: Optional[str] = None, initial_token: Optional[str] = None) -> str:
    """Generate widget HTML with embedded data"""
    import html
    widget_url = settings.VITE_WIDGET_URL
    
    # Convert AgentCustomization to dict if it's a model instance
    customization_dict = {}
    if agent_customization:
        # Get signed URL for photo if using S3
        photo_url = agent_customization.photo_url

        customization_dict = {
            "chat_background_color": agent_customization.chat_background_color,
            "chat_bubble_color": agent_customization.chat_bubble_color,
            "accent_color": agent_customization.accent_color,
            "font_family": agent_customization.font_family,
            "photo_url": photo_url
        }
        
        # Only add photo_url_signed if using S3 storage
        if settings.S3_FILE_STORAGE and photo_url:
            customization_dict["photo_url"] = await get_s3_signed_url(photo_url)

    return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Chat Widget</title>
            <script type="module" crossorigin src="{widget_url}/assets/widget.js"></script>
            <link rel="stylesheet" crossorigin href="{widget_url}/assets/widget.css">
            <script>
                window.__INITIAL_DATA__ = {{
                    widgetId: "{html.escape(widget_id)}",
                    agentName: "{html.escape(agent_name)}",
                    customization: {json.dumps(customization_dict)},
                    customerId: "{html.escape(customer_id or '')}",
                    initialToken: "{html.escape(initial_token or '')}",
                    customer: {{}}
                }};
            </script>
        </head>
        <body>
            <div id="app"></div>
        </body>
        </html>
    """

async def get_customer_session_info(db: Session, customer_id: str) -> dict:
    """Get customer session info including human agent details if assigned"""
    customer_info = {}
    session_repo = SessionToAgentRepository(db)
    sessions = session_repo.get_customer_sessions(customer_id, SessionStatus.OPEN)
    
    if sessions and len(sessions) > 0:
        session_model, user_full_name, user_profile_pic = sessions[0]
        
        if user_full_name:  # If there's a human agent assigned
            profile_pic = user_profile_pic
            if settings.S3_FILE_STORAGE and profile_pic:
                profile_pic = await get_s3_signed_url(profile_pic)

            # Get human agent info from session
            agent_name = user_full_name if session_model.user_id else None
            agent_profile_pic = None
            if user_profile_pic:
                agent_profile_pic = user_profile_pic
                if settings.S3_FILE_STORAGE:
                    agent_profile_pic = await get_s3_signed_url(user_profile_pic)

            customer_info = {
                "full_name": user_full_name,
                "profile_pic": profile_pic,
                "agent_name": agent_name,
                "agent_profile_pic": agent_profile_pic
            }
    
    return customer_info

@router.get("/{widget_id}", response_model=WidgetResponse)
async def get_widget_data(
    widget_id: str,
    response: Response,
    email: Optional[str] = None,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """Get widget data including agent customization"""
    logger.info(f"Getting widget data for widget_id {widget_id}, email {email}")

    # Check if token exists
    if not authorization or not authorization.startswith('Bearer '):
        raise HTTPException(
            status_code=401,
            detail="Unauthorized"
        )

    token = authorization.split(' ')[1]
    widget = None
    # Verify conversation token and get widget_id from token
    try:
        token_data = verify_conversation_token(token)
        if not token_data or token_data.get("widget_id") != widget_id:
            raise HTTPException(
                status_code=401,
                detail="Unauthorized"
            )
        widget = db.query(Widget).filter(Widget.id == widget_id).first()
        if not widget:
                raise HTTPException(status_code=404, detail="Widget not found")
        # Get customer_id from token if exists
        customer_id = token_data.get("sub")

        agent_repo = AgentRepository(db)
        agent = agent_repo.get_by_id(widget.agent_id)

        if not agent:
            raise HTTPException(status_code=404, detail="Agent not found")

        # Fix the condition check
        should_create_customer = (customer_id == "None" or customer_id is None) and email

        
        customer_repo = CustomerRepository(db)
        customer_info = {}
        
        if should_create_customer:
            # Try to get existing customer first
            customer = customer_repo.get_customer_by_email(email, widget.organization_id)
            
            if not customer:
                # Create new customer if doesn't exist
                customer = customer_repo.create_customer(email, widget.organization_id)
            
            # Get session info for existing customer
            if customer:
                customer_info = await get_customer_session_info(db, customer.id)
            
            # Generate new token with customer_id
            new_token = create_conversation_token(
                customer_id=customer.id,
                widget_id=widget_id
            )
            
            # Create a copy of customization to modify photo_url
            customization = agent.customization
          
            if settings.S3_FILE_STORAGE and customization and customization.photo_url:
                # Get signed URL for the photo
                customization.photo_url = await get_s3_signed_url(customization.photo_url)

            return {
                "id": widget.id,
                "organization_id": widget.organization_id,
                "customer_id": customer.id,
                "customer": customer_info,
                "agent": {
                    "id": agent.id,
                    "name": agent.name,
                    "display_name": agent.display_name,
                    "customization": customization
                },
                "token": new_token
            }
        else:
            if customer_id == "None" or customer_id is None:
                raise HTTPException(
                    status_code=401,
                    detail="Unauthorized"
                )
            
            # Get session info for existing customer
            customer_info = await get_customer_session_info(db, customer_id)

    except JWTError:
        logger.error(f"JWTError: {JWTError}")
        raise HTTPException(
            status_code=401,
            detail="Unauthorized"
        )
    
                # Create a copy of customization to modify photo_url
    customization = agent.customization
          
    if settings.S3_FILE_STORAGE and customization and customization.photo_url:
        # Get signed URL for the photo
        customization.photo_url = await get_s3_signed_url(customization.photo_url)

    return {
        "id": widget.id,
        "organization_id": widget.organization_id,
        "customer_id": customer_id,
        "customer": customer_info,
        "agent": {
            "id": agent.id,
            "name": agent.name,
            "display_name": agent.display_name,
            "customization": customization
        }
    }


@router.get("", response_model=List[WidgetResponse])
def list_widgets(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """List all widgets for the organization"""
    return get_widgets(db, current_user.organization_id)


@router.delete("/{widget_id}")
def remove_widget(
    widget_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Delete a widget"""
    widget = get_widget(db, widget_id)
    if not widget or widget.organization_id != current_user.organization_id:
        raise HTTPException(status_code=404, detail="Widget not found")
    delete_widget(db, widget_id)
    return {"message": "Widget deleted"}

@router.get("/{widget_id}/details", response_model=WidgetResponse)
async def get_widget_details(
    widget_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Get widget details for authenticated users"""
    widget = db.query(Widget).filter(
        Widget.id == widget_id,
        Widget.organization_id == current_user.organization_id
    ).first()
    
    if not widget:
        raise HTTPException(status_code=404, detail="Widget not found")

    agent_repo = AgentRepository(db)
    agent = agent_repo.get_by_id(widget.agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    return {
        "id": widget.id,
        "organization_id": widget.organization_id,
        "agent": {
            "id": agent.id,
            "name": agent.name,
            "display_name": agent.display_name,
            "customization": agent.customization
        }
    }
