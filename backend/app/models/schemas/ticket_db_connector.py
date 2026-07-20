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

import re
from datetime import datetime
from typing import Dict, List, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator

ENGINES = ("postgresql", "mysql")
ROW_SCOPE_KEYS = ("email", "phone")


class DBConnectorColumnOut(BaseModel):
    name: str
    type: str


class DBConnectorTableOut(BaseModel):
    schema_name: str = Field(alias="schema")
    table: str
    columns: List[DBConnectorColumnOut]

    model_config = ConfigDict(populate_by_name=True)


class SSHTunnelFields(BaseModel):
    """Optional SSH bastion/jump-host tunnel. Auth is by private key
    (preferred) or password; secrets are write-only."""
    ssh_enabled: bool = False
    ssh_host: Optional[str] = Field(default=None, max_length=500)
    ssh_port: int = Field(default=22, ge=1, le=65535)
    ssh_username: Optional[str] = Field(default=None, max_length=200)
    ssh_password: Optional[str] = Field(default=None, max_length=1000)
    ssh_private_key: Optional[str] = Field(default=None, max_length=20000)
    ssh_private_key_passphrase: Optional[str] = Field(default=None, max_length=1000)


class DBConnectorDiscoverRequest(SSHTunnelFields):
    """Pre-save connection test: credentials go over TLS, are used once for
    discovery, and are never persisted by this endpoint."""
    engine: str = Field(pattern=f"^({'|'.join(ENGINES)})$")
    host: str = Field(min_length=1, max_length=500)
    port: int = Field(ge=1, le=65535)
    database: str = Field(min_length=1, max_length=200)
    username: str = Field(min_length=1, max_length=200)
    password: str = Field(min_length=1, max_length=500)


class DBConnectorDiscoverResponse(BaseModel):
    ok: bool
    error: Optional[str] = None
    tables: List[DBConnectorTableOut] = []


_IDENTIFIER = re.compile(r"^[A-Za-z_][A-Za-z0-9_$]*$")
_TABLE_REF = re.compile(r"^[A-Za-z_][A-Za-z0-9_$]*(\.[A-Za-z_][A-Za-z0-9_$]*)?$")

ROW_SCOPE_DESCRIPTION = (
    'Tables restricted to the ticket customer\'s own rows, as '
    '{"schema.table": "customer_column"}. Listed tables are rewritten into a '
    "pre-filtered subquery; tables left out are readable in full."
)


def validate_row_scope(value: Optional[Dict[str, str]]) -> Optional[Dict[str, str]]:
    """Both halves land in generated SQL as identifiers. sqlglot quotes them,
    but a bad value should be refused at the edge rather than quoted and
    executed — a typo'd column silently scopes nothing useful."""
    if value is None:
        return None
    if len(value) > 500:
        raise ValueError("Too many row-scope entries")
    cleaned: Dict[str, str] = {}
    for table, column in value.items():
        table = (table or "").strip()
        column = (column or "").strip()
        if not table or not column:
            continue
        if not _TABLE_REF.match(table):
            raise ValueError(f"Invalid table reference in row scope: {table!r}")
        if not _IDENTIFIER.match(column):
            raise ValueError(f"Invalid column name in row scope: {column!r}")
        cleaned[table.lower()] = column
    return cleaned


class DBConnectorCreate(SSHTunnelFields):
    name: str = Field(min_length=1, max_length=200)
    engine: str = Field(pattern=f"^({'|'.join(ENGINES)})$")
    host: str = Field(min_length=1, max_length=500)
    port: int = Field(ge=1, le=65535)
    database: str = Field(min_length=1, max_length=200)
    username: str = Field(min_length=1, max_length=200)
    password: str = Field(min_length=1, max_length=500)
    enabled: bool = True
    # Nothing is queryable unless explicitly listed ("schema.table").
    allowed_tables: List[str] = Field(default_factory=list, max_length=500)
    masked_columns: List[str] = Field(default_factory=list, max_length=500)
    row_scope: Dict[str, str] = Field(
        default_factory=dict, description=ROW_SCOPE_DESCRIPTION
    )
    row_scope_key: str = Field(
        default="email", pattern=f"^({'|'.join(ROW_SCOPE_KEYS)})$"
    )
    max_rows: int = Field(default=100, ge=1, le=1000)
    statement_timeout_ms: int = Field(default=5000, ge=100, le=30000)

    @field_validator("row_scope")
    @classmethod
    def _check_row_scope(cls, value):
        return validate_row_scope(value) or {}


class DBConnectorUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=200)
    host: Optional[str] = Field(default=None, min_length=1, max_length=500)
    port: Optional[int] = Field(default=None, ge=1, le=65535)
    database: Optional[str] = Field(default=None, min_length=1, max_length=200)
    username: Optional[str] = Field(default=None, min_length=1, max_length=200)
    # Omit to keep the stored password.
    password: Optional[str] = Field(default=None, min_length=1, max_length=500)
    enabled: Optional[bool] = None
    allowed_tables: Optional[List[str]] = Field(default=None, max_length=500)
    masked_columns: Optional[List[str]] = Field(default=None, max_length=500)
    row_scope: Optional[Dict[str, str]] = Field(
        default=None, description=ROW_SCOPE_DESCRIPTION
    )
    row_scope_key: Optional[str] = Field(
        default=None, pattern=f"^({'|'.join(ROW_SCOPE_KEYS)})$"
    )
    max_rows: Optional[int] = Field(default=None, ge=1, le=1000)
    statement_timeout_ms: Optional[int] = Field(default=None, ge=100, le=30000)
    # SSH tunnel — omit a secret to keep the stored one.
    ssh_enabled: Optional[bool] = None
    ssh_host: Optional[str] = Field(default=None, max_length=500)
    ssh_port: Optional[int] = Field(default=None, ge=1, le=65535)
    ssh_username: Optional[str] = Field(default=None, max_length=200)
    ssh_password: Optional[str] = Field(default=None, max_length=1000)
    ssh_private_key: Optional[str] = Field(default=None, max_length=20000)
    ssh_private_key_passphrase: Optional[str] = Field(default=None, max_length=1000)

    @field_validator("row_scope")
    @classmethod
    def _check_row_scope(cls, value):
        return validate_row_scope(value)


class DBConnectorOut(BaseModel):
    """Never includes the password in any form."""
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    name: str
    engine: str
    host: str
    port: int
    database: str
    username: str
    enabled: bool
    allowed_tables: Optional[List[str]] = None
    masked_columns: Optional[List[str]] = None
    row_scope: Optional[Dict[str, str]] = None
    row_scope_key: str = "email"
    max_rows: int
    statement_timeout_ms: int
    # SSH tunnel — connection details only, never the key/password.
    ssh_enabled: bool = False
    ssh_host: Optional[str] = None
    ssh_port: int = 22
    ssh_username: Optional[str] = None
    last_test_at: Optional[datetime] = None
    last_test_ok: Optional[bool] = None
    created_at: Optional[datetime] = None
