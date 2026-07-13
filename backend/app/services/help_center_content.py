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

FAQ answers are authored and stored as Markdown so a single Text column can hold
rich help-center articles (headings, images, links, ordered steps, callouts).
This module turns that Markdown into HTML for the public page, and into plain
text for previews, meta descriptions and FAQPage structured data.

Security: the rendered HTML is dropped onto the *public* help center, so an org
admin's Markdown is untrusted input for visitors. Everything is run through an
nh3 (ammonia) allowlist clean — the template must mark this output `| safe`, so
this is the ONLY place org content is ever trusted as HTML.
"""

import re

import markdown as _markdown
import nh3
from bs4 import BeautifulSoup

# `extra` enables tables/fenced code/etc; `sane_lists` fixes mixed list quirks;
# `nl2br` treats single newlines as <br> so plain-text FAQ answers (the common
# case) keep their line breaks without the author needing blank lines.
_MD_EXTENSIONS = ["extra", "sane_lists", "nl2br"]

# Allowlist of tags a help-center article may contain. Anything else (script,
# style, iframe, form, event handlers, …) is stripped by nh3.
_ALLOWED_TAGS = {
    "p", "br", "hr", "h1", "h2", "h3", "h4", "h5", "h6",
    "strong", "b", "em", "i", "u", "s", "del", "code", "pre", "blockquote",
    "ul", "ol", "li", "a", "img",
    "table", "thead", "tbody", "tr", "th", "td",
    "figure", "figcaption", "span",
}
_ALLOWED_ATTRS = {
    "a": {"href", "title"},
    "img": {"src", "alt", "title"},
}
# Block javascript:/data: URLs; images and links may only point at real hosts.
_URL_SCHEMES = {"http", "https", "mailto"}

_WHITESPACE_RE = re.compile(r"\s+")


def render_article_html(text: str) -> str:
    """Markdown -> sanitized HTML for the public article body. Safe to render
    with Jinja's `| safe` because nh3 strips every tag/attr/scheme off-allowlist
    and rewrites link rel to neutralise tab-nabbing."""
    if not text or not text.strip():
        return ""
    raw = _markdown.markdown(text, extensions=_MD_EXTENSIONS, output_format="html")
    return nh3.clean(
        raw,
        tags=_ALLOWED_TAGS,
        attributes=_ALLOWED_ATTRS,
        url_schemes=_URL_SCHEMES,
        link_rel="noopener noreferrer nofollow",
    )


def to_plain_text(text: str) -> str:
    """Strip Markdown/HTML to a single line of readable text (previews, meta
    descriptions, JSON-LD answer text)."""
    if not text or not text.strip():
        return ""
    html = _markdown.markdown(text, extensions=_MD_EXTENSIONS, output_format="html")
    plain = BeautifulSoup(html, "html.parser").get_text(" ")
    return _WHITESPACE_RE.sub(" ", plain).strip()


def excerpt(text: str, length: int = 150) -> str:
    """A short one-line preview of an answer, cut on a word boundary."""
    plain = to_plain_text(text)
    if len(plain) <= length:
        return plain
    return plain[:length].rsplit(" ", 1)[0].rstrip() + "…"


def read_time_minutes(text: str) -> int:
    """Estimated read time in whole minutes (>= 1), ~200 words/min."""
    words = len(to_plain_text(text).split())
    return max(1, round(words / 200))


def read_time_label(text: str) -> str:
    return f"{read_time_minutes(text)} min read"
