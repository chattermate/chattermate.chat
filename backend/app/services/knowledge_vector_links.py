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

Keeps the agent_id list inside the vector store in step with the relational
knowledge_to_agents links.

Retrieval filters on `filters->'agent_id'`, so a link row that never reaches the
vector store is invisible to the agent: the dashboard shows the source as linked
while the agent cannot retrieve a single chunk of it. Both directions live here
so link and unlink cannot drift apart.
"""

import json
from typing import List, Optional
from uuid import UUID

from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.logger import get_logger
from app.models.knowledge import Knowledge

logger = get_logger(__name__)

# Every caller-influenced value is bound as a query parameter. The JSON payloads
# embed knowledge.source (a user-supplied title) and json.dumps does not escape
# single quotes, so interpolating them into a '...'::jsonb literal would allow
# SQL injection. Only the system-derived schema/table identifiers are inlined.
#
# CAST(:x AS jsonb), never :x::jsonb — SQLAlchemy's text() bind-parameter regex
# has a negative lookahead on ':', so a parameter immediately followed by the
# '::' cast operator is not recognised as a parameter at all. It reaches the
# driver as a literal ':new_filters' and Postgres rejects it with
# `syntax error at or near ":"`.
_UPDATE_SQL = """
    UPDATE {schema}."{table}"
    SET
        filters = CAST(:new_filters AS jsonb),
        meta_data = CASE
            WHEN meta_data IS NULL THEN
                CASE WHEN :has_agents THEN jsonb_build_object('agent_id', CAST(:agent_ids AS jsonb))
                     ELSE NULL END
            WHEN meta_data ? 'agent_id' THEN
                jsonb_set(meta_data, '{{agent_id}}', CAST(:agent_ids AS jsonb))
            ELSE
                meta_data || jsonb_build_object('agent_id', CAST(:agent_ids AS jsonb))
        END
    WHERE name = :source
"""


def agent_ids_for(knowledge: Knowledge) -> List[str]:
    """The agent ids linked to a knowledge source (for vector filters)."""
    return [str(link.agent_id) for link in knowledge.agent_links]


def get_linked_agent_ids(db: Session, knowledge: Knowledge) -> Optional[List[str]]:
    """Agent ids currently recorded in the vector store for this source.

    Returns None when the source has no rows in the vector table yet (nothing to
    sync — the chunks have not been written), which callers must distinguish
    from an empty list (rows exist, no agents linked).
    """
    if not knowledge.table_name or not knowledge.schema:
        return None

    row = db.execute(
        text(
            f'SELECT filters FROM {knowledge.schema}."{knowledge.table_name}" '
            "WHERE name = :source LIMIT 1"
        ),
        {"source": knowledge.source},
    ).first()

    if row is None:
        return None

    filters = row.filters or {}
    agent_ids = filters.get("agent_id") or []
    # Defensive: the column is caller-adjacent JSON, so a non-list here would
    # otherwise propagate a bad type into the rewritten filters.
    return [str(a) for a in agent_ids] if isinstance(agent_ids, list) else []


def sync_agent_ids(db: Session, knowledge: Knowledge, agent_ids: List[str]) -> None:
    """Rewrite filters/meta_data for every chunk of `knowledge` to `agent_ids`.

    Does not commit — the caller owns the transaction so the link row and this
    update land together.
    """
    if not knowledge.table_name or not knowledge.schema:
        return

    # Order-independent de-duplication; sorted so repeated syncs are idempotent
    # and the stored JSON does not churn.
    unique_ids = sorted(set(agent_ids))

    new_filters = {
        "name": knowledge.source,
        "org_id": str(knowledge.organization_id),
        "agent_id": unique_ids,
    }

    db.execute(
        text(_UPDATE_SQL.format(schema=knowledge.schema, table=knowledge.table_name)),
        {
            "source": knowledge.source,
            "new_filters": json.dumps(new_filters),
            "agent_ids": json.dumps(unique_ids),
            "has_agents": bool(unique_ids),
        },
    )
    logger.info(
        "Synced vector-store agent_id for knowledge source %s: %d agent(s)",
        knowledge.source,
        len(unique_ids),
    )


def add_agent(db: Session, knowledge: Knowledge, agent_uuid: UUID) -> None:
    """Add one agent to the vector-store filters, preserving the others."""
    current = get_linked_agent_ids(db, knowledge)
    if current is None:
        return
    sync_agent_ids(db, knowledge, current + [str(agent_uuid)])


def remove_agent(db: Session, knowledge: Knowledge, agent_uuid: UUID) -> None:
    """Remove one agent from the vector-store filters, preserving the others."""
    current = get_linked_agent_ids(db, knowledge)
    if current is None:
        return
    sync_agent_ids(db, knowledge, [a for a in current if a != str(agent_uuid)])
