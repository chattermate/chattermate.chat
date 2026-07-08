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

from sqlalchemy.orm import Session
from sqlalchemy import func, or_, desc
from typing import Optional, Tuple, List
from uuid import UUID
from datetime import datetime, timedelta, timezone

from app.repositories.customer import CustomerRepository
from app.models.customer import Customer, LeadStage
from app.models.chat_history import ChatHistory
from app.models.lead_capture import LeadCaptureResponse
from app.models.session_to_agent import SessionToAgent
from app.models.agent import Agent


class PeopleRepository:
    def __init__(self, db: Session):
        self.db = db

    def _is_anonymous(self, customer: Customer) -> bool:
        return CustomerRepository.is_placeholder_email(customer.email) and not (customer.full_name or "").strip()

    def _captured_contact_map(self, customer_ids) -> dict:
        """customer_id -> {'email':.., 'name':..} from qualifying lead responses.

        Used so a captured lead never shows as "Anonymous" when its email/name
        could not be written onto the customer row (e.g. the email already belongs
        to another customer). One query for the whole page — no N+1. Latest wins.
        """
        ids = [cid for cid in customer_ids if cid]
        if not ids:
            return {}
        rows = (
            self.db.query(LeadCaptureResponse.customer_id, LeadCaptureResponse.field_values)
            .filter(LeadCaptureResponse.customer_id.in_(ids),
                    LeadCaptureResponse.qualified.is_(True))
            .order_by(LeadCaptureResponse.created_at)
            .all()
        )
        out: dict = {}
        for cid, fv in rows:
            if not fv:
                continue
            d = out.setdefault(cid, {})
            if fv.get("email"):
                d["email"] = fv["email"]
            if fv.get("name"):
                d["name"] = fv["name"]
        return out

    def _resolve_display(self, customer: Customer, captured: Optional[dict]):
        """Return (name, email, is_anonymous), preferring the customer's own contact
        and falling back to the captured lead's email/name when the record is bare."""
        if not self._is_anonymous(customer):
            return customer.full_name, customer.email, False
        captured = captured or {}
        email = captured.get("email")
        name = (customer.full_name or "").strip() or captured.get("name")
        if email or name:
            return name, email, False
        return customer.full_name, None, True

    def list_people(
        self, org_id: UUID, stage: Optional[str] = None, search: Optional[str] = None,
        page: int = 1, page_size: int = 20,
    ) -> Tuple[List[dict], int]:
        # Latest activity per customer (one aggregate row per customer — no N+1).
        last_activity_sq = (
            self.db.query(
                ChatHistory.customer_id.label("cid"),
                func.max(ChatHistory.created_at).label("last"),
            )
            .filter(ChatHistory.organization_id == org_id)
            .group_by(ChatHistory.customer_id)
            .subquery()
        )
        # Customers who have at least one qualifying capture.
        qualified_sq = (
            self.db.query(LeadCaptureResponse.customer_id.label("cid"))
            .filter(
                LeadCaptureResponse.organization_id == org_id,
                LeadCaptureResponse.qualified.is_(True),
            )
            .distinct()
            .subquery()
        )

        q = (
            self.db.query(Customer, last_activity_sq.c.last, qualified_sq.c.cid)
            .outerjoin(last_activity_sq, last_activity_sq.c.cid == Customer.id)
            .outerjoin(qualified_sq, qualified_sq.c.cid == Customer.id)
            .filter(Customer.organization_id == org_id)
            # Hide rows merged into another customer — the target row represents them.
            .filter(Customer.merged_into_customer_id.is_(None))
        )

        if stage and stage != "all":
            try:
                q = q.filter(Customer.lead_stage == LeadStage(stage))
            except ValueError:
                pass  # unknown stage → no filter
        if search:
            like = f"%{search.strip()}%"
            q = q.filter(or_(Customer.full_name.ilike(like), Customer.email.ilike(like)))

        total = q.count()
        rows = (
            q.order_by(desc(func.coalesce(last_activity_sq.c.last, Customer.created_at)))
            .offset(max(page - 1, 0) * page_size)
            .limit(page_size)
            .all()
        )

        contact_map = self._captured_contact_map([c.id for c, _, _ in rows])
        items = []
        for customer, last, qcid in rows:
            name, email, anon = self._resolve_display(customer, contact_map.get(customer.id))
            items.append({
                "id": customer.id,
                "name": name,
                "email": email,
                "is_anonymous": anon,
                "lead_stage": customer.lead_stage,
                "qualified": qcid is not None,
                "source": customer.lead_source,
                "captured_at": customer.lead_qualified_at,
                "last_activity": last,
                "synced": False,
            })
        return items, total

    def get_stats(self, org_id: UUID) -> dict:
        week_ago = datetime.now(timezone.utc) - timedelta(days=7)
        not_merged = Customer.merged_into_customer_id.is_(None)
        total = self.db.query(func.count(Customer.id)).filter(
            Customer.organization_id == org_id, not_merged).scalar() or 0
        new_leads = self.db.query(func.count(Customer.id)).filter(
            Customer.organization_id == org_id,
            not_merged,
            Customer.lead_stage == LeadStage.LEAD,
            Customer.lead_qualified_at >= week_ago,
        ).scalar() or 0
        customers = self.db.query(func.count(Customer.id)).filter(
            Customer.organization_id == org_id,
            not_merged,
            Customer.lead_stage == LeadStage.CUSTOMER,
        ).scalar() or 0
        return {
            "total_people": total,
            "new_leads_7d": new_leads,
            "customers": customers,
            "synced_to_crm": 0,
        }

    def get_customer(self, org_id: UUID, customer_id: UUID) -> Optional[Customer]:
        customer = self.db.query(Customer).filter(
            Customer.id == customer_id, Customer.organization_id == org_id,
        ).first()
        # Follow the merge pointer so stale links open the surviving record.
        seen = set()
        while customer and customer.merged_into_customer_id and customer.id not in seen:
            seen.add(customer.id)
            customer = self.db.query(Customer).filter(
                Customer.id == customer.merged_into_customer_id,
                Customer.organization_id == org_id,
            ).first()
        return customer

    def get_detail(self, org_id: UUID, customer_id: UUID) -> Optional[dict]:
        customer = self.get_customer(org_id, customer_id)
        if not customer:
            return None
        customer_id = customer.id  # may differ if a merged row was requested

        responses = (
            self.db.query(LeadCaptureResponse)
            .filter(LeadCaptureResponse.customer_id == customer_id)
            .order_by(LeadCaptureResponse.created_at)
            .all()
        )
        # Merge the fields captured across submissions; latest AI summary wins.
        attrs: dict = {}
        qualified = False
        summary = None
        for r in responses:
            qualified = qualified or bool(r.qualified)
            for k, v in (r.field_values or {}).items():
                attrs[k] = v
            if r.summary:
                summary = r.summary

        name, email, anon = self._resolve_display(customer, attrs)
        return {
            "id": customer.id,
            "name": name,
            "email": email,
            "is_anonymous": anon,
            "lead_stage": customer.lead_stage,
            "qualified": qualified,
            "source": customer.lead_source,
            "created_at": customer.created_at,
            "lead_qualified_at": customer.lead_qualified_at,
            "meta_data": customer.meta_data,
            "summary": summary,
            "captured_attributes": attrs,
            "timeline": self._timeline(customer),
            "conversations": self._conversations(customer_id),
        }

    def _timeline(self, customer: Customer) -> List[dict]:
        entries = [{"stage": "visitor", "at": customer.created_at}]
        if customer.lead_qualified_at:
            entries.append({"stage": "lead", "at": customer.lead_qualified_at})
        # No dedicated became-customer timestamp in phase 1; approximate with updated_at.
        if customer.lead_stage == LeadStage.CUSTOMER and customer.updated_at:
            entries.append({"stage": "customer", "at": customer.updated_at})
        return [e for e in entries if e["at"] is not None]

    def _conversations(self, customer_id: UUID) -> List[dict]:
        sessions = (
            self.db.query(SessionToAgent)
            .filter(SessionToAgent.customer_id == customer_id)
            .order_by(desc(SessionToAgent.assigned_at))
            .limit(20)
            .all()
        )
        out = []
        for s in sessions:
            agent = self.db.query(Agent).filter(Agent.id == s.agent_id).first() if s.agent_id else None
            last_msg = (
                self.db.query(ChatHistory.message)
                .filter(ChatHistory.session_id == s.session_id)
                .order_by(desc(ChatHistory.created_at))
                .first()
            )
            out.append({
                "session_id": s.session_id,
                "agent_name": (agent.display_name or agent.name) if agent else None,
                "status": s.status.value if s.status else None,
                "last_message": last_msg[0] if last_msg else None,
                "created_at": s.assigned_at,
            })
        return out

    def mark_customer(self, org_id: UUID, customer_id: UUID) -> Optional[Customer]:
        customer = self.get_customer(org_id, customer_id)
        if not customer:
            return None
        customer.lead_stage = LeadStage.CUSTOMER
        self.db.commit()
        self.db.refresh(customer)
        return customer
