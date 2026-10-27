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

import sys
import types

import pytest

from app.core import enterprise_hooks
from app.core.enterprise_hooks import EnterpriseHookBroken, enterprise_hook

HOOK = "app.enterprise.services.some_hook"


@pytest.fixture(autouse=True)
def fresh(monkeypatch):
    enterprise_hooks.forget_loaded_hooks()
    yield
    enterprise_hooks.forget_loaded_hooks()


def _enterprise_package(monkeypatch, module):
    """app.enterprise installed, with `module` at HOOK (None: a build without it)."""
    for name in ("app.enterprise", "app.enterprise.services"):
        monkeypatch.setitem(sys.modules, name, types.ModuleType(name))
    monkeypatch.setitem(sys.modules, HOOK, module)


def test_no_enterprise_package_means_no_hook(monkeypatch):
    monkeypatch.setitem(sys.modules, "app.enterprise", None)
    assert enterprise_hook(HOOK, "run") is None


def test_an_enterprise_build_without_the_hook_has_none(monkeypatch):
    _enterprise_package(monkeypatch, None)
    assert enterprise_hook(HOOK, "run") is None


def test_an_installed_hook_is_found_once(monkeypatch):
    module = types.ModuleType(HOOK)
    module.run = lambda: "ran"
    _enterprise_package(monkeypatch, module)
    assert enterprise_hook(HOOK, "run")() == "ran"
    monkeypatch.setitem(sys.modules, HOOK, None)
    assert enterprise_hook(HOOK, "run")() == "ran"  # not looked up again


def test_a_hook_module_without_the_function_is_broken(monkeypatch):
    _enterprise_package(monkeypatch, types.ModuleType(HOOK))
    with pytest.raises(EnterpriseHookBroken):
        enterprise_hook(HOOK, "run")


def test_a_hook_whose_own_dependency_is_missing_is_broken(monkeypatch):
    def importing(name):
        raise ModuleNotFoundError("No module named 'some_sdk'", name="some_sdk")

    monkeypatch.setattr(enterprise_hooks.importlib, "import_module", importing)
    with pytest.raises(EnterpriseHookBroken):
        enterprise_hook(HOOK, "run")


def test_a_missing_sibling_enterprise_module_is_broken_too(monkeypatch):
    """Only the hook's own module (or a package above it) missing means absent."""
    def importing(name):
        raise ModuleNotFoundError("No module named 'app.enterprise.services.other'", name="app.enterprise.services.other")

    monkeypatch.setattr(enterprise_hooks.importlib, "import_module", importing)
    with pytest.raises(EnterpriseHookBroken):
        enterprise_hook(HOOK, "run")
