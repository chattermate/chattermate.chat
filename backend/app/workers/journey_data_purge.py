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

Deletes old in-app action calls and journey progress, once a day. Both hold
visitor data (encrypted arguments and results, who reached which step), so
they are kept only JOURNEY_DATA_RETENTION_DAYS.
"""

import asyncio
import os
from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.logger import get_logger
from app.database import SessionLocal
from app.models.agent_action import AgentActionCall
from app.models.journey import JourneyProgress

logger = get_logger(__name__)

PURGE_INTERVAL = int(os.environ.get('JOURNEY_PURGE_INTERVAL', '86400'))


def purge_old_rows(db: Session, now: datetime) -> dict:
    """Delete rows past the retention period. Returns how many of each went."""
    cutoff = now - timedelta(days=settings.JOURNEY_DATA_RETENTION_DAYS)
    calls = db.query(AgentActionCall).filter(AgentActionCall.created_at < cutoff).delete(synchronize_session=False)
    # Step rows go with their progress (ON DELETE CASCADE).
    progress = db.query(JourneyProgress).filter(JourneyProgress.last_seen_at < cutoff).delete(synchronize_session=False)
    db.commit()
    return {"action_calls": calls, "journey_progress": progress}


async def run_purge_loop() -> None:
    while True:
        db = SessionLocal()
        try:
            removed = await asyncio.to_thread(purge_old_rows, db, datetime.now(timezone.utc))
            if any(removed.values()):
                logger.info(f"Purged old journey data: {removed}")
        except Exception as e:
            logger.error(f"Journey data purge failed: {e}")
        finally:
            db.close()
        await asyncio.sleep(PURGE_INTERVAL)
