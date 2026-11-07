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

Running journeys for one widget visitor. The server owns progress: the widget
only reports what changed (the page, an app event, the page's context, an
action that succeeded) and shows the step it is told to.
"""

from dataclasses import replace
from datetime import datetime, timezone
from typing import Any, Dict, Iterable, List, Optional, Tuple
from uuid import UUID

from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.agent_action import AgentAction
from app.models.customer import Customer
from app.models.journey import Journey, JourneyProgress, JourneyStatus, ProgressStatus
from app.models.schemas.journey import JourneyDefinition, Step
from app.repositories.agent_action import AgentActionRepository
from app.repositories.customer import CustomerRepository
from app.repositories.journey import JourneyProgressRepository, JourneyRepository
from app.services.journey_access import journeys_allowed
from app.services.journey_engine import (
    Signals, any_holds, audience_matches, condition_holds, done_label, is_new_user, render, start_matches, step_index,
    step_reached,
)

USER_SCALARS = (str, int, float, bool)


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _uuid(value: Any) -> UUID:
    return value if isinstance(value, UUID) else UUID(str(value))


def user_fields(customer: Optional[Customer]) -> Dict[str, Any]:
    """What {{user.*}} and user conditions can use: the person's own record."""
    if customer is None:
        return {}
    fields: Dict[str, Any] = {
        key: value for key, value in (customer.meta_data or {}).items()
        if isinstance(key, str) and isinstance(value, USER_SCALARS)
    }
    name = (customer.full_name or "").strip()
    fields.update({
        "name": name or None,
        "first_name": name.split(" ")[0] if name else None,
        "email": customer.email,
    })
    return fields


def _signals(session: dict, customer: Optional[Customer], events: Iterable[str], actions: Iterable[str]) -> Signals:
    return Signals(
        url=session.get("host_url"),
        events=set(events),
        actions=set(actions),
        ctx=dict(session.get("host_context") or {}),
        user=user_fields(customer),
    )


def _definition(journey: Journey) -> Optional[JourneyDefinition]:
    try:
        return JourneyDefinition.model_validate(journey.definition)
    except ValueError:
        return None  # saved under rules that have since tightened: leave it be


def _chips(db: Session, journey: Journey, step: Step, signals: Signals, fallbacks: Dict[str, str]) -> List[dict]:
    """Reply chips, with what the widget needs to run an action chip. A chip for
    an action that is gone or off is left out, and so is one its hide_when hides."""
    actions = {a.name: a for a in AgentActionRepository(db).enabled_by_names(journey.agent_id, step.allowed_actions)}
    chips = []
    for chip in step.chips:
        if chip.hide_when and condition_holds(chip.hide_when, signals):
            continue
        item = {"label": render(chip.label, signals, fallbacks), "kind": chip.kind, "value": chip.value}
        if chip.kind == "action":
            action = actions.get(chip.value)
            if action is None:
                continue
            item["action"] = {"label": action.label, "confirm": action.confirm, "timeout_s": action.timeout_s}
        chips.append(item)
    return chips


