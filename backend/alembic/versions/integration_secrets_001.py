"""encrypt integration tokens at rest; shopify compliance events

Revision ID: integration_secrets_001
Revises: journeys_001
Create Date: 2026-11-07

Encrypts, in place, the integration secrets that were stored as plaintext:
shopify_shops.access_token, jira_tokens.access_token / refresh_token, and the
mcp_tools env_vars / headers objects. The models now read and write them
through app.core.encryption, which passes a plaintext value straight through,
so rows this has not reached yet keep working. Re-running is a no-op:
already-encrypted values are left as they are.

Downgrade decrypts them back, because the code before this revision reads
them as plaintext.

Also creates shopify_compliance_events — the record of uninstall and privacy
webhooks (see app.models.shopify.shopify_compliance_event).
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from app.core.encryption import decrypt_json, decrypt_value, encrypt_json, encrypt_value, is_encrypted, JSON_MARKER

# revision identifiers, used by Alembic.
revision: str = 'integration_secrets_001'
down_revision: Union[str, None] = 'journeys_001'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# (table, primary key, columns, column type)
TARGETS = (
    ('shopify_shops', 'id', ('access_token',), sa.Text),
    ('jira_tokens', 'id', ('access_token', 'refresh_token'), sa.Text),
    ('mcp_tools', 'id', ('env_vars', 'headers'), sa.JSON),
)


def _encrypt(value, kind):
    if kind is sa.JSON:
        return encrypt_json(value)
    return encrypt_value(value)


def _decrypt(value, kind):
    if kind is sa.JSON:
        if not isinstance(value, dict) or JSON_MARKER not in value:
            return value
        plain = decrypt_json(value)
    else:
        if not is_encrypted(value):
            return value
        plain = decrypt_value(value)
    if plain is None:
        # decrypt_* degrade to None on a wrong key; writing that back would
        # destroy the secret (and break NOT NULL columns). Stop instead.
        raise RuntimeError('A stored integration secret does not decrypt with ENCRYPTION_KEY; '
                           'downgrade stopped without changing it')
    return plain


def _rewrite(transform) -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    for table_name, pk, columns, kind in TARGETS:
        if not inspector.has_table(table_name):
            continue
        table = sa.table(table_name, sa.column(pk), *(sa.column(c, kind()) for c in columns))
        rows = bind.execute(sa.select(table)).mappings().all()
        for row in rows:
            changed = {}
            for column in columns:
                value = row[column]
                if value is None:
                    continue
                new_value = transform(value, kind)
                if new_value != value:
                    changed[column] = new_value
            if changed:
                bind.execute(
                    table.update().where(table.c[pk] == row[pk]).values(**changed)
                )


def upgrade() -> None:
    op.create_table(
        'shopify_compliance_events',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('topic', sa.String(40), nullable=False),
        sa.Column('shop_domain', sa.String(), nullable=False),
        sa.Column('organization_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('webhook_id', sa.String(64), nullable=True),
        sa.Column('subject_ref', sa.String(64), nullable=True),
        sa.Column('status', sa.String(24), nullable=False),
        sa.Column('result', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('webhook_id', name='uq_shopify_compliance_events_webhook_id'),
    )
    op.create_index('ix_shopify_compliance_events_shop_domain', 'shopify_compliance_events', ['shop_domain'])

    _rewrite(_encrypt)


def downgrade() -> None:
    _rewrite(_decrypt)

    op.drop_index('ix_shopify_compliance_events_shop_domain', table_name='shopify_compliance_events')
    op.drop_table('shopify_compliance_events')
