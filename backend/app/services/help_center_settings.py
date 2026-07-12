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

Help-center settings lifecycle: lazy get-or-create (which is also the
"org has adopted the feature" marker), slug generation and the agent
auto-default for AI search.
"""

import re
from typing import Optional
from uuid import UUID

from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.logger import get_logger
from app.models.agent import Agent
from app.models.help_center import HelpCenterSettings
from app.models.knowledge_to_agent import KnowledgeToAgent
from app.repositories.help_center import HelpCenterRepository

logger = get_logger(__name__)

SLUG_MAX_LENGTH = 63
_SLUG_CLEAN_RE = re.compile(r"[^a-z0-9]+")


def slugify_org_name(name: str) -> str:
    slug = _SLUG_CLEAN_RE.sub("-", (name or "").casefold()).strip("-")
    return slug[:SLUG_MAX_LENGTH].strip("-") or "help"


def generate_unique_slug(db: Session, name: str) -> str:
    """Slug from the org name; reserved labels and collisions get -2, -3, …"""
    repo = HelpCenterRepository(db)
    base = slugify_org_name(name)
    if base in settings.HELP_CENTER_RESERVED_SLUGS:
        base = f"{base}-help"[:SLUG_MAX_LENGTH]
    candidate = base
    suffix = 2
    while repo.slug_exists(candidate) or candidate in settings.HELP_CENTER_RESERVED_SLUGS:
        tail = f"-{suffix}"
        candidate = f"{base[:SLUG_MAX_LENGTH - len(tail)]}{tail}"
        suffix += 1
    return candidate


def default_agent_id(db: Session, organization_id: UUID) -> Optional[UUID]:
    """The org's only active agent; else the first agent with linked knowledge;
    else None (user picks manually)."""
    active_agents = (
        db.query(Agent)
        .filter(Agent.organization_id == organization_id, Agent.is_active.is_(True))
        .order_by(Agent.id)
        .all()
    )
    if len(active_agents) == 1:
        return active_agents[0].id
    with_knowledge = (
        db.query(Agent)
        .join(KnowledgeToAgent, KnowledgeToAgent.agent_id == Agent.id)
        .filter(Agent.organization_id == organization_id)
        .order_by(Agent.id)
        .first()
    )
    return with_knowledge.id if with_knowledge else None


def get_or_create_settings(db: Session, organization) -> HelpCenterSettings:
    """Fetch the org's help-center settings, creating the row (slug + agent
    auto-default) on first access."""
    repo = HelpCenterRepository(db)
    row = repo.get_by_org(organization.id)
    if row:
        return row
    row = HelpCenterSettings(
        organization_id=organization.id,
        slug=generate_unique_slug(db, organization.name),
        agent_id=default_agent_id(db, organization.id),
    )
    created = repo.create(row)
    logger.info(f"Created help center settings for org {organization.id} (slug={created.slug})")
    return created


def live_url(row: HelpCenterSettings) -> str:
    """The public URL the help center is (or will be) served at."""
    if row.domain_verified:
        return f"https://{row.custom_domain}"
    return f"https://{row.slug}.{settings.HELP_CENTER_BASE_DOMAIN}"
