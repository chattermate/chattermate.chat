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

from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.auth import check_permissions, get_current_user
from app.core.logger import get_logger
from app.database import get_db
from app.models.investigation import InvestigationRunType, InvestigationTrigger
from app.models.schemas.pagination import Pagination
from app.models.schemas.ticket import (
    InvestigationRunOut,
    TicketCommentCreate,
    TicketCreate,
    TicketDetailResponse,
    TicketListItem,
    TicketListResponse,
    TicketOut,
    TicketReopen,
    TicketResolve,
    TicketSettingsOut,
    TicketSettingsUpdate,
    TicketStats,
    TicketUpdate,
    TicketActivityOut,
)
from app.models.ticket import Ticket, TicketSource, TicketStatus
from app.models.ticket_activity import TicketActorType
from app.models.user import User
from app.repositories.chat import ChatRepository
from app.repositories.session_to_agent import SessionToAgentRepository
from app.services.ticket import TicketService
from app.services.ticket_access import check_ticketing_access
from app.services.ticket_events import emit_ticket_update

logger = get_logger(__name__)
router = APIRouter()

MAX_PAGE_SIZE = 100


def require_any_permission(*permissions: str):
    """Any-of permission dependency (require_permissions is all-of)."""
    async def checker(current_user: User = Depends(get_current_user)) -> User:
        for permission in permissions:
            if check_permissions(current_user, [permission]):
                return current_user
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions"
        )
    return checker


view_tickets = require_any_permission("view_tickets", "manage_tickets")
manage_tickets = require_any_permission("manage_tickets")


def _service(db: Session) -> TicketService:
    return TicketService(db)


def _list_item(service: TicketService, ticket: Ticket, has_active_run: bool, settings=None) -> TicketListItem:
    return TicketListItem(
        id=ticket.id,
        ticket_number=ticket.ticket_number,
        display_number=ticket.display_number,
        title=ticket.title,
        status=ticket.status,
        priority=ticket.priority,
        tags=ticket.tags,
        assignee_user_id=ticket.assignee_user_id,
        assignee_name=ticket.assignee.full_name if ticket.assignee else None,
        ai_state=service.ai_state(ticket, has_active_run=has_active_run),
        sla_due_at=service.sla_due_at(ticket, settings),
        resolved_at=ticket.resolved_at,
        created_at=ticket.created_at,
        updated_at=ticket.updated_at,
    )


def _ticket_out(service: TicketService, ticket: Ticket) -> TicketOut:
    out = TicketOut.model_validate(ticket)
    out.display_number = ticket.display_number
    out.ai_state = service.ai_state(ticket)
    out.sla_due_at = service.sla_due_at(ticket)
    return out


def _activity_out(activity) -> TicketActivityOut:
    out = TicketActivityOut.model_validate(activity)
    if activity.actor_user is not None:
        out.actor_name = activity.actor_user.full_name
    elif str(activity.actor_type) == TicketActorType.AI.value:
        out.actor_name = "ChatterMate AI"
    return out


def _get_ticket_or_404(db: Session, ticket_id: UUID, user: User) -> Ticket:
    from app.repositories.ticket import TicketRepository
    ticket = TicketRepository(db).get_by_id(ticket_id, user.organization_id)
    if ticket is None:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return ticket


@router.get("", response_model=TicketListResponse)
async def list_tickets(
    status_filter: Optional[str] = Query(default=None, alias="status"),
    priority: Optional[str] = None,
    assignee_id: Optional[UUID] = None,
    unassigned: bool = False,
    ai_state: Optional[str] = None,
    search: Optional[str] = None,
    sort: str = "updated",
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=25, ge=1, le=MAX_PAGE_SIZE),
    current_user: User = Depends(view_tickets),
    db: Session = Depends(get_db),
):
    check_ticketing_access(db, current_user.organization_id)
    service = _service(db)
    statuses = [s.strip() for s in status_filter.split(",") if s.strip()] if status_filter else None
    tickets, total = service.repo.list(
        current_user.organization_id,
        status=statuses,
        priority=priority,
        assignee_user_id=assignee_id,
        unassigned=unassigned,
        ai_state=ai_state,
        search=search,
        sort=sort,
        page=page,
        page_size=page_size,
    )
    settings = service.settings_repo.get_or_create(current_user.organization_id)
    active_ids = service.repo.active_run_ticket_ids([t.id for t in tickets])
    items = [_list_item(service, t, t.id in active_ids, settings) for t in tickets]
    return TicketListResponse(
        tickets=items, pagination=Pagination.build(total, page, page_size)
    )


