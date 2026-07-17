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
