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

The rules of a journey, as pure functions: does a condition hold for what we
know about the user right now, which step comes next, what a message says.
No database, so every rule is easy to test. journey_runtime applies them.
"""

import re
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from typing import Any, Dict, Iterable, List, Optional, Set
from urllib.parse import urlparse

from app.models.schemas.journey import Audience, Condition, JourneyDefinition, Start, Step

TEMPLATE_VARIABLE = re.compile(r"\{\{\s*(user|ctx)\.([a-z][a-z0-9_]{0,39})\s*\}\}")


@dataclass
class Signals:
    """What we know about the user at this moment."""
    url: Optional[str] = None
    # Momentary: things that just happened in this update.
    events: Set[str] = field(default_factory=set)
    actions: Set[str] = field(default_factory=set)
    # Page context (unverified) and the user's own record.
    ctx: Dict[str, Any] = field(default_factory=dict)
    user: Dict[str, Any] = field(default_factory=dict)


def url_matches(pattern: str, url: Optional[str]) -> bool:
    """A page pattern against the current URL. Patterns are paths with *
    wildcards (/invoices/*), or a full URL when they start with http."""
    if not url:
        return False
    parsed = urlparse(url)
    target = url if pattern.startswith(("http://", "https://")) else (parsed.path or "/")
    regex = "^" + ".*".join(re.escape(part) for part in pattern.split("*")) + "$"
    return re.match(regex, target) is not None


def _number(value: Any) -> Optional[float]:
    if isinstance(value, bool):
        return None
    if isinstance(value, (int, float)):
        return float(value)
    if isinstance(value, str):
        try:
            return float(value)
        except ValueError:
            return None
    return None


def field_holds(value: Any, op: Optional[str], operand: Any) -> bool:
    if op in (None, "exists"):
        return value is not None and value != ""
    if op == "eq":
        return value == operand or (value is not None and str(value) == str(operand))
    if op == "neq":
        return not field_holds(value, "eq", operand)
    left, right = _number(value), _number(operand)
    if left is None or right is None:
        return False
    return {"gt": left > right, "gte": left >= right, "lt": left < right, "lte": left <= right}[op]


def condition_holds(condition: Condition, signals: Signals) -> bool:
    if condition.kind == "url":
        return url_matches(condition.value, signals.url)
    if condition.kind == "event":
        return condition.value in signals.events
    if condition.kind == "action":
        return condition.value in signals.actions
    source = signals.ctx if condition.kind == "ctx" else signals.user
    return field_holds(source.get(condition.value), condition.op, condition.operand)


def any_holds(conditions: Iterable[Condition], signals: Signals) -> Optional[Condition]:
    """The first condition that holds, or None."""
    return next((c for c in conditions if condition_holds(c, signals)), None)


def step_reached(step: Step, signals: Signals) -> bool:
    """A step without triggers starts as soon as it is current."""
    return not step.triggers or any_holds(step.triggers, signals) is not None


def done_label(condition: Condition) -> str:
    return f"{condition.kind}:{condition.value}"[:80]


def is_new_user(first_seen: Optional[datetime], user: Dict[str, Any], now: datetime, days: int) -> bool:
    """Signed up (when the site says so) or first seen within `days`."""
    signed_up = user.get("signed_up_at")
    if isinstance(signed_up, str):
        try:
            when = datetime.fromisoformat(signed_up.replace("Z", "+00:00"))
            return now - _aware(when, now) <= timedelta(days=days)
        except ValueError:
            pass
    return first_seen is not None and now - _aware(first_seen, now) <= timedelta(days=days)


def _aware(moment: datetime, like: datetime) -> datetime:
    return moment if moment.tzinfo or not like.tzinfo else moment.replace(tzinfo=like.tzinfo)


def audience_matches(audience: Audience, signals: Signals, *, new_user: bool) -> bool:
    if audience.kind == "new_users" and not new_user:
        return False
    return all(condition_holds(rule, signals) for rule in audience.rules)


def start_matches(start: Start, signals: Signals) -> bool:
    if start.kind == "manual":
        return False
    if start.kind == "url":
        return url_matches(start.value or "", signals.url)
    return (start.value or "") in signals.events


def render(template: str, signals: Signals, fallbacks: Dict[str, str]) -> str:
    """Fill {{user.x}} and {{ctx.x}}; a missing value uses its fallback, else nothing."""
    def fill(match: re.Match) -> str:
        source, name = match.group(1), match.group(2)
        value = (signals.user if source == "user" else signals.ctx).get(name)
        if value is None or value == "":
            return fallbacks.get(f"{source}.{name}", fallbacks.get(name, ""))
        return str(value)
    return re.sub(r"\s{2,}", " ", TEMPLATE_VARIABLE.sub(fill, template)).strip()


def step_index(definition: JourneyDefinition, step_id: Optional[str]) -> Optional[int]:
    return next((i for i, s in enumerate(definition.steps) if s.id == step_id), None)


def variables_in(definition: JourneyDefinition) -> List[str]:
    """Every {{source.name}} the journey's messages use, for the editor's checks."""
    found = []
    for step in definition.steps:
        for text in [step.message, *(c.label for c in step.chips), step.nudge.message if step.nudge else ""]:
            for source, name in TEMPLATE_VARIABLE.findall(text):
                ref = f"{source}.{name}"
                if ref not in found:
                    found.append(ref)
    return found
