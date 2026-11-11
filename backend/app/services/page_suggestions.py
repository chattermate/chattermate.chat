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

"Suggested for this page": the start state's rows for the page the visitor is on,
first sources first, without repeats, at most three:
1. the agent's own rules: a quick action with `match` (a URL path pattern);
2. the page's type on a store (a product, the cart or checkout, the orders page);
3. the org's published FAQs generated from this page (FAQ.source_url);
4. the agent's quick actions for every page (today's behaviour).
Nothing is generated per view. Each row's icon comes from where it came from, or
a small keyword map for free-text quick actions.
"""

import fnmatch
import re
from typing import Any, Dict, List, Optional
from urllib.parse import urlparse

from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.models.faq import FAQ

MAX_ROWS = 3
PILL_MAX = 24
LABEL_MAX = 120
PUBLISHED = 'published'

ICONS = frozenset({'order', 'shipping', 'returns', 'product', 'billing', 'account', 'person', 'article', 'question'})

# Free-text quick actions without an icon, first match wins
_KEYWORDS = [
    (re.compile(r'\b(order|track|tracking|deliver(y|ed)?|parcel)\b', re.I), 'order'),
    (re.compile(r'\b(ship|shipping|postage)\b', re.I), 'shipping'),
    (re.compile(r'\b(return|refund|exchange)s?\b', re.I), 'returns'),
    (re.compile(r'\b(price|pricing|plan|billing|invoice|payment)s?\b', re.I), 'billing'),
    (re.compile(r'\b(login|log in|password|account|sign in)\b', re.I), 'account'),
    (re.compile(r'\b(human|person|agent|someone|talk to)\b', re.I), 'person'),
]
_FAQ_CATEGORY_ICONS = {'shipping': 'shipping', 'delivery': 'shipping', 'returns': 'returns', 'refunds': 'returns',
                       'billing': 'billing', 'payments': 'billing', 'account': 'account'}

# Page types on a Shopify store: (path pattern, questions, icon)
_STORE_PAGES = [
    (re.compile(r'^(/[a-z]{2}(-[a-z]{2})?)?/products/[^/]+/?$', re.I),
     ['Is this in stock?', 'What sizes does it come in?'], 'product'),
    (re.compile(r'^(/[a-z]{2}(-[a-z]{2})?)?/(cart|checkouts?)(/.*)?$', re.I),
     ['How long does shipping take?', 'What is your returns policy?'], 'shipping'),
    (re.compile(r'^(/[a-z]{2}(-[a-z]{2})?)?/account/orders(/.*)?$', re.I),
     ["Where's my order?"], 'order'),
]


def keyword_icon(label: str) -> str:
    for pattern, icon in _KEYWORDS:
        if pattern.search(label):
            return icon
    return 'question'


def normalise_url(url: Any) -> Optional[str]:
    """origin + path, no query, fragment or trailing slash, lower-case host; None
    unless it is an http(s) URL."""
    if not isinstance(url, str) or len(url) > 2000:
        return None
    parsed = urlparse(url.strip())
    if parsed.scheme not in ('http', 'https') or not parsed.hostname:
        return None
    path = parsed.path.rstrip('/') or ''
    port = f':{parsed.port}' if parsed.port else ''
    return f'{parsed.scheme}://{parsed.hostname.lower()}{port}{path}'


def path_of(url: Optional[str]) -> str:
    return urlparse(url).path or '/' if url else '/'


def _quick_actions(agent: Any) -> List[Any]:
    customization = getattr(agent, 'customization', None)
    actions = getattr(customization, 'quick_actions', None)
    return actions if isinstance(actions, list) else []


def _rule(entry: Any) -> Optional[Dict[str, str]]:
    """A quick action as {label, match?, icon?}; a plain string means every page."""
    if isinstance(entry, str):
        return {'label': entry.strip()} if entry.strip() else None
    if isinstance(entry, dict) and isinstance(entry.get('label'), str) and entry['label'].strip():
        rule = {'label': entry['label'].strip()}
        if isinstance(entry.get('match'), str) and entry['match'].strip():
            rule['match'] = entry['match'].strip()
        if entry.get('icon') in ICONS:
            rule['icon'] = entry['icon']
        return rule
    return None


def _matches(pattern: str, path: str) -> bool:
    """A path pattern: '/products/*', '/pages/shipping', '/cart'."""
    pattern = pattern if pattern.startswith('/') else f'/{pattern}'
    return fnmatch.fnmatchcase(path.rstrip('/') or '/', pattern.rstrip('/') or '/')


def _faq_rows(db: Session, org_id: Any, page: Optional[str]) -> List[Dict[str, str]]:
    if not page:
        return []
    parsed = urlparse(page)
    near = f'%{parsed.netloc}{parsed.path}%'.replace('_', r'\_')
    candidates = db.query(FAQ).filter(FAQ.organization_id == org_id, FAQ.status == PUBLISHED,
                                      FAQ.source_url.ilike(near, escape='\\')) \
        .order_by(desc(FAQ.helpful_yes - FAQ.helpful_no), FAQ.sort_order).limit(200).all()
    rows = []
    for faq in candidates:
        if normalise_url(faq.source_url) == page and faq.question:
            category = str(faq.category or '').strip().lower()
            rows.append({'label': faq.question.strip(), 'icon': _FAQ_CATEGORY_ICONS.get(category, 'article'),
                         'source': 'faq'})
    return rows


def suggestions_for(db: Session, org_id: Any, agent: Any, url: Any, title: Any = None,
                    store: bool = False) -> dict:
    """{heading: 'page' | 'popular', pill, items: [{label, icon, source}]} for this page."""
    page = normalise_url(url)
    path = path_of(page)
    rules = [r for r in (_rule(e) for e in _quick_actions(agent)) if r]
    found: List[Dict[str, str]] = []

    for rule in rules:
        if 'match' in rule and _matches(rule['match'], path):
            found.append({'label': rule['label'], 'icon': rule.get('icon') or keyword_icon(rule['label']), 'source': 'rule'})
    if store:
        for pattern, questions, icon in _STORE_PAGES:
            if pattern.match(path):
                found += [{'label': q, 'icon': icon, 'source': 'page'} for q in questions]
                break
    found += _faq_rows(db, org_id, page)
    for_this_page = bool(found)
    for rule in rules:
        if 'match' not in rule:
            found.append({'label': rule['label'], 'icon': rule.get('icon') or keyword_icon(rule['label']), 'source': 'popular'})

    items, seen = [], set()
    for row in found:
        key = row['label'].casefold()
        if key not in seen:
            seen.add(key)
            items.append({**row, 'label': row['label'][:LABEL_MAX]})
        if len(items) == MAX_ROWS:
            break
    # The page's title as a pill, only when a row is about this page
    text = ' '.join(str(title or '').split()) if for_this_page else ''
    pill = (text[:PILL_MAX - 1] + '…' if len(text) > PILL_MAX else text) or None
    return {'heading': 'page' if for_this_page else 'popular', 'pill': pill, 'items': items}
