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

# Runtime guard for the pinned agno==1.7.6 (GHSA-77rh-m34w-rv36, fixed
# upstream in 2.3.24). Remove this module with the agno 2.x upgrade.
#
# agno turns a user-input field's type name back into a Python type by calling
# eval() on a string it did not produce: in agno.models.base the string is the
# `field_type` of a `get_user_input` tool call, i.e. text the model wrote, and
# in agno.tools.function it is read back from a stored run response. A tool
# named get_user_input is all it takes to reach that eval, and MCP connectors
# register tools under whatever name the server advertises, so a hostile or
# prompt-injected connector could run arbitrary Python inside the backend.
#
# Both modules look `eval` up as a global name, so binding a module-level `eval`
# shadows the builtin for those two modules only. The replacement never
# evaluates anything: it maps a bare builtin type name to the type and refuses
# everything else.

import agno.models.base
import agno.tools.function

from app.core.logger import get_logger

logger = get_logger(__name__)

# Every type UserInputField.to_dict can emit (it writes type.__name__). Nothing
# else was ever a valid field type, so refusing it changes no legitimate path.
_FIELD_TYPES = {t.__name__: t for t in (str, int, float, bool, list, dict, tuple, set, bytes)}

_GUARDED_MODULES = (agno.models.base, agno.tools.function)


class UnsafeFieldTypeError(NameError):
    """Raised for any field_type that is not a plain builtin type name.

    A NameError on purpose: agno's model loop catches (NameError, SyntaxError)
    around its eval and falls back to str, so a rejected value degrades exactly
    the way an unknown name always did — the run continues, nothing executes.
    """


def resolve_field_type(expr, *_args, **_kwargs):
    """Drop-in for eval() that only ever maps a type name to the type.

    Accepts eval's optional globals/locals so any call shape agno uses works.
    """
    if isinstance(expr, str):
        field_type = _FIELD_TYPES.get(expr.strip())
        if field_type is not None:
            return field_type
    # agno swallows the error and carries on with str, so without this line a
    # blocked payload would leave no trace at all. Nothing legitimate reaches
    # here, which makes every one of these worth seeing.
    logger.warning(f"Blocked an unsafe user-input field type: {expr!r}")
    raise UnsafeFieldTypeError(f"Unsupported user-input field type: {expr!r}")


def install_eval_guard() -> None:
    """Shadow eval in the agno modules that hand model-supplied text to it."""
    for module in _GUARDED_MODULES:
        module.eval = resolve_field_type
