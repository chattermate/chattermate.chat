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

One-off backfill: encrypt conversation content written before encryption at rest.

New rows are already encrypted by the application; this walks the rows that predate
it. Safe to run against a live database, restartable after a Ctrl-C, and idempotent —
already-encrypted rows are skipped, so re-running it costs one scan and changes
nothing.

Run it on the HOST, not inside the backend container:

    DATABASE_URL=postgresql://... ENCRYPTION_KEY=... \
        python backend/scripts/encrypt_chat_at_rest.py --dry-run

Importing the `app` package would pull in the FastAPI app and the whole ML stack
(and has OOM'd production before), so app/core/encryption.py is loaded directly by
file path — the crypto logic itself is never duplicated here.
"""

import argparse
import importlib.util
import os
import re
import sys
from pathlib import Path
from types import ModuleType

import psycopg
from psycopg.types.json import Jsonb

BACKEND_DIR = Path(__file__).resolve().parent.parent
DEFAULT_BATCH_SIZE = 500

TEXT = "text"
JSON = "json"

# What to encrypt, one entry per table so each is scanned once.
# (table, primary key, columns, kind) — kind picks the "already encrypted" test and
# the value transform, which is all that differs between text and JSONB columns.
TARGETS = (
    ("chat_history", "id", ("message",), TEXT),
    ("session_to_agents", "session_id",
     ("transfer_description", "end_chat_description", "ticket_summary",
      "ticket_description"), TEXT),
    # The agno agent memory blob. agno's PostgresStorage defaults to the "ai"
    # schema, and app.agents.encrypted_storage does not override it, so the table
    # is ai.agent_sessions — schema-qualified here or to_regclass won't find it.
    ("ai.agent_sessions", "session_id", ("memory",), JSON),
    # Guardrail review excerpts: the snippet of the message that tripped a rule,
    # encrypted like any other visitor text. Included so the table is covered if
    # excerpts are ever written before the column type lands on an environment.
    ("guardrail_events", "id", ("excerpt",), TEXT),
    # Integration tokens. Alembic revision integration_secrets_001 encrypts these
    # on deploy; listed so a re-run catches any row written by an older process
    # during the rollout. mcp_tools.env_vars / headers are encrypted by that
    # revision too but are `json`, not `jsonb`, so this script's JSON path
    # (jsonb_exists) does not apply to them.
    ("shopify_shops", "id", ("access_token",), TEXT),
    ("jira_tokens", "id", ("access_token", "refresh_token"), TEXT),
)


def _load_module(name: str, path: Path) -> ModuleType:
    spec = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(spec)
    sys.modules[name] = module
    spec.loader.exec_module(module)
    return module


def load_encryption() -> ModuleType:
    """Load app.core.encryption without importing the `app` package.

    Its two dependencies (logger, config) are light — the weight is in app/__init__,
    which imports the FastAPI app — so they are registered under their real names
    and the import inside encryption.py resolves against these.
    """
    for pkg in ("app", "app.core"):
        if pkg not in sys.modules:
            stub = ModuleType(pkg)
            stub.__path__ = []
            sys.modules[pkg] = stub
    core = BACKEND_DIR / "app" / "core"
    _load_module("app.core.logger", core / "logger.py")
    _load_module("app.core.config", core / "config.py")
    return _load_module("app.core.encryption", core / "encryption.py")


def _plaintext_predicate(crypto, column, kind):
    """SQL fragment + parameter matching a value this run still has to encrypt."""
    if kind == TEXT:
        return f"{column} NOT LIKE %s", crypto.ENCRYPTED_PREFIX + crypto.SEPARATOR + "%"
    # jsonb_exists() rather than the ? operator, which reads as a placeholder.
    return f"NOT jsonb_exists({column}, %s)", crypto.JSON_MARKER


def _encrypt(crypto, value, kind):
    if value is None:
        return None
    return crypto.encrypt_value(value) if kind == TEXT else Jsonb(crypto.encrypt_json(value))


def _table_exists(conn, table) -> bool:
    """agent_sessions is created lazily by agno on the first agent run, so a fresh
    or agent-less database legitimately lacks it — skip rather than crash."""
    with conn.cursor() as cur:
        cur.execute("SELECT to_regclass(%s)", (table,))
        return cur.fetchone()[0] is not None


def backfill(conn, crypto, table, pk, columns, kind, batch_size, dry_run) -> int:
    """Encrypt every plaintext value across one table's columns in a single pass.

    Keyset pagination on the primary key with a commit per batch: restartable after
    an interruption, and never more than batch_size rows in memory.
    """
    predicates, predicate_params = zip(
        *(_plaintext_predicate(crypto, column, kind) for column in columns))
    # A row needs work if ANY of its columns is still plaintext.
    needs_work = " OR ".join(f"({column} IS NOT NULL AND {p})"
                             for column, p in zip(columns, predicates))
    selected = ", ".join(columns)
    assignments = ", ".join(f"{column} = %s" for column in columns)

    changed = 0
    last_pk = None

    while True:
        where, params = f"({needs_work})", list(predicate_params)
        if last_pk is not None:
            where += f" AND {pk} > %s"
            params.append(last_pk)

        with conn.cursor() as cur:
            cur.execute(
                f"SELECT {pk}, {selected} FROM {table} WHERE {where} "
                f"ORDER BY {pk} LIMIT %s",
                (*params, batch_size),
            )
            rows = cur.fetchall()

            if not rows:
                break
            last_pk = rows[-1][0]

            if not dry_run:
                cur.executemany(
                    f"UPDATE {table} SET {assignments} WHERE {pk} = %s",
                    [(*[_encrypt(crypto, value, kind) for value in values], key)
                     for key, *values in rows],
                )
                conn.commit()

        changed += len(rows)
        print(f"  {table}: {changed} rows", flush=True)

    return changed


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--dry-run", action="store_true",
                        help="report how many rows would be encrypted, change nothing")
    parser.add_argument("--batch-size", type=int, default=DEFAULT_BATCH_SIZE,
                        help=f"rows per transaction (default {DEFAULT_BATCH_SIZE})")
    args = parser.parse_args()

    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        print("DATABASE_URL is not set", file=sys.stderr)
        return 1
    # The app's URL carries a SQLAlchemy driver suffix (postgresql+psycopg://) that
    # libpq — and therefore psycopg.connect — does not understand. Strip it.
    database_url = re.sub(r"^(postgresql|postgres)\+\w+://", r"\1://", database_url)
    crypto = load_encryption()
    # Belt and braces: the module raises on a missing key outside development, but a
    # host that happens to export ENVIRONMENT=development would get a generated key,
    # and encrypting live data with a throwaway key destroys it.
    if not os.getenv(crypto.ENCRYPTION_KEY_ENV):
        print(f"{crypto.ENCRYPTION_KEY_ENV} is not set — refusing to encrypt with a "
              "generated key", file=sys.stderr)
        return 1

    total = 0

    with psycopg.connect(database_url) as conn:
        for table, pk, columns, kind in TARGETS:
            if not _table_exists(conn, table):
                print(f"  {table}: table not present, skipping", flush=True)
                continue
            total += backfill(conn, crypto, table, pk, columns, kind,
                              args.batch_size, args.dry_run)

    verb = "would encrypt" if args.dry_run else "encrypted"
    print(f"{verb} {total} rows")
    return 0


if __name__ == "__main__":
    sys.exit(main())
