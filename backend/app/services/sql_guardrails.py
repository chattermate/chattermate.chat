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

SQL guardrails for the AI ticket investigator's database connector.

The model's SQL is untrusted input. Every guarantee here is enforced OUTSIDE
the model, on the parsed AST (sqlglot):

- exactly one statement, and it must be a plain SELECT (no INTO, no locking)
- every referenced table — including inside CTEs, subqueries, joins and
  unions — must be on the connector's explicit allowlist
- dangerous functions (sleep/file/network/admin) are denied
- a LIMIT is always enforced (added or clamped to the connector's max_rows)
- row-scoped tables are rewritten into a subquery pre-filtered to the ticket
  customer's own rows, so the agent cannot read across customers
- the statement is re-rendered from the AST, so only canonical SQL executes

The executor adds the second, independent barrier: a read-only transaction
with a statement timeout. Column masking happens on the result rows.
"""

from dataclasses import dataclass
from typing import Iterable, List, Optional, Sequence

import sqlglot
from sqlglot import exp

MASK_VALUE = "***MASKED***"

# Time-wasting, file, network and admin functions. The read-only transaction
# already blocks writes — this denylist is defense-in-depth against DoS and
# data exfiltration via server-side functions.
BLOCKED_FUNCTIONS = {
    # postgres
    "pg_sleep", "pg_sleep_for", "pg_sleep_until",
    "pg_read_file", "pg_read_binary_file", "pg_ls_dir", "pg_stat_file",
    "pg_terminate_backend", "pg_cancel_backend", "pg_reload_conf",
    "pg_rotate_logfile", "set_config", "pg_promote",
    "dblink", "dblink_exec", "dblink_connect", "dblink_connect_u",
    "lo_import", "lo_export",
    "query_to_xml", "database_to_xml", "table_to_xml",
    "pg_logical_slot_get_changes", "pg_logical_slot_peek_changes",
    "pg_create_logical_replication_slot", "pg_drop_replication_slot",
    # mysql
    "sleep", "benchmark", "load_file", "get_lock", "release_lock",
    "master_pos_wait", "sys_eval", "sys_exec",
}

# Statement/expression node types that must never appear anywhere in the tree.
BLOCKED_NODE_TYPES = (
    exp.Insert, exp.Update, exp.Delete, exp.Merge,
    exp.Create, exp.Drop, exp.Alter, exp.TruncateTable,
    exp.Grant, exp.Command, exp.Transaction, exp.Set,
    exp.Into, exp.Lock,
)

# Default schema names: a bare table reference resolves to these, so an
# allowlist entry "public.orders" also authorizes "orders".
DEFAULT_SCHEMAS = {"public", "dbo"}

_DIALECTS = {"postgresql": "postgres", "postgres": "postgres", "mysql": "mysql"}


@dataclass
class SqlValidationResult:
    ok: bool
    sql: Optional[str] = None       # canonical SQL, only when ok
    reason: Optional[str] = None    # block reason, only when not ok


def _normalize_allowlist(allowed_tables: Iterable[str]) -> set:
    """Expand allowlist entries so both qualified and bare references match
    when the schema is a default one."""
    allowed = set()
    for entry in allowed_tables or []:
        entry = (entry or "").strip().lower()
        if not entry:
            continue
        allowed.add(entry)
        if "." in entry:
            schema, _, name = entry.rpartition(".")
            if schema in DEFAULT_SCHEMAS:
                allowed.add(name)
    return allowed


def _table_reference(table: exp.Table) -> str:
    name = (table.name or "").lower()
    if table.db:
        return f"{table.db.lower()}.{name}"
    return name


def _cte_names(statement: exp.Expression) -> set:
    return {cte.alias_or_name.lower() for cte in statement.find_all(exp.CTE)}


def _blocked_function(statement: exp.Expression) -> Optional[str]:
    for func in statement.find_all(exp.Func):
        name = (func.sql_name() or "").lower()
        if name in BLOCKED_FUNCTIONS:
            return name
        if isinstance(func, exp.Anonymous):
            anon = (func.name or "").lower()
            if anon in BLOCKED_FUNCTIONS:
                return anon
    return None


def normalize_scope_map(row_scope: Optional[dict]) -> dict:
    """Expand row-scope entries the same way as the allowlist, so a rule on
    "public.orders" also binds a bare "orders" reference."""
    scoped = {}
    for raw_table, raw_column in (row_scope or {}).items():
        table = (raw_table or "").strip().lower()
        column = (raw_column or "").strip()
        if not table or not column:
            continue
        scoped[table] = column
        if "." in table:
            schema, _, name = table.rpartition(".")
            if schema in DEFAULT_SCHEMAS:
                scoped.setdefault(name, column)
    return scoped


def _apply_row_scope(
    statement: exp.Select,
    scoped: dict,
    scope_value: Optional[str],
    cte_names: set,
) -> tuple:
    """Rewrite every scoped base table into a pre-filtered subquery:

        FROM orders o  ->  FROM (SELECT * FROM orders WHERE email = 'x') AS o

    Filtering the *relation* rather than checking the model's WHERE clause is
    what makes this unbypassable. Whatever the model writes outside — OR 1=1,
    a UNION arm, a correlated subquery — it can only ever see rows the wrapper
    already returned. Validating a model-supplied predicate instead would mean
    proving that no OR, no join and no outer reference widens it, which is not
    a thing you can check reliably.

    Returns (statement, error). Fails closed: a scoped table with no value to
    scope by is refused, never silently unscoped.
    """
    targets = []
    for table in statement.find_all(exp.Table):
        reference = _table_reference(table)
        if not reference:
            continue
        if not table.db and reference in cte_names:
            continue
        column = scoped.get(reference)
        if column is None and table.name:
            column = scoped.get(table.name.lower())
        if column:
            targets.append((table, column))

    if not targets:
        return statement, None

    if not (scope_value or "").strip():
        return None, (
            "This table is restricted to the rows of the ticket's own customer, "
            "and this ticket has no customer identity to scope by. Set the "
            "ticket's customer, or query a table that is not customer-scoped."
        )

    for table, column in targets:
        alias_name = table.alias or table.name
        inner_table = table.copy()
        inner_table.set("alias", None)
        inner = (
            exp.Select()
            .select(exp.Star())
            .from_(inner_table)
            .where(
                exp.EQ(
                    this=exp.Column(this=exp.to_identifier(column)),
                    # Literal.string escapes on render — never string-format a
                    # value into SQL.
                    expression=exp.Literal.string(scope_value),
                )
            )
        )
        table.replace(
            exp.Subquery(this=inner, alias=exp.TableAlias(this=exp.to_identifier(alias_name)))
        )
    return statement, None


def _force_limit(statement: exp.Select, max_rows: int) -> exp.Select:
    """Add a LIMIT, or clamp an existing numeric one, to max_rows."""
    limit_node = statement.args.get("limit")
    if limit_node is not None:
        literal = limit_node.expression
        if isinstance(literal, exp.Literal) and literal.is_int:
            if int(literal.this) <= max_rows:
                return statement
    return statement.limit(max_rows, copy=False)


def validate_sql(
    raw_sql: str,
    allowed_tables: Sequence[str],
    max_rows: int,
    engine: str = "postgresql",
    masked_columns: Optional[Iterable[str]] = None,
    row_scope: Optional[dict] = None,
    scope_value: Optional[str] = None,
) -> SqlValidationResult:
    """Validate untrusted SQL against the connector policy. Returns canonical
    SQL to execute, or the reason it was blocked.

    row_scope maps a table to the column identifying the customer who owns the
    row ({"orders": "customer_email"}); scope_value is that customer's value
    for the ticket being investigated. Listed tables are rewritten so only
    their rows are visible."""
    dialect = _DIALECTS.get((engine or "").lower(), "postgres")
    if not (raw_sql or "").strip():
        return SqlValidationResult(ok=False, reason="Empty query")

    try:
        statements = sqlglot.parse(raw_sql, read=dialect)
    except sqlglot.errors.ParseError as e:
        return SqlValidationResult(ok=False, reason=f"SQL could not be parsed: {e}")

    statements = [s for s in statements if s is not None]
    if len(statements) != 1:
        return SqlValidationResult(
            ok=False, reason="Exactly one SQL statement is allowed"
        )
    statement = statements[0]

    if not isinstance(statement, exp.Select):
        return SqlValidationResult(
            ok=False,
            reason="Only plain SELECT statements are allowed "
            "(wrap set operations like UNION in a subquery)",
        )

    for node_type in BLOCKED_NODE_TYPES:
        found = statement.find(node_type)
        if found is not None:
            return SqlValidationResult(
                ok=False, reason=f"Disallowed SQL construct: {found.key.upper()}"
            )

    blocked_func = _blocked_function(statement)
    if blocked_func is not None:
        return SqlValidationResult(ok=False, reason=f"Disallowed function: {blocked_func}")

    allowed = _normalize_allowlist(allowed_tables)
    if not allowed:
        return SqlValidationResult(ok=False, reason="No tables are allowlisted for this connector")
    cte_names = _cte_names(statement)
    for table in statement.find_all(exp.Table):
        reference = _table_reference(table)
        if not reference:
            continue
        # References to CTE names defined in this query are fine — the CTE
        # bodies themselves are walked by this same loop.
        if not table.db and reference in cte_names:
            continue
        if reference not in allowed:
            return SqlValidationResult(
                ok=False, reason=f"Table not on the allowlist: {reference}"
            )

    # Masked columns may not be referenced at all — output-name masking alone
    # is alias-bypassable (SELECT email AS x), and blocking references also
    # prevents value probing via WHERE clauses. SELECT * and t.* stay allowed:
    # they expand to real column names that mask_rows redacts by name.
    masked = {c.strip().lower() for c in masked_columns or [] if c and c.strip()}
    if masked:
        # Names that denote a whole row when used as a bare value.
        scope_names = {t.name.lower() for t in statement.find_all(exp.Table) if t.name}
        scope_names |= {
            t.alias.lower() for t in statement.find_all(exp.Table) if t.alias
        }
        scope_names |= cte_names

        for column in statement.find_all(exp.Column):
            # A qualified/bare star (t.* or *) nested inside a function or cast
            # collapses the row into one value (to_jsonb(c.*), (c.*)::text),
            # defeating name-based masking — only a top-level projection star
            # is safe. Same for a bare Star node.
            if isinstance(column.this, exp.Star) and not isinstance(column.parent, exp.Select):
                return SqlValidationResult(
                    ok=False,
                    reason="Row expansion (t.*) inside an expression is not allowed with masked columns",
                )
            if (column.name or "").lower() in masked and not isinstance(column.this, exp.Star):
                return SqlValidationResult(
                    ok=False,
                    reason=f"Column '{column.name}' is masked and cannot be referenced",
                )
            # A bare (unqualified) reference to a table/alias/CTE name is a
            # whole-row value — SELECT customers, to_jsonb(c), c::text, row(c).
            # These serialize masked fields past name-based masking.
            if not column.table and (column.name or "").lower() in scope_names:
                return SqlValidationResult(
                    ok=False,
                    reason=(
                        f"Whole-row reference to '{column.name}' is not allowed with "
                        "masked columns — select individual columns instead"
                    ),
                )
        for star in statement.find_all(exp.Star):
            # Safe: top-level projection (SELECT *), the star of a t.* Column
            # node (handled above), and count(*) — a cardinality marker that
            # never exposes row values.
            if not isinstance(star.parent, (exp.Select, exp.Column, exp.Count)):
                return SqlValidationResult(
                    ok=False,
                    reason="Row expansion (*) inside an expression is not allowed with masked columns",
                )

    # Last, so the rewrite can't perturb the checks above: they inspect what
    # the model actually wrote, not the wrappers added on its behalf.
    scoped = normalize_scope_map(row_scope)
    if scoped:
        statement, scope_error = _apply_row_scope(
            statement, scoped, scope_value, cte_names
        )
        if scope_error is not None:
            return SqlValidationResult(ok=False, reason=scope_error)

    statement = _force_limit(statement, max_rows)
    # comments=False: comments are dropped from the canonical SQL — MySQL
    # executable comments (/*! ... */) must never reach the server.
    return SqlValidationResult(
        ok=True, sql=statement.sql(dialect=dialect, comments=False)
    )


def mask_rows(
    columns: List[str], rows: List[tuple], masked_columns: Iterable[str]
) -> List[tuple]:
    """Replace values of masked columns (matched by column name, case
    insensitive) so PII never reaches the model."""
    masked = {c.strip().lower() for c in masked_columns or [] if c and c.strip()}
    if not masked:
        return rows
    mask_indexes = {i for i, col in enumerate(columns) if col.lower() in masked}
    if not mask_indexes:
        return rows
    return [
        tuple(MASK_VALUE if i in mask_indexes else value for i, value in enumerate(row))
        for row in rows
    ]
