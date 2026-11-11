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
from typing import Iterable, Optional, Sequence
from urllib.parse import unquote, urlsplit
from uuid import UUID

from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.logger import get_logger
from app.models.agent import Agent
from app.models.faq import FAQ, FAQ_SLUG_MAX_LENGTH, FAQ_URL_PATH_MAX_LENGTH
from app.models.help_center import HelpCenterSettings
from app.models.knowledge_to_agent import KnowledgeToAgent
from app.repositories.faq import FAQRepository
from app.repositories.help_center import HelpCenterRepository

logger = get_logger(__name__)

SLUG_MAX_LENGTH = 63
_SLUG_CLEAN_RE = re.compile(r"[^a-z0-9]+")

# First path segments the public help center already owns (app.api
# help_center_public routes, its uploads/images mounts, the /help/{slug}
# dispatch prefix, and /.well-known, which ACME needs for TLS issuance). A
# preserved path may never start with one of these or it would shadow the real
# route. Matching on the FIRST SEGMENT rather than a string prefix keeps
# "/apix/..." usable while still rejecting "/api/...".
FAQ_RESERVED_FIRST_SEGMENTS = frozenset(
    {"a", "ask", "api", "help", "healthz", "robots.txt", "sitemap.xml", ".well-known", "static", "uploads"}
)
_CONTROL_CHARS_RE = re.compile(r"[\x00-\x1f\x7f]")


def slugify_org_name(name: str) -> str:
    slug = _SLUG_CLEAN_RE.sub("-", (name or "").casefold()).strip("-")
    return slug[:SLUG_MAX_LENGTH].strip("-") or "help"


def _faq_base_slug(question: str) -> str:
    base = _SLUG_CLEAN_RE.sub("-", (question or "").casefold()).strip("-")
    return base[:FAQ_SLUG_MAX_LENGTH].strip("-") or "article"


def _dedupe_slug(base: str, is_taken) -> str:
    """First free slug from `base`, appending -2, -3, … while is_taken(candidate)."""
    candidate = base
    suffix = 2
    while is_taken(candidate):
        tail = f"-{suffix}"
        candidate = f"{base[:FAQ_SLUG_MAX_LENGTH - len(tail)]}{tail}"
        suffix += 1
    return candidate


def generate_faq_slug(db: Session, organization_id: UUID, question: str) -> str:
    """A per-org-unique URL slug from an FAQ question. Collisions get -2, -3, …
    Assigned once at creation and kept stable afterwards so article URLs persist."""
    repo = FAQRepository(db)
    return _dedupe_slug(_faq_base_slug(question), lambda c: repo.slug_exists(organization_id, c))


def resolve_faq_slug(
    db: Session, organization_id: UUID, requested: str, exclude_id: Optional[UUID] = None
) -> str:
    """A hand-typed slug, reduced to the same shape generation produces
    (lowercase, a-z0-9 and single hyphens, length-capped) and made unique within
    the org. `exclude_id` is the FAQ being edited, so keeping its own slug is a
    no-op rather than a collision that appends -2."""
    repo = FAQRepository(db)
    return _dedupe_slug(
        _faq_base_slug(requested),
        lambda c: repo.slug_exists(organization_id, c, exclude_id=exclude_id),
    )


def assign_faq_slugs(db: Session, faqs) -> None:
    """Give every FAQ in a batch a unique slug in place, deduping against both the
    DB and the other rows in the same batch. Rows that already have a slug are
    left untouched (and reserved so batch-mates don't collide with them)."""
    repo = FAQRepository(db)
    taken: set = set()
    for faq in faqs:
        if faq.slug:
            taken.add(faq.slug)
            continue
        slug = _dedupe_slug(
            _faq_base_slug(faq.question),
            lambda c: c in taken or repo.slug_exists(faq.organization_id, c),
        )
        faq.slug = slug
        taken.add(slug)


