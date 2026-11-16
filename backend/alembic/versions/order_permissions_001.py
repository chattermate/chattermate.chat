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
"""Permissions to act on a customer's store orders, one per action

Seeded onto existing roles by what they can already do (new orgs seed through
Permission.default_permissions and DEFAULT_AGENT_ROLE_PERMISSIONS):
- refund_orders, cancel_orders (they move money): roles that manage the organization
- edit_orders, create_discounts: also roles that work their assigned chats

Revision ID: order_permissions_001
Revises: message_edits_001
Create Date: 2026-11-16
"""
from typing import Sequence, Union

from alembic import op

revision: str = 'order_permissions_001'
down_revision: Union[str, None] = 'message_edits_001'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# name: (description, roles holding any of these get it)
NEW_PERMISSIONS = {
    'refund_orders': ("Can refund store orders", ('manage_organization',)),
    'cancel_orders': ("Can cancel store orders", ('manage_organization',)),
    'edit_orders': ("Can change an order's shipping address", ('manage_organization', 'manage_assigned_chats')),
    'create_discounts': ("Can create discount codes for a customer", ('manage_organization', 'manage_assigned_chats')),
}


def _quoted(names) -> str:
    return ", ".join(f"'{n}'" for n in names)


def upgrade() -> None:
    for name, (description, anchors) in NEW_PERMISSIONS.items():
        op.execute(f"""
            INSERT INTO permissions (name, description)
            SELECT '{name}', $${description}$$
            WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE name = '{name}')
        """)
        op.execute(f"""
            INSERT INTO role_permissions (role_id, permission_id)
            SELECT DISTINCT rp.role_id, p_new.id
            FROM role_permissions rp
            JOIN permissions p_old ON p_old.id = rp.permission_id AND p_old.name IN ({_quoted(anchors)})
            CROSS JOIN permissions p_new
            WHERE p_new.name = '{name}'
              AND NOT EXISTS (
                  SELECT 1 FROM role_permissions rp2
                  WHERE rp2.role_id = rp.role_id AND rp2.permission_id = p_new.id
              )
        """)


def downgrade() -> None:
    names = _quoted(NEW_PERMISSIONS)
    op.execute(f"""
        DELETE FROM role_permissions
        WHERE permission_id IN (SELECT id FROM permissions WHERE name IN ({names}))
    """)
    op.execute(f"DELETE FROM permissions WHERE name IN ({names})")
