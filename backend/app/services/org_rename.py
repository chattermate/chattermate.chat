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

"""Carry an organization rename into the copy its agents were set up with.

Setup writes the business name into each agent's role line, description,
instructions and widget greeting. Without this, renaming the organization
leaves the old name on every card and in every chat.
"""

import re
from typing import Iterable, List, Optional
from uuid import UUID

from sqlalchemy.orm import Session

from app.models.agent import Agent
from app.models.schemas.agent import AGENT_NAME_MAX

# Agent columns that hold prose naming the business.
AGENT_TEXT_FIELDS = ("name", "display_name", "description", "topic_scope", "guardrail_prompt")
# A swap that would overflow one of these columns leaves the field as it was.
FIELD_LIMITS = {"name": AGENT_NAME_MAX, "display_name": AGENT_NAME_MAX}
# Widget copy the visitor reads.
CUSTOMIZATION_TEXT_FIELDS = ("welcome_title", "welcome_subtitle", "welcome_message")

# Not part of a URL, email address, domain or longer word: "Acme" matches in
# "Welcome to Acme." but not in "acme.com", "@acme" or "Acme-Pay".
_BEFORE = r"(?<![\w./@-])"
_AFTER = r"(?![\w/@-])(?!\.\w)"


def name_pattern(old_name: str) -> re.Pattern:
    """The old name as a whole phrase, spelt exactly as the org had it, so an
    org called "Help" doesn't rewrite "help" in ordinary sentences."""
    return re.compile(_BEFORE + re.escape(old_name.strip()) + _AFTER)


def _swap(text: Optional[str], pattern: re.Pattern, new_name: str) -> Optional[str]:
    if not text:
        return text
    # A function, so a backslash in the new name is never read as a group.
    return pattern.sub(lambda _match: new_name, text)


def _swap_fields(row, fields: Iterable[str], pattern: re.Pattern, new_name: str) -> bool:
    changed = False
    for field in fields:
        before = getattr(row, field)
        after = _swap(before, pattern, new_name)
        if after != before and len(after) <= FIELD_LIMITS.get(field, len(after)):
            setattr(row, field, after)
            changed = True
    return changed


def _swap_instructions(agent: Agent, pattern: re.Pattern, new_name: str) -> bool:
    before: List[str] = list(agent.instructions or [])
    after = [_swap(line, pattern, new_name) for line in before]
    if after == before:
        return False
    agent.instructions = after
    return True


def carry_org_rename(db: Session, organization_id: UUID, old_name: Optional[str], new_name: Optional[str]) -> int:
    """Replace the old organization name with the new one in this org's agent
    copy. Returns how many agents changed. The caller commits."""
    old, new = (old_name or "").strip(), (new_name or "").strip()
    if not old or not new or old == new:
        return 0

    pattern = name_pattern(old)
    agents = db.query(Agent).filter(Agent.organization_id == organization_id).all()
    changed = 0
    for agent in agents:
        touched = _swap_fields(agent, AGENT_TEXT_FIELDS, pattern, new)
        touched = _swap_instructions(agent, pattern, new) or touched
        if agent.customization is not None:
            touched = _swap_fields(agent.customization, CUSTOMIZATION_TEXT_FIELDS, pattern, new) or touched
        changed += touched
    return changed
