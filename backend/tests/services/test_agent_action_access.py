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
from unittest.mock import MagicMock, patch
from uuid import uuid4

import pytest
from fastapi import HTTPException

from app.core.config import settings
from app.services import feature_gate
from app.services.agent_action_access import action_cap, check_action_quota


def test_cap_is_platform_cap_without_plan_limit():
    with patch("app.services.agent_action_access.feature_limit", return_value=None):
        assert action_cap(MagicMock(), uuid4()) == settings.ACTION_MAX_PER_AGENT


def test_cap_takes_the_smaller_limit():
    with patch("app.services.agent_action_access.feature_limit", return_value=3):
        assert action_cap(MagicMock(), uuid4()) == 3


def test_quota_allows_below_cap_and_blocks_at_cap():
    with patch("app.services.agent_action_access.feature_limit", return_value=3):
        check_action_quota(MagicMock(), uuid4(), 2)
        with pytest.raises(HTTPException) as exc:
            check_action_quota(MagicMock(), uuid4(), 3)
    assert exc.value.status_code == 403


def test_feature_limit_is_none_on_oss():
    with patch.object(feature_gate, "HAS_ENTERPRISE", False):
        assert feature_gate.feature_limit(MagicMock(), uuid4(), "max_actions") is None


@pytest.mark.parametrize("features, expected", [
    ({"max_actions": 3}, 3),
    ({"max_actions": None}, None),
    ({"max_actions": True}, None),  # a bool is a flag, not a number
    ({}, None),
    (None, None),
])
def test_feature_limit_reads_plan_number(features, expected):
    plan = SimpleNamespace(features=features)
    repo = MagicMock()
    repo.get.return_value = plan
    with patch.object(feature_gate, "HAS_ENTERPRISE", True), \
         patch.object(feature_gate, "require_accessible_subscription", create=True,
                      return_value=SimpleNamespace(plan_id=uuid4())), \
         patch.object(feature_gate, "PlanRepository", create=True, return_value=repo):
        assert feature_gate.feature_limit(MagicMock(), uuid4(), "max_actions") == expected


def test_feature_limit_missing_plan_is_none():
    repo = MagicMock()
    repo.get.return_value = None
    with patch.object(feature_gate, "HAS_ENTERPRISE", True), \
         patch.object(feature_gate, "require_accessible_subscription", create=True,
                      return_value=SimpleNamespace(plan_id=uuid4())), \
         patch.object(feature_gate, "PlanRepository", create=True, return_value=repo):
        assert feature_gate.feature_limit(MagicMock(), uuid4(), "max_actions") is None
