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

Agents created from now on start on the redesign and stay there: their row says
so with `created_on_ui: 2`, a key only the server writes (see stamp_new_agent).
Agents created before have no such key and may switch freely.
"""

from typing import Optional, Tuple
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy import event
from sqlalchemy.orm import Session, object_session

from app.core.config import settings
from app.models.agent import Agent, AgentCustomization
from app.services import launcher

WIDGET_UI_KEY = 'widget_ui'
CREATED_ON_KEY = 'created_on_ui'
CLASSIC = 1
REDESIGN = 2
# What a newly created agent's row holds: the redesign, for good.
NEW_AGENT_CHOICE = {'version': REDESIGN, CREATED_ON_KEY: REDESIGN}
# The agents created in this database session (Session.info), whose first
# customization row is stamped with NEW_AGENT_CHOICE as it is inserted.
_NEW_AGENTS = 'widget_ui_new_agents'
STAYS_ON_REDESIGN = 'This agent was created on the new widget design and stays on it.'


def served_metadata(metadata: dict) -> dict:
    """The metadata with the design visitors actually get. Never changes the given
    dict: it is returned as is, or copied when the design is overridden."""
    if settings.WIDGET_UI_V2_ENABLED or WIDGET_UI_KEY not in metadata:
        return metadata
    return {**metadata, WIDGET_UI_KEY: {'version': CLASSIC}}


def created_on_redesign(metadata: Optional[dict]) -> bool:
    """Whether the agent was created on the redesign (server-owned created_on_ui)."""
    return ((metadata or {}).get(WIDGET_UI_KEY) or {}).get(CREATED_ON_KEY) == REDESIGN


def keep_stored_choice(stored_metadata: Optional[dict], incoming_metadata: Optional[dict]) -> Optional[dict]:
    """A save replaces the whole metadata dict; one that leaves widget_ui out (an
    API client, the CLI) keeps the stored design instead of silently going back to
    the classic widget. An explicit widget_ui (null included) is the new choice,
    except for an agent created on the redesign: it keeps created_on_ui (which no
    client can send: WidgetUiConfig drops it) and may not go back to the classic
    widget (400)."""
    stored = (stored_metadata or {}).get(WIDGET_UI_KEY)
    locked = created_on_redesign(stored_metadata)
    if incoming_metadata is None:
        return {WIDGET_UI_KEY: stored} if locked else None
    if WIDGET_UI_KEY not in incoming_metadata:
        return incoming_metadata if stored is None else {**incoming_metadata, WIDGET_UI_KEY: stored}
    if not locked:
        return incoming_metadata
    choice = incoming_metadata[WIDGET_UI_KEY] or {}
    if choice.get('version') != REDESIGN:
        raise HTTPException(status_code=400, detail=STAYS_ON_REDESIGN)
    return {**incoming_metadata, WIDGET_UI_KEY: {**choice, CREATED_ON_KEY: REDESIGN}}


def mark_new_agent(db: Session, agent_id: UUID) -> None:
    """Called wherever an agent is created (AgentRepository.create_agent): its
    first customization row, inserted in this session, starts it on the redesign."""
    db.info.setdefault(_NEW_AGENTS, set()).add(agent_id)


def new_agent_metadata(metadata: Optional[dict]) -> dict:
    """A new agent's first metadata: what it was given, on the redesign for good."""
    return {**(metadata or {}), WIDGET_UI_KEY: dict(NEW_AGENT_CHOICE)}


def _is_new_agents_row(target: AgentCustomization):
    """The session, if this row belongs to an agent created in it and not stamped yet."""
    session = object_session(target)
    if session is None or target.agent_id not in session.info.get(_NEW_AGENTS, ()):
        return None
    return session


@event.listens_for(AgentCustomization, 'before_insert')
def stamp_new_agent(_mapper, _connection, target: AgentCustomization) -> None:
    """Every creation path inserts the new agent's row its own way (the agent API
    creates it at once; other callers of create_agent add their own row after it).
    Stamping on insert covers them all, and only rows of agents created in this
    session, so an existing agent's first row (its first save) stays classic."""
    if _is_new_agents_row(target):
        target.customization_metadata = new_agent_metadata(target.customization_metadata)


@event.listens_for(AgentCustomization, 'after_insert')
def forget_stamped_agent(_mapper, _connection, target: AgentCustomization) -> None:
    """Only once the row is in: an insert that failed and is retried is stamped again."""
    session = _is_new_agents_row(target)
    if session is not None:
        session.info[_NEW_AGENTS].discard(target.agent_id)


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

