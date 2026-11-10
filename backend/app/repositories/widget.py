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

from typing import Optional

from sqlalchemy.orm import Session
from app.models.agent import Agent
from app.models.widget import Widget
from app.models.schemas.widget import WidgetCreate
from app.repositories.agent import AgentRepository

class WidgetRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_widget(self, widget: WidgetCreate, organization_id: str) -> Widget:
        db_widget = Widget(
            name=widget.name,
            organization_id=organization_id,
            agent_id=widget.agent_id
        )
        self.db.add(db_widget)
        self.db.commit()
        self.db.refresh(db_widget)
        return db_widget


    def get_widget(self, widget_id: str) -> Widget:
        return self.db.query(Widget).filter(Widget.id == widget_id).first()


    def get_widget_agent(self, widget: Widget) -> Optional[Agent]:
        """The agent a widget serves, only if it's in the widget's organization.

        Every public widget surface resolves its agent here, so a widget bound
        to another tenant's agent serves nothing rather than that agent.
        """
        if widget.agent_id is None:
            return None
        return AgentRepository(self.db).get_agent_in_org(widget.agent_id, widget.organization_id)


    def get_widgets(self, organization_id: str) -> list[Widget]:
        return self.db.query(Widget).filter(Widget.organization_id == organization_id).all()


    def get_widgets_by_agent(self, agent_id: str) -> list[Widget]:
        """The agent's widgets, only those in the agent's own organization.

        A widget bound to another tenant's agent is never one of its widgets,
        so callers (dashboard, Shopify embed lookup) can't be handed one.
        """
        return self.db.query(Widget).join(
            Agent,
            (Agent.id == Widget.agent_id) & (Agent.organization_id == Widget.organization_id),
        ).filter(Widget.agent_id == agent_id).all()


    def set_allowed_domains(self, widget: Widget, allowed_domains: list[str]) -> Widget:
        # A new list, so the JSON column registers the change
        widget.allowed_domains = list(allowed_domains) or None
        self.db.commit()
        self.db.refresh(widget)
        return widget

    def delete_widget(self, widget_id: str) -> None:
        self.db.query(Widget).filter(Widget.id == widget_id).delete()
        self.db.commit()
