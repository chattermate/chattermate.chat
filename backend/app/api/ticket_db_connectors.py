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

CRUD + connection testing for guardrailed ticket DB connectors. Credentials
are encrypted at rest and never returned by any endpoint.
"""

import asyncio
from datetime import datetime, timezone
from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.logger import get_logger
from app.core.security import encrypt_api_key
from app.database import get_db
from app.models.schemas.ticket_db_connector import (
    DBConnectorCreate,
    DBConnectorDiscoverRequest,
    DBConnectorDiscoverResponse,
    DBConnectorOut,
    DBConnectorUpdate,
)
from app.models.ticket_db_connector import TicketDBConnector
from app.models.user import User
from app.api.tickets import require_any_permission
from app.services.db_connector_service import DBConnectorConfig, test_connection
from app.services.ticket_access import check_ticketing_access

logger = get_logger(__name__)
router = APIRouter()

manage_connectors = require_any_permission("manage_ticket_connectors", "manage_organization")


def _get_connector_or_404(db: Session, connector_id: UUID, user: User) -> TicketDBConnector:
    connector = (
        db.query(TicketDBConnector)
        .filter(
            TicketDBConnector.id == connector_id,
            TicketDBConnector.organization_id == user.organization_id,
        )
        .first()
    )
    if connector is None:
        raise HTTPException(status_code=404, detail="Connector not found")
    return connector


async def _discover(config: DBConnectorConfig) -> DBConnectorDiscoverResponse:
    try:
        result = await asyncio.to_thread(test_connection, config)
        return DBConnectorDiscoverResponse(ok=True, tables=result["tables"])
    except Exception as e:
        return DBConnectorDiscoverResponse(ok=False, error=str(e)[:500])


@router.get("", response_model=List[DBConnectorOut])
async def list_connectors(
    current_user: User = Depends(manage_connectors),
    db: Session = Depends(get_db),
):
    check_ticketing_access(db, current_user.organization_id)
    return (
        db.query(TicketDBConnector)
        .filter(TicketDBConnector.organization_id == current_user.organization_id)
        .order_by(TicketDBConnector.created_at)
        .all()
    )


@router.post("/discover", response_model=DBConnectorDiscoverResponse)
async def discover_tables(
    payload: DBConnectorDiscoverRequest,
    current_user: User = Depends(manage_connectors),
    db: Session = Depends(get_db),
):
    """Pre-save connection test: connect with the given credentials and
    return the discoverable tables/columns for the allowlist picker."""
    check_ticketing_access(db, current_user.organization_id)
    config = DBConnectorConfig(
        id=None,
        organization_id=current_user.organization_id,
        name="draft",
        engine=payload.engine,
        host=payload.host,
        port=payload.port,
        database=payload.database,
        username=payload.username,
        password=payload.password,
    )
    return await _discover(config)


@router.post("", response_model=DBConnectorOut, status_code=201)
async def create_connector(
    payload: DBConnectorCreate,
    current_user: User = Depends(manage_connectors),
    db: Session = Depends(get_db),
):
    check_ticketing_access(db, current_user.organization_id)
    connector = TicketDBConnector(
        organization_id=current_user.organization_id,
        name=payload.name,
        engine=payload.engine,
        host=payload.host,
        port=payload.port,
        database=payload.database,
        username=payload.username,
        encrypted_password=encrypt_api_key(payload.password),
        enabled=payload.enabled,
        allowed_tables=payload.allowed_tables,
        masked_columns=payload.masked_columns,
        max_rows=payload.max_rows,
        statement_timeout_ms=payload.statement_timeout_ms,
    )
    db.add(connector)
    db.commit()
    db.refresh(connector)
    return connector


@router.patch("/{connector_id}", response_model=DBConnectorOut)
async def update_connector(
    connector_id: UUID,
    payload: DBConnectorUpdate,
    current_user: User = Depends(manage_connectors),
    db: Session = Depends(get_db),
):
    check_ticketing_access(db, current_user.organization_id)
    connector = _get_connector_or_404(db, connector_id, current_user)
    data = payload.model_dump(exclude_unset=True)
    password = data.pop("password", None)
    if password:
        connector.encrypted_password = encrypt_api_key(password)
    for key, value in data.items():
        setattr(connector, key, value)
    db.commit()
    db.refresh(connector)
    return connector


@router.delete("/{connector_id}", status_code=204)
async def delete_connector(
    connector_id: UUID,
    current_user: User = Depends(manage_connectors),
    db: Session = Depends(get_db),
):
    check_ticketing_access(db, current_user.organization_id)
    connector = _get_connector_or_404(db, connector_id, current_user)
    db.delete(connector)
    db.commit()


@router.post("/{connector_id}/test", response_model=DBConnectorDiscoverResponse)
async def test_saved_connector(
    connector_id: UUID,
    current_user: User = Depends(manage_connectors),
    db: Session = Depends(get_db),
):
    """Test a saved connector with its stored credentials; refreshes the
    discoverable table list and records the outcome."""
    check_ticketing_access(db, current_user.organization_id)
    connector = _get_connector_or_404(db, connector_id, current_user)
    result = await _discover(DBConnectorConfig.from_model(connector))
    connector.last_test_at = datetime.now(timezone.utc)
    connector.last_test_ok = result.ok
    db.commit()
    return result
