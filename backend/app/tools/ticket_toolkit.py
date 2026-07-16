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

import json
from typing import Optional
from uuid import UUID

from agno.tools import Toolkit

from app.core.logger import get_logger
from app.database import SessionLocal
from app.models.ticket import TicketPriority, TicketSource
from app.models.ticket_activity import TicketActivityType, TicketActorType

logger = get_logger(__name__)

VALID_PRIORITIES = {p.value for p in TicketPriority}


class TicketTools(Toolkit):
    """Native ticket tools for the customer-facing chat agent — the AI-first
    replacement for JiraTools. One native ticket per session: a second
    create_ticket call appends the new details as an activity instead of
    opening a duplicate.
    """

    def __init__(self, agent_id: str, org_id: str, session_id: str):
        super().__init__(name="ticket_tools")
        self.agent_id = agent_id
        self.org_id = org_id
        self.session_id = session_id

        self.register(self.create_ticket)
        self.register(self.get_ticket_status)
        self.register(self.check_existing_ticket)

    def create_ticket(
        self,
        summary: str,
        description: str,
        priority: Optional[str] = "medium",
    ) -> str:
        """
        Create a support ticket for the current conversation, or add the new
        details to the session's existing ticket. Use this when the customer
        reports a technical issue you cannot resolve from the knowledge base —
        the ticket is investigated by the support team's AI and humans.

        Args:
            summary (str): Short title of the issue.
            description (str): Detailed description: what happens, error
                messages, customer impact, and anything needed to reproduce.
            priority (str, optional): urgent, high, medium or low. Defaults to
                "medium".

        Returns:
            str: JSON string with the ticket number and status.
        """
        try:
            from app.services.ticket import TicketService

            priority_value = (priority or "medium").lower()
            if priority_value not in VALID_PRIORITIES:
                priority_value = TicketPriority.MEDIUM.value

            with SessionLocal() as db:
                service = TicketService(db)
                session_uuid = UUID(str(self.session_id))
                existing = service.repo.get_by_session(session_uuid)
                if existing is not None:
                    service._add_activity(
                        existing,
                        TicketActivityType.CUSTOMER_REPLIED,
                        actor_type=TicketActorType.AI,
                        body=f"Additional details from the conversation:\n{description}",
                    )
                    db.commit()
                    return json.dumps({
                        "success": True,
                        "updated": True,
                        "ticket_id": existing.display_number,
                        "status": str(existing.status),
                        "message": (
                            f"Ticket {existing.display_number} already exists for this "
                            "conversation — the new details were added to it."
                        ),
                    })

                ticket, _duplicates = service.create_ticket(
                    organization_id=UUID(str(self.org_id)),
                    title=summary[:500],
                    description=description,
                    priority=priority_value,
                    source=TicketSource.CHAT_AI,
                    session_id=session_uuid,
                    agent_id=UUID(str(self.agent_id)),
                )
                db.commit()
                db.refresh(ticket)
                ticket_number = ticket.display_number
                status = str(ticket.status)

            # The acknowledgment message is sent by the chat agent itself in
            # its reply, so no separate customer notification here.
            return json.dumps({
                "success": True,
                "updated": False,
                "ticket_id": ticket_number,
                "status": status,
                "message": f"Ticket {ticket_number} created. The team's AI will start investigating.",
            })
        except Exception as e:
            logger.error(f"create_ticket failed for session {self.session_id}: {e}")
            return json.dumps({"success": False, "message": "Failed to create the ticket."})

    def get_ticket_status(self, ticket_number: Optional[str] = None) -> str:
        """
        Get the current status of a ticket. Without a ticket number, returns
        the status of this conversation's ticket.

        Args:
            ticket_number (str, optional): Ticket number like "TKT-123".

        Returns:
            str: JSON string with the ticket status and priority.
        """
        try:
            from app.repositories.ticket import TicketRepository

            with SessionLocal() as db:
                repo = TicketRepository(db)
                ticket = None
                if ticket_number:
                    digits = str(ticket_number).strip().upper().removeprefix("TKT-")
                    if digits.isdigit():
                        ticket = repo.get_by_number(UUID(str(self.org_id)), int(digits))
                else:
                    ticket = repo.get_by_session(UUID(str(self.session_id)))
                if ticket is None or str(ticket.organization_id) != str(self.org_id):
                    return json.dumps({"exists": False, "message": "No ticket found."})
                return json.dumps({
                    "exists": True,
                    "ticket_id": ticket.display_number,
                    "status": str(ticket.status),
                    "priority": str(ticket.priority),
                    "title": ticket.title,
                })
        except Exception as e:
            logger.error(f"get_ticket_status failed: {e}")
            return json.dumps({"exists": False, "message": "Could not look up the ticket."})

    def check_existing_ticket(self) -> str:
        """
        Check whether this conversation already has a ticket. Always call this
        before creating a ticket.

        Returns:
            str: JSON string with "exists" and the ticket number if present.
        """
        try:
            from app.repositories.ticket import TicketRepository

            with SessionLocal() as db:
                ticket = TicketRepository(db).get_by_session(UUID(str(self.session_id)))
                if ticket is None:
                    return json.dumps({"exists": False})
                return json.dumps({
                    "exists": True,
                    "ticket_id": ticket.display_number,
                    "status": str(ticket.status),
                })
        except Exception as e:
            logger.error(f"check_existing_ticket failed: {e}")
            return json.dumps({"exists": False})
