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

import traceback
from fastapi import APIRouter, Depends, HTTPException, Query, Request, Response
from fastapi.concurrency import run_in_threadpool
from fastapi.responses import RedirectResponse, HTMLResponse, JSONResponse
from sqlalchemy.orm import Session
from app.utils.domain_check import InvalidWebsite, website_update
from app.repositories.organization import OrganizationRepository
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
from app.services import shopify_privacy
from app.core.s3 import delete_file_from_s3
from app.services.shopify_links import owned_by_another_org, refresh_allowed_storefronts, use_shop_domain_if_unset
from app.services.shopify_session import require_shopify_session
from app.services.shopify_urls import shopify_admin_url
from app.services import shopify_tokens
from app.repositories.knowledge import KnowledgeRepository
from app.repositories.knowledge_queue import KnowledgeQueueRepository
from app.repositories.knowledge_to_agent import KnowledgeToAgentRepository
from app.models.knowledge import SourceType
from app.models.knowledge_queue import KnowledgeQueue, QueueStatus
from app.models.knowledge_to_agent import KnowledgeToAgent
from uuid import UUID
from app.core.cors import update_cors_middleware
from app.core.application import app
from app.core.params import MAX_DB_INT

router = APIRouter()
logger = get_logger(__name__)

# Define the scopes needed for your app
SCOPES = "read_products,read_themes,write_themes,write_script_tags,read_script_tags,read_orders,read_all_orders,read_customers"


