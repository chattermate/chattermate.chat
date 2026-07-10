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

from app.core.redis import get_redis
from app.core.logger import get_logger

logger = get_logger(__name__)

# Platforms redeliver webhooks on slow acks/timeouts; remember processed
# message ids long enough to absorb every retry cycle.
DEDUPE_TTL_SECONDS = 60 * 60


def is_duplicate_message(channel_type: str, external_message_id: str) -> bool:
    """Atomically claim an inbound message id (Redis SETNX). Returns True when
    the message was already processed. Without Redis, dedupe is skipped —
    single-process deployments rarely see retries fast enough to matter."""
    if not external_message_id:
        return False
    try:
        redis_client = get_redis()
        if redis_client is None:
            return False
        key = f"channel_dedupe:{channel_type}:{external_message_id}"
        claimed = redis_client.set(key, "1", nx=True, ex=DEDUPE_TTL_SECONDS)
        return not claimed
    except Exception as e:
        logger.error(f"Dedupe check failed (processing anyway): {e}")
        return False
