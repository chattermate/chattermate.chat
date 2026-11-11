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


The product sheet's options, read from the shop when the sheet opens.
"""

from unittest.mock import MagicMock

import pytest

from app.services.shopify_product_options import (
    MAX_VARIANTS, PRODUCT_OPTIONS_QUERY, choices_from, product_options, valid_product_id,
)


def _variant(variant_id, available=True, **options):
    return {"node": {"id": f"gid://shopify/ProductVariant/{variant_id}", "title": "/".join(options.values()),
                     "availableForSale": available, "price": "20.00",
                     "selectedOptions": [{"name": k, "value": v} for k, v in options.items()]}}


def _product(variants, names=("Size", "Colour"), more=False, published=True):
    return {"publishedAt": "2025-01-01T00:00:00Z" if published else None,
            "options": [{"name": n} for n in names],
            "variants": {"pageInfo": {"hasNextPage": more}, "edges": variants}}


def test_values_come_from_the_variants_in_order():
    choices = choices_from(_product([
        _variant(1, Size="M", Colour="Red"), _variant(2, False, Size="S", Colour="Red"), _variant(3, Size="M", Colour="Blue"),
    ]))
    assert choices["complete"] is True
    assert choices["options"] == [{"name": "Size", "values": ["M", "S"]}, {"name": "Colour", "values": ["Red", "Blue"]}]
    assert choices["variants"][1] == {"id": "2", "title": "S/Red", "available": False, "price": "20.00",
                                      "options": {"Size": "S", "Colour": "Red"}}


@pytest.mark.parametrize("product", [
    _product([_variant(1, Size="M", Colour="Red"), _variant(2, Size="S", Colour="Red")], more=True),
    _product([_variant(1, Size="M", Colour="Red")]),
    _product([_variant(1, Size="M"), _variant(2, Size="S")], names=()),
    _product([_variant(1, Size="M"), _variant(2, Size="S", Colour="Red")]),
    _product([_variant(1, Size="M", Colour="Red"), _variant(2, Size="S", Colour="Red")], published=False),
    None,
])
def test_a_product_the_sheet_cannot_show_whole_is_incomplete(product):
    assert choices_from(product)["complete"] is False


def test_the_query_asks_for_one_product_with_a_page_of_variants():
    service = MagicMock()
    service._execute_graphql.return_value = {"success": True, "data": {"product": _product(
        [_variant(1, Size="M", Colour="Red"), _variant(2, Size="S", Colour="Red")])}}
    assert product_options(service, "shop", "42")["complete"] is True
    query, variables = service._execute_graphql.call_args.args[1:]
    assert f"variants(first: {MAX_VARIANTS})" in query and "hasNextPage" in query
    assert variables == {"id": "gid://shopify/Product/42"}


def test_a_failed_call_offers_no_choices():
    service = MagicMock()
    service._execute_graphql.return_value = {"success": False}
    assert product_options(service, "shop", "42") == {"options": [], "variants": [], "complete": False}


@pytest.mark.parametrize("value,expected", [("42", "42"), (42, "42"), ("4 2", None), ("gid://x/1", None),
                                            ("1" * 21, None), (None, None), ("", None)])
def test_valid_product_id(value, expected):
    assert valid_product_id(value) == expected
