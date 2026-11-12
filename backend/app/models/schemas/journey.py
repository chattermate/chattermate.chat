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

import re
from datetime import datetime
from typing import Dict, List, Literal, Optional, Union
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_serializer, model_validator

from app.core.config import settings
from app.models.journey import JourneyStatus
from app.models.schemas.agent_action import ACTION_NAME_PATTERN

KEY_PATTERN = re.compile(r"^[a-z][a-z0-9_]{0,63}$")
STEP_ID_PATTERN = re.compile(r"^[A-Za-z0-9_-]{1,64}$")
# Page context and token field names, as setContext and the token carry them.
FIELD_PATTERN = re.compile(r"^[a-z][a-z0-9_]{0,39}$")
MAX_CHIPS = 4

Scalar = Union[str, int, float, bool]


class Condition(BaseModel):
    """One thing that can be true about a user: on a page, an app event, a
    field value, or an action that just succeeded."""
    kind: Literal["url", "event", "ctx", "user", "action"]
    # URL pattern (* wildcard), event name, field name or action name.
    value: str = Field(min_length=1, max_length=200)
    # For ctx/user: how the field is compared; defaults to "exists".
    op: Optional[Literal["eq", "neq", "gt", "gte", "lt", "lte", "exists"]] = None
    operand: Optional[Scalar] = None

    @model_validator(mode="after")
    def _check(self) -> "Condition":
        if self.kind in ("ctx", "user") and not FIELD_PATTERN.match(self.value):
            raise ValueError(f"'{self.value}' is not a field name")
        if self.kind in ("event", "action") and not KEY_PATTERN.match(self.value):
            raise ValueError(f"'{self.value}' is not an event or action name")
        if self.op not in (None, "exists") and self.operand is None:
            raise ValueError(f"'{self.op}' needs a value to compare with")
        return self


class Chip(BaseModel):
    label: str = Field(min_length=1, max_length=80)
    kind: Literal["text", "action"] = "text"
    # The text it sends, or the action it runs.
    value: str = Field(min_length=1, max_length=500)
    # Left out of the step while this holds, and back when it stops.
    hide_when: Optional[Condition] = None

    @field_validator("hide_when")
    @classmethod
    def _lasting(cls, value: Optional[Condition]) -> Optional[Condition]:
        # Events and actions hold for one update, so the chip would flash off.
        if value and value.kind in ("event", "action"):
            raise ValueError("A chip can only be hidden by the page or a field value")
        return value

    @model_serializer(mode="wrap")
    def _omit_unset(self, handler):
        # An unset rule stays out of the stored definition, or saving an older
        # journey would count as a change to it.
        data = handler(self)
        if data.get("hide_when") is None:
            data.pop("hide_when", None)
        return data


class Then(BaseModel):
    kind: Literal["next", "message", "block", "start_journey"] = "next"
    # The message, the block's markdown (e.g. a code snippet), or a journey key.
    value: Optional[str] = Field(default=None, max_length=4000)

    @model_validator(mode="after")
    def _check(self) -> "Then":
        if self.kind != "next" and not self.value:
            raise ValueError(f"'{self.kind}' needs a value")
        if self.kind == "start_journey" and not KEY_PATTERN.match(self.value or ""):
            raise ValueError("Pick the journey to start")
        return self


class Nudge(BaseModel):
    after_min: int = Field(ge=1, le=120)
    message: str = Field(min_length=1, max_length=500)


class Step(BaseModel):
    id: str
    title: str = Field(min_length=1, max_length=80)
    skippable: bool = True
    # Any one is enough. None: the step starts as soon as the previous one is done.
    triggers: List[Condition] = Field(default_factory=list, max_length=10)
    message: str = Field(default="", max_length=1000)
    chips: List[Chip] = Field(default_factory=list, max_length=MAX_CHIPS)
    allowed_actions: List[str] = Field(default_factory=list, max_length=30)
    # Any one is enough.
    done_when: List[Condition] = Field(min_length=1, max_length=10)
    then: Then = Field(default_factory=Then)
    nudge: Optional[Nudge] = None

    @field_validator("id")
    @classmethod
    def _valid_id(cls, value: str) -> str:
        if not STEP_ID_PATTERN.match(value):
            raise ValueError("Step ids are letters, digits, - and _")
        return value

    @model_validator(mode="after")
    def _check(self) -> "Step":
        for name in self.allowed_actions:
            if not ACTION_NAME_PATTERN.match(name):
                raise ValueError(f"'{name}' is not an action name")
        for chip in self.chips:
            if chip.kind == "action" and chip.value not in self.allowed_actions:
                raise ValueError(f"{chip.value} isn't allowed on this step.")
        if any(t.kind == "action" for t in self.triggers):
            raise ValueError("A step can't start on an action; use a page, event or field")
        if any(c.kind == "url" for c in self.done_when):
            raise ValueError("A step can't be done by visiting a page; use an action, event or field")
        return self


