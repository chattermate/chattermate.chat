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

Host-based dispatch for the public help center.

Requests whose Host is {slug}.<HELP_CENTER_BASE_DOMAIN> or a DB-verified
custom domain are routed to the public help-center app; everything else
passes through to the main API untouched. The Host header is never trusted
beyond an equality lookup against verified values.

This module is also the single source of truth for host canonicalization and
slug parsing — the resolver in services/help_center_public imports from here
so dispatch and resolution can never disagree.
"""

import asyncio
import time
from typing import Optional

from app.core.config import settings
from app.core.logger import get_logger

logger = get_logger(__name__)

DOMAIN_CACHE_TTL_SECONDS = 60


def normalize_host(raw_host: Optional[str]) -> str:
    return (raw_host or "").split(":")[0].strip().lower().rstrip(".")


def slug_for_host(host: str) -> Optional[str]:
    """The {slug} of {slug}.<HELP_CENTER_BASE_DOMAIN>, if this host is one."""
    suffix = f".{settings.HELP_CENTER_BASE_DOMAIN}"
    if host.endswith(suffix):
        label = host[: -len(suffix)]
        if label and "." not in label:
            return label
    return None


class _VerifiedDomainCache:
    """Snapshot of verified custom domains refreshed in the background, so
    host dispatch is always a non-blocking set lookup — the middleware fronts
    EVERY request, and a synchronous DB refresh here would let a slow database
    stall the whole service. Stale-while-revalidate; fails to an empty set
    (custom domains temporarily 404; API traffic unaffected)."""

    def __init__(self):
        self._domains: frozenset = frozenset()
        self._fetched_at: float = 0.0
        self._refreshing = False

    def contains(self, host: str) -> bool:
        if time.monotonic() - self._fetched_at >= DOMAIN_CACHE_TTL_SECONDS and not self._refreshing:
            self._refreshing = True
            try:
                asyncio.get_running_loop().create_task(self._refresh_async())
            except RuntimeError:
                # No running loop (sync test context): refresh inline.
                self._refresh_sync()
                self._refreshing = False
        return host in self._domains

    async def _refresh_async(self):
        try:
            await asyncio.to_thread(self._refresh_sync)
        finally:
            self._refreshing = False

    def _refresh_sync(self):
        try:
            from app.database import SessionLocal
            from app.repositories.help_center import HelpCenterRepository

            with SessionLocal() as db:
                self._domains = frozenset(HelpCenterRepository(db).list_verified_domains())
            self._fetched_at = time.monotonic()
        except Exception as e:
            # Back off a full TTL rather than re-querying a broken DB per request.
            self._fetched_at = time.monotonic()
            logger.error(f"Verified-domain cache refresh failed: {e}")


_domain_cache = _VerifiedDomainCache()


def _host_from_scope(scope) -> str:
    for name, value in scope.get("headers") or []:
        if name == b"host":
            return normalize_host(value.decode("latin-1"))
    return ""


def is_help_center_host(host: str) -> bool:
    if not host:
        return False
    if slug_for_host(host) is not None:
        return True
    return _domain_cache.contains(host)


class HelpCenterHostMiddleware:
    """Pure-ASGI dispatcher installed inside the socketio wrapper: help-center
    hosts go to the public app, everything else to the main FastAPI app."""

    def __init__(self, app, public_app):
        self.app = app
        self.public_app = public_app

    async def __call__(self, scope, receive, send):
        if scope["type"] == "http" and is_help_center_host(_host_from_scope(scope)):
            await self.public_app(scope, receive, send)
            return
        await self.app(scope, receive, send)
