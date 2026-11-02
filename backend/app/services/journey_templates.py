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

The journey templates the gallery offers: JSON files in app/journeys/templates,
one per template, so adding one is data, not code.
"""

import json
from functools import lru_cache
from pathlib import Path
from typing import Dict, List, Optional

from app.models.schemas.journey import JourneyDefinition

TEMPLATES_DIR = Path(__file__).resolve().parent.parent / "journeys" / "templates"


@lru_cache(maxsize=1)
def _load() -> Dict[str, dict]:
    templates = {}
    for path in sorted(TEMPLATES_DIR.glob("*.json")):
        data = json.loads(path.read_text())
        # A template that no longer validates is a bug: fail loudly at load.
        JourneyDefinition.model_validate(data["definition"])
        templates[data["key"]] = data
    return templates


def list_templates() -> List[dict]:
    """Gallery cards: everything but the definition's body."""
    return [{
        "key": t["key"],
        "name": t["name"],
        "group": t["group"],
        "summary": t["summary"],
        "goal_event": t.get("goal_event"),
        "steps": [s["title"] for s in t["definition"]["steps"]],
        "actions": t.get("needs_actions", {}),
    } for t in _load().values()]


def get_template(key: str) -> Optional[dict]:
    return _load().get(key)
