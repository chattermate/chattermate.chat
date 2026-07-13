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

Fixed-window per-key rate limiting for public unauthenticated endpoints.
Redis-backed when available (shared across workers, like the socket rate
limiter); per-process in-memory fallback otherwise.
"""

import time
from threading import Lock

from app.core.logger import get_logger

logger = get_logger(__name__)

# Prune expired windows once the fallback map exceeds this many keys, so
# attacker-rotated keys can't grow memory without bound.
_LOCAL_PRUNE_THRESHOLD = 10_000

_local_counts: dict = {}  # key -> (count, window_start, window_seconds)
_local_lock = Lock()


def _redis_client():
    try:
        from app.services.socket_rate_limit import redis_client
        return redis_client
    except Exception:
        return None


def allow_request(key: str, limit: int, window_seconds: int) -> bool:
    """True if `key` may make another request in the current fixed window."""
    client = _redis_client()
    if client:
        try:
            redis_key = f"public_rl:{key}:{window_seconds}"
            # SET NX EX guarantees the key always carries a TTL before any
            # INCR — an INCR-then-EXPIRE pair could leave an immortal counter
            # if the EXPIRE step was lost.
            client.set(redis_key, 0, nx=True, ex=window_seconds)
            return client.incr(redis_key) <= limit
        except Exception as e:
            logger.warning(f"Redis rate limit failed, using local fallback: {e}")
    now = time.monotonic()
    with _local_lock:
        if len(_local_counts) > _LOCAL_PRUNE_THRESHOLD:
            expired = [
                k for k, (_, start, window) in _local_counts.items()
                if now - start >= window
            ]
            for k in expired:
                del _local_counts[k]
        count, window_start, _ = _local_counts.get(key, (0, now, window_seconds))
        if now - window_start >= window_seconds:
            count, window_start = 0, now
        _local_counts[key] = (count + 1, window_start, window_seconds)
        return count + 1 <= limit
