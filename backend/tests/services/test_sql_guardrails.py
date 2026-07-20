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

Injection corpus for the DB-connector SQL guardrails. Every mutation path,
smuggling trick and resource-abuse vector here must stay blocked.
"""

import pytest

from app.services.sql_guardrails import MASK_VALUE, mask_rows, validate_sql

ALLOWED = ["public.orders", "public.customers", "billing.invoices"]


def check(sql, allowed=ALLOWED, max_rows=100, engine="postgresql", masked=None):
    return validate_sql(sql, allowed, max_rows, engine, masked_columns=masked)


class TestAllowedSelects:
    def test_simple_select(self):
        result = check("SELECT id, status FROM orders WHERE id = 42")
        assert result.ok
        assert "LIMIT 100" in result.sql

    def test_schema_qualified(self):
        assert check("SELECT * FROM billing.invoices").ok

    def test_join_of_allowed_tables(self):
        result = check(
            "SELECT o.id FROM orders o JOIN customers c ON c.id = o.customer_id"
        )
        assert result.ok

    def test_cte_over_allowed_tables(self):
        result = check(
            "WITH recent AS (SELECT * FROM orders WHERE created_at > now() - interval '1 day') "
            "SELECT count(*) FROM recent"
        )
        assert result.ok

    def test_subquery(self):
        assert check(
            "SELECT * FROM orders WHERE customer_id IN (SELECT id FROM customers)"
        ).ok

    def test_existing_smaller_limit_kept(self):
        result = check("SELECT id FROM orders LIMIT 5")
        assert result.ok
        assert "LIMIT 5" in result.sql

    def test_oversized_limit_clamped(self):
        result = check("SELECT id FROM orders LIMIT 500000")
        assert result.ok
        assert "LIMIT 100" in result.sql
        assert "500000" not in result.sql


class TestMutationsBlocked:
    @pytest.mark.parametrize(
        "sql",
        [
            "UPDATE orders SET status = 'paid'",
            "DELETE FROM orders",
            "INSERT INTO orders (id) VALUES (1)",
            "DROP TABLE orders",
            "TRUNCATE orders",
            "CREATE TABLE x (id int)",
            "ALTER TABLE orders ADD COLUMN x int",
            "GRANT ALL ON orders TO public",
            "MERGE INTO orders USING customers ON true WHEN MATCHED THEN UPDATE SET status='x'",
        ],
    )
    def test_blocked(self, sql):
        assert not check(sql).ok

    def test_multi_statement(self):
        assert not check("SELECT 1; DROP TABLE orders").ok

    def test_stacked_after_comment(self):
        assert not check("SELECT id FROM orders; -- x\nDELETE FROM orders").ok

    def test_select_into(self):
        assert not check("SELECT * INTO evil FROM orders").ok

    def test_select_for_update(self):
        assert not check("SELECT * FROM orders FOR UPDATE").ok


class TestTableSmuggling:
    def test_unlisted_table(self):
        assert not check("SELECT * FROM users").ok

    def test_unlisted_in_join(self):
        assert not check("SELECT * FROM orders JOIN users ON true").ok

    def test_unlisted_in_subquery(self):
        assert not check(
            "SELECT * FROM orders WHERE id IN (SELECT order_id FROM secrets)"
        ).ok

    def test_unlisted_inside_cte_body(self):
        # The classic smuggle: hide the real table inside a CTE definition.
        assert not check(
            "WITH x AS (SELECT * FROM pg_shadow) SELECT * FROM x"
        ).ok

    def test_cte_alias_cannot_authorize_schema_reference(self):
        assert not check(
            "WITH users AS (SELECT 1) SELECT * FROM secret_schema.users"
        ).ok

    def test_union_smuggle_blocked_at_top_level(self):
        assert not check("SELECT id FROM orders UNION SELECT usename FROM pg_shadow").ok

    def test_union_inside_subquery_still_walked(self):
        assert not check(
            "SELECT * FROM (SELECT id FROM orders UNION ALL SELECT oid FROM pg_shadow) t"
        ).ok

    def test_system_catalog(self):
        assert not check("SELECT * FROM information_schema.tables").ok

    def test_bare_name_matches_public_schema_entry(self):
        assert check("SELECT * FROM invoices", allowed=["public.invoices"]).ok

    def test_wrong_schema_same_name(self):
        assert not check("SELECT * FROM hidden.orders").ok


class TestFunctionDenylist:
    @pytest.mark.parametrize(
        "sql",
        [
            "SELECT pg_sleep(10) FROM orders",
            "SELECT pg_read_file('/etc/passwd') FROM orders",
            "SELECT * FROM orders WHERE id = (SELECT pg_terminate_backend(1))",
            "SELECT set_config('x', 'y', false) FROM orders",
            "SELECT lo_import('/etc/passwd') FROM orders",
        ],
    )
    def test_postgres_functions(self, sql):
        assert not check(sql).ok

    @pytest.mark.parametrize(
        "sql",
        [
            "SELECT sleep(10) FROM orders",
            "SELECT benchmark(1000000, md5('x')) FROM orders",
            "SELECT load_file('/etc/passwd') FROM orders",
        ],
    )
    def test_mysql_functions(self, sql):
        assert not check(sql, engine="mysql").ok


class TestMaskedColumns:
    def test_direct_reference_blocked(self):
        assert not check("SELECT email FROM customers", masked=["email"]).ok

    def test_alias_smuggle_blocked(self):
        assert not check("SELECT email AS harmless FROM customers", masked=["email"]).ok

    def test_expression_smuggle_blocked(self):
        assert not check(
            "SELECT substr(email, 1, 3) FROM customers", masked=["email"]
        ).ok

    def test_where_probe_blocked(self):
        assert not check(
            "SELECT id FROM customers WHERE email = 'a@b.c'", masked=["email"]
        ).ok

    def test_unmasked_columns_fine(self):
        assert check("SELECT id, full_name FROM customers", masked=["email"]).ok

    @pytest.mark.parametrize(
        "sql",
        [
            # Whole-row serialization collapses masked fields into one value
            # that name-based masking can't see — all must be blocked.
            "SELECT to_jsonb(t) FROM customers t",
            "SELECT row_to_json(customers) FROM customers",
            "SELECT customers FROM customers",
            "SELECT array_agg(customers) FROM customers",
            "SELECT hstore(customers) FROM customers",
            "SELECT CAST(customers AS text) FROM customers",
            "SELECT customers::text FROM customers",
            "SELECT to_json(c.*) FROM customers c",
            "SELECT (c.*)::text FROM customers c",
        ],
    )
    def test_whole_row_serialization_blocked(self, sql):
        assert not check(sql, masked=["email"]).ok

    def test_whole_row_allowed_without_masking(self):
        # No masked columns → whole-row serialization is fine.
        assert check("SELECT to_jsonb(t) FROM customers t", masked=[]).ok

    def test_star_and_count_still_allowed_with_masking(self):
        # SELECT * / t.* expand to real column names (mask_rows redacts them);
        # count(*) is a cardinality marker, not row data.
        assert check("SELECT * FROM customers", masked=["email"]).ok
        assert check("SELECT c.* FROM customers c", masked=["email"]).ok
        assert check("SELECT count(*) FROM customers", masked=["email"]).ok
        assert check("SELECT array_agg(id) FROM customers", masked=["email"]).ok

    def test_mask_rows_output(self):
        rows = mask_rows(
            ["id", "Email", "name"],
            [(1, "a@b.c", "Ann"), (2, "c@d.e", "Cy")],
            ["email"],
        )
        assert rows[0] == (1, MASK_VALUE, "Ann")
        assert rows[1][1] == MASK_VALUE

    def test_mask_rows_no_masked_columns(self):
        rows = [(1, "x")]
        assert mask_rows(["id", "v"], rows, []) == rows


class TestEdgeCases:
    def test_garbage(self):
        assert not check("DRIBBLE FRUM x!!!").ok

    def test_empty(self):
        assert not check("").ok

    def test_empty_allowlist(self):
        assert not check("SELECT 1", allowed=[]).ok

    def test_canonical_rerender(self):
        # Whatever executes came from the AST, not the raw string.
        result = check("select  id \n from orders /* comment */ where id=1")
        assert result.ok
        assert "/*" not in result.sql


ROW_SCOPE = {"public.orders": "customer_email", "public.customers": "email"}
OWNER = "arun@chattermate.chat"


def scoped(sql, scope=None, value=OWNER, allowed=ALLOWED, masked=None):
    return validate_sql(
        sql, allowed, 100, "postgresql",
        masked_columns=masked,
        row_scope=ROW_SCOPE if scope is None else scope,
        scope_value=value,
    )


class TestRowScoping:
    """Scoped tables are rewritten into a pre-filtered subquery, so the rows
    the agent can see are constrained by the relation, not by its own WHERE."""

    def test_scoped_table_is_wrapped(self):
        result = scoped("SELECT id, total FROM orders")
        assert result.ok
        assert "customer_email = '%s'" % OWNER in result.sql
        assert "FROM (SELECT * FROM orders WHERE" in result.sql

    def test_alias_is_preserved(self):
        result = scoped("SELECT o.id FROM orders o WHERE o.total > 10")
        assert result.ok
        assert ") AS o" in result.sql
        assert "o.total > 10" in result.sql

    def test_unscoped_table_untouched(self):
        result = validate_sql(
            "SELECT id FROM billing.invoices", ALLOWED, 100, "postgresql",
            row_scope=ROW_SCOPE, scope_value=OWNER,
        )
        assert result.ok
        assert "WHERE" not in result.sql.upper().replace("LIMIT", "")

    def test_or_true_cannot_widen_the_scope(self):
        # The classic bypass: the outer predicate is irrelevant because the
        # relation it selects from was already filtered.
        result = scoped("SELECT id FROM orders WHERE 1=1 OR customer_email = 'victim@x.com'")
        assert result.ok
        assert "FROM (SELECT * FROM orders WHERE customer_email = '%s')" % OWNER in result.sql

    def test_join_scopes_every_scoped_table(self):
        result = scoped(
            "SELECT o.id, c.name FROM orders o JOIN customers c ON c.id = o.customer_id"
        )
        assert result.ok
        assert result.sql.count("customer_email = '%s'" % OWNER) == 1
        assert "email = '%s'" % OWNER in result.sql

    def test_cte_body_is_scoped(self):
        result = scoped("WITH recent AS (SELECT * FROM orders) SELECT id FROM recent")
        assert result.ok
        assert "customer_email = '%s'" % OWNER in result.sql

    def test_subquery_is_scoped(self):
        result = scoped("SELECT id FROM orders WHERE id IN (SELECT id FROM orders)")
        assert result.ok
        assert result.sql.count("customer_email = '%s'" % OWNER) == 2

    def test_fails_closed_without_a_scope_value(self):
        # Never silently unscoped — that would read every customer's rows.
        for value in (None, "", "   "):
            result = scoped("SELECT id FROM orders", value=value)
            assert not result.ok
            assert "no customer identity" in result.reason

    def test_unscoped_table_still_queryable_without_a_value(self):
        result = scoped("SELECT id FROM billing.invoices", value=None)
        assert result.ok

    def test_scope_value_is_escaped_not_interpolated(self):
        result = scoped("SELECT id FROM orders", value="x' OR '1'='1")
        assert result.ok
        # Doubled quotes — the value stays one string literal.
        assert "'x'' OR ''1''=''1'" in result.sql

    def test_no_scope_config_is_a_no_op(self):
        result = scoped("SELECT id FROM orders", scope={}, value=None)
        assert result.ok
        assert "SELECT id FROM orders" in result.sql

    def test_bare_reference_matches_qualified_rule(self):
        # Rule is on "public.orders"; the query says "orders".
        result = scoped("SELECT id FROM public.orders")
        assert result.ok
        assert "customer_email = '%s'" % OWNER in result.sql

    def test_masked_columns_still_enforced_under_scoping(self):
        result = scoped("SELECT email FROM orders", masked=["email"])
        assert not result.ok
        assert "masked" in result.reason.lower()

    def test_limit_applies_to_the_outer_query(self):
        result = scoped("SELECT id FROM orders")
        assert result.ok
        assert result.sql.rstrip().endswith("LIMIT 100")
