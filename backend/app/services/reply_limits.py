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

"""How many messages one customer may send an agent's AI: per minute, and how
many it answers per day. Counted per customer, not per IP, so people sharing an
office don't share a limit; a customer the host page verifies keeps their count
across devices. Only messages that reach the model count: chips, journey
messages and human replies never do.

The counts live in Redis. Without Redis, or when it fails, nobody is limited:
a broken counter must not stop the chat.
"""

import asyncio
import time
from enum import Enum
from typing import Optional

from app.core.logger import get_logger
from app.core.redis import get_redis

logger = get_logger(__name__)

MAX_PER_MINUTE = 600
MAX_PER_DAY = 100_000

TOO_FAST_MESSAGE = "You're sending messages quickly. Please wait a moment and try again."
DAILY_LIMIT_MESSAGE = "You've reached today's message limit for this chat. Please try again tomorrow."

# A key outlives its window a little, so a slow request near the edge still finds it.
_MINUTE_TTL = 120
_DAY_TTL = 2 * 86400


class Refusal(str, Enum):
    TOO_FAST = "too_fast"
    DAILY_LIMIT = "daily_limit"


def _count(key: str, ttl: int) -> int:
    client = get_redis()
    if client is None:
        return 0
    pipe = client.pipeline()
    pipe.incr(key)
    pipe.expire(key, ttl)
    return int(pipe.execute()[0])


async def check(
    agent_id: str,
    customer_id: str,
    per_minute: Optional[int],
    per_day: Optional[int],
    now: Optional[float] = None,
) -> Optional[Refusal]:
    """Count this message and say why it may not reach the model, if it may not.

    A message refused for speed doesn't use up the day's allowance."""
    if not per_minute and not per_day:
        return None
    now = time.time() if now is None else now
    scope = f"{agent_id}:{customer_id}"
    try:
        if per_minute:
            minute_key = f"reply_limit:min:{scope}:{int(now // 60)}"
            if await asyncio.to_thread(_count, minute_key, _MINUTE_TTL) > per_minute:
                return Refusal.TOO_FAST
        if per_day:
            day = time.strftime("%Y%m%d", time.gmtime(now))
            if await asyncio.to_thread(_count, f"reply_limit:day:{scope}:{day}", _DAY_TTL) > per_day:
                return Refusal.DAILY_LIMIT
    except Exception as err:
        logger.warning(f"Reply limit check failed, allowing the message: {err}")
    return None


async def refuse_over_reply_limit(sio, sid: str, session: dict, session_id: str) -> bool:
    """Answer a message over the agent's limits without the model. True when refused.

    Too fast shows as a passing notice; the day's limit as a reply that stays in
    the chat. Neither is stored: the message they answer wasn't either."""
    refusal = await check(
        session.get("agent_id", ""),
        session.get("customer_id", ""),
        session.get("messages_per_customer_per_minute"),
        session.get("replies_per_customer_per_day"),
    )
    if refusal is None:
        return False
    logger.info(f"Reply limit ({refusal.value}) for customer {session.get('customer_id')} on agent {session.get('agent_id')}")
    if refusal is Refusal.TOO_FAST:
        await sio.emit("error", {"error": TOO_FAST_MESSAGE, "type": "rate_limit_error"}, to=sid, namespace="/widget")
    else:
        await sio.emit("chat_response", {"message": DAILY_LIMIT_MESSAGE, "session_id": session_id, "type": "reply_limit"}, to=sid, namespace="/widget")
    return True
