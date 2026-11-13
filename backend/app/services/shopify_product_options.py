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

A product's options and variants for the widget's product sheet, read from the
agent's own shop when the visitor opens the sheet. Product searches stay cheap
(no variant lists: Shopify charges every search for each variant asked for), and
nothing of this is stored on the conversation.
"""

from typing import Any, Dict, List, Optional

from app.models.shopify import ShopifyShop

# One sheet reads at most this many variants. A product with more is left to its
# own page: the sheet could not say which values are really sold out.
MAX_VARIANTS = 100
_PRODUCT_ID_DIGITS = 20

PRODUCT_OPTIONS_QUERY = f"""
query ProductOptions($id: ID!) {{
  product(id: $id) {{
    id
    publishedAt
    options {{ name }}
    variants(first: {MAX_VARIANTS}) {{
      pageInfo {{ hasNextPage }}
      edges {{ node {{ id title availableForSale price selectedOptions {{ name value }} }} }}
    }}
  }}
}}
"""


def valid_product_id(product_id: Any) -> Optional[str]:
    """A Shopify product's numeric id as text, or None."""
    text = str(product_id or '').strip()
    return text if text.isdigit() and len(text) <= _PRODUCT_ID_DIGITS else None


def _variant(node: dict) -> Optional[dict]:
    if not node.get('id'):
        return None
    return {
        'id': node['id'].split('/')[-1],
        'title': node.get('title'),
        'available': bool(node.get('availableForSale')),
        'price': node.get('price'),
        'options': {o['name']: o['value'] for o in node.get('selectedOptions') or []
                    if o.get('name') and isinstance(o.get('value'), str)},
    }


def choices_from(product: Optional[dict]) -> Dict[str, Any]:
    """{options, variants, complete} from a product node. Option values are the
    ones some variant has, in the order the variants list them, so a value no
    variant offers never shows as a sold-out chip. `complete` is false when the
    product has more variants than were read, or none worth choosing between."""
    if not product or not product.get('publishedAt'):
        return {'options': [], 'variants': [], 'complete': False}
    connection = product.get('variants') or {}
    variants = [v for v in (_variant(e.get('node') or {}) for e in connection.get('edges') or []) if v]
    names = [o['name'] for o in product.get('options') or [] if o.get('name')]
    options: List[dict] = []
    for name in names:
        values: List[str] = []
        for variant in variants:
            value = variant['options'].get(name)
            if value is not None and value not in values:
                values.append(value)
        options.append({'name': name, 'values': values})
    complete = (len(variants) > 1 and bool(names)
                and not (connection.get('pageInfo') or {}).get('hasNextPage')
                and all(all(name in v['options'] for name in names) for v in variants))
    return {'options': options, 'variants': variants, 'complete': complete}


def product_options(service: Any, shop: ShopifyShop, product_id: str) -> Dict[str, Any]:
    """The sheet's choices for one product of this shop (`service`: ShopifyService)."""
    result = service._execute_graphql(shop, PRODUCT_OPTIONS_QUERY,
                                      {'id': f'gid://shopify/Product/{product_id}'})
    product = (result.get('data') or {}).get('product') if result.get('success') else None
    return choices_from(product)
