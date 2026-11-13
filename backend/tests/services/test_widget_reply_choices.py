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

from types import SimpleNamespace
from unittest.mock import patch

from app.channels.interactive_limits import WEB_LIMITS
from app.models.schemas.chat import ChannelChatResponse, ChatResponse
from app.services.widget_reply import reply_payload, widget_agent_kwargs


def _session(**extra):
    return {
        'ai_config': SimpleNamespace(encrypted_api_key='x', model_name='m', model_type='OPENAI', settings={}),
        'org_id': 'org', 'agent_id': 'agent', 'customer_id': 'c', 'session_id': 's',
        **extra,
    }


@patch('app.services.widget_reply.decrypt_api_key', return_value='key')
def test_choices_offered_only_when_the_agent_turns_them_on(_decrypt):
    assert widget_agent_kwargs(_session(offer_choices=True))['choice_limits'] is WEB_LIMITS
    assert widget_agent_kwargs(_session(offer_choices=False))['choice_limits'] is None
    # Sessions saved before the switch existed
    assert widget_agent_kwargs(_session())['choice_limits'] is None


def test_offered_choices_reach_the_widget():
    response = ChannelChatResponse(message='Which colour?', quick_replies=['Blue', 'Green'])
    assert reply_payload(response, 's')['quick_replies'] == ['Blue', 'Green']


def test_choices_are_held_to_what_fits_on_a_phone():
    long = 'x' * 60
    response = ChannelChatResponse(message='Pick one', quick_replies=['A', 'B', 'C', 'D', 'E', long])
    shown = reply_payload(response, 's')['quick_replies']
    assert shown == ['A', 'B', 'C', 'D']
    one = reply_payload(ChannelChatResponse(message='Pick', quick_replies=[long]), 's')['quick_replies']
    assert one == ['x' * WEB_LIMITS.button_title_max]


def test_a_plain_reply_carries_no_choices():
    assert reply_payload(ChatResponse(message='Hi'), 's')['quick_replies'] is None
    assert reply_payload(ChannelChatResponse(message='Hi', quick_replies=[]), 's')['quick_replies'] is None


def test_web_buttons_fit_four_on_a_phone():
    assert WEB_LIMITS.max_buttons == 4
    assert not WEB_LIMITS.supports_list
