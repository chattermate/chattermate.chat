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

Main-content selection heuristics shared by the knowledge crawler (which
extracts text) and the help-center article importer (which needs the actual
DOM node to convert to Markdown). Selector priorities mirror
EnhancedWebsiteReader's extraction strategies.
"""

import re
from typing import Optional

from bs4 import BeautifulSoup, Tag

# Tags stripped before any content selection — never useful content.
STRIP_TAGS = ("script", "style", "noscript", "iframe", "head")

COMMON_CONTENT_CLASSES = (
    "post-content", "article-content", "entry-content", "page-content", "main-content",
    "blog-content", "content", "main", "article", "post", "entry", "text", "body",
)

COMMON_CONTENT_IDS = (
    "content", "main-content", "post-content", "article-content", "entry-content", "page-content",
    "blog-content", "main", "article", "post", "entry", "text", "body",
)

MIN_MAIN_CONTENT_CHARS = 100


def _substantial(node: Optional[Tag]) -> bool:
    return node is not None and len(node.get_text(" ", strip=True)) >= MIN_MAIN_CONTENT_CHARS


def select_main_node(soup: BeautifulSoup) -> Optional[Tag]:
    """The page's main-content element (mutates soup: strips script/style).

    Priority: role="main" → <article>/<main> → common content classes →
    common content ids → <body>. Returns None only for genuinely empty pages.
    """
    for tag in STRIP_TAGS:
        for element in soup.find_all(tag):
            element.extract()

    candidate = soup.find(attrs={"role": "main"})
    if _substantial(candidate):
        return candidate

    for tag in ("article", "main"):
        for element in soup.find_all(tag):
            if _substantial(element):
                return element

    for class_name in COMMON_CONTENT_CLASSES:
        for element in soup.find_all(class_=re.compile(class_name, re.IGNORECASE)):
            if _substantial(element):
                return element

    for id_name in COMMON_CONTENT_IDS:
        element = soup.find(id=re.compile(id_name, re.IGNORECASE))
        if _substantial(element):
            return element

    body = soup.find("body")
    return body if _substantial(body) else None
