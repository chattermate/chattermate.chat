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

The page the visitor is looking at while they chat, sent by the widget with
each message, so "is this in stock?" can be answered about the product on the
page. The page comes from the visitor's browser: it is data for the agent's
instructions, fenced as untrusted, never instructions itself.
"""

import re
from typing import Any, Optional
from urllib.parse import quote, unquote, urlsplit, urlunsplit

from app.agents.guardrail_policy import visitor_data_block
from app.utils.sanitize import sanitize_message
from app.utils.secret_redaction import redact_secrets

PAGE_URL_MAX = 500
PAGE_TITLE_MAX = 200
# The socket session key the widget's current page is kept under for this turn
PAGE_SESSION_KEY = 'page'
PAGE_LABEL = "CURRENT PAGE"

# A store product page: /products/<handle>, optionally under a locale
# (/en-gb/...) or a collection (/collections/<c>/products/<handle>)
_PRODUCT_PATH = re.compile(
    r'^(?:/[a-z]{2}(?:-[a-z]{2})?)?(?:/collections/[^/]+)?/products/([\w-]{1,255})/?$', re.I)
_BAD_URL_CHARS = re.compile(r'[\s<>]')
# Characters a browser can leave unencoded in a URL (men's-guide): encoded, not refused
_ENCODE_SAFE = "/?&=%:+,;@!$*()[]~-._"


def _clean_url(value: Any) -> Optional[str]:
    """An http(s) URL without its fragment, at most PAGE_URL_MAX long (the
    query goes first when it is too long); None for anything else."""
    if not isinstance(value, str):
        return None
    value = value.strip()
    if not value or len(value) > 4 * PAGE_URL_MAX or _BAD_URL_CHARS.search(value):
        return None
    try:
        parts = urlsplit(value)
        port = parts.port  # raises on an out-of-range port
    except ValueError:
        return None
    if parts.scheme.lower() not in ('http', 'https') or not parts.hostname:
        return None
    # Host and port only: login details (user:pass@) never reach the model
    host = f'[{parts.hostname}]' if ':' in parts.hostname else parts.hostname
    netloc = f'{host}:{port}' if port else host
    scheme = parts.scheme.lower()
    path, query = quote(parts.path, safe=_ENCODE_SAFE), quote(parts.query, safe=_ENCODE_SAFE)
    url = urlunsplit((scheme, netloc, path, query, ''))
    if len(url) > PAGE_URL_MAX:
        url = urlunsplit((scheme, netloc, path, '', ''))
    if len(url) > PAGE_URL_MAX:
        return None
    url, _ = redact_secrets(url)
    return url


def _clean_title(value: Any) -> Optional[str]:
    if not isinstance(value, str):
        return None
    text = " ".join(sanitize_message(value).split())[:PAGE_TITLE_MAX].strip()
    text, _ = redact_secrets(text)
    return text or None


def clean_page(value: Any) -> Optional[dict]:
    """The widget's {url, title}, validated; None unless it has an http(s) URL."""
    if not isinstance(value, dict):
        return None
    url = _clean_url(value.get('url'))
    if not url:
        return None
    return {'url': url, 'title': _clean_title(value.get('title'))}


def product_handle(url: Optional[str]) -> Optional[str]:
    """The product handle when the URL is a store product page."""
    if not url:
        return None
    match = _PRODUCT_PATH.match(unquote(urlsplit(url).path))
    return match.group(1).lower() if match else None


def page_context(page: Optional[dict]) -> Optional[str]:
    """Prompt text telling the agent which page the visitor is viewing."""
    if not isinstance(page, dict) or not page.get('url'):
        return None
    lines = [f"Title: {page['title']}"] if page.get('title') else []
    lines.append(f"URL: {page['url']}")
    text = ("The customer is viewing this page of the website while they chat. When they ask "
            "about \"this\" or \"it\" without naming anything, they mean what this page shows.\n"
            + visitor_data_block(PAGE_LABEL, "\n".join(lines)))
    handle = product_handle(page['url'])
    if handle:
        # Matched from a closed character set, so safe outside the fence
        text += (f"\nThe page is the store's product page for handle {handle}. With a product "
                 f"search tool, search for handle:{handle} to find this product.")
    return text
