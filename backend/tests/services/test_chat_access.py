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

"""The one visibility rule acting on a chat and mentioning someone on it share."""

from types import SimpleNamespace
from uuid import uuid4

import pytest

from app.services.chat_access import can_see_session, holds_all_chats, may_change_hands


def _user(*permissions, groups=()):
    role = SimpleNamespace(permissions=[SimpleNamespace(name=p) for p in permissions])
    return SimpleNamespace(id=uuid4(), role=role, groups=[SimpleNamespace(id=g) for g in groups])


def _session(user_id=None, group_id=None):
    return SimpleNamespace(user_id=user_id, group_id=group_id)


@pytest.mark.parametrize("permission", ["super_admin", "view_all_chats", "manage_all_chats"])
def test_a_see_all_grant_sees_any_chat(permission):
    assert can_see_session(_user(permission), _session(user_id=uuid4(), group_id=uuid4()))


def test_assigned_scope_sees_its_own_and_its_groups_chats_only():
    group = uuid4()
    me = _user("view_assigned_chats", groups=[group])
    assert can_see_session(me, _session(user_id=me.id))
    assert can_see_session(me, _session(user_id=uuid4(), group_id=group))
    assert not can_see_session(me, _session(user_id=uuid4(), group_id=uuid4()))
    assert not can_see_session(me, _session())


def test_the_unclaimed_queue_needs_its_own_grant():
    assert can_see_session(_user("view_unassigned_chats"), _session())
    assert not can_see_session(_user("view_unassigned_chats"), _session(user_id=uuid4()))


def test_no_role_sees_nothing():
    nobody = SimpleNamespace(id=uuid4(), role=None, groups=[])
    assert not can_see_session(nobody, _session())


def test_seeing_every_chat_is_not_managing_every_chat():
    assert not holds_all_chats(_user("view_all_chats", "manage_assigned_chats"))
    assert holds_all_chats(_user("manage_all_chats"))


def test_a_chat_a_teammate_holds_is_theirs_to_give_up():
    me = _user("view_all_chats", "manage_assigned_chats")
    assert may_change_hands(me, _session())
    assert may_change_hands(me, _session(user_id=me.id))
    assert not may_change_hands(me, _session(user_id=uuid4()))
    assert may_change_hands(_user("manage_all_chats"), _session(user_id=uuid4()))
