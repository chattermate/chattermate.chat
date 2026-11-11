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


The widget's email check: codes bound to the conversation, kept as an HMAC,
limited in tries, sends and time.
"""

import json
import time
from unittest.mock import patch
from uuid import uuid4

import pytest

from app.services import email_check


class FakeRedis:
    def __init__(self):
        self.data, self.expiry = {}, {}

    def get(self, key):
        if key in self.expiry and self.expiry[key] < time.time():
            self.data.pop(key, None)
        return self.data.get(key)

    def set(self, key, value, ex=None):
        self.data[key] = value
        if ex:
            self.expiry[key] = time.time() + ex

    def delete(self, key):
        self.data.pop(key, None)

    def ttl(self, key):
        return int(self.expiry.get(key, time.time()) - time.time())


@pytest.fixture
def redis():
    fake = FakeRedis()
    with patch.object(email_check, "get_redis", return_value=fake), \
         patch.object(email_check, "allow_request", return_value=True):
        yield fake


@pytest.fixture
def session_id():
    return str(uuid4())


def _sent(session_id, email="Jane@Acme.com"):
    result, code = email_check.start(session_id, email)
    assert result.ok and result.reason == "sent"
    return code


class TestEmailCheck:
    def test_the_right_code_proves_the_email_for_this_conversation(self, redis, session_id):
        code = _sent(session_id)
        result, email = email_check.verify(session_id, code)
        assert result.ok and email == "jane@acme.com"
        assert email_check.verified_email(session_id) == "jane@acme.com"
        assert email_check.verified_email(str(uuid4())) is None

    def test_the_code_is_never_stored(self, redis, session_id):
        code = _sent(session_id)
        assert code not in json.dumps(redis.data)

    def test_a_code_works_once(self, redis, session_id):
        code = _sent(session_id)
        email_check.verify(session_id, code)
        assert email_check.verify(session_id, code)[0].reason == "expired"

    def test_another_conversations_code_does_not_work(self, redis, session_id):
        _sent(session_id)
        other = str(uuid4())
        other_code = _sent(other)
        result, email = email_check.verify(session_id, other_code)
        assert not result.ok and email is None

    def test_five_wrong_tries_end_it(self, redis, session_id):
        code = _sent(session_id)
        wrong = "000000" if code != "000000" else "111111"
        reasons = [email_check.verify(session_id, wrong)[0] for _ in range(5)]
        assert [r.attempts_left for r in reasons] == [4, 3, 2, 1, 0]
        assert reasons[-1].reason == "locked"
        assert email_check.verify(session_id, code)[0].reason == "locked"

    @pytest.mark.parametrize("bad", ["12345", "1234567", "abcdef", "", None])
    def test_a_malformed_code_counts_as_wrong(self, redis, session_id, bad):
        _sent(session_id)
        assert email_check.verify(session_id, bad)[0].reason == "wrong_code"

    def test_an_expired_code_is_gone(self, redis, session_id):
        code = _sent(session_id)
        redis.expiry[f"email_check:{session_id}"] = time.time() - 1
        assert email_check.verify(session_id, code)[0].reason == "expired"

    def test_a_resend_waits_for_the_cooldown(self, redis, session_id):
        _sent(session_id)
        result, code = email_check.start(session_id, "jane@acme.com")
        assert result.reason == "cooldown" and result.retry_in > 0 and code is None

    def test_a_resend_after_the_cooldown_replaces_the_code(self, redis, session_id):
        first = _sent(session_id)
        record = json.loads(redis.data[f"email_check:{session_id}"])
        record["sent_at"] -= email_check.RESEND_COOLDOWN_SECONDS + 1
        redis.data[f"email_check:{session_id}"] = json.dumps(record)
        second = _sent(session_id)
        if first != second:
            assert not email_check.verify(session_id, first)[0].ok

    def test_sends_are_limited_per_email(self, redis):
        with patch.object(email_check, "allow_request", side_effect=lambda key, limit, window: "email:" not in key):
            result, code = email_check.start(str(uuid4()), "jane@acme.com")
        assert result.reason == "too_many" and code is None

    @pytest.mark.parametrize("email", ["not-an-email", "a b@c.com", "x@", "a@b", ""])
    def test_an_invalid_email_gets_no_code(self, redis, session_id, email):
        assert email_check.start(session_id, email)[0].reason == "invalid_email"

    def test_without_redis_it_is_not_offered(self, session_id):
        with patch.object(email_check, "get_redis", return_value=None):
            assert not email_check.available()
            assert email_check.start(session_id, "jane@acme.com")[0].reason == "unavailable"
            assert email_check.verified_email(session_id) is None


def test_mask():
    assert email_check.mask("jane@acme.com") == "j•••@acme.com"
