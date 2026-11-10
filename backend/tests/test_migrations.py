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

import importlib.util
from pathlib import Path

from alembic.config import Config
from alembic.script import ScriptDirectory

from app.database import Base
import app.models  # noqa: F401  (registers every table on Base)

BACKEND_DIR = Path(__file__).resolve().parents[1]


def test_migrations_have_a_single_head():
    """Two heads take production down: scripts/start.sh runs `alembic upgrade
    head`, which refuses to choose between them, so the container exits before
    gunicorn binds and restart-loops behind a 502.

    It happens when two branches each add a revision off the same parent — each
    PR is green alone and the branch only exists once both have merged, so
    reviewing either in isolation cannot catch it. This can.

    Fix by re-parenting the unapplied revision onto the other head (linear, no
    merge revision), or with a merge revision when both have already been
    applied somewhere.
    """
    heads = ScriptDirectory.from_config(
        Config(str(BACKEND_DIR / "alembic.ini"))
    ).get_heads()
    assert len(heads) == 1, f"expected one migration head, found: {heads}"


def _load_migration(name: str):
    path = BACKEND_DIR / "alembic" / "versions" / f"{name}.py"
    spec = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def test_erasure_fk_indexes_match_the_models():
    """The models declare the same indexes, under the same names, so a database
    made by create_all and one made by migrating agree, and autogenerate sees
    no drift."""
    migration = _load_migration("erasure_fk_indexes_001")
    for table, column in migration.FOREIGN_KEYS:
        names = {index.name for index in Base.metadata.tables[table].indexes
                 if [c.name for c in index.columns] == [column]}
        assert migration.index_name(table, column) in names, f"{table}.{column} has no index=True"
