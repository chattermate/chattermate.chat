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

Integration secrets — the Shopify and Jira tokens and the MCP connector
env vars / headers — are stored encrypted, and rows written before that
change still read.
"""

import importlib.util
import json
import uuid
from datetime import datetime, timedelta
from pathlib import Path

import pytest
from alembic.migration import MigrationContext
from alembic.operations import Operations
from sqlalchemy import create_engine, inspect, text
from sqlalchemy.pool import StaticPool

from app.core.encryption import JSON_MARKER, EncryptedJSON, decrypt_value, encrypt_json, encrypt_value, is_encrypted
from app.database import Base
from app.models.jira import JiraToken
from app.models.mcp_tool import MCPTool, MCPTransportType
from app.models.shopify.shopify_shop import ShopifyShop
from app.repositories.mcp_tool import MCPToolRepository

MIGRATION = Path(__file__).resolve().parents[2] / "alembic" / "versions" / "integration_secrets_001.py"
SECRET_ENV = {"GITHUB_TOKEN": "ghp_secret", "LOG_LEVEL": "info"}
SECRET_HEADERS = {"Authorization": "Bearer sk-live"}


def raw(db, sql, **params):
    return db.execute(text(sql), params).scalar()


def _jira(org_id, **overrides):
    values = dict(organization_id=org_id, access_token="jira-access", refresh_token="jira-refresh",
                  token_type="Bearer", expires_at=datetime.utcnow() + timedelta(hours=1),
                  cloud_id="cloud", site_url="https://x.atlassian.net")
    values.update(overrides)
    return JiraToken(**values)


def _mcp(org_id, **overrides):
    values = dict(name="GitHub", transport_type=MCPTransportType.STDIO, command="npx",
                  args=["-y", "server"], env_vars=dict(SECRET_ENV),
                  url=None, headers=dict(SECRET_HEADERS), organization_id=org_id)
    values.update(overrides)
    return MCPTool(**values)


class TestStoredEncrypted:
    def test_shopify_access_token(self, db, test_organization):
        shop = ShopifyShop(shop_domain="a.myshopify.com", access_token="shpat_live",
                           organization_id=test_organization.id)
        db.add(shop)
        db.commit()

        stored = raw(db, "SELECT access_token FROM shopify_shops")
        assert is_encrypted(stored) and "shpat_live" not in stored
        db.expire_all()
        assert db.query(ShopifyShop).one().access_token == "shpat_live"

    def test_jira_tokens(self, db, test_organization):
        db.add(_jira(test_organization.id))
        db.commit()

        row = db.execute(text("SELECT access_token, refresh_token FROM jira_tokens")).one()
        assert all(is_encrypted(v) for v in row)
        assert decrypt_value(row.refresh_token) == "jira-refresh"
        db.expire_all()
        token = db.query(JiraToken).one()
        assert (token.access_token, token.refresh_token) == ("jira-access", "jira-refresh")

    def test_mcp_env_vars_and_headers(self, db, test_organization):
        db.add(_mcp(test_organization.id))
        db.commit()

        env_raw = raw(db, "SELECT env_vars FROM mcp_tools")
        headers_raw = raw(db, "SELECT headers FROM mcp_tools")
        for stored in (env_raw, headers_raw):
            assert list(json.loads(stored)) == [JSON_MARKER]
        assert "ghp_secret" not in env_raw and "sk-live" not in headers_raw
        db.expire_all()
        tool = db.query(MCPTool).one()
        assert tool.env_vars == SECRET_ENV
        assert tool.headers == SECRET_HEADERS

    def test_an_update_through_the_repository_stays_encrypted(self, db, test_organization):
        tool = _mcp(test_organization.id)
        db.add(tool)
        db.commit()

        MCPToolRepository(db).update_mcp_tool(tool.id, env_vars={"GITHUB_TOKEN": "ghp_rotated"})

        assert "ghp_rotated" not in raw(db, "SELECT env_vars FROM mcp_tools")
        db.expire_all()
        assert db.query(MCPTool).one().env_vars == {"GITHUB_TOKEN": "ghp_rotated"}

    def test_empty_values_stay_empty(self, db, test_organization):
        db.add(ShopifyShop(shop_domain="b.myshopify.com", access_token=None))
        db.add(_mcp(test_organization.id, env_vars=None, headers=None))
        db.commit()
        db.expire_all()

        assert db.query(ShopifyShop).one().access_token is None
        tool = db.query(MCPTool).one()
        assert tool.env_vars is None and tool.headers is None


class TestRowsFromBeforeEncryption:
    """Until the migration reaches a row it is plaintext, and must still work."""

    def test_plaintext_tokens_read_as_they_are(self, db, test_organization):
        db.execute(text(
            "INSERT INTO shopify_shops (id, shop_domain, access_token, is_installed) "
            "VALUES ('s1', 'old.myshopify.com', 'shpat_old', 1)"))
        db.execute(text(
            "INSERT INTO jira_tokens (id, organization_id, access_token, refresh_token, token_type, "
            "expires_at, cloud_id, site_url) VALUES (1, :org, 'old-access', 'old-refresh', 'Bearer', "
            "'2030-01-01 00:00:00', 'c', 'https://x')"), {"org": test_organization.id.hex})
        db.execute(text(
            "INSERT INTO mcp_tools (id, name, transport_type, enabled, env_vars, headers, organization_id) "
            "VALUES (1, 'old', 'STDIO', 1, :env, :headers, :org)"),
            {"env": json.dumps(SECRET_ENV), "headers": json.dumps(SECRET_HEADERS), "org": test_organization.id.hex})
        db.commit()

        assert db.query(ShopifyShop).one().access_token == "shpat_old"
        token = db.query(JiraToken).one()
        assert (token.access_token, token.refresh_token) == ("old-access", "old-refresh")
        tool = db.query(MCPTool).one()
        assert tool.env_vars == SECRET_ENV and tool.headers == SECRET_HEADERS

    def test_writing_a_plaintext_row_back_encrypts_it(self, db):
        db.execute(text(
            "INSERT INTO shopify_shops (id, shop_domain, access_token, is_installed) "
            "VALUES ('s1', 'old.myshopify.com', 'shpat_old', 1)"))
        db.commit()

        shop = db.query(ShopifyShop).one()
        shop.access_token = "shpat_new"
        db.commit()

        assert decrypt_value(raw(db, "SELECT access_token FROM shopify_shops")) == "shpat_new"


class TestEncryptedJSONType:
    def test_round_trip_and_idempotence(self):
        column = EncryptedJSON()
        stored = column.process_bind_param({"k": "v"}, None)
        assert list(stored) == [JSON_MARKER]
        assert column.process_bind_param(stored, None) is stored  # never double-encrypted
        assert column.process_result_value(stored, None) == {"k": "v"}
        assert column.process_result_value({"plain": 1}, None) == {"plain": 1}
        assert column.process_bind_param(None, None) is None


# --- The migration, forward and back -----------------------------------------

def _load_migration():
    spec = importlib.util.spec_from_file_location("integration_secrets_001", MIGRATION)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


@pytest.fixture
def legacy_db():
    """A database as it stood at journeys_001: the three tables, plaintext rows,
    and no compliance table yet."""
    engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
    with engine.begin() as conn:
        for name in ("shopify_shops", "jira_tokens", "mcp_tools"):
            Base.metadata.tables[name].create(conn)
        conn.execute(text(
            "INSERT INTO shopify_shops (id, shop_domain, access_token, is_installed) VALUES "
            "('s1', 'old.myshopify.com', 'shpat_old', 1), ('s2', 'none.myshopify.com', NULL, 0)"))
        conn.execute(text(
            "INSERT INTO jira_tokens (id, organization_id, access_token, refresh_token, token_type, "
            "expires_at, cloud_id, site_url) VALUES (1, :org, 'old-access', 'old-refresh', 'Bearer', "
            "'2030-01-01 00:00:00', 'c', 'https://x')"), {"org": uuid.uuid4().hex})
        conn.execute(text(
            "INSERT INTO mcp_tools (id, name, transport_type, enabled, env_vars, headers, organization_id) VALUES "
            "(1, 'old', 'STDIO', 1, :env, :headers, :org), (2, 'bare', 'HTTP', 1, NULL, NULL, :org)"),
            {"env": json.dumps(SECRET_ENV), "headers": json.dumps(SECRET_HEADERS), "org": uuid.uuid4().hex})
    yield engine
    engine.dispose()


def _migrate(engine, direction):
    migration = _load_migration()
    with engine.begin() as conn:
        with Operations.context(MigrationContext.configure(conn)):
            getattr(migration, direction)()


def _snapshot(engine):
    with engine.connect() as conn:
        return {
            "shop": conn.execute(text("SELECT access_token FROM shopify_shops ORDER BY id")).scalars().all(),
            "jira": tuple(conn.execute(text("SELECT access_token, refresh_token FROM jira_tokens")).one()),
            "env": conn.execute(text("SELECT env_vars FROM mcp_tools ORDER BY id")).scalars().all(),
            "headers": conn.execute(text("SELECT headers FROM mcp_tools ORDER BY id")).scalars().all(),
        }


class TestMigration:
    def test_upgrade_encrypts_every_secret_and_creates_the_record_table(self, legacy_db):
        _migrate(legacy_db, "upgrade")

        after = _snapshot(legacy_db)
        assert is_encrypted(after["shop"][0]) and after["shop"][1] is None
        assert decrypt_value(after["shop"][0]) == "shpat_old"
        assert [decrypt_value(v) for v in after["jira"]] == ["old-access", "old-refresh"]
        env, bare_env = after["env"]
        assert list(json.loads(env)) == [JSON_MARKER] and "ghp_secret" not in env
        assert bare_env is None
        assert "sk-live" not in after["headers"][0]
        assert inspect(legacy_db).has_table("shopify_compliance_events")

    def test_upgrade_twice_changes_nothing_the_second_time(self, legacy_db):
        _migrate(legacy_db, "upgrade")
        once = _snapshot(legacy_db)
        # Re-run only the data step: the table already exists.
        migration = _load_migration()
        with legacy_db.begin() as conn:
            with Operations.context(MigrationContext.configure(conn)):
                migration._rewrite(migration._encrypt)

        assert _snapshot(legacy_db) == once

    def test_downgrade_restores_the_plaintext_exactly(self, legacy_db):
        before = _snapshot(legacy_db)

        _migrate(legacy_db, "upgrade")
        _migrate(legacy_db, "downgrade")

        restored = _snapshot(legacy_db)
        assert restored["shop"] == before["shop"]
        assert restored["jira"] == before["jira"]
        assert [json.loads(v) if v else None for v in restored["env"]] == [SECRET_ENV, None]
        assert [json.loads(v) if v else None for v in restored["headers"]] == [SECRET_HEADERS, None]
        assert not inspect(legacy_db).has_table("shopify_compliance_events")

    def test_downgrade_refuses_to_destroy_a_secret_it_cannot_decrypt(self, legacy_db):
        _migrate(legacy_db, "upgrade")
        with legacy_db.begin() as conn:
            conn.execute(text("UPDATE shopify_shops SET access_token = 'enc:v1:not-a-token' WHERE id = 's1'"))

        with pytest.raises(RuntimeError, match="does not decrypt"):
            _migrate(legacy_db, "downgrade")

        # The failed downgrade rolled back: nothing was written over.
        assert _snapshot(legacy_db)["shop"][0] == "enc:v1:not-a-token"

    def test_a_missing_table_is_skipped(self):
        """A database that never had one of these integrations still migrates."""
        engine = create_engine("sqlite://", poolclass=StaticPool)
        with engine.begin() as conn:
            Base.metadata.tables["shopify_shops"].create(conn)
        _migrate(engine, "upgrade")
        _migrate(engine, "downgrade")
        engine.dispose()

    def test_already_encrypted_json_is_not_wrapped_again(self, legacy_db):
        wrapped = encrypt_json(SECRET_ENV)
        with legacy_db.begin() as conn:
            conn.execute(text("UPDATE mcp_tools SET env_vars = :v WHERE id = 1"), {"v": json.dumps(wrapped)})

        _migrate(legacy_db, "upgrade")

        assert json.loads(_snapshot(legacy_db)["env"][0]) == wrapped
        assert encrypt_value("x") != encrypt_value("x")  # why a re-wrap would show up as a change
