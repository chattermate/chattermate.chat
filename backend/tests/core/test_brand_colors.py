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

"""The backend logo colours must match the frontend's (one brand, two runtimes)."""

import json
from pathlib import Path

import pytest

from app.core.brand import BRAND_COLORS

FRONTEND_COLORS = Path(__file__).resolve().parents[3] / "frontend/src/config/brand-colors.json"


@pytest.mark.skipif(not FRONTEND_COLORS.exists(), reason="frontend sources not in this checkout")
def test_backend_brand_colors_match_frontend():
    assert dict(BRAND_COLORS) == json.loads(FRONTEND_COLORS.read_text())
