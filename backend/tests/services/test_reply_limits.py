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

from unittest.mock import AsyncMock, MagicMock

import pytest
from pydantic import ValidationError

from app.models.schemas.agent import AgentUpdate
from app.services import reply_limits
from app.services.reply_limits import Refusal, check

NOON = 1_794_052_800.0  # 2026-11-07 12:00:00 UTC
DAY = 86400


class FakeRedis:
    def __init__(self):
        self.counts = {}
        self.ttls = {}

    def pipeline(self):
        fake = self
        ops = []

        class Pipe:
            def incr(self, key):
                ops.append(("incr", key))

            def expire(self, key, ttl):
                ops.append(("expire", key, ttl))

            def execute(self):
                out = []
                for op in ops:
                    if op[0] == "incr":
                        fake.counts[op[1]] = fake.counts.get(op[1], 0) + 1
                        out.append(fake.counts[op[1]])
                    else:
                        fake.ttls[op[1]] = op[2]
                        out.append(True)
                return out

        return Pipe()


@pytest.fixture
def redis(monkeypatch):
    fake = FakeRedis()
    monkeypatch.setattr(reply_limits, "get_redis", lambda: fake)
    return fake


async def _send(times, agent="a1", customer="c1", per_minute=None, per_day=None, now=NOON):
    return [await check(agent, customer, per_minute, per_day, now=now) for _ in range(times)]


@pytest.mark.asyncio
async def test_no_limits_touch_nothing(redis):
    assert await _send(50) == [None] * 50
    assert redis.counts == {}


@pytest.mark.asyncio
async def test_the_seventh_message_in_a_minute_is_too_fast(redis):
    assert await _send(7, per_minute=6) == [None] * 6 + [Refusal.TOO_FAST]


@pytest.mark.asyncio
async def test_a_new_minute_starts_a_new_count(redis):
    await _send(7, per_minute=6)
    assert await _send(1, per_minute=6, now=NOON + 60) == [None]


@pytest.mark.asyncio
async def test_the_forty_first_reply_in_a_day_is_refused(redis):
    results = [await check("a1", "c1", None, 40, now=NOON + i) for i in range(41)]
    assert results == [None] * 40 + [Refusal.DAILY_LIMIT]


@pytest.mark.asyncio
async def test_the_day_count_resets_at_midnight_utc(redis):
    await _send(41, per_day=40)
    assert await _send(1, per_day=40, now=NOON + DAY) == [None]


@pytest.mark.asyncio
async def test_messages_refused_for_speed_leave_the_day_alone(redis):
    await _send(20, per_minute=6, per_day=40)
    day_key = next(k for k in redis.counts if k.startswith("reply_limit:day:"))
    assert redis.counts[day_key] == 6


@pytest.mark.asyncio
async def test_each_customer_and_each_agent_has_its_own_count(redis):
    await _send(41, per_day=40)
    assert await _send(1, customer="c2", per_day=40) == [None]
    assert await _send(1, agent="a2", per_day=40) == [None]


@pytest.mark.asyncio
async def test_keys_expire_after_their_window(redis):
    await _send(1, per_minute=6, per_day=40)
    ttls = {k.split(":")[1]: v for k, v in redis.ttls.items()}
    assert ttls == {"min": 120, "day": 2 * DAY}


@pytest.mark.asyncio
async def test_without_redis_nobody_is_limited(monkeypatch):
    monkeypatch.setattr(reply_limits, "get_redis", lambda: None)
    assert await _send(10, per_minute=1, per_day=1) == [None] * 10


@pytest.mark.asyncio
async def test_a_failing_redis_lets_the_message_through(monkeypatch):
    broken = MagicMock()
    broken.pipeline.return_value.execute.side_effect = ConnectionError("down")
    monkeypatch.setattr(reply_limits, "get_redis", lambda: broken)
    assert await _send(3, per_minute=1, per_day=1) == [None] * 3


def _session(**limits):
    return {"agent_id": "a1", "customer_id": "c1", **limits}


@pytest.mark.asyncio
async def test_under_the_limits_nothing_is_sent(redis):
    sio = MagicMock(emit=AsyncMock())
    assert await reply_limits.refuse_over_reply_limit(sio, "sid", _session(replies_per_customer_per_day=1), "s1") is False
    sio.emit.assert_not_awaited()


@pytest.mark.asyncio
async def test_too_fast_is_a_passing_notice(redis):
    sio = MagicMock(emit=AsyncMock())
    session = _session(messages_per_customer_per_minute=1)
    await reply_limits.refuse_over_reply_limit(sio, "sid", session, "s1")
    assert await reply_limits.refuse_over_reply_limit(sio, "sid", session, "s1") is True
    sio.emit.assert_awaited_once_with(
        "error", {"error": reply_limits.TOO_FAST_MESSAGE, "type": "rate_limit_error"}, to="sid", namespace="/widget")


@pytest.mark.asyncio
async def test_the_day_limit_is_a_reply_to_this_socket_only(redis):
    sio = MagicMock(emit=AsyncMock())
    session = _session(replies_per_customer_per_day=1)
    await reply_limits.refuse_over_reply_limit(sio, "sid", session, "s1")
    assert await reply_limits.refuse_over_reply_limit(sio, "sid", session, "s1") is True
    sio.emit.assert_awaited_once_with(
        "chat_response",
        {"message": reply_limits.DAILY_LIMIT_MESSAGE, "session_id": "s1", "type": "reply_limit"},
        to="sid", namespace="/widget")


@pytest.mark.parametrize("field,bad", [
    ("messages_per_customer_per_minute", 0),
    ("messages_per_customer_per_minute", reply_limits.MAX_PER_MINUTE + 1),
    ("replies_per_customer_per_day", -5),
    ("replies_per_customer_per_day", reply_limits.MAX_PER_DAY + 1),
])
def test_limits_out_of_range_are_rejected(field, bad):
    with pytest.raises(ValidationError):
        AgentUpdate(**{field: bad})


def test_a_limit_can_be_cleared_with_null():
    update = AgentUpdate(replies_per_customer_per_day=None)
    assert update.model_dump(exclude_unset=True) == {"replies_per_customer_per_day": None}
