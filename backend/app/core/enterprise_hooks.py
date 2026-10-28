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

Optional functions an installed enterprise module plugs into community code.

A hook is a function at a fixed place under app.enterprise. Not finding it,
because the community edition has no enterprise package or this build of it
predates the hook, means "no hook". Finding it broken, because it imports
something missing or lacks the function, is a different thing and raises:
each caller decides whether that fails closed (a sign-in policy) or open.
"""

import importlib
from typing import Callable, Dict, Optional, Tuple

_ENTERPRISE_PACKAGE = "app.enterprise"
_loaded: Dict[Tuple[str, str], Optional[Callable]] = {}


class EnterpriseHookBroken(Exception):
    """The hook is installed but can't be used."""


def _absent(module: str, error: ModuleNotFoundError) -> bool:
    # The hook's own module, or a package above it, isn't there; anything
    # else missing is a dependency of an installed hook.
    missing = error.name or ""
    return missing.startswith(_ENTERPRISE_PACKAGE) and (module == missing or module.startswith(missing + "."))


def enterprise_hook(module: str, name: str) -> Optional[Callable]:
    """`name` from `module` (under app.enterprise), None when it isn't
    installed. Raises EnterpriseHookBroken when it is but can't load. Loaded
    once per process."""
    key = (module, name)
    if key not in _loaded:
        try:
            hook = getattr(importlib.import_module(module), name)
        except ModuleNotFoundError as e:
            if not _absent(module, e):
                raise EnterpriseHookBroken(f"{module}: {e}") from e
            hook = None
        except (ImportError, AttributeError) as e:
            raise EnterpriseHookBroken(f"{module}.{name}: {e}") from e
        _loaded[key] = hook
    return _loaded[key]


def forget_loaded_hooks() -> None:
    """Tests: load hooks afresh."""
    _loaded.clear()
