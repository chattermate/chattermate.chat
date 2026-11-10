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

Shopify's product search matches whole words and doesn't stem, so "backpacks"
finds nothing in a store that sells "Roll-Top Canvas Backpack". Customers ask in
plurals, and the model passes their word on.
"""

import re

# A plain plural word of four letters or more: not a field value (title:x), not a
# wildcard, and not a word that only looks plural ("glass", "canvas", "tennis", "bus")
_PLURAL = re.compile(r"(?<![\w:*'\"-])([A-Za-z]{2,}[^sSaAiIuU\W])s(?![\w:*'\"-])")
_OPERATORS = {"AND", "OR", "NOT"}


def _widen(match: re.Match) -> str:
    word = match.group(0)
    if word.upper() in _OPERATORS:
        return word
    return f"({word} OR {match.group(1)}*)"


def match_singulars(query: str) -> str:
    """The query with each plain plural word also matching its singular, using
    Shopify's own suffix wildcard. Quoted phrases are left as they are."""
    parts = query.split('"')
    # Even parts are outside quotes
    return '"'.join(_PLURAL.sub(_widen, part) if i % 2 == 0 else part for i, part in enumerate(parts))
