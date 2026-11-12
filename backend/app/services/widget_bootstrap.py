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

Who is opening a widget, and what the widget needs to start.

Shared by the HTML route (`/widgets/{id}/data`, which bakes the result into the
page) and the JSON route the framed widget calls (`/widgets/{id}/bootstrap`), so
token rules can never drift between the two.
"""

from dataclasses import dataclass
from typing import Optional

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.services.page_suggestions import every_page_labels
from app.core.config import settings
from app.core.logger import get_logger
from app.core.s3 import get_s3_signed_url
from app.core.security import create_conversation_token
from app.models.agent import Agent
from app.models.widget import Widget
from app.repositories.widget import WidgetRepository
from app.services import conversation_token, launcher, widget_ui
from app.services.widget_help_center import help_center_url
from app.services.feature_gate import WORKFLOW_FEATURE, plan_feature_on, plan_hides_branding
from app.utils.business_hours import is_within_business_hours

logger = get_logger(__name__)

TOKEN_REQUIRED_CODE = "token_required"
IDENTITY_EXPIRED_MESSAGE = "Conversation token expired. Issue a new one with /generate-token."


class WidgetAccessDenied(Exception):
    """The visitor may not open this widget as things stand.

    `code` is `conversation_token.IDENTITY_EXPIRED_CODE` (a signed-in visitor's
    identity lapsed: re-identify and retry) or `TOKEN_REQUIRED_CODE` (the agent
    only talks to identified visitors and none was given).
    """

    def __init__(self, code: str):
        super().__init__(code)
        self.code = code


@dataclass(frozen=True)
class WidgetSession:
    widget: Widget
    agent: Agent
    customer_id: Optional[str]
    token: str
    presence: dict
    runs_workflow: bool
    hide_branding: bool


def agent_runs_workflow(db: Session, agent: Agent) -> bool:
    """Whether visitors get the agent's workflow, which its plan can take away."""
    return (bool(agent.use_workflow and agent.active_workflow_id)
            and plan_feature_on(db, agent.organization_id, WORKFLOW_FEATURE))


def find_widget(db: Session, widget_id: str) -> Widget:
    widget = db.query(Widget).filter(Widget.id == widget_id).first()
    if not widget:
        raise HTTPException(status_code=404, detail="Widget not found")
    return widget


def _presence(agent: Agent) -> dict:
    """What the header may honestly claim. Only a human-handled agent needs the
    business-hours check: while the AI answers, it answers at 3am too."""
    return {
        'mode': 'ai' if agent.ai_replies_enabled else 'human',
        'available': True if agent.ai_replies_enabled
                     else is_within_business_hours(agent.organization),
    }


def conversation_key(token_payload: Optional[dict]) -> str:
    """Keep the browser's conversation key across re-mints, or start one.

    Never an account key: only our backend mints those, for one signed-in
    dashboard account, and every token the widget issues is unverified.
    """
    key = (token_payload or {}).get(conversation_token.CONVERSATION_KEY_CLAIM)
    if key and not conversation_token.is_account_key(key):
        return key
    return conversation_token.new_conversation_key()


def mint_widget_token(widget_id: str, conversation_key: str, customer_id: Optional[str] = None,
                       source: Optional[str] = None, token_payload: Optional[dict] = None) -> str:
    """A conversation token the widget issues itself - unverified, so always scoped.

    Prefers a fresh `source` (first-visit Explore flow) over one the visitor's
    earlier token carried.
    """
    extra_data = {conversation_token.CONVERSATION_KEY_CLAIM: conversation_key}
    source = source or (token_payload or {}).get("source")
    if widget_id == settings.EXPLORE_WIDGET_ID and source:
        extra_data["source"] = source
    return create_conversation_token(widget_id=widget_id, customer_id=customer_id, **extra_data)


def open_session(db: Session, widget: Widget, token: Optional[str], source: Optional[str]) -> WidgetSession:
    """Validate the visitor's token, or mint an anonymous one.

    Raises WidgetAccessDenied when the visitor can't open the widget, and a 404
    when its agent is gone.
    """
    agent = WidgetRepository(db).get_widget_agent(widget)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    customer_id = None
    token_payload = None
    if token:
        state = conversation_token.inspect(token, widget.id)
        if state.is_live:
            token_payload = state.payload
            customer_id = state.payload.get("sub")
        elif state.identity_lost:
            # A lapsed token that named a customer is a signed-in visitor whose
            # identity just ran out - say so rather than starting them over as a
            # brand-new anonymous visitor.
            raise WidgetAccessDenied(conversation_token.IDENTITY_EXPIRED_CODE)
        else:
            token = None

    if getattr(agent, 'require_token_auth', False):
        if not token or customer_id is None:
            logger.warning(f"Widget opened without a valid token but require_token_auth=true, widget_id={widget.id}")
            raise WidgetAccessDenied(TOKEN_REQUIRED_CODE)
    elif not (token and customer_id):
        # Unverified, so always scoped to this browser: a live token that names
        # no customer yet keeps its conversation key
        token = mint_widget_token(widget.id, conversation_key(token_payload), source=source)

    return WidgetSession(widget=widget, agent=agent, customer_id=customer_id, token=token, presence=_presence(agent),
                         runs_workflow=agent_runs_workflow(db, agent),
                         hide_branding=plan_hides_branding(db, agent.organization_id))


async def _customization(db: Session, agent: Agent) -> dict:
    customization = agent.customization
    if not customization:
        defaults = launcher.uncustomized_defaults()
        defaults['customization_metadata'] = widget_ui.served_metadata(defaults['customization_metadata'])
        return defaults

    photo_url = customization.photo_url
    if settings.S3_FILE_STORAGE and photo_url:
        photo_url = await get_s3_signed_url(photo_url)

    metadata, logo_url = widget_ui.for_visitors(db, agent)

    return {
        "chat_background_color": customization.chat_background_color,
        "chat_text_color": customization.chat_text_color,
        "chat_bubble_color": customization.chat_bubble_color,
        "accent_color": customization.accent_color,
        "font_family": customization.font_family,
        "photo_url": photo_url,
        "chat_style": customization.chat_style.value if customization.chat_style else "CHATBOT",
        "widget_position": customization.widget_position.value if customization.widget_position else "FLOATING",
        "welcome_title": customization.welcome_title,
        "welcome_subtitle": customization.welcome_subtitle,
        "welcome_message": customization.welcome_message,
        "chat_initiation_messages": customization.chat_initiation_messages or [],
        # Every-page ones as plain strings: page rules are placed by the server
        "quick_actions": every_page_labels(customization.quick_actions),
        "show_citations": customization.show_citations,
        "collect_email": customization.collect_email,
        # A human-only agent never produces an AI reply, so disclosing one
        # would be untrue — same reason the widget hides it after takeover.
        "show_ai_disclaimer": customization.show_ai_disclaimer and agent.ai_replies_enabled,
        "customization_metadata": metadata,
        "launcher_logo_url": logo_url,
    }


async def initial_data(db: Session, session: WidgetSession) -> dict:
    """What the widget boots from (`window.__INITIAL_DATA__` in the HTML route)."""
    agent = session.agent
    customization = await _customization(db, agent)
    return {
        "widgetId": session.widget.id,
        "agentName": agent.display_name or agent.name,
        "customization": customization,
        "customerId": session.customer_id or "",
        "initialToken": session.token or "",
        "customer": {},
        "workflow": session.runs_workflow,
        "allowAttachments": bool(agent.allow_attachments),
        "presence": session.presence,
        "hideBranding": session.hide_branding,
        "helpCenterUrl": help_center_url(db, agent.organization_id),
    }