@router.get("/stats", response_model=TicketStats)
async def ticket_stats(
    current_user: User = Depends(view_tickets),
    db: Session = Depends(get_db),
):
    check_ticketing_access(db, current_user.organization_id)
    return TicketStats(**_service(db).stats(current_user.organization_id))


@router.get("/settings", response_model=TicketSettingsOut)
async def get_settings(
    current_user: User = Depends(require_any_permission("manage_organization", "manage_tickets")),
    db: Session = Depends(get_db),
):
    check_ticketing_access(db, current_user.organization_id)
    from app.repositories.ticket import TicketSettingsRepository
    return TicketSettingsRepository(db).get_or_create(current_user.organization_id)


@router.put("/settings", response_model=TicketSettingsOut)
async def update_settings(
    payload: TicketSettingsUpdate,
    current_user: User = Depends(require_any_permission("manage_organization")),
    db: Session = Depends(get_db),
):
    check_ticketing_access(db, current_user.organization_id)
    from app.repositories.ticket import TicketSettingsRepository
    settings = TicketSettingsRepository(db).get_or_create(current_user.organization_id)
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(settings, key, value.value if hasattr(value, "value") else value)
    db.commit()
    db.refresh(settings)
    return settings


@router.get("/by-session/{session_id}", response_model=Optional[TicketOut])
async def get_ticket_by_session(
    session_id: UUID,
    current_user: User = Depends(view_tickets),
    db: Session = Depends(get_db),
):
    check_ticketing_access(db, current_user.organization_id)
    service = _service(db)
    ticket = service.repo.get_by_session(session_id)
    if ticket is None or ticket.organization_id != current_user.organization_id:
        return None
    return _ticket_out(service, ticket)


@router.get("/draft-from-session/{session_id}")
async def draft_from_session(
    session_id: UUID,
    current_user: User = Depends(view_tickets),
    db: Session = Depends(get_db),
):
    """Non-LLM prefill for the create-ticket modal: title from the customer's
    last message, description from the recent transcript. AI triage rewrites
    the title after creation."""
    check_ticketing_access(db, current_user.organization_id)
    # Cross-org guard: the transcript is customer data — the session must
    # belong to the caller's organization.
    session_record = SessionToAgentRepository(db).get_session(session_id)
    if session_record is None or str(session_record.organization_id) != str(current_user.organization_id):
        raise HTTPException(status_code=404, detail="Session not found")

    service = _service(db)
    messages = (await ChatRepository(db).get_session_history(session_id))[-20:]
    customer_messages = [m for m in messages if m.message_type == "user"]
    title = ""
    if customer_messages:
        title = (customer_messages[-1].message or "").strip().split("\n")[0][:200]
    transcript = await service.build_session_transcript(session_id, max_messages=10, line_chars=300)
    return {
        "title": title or "Support issue from conversation",
        "description": (transcript or "")[:5000],
    }


def _validate_create_references(db: Session, payload: TicketCreate, org_id) -> None:
    """Every referenced entity must belong to the caller's organization."""
    if payload.customer_id is not None:
        from app.models.customer import Customer
        customer = db.query(Customer).filter(Customer.id == payload.customer_id).first()
        if customer is None or str(customer.organization_id) != str(org_id):
            raise HTTPException(status_code=404, detail="Customer not found")
    if payload.assignee_user_id is not None:
        assignee = db.query(User).filter(User.id == payload.assignee_user_id).first()
        if assignee is None or str(assignee.organization_id) != str(org_id):
            raise HTTPException(status_code=404, detail="Assignee not found")


