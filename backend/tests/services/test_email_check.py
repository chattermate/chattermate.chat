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


The widget's email check: only where it was offered, one plain recipient, codes
bound to the conversation and kept as an HMAC, tries carried across resends,
counters in Redis, and a short-lived proof bound to the customer.
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

    def _live(self, key):
        if key in self.expiry and self.expiry[key] < time.time():
            self.data.pop(key, None)
            self.expiry.pop(key, None)

    def ping(self):
        return True

    def get(self, key):
        self._live(key)
        return self.data.get(key)

    def set(self, key, value, ex=None, nx=False):
        self._live(key)
        if nx and key in self.data:
            return False
        self.data[key] = str(value)
        if ex:
            self.expiry[key] = time.time() + ex
        return True

    def incr(self, key):
        self._live(key)
        self.data[key] = str(int(self.data.get(key, 0)) + 1)
        return int(self.data[key])

    def delete(self, key):
        self.data.pop(key, None)


@pytest.fixture
def redis():
    fake = FakeRedis()
    with patch.object(email_check, "get_redis", return_value=fake):
        yield fake


@pytest.fixture
def session_id():
    return str(uuid4())


ORG = "org-1"
CUSTOMER = "customer-1"


def _offered(session_id):
    assert email_check.offer(session_id)


def _sent(session_id, email="Jane@Acme.com"):
    _offered(session_id)
    result, code = email_check.start(session_id, ORG, email)
    assert result.ok and result.reason == "sent", result
    return code


def _past_cooldown(redis, session_id):
    key = f"email_check:code:{session_id}"
    record = json.loads(redis.data[key])
    record["sent_at"] -= email_check.RESEND_COOLDOWN_SECONDS + 1
    redis.data[key] = json.dumps(record)


