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

from fastapi import APIRouter, Depends, HTTPException, Response, Header, Query
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session
from typing import List, Optional
from jose import JWTError
import json
import time

from app.models.widget import Widget
from app.models.user import User

from app.core.auth import get_current_user
from app.database import get_db
from app.repositories.widget import WidgetRepository
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
    widget_repo = WidgetRepository(db)
    return widget_repo.create_widget(widget, current_user.organization_id)


@router.get("/{widget_id}/data", response_class=HTMLResponse)
async def get_widget_ui(
    widget_id: str,
    response: Response,
    authorization: Optional[str] = Header(None),
    source: Optional[str] = Query(None),
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
                    customer_id=customer_id,
                    agent_workflow=bool(agent.use_workflow and agent.active_workflow_id),
                    allow_attachments=agent.allow_attachments
                ))
        except (JWTError, ValueError):
            pass

    # No valid token, create new one
    # Store source in token if widget_id matches and source is provided (prioritize new source, fallback to old)
    token_extra_data = {}
    if widget_id == settings.EXPLORE_WIDGET_ID:
        if source:
            token_extra_data["source"] = source

    
    token = create_conversation_token(widget_id=widget_id, **token_extra_data)
    
    return HTMLResponse(await get_widget_html(
        widget_id=widget_id,
        agent_name=agent.display_name or agent.name,
        agent_customization=agent.customization,
        customer_id=customer_id,
        initial_token=token,
        agent_workflow=bool(agent.use_workflow and agent.active_workflow_id),
        allow_attachments=agent.allow_attachments
    ))