class Audience(BaseModel):
    kind: Literal["everyone", "new_users", "rules"] = "everyone"
    # All of these must hold (ctx/user conditions), with any kind.
    rules: List[Condition] = Field(default_factory=list, max_length=10)

    @model_validator(mode="after")
    def _check(self) -> "Audience":
        if any(r.kind not in ("ctx", "user") for r in self.rules):
            raise ValueError("Audience rules compare page or user fields")
        if self.kind == "rules" and not self.rules:
            raise ValueError("Add at least one rule")
        return self


class Start(BaseModel):
    kind: Literal["url", "event", "manual"] = "url"
    value: Optional[str] = Field(default=None, max_length=200)

    @model_validator(mode="after")
    def _check(self) -> "Start":
        if self.kind != "manual" and not self.value:
            raise ValueError("Say which page or event starts the journey")
        if self.kind == "event" and not KEY_PATTERN.match(self.value or ""):
            raise ValueError(f"'{self.value}' is not an event name")
        return self


class Finish(BaseModel):
    message: str = Field(default="", max_length=1000)


class JourneyDefinition(BaseModel):
    audience: Audience = Field(default_factory=Audience)
    start: Start = Field(default_factory=lambda: Start(kind="manual"))
    steps: List[Step] = Field(min_length=1)
    finish: Finish = Field(default_factory=Finish)
    # Shown when a {{variable}} has no value.
    variable_fallbacks: Dict[str, str] = Field(default_factory=dict)

    @field_validator("steps")
    @classmethod
    def _steps(cls, steps: List[Step]) -> List[Step]:
        if len(steps) > settings.JOURNEY_MAX_STEPS:
            raise ValueError(f"A journey has at most {settings.JOURNEY_MAX_STEPS} steps")
        ids = [s.id for s in steps]
        if len(ids) != len(set(ids)):
            raise ValueError("Each step needs its own id")
        return steps

    @field_validator("variable_fallbacks")
    @classmethod
    def _fallbacks(cls, value: Dict[str, str]) -> Dict[str, str]:
        if len(value) > 50 or any(len(v) > 200 for v in value.values()):
            raise ValueError("Too many or too long fallbacks")
        return value


class JourneyFields(BaseModel):
    key: str
    name: str = Field(min_length=1, max_length=120)
    status: JourneyStatus = JourneyStatus.DRAFT
    priority: int = Field(default=0, ge=0, le=1000)
    auto_open: bool = False
    goal_event: Optional[str] = None
    template_key: Optional[str] = None
    definition: JourneyDefinition


class JourneyWrite(JourneyFields):
    @field_validator("key")
    @classmethod
    def _key(cls, value: str) -> str:
        if not KEY_PATTERN.match(value):
            raise ValueError("Use lowercase letters, digits and underscores, starting with a letter")
        return value

    @field_validator("goal_event")
    @classmethod
    def _goal(cls, value: Optional[str]) -> Optional[str]:
        if value and not KEY_PATTERN.match(value):
            raise ValueError("The goal is an event name, like first_invoice_sent")
        return value or None


class JourneyResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    agent_id: UUID
    key: str
    name: str
    status: JourneyStatus
    priority: int
    auto_open: bool
    goal_event: Optional[str] = None
    template_key: Optional[str] = None
    version: int
    definition: dict
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class JourneyStatusUpdate(BaseModel):
    status: JourneyStatus


class JourneyOrder(BaseModel):
    """Journey ids, highest priority first."""
    ids: List[UUID] = Field(max_length=100)
