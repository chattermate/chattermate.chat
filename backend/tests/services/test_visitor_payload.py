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

import json

import pytest

from app.services.visitor_payload import (
    GENERIC_ERROR,
    VISITOR_ATTRIBUTE_KEYS,
    visitor_attributes,
    visitor_error,
)

# Keys that are really stored on messages and are for the team only.
TEAM_ONLY = {
    'transfer_to_human': True,
    'transfer_reason': 'billing',
    'transfer_description': 'Customer is angry about a double charge; check Stripe.',
    'transfer_group_id': 'g-1',
    'end_chat_reason': 'resolved',
    'end_chat_description': 'Customer was rude, closing.',
    'workflow_execution': True,
    'workflow_error': 'KeyError: api_key',
    'workflow_transfer': True,
    'guardrail': True,
    'interactive_sent': True,
    'error': 'Traceback (most recent call last): ...',
    'source': 'journey',
}


@pytest.mark.parametrize('key', sorted(TEAM_ONLY))
def test_team_only_keys_are_never_allowed(key):
    assert key not in VISITOR_ATTRIBUTE_KEYS


def test_keeps_every_allowed_key():
    visible = {key: f'value-{key}' for key in VISITOR_ATTRIBUTE_KEYS}
    assert visitor_attributes(visible) == visible


def test_drops_team_notes_and_keeps_the_rest():
    stored = {**TEAM_ONLY, 'end_chat': True, 'sources': [{'name': 'faq', 'type': 'url'}]}
    assert visitor_attributes(stored) == {'end_chat': True, 'sources': [{'name': 'faq', 'type': 'url'}]}


def test_nested_values_pass_unchanged():
    products = {'products': [{'id': '1', 'variants': [{'id': 'v1'}]}], 'shop_domain': 's.myshopify.com'}
    assert visitor_attributes({'shopify_output': products})['shopify_output'] is products


def test_unknown_keys_are_dropped():
    assert visitor_attributes({'something_new': 1}) == {}


@pytest.mark.parametrize('empty', [None, {}, '', [], 0])
def test_empty_or_odd_input_gives_an_empty_dict(empty):
    assert visitor_attributes(empty) == {}


def test_json_string_attributes_are_filtered_too():
    stored = json.dumps({'request_rating': True, 'transfer_description': 'internal'})
    assert visitor_attributes(stored) == {'request_rating': True}


@pytest.mark.parametrize('bad', ['not json', '[1, 2]', '"text"'])
def test_invalid_or_non_object_json_gives_an_empty_dict(bad):
    assert visitor_attributes(bad) == {}


def test_does_not_change_the_stored_attributes():
    stored = {'transfer_description': 'internal', 'end_chat': False}
    visitor_attributes(stored)
    assert stored == {'transfer_description': 'internal', 'end_chat': False}


def test_visitor_error_never_returns_the_real_error(caplog):
    with caplog.at_level('WARNING'):
        assert visitor_error("KeyError: 'api_key'") == GENERIC_ERROR
    assert "KeyError" in caplog.text


def test_visitor_error_uses_the_given_fallback():
    assert visitor_error("ValueError: x", 'Form submission failed') == 'Form submission failed'
    assert visitor_error(None, 'Form submission failed') == 'Form submission failed'
