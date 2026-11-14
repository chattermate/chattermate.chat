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

"""Who may see a conversation, decided on the loaded session.

One rule for acting on a chat (take over, release, note, snooze) and for being
pointed at it (an @-mention), so nobody is told about a conversation they would
get a 404 for. Mirrors ChatRepository.check_session_access and the inbox list's
visibility filter: the three must agree.
"""

from typing import Set

from app.models.session_to_agent import SessionToAgent
from app.models.user import User

SEE_ALL = {"super_admin", "view_all_chats", "manage_all_chats"}
# Seeing every chat is not managing every chat
MANAGE_ALL = {"super_admin", "manage_all_chats"}


def _permissions(user: User) -> Set[str]:
    return {p.name for p in user.role.permissions} if user.role else set()


def holds_all_chats(user: User) -> bool:
    """May act on every conversation in the organization, whoever holds it."""
    return bool(MANAGE_ALL & _permissions(user))


def can_see_session(user: User, session: SessionToAgent) -> bool:
    permissions = _permissions(user)
    if SEE_ALL & permissions:
        return True
    if session.user_id is None and "view_unassigned_chats" in permissions:
        return True
    if "view_assigned_chats" not in permissions:
        return False
    if session.user_id == user.id:
        return True
    return bool(session.group_id) and str(session.group_id) in {str(g.id) for g in user.groups}


def may_change_hands(user: User, session: SessionToAgent) -> bool:
    """Release, reassign or snooze a conversation: one a teammate holds is
    theirs to give up, unless you may manage every chat. One nobody holds
    (the AI's, or waiting in the queue) is anyone's who can see it."""
    return session.user_id is None or session.user_id == user.id or holds_all_chats(user)
