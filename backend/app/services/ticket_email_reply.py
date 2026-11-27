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

Inbound side of ticket email threading: decide whether a mail arriving on the
email channel is a reply to one of our ticket notifications, and append it to
that ticket instead of feeding it to the chat agent.
"""

from typing import Optional
from uuid import UUID

from sqlalchemy.orm import Session

from app.channels.base import InboundMessage
from app.core.logger import get_logger
from app.database import close_session, release_connection, session_off_loop
from app.models.ticket import Ticket
from app.repositories.ticket import TicketRepository
from app.services.ticket_email import (
    ticket_ids_from_references,
    ticket_number_from_subject,
)

logger = get_logger(__name__)


def find_ticket_for_reply(
    db: Session, organization_id: UUID, profile: Optional[dict]
) -> Optional[Ticket]:
    """The ticket an inbound email is replying to, or None.

    Headers first: In-Reply-To/References carry a Message-ID we minted, and
    the ticket id is inside it — unguessable, so a match is proof the mail
    descends from a notification we sent.

    The [TKT-n] subject token is the fallback for clients that drop threading
    headers. It is guessable, and a ticket's feed is read by agents and by the
    investigator AI, so that path additionally requires the sender to be the
    ticket's own customer; anything else falls through to the chat pipeline.
    """
    profile = profile or {}
    repo = TicketRepository(db)

    for ticket_id in ticket_ids_from_references(
        profile.get("in_reply_to"),
        profile.get("references"),
    ):
        ticket = repo.get_by_id(ticket_id, organization_id)
        if ticket is not None:
            return ticket

    number = ticket_number_from_subject(profile.get("subject"))
    if number is None:
        return None
    ticket = repo.get_by_number(organization_id, number)
    if ticket is None:
        return None
    sender = (profile.get("email") or "").strip().lower()
    customer_email = (getattr(ticket.customer, "email", "") or "").strip().lower()
    if sender and sender == customer_email:
        return ticket
    logger.info(
        f"Subject token named {ticket.display_number} but {sender or 'an unknown sender'} "
        "is not its customer — handling as a normal message"
    )
    return None


async def record_ticket_email_reply(
    organization_id: UUID, ticket_id: UUID, inbound: InboundMessage
) -> None:
    """Append an inbound email to its ticket. Runs from a BackgroundTask with
    its own DB session, mirroring process_channel_message."""
    db = await session_off_loop()
    try:
        ticket = TicketRepository(db).get_by_id(ticket_id, organization_id)
        if ticket is None:
            logger.warning(f"Email reply for unknown ticket {ticket_id}")
            return

        from app.services.ticket import TicketService
        service = TicketService(db)
        profile = inbound.profile or {}
        service.record_customer_email_reply(
            ticket,
            body=inbound.text or "",
            from_email=inbound.external_user_id,
            message_id=profile.get("inbound_message_id") or None,
        )
        db.commit()
        db.refresh(ticket)
        status, display_number = str(ticket.status), ticket.display_number
        release_connection(db)  # the emit can be a network call (Redis)

        from app.services.ticket_events import emit_ticket_update
        await emit_ticket_update(organization_id, ticket_id, "comment", {"status": status})
        logger.info(f"Email reply appended to {display_number}")
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to record email reply on ticket {ticket_id}: {e}")
    finally:
        close_session(db)
