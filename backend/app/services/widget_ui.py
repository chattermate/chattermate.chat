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

Which widget design visitors are served.

An agent picks the classic widget (1) or the redesigned one (2) in
customization_metadata.widget_ui. The operator switch WIDGET_UI_V2_ENABLED turns
the redesign off for everyone at once: visitors then get the classic widget,
while the agent's stored choice is kept for when it is turned back on.
"""

from typing import Optional, Tuple

from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.agent import Agent
from app.services import launcher

WIDGET_UI_KEY = 'widget_ui'
CLASSIC = 1


def served_metadata(metadata: dict) -> dict:
    """The metadata with the design visitors actually get. Never changes the given
    dict: it is returned as is, or copied when the design is overridden."""
    if settings.WIDGET_UI_V2_ENABLED or WIDGET_UI_KEY not in metadata:
        return metadata
    return {**metadata, WIDGET_UI_KEY: {'version': CLASSIC}}


def keep_stored_choice(stored_metadata: Optional[dict], incoming_metadata: Optional[dict]) -> Optional[dict]:
    """A save replaces the whole metadata dict; one that leaves widget_ui out (an
    API client, the CLI) keeps the stored design instead of silently going back to
    the classic widget. An explicit widget_ui (null included) is the new choice."""
    if not incoming_metadata or WIDGET_UI_KEY in incoming_metadata:
        return incoming_metadata
    stored = (stored_metadata or {}).get(WIDGET_UI_KEY)
    if stored is None:
        return incoming_metadata
    return {**incoming_metadata, WIDGET_UI_KEY: stored}


def for_visitors(db: Session, agent: Agent) -> Tuple[dict, Optional[str]]:
    """customization_metadata and launcher logo URL as visitors get them: the
    launcher plan check, then the widget design switch."""
    metadata, logo_url = launcher.for_visitors(db, agent)
    return served_metadata(metadata), logo_url


def serves_redesign(customization: Optional[dict]) -> bool:
    """Whether the customization visitors are served (after the kill switch) is
    the redesigned widget."""
    metadata = (customization or {}).get("customization_metadata") or {}
    return (metadata.get(WIDGET_UI_KEY) or {}).get("version") == 2

