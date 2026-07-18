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

"""add view_unassigned_chats + view_people permissions

Revision ID: b7c4e91a2d38
Revises: add_customer_phone_001
Create Date: 2026-07-18

Agents could previously only see chats already assigned to them or their group,
so the AI queue was invisible and "Take over" was unreachable. Two new
permissions rather than widening view_assigned_chats, so that granting the
queue never also exposes another agent's conversations:

- view_unassigned_chats: the unclaimed queue (session_to_agents.user_id IS NULL)
- view_people: read-only people directory, previously gated on view_all_chats

Backfill targets roles by CAPABILITY, not by name, so every existing
organization is covered including ones whose agent role was renamed or
hand-built:

- any role that can view chats at all (assigned, all, or super_admin) gains
  view_unassigned_chats
- the same roles plus manage_all_chats gain view_people

This deliberately widens existing roles: without it the feature would appear
broken for every deployment created before this release, and an admin who
wants an agent kept out can uncheck the permission in Roles. Re-runnable —
every insert is guarded by NOT EXISTS.

Also repairs the seeding bug where BOTH "Admin" and "Agent" were created with
is_default=true, which made RoleRepository.get_default_role() return whichever
row the database happened to yield first — an invited user could land on Admin.
Nothing in the API enforces a single default, so the repair is data-only.

The repair CLEARS Admin, which is what leaves Agent as the default. Setting
is_default=false on Agent instead would do the opposite of what is wanted: it
would leave Admin as the sole default and hand every newly invited user full
permissions.
"""

from alembic import op

# revision identifiers, used by Alembic.
revision = 'b7c4e91a2d38'
down_revision = 'add_customer_phone_001'
branch_labels = None
depends_on = None


NEW_PERMISSIONS = (
    ('view_unassigned_chats', 'Can view unassigned AI chats'),
    ('view_people', 'Can view the people directory'),
)

# Which existing roles receive each new permission, expressed as the permissions
# a role must already hold. Capability, not role name: an org that renamed its
# agent role, or built its own, is still covered.
BACKFILL = (
    ('view_unassigned_chats', ('view_assigned_chats', 'view_all_chats', 'super_admin')),
    ('view_people', ('view_assigned_chats', 'view_all_chats', 'manage_all_chats', 'super_admin')),
)


def _sql_list(values) -> str:
    return ", ".join(f"'{value}'" for value in values)


def upgrade() -> None:
    for name, description in NEW_PERMISSIONS:
        op.execute(
            f"""
            INSERT INTO permissions (name, description)
            SELECT '{name}', '{description}'
            WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE name = '{name}')
            """
        )

    for new_permission, held_by in BACKFILL:
        op.execute(
            f"""
            INSERT INTO role_permissions (role_id, permission_id)
            SELECT DISTINCT r.id, target.id
            FROM roles r
            JOIN role_permissions rp ON rp.role_id = r.id
            JOIN permissions held ON held.id = rp.permission_id
            CROSS JOIN permissions target
            WHERE target.name = '{new_permission}'
              AND held.name IN ({_sql_list(held_by)})
              AND NOT EXISTS (
                  SELECT 1 FROM role_permissions existing
                  WHERE existing.role_id = r.id
                    AND existing.permission_id = target.id
              )
            """
        )

    # One default role per organization. Clearing Admin is what PROMOTES Agent
    # to sole default — the opposite spelling (clearing Agent) would leave
    # Admin default and make every invited user an admin.
    #
    # The COUNT(*) > 1 guard is load-bearing: it means an org whose only
    # default is Admin keeps it, rather than being left with no default role
    # at all. An org that renamed its Admin role keeps both defaults — the
    # pre-existing ambiguity, not a regression.
    op.execute(
        """
        UPDATE roles SET is_default = false
        WHERE name = 'Admin'
          AND is_default = true
          AND organization_id IN (
              SELECT organization_id FROM roles
              WHERE is_default = true
              GROUP BY organization_id
              HAVING COUNT(*) > 1
          )
        """
    )


def downgrade() -> None:
    # Drop the grants first (FK), then the permissions themselves. is_default is
    # not restored: the pre-migration state was ambiguous by definition.
    op.execute(
        """
        DELETE FROM role_permissions
        WHERE permission_id IN (
            SELECT id FROM permissions
            WHERE name IN ('view_unassigned_chats', 'view_people')
        )
        """
    )
    op.execute(
        """
        DELETE FROM permissions
        WHERE name IN ('view_unassigned_chats', 'view_people')
        """
    )
