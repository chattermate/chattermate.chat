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

Main-content selection shared by the knowledge crawler (which extracts text) and
the help-center article importer (which needs the actual DOM node to convert to
Markdown). One implementation, because the two drifting apart is how the crawler
bug below survived in the importer.
"""

from typing import Iterable, Optional

from bs4 import BeautifulSoup, Tag

# Tags stripped before any content selection — never useful content.
STRIP_TAGS = ("script", "style", "noscript", "iframe", "head")

# Chrome that repeats on every page. Excluded when measuring how much content a
# container holds, so that a page whose only text is a phone number and a login
# link reads as empty rather than full.
BOILERPLATE_TAGS = ("nav", "header", "footer", "aside")

# A container must hold at least this share of the page's content text to be
# considered "the page". Below it we keep looking outward.
CONTENT_RETENTION = 0.90

MIN_MAIN_CONTENT_CHARS = 100

# Containers worth considering, cheapest-to-richest. 'div' is here because most
# sites wrap their content in one rather than in <main>.
CANDIDATE_TAGS = ("article", "main", "section", "div")


def content_chars(node: Tag) -> int:
    """Length of a node's text, ignoring navigation chrome.

    solcontrol.ca has 147 characters of body text, all of it a phone number and
    a login link. Counting that as content made the page look ingestible and
    suppressed the browser fallback that could actually read it.
    """
    total = len(node.get_text(strip=True))
    for boilerplate in node.find_all(BOILERPLATE_TAGS):
        # Only outermost chrome: a <nav> inside a <header> is already counted in
        # the header's text, and subtracting both would understate the page.
        if boilerplate.find_parent(BOILERPLATE_TAGS) is not None:
            continue
        total -= len(boilerplate.get_text(strip=True))
    return max(total, 0)


def _strip_noise(soup: BeautifulSoup) -> None:
    for tag in STRIP_TAGS:
        for element in soup.find_all(tag):
            element.extract()


def _candidates(soup: BeautifulSoup, tags: Iterable[str]) -> Iterable[Tag]:
    for tag in tags:
        for element in soup.find_all(tag):
            yield element


def select_main_node(soup: BeautifulSoup, min_chars: int = MIN_MAIN_CONTENT_CHARS) -> Optional[Tag]:
    """The page's main-content element (mutates soup: strips script/style).

    Picks the *deepest* container that still holds essentially the whole page,
    which lands on <main> or the content <div> when one exists and on <body>
    otherwise.

    The previous implementation returned the first candidate whose text cleared
    MIN_MAIN_CONTENT_CHARS. That floor is not a quality bar — a hero banner
    clears it — so on a page whose first <article> was a 108-character search
    widget it returned the widget and discarded 4,500 characters of page.
    Selecting by how much of the page a container holds cannot make that
    mistake: a banner holds almost none of it.

    Returns None only for genuinely empty pages, so callers can fall back.
    """
    _strip_noise(soup)

    body = soup.find("body") or soup
    budget = content_chars(body)
    if budget < min_chars:
        return None

    best = body
    best_depth = len(list(body.parents))
    for element in _candidates(soup, CANDIDATE_TAGS):
        if element is best:
            continue
        if content_chars(element) < CONTENT_RETENTION * budget:
            continue
        # Same content, more specific container: prefer it, since the extra
        # wrapper is chrome we would otherwise index on every page.
        depth = len(list(element.parents))
        if depth > best_depth:
            best, best_depth = element, depth

    return best
