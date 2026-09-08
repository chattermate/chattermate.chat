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

"""
ChatterMate - Guardrailed DB toolkit: the system-prompt table catalogue.

The investigator's first move used to be list_database_tables, spending one of
its max_tool_calls_per_run just to learn which tables exist. The catalogue is
now front-loaded into the toolkit's instructions (#318).
"""

import pytest

from app.services.db_connector_service import DBConnectorConfig
from app.tools.guardrailed_db_toolkit import MAX_CATALOGUE_CHARS, GuardrailedDBTools


def _config(name="prod", tables=None, row_scope=None, engine="postgresql"):
    return DBConnectorConfig(
        id=None, organization_id=None, name=name, engine=engine,
        host="h", port=5432, database="d", username="u", password="p",
        allowed_tables=tables if tables is not None else ["public.orders", "public.users"],
        row_scope=row_scope or {},
    )


def test_catalogue_names_each_connector_its_engine_and_its_tables():
    toolkit = GuardrailedDBTools([_config()])

    assert toolkit.add_instructions is True
    assert "prod [postgresql]" in toolkit.instructions
    assert "public.orders" in toolkit.instructions
    assert "public.users" in toolkit.instructions


def test_catalogue_carries_the_row_scope_annotation():
    """The agent must not waste a call trying to widen a scoped table."""
    toolkit = GuardrailedDBTools(
        [_config(row_scope={"public.orders": "customer_email"})]
    )

    assert "auto-scoped to this ticket's customer by customer_email" in toolkit.instructions


@pytest.mark.asyncio
async def test_the_tool_still_returns_exactly_what_the_prompt_carries():
    """list_database_tables is a registered tool the model already calls; the
    sync/async split must not have changed a byte of its output."""
    toolkit = GuardrailedDBTools([_config()])

    catalogue = toolkit._source_catalogue()
    assert await toolkit.list_database_tables() == catalogue
    assert catalogue in toolkit.instructions


def test_no_connectors_means_no_instructions():
    """The toolkit is only built when there is at least one config, but an
    empty catalogue must never reach the prompt as noise."""
    toolkit = GuardrailedDBTools([])

    assert toolkit.instructions is None
    assert toolkit.add_instructions is False


def test_a_huge_allowlist_is_capped_on_a_line_boundary():
    """A mid-name cut would leave a half-written table the model would try to
    query, wasting exactly the call this catalogue is meant to save."""
    toolkit = GuardrailedDBTools([
        _config(name="a", tables=[f"public.table_{i}" for i in range(400)]),
        _config(name="b", tables=["public.orders"]),
    ])

    assert len(toolkit.instructions) < MAX_CATALOGUE_CHARS + 400
    assert "list truncated" in toolkit.instructions
    # Every surviving line is a whole one, never a severed table name.
    for line in toolkit.instructions.splitlines():
        assert not line.endswith("public.table_") and not line.endswith("public.tabl")


def test_a_broken_row_scope_costs_the_catalogue_not_the_toolkit():
    """_build_db_tools turns any constructor exception into "no database tools
    at all" — so a bad row must degrade to one extra tool call instead."""
    broken = _config()
    broken.row_scope = "not-a-dict"

    toolkit = GuardrailedDBTools([broken])

    assert toolkit.instructions is None
    assert toolkit.add_instructions is False
    # The tools themselves are still registered and usable.
    assert {"list_database_tables", "describe_database_table", "query_database"} <= set(
        toolkit.functions
    )
