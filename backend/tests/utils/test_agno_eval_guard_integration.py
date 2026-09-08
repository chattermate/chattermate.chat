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

from unittest import mock

import pytest
from agno.models.base import Model
from agno.tools.function import Function, FunctionCall

from app.utils.agno_eval_guard import resolve_field_type
from app.utils.agno_patches import apply_agno_patches

# The vulnerable path (GHSA-77rh-m34w-rv36) is agno's own tool-call loop, not
# our code: it evaluates the field_type of any tool call named get_user_input.
# The unit tests cover the replacement in isolation; this drives agno's real
# run_function_calls to prove the guard is actually in the loop's way.

PAYLOAD = "__import__('os').system('touch /tmp/chattermate-agno-rce')"


class _StubModel(Model):
    """Concrete Model — run_function_calls is defined on the base class."""

    def __init__(self):
        self.id = "stub"
        self.name = "Stub"

    def invoke(self, *args, **kwargs):
        raise NotImplementedError

    async def ainvoke(self, *args, **kwargs):
        raise NotImplementedError

    def invoke_stream(self, *args, **kwargs):
        raise NotImplementedError

    async def ainvoke_stream(self, *args, **kwargs):
        raise NotImplementedError

    def parse_provider_response(self, response, **kwargs):
        raise NotImplementedError

    def parse_provider_response_delta(self, response):
        raise NotImplementedError


def user_input_call(field_type: str) -> FunctionCall:
    """The tool call a model (or a hostile MCP server) can ask for."""
    return FunctionCall(
        function=Function(name="get_user_input"),
        arguments={
            "user_input_fields": [
                {"field_name": "amount", "field_type": field_type, "field_description": "how many"}
            ]
        },
        call_id="call_1",
    )


def run(function_call: FunctionCall):
    apply_agno_patches()
    model = _StubModel()
    responses = list(model.run_function_calls([function_call], function_call_results=[]))
    schemas = [
        field
        for response in responses
        for execution in (response.tool_executions or [])
        for field in (execution.user_input_schema or [])
    ]
    return schemas


@pytest.mark.parametrize("field_type, expected", [("int", int), ("str", str), ("bool", bool)])
def test_legitimate_field_types_still_resolve_through_agnos_loop(field_type, expected):
    schemas = run(user_input_call(field_type))

    assert [field.field_type for field in schemas] == [expected]


def test_injected_code_is_not_executed_and_the_run_continues():
    with mock.patch("os.system") as system:
        schemas = run(user_input_call(PAYLOAD))

    system.assert_not_called()
    # agno catches NameError around its eval and falls back to str, so the run
    # carries on with a harmless type instead of dying or executing anything.
    assert [field.field_type for field in schemas] == [str]


def test_the_guard_is_the_callable_agnos_module_reaches_for():
    apply_agno_patches()
    import agno.models.base as agno_base

    assert agno_base.eval is resolve_field_type