def normalize_url_path(raw: Optional[str]) -> Optional[str]:
    """A full URL or hand-typed path reduced to the root-relative path an article
    can be served at — or None when it can't be used at all, in which case the
    caller falls back to /a/{slug}.

    Returned percent-DECODED, because that is the form the ASGI scope hands the
    router to match against; every emitted URL re-encodes it (see
    help_center_seo.article_url). Getting that direction backwards silently 404s
    every non-ASCII path."""
    if not raw:
        return None
    candidate = raw.strip()
    if "://" in candidate or candidate.startswith("//"):
        candidate = urlsplit(candidate).path  # drop scheme/host/port
    candidate = candidate.split("#", 1)[0].split("?", 1)[0]  # drop fragment/query
    candidate = unquote(candidate)
    if _CONTROL_CHARS_RE.search(candidate):
        return None
    if not candidate.startswith("/"):
        candidate = f"/{candidate}"
    candidate = re.sub(r"/{2,}", "/", candidate).rstrip("/")
    if len(candidate) > FAQ_URL_PATH_MAX_LENGTH:
        return None
    segments = candidate.split("/")[1:]
    if not segments or not segments[0]:
        return None  # "" or "/" — that's the index, not an article
    if "." in segments or ".." in segments:
        return None  # no traversal, and nothing that normalises to another path
    if segments[0].lower() in FAQ_RESERVED_FIRST_SEGMENTS:
        return None
    return candidate


def resolve_faq_url_path(
    db: Session, organization_id: UUID, requested: str, exclude_id: Optional[UUID] = None
) -> Optional[str]:
    """A validated preserved path that is free within the org, else None.

    Deliberately does NOT dedupe with -2/-3 the way slugs do: a mangled path is
    no longer the URL the org already ranks for, so silently altering it would
    defeat the whole point. The caller decides what to do instead — fall back to
    /a/{slug} on import, or reject the edit in the admin API."""
    path = normalize_url_path(requested)
    if path is None:
        return None
    repo = FAQRepository(db)
    return None if repo.url_path_exists(organization_id, path, exclude_id=exclude_id) else path


def assign_faq_url_paths(db: Session, faqs: Sequence[FAQ], sources: Iterable[str]) -> int:
    """Give each FAQ in a batch its source URL's path, in place, deduping against
    both the DB and the other rows in the batch. Returns how many were applied.

    Rows whose path is unusable or taken keep url_path=None and are served at
    /a/{slug} — a partial result still imports every article, which beats
    failing the whole job over one bad URL.

    MUST run before the batch insert, so the unique index can never reject it."""
    repo = FAQRepository(db)
    taken: set = set()
    applied = 0
    for faq, source in zip(faqs, sources):
        path = normalize_url_path(source)
        if path is None:
            continue
        if path in taken or repo.url_path_exists(faq.organization_id, path):
            logger.warning(f"Preserved URL path already taken, using the slug instead: {path}")
            continue
        faq.url_path = path
        taken.add(path)
        applied += 1
    return applied


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
    """The public URL the help center is (or will be) served at.

    A verified custom domain always wins. Otherwise the URL shape follows
    HELP_CENTER_PUBLIC_MODE: "subdomain" advertises {slug}.<base> (cloud); the
    default "path" mode serves same-origin as the API at {BACKEND_URL}/help/{slug}
    (self-host — no DNS/TLS/proxy needed, and correct scheme+port via BACKEND_URL)."""
    if row.domain_verified:
        return f"https://{row.custom_domain}"
    return slug_url(row)


def slug_url(row: HelpCenterSettings) -> str:
    """The help center's own address (subdomain or path), which keeps working
    whether or not a custom domain is set up."""
    if settings.HELP_CENTER_PUBLIC_MODE == "subdomain":
        return f"https://{row.slug}.{settings.HELP_CENTER_BASE_DOMAIN}"
    return f"{settings.BACKEND_URL.rstrip('/')}/help/{row.slug}"
