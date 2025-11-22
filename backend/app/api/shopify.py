"""
ChatterMate - Shopify OAuth
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

import traceback
from fastapi import APIRouter, Depends, HTTPException, Query, Request, Response
from fastapi.responses import RedirectResponse, HTMLResponse
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.logger import get_logger
from app.database import get_db
from app.models.schemas.shopify import ShopifyShopCreate, ShopifyShop, ShopifyShopUpdate
from app.models.schemas.shopify import AgentShopifyConfigBase, AgentShopifyConfig, AgentShopifyConfigCreate, AgentShopifyConfigUpdate
from app.repositories.shopify_shop_repository import ShopifyShopRepository
from app.repositories.agent_shopify_config_repository import AgentShopifyConfigRepository
from typing import Optional
import requests
import hmac
import hashlib
import base64
import json
from urllib.parse import urlencode, quote
from app.core.auth import get_current_user, require_permissions, get_current_organization, check_permissions
from app.models.user import User
from app.models.organization import Organization
from app.repositories.widget import WidgetRepository
from app.services.shopify import ShopifyService
from app.services.shopify_auth_service import ShopifyAuthService
from app.services.shopify_helper_service import ShopifyHelperService
from app.services.shopify_session import require_shopify_session
from app.repositories.knowledge import KnowledgeRepository
from app.repositories.knowledge_queue import KnowledgeQueueRepository
from app.repositories.knowledge_to_agent import KnowledgeToAgentRepository
from app.models.knowledge import SourceType
from app.models.knowledge_queue import KnowledgeQueue, QueueStatus
from app.models.knowledge_to_agent import KnowledgeToAgent
from uuid import UUID
from app.core.cors import update_cors_middleware
from app.core.application import app

router = APIRouter()
logger = get_logger(__name__)

# Define the scopes needed for your app
SCOPES = "read_products,read_themes,write_themes,write_script_tags,read_script_tags,read_orders,read_customers"


@router.post("/exchange-token")
async def exchange_session_token(
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Exchange Shopify session token for offline access token via Shopify token exchange API.
    Called when app is first loaded in embedded context.
    Stores offline access token in database for future Shopify API calls.
    """
    try:
        # 1. Get session token from Authorization header
        from app.services.shopify_session import ShopifySessionService
        import jwt
        
        session_token = ShopifySessionService.get_session_token_from_request(request)
        if not session_token:
            raise HTTPException(status_code=401, detail="Session token required")
        
        logger.info("Exchanging session token for offline access token")
        
        # 2. Decode (without verification) to extract shop
        decoded = jwt.decode(session_token, options={"verify_signature": False})
        shop_domain = decoded.get('dest', '').replace('https://', '').replace('http://', '')
        
        if not shop_domain:
            raise HTTPException(status_code=400, detail="Invalid session token: missing shop domain")
        
        logger.info(f"Extracted shop domain from token: {shop_domain}")
        
        # 3. Call Shopify token exchange API
        token_url = f"https://{shop_domain}/admin/oauth/access_token"
        payload = {
            "client_id": settings.SHOPIFY_API_KEY,
            "client_secret": settings.SHOPIFY_API_SECRET,
            "grant_type": "urn:ietf:params:oauth:grant-type:token-exchange",
            "subject_token": session_token,
            "subject_token_type": "urn:ietf:params:oauth:token-type:id_token",
            "requested_token_type": "urn:shopify:params:oauth:token-type:offline-access-token"
        }
        
        logger.info(f"Calling Shopify token exchange API for shop: {shop_domain}")
        response = requests.post(token_url, json=payload)
        
        if response.status_code != 200:
            logger.error(f"Token exchange failed: {response.status_code} - {response.text}")
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Token exchange failed: {response.text}"
            )
        
        token_data = response.json()
        access_token = token_data.get('access_token')
        
        if not access_token:
            logger.error(f"No access token in response: {token_data}")
            raise HTTPException(status_code=500, detail="No access token received from Shopify")
        
        logger.info(f"Successfully received offline access token for shop: {shop_domain}")
        
        # 4. Create or update shop with offline access token
        shop_repo = ShopifyShopRepository(db)
        db_shop = shop_repo.get_shop_by_domain(shop_domain)
        
        if not db_shop:
            logger.info(f"Creating new shop record for: {shop_domain}")
            shop_data = ShopifyShopCreate(
                shop_domain=shop_domain,
                access_token=access_token,
                is_installed=True
            )
            db_shop = shop_repo.create_shop(shop_data)
        else:
            logger.info(f"Updating existing shop record for: {shop_domain}")
            shop_update = ShopifyShopUpdate(access_token=access_token, is_installed=True)
            db_shop = shop_repo.update_shop(db_shop.id, shop_update)
        
        db.commit()    
        db.refresh(db_shop)
        
        logger.info(f"Shop record saved successfully. Shop ID: {db_shop.id}, Org ID: {db_shop.organization_id}")
        
        return {
            "shop_id": str(db_shop.id),
            "shop_domain": db_shop.shop_domain,
            "organization_id": str(db_shop.organization_id) if db_shop.organization_id else None,
            "is_installed": True
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error exchanging session token: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Token exchange error: {str(e)}")


@router.post("/link-organization")
async def link_shop_to_org(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Link Shopify shop to authenticated user's organization after login.
    Called after user logs in via popup window.
    """
    try:
        # Get shop_id from request body
        body = await request.json()
        shop_id = body.get('shop_id')
        
        if not shop_id:
            raise HTTPException(status_code=400, detail="shop_id is required")
        
        logger.info(f"Linking shop {shop_id} to user {current_user.id}'s organization")
        
        # Verify user has manage_organization permission
        if not check_permissions(current_user, ["manage_organization"]):
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        
        if not current_user.organization_id:
            raise HTTPException(status_code=400, detail="User not associated with an organization")
        
        # Get shop from database
        shop_repo = ShopifyShopRepository(db)
        db_shop = shop_repo.get_shop(shop_id)

        if not db_shop:
            raise HTTPException(status_code=404, detail="Shop not found")

        # Update shop with organization_id
        org_id_str = str(current_user.organization_id)
        shop_update = ShopifyShopUpdate(organization_id=org_id_str)
        shop_repo.update_shop(shop_id, shop_update)

        # Update organization domain with shop domain
        try:
            from app.repositories.organization import OrganizationRepository
            org_repo = OrganizationRepository(db)
            organization = org_repo.get_organization(org_id_str)

            if organization and db_shop.shop_domain:
                # Only update if domain is different
                if organization.domain != db_shop.shop_domain:
                    # Check if domain is already used by another organization
                    existing_org = org_repo.get_organization_by_domain(db_shop.shop_domain)
                    if not existing_org or str(existing_org.id) == str(organization.id):
                        # Update organization domain to shop domain
                        organization.domain = db_shop.shop_domain
                        db.add(organization)
                        logger.info(f"Updated organization {org_id_str} domain to {db_shop.shop_domain}")
                    else:
                        logger.warning(f"Domain {db_shop.shop_domain} is already used by organization {existing_org.id}, skipping update")
        except Exception as domain_error:
            logger.error(f"Error updating organization domain: {str(domain_error)}")
            # Don't fail the linking if domain update fails

        db.commit()

        # Update CORS middleware to include new domain
        try:
            update_cors_middleware(app)
            logger.info("Updated CORS middleware after linking shop to organization")
        except Exception as cors_error:
            logger.error(f"Error updating CORS middleware: {str(cors_error)}")
            # Don't fail the linking if CORS update fails

        logger.info(f"Successfully linked shop {shop_id} to organization {org_id_str}")

        return {
            "success": True,
            "shop_id": shop_id,
            "organization_id": org_id_str
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error linking shop to organization: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to link organization: {str(e)}")


@router.get("/shops", response_model=list[ShopifyShop])
async def get_shops(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    organization: Organization = Depends(get_current_organization),
    current_user: User = Depends(require_permissions("manage_organization"))
):
    """
    Get all shops for the current organization
    """
    # Ensure organization_id is a string, not a UUID object
    org_id_str = str(organization.id) if organization and organization.id else None
    shop_repository = ShopifyShopRepository(db)
    shops = shop_repository.get_shops_by_organization(org_id_str, skip=skip, limit=limit)
    
    # Ensure organization_id is a string in each shop object
    for shop in shops:
        if shop.organization_id and not isinstance(shop.organization_id, str):
            shop.organization_id = str(shop.organization_id)
    
    return shops

@router.get("/shops/{shop_id}", response_model=ShopifyShop)
async def get_shop(
    shop_id: str,
    db: Session = Depends(get_db),
    organization: Organization = Depends(get_current_organization),
    current_user: User = Depends(require_permissions("manage_organization"))
):
    """
    Get a shop by ID
    """
    shop_repository = ShopifyShopRepository(db)
    db_shop = shop_repository.get_shop(shop_id)
    if not db_shop:
        raise HTTPException(status_code=404, detail="Shop not found")
    
    # Convert organization IDs to strings for comparison
    shop_org_id = str(db_shop.organization_id) if db_shop.organization_id else None
    current_org_id = str(organization.id) if organization.id else None
    
    # Ensure organization_id is a string, not a UUID object
    if db_shop.organization_id and not isinstance(db_shop.organization_id, str):
        db_shop.organization_id = str(db_shop.organization_id)
    
    # Verify that the shop belongs to the current organization
    if shop_org_id != current_org_id:
        logger.warning(f"Unauthorized attempt to access shop {shop_id} from organization {current_org_id}")
        raise HTTPException(status_code=403, detail="This shop does not belong to your organization")
    
    return db_shop

@router.delete("/shops/{shop_id}")
async def delete_shop(
    shop_id: str,
    db: Session = Depends(get_db),
    organization: Organization = Depends(get_current_organization),
    current_user: User = Depends(require_permissions("manage_organization"))
):
    """
    Delete a shop and disconnect from Shopify
    """
    shop_repository = ShopifyShopRepository(db)
    db_shop = shop_repository.get_shop(shop_id)
    if not db_shop:
        raise HTTPException(status_code=404, detail="Shop not found")
    
    # Convert organization IDs to strings for comparison
    shop_org_id = str(db_shop.organization_id) if db_shop.organization_id else None
    current_org_id = str(organization.id) if organization.id else None
    
    # Verify that the shop belongs to the current organization
    if shop_org_id != current_org_id:
        logger.warning(f"Unauthorized attempt to delete shop {shop_id} from organization {current_org_id}")
        raise HTTPException(status_code=403, detail="This shop does not belong to your organization")
    
    # Send an uninstall request to Shopify if we have an access token
    if db_shop.access_token:
        try:
            # Request to delete app data from Shopify
            uninstall_url = f"https://{db_shop.shop_domain}/admin/api/2025-10/graphql.json"
            headers = {
                "X-Shopify-Access-Token": db_shop.access_token,
                "Content-Type": "application/json"
            }
            
            # GraphQL mutation to uninstall the app
            mutation = """
            mutation {
                appSubscriptionCancel(
                    id: "gid://shopify/AppSubscription/current"
                ) {
                    appSubscription {
                        id
                        status
                    }
                    userErrors {
                        field
                        message
                    }
                }
            }
            """
            
            response = requests.post(
                uninstall_url, 
                headers=headers,
                json={"query": mutation}
            )
            
            logger.info(f"Shopify uninstall response: {response.status_code} - {response.text}")
        except Exception as e:
            logger.error(f"Error uninstalling app from Shopify: {str(e)}")
            # Continue with deletion even if uninstall fails
    
    # Get all agent configs linked to this shop and delete them
    try:
        agent_config_repository = AgentShopifyConfigRepository(db)
        agent_configs = agent_config_repository.get_configs_by_shop(shop_id)
        if agent_configs:
            logger.info(f"Deleting {len(agent_configs)} agent Shopify configs for shop {shop_id}")
            for config in agent_configs:
                # Update the config to disable and remove shop_id
                agent_config_repository.update_agent_shopify_config(
                    config.agent_id, 
                    AgentShopifyConfigUpdate(enabled=False, shop_id=None)
                )
            logger.info(f"Successfully deleted agent Shopify configs for shop {shop_id}")
    except Exception as e:
        logger.error(f"Error deleting agent Shopify configs: {str(e)}")
        # Continue with shop deletion even if config deletion fails
    
    # Delete the shop from our database
    success = shop_repository.delete_shop(shop_id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to delete shop")
    
    return {"status": "success", "message": "Shop successfully disconnected"}

@router.post("/link-shop/{shop_id}")
async def link_shop_to_organization(
    shop_id: str,
    db: Session = Depends(get_db),
    organization: Organization = Depends(get_current_organization),
    current_user: User = Depends(require_permissions("manage_organization"))
):
    """
    Link a Shopify shop to the current organization after user logs in.
    This is called after successful login from the embedded app flow.
    """
    try:
        shop_repository = ShopifyShopRepository(db)
        db_shop = shop_repository.get_shop(shop_id)
        
        if not db_shop:
            raise HTTPException(status_code=404, detail="Shop not found")
        
        # Link shop to organization if not already linked
        if not db_shop.organization_id:
            org_id_str = str(organization.id)
            shop_update = ShopifyShopUpdate(organization_id=org_id_str)
            db_shop = shop_repository.update_shop(shop_id, shop_update)
            db.commit()
            logger.info(f"Linked shop {shop_id} to organization {org_id_str}")
        
        return {
            "success": True,
            "shop_id": str(db_shop.id),
            "shop_domain": db_shop.shop_domain,
            "organization_id": str(db_shop.organization_id)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error linking shop to organization: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Error linking shop to organization"
        )

@router.get("/status")
async def check_connection(
    db: Session = Depends(get_db),
    organization: Organization = Depends(get_current_organization),
    current_user: User = Depends(require_permissions("manage_organization"))
):
    """
    Check if Shopify is connected for the current organization
    """
    try:
        # Get shops for the current organization
        org_id_str = str(organization.id) if organization.id else None
        shop_repository = ShopifyShopRepository(db)
        shops = shop_repository.get_shops_by_organization(org_id_str, limit=1)
        is_connected = len(shops) > 0 and any(shop.is_installed for shop in shops)
        
        result = {
            "connected": is_connected
        }
        
        # If connected, include the shop domain
        if is_connected:
            result["shop_domain"] = shops[0].shop_domain
        
        return result
    except Exception as e:
        logger.error(f"Error checking Shopify connection: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail="Error checking Shopify connection status"
        )

@router.get("/shop-config-status")
async def get_shop_config_status(
    shopify_session: dict = Depends(require_shopify_session),
    db: Session = Depends(get_db)
):
    """
    Check configuration status for a shop (agents configured, widget ID, etc.)
    Uses session token authentication for embedded apps.
    """
    try:
        # Shop info already validated by session token
        db_shop = shopify_session['db_shop']

        # Check if any agents are configured for this shop
        agent_config_repository = AgentShopifyConfigRepository(db)
        configs = agent_config_repository.get_configs_by_shop(str(db_shop.id), enabled_only=True)
        agents_connected = len(configs) if configs else 0

        # Get widget ID if agents are configured
        widget_id = None
        if configs and len(configs) > 0:
            widget_repo = WidgetRepository(db)
            widgets = widget_repo.get_widgets_by_agent(configs[0].agent_id)
            if widgets and len(widgets) > 0:
                widget_id = str(widgets[0].id)

        return {
            "shop_id": str(db_shop.id),
            "shop_domain": db_shop.shop_domain,
            "is_installed": db_shop.is_installed,
            "agents_connected": agents_connected,
            "widget_id": widget_id,
            "organization_id": str(db_shop.organization_id) if db_shop.organization_id else None
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting shop config status: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Error retrieving shop configuration status"
        )

@router.get("/organization-domain")
async def get_organization_domain(
    shopify_session: dict = Depends(require_shopify_session),
    db: Session = Depends(get_db)
):
    """
    Get organization domain from the organization table.
    Uses session token authentication for embedded apps.
    """
    try:
        # Shop info already validated by session token
        db_shop = shopify_session['db_shop']

        if not db_shop.organization_id:
            raise HTTPException(status_code=400, detail="Shop not linked to organization")

        # Get organization
        from app.repositories.organization import OrganizationRepository
        org_repo = OrganizationRepository(db)
        organization = org_repo.get_organization(str(db_shop.organization_id))

        if not organization:
            raise HTTPException(status_code=404, detail="Organization not found")

        return {
            "organization_id": str(organization.id),
            "domain": organization.domain,
            "name": organization.name
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting organization domain: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Error retrieving organization domain"
        )

@router.put("/update-domain")
async def update_organization_domain(
    request: Request,
    shopify_session: dict = Depends(require_shopify_session),
    db: Session = Depends(get_db)
):
    """
    Update organization domain.
    Uses session token authentication for embedded apps.
    """
    try:
        # Shop info already validated by session token
        db_shop = shopify_session['db_shop']

        # Get domain from request body
        body = await request.json()
        new_domain = body.get('domain')

        if not new_domain:
            raise HTTPException(status_code=400, detail="domain is required")

        # Validate domain format (basic validation)
        new_domain = new_domain.strip()
        if not new_domain:
            raise HTTPException(status_code=400, detail="domain cannot be empty")

        # Get organization
        if not db_shop.organization_id:
            raise HTTPException(status_code=400, detail="Shop not linked to organization")

        from app.repositories.organization import OrganizationRepository
        org_repo = OrganizationRepository(db)
        organization = org_repo.get_organization(str(db_shop.organization_id))

        if not organization:
            raise HTTPException(status_code=404, detail="Organization not found")

        # Update organization domain
        organization.domain = new_domain
        db.add(organization)
        db.commit()

        logger.info(f"Updated organization {organization.id} domain to {new_domain}")

        # Update CORS middleware to include new domain
        update_cors_middleware(app)
        logger.info("Updated CORS middleware after domain update")

        return {
            "success": True,
            "domain": new_domain,
            "organization_id": str(organization.id)
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating organization domain: {str(e)}")
        # Check if it's a unique constraint violation
        if "duplicate key" in str(e).lower() or "unique constraint" in str(e).lower():
            raise HTTPException(
                status_code=400,
                detail="Domain is already connected to another organization"
            )
        raise HTTPException(
            status_code=500,
            detail="Error updating organization domain"
        )

@router.get("/connected-agents")
async def get_connected_agents(
    shop_id: str = Query(..., description="Shop ID"),
    shopify_session: dict = Depends(require_shopify_session),
    db: Session = Depends(get_db)
):
    """
    Get all agents connected to a Shopify shop.
    Uses session token authentication for embedded apps.
    """
    try:
        # Verify shop_id matches the session
        if shop_id != shopify_session['shop_id']:
            raise HTTPException(status_code=403, detail="Shop ID mismatch")
        
        # Get agent configurations for this shop
        agent_config_repository = AgentShopifyConfigRepository(db)
        configs = agent_config_repository.get_configs_by_shop(shop_id, enabled_only=True)
        
        if not configs:
            return []
        
        # Get full agent details for each config
        from app.repositories.agent import AgentRepository
        agent_repo = AgentRepository(db)
        agents = []
        
        for config in configs:
            agent = agent_repo.get_agent(str(config.agent_id))
            if agent:
                agents.append({
                    "id": str(agent.id),
                    "name": agent.name,
                    "display_name": agent.display_name,
                    "description": agent.description,
                    "is_active": agent.is_active,
                    "organization_id": str(agent.organization_id)
                })
        
        return agents
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting connected agents: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Error retrieving connected agents"
        )

@router.get("/agent-config/{agent_id}", response_model=AgentShopifyConfig)
async def get_agent_shopify_config(
    agent_id: str,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Get Shopify configuration for an agent.
    Supports both session token auth (embedded) and JWT auth (dashboard).
    """
    # Try session token first (for embedded apps)
    try:
        shopify_session = await require_shopify_session(request, db)
        # Session token valid - verify agent belongs to shop's organization
        if not shopify_session['organization_id']:
            raise HTTPException(status_code=403, detail="Shop not linked to organization")
        logger.info(f"GET agent-config using session token for org: {shopify_session['organization_id']}")
    except HTTPException:
        # Fall back to JWT auth (for dashboard)
        current_user = await get_current_user(request=request, db=db)
        if not check_permissions(current_user, ["manage_organization"]):
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        logger.info(f"GET agent-config using JWT auth for user: {current_user.id}")
    
    agent_config_repository = AgentShopifyConfigRepository(db)
    config = agent_config_repository.get_agent_shopify_config(agent_id)
    if not config:
        # Return a default config if none exists
        raise HTTPException(status_code=404, detail="Shopify configuration not found for this agent")
    return config

@router.post("/agent-config/{agent_id}", response_model=AgentShopifyConfig)
async def save_agent_shopify_config(
    agent_id: str,
    config: AgentShopifyConfigBase,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Save Shopify configuration for an agent.
    Automatically determines the shop ID for the organization.
    Supports both session token auth (embedded) and JWT auth (dashboard).
    """
    agent_config_repository = AgentShopifyConfigRepository(db)
    shop_repository = ShopifyShopRepository(db)
    
    # Try session token first (for embedded apps)
    org_id_str = None
    user_id = None
    try:
        shopify_session = await require_shopify_session(request, db)
        # Session token valid - verify shop is linked to organization
        if not shopify_session['organization_id']:
            raise HTTPException(status_code=403, detail="Shop not linked to organization")
        # Ensure org_id_str is always a string
        org_id_str = str(shopify_session['organization_id'])
        # For session token, we don't have user_id - use None (optional for knowledge queue)
        logger.info(f"POST agent-config using session token for org: {org_id_str}")
    except HTTPException:
        # Fall back to JWT auth (for dashboard)
        current_user = await get_current_user(request=request, db=db)
        if not check_permissions(current_user, ["manage_organization"]):
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        if not current_user.organization_id:
            raise HTTPException(status_code=403, detail="User not linked to organization")
        org_id_str = str(current_user.organization_id)
        user_id = current_user.id
        logger.info(f"POST agent-config using JWT auth for user: {current_user.id}")
    
    # Get the current config for the agent, if it exists
    existing_config = agent_config_repository.get_agent_shopify_config(agent_id)
    
    # Automatically determine the shop ID for this organization
    target_shop = None
    
    # Find the available installed shop for the organization
    shops = shop_repository.get_shops_by_organization(org_id_str, limit=10)
    installed_shops = [s for s in shops if s.is_installed]
    
    if installed_shops:
        target_shop = installed_shops[0]
        target_shop_id = target_shop.id
    else:
        target_shop_id = None

    if not installed_shops and config.enabled:
        raise HTTPException(
            status_code=400, 
            detail="Cannot enable Shopify integration: No installed Shopify shops found for this organization."
        )
    
    # --- Save Config to DB --- 
    try:
        if existing_config:
            # Update existing config
            # Always use the automatically determined shop_id
            update_config = AgentShopifyConfigUpdate(
                enabled=config.enabled,
                shop_id=target_shop_id if config.enabled else None
            )
            updated_config = agent_config_repository.update_agent_shopify_config(
                agent_id, update_config
            )
            logger.info(f"Updated Shopify config for agent {agent_id}")
            saved_config = updated_config
        else:
            # Create new config
            # Always use the automatically determined shop_id
            config_create_data = AgentShopifyConfigCreate(
                agent_id=agent_id, 
                enabled=config.enabled, 
                shop_id=target_shop_id if config.enabled else None
            )
            new_config = agent_config_repository.create_agent_shopify_config(config_create_data)
            logger.info(f"Created Shopify config for agent {agent_id}")
            saved_config = new_config

        # --- Link or Queue Knowledge Source --- 
        if config.enabled and target_shop: 
            try:
                org_uuid = UUID(org_id_str)
                agent_uuid = UUID(agent_id)
                shop_domain = target_shop.shop_domain

                if shop_domain:
                    knowledge_repo = KnowledgeRepository(db)
                    # Check if knowledge source already exists for this shop domain and org
                    existing_knowledge_list = knowledge_repo.get_by_sources(org_uuid, [shop_domain])
                    existing_knowledge = existing_knowledge_list[0] if existing_knowledge_list else None

                    if existing_knowledge is None:
                        # Knowledge doesn't exist, queue it
                        logger.info(f"Shop domain {shop_domain} not found in knowledge base for org {org_uuid}. Queuing...")
                        queue_repo = KnowledgeQueueRepository(db)
                        queue_item = KnowledgeQueue(
                            organization_id=org_uuid,
                            agent_id=agent_uuid, # Link to current agent
                            user_id=user_id, # user_id from auth (JWT) or None (session token)
                            source_type=SourceType.WEBSITE,
                            source=shop_domain,
                            status=QueueStatus.PENDING,
                            queue_metadata={}
                        )
                        queue_repo.create(queue_item)
                        logger.info(f"Shop domain {shop_domain} queued for knowledge processing for agent {agent_id}.")
                    else:
                        # Knowledge exists, check if linked to agent
                        logger.info(f"Shop domain {shop_domain} found in knowledge base (ID: {existing_knowledge.id}). Checking agent link...")
                        link_repo = KnowledgeToAgentRepository(db)
                        existing_link = link_repo.get_by_ids(existing_knowledge.id, agent_uuid)
                        if existing_link is None:
                            # Link doesn't exist, create it
                            logger.info(f"Linking knowledge source {existing_knowledge.id} to agent {agent_id}...")
                            link = KnowledgeToAgent(knowledge_id=existing_knowledge.id, agent_id=agent_uuid)
                            link_repo.create(link)
                            # Optional: Could add vector DB filter update here later if needed
                            logger.info(f"Successfully linked knowledge source {existing_knowledge.id} to agent {agent_id}.")
                        else:
                            logger.info(f"Knowledge source {existing_knowledge.id} already linked to agent {agent_id}.")

            except Exception as ke:
                # Log the error but don't fail the main config saving operation
                logger.error(f"Failed to link or queue knowledge for shop {target_shop.id if target_shop else 'N/A'} / agent {agent_id}: {str(ke)}", exc_info=True)

        return saved_config # Return the saved/updated config
    except Exception as e:
        logger.error(f"Failed to save agent Shopify config to DB: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to save Shopify configuration to database.")

@router.post("/webhooks/app-uninstalled")
async def shopify_app_uninstalled_webhook(
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Webhook handler for Shopify app uninstallation.
    This endpoint is called by Shopify when a merchant uninstalls the app.
    
    It performs the following cleanup:
    1. Marks the shop as uninstalled (is_installed = False)
    2. Disables all agent Shopify configs for this shop
    3. Optionally: Can clear access tokens for security
    
    Documentation: https://shopify.dev/docs/apps/build/webhooks/subscribe/get-started
    """
    try:
        # Get the request body and headers
        request_body = await request.body()
        request_headers = request.headers
        
        # Verify the webhook signature
        if not ShopifyHelperService.verify_shopify_webhook(request_headers, request_body):
            logger.warning("Invalid webhook signature for app/uninstalled")
            raise HTTPException(status_code=401, detail="Invalid webhook signature")
        
        # Parse the webhook payload
        try:
            payload = json.loads(request_body.decode('utf-8'))
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse webhook payload: {str(e)}")
            raise HTTPException(status_code=400, detail="Invalid JSON payload")
        
        # Extract shop domain from payload
        # Shopify sends the shop domain in the payload
        shop_domain = payload.get('domain') or payload.get('myshopify_domain')
        
        if not shop_domain:
            logger.error(f"No shop domain in webhook payload: {payload}")
            raise HTTPException(status_code=400, detail="Missing shop domain in payload")
        
        logger.info(f"Processing app uninstall webhook for shop: {shop_domain}")
        
        # Initialize repositories
        shop_repo = ShopifyShopRepository(db)
        config_repo = AgentShopifyConfigRepository(db)
        
        # Find the shop in our database
        db_shop = shop_repo.get_shop_by_domain(shop_domain)
        
        if not db_shop:
            logger.warning(f"Shop not found in database: {shop_domain}")
            # Return 200 anyway to acknowledge receipt
            return {"success": True, "message": "Shop not found, no action needed"}
        
        logger.info(f"Found shop in database: {db_shop.id}")
        
        # Delete all agent configurations for this shop
        configs = config_repo.get_configs_by_shop(str(db_shop.id))
        deleted_configs = 0
        
        for config in configs:
            config_repo.delete_agent_shopify_config(config.agent_id)
            deleted_configs += 1
            logger.info(f"Deleted Shopify config for agent {config.agent_id}")
        
        logger.info(f"Deleted {deleted_configs} agent config(s) for shop {shop_domain}")
        
        # Delete the shop record from the database
        shop_repo.delete_shop(str(db_shop.id))
        logger.info(f"Deleted shop record for {shop_domain}")
        
        # Commit the changes
        db.commit()
        
        logger.info(f"Successfully processed uninstall for {shop_domain}. Deleted shop and {deleted_configs} agent config(s)")
        
        # Return 200 OK to acknowledge receipt
        return {
            "success": True,
            "message": f"App uninstalled successfully for {shop_domain}",
            "shop_domain": shop_domain,
            "configs_deleted": deleted_configs
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing app uninstall webhook: {str(e)}")
        logger.error(traceback.format_exc())
        # Return 200 to prevent Shopify from retrying
        # Log the error for investigation
        return {
            "success": False,
            "message": "An internal error occurred while processing the uninstall webhook."
        }

@router.post("/webhooks/customers/data_request")
async def shopify_customers_data_request_webhook(
    request: Request,
    db: Session = Depends(get_db)
):
    """
    GDPR Compliance Webhook: Customer Data Request
    
    This webhook is called when a customer requests access to their data.
    You must provide the customer's data within a specified timeframe.
    
    Shopify sends the following information:
    - shop_id: The ID of the shop
    - shop_domain: The shop's domain
    - customer: Customer information including email, phone
    - orders_requested: List of order IDs the customer has placed
    
    Documentation: https://shopify.dev/docs/apps/build/privacy-law-compliance
    """
    try:
        # Get the request body and headers
        request_body = await request.body()
        request_headers = request.headers
        
        # Verify the webhook signature
        if not ShopifyHelperService.verify_shopify_webhook(request_headers, request_body):
            logger.warning("Invalid webhook signature for customers/data_request")
            raise HTTPException(status_code=401, detail="Invalid webhook signature")
        
        # Parse the webhook payload
        try:
            payload = json.loads(request_body.decode('utf-8'))
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse webhook payload: {str(e)}")
            raise HTTPException(status_code=400, detail="Invalid JSON payload")
        
        shop_domain = payload.get('shop_domain')
        customer = payload.get('customer', {})
        customer_email = customer.get('email')
        customer_phone = customer.get('phone')
        orders_requested = payload.get('orders_requested', [])
        
        logger.info(f"Received customer data request for shop: {shop_domain}, customer: {customer_email}")
        
        # TODO: Implement data collection based on your data storage
        # For now, we'll log the request and acknowledge receipt
        # You should:
        # 1. Collect all customer data you've stored (chat history, customer info, etc.)
        # 2. Prepare it in a readable format (JSON, CSV, etc.)
        # 3. Send it to the customer or make it available for download
        # 4. Keep a record of the request for compliance
        
        logger.info(f"Customer data request details:")
        logger.info(f"  - Shop: {shop_domain}")
        logger.info(f"  - Customer Email: {customer_email}")
        logger.info(f"  - Customer Phone: {customer_phone}")
        logger.info(f"  - Orders: {orders_requested}")
        
        # In a production system, you would:
        # 1. Query your chat_history table for this customer
        # 2. Query any customer-specific data
        # 3. Format and send the data to the customer
        
        # Return 200 OK to acknowledge receipt
        return {
            "success": True,
            "message": "Customer data request received and logged",
            "shop_domain": shop_domain,
            "customer_email": customer_email
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing customer data request webhook: {str(e)}")
        logger.error(traceback.format_exc())
        return {
            "success": False,
            "message": f"Error processing webhook: {str(e)}"
        }

@router.post("/webhooks/customers/redact")
async def shopify_customers_redact_webhook(
    request: Request,
    db: Session = Depends(get_db)
):
    """
    GDPR Compliance Webhook: Customer Data Erasure
    
    This webhook is called when a customer requests their data to be deleted.
    You must delete all customer data within a specified timeframe.
    
    Shopify sends the following information:
    - shop_id: The ID of the shop
    - shop_domain: The shop's domain
    - customer: Customer information including email, phone
    - orders_to_redact: List of order IDs to redact
    
    Documentation: https://shopify.dev/docs/apps/build/privacy-law-compliance
    """
    try:
        # Get the request body and headers
        request_body = await request.body()
        request_headers = request.headers
        
        # Verify the webhook signature
        if not ShopifyHelperService.verify_shopify_webhook(request_headers, request_body):
            logger.warning("Invalid webhook signature for customers/redact")
            raise HTTPException(status_code=401, detail="Invalid webhook signature")
        
        # Parse the webhook payload
        try:
            payload = json.loads(request_body.decode('utf-8'))
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse webhook payload: {str(e)}")
            raise HTTPException(status_code=400, detail="Invalid JSON payload")
        
        shop_domain = payload.get('shop_domain')
        customer = payload.get('customer', {})
        customer_email = customer.get('email')
        customer_phone = customer.get('phone')
        orders_to_redact = payload.get('orders_to_redact', [])
        
        logger.info(f"Received customer redact request for shop: {shop_domain}, customer: {customer_email}")
        
        # TODO: Implement data deletion based on your data storage
        # For now, we'll log the request and acknowledge receipt
        # You should:
        # 1. Delete or anonymize all customer data (chat history, personal info, etc.)
        # 2. Keep a minimal record for compliance (that the request was fulfilled)
        # 3. Ensure the customer's data is no longer accessible
        
        logger.info(f"Customer redact request details:")
        logger.info(f"  - Shop: {shop_domain}")
        logger.info(f"  - Customer Email: {customer_email}")
        logger.info(f"  - Customer Phone: {customer_phone}")
        logger.info(f"  - Orders to redact: {orders_to_redact}")
        
        # In a production system, you would:
        # 1. Find all chat_history records for this customer
        # 2. Either delete them or anonymize the customer data
        # 3. Remove any personally identifiable information (PII)
        # 4. Keep a log that the request was fulfilled
        
        # Example pseudocode:
        # chat_repo = ChatHistoryRepository(db)
        # if customer_email:
        #     chat_repo.delete_by_customer_email(customer_email, shop_domain)
        # if customer_phone:
        #     chat_repo.delete_by_customer_phone(customer_phone, shop_domain)
        
        # Return 200 OK to acknowledge receipt
        return {
            "success": True,
            "message": "Customer data redaction request received and logged",
            "shop_domain": shop_domain,
            "customer_email": customer_email
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing customer redact webhook: {str(e)}")
        logger.error(traceback.format_exc())
        return {
            "success": False,
            "message": f"Error processing webhook: {str(e)}"
        }

@router.post("/webhooks/shop/redact")
async def shopify_shop_redact_webhook(
    request: Request,
    db: Session = Depends(get_db)
):
    """
    GDPR Compliance Webhook: Shop Data Erasure

    This webhook is called 48 hours after a shop owner uninstalls your app.
    You must delete all shop-related data.

    Shopify sends the following information:
    - shop_id: The ID of the shop
    - shop_domain: The shop's domain

    Documentation: https://shopify.dev/docs/apps/build/privacy-law-compliance
    """
    try:
        # Get the request body and headers
        request_body = await request.body()
        request_headers = request.headers
        
        # Verify the webhook signature
        if not ShopifyHelperService.verify_shopify_webhook(request_headers, request_body):
            logger.warning("Invalid webhook signature for shop/redact")
            raise HTTPException(status_code=401, detail="Invalid webhook signature")
        
        # Parse the webhook payload
        try:
            payload = json.loads(request_body.decode('utf-8'))
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse webhook payload: {str(e)}")
            raise HTTPException(status_code=400, detail="Invalid JSON payload")
        
        shop_domain = payload.get('shop_domain')
        shop_id = payload.get('shop_id')
        
        logger.info(f"Received shop redact request for shop: {shop_domain} (ID: {shop_id})")
        
        # Initialize repositories
        shop_repo = ShopifyShopRepository(db)
        config_repo = AgentShopifyConfigRepository(db)
        
        # Find the shop in our database
        db_shop = shop_repo.get_shop_by_domain(shop_domain)
        
        if not db_shop:
            logger.warning(f"Shop not found in database: {shop_domain}")
            # Return 200 anyway to acknowledge receipt
            return {"success": True, "message": "Shop not found, no action needed"}
        
        logger.info(f"Found shop in database: {db_shop.id}")
        
        # Delete all agent configurations for this shop
        configs = config_repo.get_configs_by_shop(str(db_shop.id))
        deleted_configs = 0
        
        for config in configs:
            config_repo.delete_agent_shopify_config(config.agent_id)
            deleted_configs += 1
            logger.info(f"Deleted Shopify config for agent {config.agent_id}")
        
        # TODO: Delete all shop-related data
        # You should also:
        # 1. Delete or anonymize all chat history related to this shop
        # 2. Remove any customer data associated with this shop
        # 3. Delete any cached product data
        # 4. Remove any analytics data for this shop
        
        # Example pseudocode:
        # chat_repo = ChatHistoryRepository(db)
        # chat_repo.delete_by_shop(shop_domain)
        # 
        # customer_repo = CustomerRepository(db)
        # customer_repo.delete_by_shop(shop_domain)
        
        # Delete the shop record from the database
        shop_repo.delete_shop(str(db_shop.id))
        logger.info(f"Deleted shop record for {shop_domain}")
        
        logger.info(f"Successfully redacted all data for shop {shop_domain}. Deleted {deleted_configs} config(s)")
        
        # Return 200 OK to acknowledge receipt
        return {
            "success": True,
            "message": f"Shop data redacted successfully for {shop_domain}",
            "shop_domain": shop_domain,
            "configs_deleted": deleted_configs
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing shop redact webhook: {str(e)}")
        logger.error(traceback.format_exc())
        return {
            "success": False,
            "message": f"Error processing webhook: {str(e)}"
        }