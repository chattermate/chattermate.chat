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

import agno.models.base
import agno.tools.function
import pytest
from agno.tools.function import UserInputField

from app.utils.agno_eval_guard import (
    _FIELD_TYPES,
    UnsafeFieldTypeError,
    install_eval_guard,
    resolve_field_type,
)
from app.utils.agno_patches import apply_agno_patches

# What an attacker would put in `field_type`: code, attribute walks to reach
# builtins, statement smuggling, and the empty/blank strings eval would choke on.
INJECTIONS = [
    "__import__('os').system('true')",
    "str.__class__",
    "().__class__.__bases__[0]",
    "int; import os",
    "os.system",
    "",
    "   ",
]


@pytest.fixture(autouse=True)
def guarded():
    # Production installs the guard at import of agno_utils; every test here
    # runs with it in place, exactly like the app does.
    install_eval_guard()


@pytest.mark.parametrize("name, expected", list(_FIELD_TYPES.items()))
def test_resolves_builtin_type_names(name, expected):
    assert resolve_field_type(name) is expected


def test_tolerates_surrounding_whitespace():
    assert resolve_field_type("  int\n") is int


def test_accepts_the_globals_and_locals_eval_takes():
    assert resolve_field_type("float", {}, {}) is float


@pytest.mark.parametrize("expr", INJECTIONS + [None, 42, int, ["str"]])
def test_rejects_anything_but_an_allowed_name(expr):
    with pytest.raises(UnsafeFieldTypeError):
        resolve_field_type(expr)


def test_rejection_is_a_name_error_so_agno_falls_back_to_str():
    # agno.models.base wraps its eval in `except (NameError, SyntaxError)` and
    # substitutes str. Subclassing NameError keeps that fallback intact.
    assert issubclass(UnsafeFieldTypeError, NameError)


def test_a_blocked_payload_is_logged(caplog):
    # agno turns the error into a silent str fallback, so the log line is the
    # only evidence an injection was attempted.
    with caplog.at_level("WARNING"), pytest.raises(UnsafeFieldTypeError):
        resolve_field_type("__import__('os').system('true')")

    assert "Blocked an unsafe user-input field type" in caplog.text


def test_a_valid_type_name_logs_nothing(caplog):
    with caplog.at_level("WARNING"):
        resolve_field_type("int")

    assert caplog.text == ""


def test_nothing_is_executed():
    with mock.patch("os.system") as system, pytest.raises(UnsafeFieldTypeError):
        resolve_field_type("__import__('os').system('true')")
    system.assert_not_called()


def test_guard_shadows_eval_in_both_agno_modules():
    assert agno.models.base.eval is resolve_field_type
    assert agno.tools.function.eval is resolve_field_type


def test_apply_agno_patches_installs_the_guard():
    for module in (agno.models.base, agno.tools.function):
        del module.eval
    apply_agno_patches()
    assert agno.models.base.eval is resolve_field_type
    assert agno.tools.function.eval is resolve_field_type


def test_install_is_idempotent():
    install_eval_guard()
    install_eval_guard()
    assert agno.tools.function.eval is resolve_field_type


def test_from_dict_resolves_a_plain_type_name():
    field = UserInputField.from_dict(
        {"name": "quantity", "field_type": "int", "description": None, "value": None}
    )
    assert field.field_type is int


@pytest.mark.parametrize("field_type", list(_FIELD_TYPES.values()))
def test_to_dict_from_dict_round_trip(field_type):
    original = UserInputField(name="f", field_type=field_type, description="d", value=None)
    assert UserInputField.from_dict(original.to_dict()) == original


@pytest.mark.parametrize("expr", INJECTIONS)
def test_from_dict_refuses_code(expr):
    payload = {"name": "f", "field_type": expr, "description": None, "value": None}
    with mock.patch("os.system") as system, pytest.raises(UnsafeFieldTypeError):
        UserInputField.from_dict(payload)
    system.assert_not_called()
