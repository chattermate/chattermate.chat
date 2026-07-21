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

Live ticket updates to the dashboard. Emitted into the per-org ticket room on
the /agent namespace after a mutation commits; the frontend keeps a poll
fallback, so a missed frame is never fatal.
"""

from typing import Optional
from uuid import UUID

from app.core.logger import get_logger
from app.core.socketio import sio

logger = get_logger(__name__)

ORG_TICKET_ROOM_PREFIX = "org_tickets_"


def org_ticket_room(organization_id) -> str:
    return f"{ORG_TICKET_ROOM_PREFIX}{organization_id}"


async def emit_ticket_update(
    organization_id: UUID,
    ticket_id: UUID,
    kind: str,
    payload: Optional[dict] = None,
) -> None:
    """kind: 'created' | 'status' | 'triage' | 'comment' | 'run' | 'updated'."""
    try:
        await sio.emit(
            "ticket_update",
            {
                "ticket_id": str(ticket_id),
                "kind": kind,
                "payload": payload or {},
            },
            room=org_ticket_room(organization_id),
            namespace="/agent",
        )
    except Exception as e:
        logger.error(f"ticket_update emit failed for {ticket_id}: {e}")
