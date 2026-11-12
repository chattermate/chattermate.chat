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

The words on status cards, in the visitor's language. One table per language in
locales/<code>.json (en.json holds every key); the widget sends the browser's
preferred languages and the first one with a table is used, else English. A key
a table lacks falls back to English, so a new label never shows blank.
"""

import json
from datetime import datetime
from functools import lru_cache
from pathlib import Path
from typing import Any, Dict, Optional

LOCALES_DIR = Path(__file__).parent / 'locales'
DEFAULT_LANGUAGE = 'en'
# What the widget may send: a few BCP 47 tags, each short
MAX_PREFERENCES = 5
MAX_TAG_LENGTH = 35
# Primary tags that read as another table
_ALIASES = {'no': 'nb', 'nn': 'nb'}
# Traditional Chinese, by script or region
_TRADITIONAL = ('hant', 'tw', 'hk', 'mo')


@lru_cache(maxsize=None)
def supported() -> frozenset:
    return frozenset(path.stem for path in LOCALES_DIR.glob('*.json'))


@lru_cache(maxsize=None)
def _table(code: str) -> Dict[str, Any]:
    return json.loads((LOCALES_DIR / f'{code}.json').read_text(encoding='utf-8'))


def _table_for(tag: Any) -> Optional[str]:
    """The table for one language tag ("pt-BR", "zh_TW"), or None."""
    if not isinstance(tag, str) or not tag.strip() or len(tag) > MAX_TAG_LENGTH:
        return None
    parts = tag.strip().replace('_', '-').lower().split('-')
    primary = _ALIASES.get(parts[0], parts[0])
    if primary == 'zh':
        primary = 'zh-Hant' if any(part in _TRADITIONAL for part in parts[1:]) else 'zh'
    return primary if primary in supported() else None


def pick_language(preferences: Any) -> str:
    """The first of the visitor's languages (most preferred first) that has a table."""
    if isinstance(preferences, str):
        preferences = [preferences]
    if not isinstance(preferences, (list, tuple)):
        return DEFAULT_LANGUAGE
    for tag in list(preferences)[:MAX_PREFERENCES]:
        code = _table_for(tag)
        if code:
            return code
    return DEFAULT_LANGUAGE


class CardLabels:
    """Card text in one language."""

    def __init__(self, language: str = DEFAULT_LANGUAGE) -> None:
        self.language = language if language in supported() else DEFAULT_LANGUAGE
        self._own = _table(self.language)
        self._english = _table(DEFAULT_LANGUAGE)

    def _raw(self, key: str) -> Any:
        return self._own.get(key, self._english[key])

    def text(self, key: str, **values: Any) -> str:
        return str(self._raw(key)).format(**values)

    def items(self, count: int) -> str:
        return self.text('items_one' if count == 1 else 'items_other', n=count)

    def date(self, moment: datetime) -> str:
        """A short day and month: "3 Nov", "3. Nov.", "11月3日"."""
        # A table whose date is all numbers ("{day}.{month_number}.") needs no month names
        month = self._raw('months')[moment.month - 1]
        return self.text('date', day=moment.day, month=month, month_number=moment.month)


def labels_for(language: Optional[str]) -> CardLabels:
    return CardLabels(language or DEFAULT_LANGUAGE)


ENGLISH = CardLabels()

