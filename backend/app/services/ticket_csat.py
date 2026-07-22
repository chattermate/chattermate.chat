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

Capture side of the ticket CSAT loop.

TicketService.close() asks the customer for a rating through the widget's
existing conversation rating prompt. This module carries the answer back: every
path that creates a Rating calls record_conversation_rating(), which attaches
the score to the ticket linked to that session, if there is one.

Deliberately conversation-only. ratings.session_id is NOT NULL, so a rating
cannot exist without a chat session — a manual or email-only ticket has nothing
to rate. Supporting those would mean a public tokenised rating page and a
session-less Rating; until that exists, such tickets are never asked and their
CSAT card reads "not requested".

Best-effort throughout: a rating is a customer-facing success the moment it is
stored, so a failure to link it must never fail the submission.
"""

from typing import Optional
from uuid import UUID

from sqlalchemy.orm import Session

from app.core.logger import get_logger
from app.models.rating import Rating

logger = get_logger(__name__)


def record_conversation_rating(db: Session, rating: Rating) -> Optional[UUID]:
    """Link a just-submitted conversation rating to its ticket.

    Returns the ticket id it was attached to, or None when the session has no
    native ticket (the common case for plain chats) or the linkage failed.
    """
    try:
        from app.services.ticket import TicketService

        service = TicketService(db)
        ticket = service.repo.get_by_session(rating.session_id)
        if ticket is None:
            return None
        service.record_csat(ticket, rating.id, rating.rating, rating.feedback)
        db.commit()
        return ticket.id
    except Exception as e:
        # The rating row itself is already committed by the caller, so rolling
        # back here only discards the half-applied ticket update.
        logger.error(f"Failed to link rating {rating.id} to its ticket: {e}")
        try:
            db.rollback()
        except Exception:
            pass
        return None
