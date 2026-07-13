"""add slug to faqs for public article-page URLs

FAQs become full help-center articles served at /a/{slug}. Adds a nullable
per-org-unique slug column, then backfills existing rows from their question
(deduping collisions with -2, -3, … within each org). New/edited FAQs get their
slug assigned in the API; this backfill covers everything created before.

Revision ID: add_hc_faq_slug_001
Revises: add_hc_cta_enabled_001
Create Date: 2026-07-13
"""
import re

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = 'add_hc_faq_slug_001'
down_revision = 'add_hc_cta_enabled_001'
branch_labels = None
depends_on = None

SLUG_MAX_LENGTH = 80
_SLUG_CLEAN_RE = re.compile(r"[^a-z0-9]+")


def _slugify(text: str) -> str:
    base = _SLUG_CLEAN_RE.sub("-", (text or "").casefold()).strip("-")
    return base[:SLUG_MAX_LENGTH].strip("-") or "article"


def _backfill(conn) -> None:
    faqs = conn.execute(
        sa.text("SELECT id, organization_id, question FROM faqs ORDER BY created_at ASC, id ASC")
    ).fetchall()
    used: dict = {}  # organization_id -> set(slug)
    for faq_id, org_id, question in faqs:
        seen = used.setdefault(org_id, set())
        base = _slugify(question)
        candidate = base
        suffix = 2
        while candidate in seen:
            tail = f"-{suffix}"
            candidate = f"{base[:SLUG_MAX_LENGTH - len(tail)]}{tail}"
            suffix += 1
        seen.add(candidate)
        conn.execute(
            sa.text("UPDATE faqs SET slug = :slug WHERE id = :id"),
            {"slug": candidate, "id": faq_id},
        )


def upgrade() -> None:
    op.add_column('faqs', sa.Column('slug', sa.String(length=80), nullable=True))
    _backfill(op.get_bind())
    op.create_index('ix_faqs_org_slug', 'faqs', ['organization_id', 'slug'], unique=True)


def downgrade() -> None:
    op.drop_index('ix_faqs_org_slug', table_name='faqs')
    op.drop_column('faqs', 'slug')