class JourneyRunner:
    """One visitor's journeys with one agent."""

    def __init__(self, db: Session, session: dict):
        self.db = db
        self.session = session
        self.agent_id = _uuid(session["agent_id"])
        self.customer_id = _uuid(session["customer_id"])
        self.journeys = JourneyRepository(db)
        self.progress = JourneyProgressRepository(db)

    def allowed(self) -> bool:
        return journeys_allowed(self.db, _uuid(self.session["org_id"]))

    # --- what the widget calls -------------------------------------------

    def sync(self, *, events: Iterable[str] = (), actions: Iterable[str] = ()) -> Optional[dict]:
        """Apply what just happened and return the step to show (None: nothing)."""
        if not self.allowed():
            return None
        customer = CustomerRepository(self.db).get_by_id(self.customer_id)
        signals = _signals(self.session, customer, events, actions)
        self._record_goals(signals.events)
        progress = self.progress.active(self.agent_id, self.customer_id) or self._start_matching(signals, customer)
        if progress is None:
            return None
        return self._advance(progress, signals)

    def skip(self) -> Optional[dict]:
        progress = self.progress.active(self.agent_id, self.customer_id)
        journey = self._live(progress)
        definition = _definition(journey) if journey else None
        if not definition:
            return None
        index = step_index(definition, progress.current_step_id)
        if index is None or not definition.steps[index].skippable:
            return self.sync()
        row = self.progress.step(progress, definition.steps[index].id)
        row.reached_at = row.reached_at or _now()
        row.skipped_at = _now()
        row.done_by = "skip"
        self._move_to(progress, definition, index + 1)
        return self.sync()

    def dismiss(self) -> None:
        progress = self.progress.active(self.agent_id, self.customer_id)
        if progress is not None:
            progress.status = ProgressStatus.DISMISSED.value
            self.progress.commit()

    def start(self, key: str) -> Optional[dict]:
        """ChatterMate.startJourney(key): replaces the active journey."""
        if not self.allowed():
            return None
        journey = self.journeys.get_by_key(self.agent_id, key)
        if journey is None or journey.status != JourneyStatus.LIVE.value:
            return None
        customer = CustomerRepository(self.db).get_by_id(self.customer_id)
        signals = _signals(self.session, customer, (), ())
        if not self._audience_ok(journey, signals, customer):
            return None
        if self.progress.taken(self.agent_id, self.customer_id).get(journey.id):
            return self.sync()  # already been through it
        self.dismiss()
        progress = self._begin(journey)
        return self._advance(progress, signals) if progress else None

    def current_step(self) -> Optional[Tuple[Journey, Step]]:
        """The live journey and step this user is on now, without moving them."""
        if not self.allowed():
            return None
        progress = self.progress.active(self.agent_id, self.customer_id)
        journey = self._live(progress)
        definition = _definition(journey) if journey else None
        if definition is None:
            return None
        index = step_index(definition, progress.current_step_id)
        return (journey, definition.steps[index]) if index is not None else None

    # --- internals -------------------------------------------------------

    def _live(self, progress: Optional[JourneyProgress]) -> Optional[Journey]:
        if progress is None:
            return None
        journey = self.db.get(Journey, progress.journey_id)
        # Paused (or a downgraded plan) freezes progress where it is.
        return journey if journey and journey.status == JourneyStatus.LIVE.value else None

    def _record_goals(self, events: Iterable[str]) -> None:
        events = set(events)
        if not events:
            return
        for journey in self.journeys.list_for_agent(self.agent_id):
            if journey.goal_event and journey.goal_event in events:
                self.progress.mark_goal(journey.id, self.customer_id)

    def _audience_ok(self, journey: Journey, signals: Signals, customer: Optional[Customer]) -> bool:
        definition = _definition(journey)
        if definition is None:
            return False
        new_user = is_new_user(customer.created_at if customer else None, signals.user, _now(),
                               settings.JOURNEY_NEW_USER_DAYS)
        return audience_matches(definition.audience, signals, new_user=new_user)

    def _start_matching(self, signals: Signals, customer: Optional[Customer]) -> Optional[JourneyProgress]:
        """The highest-priority live journey this user hasn't taken whose start
        and audience both match now."""
        taken = self.progress.taken(self.agent_id, self.customer_id)
        for journey in self.journeys.live_for_agent(self.agent_id):
            definition = _definition(journey)
            if journey.id in taken or definition is None:
                continue
            if start_matches(definition.start, signals) and self._audience_ok(journey, signals, customer):
                return self._begin(journey)
        return None

    def _begin(self, journey: Journey) -> Optional[JourneyProgress]:
        definition = _definition(journey)
        if definition is None:
            return None
        return self.progress.start(journey, self.customer_id, definition.steps[0].id)

    def _move_to(self, progress: JourneyProgress, definition: JourneyDefinition, index: int) -> None:
        if index >= len(definition.steps):
            progress.current_step_id = None
            progress.status = ProgressStatus.FINISHED.value
            progress.finished_at = _now()
        else:
            progress.current_step_id = definition.steps[index].id
        self.progress.commit()

    def _current_index(self, progress: JourneyProgress, definition: JourneyDefinition) -> Optional[int]:
        """Where the user is. After an edit removed their step, they move on to
        the first step they haven't finished."""
        index = step_index(definition, progress.current_step_id)
        if index is not None:
            return index
        finished = {r.step_id for r in self.progress.steps(progress.id) if r.done_at or r.skipped_at}
        index = next((i for i, s in enumerate(definition.steps) if s.id not in finished), None)
        if index is None:
            self._move_to(progress, definition, len(definition.steps))
            return None
        progress.current_step_id = definition.steps[index].id
        progress.journey_version = self.db.get(Journey, progress.journey_id).version
        self.progress.commit()
        return index

    def _advance(self, progress: JourneyProgress, signals: Signals) -> Optional[dict]:
        journey = self._live(progress)
        definition = _definition(journey) if journey else None
        if definition is None:
            return None
        fallbacks = definition.variable_fallbacks
        notice: Optional[Tuple[str, str]] = None
        index = self._current_index(progress, definition)
        while index is not None and progress.status == ProgressStatus.ACTIVE.value:
            step = definition.steps[index]
            row = self.progress.step(progress, step.id)
            if row.reached_at is None and step_reached(step, signals):
                row.reached_at = _now()
            if row.reached_at is None:
                break  # waiting for the user to get there
            condition = any_holds(step.done_when, signals)
            if condition is None:
                break
            row.done_at = _now()
            row.done_by = done_label(condition)
            if step.then.kind in ("message", "block"):
                notice = (step.then.kind, render(step.then.value or "", signals, fallbacks))
            if step.then.kind == "start_journey":
                self._move_to(progress, definition, len(definition.steps))
                return self._chain(step.then.value or "", signals, notice)
            self._move_to(progress, definition, index + 1)
            index = index + 1 if index + 1 < len(definition.steps) else None
            # What just happened finishes one step, not the next one too.
            signals = replace(signals, events=set(), actions=set())

        progress.last_seen_at = _now()
        self.progress.commit()
        return self._view(journey, definition, progress, signals, notice)

    def _chain(self, key: str, signals: Signals, notice: Optional[Tuple[str, str]]) -> Optional[dict]:
        """Then → start another journey: its audience must hold, its start trigger needn't."""
        journey = self.journeys.get_by_key(self.agent_id, key)
        customer = CustomerRepository(self.db).get_by_id(self.customer_id)
        if (journey is None or journey.status != JourneyStatus.LIVE.value
                or self.progress.taken(self.agent_id, self.customer_id).get(journey.id)
                or not self._audience_ok(journey, signals, customer)):
            return {"notice": _notice(notice), "finished": True} if notice else None
        progress = self._begin(journey)
        view = self._advance(progress, replace(signals, events=set(), actions=set())) if progress else None
        if view is not None and notice and not view.get("notice"):
            view["notice"] = _notice(notice)
        return view

    def _view(self, journey: Journey, definition: JourneyDefinition, progress: JourneyProgress,
              signals: Signals, notice: Optional[Tuple[str, str]]) -> Optional[dict]:
        fallbacks = definition.variable_fallbacks
        base = {"journey_key": journey.key, "journey_name": journey.name, "auto_open": journey.auto_open,
                "step_count": len(definition.steps), "step_titles": [s.title for s in definition.steps],
                "notice": _notice(notice)}
        if progress.status == ProgressStatus.FINISHED.value:
            message = render(definition.finish.message, signals, fallbacks)
            return {**base, "finished": True, "message": message or None}
        index = step_index(definition, progress.current_step_id)
        if index is None:
            return None
        step = definition.steps[index]
        row = self.progress.step(progress, step.id)
        if row.reached_at is None:
            return {**base, "finished": False, "waiting": True, "step_index": index, "message": None}
        # The message is sent every time (it isn't in the chat until answered, so a
        # reload must show it again); `fresh` marks its first showing, which is
        # when the panel may open by itself.
        fresh = row.shown_at is None
        if fresh:
            row.shown_at = _now()
            self.progress.commit()
        return {
            **base,
            "finished": False,
            "waiting": False,
            "step_id": step.id,
            "step_index": index,
            "title": step.title,
            "message": render(step.message, signals, fallbacks) or None,
            "fresh": fresh,
            "chips": _chips(self.db, journey, step, signals, fallbacks),
            "skippable": step.skippable,
            "nudge": step.nudge.model_dump() if step.nudge else None,
        }


def _notice(notice: Optional[Tuple[str, str]]) -> Optional[dict]:
    if not notice or not notice[1]:
        return None
    return {"kind": notice[0], "text": notice[1]}


def step_actions_hint(db: Session, session: dict, offered: Iterable[AgentAction]) -> Optional[str]:
    """Prompt text naming which of this turn's actions finish the step the user
    is on. A suggestion, never a limit: the user can still ask for anything the
    agent can do, and every action keeps its own confirm policy."""
    offered = list(offered)
    if not offered or not session.get("customer_id"):
        return None
    found = JourneyRunner(db, session).current_step()
    if found is None:
        return None
    journey, step = found
    suggested = [a for a in offered if a.name in step.allowed_actions]
    if not suggested:
        return None
    names = ", ".join(f"{a.name} ({a.label})" for a in suggested)
    return (
        f'The user is on the step "{step.title}" of the app\'s guide "{journey.name}". '
        f"These actions finish it: {names}. When the user wants help with this step, "
        "offer or use one; they can still ask for anything else."
    )
