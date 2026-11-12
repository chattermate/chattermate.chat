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
"""

import pytest

from app.agents.channel_products import MAX_PRODUCTS_IN_TEXT, with_product_list
from app.models.schemas.chat import ShopifyOutputData, ShopifyOutputDataLLM, ShopifyProduct


def output(*products, shop_domain="demo.myshopify.com"):
    return ShopifyOutputData(products=list(products), shop_domain=shop_domain)


def product(**fields):
    return ShopifyProduct(**{"title": "Board", "price": "99.00", "currency": "USD", "handle": "board", **fields})


def test_lists_title_price_and_link():
    assert with_product_list("Options:", output(product())) == (
        "Options:\n\n• Board - USD 99.00\n  https://demo.myshopify.com/products/board"
    )


def test_a_formatted_price_wins():
    assert "• Board - $99" in with_product_list("x", output(product(price_formatted="$99")))


def test_no_price_is_left_out_rather_than_shown_as_none():
    text = with_product_list("x", output(product(price=None)))
    assert "• Board\n" in text
    assert "None" not in text


@pytest.mark.parametrize("fields,domain", [({"handle": None}, "demo.myshopify.com"), ({}, None)])
def test_no_link_without_a_handle_and_a_domain(fields, domain):
    assert "http" not in with_product_list("x", output(product(**fields), shop_domain=domain))


def test_a_product_with_no_title_is_skipped():
    assert with_product_list("x", output(product(title=None))) == "x"


def test_a_long_list_is_cut_to_fit_a_chat_message():
    many = [product(title=f"Board {n}") for n in range(MAX_PRODUCTS_IN_TEXT + 3)]
    assert with_product_list("x", output(*many)).count("•") == MAX_PRODUCTS_IN_TEXT


@pytest.mark.parametrize("nothing", [
    None,
    output(),
    # What the model produced, when the cached products could not be attached
    ShopifyOutputDataLLM(product_cache_key="k", product_ids=["1"]),
])
def test_nothing_to_list_leaves_the_reply_alone(nothing):
    assert with_product_list("Hello", nothing) == "Hello"
