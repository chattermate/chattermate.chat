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

# Keeps installed stores' Shopify tokens alive. A refresh token lasts 90 days
# and only using it extends that, so a store whose agent makes no Shopify calls
# would otherwise need the merchant to reopen the app. The same pass moves
# stores still on a non-expiring token to an expiring one.
#
# Every worker runs it. The per-shop locks in app.services.shopify_tokens make
# that safe: a worker that finds the token already renewed does nothing.

import asyncio
import os
from typing import Dict

from sqlalchemy.orm import Session

from app import database
from app.core.logger import get_logger
from app.models.shopify.shopify_shop import ShopifyShop
from app.services import shopify_tokens

logger = get_logger(__name__)

KEEPALIVE_INTERVAL = int(os.environ.get('SHOPIFY_TOKEN_KEEPALIVE_INTERVAL', '21600'))
# Let a deploy settle before the first pass.
FIRST_PASS_DELAY = int(os.environ.get('SHOPIFY_TOKEN_KEEPALIVE_DELAY', '300'))


def installed_shops() -> list:
    """Detached rows of the stores that hold a token."""
    with Session(bind=database.engine, autoflush=False, expire_on_commit=False) as db:
        return db.query(ShopifyShop).filter(
            ShopifyShop.is_installed.is_(True),
            ShopifyShop.access_token.isnot(None),
        ).all()


def keep_tokens_alive() -> Dict[str, int]:
    """One pass over the installed stores. Returns how many were renewed,
    how many need the merchant to reopen the app, and how many failed."""
    counts = {"renewed": 0, "reauth_required": 0, "failed": 0}
    for shop in installed_shops():
        try:
            if shopify_tokens.keep_alive(shop):
                counts["renewed"] += 1
        except shopify_tokens.ShopifyReauthRequired as e:
            counts["reauth_required"] += 1
            logger.warning(f"Shopify token keep-alive: {e}")
        except Exception as e:
            counts["failed"] += 1
            logger.error(f"Shopify token keep-alive failed for {shop.shop_domain}: {e}")
    return counts


async def run_keepalive_loop() -> None:
    await asyncio.sleep(FIRST_PASS_DELAY)
    while True:
        try:
            counts = await asyncio.to_thread(keep_tokens_alive)
            if any(counts.values()):
                logger.info(f"Shopify token keep-alive: {counts}")
        except Exception as e:
            logger.error(f"Shopify token keep-alive pass failed: {e}")
        await asyncio.sleep(KEEPALIVE_INTERVAL)
