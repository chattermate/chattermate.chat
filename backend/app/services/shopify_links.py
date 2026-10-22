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

Linking a Shopify store to an organization.
"""

from typing import Optional, Union
from uuid import UUID

from sqlalchemy.orm import Session

from app.core.application import app
from app.core.cors import update_cors_middleware
from app.core.logger import get_logger
from app.models.schemas.shopify.shopify_shop import ShopifyShopUpdate
from app.models.shopify.shopify_shop import ShopifyShop
from app.repositories.organization import OrganizationRepository
from app.repositories.shopify_shop_repository import ShopifyShopRepository

logger = get_logger(__name__)


def owned_by_another_org(shop: ShopifyShop, organization_id: Union[str, UUID]) -> bool:
    """Whether the store already belongs to a different organization: claiming
    it would hand that tenant's store (and its access token) to someone else."""
    return bool(shop.organization_id) and str(shop.organization_id) != str(organization_id)


def use_shop_domain_if_unset(db: Session, organization_id: Union[str, UUID], shop_domain: Optional[str]) -> None:
    """Give an organization with no website its store's domain. One that has a
    website keeps it: replacing it would cut the widget off from that site,
    and the store's own domain is allowed for the widget anyway
    (cors.get_cors_origins adds every linked store)."""
    org_repo = OrganizationRepository(db)
    organization = org_repo.get_organization(UUID(str(organization_id)))
    if not organization or organization.domain or not shop_domain:
        return
    if org_repo.get_organization_by_domain(shop_domain):
        logger.warning(f"Domain {shop_domain} is already another organization's website; not adopting it")
        return
    organization.domain = shop_domain
    db.add(organization)
    logger.info(f"Organization {organization_id} had no website; using its store's domain {shop_domain}")


def refresh_allowed_storefronts() -> None:
    """Rebuild the CORS list after a store is linked, unlinked or removed: a
    linked store's storefront runs the widget. Best effort, so it never fails
    the request that changed the store."""
    try:
        update_cors_middleware(app)
    except Exception as cors_error:
        logger.error(f"Error updating CORS middleware: {str(cors_error)}")


def link_shop_at_sign_in(db: Session, shop_id: str, organization_id: Union[str, UUID]) -> None:
    """Link the store a merchant signed in from (`?shop_id=` on the login page)
    to their organization. Only a store nobody else owns yet (the same rule as
    /shopify/link-organization): otherwise signing in with another tenant's
    shop_id would take over their store. Best effort, so it never fails the
    sign-in."""
    try:
        shop_repository = ShopifyShopRepository(db)
        db_shop = shop_repository.get_shop(shop_id)
        if not db_shop:
            logger.warning(f"Shop {shop_id} not found during login")
            return
        if owned_by_another_org(db_shop, organization_id):
            logger.warning(f"Shop {db_shop.id} belongs to another organization; not linking it at login")
            return

        shop_repository.update_shop(db_shop.id, ShopifyShopUpdate(organization_id=str(organization_id)))
        try:
            use_shop_domain_if_unset(db, organization_id, db_shop.shop_domain)
        except Exception as domain_error:
            # Don't fail login if domain update fails
            logger.error(f"Error updating organization domain during login: {str(domain_error)}")
        db.commit()

        refresh_allowed_storefronts()
        logger.info(f"Updated shop {db_shop.shop_domain} with organization_id {organization_id} after login")
    except Exception as e:
        logger.error(f"Error updating shopify shop during login: {str(e)}")
