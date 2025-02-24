"""
ChatterMate - Organizations
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

from typing import List
from urllib.parse import quote
from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
import json

from app.database import get_db
from app.models.organization import Organization
from app.models.user import User
from app.models.schemas.organization import (
    OrganizationCreate,
    OrganizationUpdate,
    OrganizationResponse,
    OrganizationCreateResponse
)
from app.core.auth import get_current_user, require_permissions
from app.core.security import create_access_token, create_refresh_token
from app.core.logger import get_logger
from app.models.role import Role
from app.models.permission import Permission
from app.repositories.organization import OrganizationRepository
from app.repositories.agent import AgentRepository
from app.core.default_templates import DEFAULT_TEMPLATES
from app.models.agent import AgentType
from uuid import UUID
from app.core.cors import update_cors_middleware
from app.core.application import app  # Import the FastAPI app instance from the new location

logger = get_logger(__name__)
router = APIRouter(
    tags=["organizations"]
)


@router.post("", response_model=OrganizationCreateResponse, status_code=status.HTTP_201_CREATED)
async def create_organization(
    org_data: OrganizationCreate,
    response: Response,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new organization with an admin user and default roles"""
    try:
        # Check if any organization exists
        existing_orgs = db.query(Organization).first()
        if existing_orgs:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Organization already exists. Only one organization is allowed."
            )

        # Create organization
        org_repo = OrganizationRepository(db)
        organization = org_repo.create_organization(
            name=org_data.name,
            domain=org_data.domain,
            timezone=org_data.timezone,
            business_hours=org_data.business_hours
        )

        # Create default agent templates
        template_repo = AgentRepository(db)

        # Add default templates for each agent type
        for agent_type, template_data in DEFAULT_TEMPLATES.items():
            try:
                is_default = agent_type == AgentType.CUSTOMER_SUPPORT
                template_repo.create_agent(
                    name=template_data["name"],
                    description=template_data["description"],
                    agent_type=agent_type,
                    instructions=template_data["instructions"],
                    tools=template_data["tools"],
                    org_id=organization.id,
                    is_default=is_default,
                    is_active=False
                )
            except Exception as template_error:
                logger.error(f"Failed to create template {agent_type} for org {
                             organization.id}: {str(template_error)}")
                continue

        # Get or create default permissions
        permissions = {}
        for name, description in Permission.default_permissions():
            # Try to get existing permission
            perm = db.query(Permission).filter(Permission.name == name).first()
            if not perm:
                perm = Permission(name=name, description=description)
                db.add(perm)
                db.flush()
            permissions[name] = perm

        # Create default roles
        admin_role = Role(
            name="Admin",
            description="Full access to all features",
            organization_id=organization.id,
            is_default=True
        )
        admin_role.permissions = list(permissions.values())  # All permissions
        db.add(admin_role)

        agent_role = Role(
            name="Agent",
            description="Access to assigned chats",
            organization_id=organization.id,
            is_default=True
        )
        agent_role.permissions = [
            permissions["view_assigned_chats"],
            permissions["manage_assigned_chats"]
        ]
        db.add(agent_role)
        db.flush()

        # Create admin user with admin role
        admin = User(
            email=org_data.admin_email,
            full_name=org_data.admin_name,
            hashed_password=User.get_password_hash(org_data.admin_password),
            organization_id=organization.id,
            role_id=admin_role.id,
            is_active=True
        )
        db.add(admin)
        db.flush()

        # Generate tokens and set cookies
        token_data = {"sub": str(admin.id), "org": str(organization.id)}
        access_token = create_access_token(token_data)
        refresh_token = create_refresh_token(token_data)

        # Set cookies and return response
        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            secure=True,
            samesite="lax",
            max_age=1800  # 30 minutes
        )
        response.set_cookie(
            key="refresh_token",
            value=refresh_token,
            httponly=True,
            secure=True,
            samesite="lax",
            max_age=604800  # 7 days
        )

        # Set session data with role information
        response.set_cookie(
            key="user_info",
            value=quote(json.dumps({
                "id": str(admin.id),
                "email": admin.email,
                "full_name": admin.full_name,
                "organization_id": str(organization.id),
                "role": {
                    "id": admin_role.id,
                    "name": admin_role.name
                }
            }, default=str)),
            samesite="lax",
            max_age=604800  # 7 days
        )

        db.commit()

        # Update CORS origins after creating organization
        update_cors_middleware(app)

        return {
            "id": organization.id,
            "name": organization.name,
            "domain": organization.domain,
            "timezone": organization.timezone,
            "business_hours": organization.business_hours,
            "settings": organization.settings,
            "is_active": organization.is_active,
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "user": {
                "id": admin.id,
                "email": admin.email,
                "full_name": admin.full_name,
                "organization_id": organization.id,
                "role": {
                    "id": admin_role.id,
                    "name": admin_role.name,
                }
            }
        }

    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Organization creation failed: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create organization: {str(e)}"
        )


