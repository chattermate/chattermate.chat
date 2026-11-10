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

Products as plain text, for channels with no product cards. The Shopify prompt
keeps product details out of the reply because the widget shows them as cards,
so on a channel the reply alone would announce products and show none.
"""

from typing import Any, Optional

MAX_PRODUCTS_IN_TEXT = 5


def _product_text(product: Any, shop_domain: Optional[str]) -> str:
    price = product.price_formatted or (f"{product.currency} {product.price}" if product.price else None)
    text = f"• {product.title} - {price}" if price else f"• {product.title}"
    if product.handle and shop_domain:
        text += f"\n  https://{shop_domain}/products/{product.handle}"
    return text


def with_product_list(message: str, shopify_output: Any) -> str:
    """The reply with the products it announces written out below it."""
    products = [p for p in getattr(shopify_output, 'products', None) or [] if p.title]
    if not products:
        return message
    shop_domain = shopify_output.shop_domain
    listed = "\n".join(_product_text(p, shop_domain) for p in products[:MAX_PRODUCTS_IN_TEXT])
    return f"{message}\n\n{listed}"
