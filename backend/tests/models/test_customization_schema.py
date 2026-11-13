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

from app.api.agent import router
from app.models.schemas.agent_customization import LauncherIcon, customization_schema


def test_the_schema_covers_fields_and_structured_metadata():
    schema = customization_schema()
    fields = schema["customization"]["properties"]
    assert {"accent_color", "chat_style", "welcome_subtitle", "show_citations"} <= fields.keys()
    assert set(schema["metadata"]) == {"launcher", "widget_display", "widget_ui"}


def test_allowed_values_come_from_the_models():
    launcher = customization_schema()["metadata"]["launcher"]
    icon = launcher["$defs"]["LauncherIcon"]["enum"]
    assert icon == [i.value for i in LauncherIcon]
    sidebar = customization_schema()["metadata"]["widget_display"]["properties"]["sidebar_width"]
    assert {"minimum": 320, "maximum": 640}.items() <= sidebar["anyOf"][0].items()


def test_the_literal_path_wins_over_an_agent_id():
    paths = [route.path for route in router.routes if "GET" in getattr(route, "methods", set())]
    assert paths.index("/customization-schema") < paths.index("/{agent_id}")
