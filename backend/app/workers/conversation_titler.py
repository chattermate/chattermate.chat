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

Titles recently closed widget conversations for the visitor's history, every
CONVERSATION_TITLE_INTERVAL seconds (app/services/conversation_titles.py).
"""

import asyncio
import os

from app.core.logger import get_logger
from app.database import SessionLocal
from app.services.conversation_titles import title_recent_conversations

logger = get_logger(__name__)

TITLE_INTERVAL = int(os.environ.get('CONVERSATION_TITLE_INTERVAL', '300'))


async def run_titler_loop() -> None:
    while True:
        try:
            titled = await title_recent_conversations(SessionLocal)
            if titled:
                logger.info(f"Titled {titled} closed conversations")
        except Exception as e:
            logger.error(f"Conversation titling failed: {e}")
        await asyncio.sleep(TITLE_INTERVAL)