@router.post("", response_model=TicketDetailResponse, status_code=201)
async def create_ticket(
    payload: TicketCreate,
    current_user: User = Depends(manage_tickets),
    db: Session = Depends(get_db),
):
    check_ticketing_access(db, current_user.organization_id)
    _validate_create_references(db, payload, current_user.organization_id)
    service = _service(db)
    settings = service.settings_repo.get_or_create(current_user.organization_id)
    try:
        # Threadpool: create_ticket embeds the title/description with a local
        # CPU-bound model — must not block the event loop.
        from starlette.concurrency import run_in_threadpool
        ticket, duplicates = await run_in_threadpool(
            service.create_ticket,
            organization_id=current_user.organization_id,
            title=payload.title,
            description=payload.description,
            priority=payload.priority,
            severity=payload.severity,
            tags=payload.tags,
            source=TicketSource.HUMAN_AGENT if payload.session_id else TicketSource.MANUAL,
            customer_id=payload.customer_id,
            customer_email=payload.customer_email,
            customer_name=payload.customer_name,
            session_id=payload.session_id,
            assignee_user_id=payload.assignee_user_id,
            group_id=payload.group_id,
            created_by_user_id=current_user.id,
        )
        db.commit()
    except ValueError as e:
        db.rollback()
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        db.rollback()
        logger.error(f"Ticket creation failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to create ticket")

    db.refresh(ticket)
    await service.notify_customer_created(ticket, settings)
    db.commit()
    await emit_ticket_update(current_user.organization_id, ticket.id, "created")
    return TicketDetailResponse(
        ticket=_ticket_out(service, ticket),
        activities=[_activity_out(a) for a in service.activity_repo.list_for_ticket(ticket.id)],
        runs=[InvestigationRunOut.model_validate(r) for r in service.run_repo.list_for_ticket(ticket.id)],
        linked_session_ids=service.repo.get_session_ids(ticket.id),
        possible_duplicates=[
            _list_item(service, t, False, settings) for t, _score in duplicates
        ],
        can_notify_customer=service.can_notify_customer(ticket),
    )


@router.get("/{ticket_id}", response_model=TicketDetailResponse)
async def get_ticket(
    ticket_id: UUID,
    current_user: User = Depends(view_tickets),
    db: Session = Depends(get_db),
):
    check_ticketing_access(db, current_user.organization_id)
    service = _service(db)
    ticket = _get_ticket_or_404(db, ticket_id, current_user)
    return TicketDetailResponse(
        ticket=_ticket_out(service, ticket),
        activities=[_activity_out(a) for a in service.activity_repo.list_for_ticket(ticket.id)],
        runs=[InvestigationRunOut.model_validate(r) for r in service.run_repo.list_for_ticket(ticket.id)],
        linked_session_ids=service.repo.get_session_ids(ticket.id),
        can_notify_customer=service.can_notify_customer(ticket),
    )


@router.patch("/{ticket_id}", response_model=TicketOut)
async def update_ticket(
    ticket_id: UUID,
    payload: TicketUpdate,
    current_user: User = Depends(manage_tickets),
    db: Session = Depends(get_db),
):
    check_ticketing_access(db, current_user.organization_id)
    service = _service(db)
    ticket = _get_ticket_or_404(db, ticket_id, current_user)
    data = payload.model_dump(exclude_unset=True)
    try:
        if "status" in data:
            service.transition_status(
                ticket, data.pop("status"),
                actor_type=TicketActorType.USER, actor_user_id=current_user.id,
            )
        if "priority" in data:
            service.set_priority(
                ticket, data.pop("priority"),
                actor_type=TicketActorType.USER, actor_user_id=current_user.id,
            )
        if "assignee_user_id" in data or "group_id" in data:
            service.assign(
                ticket,
                data.pop("assignee_user_id", ticket.assignee_user_id),
                data.pop("group_id", ticket.group_id),
                actor_user_id=current_user.id,
            )
        for key, value in data.items():
            setattr(ticket, key, value.value if hasattr(value, "value") else value)
        db.commit()
    except ValueError as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        db.rollback()
        logger.error(f"Ticket update failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to update ticket")
    db.refresh(ticket)
    await emit_ticket_update(
        current_user.organization_id, ticket.id, "updated",
        {"status": str(ticket.status), "priority": str(ticket.priority)},
    )
    return _ticket_out(service, ticket)


