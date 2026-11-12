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

Every agent's visitors get the redesigned widget; the classic one is gone.

Visitor payloads still say so in customization_metadata.widget_ui ({version: 2}),
for widget bundles a browser cached before the classic widget was removed. What
an agent stored there (its old per-agent choice) is ignored.
"""

from typing import Optional, Tuple

from sqlalchemy.orm import Session

from app.models.agent import Agent
from app.services import launcher

WIDGET_UI_KEY = 'widget_ui'
REDESIGN = 2


def served_metadata(metadata: Optional[dict]) -> dict:
    """The metadata as visitors get it: always the redesigned widget. A copy; the
    given dict is never changed."""
    return {**(metadata or {}), WIDGET_UI_KEY: {'version': REDESIGN}}


def for_visitors(db: Session, agent: Agent) -> Tuple[dict, Optional[str]]:
    """customization_metadata and launcher logo URL as visitors get them."""
    metadata, logo_url = launcher.for_visitors(db, agent)
    return served_metadata(metadata), logo_url
