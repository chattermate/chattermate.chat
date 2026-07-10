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

DEFAULT_TTL_SECONDS = 60 * 60


def claim_once(scope: str, key: str, ttl_seconds: int = DEFAULT_TTL_SECONDS) -> bool:
    """Atomically claim a key (Redis SETNX). Returns True if this caller won
    the claim, False if someone already holds it. Without Redis, always True —
    callers must keep a best-effort non-atomic fallback."""
    if not key:
        return True
    try:
        redis_client = get_redis()
        if redis_client is None:
            return True
        return bool(redis_client.set(f"claim:{scope}:{key}", "1", nx=True, ex=ttl_seconds))
    except Exception as e:
        logger.error(f"Claim check failed (allowing): {e}")
        return True