def _require_shopify_agent_in_org(db, agent_id, org_id) -> None:
    """The agent being configured must belong to the resolved org, else 404.

    agent_id and org_id both arrive as either strings or UUIDs depending on the
    auth path; a malformed id is simply not found rather than a 500.
    """
    from app.repositories.agent import AgentRepository
    try:
        agent_uuid = UUID(str(agent_id))
        org_uuid = UUID(str(org_id))
    except (ValueError, TypeError):
        raise HTTPException(status_code=404, detail="Agent not found")
    if not AgentRepository(db).get_agent_in_org(agent_uuid, org_uuid):
        raise HTTPException(status_code=404, detail="Agent not found")


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

        session_token = ShopifySessionService.get_session_token_from_request(request)
        if not session_token:
            raise HTTPException(status_code=401, detail="Session token required")

        logger.info("Exchanging session token for offline access token")

        # 2. Verify the session token's signature before trusting any claim. This request
        #    carries client_secret to the host named by `dest`, so an unverified token
        #    would let a caller steer our credentials to a host of their choosing.
        decoded = ShopifySessionService.validate_session_token(session_token)
        shop_domain = decoded.get('dest', '').replace('https://', '').replace('http://', '')

        # `dest` must be a Shopify shop domain, never a caller-chosen host.
        if not shop_domain or not shop_domain.split('/')[0].endswith('.myshopify.com'):
            raise HTTPException(status_code=400, detail="Invalid session token: bad shop domain")

        logger.info(f"Extracted shop domain from token: {shop_domain}")
        
        # 3. Exchange it for an expiring offline token and store it, under the
        #    shop's token lock so it never overlaps a refresh.
        try:
            db_shop = await run_in_threadpool(
                shopify_tokens.acquire_token, db, shop_domain,
                lambda: shopify_tokens.exchange_session_token(shop_domain, session_token),
            )
        except shopify_tokens.ShopifyTokenError as e:
            logger.error(f"Token exchange failed for {shop_domain}: {e}")
            status = e.status_code if e.status_code and e.status_code >= 400 else 502
            raise HTTPException(status_code=status, detail=f"Token exchange failed: {e}")

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

        org_id_str = str(current_user.organization_id)

        # Claiming is only for shops nobody owns yet — the same guard
        # /link-shop/{shop_id} has. Without it, any manage_organization user
        # could re-point another tenant's installed shop (and its stored
        # access token) at their own org, and drag that shop's domain onto
        # their organization record in the process.
        if owned_by_another_org(db_shop, org_id_str):
            raise HTTPException(
                status_code=404,
                detail="Shop not found"
            )

        # Update shop with organization_id
        shop_update = ShopifyShopUpdate(organization_id=org_id_str)
        shop_repo.update_shop(shop_id, shop_update)

        try:
            use_shop_domain_if_unset(db, org_id_str, db_shop.shop_domain)
        except Exception as domain_error:
            logger.error(f"Error updating organization domain: {str(domain_error)}")
            # Don't fail the linking if domain update fails

        db.commit()

        refresh_allowed_storefronts()

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
    skip: int = Query(0, ge=0, le=MAX_DB_INT),
    limit: int = Query(100, ge=1, le=1000),
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
            uninstall_url = shopify_admin_url(db_shop.shop_domain, "graphql.json")
            
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
            
            # Off the event loop: renewing the token and the request both block.
            response = await run_in_threadpool(shopify_tokens.call_admin_api, db_shop, lambda token: requests.post(
                uninstall_url,
                headers=shopify_tokens.admin_headers(token),
                json={"query": mutation},
            ))
            
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
    
    # The store's privacy webhooks can still arrive after this; they find
    # the organization through this record. Committed by delete_shop().
    shopify_privacy.remember_shop_owner(db, db_shop, shopify_privacy.TOPIC_SHOP_DISCONNECTED)

    # Delete the shop from our database
    success = shop_repository.delete_shop(shop_id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to delete shop")
    refresh_allowed_storefronts()
    
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
            refresh_allowed_storefronts()
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

        # Get organization
        if not db_shop.organization_id:
            raise HTTPException(status_code=400, detail="Shop not linked to organization")

        org_repo = OrganizationRepository(db)
        organization = org_repo.get_organization(str(db_shop.organization_id))

        if not organization:
            raise HTTPException(status_code=404, detail="Organization not found")

        try:
            website = website_update(new_domain, organization.domain)
        except InvalidWebsite as invalid:
            raise HTTPException(status_code=400, detail=str(invalid))
        if not website:
            return {"success": True, "domain": organization.domain, "organization_id": str(organization.id)}
        new_domain = website

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
    org_id = None
    try:
        shopify_session = await require_shopify_session(request, db)
        # Session token valid - verify agent belongs to shop's organization
        if not shopify_session['organization_id']:
            raise HTTPException(status_code=403, detail="Shop not linked to organization")
        org_id = shopify_session['organization_id']
        logger.info(f"GET agent-config using session token for org: {org_id}")
    except HTTPException:
        # Fall back to JWT auth (for dashboard)
        current_user = await run_in_threadpool(get_current_user, request, None, db)
        if not check_permissions(current_user, ["manage_organization"]):
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        org_id = current_user.organization_id
        logger.info(f"GET agent-config using JWT auth for user: {current_user.id}")

    # The comment above always promised this — the agent must be in the
    # resolved org, else any tenant could read any agent's Shopify config.
    _require_shopify_agent_in_org(db, agent_id, org_id)

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
        current_user = await run_in_threadpool(get_current_user, request, None, db)
        if not check_permissions(current_user, ["manage_organization"]):
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        if not current_user.organization_id:
            raise HTTPException(status_code=403, detail="User not linked to organization")
        org_id_str = str(current_user.organization_id)
        user_id = current_user.id
        logger.info(f"POST agent-config using JWT auth for user: {current_user.id}")

    # The agent being configured must belong to the resolved org.
    _require_shopify_agent_in_org(db, agent_id, org_id_str)

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

        # shop/redact arrives 48 hours from now and must still find this
        # store's conversations; delete_shop() below commits this with it.
        shopify_privacy.remember_shop_owner(
            db, db_shop, shopify_privacy.TOPIC_APP_UNINSTALLED,
            webhook_id=request_headers.get("X-Shopify-Webhook-Id"))

        # Delete the shop record from the database
        shop_repo.delete_shop(str(db_shop.id))
        logger.info(f"Deleted shop record for {shop_domain}")
        
        # Commit the changes
        db.commit()
        refresh_allowed_storefronts()
        
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

# Shopify's mandatory privacy webhooks. The work lives in
# app.services.shopify_privacy; these only verify, parse and acknowledge.
# Anyone can reach them, so a failure answers with a fixed message, and a
# reply never repeats the customer's email or phone.
PRIVACY_HANDLERS = {
    shopify_privacy.TOPIC_DATA_REQUEST: shopify_privacy.handle_data_request,
    shopify_privacy.TOPIC_CUSTOMERS_REDACT: shopify_privacy.handle_customers_redact,
    shopify_privacy.TOPIC_SHOP_REDACT: shopify_privacy.handle_shop_redact,
}


async def _handle_privacy_webhook(topic: str, request: Request, db: Session):
    request_body = await request.body()
    if not ShopifyHelperService.verify_shopify_webhook(request.headers, request_body):
        logger.warning(f"Invalid webhook signature for {topic}")
        raise HTTPException(status_code=401, detail="Invalid webhook signature")
    try:
        payload = json.loads(request_body.decode('utf-8'))
    except (json.JSONDecodeError, UnicodeDecodeError) as e:
        logger.error(f"Failed to parse {topic} webhook payload: {str(e)}")
        raise HTTPException(status_code=400, detail="Invalid JSON payload")
    # A malformed payload can never succeed, so it is a 400 (no retry), not
    # a 500 that Shopify would keep retrying.
    if not isinstance(payload, dict) or not isinstance(payload.get("customer") or {}, dict):
        raise HTTPException(status_code=400, detail="Invalid JSON payload")

    try:
        outcome = await run_in_threadpool(
            PRIVACY_HANDLERS[topic], db, payload, request.headers.get("X-Shopify-Webhook-Id"))
    except Exception as e:
        db.rollback()
        logger.error(f"Error processing {topic} webhook: {str(e)}")
        logger.error(traceback.format_exc())
        # A 5xx makes Shopify retry; an erasure that failed must be retried.
        return JSONResponse(status_code=500, content={
            "success": False,
            "message": "Error processing webhook",
        })

    for url in outcome.attachment_urls:
        await delete_file_from_s3(url)
    if topic == shopify_privacy.TOPIC_SHOP_REDACT and not outcome.duplicate:
        # shop/redact deletes a shop row the uninstall missed; its storefront
        # must stop being an allowed widget origin, as on uninstall.
        refresh_allowed_storefronts()
    return {
        "success": True,
        "status": outcome.status,
        "duplicate": outcome.duplicate,
        "shop_domain": payload.get("shop_domain"),
    }


@router.post("/webhooks/customers/data_request")
async def shopify_customers_data_request_webhook(request: Request, db: Session = Depends(get_db)):
    """A customer asked the merchant for their data. Records which of our
    customer records it covers; the export is then sent to the merchant.
    https://shopify.dev/docs/apps/build/privacy-law-compliance"""
    return await _handle_privacy_webhook(shopify_privacy.TOPIC_DATA_REQUEST, request, db)


@router.post("/webhooks/customers/redact")
async def shopify_customers_redact_webhook(request: Request, db: Session = Depends(get_db)):
    """Erase one customer's conversations and personal data.
    https://shopify.dev/docs/apps/build/privacy-law-compliance"""
    return await _handle_privacy_webhook(shopify_privacy.TOPIC_CUSTOMERS_REDACT, request, db)


@router.post("/webhooks/shop/redact")
async def shopify_shop_redact_webhook(request: Request, db: Session = Depends(get_db)):
    """Sent 48 hours after uninstall: erase the store's visitor data.
    https://shopify.dev/docs/apps/build/privacy-law-compliance"""
    return await _handle_privacy_webhook(shopify_privacy.TOPIC_SHOP_REDACT, request, db)
