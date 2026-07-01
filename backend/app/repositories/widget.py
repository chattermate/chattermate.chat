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
from app.models.widget import Widget
from app.models.schemas.widget import WidgetCreate

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


    def get_widgets(self, organization_id: str) -> list[Widget]:
        return self.db.query(Widget).filter(Widget.organization_id == organization_id).all()


    def get_widgets_by_agent(self, agent_id: str) -> list[Widget]:
        """
        Get all widgets associated with a specific agent.
        
        Args:
            agent_id: The ID of the agent
            
        Returns:
            List of Widget objects associated with the agent
        """
        return self.db.query(Widget).filter(Widget.agent_id == agent_id).all()


    def delete_widget(self, widget_id: str) -> None:
        self.db.query(Widget).filter(Widget.id == widget_id).delete()
        self.db.commit()
