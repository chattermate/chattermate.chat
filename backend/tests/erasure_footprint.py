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

A customer with a record in every table an erasure must reach, and a way to
count what is left of them.
"""

import uuid
from dataclasses import dataclass, field
from typing import Dict, List, Optional

from app.models.agent_action import AgentActionCall
from app.models.channels.channel_conversation import ChannelConversation
from app.models.chat_history import ChatHistory
from app.models.crm import CrmCustomerSync, CrmSyncJob
from app.models.customer import Customer
from app.models.file_attachment import FileAttachment
from app.models.guardrail_event import GuardrailEvent
from app.models.investigation import InvestigationRun
from app.models.journey import JourneyProgress, JourneyStepProgress
from app.models.lead_capture import LeadCaptureResponse
from app.models.rating import Rating
from app.models.session_to_agent import SessionToAgent
from app.models.ticket import Ticket, TicketSession
from app.models.ticket_activity import TicketActivity


@dataclass
class Footprint:
    customer_id: uuid.UUID
    session_ids: List[uuid.UUID] = field(default_factory=list)
    message_ids: List[int] = field(default_factory=list)
    ticket_id: Optional[uuid.UUID] = None
    lead_id: Optional[uuid.UUID] = None
    progress_id: Optional[uuid.UUID] = None
    attachment_url: str = ""


def seed_footprint(db, organization_id, agent_id, *, email, phone=None,
                   channel="shopify", full_name="Ada Lovelace") -> Footprint:
    """One customer, one conversation, and every record hanging off them."""
    customer = Customer(id=uuid.uuid4(), organization_id=organization_id,
                        email=email, phone=phone, full_name=full_name,
                        meta_data={"shopify_customer_id": "123"})
    db.add(customer)
    db.flush()
    fp = Footprint(customer_id=customer.id)

    session_id = uuid.uuid4()
    db.add(SessionToAgent(session_id=session_id, agent_id=agent_id, customer_id=customer.id,
                          organization_id=organization_id, channel=channel,
                          transfer_description="wants a refund for order #1001"))
    fp.session_ids.append(session_id)
    db.flush()

    for text in ("Hi, I'm Ada, my order never came", "Sorry to hear that, Ada"):
        message = ChatHistory(organization_id=organization_id, customer_id=customer.id,
                              agent_id=agent_id, session_id=session_id,
                              message=text, message_type="user")
        db.add(message)
        db.flush()
        fp.message_ids.append(message.id)

    fp.attachment_url = f"https://bucket.s3.amazonaws.com/uploads/{uuid.uuid4()}.png"
    db.add(FileAttachment(file_url=fp.attachment_url, filename="receipt.png",
                          content_type="image/png", file_size=10,
                          chat_history_id=fp.message_ids[0], organization_id=organization_id,
                          uploaded_by_customer_id=customer.id))
    db.add(Rating(session_id=session_id, customer_id=customer.id, agent_id=agent_id,
                  organization_id=organization_id, rating=2, feedback="Ada here, slow reply"))
    db.add(GuardrailEvent(organization_id=organization_id, agent_id=agent_id,
                          session_id=session_id, surface="widget", layer="inbound",
                          rule="injection.frame_tokens", action="counted", excerpt="Ada's text"))
    db.add(AgentActionCall(organization_id=organization_id, agent_id=agent_id,
                           action_name="lookup_order", session_id=session_id, run_id=f"run-{session_id.hex[:8]}",
                           tool_call_id="call-1", seq=1, args_hash="x", args_ciphertext="enc"))
    db.add(ChannelConversation(channel_account_id=uuid.uuid4(), channel_type="whatsapp",
                               external_conversation_id=f"wa-{session_id.hex[:8]}",
                               external_user_id="447700900000", session_id=session_id,
                               organization_id=organization_id, agent_id=agent_id,
                               customer_id=customer.id))

    lead = LeadCaptureResponse(organization_id=organization_id, agent_id=agent_id,
                               customer_id=customer.id, session_id=session_id,
                               field_values={"email": email}, summary="Ada, wants a demo")
    db.add(lead)
    db.flush()
    fp.lead_id = lead.id
    db.add(CrmSyncJob(organization_id=organization_id, lead_response_id=lead.id, provider="hubspot"))
    db.add(CrmCustomerSync(organization_id=organization_id, customer_id=customer.id,
                           provider="hubspot", contact_id="c-1"))

    progress = JourneyProgress(journey_id=uuid.uuid4(), agent_id=agent_id,
                               customer_id=customer.id, journey_version=1)
    db.add(progress)
    db.flush()
    fp.progress_id = progress.id
    db.add(JourneyStepProgress(progress_id=progress.id, step_id="step-1"))

    ticket = Ticket(ticket_number=db.query(Ticket).count() + 1, organization_id=organization_id, customer_id=customer.id,
                    title="Ada's missing order", description="Ada says order #1001 never came")
    db.add(ticket)
    db.flush()
    fp.ticket_id = ticket.id
    db.add(TicketSession(ticket_id=ticket.id, session_id=session_id))
    db.add(TicketActivity(ticket_id=ticket.id, activity_type="comment", body="Called Ada"))
    db.add(InvestigationRun(ticket_id=ticket.id, organization_id=organization_id))
    db.commit()
    return fp


def remaining(db, fp: Footprint) -> Dict[str, int]:
    """Rows still holding anything of this customer, by table; empty when erased."""
    sessions = fp.session_ids
    counts = {
        "customers": db.query(Customer).filter(Customer.id == fp.customer_id).count(),
        "session_to_agents": db.query(SessionToAgent).filter(SessionToAgent.session_id.in_(sessions)).count(),
        "chat_history": db.query(ChatHistory).filter(
            (ChatHistory.customer_id == fp.customer_id) | ChatHistory.session_id.in_(sessions)).count(),
        "file_attachments": db.query(FileAttachment).filter(
            FileAttachment.uploaded_by_customer_id == fp.customer_id).count(),
        "ratings": db.query(Rating).filter(Rating.session_id.in_(sessions)).count(),
        "guardrail_events": db.query(GuardrailEvent).filter(GuardrailEvent.session_id.in_(sessions)).count(),
        "agent_action_calls": db.query(AgentActionCall).filter(AgentActionCall.session_id.in_(sessions)).count(),
        "channel_conversations": db.query(ChannelConversation).filter(
            ChannelConversation.customer_id == fp.customer_id).count(),
        "lead_capture_responses": db.query(LeadCaptureResponse).filter(
            LeadCaptureResponse.customer_id == fp.customer_id).count(),
        "crm_sync_jobs": db.query(CrmSyncJob).filter(CrmSyncJob.lead_response_id == fp.lead_id).count(),
        "journey_step_progress": db.query(JourneyStepProgress).filter(
            JourneyStepProgress.progress_id == fp.progress_id).count(),
        "crm_customer_syncs": db.query(CrmCustomerSync).filter(
            CrmCustomerSync.customer_id == fp.customer_id).count(),
        "journey_progress": db.query(JourneyProgress).filter(
            JourneyProgress.customer_id == fp.customer_id).count(),
        "tickets": db.query(Ticket).filter(Ticket.id == fp.ticket_id).count(),
        "ticket_sessions": db.query(TicketSession).filter(TicketSession.ticket_id == fp.ticket_id).count(),
        "ticket_activities": db.query(TicketActivity).filter(TicketActivity.ticket_id == fp.ticket_id).count(),
        "investigation_runs": db.query(InvestigationRun).filter(InvestigationRun.ticket_id == fp.ticket_id).count(),
    }
    return {table: n for table, n in counts.items() if n}