class TestEmailCheck:
    def test_no_code_unless_the_agent_offered_the_check(self, redis, session_id):
        result, code = email_check.start(session_id, ORG, "jane@acme.com")
        assert result.reason == "not_offered" and code is None

    def test_the_right_code_proves_the_email_for_this_conversation_and_customer(self, redis, session_id):
        code = _sent(session_id)
        result, email = email_check.verify(session_id, CUSTOMER, code)
        assert result.ok and email == "jane@acme.com"
        assert email_check.verified_email(session_id) == "jane@acme.com"
        assert email_check.verified_email(session_id, CUSTOMER) == "jane@acme.com"
        assert email_check.verified_email(session_id, "someone-else") is None
        assert email_check.verified_email(str(uuid4())) is None

    def test_the_code_is_never_stored(self, redis, session_id):
        code = _sent(session_id)
        assert code not in json.dumps(redis.data)

    def test_a_code_works_once_and_the_offer_with_it(self, redis, session_id):
        code = _sent(session_id)
        email_check.verify(session_id, CUSTOMER, code)
        assert email_check.verify(session_id, CUSTOMER, code)[0].reason == "expired"
        assert email_check.start(session_id, ORG, "jane@acme.com")[0].reason == "not_offered"

    def test_another_conversations_code_does_not_work(self, redis, session_id):
        _sent(session_id)
        other_code = _sent(str(uuid4()))
        result, email = email_check.verify(session_id, CUSTOMER, other_code)
        assert not result.ok and email is None

    def test_five_wrong_tries_end_it(self, redis, session_id):
        code = _sent(session_id)
        wrong = f"{code[:5]}{(int(code[5]) + 1) % 10}"
        reasons = [email_check.verify(session_id, CUSTOMER, wrong)[0] for _ in range(5)]
        assert [r.attempts_left for r in reasons] == [4, 3, 2, 1, 0]
        assert reasons[-1].reason == "locked"
        assert email_check.verify(session_id, CUSTOMER, code)[0].reason == "locked"

    def test_a_resend_does_not_give_new_tries(self, redis, session_id):
        code = _sent(session_id)
        wrong = f"{code[:5]}{(int(code[5]) + 1) % 10}"
        for _ in range(5):
            email_check.verify(session_id, CUSTOMER, wrong)
        _past_cooldown(redis, session_id)
        assert email_check.start(session_id, ORG, "jane@acme.com")[0].reason == "locked"

    def test_ten_failures_a_day_lock_the_email_in_every_conversation(self, redis):
        for _ in range(2):
            sid = str(uuid4())
            code = _sent(sid)
            for _ in range(5):
                email_check.verify(sid, CUSTOMER, f"{code[:5]}{(int(code[5]) + 1) % 10}")
        fresh = str(uuid4())
        _offered(fresh)
        assert email_check.start(fresh, ORG, "jane@acme.com")[0].reason == "locked"

    def test_failures_in_another_organization_do_not_lock_the_email_here(self, redis):
        for _ in range(2):
            sid = str(uuid4())
            code = _sent(sid)
            for _ in range(5):
                email_check.verify(sid, CUSTOMER, f"{code[:5]}{(int(code[5]) + 1) % 10}")
        fresh = str(uuid4())
        _offered(fresh)
        assert email_check.start(fresh, "another-org", "jane@acme.com")[0].ok

    @pytest.mark.parametrize("bad", ["12345", "1234567", "abcdef", "", None])
    def test_a_malformed_code_counts_as_wrong(self, redis, session_id, bad):
        _sent(session_id)
        assert email_check.verify(session_id, CUSTOMER, bad)[0].reason == "wrong_code"

    def test_an_expired_code_is_gone(self, redis, session_id):
        code = _sent(session_id)
        redis.expiry[f"email_check:code:{session_id}"] = time.time() - 1
        assert email_check.verify(session_id, CUSTOMER, code)[0].reason == "expired"

    def test_a_resend_waits_for_the_cooldown(self, redis, session_id):
        _sent(session_id)
        result, code = email_check.start(session_id, ORG, "jane@acme.com")
        assert result.reason == "cooldown" and result.retry_in > 0 and code is None

    def test_a_resend_after_the_cooldown_replaces_the_code(self, redis, session_id):
        first = _sent(session_id)
        _past_cooldown(redis, session_id)
        second = _sent(session_id)
        if first != second:
            assert not email_check.verify(session_id, CUSTOMER, first)[0].ok

    def test_sends_are_limited_per_conversation(self, redis, session_id):
        _offered(session_id)
        for _ in range(email_check.SENDS_PER_HOUR_PER_CONVERSATION):
            assert email_check.start(session_id, ORG, "jane@acme.com")[0].ok
            _past_cooldown(redis, session_id)
        assert email_check.start(session_id, ORG, "jane@acme.com")[0].reason == "too_many"

    def test_sends_are_limited_per_organization(self, redis, monkeypatch):
        monkeypatch.setattr(email_check, "SENDS_PER_HOUR_PER_ORG", 2)
        results = []
        for i in range(3):
            sid = str(uuid4())
            _offered(sid)
            results.append(email_check.start(sid, ORG, f"v{i}@acme.com")[0].reason)
        assert results == ["sent", "sent", "too_many"]

    @pytest.mark.parametrize("email", [
        "not-an-email", "a b@c.com", "x@", "a@b", "", "admin,me@evil.com", "a;b@c.com", "<a@b.com>", '"a"@b.com',
    ])
    def test_only_a_plain_address_gets_a_code(self, redis, session_id, email):
        _offered(session_id)
        assert email_check.start(session_id, ORG, email)[0].reason == "invalid_email"

    def test_ending_the_chat_forgets_the_proof(self, redis, session_id):
        email_check.verify(session_id, CUSTOMER, _sent(session_id))
        email_check.forget(session_id)
        assert email_check.verified_email(session_id) is None

    def test_without_redis_it_is_not_offered(self, session_id):
        with patch.object(email_check, "get_redis", return_value=None):
            assert not email_check.available() and not email_check.offer(session_id)
            assert email_check.start(session_id, ORG, "jane@acme.com")[0].reason == "unavailable"
            assert email_check.verified_email(session_id) is None

    def test_a_redis_failure_refuses_and_reading_the_proof_returns_none(self, session_id):
        class Broken(FakeRedis):
            def get(self, key):
                raise ConnectionError("redis down")
        with patch.object(email_check, "get_redis", return_value=Broken()):
            assert email_check.start(session_id, ORG, "jane@acme.com")[0].reason == "unavailable"
            assert email_check.verify(session_id, CUSTOMER, "123456")[0].reason == "unavailable"
            assert email_check.verified_email(session_id) is None


def test_mask():
    assert email_check.mask("jane@acme.com") == "j•••@acme.com"


class TestHistoryBudget:
    def test_history_checks_spend_their_own_budget_not_the_order_checks(self, redis, monkeypatch):
        monkeypatch.setattr(email_check, "SENDS_PER_HOUR_PER_ORG_HISTORY", 2)
        reasons = []
        for i in range(3):
            sid = str(uuid4())
            _offered(sid)
            reasons.append(email_check.start(sid, ORG, f"h{i}@acme.com", email_check.HISTORY_PURPOSE)[0].reason)
        assert reasons == ["sent", "sent", "too_many"]
        sid = str(uuid4())
        _offered(sid)
        assert email_check.start(sid, ORG, "order@acme.com")[0].ok


def test_a_store_verified_email_is_kept_as_proof_for_its_customer(redis):
    sid, customer = str(uuid4()), str(uuid4())
    assert email_check.prove(sid, customer, " Jane@Acme.com ")
    assert email_check.verified_email(sid, customer) == "jane@acme.com"
    assert email_check.verified_email(sid, str(uuid4())) is None


@pytest.mark.parametrize("email", ["", "not-an-email", None])
def test_no_proof_for_an_unusable_email(redis, email):
    sid = str(uuid4())
    assert not email_check.prove(sid, "c-1", email)
    assert email_check.verified_email(sid) is None


def test_no_proof_without_redis():
    with patch.object(email_check, "get_redis", return_value=None):
        assert not email_check.prove(str(uuid4()), "c-1", "jane@acme.com")