@router.get("", response_model=List[OrganizationResponse])
async def list_organizations(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """List all organizations with pagination"""
    try:
        organizations = db.query(Organization)\
            .offset(skip)\
            .limit(limit)\
            .all()
        return organizations
    except Exception as e:
        logger.error(f"Failed to list organizations: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve organizations. Please try again later."
        )


@router.get("/{org_id}", response_model=OrganizationResponse)
async def get_organization(
    org_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get organization by ID"""
    try:
        org = db.query(Organization).filter(Organization.id == org_id).first()
        if not org:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Organization not found"
            )
        return org
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Failed to get organization {
                     org_id}: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve organization. Please try again later."
        )


@router.patch("/{org_id}", response_model=OrganizationResponse)
async def update_organization(
    org_id: UUID,
    org_data: OrganizationUpdate,
    current_user: User = Depends(require_permissions("manage_organization")),
    db: Session = Depends(get_db)
):
    """Update organization details including business hours"""
    try:
        org = db.query(Organization).filter(Organization.id == org_id).first()
        if not org:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Organization not found"
            )

        # Update only provided fields
        update_data = org_data.model_dump(exclude_unset=True)
        
        # Validate business hours if provided
        if 'business_hours' in update_data:
            business_hours = update_data['business_hours']
            required_days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
            required_fields = ['start', 'end', 'enabled']
            
            # Validate all days are present
            if not all(day in business_hours for day in required_days):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Business hours must include all days of the week"
                )
            
            # Validate each day has required fields
            for day in required_days:
                if not all(field in business_hours[day] for field in required_fields):
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Business hours for {day} must include start, end, and enabled status"
                    )
                
                # Validate time format (HH:MM)
                start = business_hours[day]['start']
                end = business_hours[day]['end']
                try:
                    hours, minutes = start.split(':')
                    if not (0 <= int(hours) <= 23 and 0 <= int(minutes) <= 59):
                        raise ValueError
                    hours, minutes = end.split(':')
                    if not (0 <= int(hours) <= 23 and 0 <= int(minutes) <= 59):
                        raise ValueError
                except ValueError:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Invalid time format for {day}. Use HH:MM format (24-hour)"
                    )

        for field, value in update_data.items():
            setattr(org, field, value)

        db.commit()
        db.refresh(org)

        # Update CORS origins after updating organization
        update_cors_middleware(app)

        return org
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to update organization {org_id}: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update organization. Please try again later."
        )


@router.delete("/{org_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_organization(
    org_id: UUID,
    current_user: User = Depends(require_permissions("manage_organization")),
    db: Session = Depends(get_db)
):
    """Delete organization (soft delete by setting is_active=False)"""
    try:
        org = db.query(Organization).filter(Organization.id == org_id).first()
        if not org:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Organization not found"
            )

        org.is_active = False
        db.commit()

        # Update CORS origins after deleting organization
        update_cors_middleware(app)

        return None
    except HTTPException as he:
        raise he
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to delete organization {
                     org_id}: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete organization. Please try again later."
        )


@router.get("/{org_id}/stats")
async def get_organization_stats(
    org_id: UUID,
    current_user: User = Depends(require_permissions("view_organization")),
    db: Session = Depends(get_db)
):
    """Get organization statistics"""
    org = db.query(Organization).filter(Organization.id == org_id).first()
    if not org:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Organization not found"
        )

    return {
        "total_users": db.query(User).filter(User.organization_id == org_id).count(),
        "active_users": db.query(User).filter(
            User.organization_id == org_id,
            User.is_active == True
        ).count(),
        "settings": org.settings
    }


@router.get("/check-domain/{domain}")
async def check_domain_availability(
    domain: str,
    db: Session = Depends(get_db)
):
    """Check if an organization domain is available"""
    try:
        existing_org = db.query(Organization).filter(Organization.domain == domain).first()
        return {
            "available": not existing_org,
            "message": "Domain is available" if not existing_org else "Domain already exists"
        }
    except Exception as e:
        logger.error(f"Failed to check domain availability: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to check domain availability"
        )
