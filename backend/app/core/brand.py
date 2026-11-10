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

"""ChatterMate logo colours for server-rendered pages (help center) and emails.

Mirrors frontend/src/config/brand-colors.json, which the dashboard and widget
use; tests/core/test_brand_colors.py fails if the two drift.
"""

from types import MappingProxyType

BRAND_COLORS = MappingProxyType({
    "ink": "#12150E",    # the tile
    "lime": "#C9F24E",   # the AI dot
    "coral": "#FF9D87",  # the human dot
    "paper": "#F5F6F0",  # light ground / text on dark
})