@router.post("/{ticket_id}/comments", response_model=TicketActivityOut, status_code=201)
async def add_comment(
    ticket_id: UUID,
    payload: TicketCommentCreate,
    current_user: User = Depends(view_tickets),
    db: Session = Depends(get_db),
):
    check_ticketing_access(db, current_user.organization_id)
    # Customer-visible replies are a customer-facing action, not a read:
    # view-only roles may add internal notes but never message customers.
    if not payload.is_internal and not check_permissions(current_user, ["manage_tickets"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Sending customer-visible replies requires manage_tickets",
        )
    service = _service(db)
    ticket = _get_ticket_or_404(db, ticket_id, current_user)
    activity = service.add_comment(
        ticket,
        payload.body,
        is_internal=payload.is_internal,
        actor_type=TicketActorType.USER,
        actor_user_id=current_user.id,
    )
    if not payload.is_internal:
        # The comment row above is the timeline entry; skip the extra
        # CUSTOMER_NOTIFIED activity so the reply isn't duplicated.
        await service.send_customer_message(ticket, payload.body, record_activity=False)
    db.commit()
    db.refresh(activity)
    await emit_ticket_update(current_user.organization_id, ticket.id, "comment")
    return _activity_out(activity)


@router.post("/{ticket_id}/resolve", response_model=TicketOut)
async def resolve_ticket(
    ticket_id: UUID,
    payload: TicketResolve,
    current_user: User = Depends(manage_tickets),
    db: Session = Depends(get_db),
):
    check_ticketing_access(db, current_user.organization_id)
    service = _service(db)
    ticket = _get_ticket_or_404(db, ticket_id, current_user)
    try:
        await service.resolve(
            ticket,
            outcome=payload.outcome,
            resolution_summary=payload.resolution_summary,
            customer_message=payload.customer_message,
            actor_type=TicketActorType.USER,
            actor_user_id=current_user.id,
        )
        db.commit()
    except ValueError as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    db.refresh(ticket)
    await emit_ticket_update(
        current_user.organization_id, ticket.id, "status", {"status": str(ticket.status)}
    )
    return _ticket_out(service, ticket)


@router.post("/{ticket_id}/reopen", response_model=TicketOut)
async def reopen_ticket(
    ticket_id: UUID,
    payload: TicketReopen,
    current_user: User = Depends(manage_tickets),
    db: Session = Depends(get_db),
):
    check_ticketing_access(db, current_user.organization_id)
    service = _service(db)
    ticket = _get_ticket_or_404(db, ticket_id, current_user)
    if str(ticket.status) not in (
        TicketStatus.RESOLVED.value,
        TicketStatus.CLOSED.value,
        TicketStatus.RESOLVED_PENDING_CONFIRMATION.value,
    ):
        raise HTTPException(status_code=400, detail="Only resolved or closed tickets can be reopened")
    service.reopen(
        ticket, reason=payload.reason,
        actor_type=TicketActorType.USER, actor_user_id=current_user.id,
    )
    db.commit()
    db.refresh(ticket)
    await emit_ticket_update(
        current_user.organization_id, ticket.id, "status", {"status": str(ticket.status)}
    )
    return _ticket_out(service, ticket)


@router.post("/{ticket_id}/investigate", response_model=InvestigationRunOut, status_code=201)
async def investigate_ticket(
    ticket_id: UUID,
    current_user: User = Depends(manage_tickets),
    db: Session = Depends(get_db),
):
    """Manually (re-)enqueue an AI run for this ticket."""
    check_ticketing_access(db, current_user.organization_id)
    service = _service(db)
    ticket = _get_ticket_or_404(db, ticket_id, current_user)
    run = service.enqueue_run(
        ticket,
        run_type=InvestigationRunType.TRIAGE,
        trigger=InvestigationTrigger.MANUAL,
        requested_by_user_id=current_user.id,
    )
    if run is None:
        raise HTTPException(
            status_code=409, detail="An AI run is already active for this ticket"
        )
    db.commit()
    db.refresh(run)
    return InvestigationRunOut.model_validate(run)
