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

Sending a visitor's journey step to their widget (journey_state). Shared by the
journey socket events and by host actions, whose success can finish a step.
"""

from typing import Iterable, Optional

from sqlalchemy.orm import Session

from app.core.logger import get_logger
from app.core.socketio import sio
from app.services.journey_runtime import JourneyRunner
from app.services.widget_reply import WIDGET_NAMESPACE

logger = get_logger(__name__)


async def emit_journey_state(sid: str, view: Optional[dict]) -> None:
    await sio.emit('journey_state', {'view': view}, to=sid, namespace=WIDGET_NAMESPACE)


async def sync_journey(sid: str, session: dict, db: Session, *,
                       events: Iterable[str] = (), actions: Iterable[str] = ()) -> None:
    """Apply what just happened and send the step to show. Never raises: a
    journey problem must not break the chat."""
    try:
        view = JourneyRunner(db, session).sync(events=events, actions=actions)
    except Exception as e:
        logger.error(f"Journey sync failed for session {session.get('session_id')}: {e}")
        return
    await emit_journey_state(sid, view)