async def get_widget_html(widget_id: str, agent_name: str, agent_customization: dict, customer_id: Optional[str] = None, initial_token: Optional[str] = None, agent_workflow: bool = False, allow_attachments: bool = False) -> str:
    """Generate widget HTML with embedded data"""
    import html
    widget_url = settings.VITE_WIDGET_URL
    
    # Convert AgentCustomization to dict if it's a model instance
    customization_dict = {}
    if agent_customization:
        # Get signed URL for photo if using S3
        photo_url = agent_customization.photo_url
        if settings.S3_FILE_STORAGE and photo_url:
            photo_url = await get_s3_signed_url(photo_url)

        customization_dict = {
            "chat_background_color": agent_customization.chat_background_color,
            "chat_bubble_color": agent_customization.chat_bubble_color,
            "accent_color": agent_customization.accent_color,
            "font_family": agent_customization.font_family,
            "photo_url": photo_url,
            "chat_style": agent_customization.chat_style.value if agent_customization.chat_style else "CHATBOT",
            "widget_position": agent_customization.widget_position.value if agent_customization.widget_position else "FLOATING",
            "welcome_title": agent_customization.welcome_title,
            "welcome_subtitle": agent_customization.welcome_subtitle,
            "chat_initiation_messages": agent_customization.chat_initiation_messages or []
        }
        

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
                    customer: {{}},
                    workflow: {str(agent_workflow).lower()},
                    allowAttachments: {str(allow_attachments).lower()}
                }};
            </script>
        </head>
        <body>
            <div id="app"></div>
        </body>
        </html>
    """

async def get_human_agent_session_info(db: Session, customer_id: str) -> dict:
    """Get customer session info including human agent details if assigned"""
    human_agent_info = {}
    session_repo = SessionToAgentRepository(db)
    sessions = session_repo.get_customer_sessions(customer_id, SessionStatus.OPEN)
    
    if sessions and len(sessions) > 0:
        session_model,user_full_name, user_profile_pic = sessions[0]
        
        if user_full_name:  # If there's a human agent assigned
            if settings.S3_FILE_STORAGE and user_profile_pic:
                user_profile_pic = await get_s3_signed_url(user_profile_pic)

            # Get human agent info from session
            human_agent_info = {
                "human_agent_name": user_full_name,
                "human_agent_profile_pic": user_profile_pic,
            }
    
    return human_agent_info

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
    old_token_source = None
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
        # Get customer_id and source from token if exists
        customer_id = token_data.get("sub")
        old_token_source = token_data.get("source")

        agent_repo = AgentRepository(db)
        agent = agent_repo.get_by_id(widget.agent_id)

        if not agent:
            raise HTTPException(status_code=404, detail="Agent not found")

        # Check if agent has workflow enabled
        agent_has_workflow = bool(agent.use_workflow and agent.active_workflow_id)
        
        # Check if agent has ASK_ANYTHING chat style
        is_ask_anything_style = (agent.customization and 
                               agent.customization.chat_style and 
                               agent.customization.chat_style.value == "ASK_ANYTHING")
        
        # For workflow agents or ASK_ANYTHING style, create customer with blank email if no customer exists
        # For other agents, require email
        should_create_customer = (customer_id == "None" or customer_id is None) and (email or agent_has_workflow or is_ask_anything_style)

        
        customer_repo = CustomerRepository(db)
        human_agent_info = {}
        
        if should_create_customer:
            # For workflow agents or ASK_ANYTHING style, generate unique email if no email provided
            # For other agents, use the provided email
            if email:
                customer_email = email
            elif agent_has_workflow or is_ask_anything_style:
                # Generate unique email with timestamp for workflow agents and ASK_ANYTHING style
                timestamp = int(time.time() * 1000)  # milliseconds for better uniqueness
                customer_email = f"{timestamp}@noemail.com"
            else:
                customer_email = ""
            
            # Try to get existing customer first (only if email is provided and not generated)
            customer = None
            if email:
                customer = customer_repo.get_customer_by_email(email, widget.organization_id)
            
            if not customer:
                # Create new customer if doesn't exist
                customer = customer_repo.create_customer(customer_email, widget.organization_id)
            
            # Get session info for existing customer
            if customer:
                human_agent_info = await get_human_agent_session_info(db, customer.id)
            
            # Generate new token with customer_id and preserve source if applicable
            new_token_extra_data = {}
            if widget_id == settings.EXPLORE_WIDGET_ID and old_token_source:
                new_token_extra_data["source"] = old_token_source
            
            new_token = create_conversation_token(
                customer_id=customer.id,
                widget_id=widget_id,
                **new_token_extra_data
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
                "human_agent": human_agent_info,
                "agent": {
                    "id": agent.id,
                    "name": agent.name,
                    "display_name": agent.display_name,
                    "customization": customization,
                    "workflow": bool(agent.use_workflow and agent.active_workflow_id),
                    "allow_attachments": agent.allow_attachments
                },
                "token": new_token
            }
        else:
            # If workflow is enabled or ASK_ANYTHING style and no customer_id, create anonymous customer
            if (customer_id == "None" or customer_id is None) and (agent_has_workflow or is_ask_anything_style):
                # Generate unique email with timestamp for workflow agents and ASK_ANYTHING style
                timestamp = int(time.time() * 1000)  # milliseconds for better uniqueness
                anonymous_email = f"{timestamp}@noemail.com"
                
                # Create anonymous customer for workflow or ASK_ANYTHING style
                customer = customer_repo.create_customer(anonymous_email, widget.organization_id)
                
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
                    "human_agent": {},
                    "agent": {
                        "id": agent.id,
                        "name": agent.name,
                        "display_name": agent.display_name,
                        "customization": customization,
                        "workflow": bool(agent.use_workflow and agent.active_workflow_id),
                        "allow_attachments": agent.allow_attachments
                    },
                    "token": new_token
                }
            elif customer_id == "None" or customer_id is None:
                raise HTTPException(
                    status_code=401,
                    detail="Unauthorized"
                )
            
            # Get session info for existing customer
            human_agent_info = await get_human_agent_session_info(db, customer_id)

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
        "human_agent": human_agent_info,
        "agent": {
            "id": agent.id,
            "name": agent.name,
            "display_name": agent.display_name,
            "customization": customization,
            "workflow": bool(agent.use_workflow and agent.active_workflow_id),
            "allow_attachments": agent.allow_attachments
        }
    }


@router.get("", response_model=List[WidgetResponse])
def list_widgets(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """List all widgets for the organization"""
    widget_repo = WidgetRepository(db)
    return widget_repo.get_widgets(current_user.organization_id)


@router.get("/agent/{agent_id}", response_model=List[WidgetResponse])
def get_widgets_by_agent(
    agent_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Get all widgets for a specific agent"""
    widget_repo = WidgetRepository(db)
    widgets = widget_repo.get_widgets_by_agent(agent_id)
    
    # Verify the agent belongs to the user's organization
    agent_repo = AgentRepository(db)
    agent = agent_repo.get_by_id(agent_id)
    if not agent or str(agent.organization_id) != str(current_user.organization_id):
        raise HTTPException(status_code=404, detail="Agent not found")
    
    return widgets


@router.delete("/{widget_id}")
def remove_widget(
    widget_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Delete a widget"""
    widget_repo = WidgetRepository(db)
    widget = widget_repo.get_widget(widget_id)
    if not widget or widget.organization_id != current_user.organization_id:
        raise HTTPException(status_code=404, detail="Widget not found")
    widget_repo.delete_widget(widget_id)
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
    
        # Create a copy of customization to modify photo_url
    customization = agent.customization
          
    if settings.S3_FILE_STORAGE and customization and customization.photo_url:
        # Get signed URL for the photo
        customization.photo_url = await get_s3_signed_url(customization.photo_url)

    return {
        "id": widget.id,
        "organization_id": widget.organization_id,
        "agent": {
            "id": agent.id,
            "name": agent.name,
            "display_name": agent.display_name,
            "customization": customization,
            "workflow": bool(agent.use_workflow and agent.active_workflow_id)
        }
    }
