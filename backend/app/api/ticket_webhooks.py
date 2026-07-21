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

Alert-webhook intake: Grafana/Datadog/CloudWatch (or any) alerts POST here
and become tickets (source=api) — investigated proactively, before a customer
reports the issue. Authenticated by a per-org URL secret; near-duplicate open
alerts are appended to the existing ticket instead of opening a new one.
"""

import secrets as py_secrets
from typing import Optional, Tuple
from uuid import UUID

from fastapi import APIRouter, Body, Depends, HTTPException
from sqlalchemy.orm import Session
from starlette.concurrency import run_in_threadpool

from app.core.logger import get_logger
from app.database import get_db
from app.models.ticket import TicketPriority, TicketSource
from app.models.ticket_activity import TicketActivityType, TicketActorType
from app.repositories.ticket import TicketSettingsRepository
from app.services.ticket import TicketService, embed_ticket_text
from app.services.ticket_access import ticketing_allowed
from app.services.ticket_events import emit_ticket_update

logger = get_logger(__name__)
router = APIRouter()

# An open ticket at least this similar means the alert is a re-fire.
ALERT_DEDUP_SIMILARITY = 0.95

_SEVERITY_TO_PRIORITY = {
    "critical": TicketPriority.URGENT,
    "disaster": TicketPriority.URGENT,
    "error": TicketPriority.HIGH,
    "warning": TicketPriority.MEDIUM,
    "info": TicketPriority.LOW,
}


def _parse_alert(payload: dict) -> Tuple[str, str, Optional[str]]:
    """Best-effort extraction across alerting platforms (Grafana webhook,
    Alertmanager, Datadog, generic {title, description, severity})."""
    title = (
        payload.get("title")
        or payload.get("ruleName")
        or payload.get("alert_name")
        or payload.get("commonAnnotations", {}).get("summary")
        or payload.get("commonLabels", {}).get("alertname")
        or "Infrastructure alert"
    )
    description = (
        payload.get("description")
        or payload.get("message")
        or payload.get("body")
        or payload.get("commonAnnotations", {}).get("description")
        or ""
    )
    if not isinstance(description, str):
        description = str(description)
    severity = (
        payload.get("severity")
        or payload.get("priority")
        or payload.get("commonLabels", {}).get("severity")
    )
    return str(title)[:500], description[:20000], (str(severity).lower() if severity else None)


@router.post("/alerts/{org_id}/{secret}", status_code=202)
async def alert_intake(
    org_id: UUID,
    secret: str,
    payload: dict = Body(...),
    db: Session = Depends(get_db),
):
    settings_row = TicketSettingsRepository(db).get(org_id)
    # Uniform 404 for unknown org / disabled intake / wrong secret — the
    # endpoint must not confirm which part failed.
    if (
        settings_row is None
        or not settings_row.alert_webhook_enabled
        or not settings_row.alert_webhook_secret
        or not py_secrets.compare_digest(settings_row.alert_webhook_secret, secret)
        or not ticketing_allowed(db, org_id)
    ):
        raise HTTPException(status_code=404, detail="Not found")

    title, description, severity = _parse_alert(payload)
    priority = _SEVERITY_TO_PRIORITY.get(severity or "", TicketPriority.HIGH)
    service = TicketService(db)

    # Re-fired alert → append to the open ticket instead of a duplicate.
    embedding = await run_in_threadpool(embed_ticket_text, f"[ALERT] {title}", description)
    if embedding is not None:
        duplicates = service.repo.find_similar(
            org_id, embedding, limit=1, only_open=True,
            min_similarity=ALERT_DEDUP_SIMILARITY,
        )
        if duplicates:
            existing, similarity = duplicates[0]
            service._add_activity(
                existing,
                TicketActivityType.COMMENT,
                actor_type=TicketActorType.SYSTEM,
                body=f"Alert fired again: {title}",
                metadata={"source": "alert_webhook", "similarity": round(similarity, 3)},
            )
            db.commit()
            await emit_ticket_update(org_id, existing.id, "comment")
            return {"deduplicated": True, "ticket": existing.display_number}

    try:
        ticket, _duplicates = await run_in_threadpool(
            service.create_ticket,
            organization_id=org_id,
            title=f"[ALERT] {title}",
            description=description or None,
            priority=priority,
            source=TicketSource.API,
        )
        db.commit()
    except Exception as e:
        db.rollback()
        logger.error(f"Alert intake failed for org {org_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to create ticket")

    await emit_ticket_update(org_id, ticket.id, "created")
    return {"deduplicated": False, "ticket": ticket.display_number}
