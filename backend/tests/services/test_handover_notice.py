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

The message a channel customer gets when a teammate joins: default, the
agent's own words, or nothing.
"""
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

import pytest

from app.models.agent import DEFAULT_HANDOVER_MESSAGE
from app.services.handover_notice import handover_message_for, tell_customer_teammate_joined


def _agent(enabled=True, message=None):
    return SimpleNamespace(handover_notice_enabled=enabled, handover_message=message,
                           organization_id='org-1')


def _plan(on):
    return patch('app.services.handover_notice.plan_flag_on', return_value=on)


def test_default_text_when_the_agent_has_none(db):
    with _plan(True):
        assert handover_message_for(db, _agent()) == DEFAULT_HANDOVER_MESSAGE
        assert handover_message_for(db, _agent(message='   ')) == DEFAULT_HANDOVER_MESSAGE


def test_own_text_where_the_plan_has_it(db):
    with _plan(True) as plan:
        assert handover_message_for(db, _agent(message=' Hi, Jesper here. ')) == 'Hi, Jesper here.'
    assert plan.call_args.args[1:] == ('org-1', 'handover_message')


def test_own_text_falls_back_to_the_default_without_the_plan(db):
    with _plan(False):
        assert handover_message_for(db, _agent(message='Hi, Jesper here.')) == DEFAULT_HANDOVER_MESSAGE


def test_switched_off_sends_nothing_whatever_the_text(db):
    with _plan(True):
        assert handover_message_for(db, _agent(enabled=False)) is None
        assert handover_message_for(db, _agent(enabled=False, message='Hi')) is None


def test_a_chat_with_no_agent_gets_the_default(db):
    assert handover_message_for(db, None) == DEFAULT_HANDOVER_MESSAGE


@pytest.mark.asyncio
@pytest.mark.parametrize('agent, sent', [
    (_agent(), DEFAULT_HANDOVER_MESSAGE),
    (_agent(message='Hi, Jesper here.'), 'Hi, Jesper here.'),
    (_agent(enabled=False), None),
])
async def test_tells_the_customer_in_the_teammates_name(db, agent, sent):
    session = SimpleNamespace(agent=agent)
    with _plan(True), patch('app.services.handover_notice.notify_customer', new=AsyncMock()) as notify:
        await tell_customer_teammate_joined(db, session, user_id='u-1')
    if sent is None:
        notify.assert_not_awaited()
    else:
        notify.assert_awaited_once_with(db, session, sent, user_id='u-1')
