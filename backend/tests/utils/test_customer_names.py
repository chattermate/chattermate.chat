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

import pytest

from app.utils.customer_names import is_placeholder_name, placeholder_name


def test_the_builder_and_the_detector_agree():
    name = placeholder_name("line", "U56cf1f891086ee6b44a9cefb8237d21f")
    assert name == "Line user U56cf1f8"
    assert is_placeholder_name(name, "line")
    assert is_placeholder_name(name)


@pytest.mark.parametrize("name", [None, "", "   ", "Messenger user 29661775", "Whatsapp user 91987654"])
def test_placeholders(name):
    assert is_placeholder_name(name)


@pytest.mark.parametrize("name", ["Somchai Prasert", "Jesper", "Line Brown"])
def test_real_names(name):
    assert not is_placeholder_name(name)


def test_a_channel_only_recognises_its_own_placeholder():
    assert not is_placeholder_name("Messenger user 29661775", "line")
