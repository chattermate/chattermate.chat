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

Who may use which launcher options, and what visitors are served.

Free options work everywhere. The logo and premium animations need the
custom_branding plan feature; a stored choice stays in the database when a plan
lapses, so it comes back on upgrade, and only what visitors get falls back.
"""

import time
from typing import Dict, Optional, Tuple
from uuid import UUID

from sqlalchemy.orm import Session

from app.core.s3 import sign_s3_url
from app.core.config import settings
from app.models.agent import Agent
from app.models.schemas.agent_customization import (
    LauncherAnimation,
    LauncherIcon,
    LauncherSize,
)
from app.services.feature_gate import CUSTOM_BRANDING_FEATURE, check_feature_access, plan_feature_on
from app.services.help_center_images import absolute_upload_url

LAUNCHER_KEY = 'launcher'
LOGO_FEATURE = CUSTOM_BRANDING_FEATURE
UPGRADE_MESSAGE = "Custom logos and premium animations are on Base and Pro."

PAID_ANIMATIONS = (LauncherAnimation.SWOOSH.value, LauncherAnimation.GLOW.value)
FREE_ICON_FALLBACK = LauncherIcon.DOTS.value
FREE_ANIMATION_FALLBACK = LauncherAnimation.CLASSIC.value
# Only the logo upload may set these; a form save keeps the stored value.
SERVER_OWNED_KEYS = ('logo_transparent',)

# A fresh signature is a new URL, so browsers would refetch the logo on every page
# view. Reused well inside the signature's life, it stays cacheable.
SIGNED_URL_CACHE_SECONDS = min(600, settings.S3_PRESIGN_EXPIRY_SECONDS // 2)
CACHE_MAX_ENTRIES = 2048

_signed_url_cache: Dict[str, Tuple[float, str]] = {}


def _cached(cache: dict, key, seconds: int, compute):
    now = time.monotonic()
    hit = cache.get(key)
    if hit and hit[0] > now:
        return hit[1]
    value = compute()
    if len(cache) >= CACHE_MAX_ENTRIES:
        cache.clear()
    cache[key] = (now + seconds, value)
    return value


def uses_paid_options(launcher: Optional[dict]) -> bool:
    if not launcher:
        return False
    return launcher.get('icon') == LauncherIcon.LOGO.value or launcher.get('animation') in PAID_ANIMATIONS


def adds_paid_options(stored: Optional[dict], incoming: Optional[dict]) -> bool:
    """A paid value that isn't already stored. Downgraded orgs keep their stored
    choices and the dashboard sends them back on every save, so an unchanged one
    must not block an unrelated edit."""
    stored = stored or {}
    incoming = incoming or {}
    return any(
        incoming.get(key) != stored.get(key) and uses_paid_options({key: incoming.get(key)})
        for key in ('icon', 'animation')
    )


def check_metadata_write(db: Session, organization_id: UUID, stored_metadata: Optional[dict],
                         incoming_metadata: Optional[dict]) -> Optional[dict]:
    """Refuse newly chosen paid options and put back the server-owned keys.
    Returns the metadata to store."""
    if not incoming_metadata or not incoming_metadata.get(LAUNCHER_KEY):
        return incoming_metadata
    stored = (stored_metadata or {}).get(LAUNCHER_KEY) or {}
    incoming = dict(incoming_metadata[LAUNCHER_KEY])
    if adds_paid_options(stored, incoming):
        check_feature_access(db, organization_id, LOGO_FEATURE, UPGRADE_MESSAGE)
    for key in SERVER_OWNED_KEYS:
        incoming.pop(key, None)
        if key in stored:
            incoming[key] = stored[key]
    return {**incoming_metadata, LAUNCHER_KEY: incoming}


def _visitor_logo_url(stored: str) -> str:
    if settings.S3_FILE_STORAGE:
        return _cached(_signed_url_cache, stored, SIGNED_URL_CACHE_SECONDS, lambda: sign_s3_url(stored))
    return absolute_upload_url(stored)


def _without_paid_options(launcher: dict) -> dict:
    served = dict(launcher)
    if served.get('icon') == LauncherIcon.LOGO.value:
        served['icon'] = FREE_ICON_FALLBACK
    if served.get('animation') in PAID_ANIMATIONS:
        served['animation'] = FREE_ANIMATION_FALLBACK
    return served


def for_visitors(db: Session, agent: Agent) -> Tuple[dict, Optional[str]]:
    """customization_metadata and logo URL as visitors get them. Works on a copy:
    the stored dict belongs to the ORM and must keep the org's real choices."""
    customization = agent.customization
    metadata = dict(customization.customization_metadata or {})
    launcher = metadata.get(LAUNCHER_KEY)
    if not uses_paid_options(launcher):
        return metadata, None

    # The cached plan read the chat path uses: a failed lookup keeps what the org
    # chose rather than stripping a paying customer's launcher.
    if not plan_feature_on(db, agent.organization_id, LOGO_FEATURE):
        metadata[LAUNCHER_KEY] = _without_paid_options(launcher)
        return metadata, None

    if launcher.get('icon') != LauncherIcon.LOGO.value:
        return metadata, None
    if not customization.icon_url:
        metadata[LAUNCHER_KEY] = {**launcher, 'icon': FREE_ICON_FALLBACK}
        return metadata, None
    return metadata, _visitor_logo_url(customization.icon_url)


def uncustomized_defaults() -> dict:
    """An agent nobody has customized yet: every new agent starts here, and gets
    the smaller launcher customers asked for. Saved agents keep what they have."""
    return {'customization_metadata': {LAUNCHER_KEY: {'size': LauncherSize.MEDIUM.value}}}


def first_save_metadata(metadata: Optional[dict]) -> dict:
    """Metadata for an agent's first customization row, so that saving anything at
    all doesn't turn a new agent's launcher back into the large one."""
    metadata = metadata or {}
    return {**metadata, LAUNCHER_KEY: {'size': LauncherSize.MEDIUM.value, **(metadata.get(LAUNCHER_KEY) or {})}}
