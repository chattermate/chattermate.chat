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

from app.tools.shopify_search import catalog_filters, match_singulars, singular_stems


@pytest.mark.parametrize("query,expected", [
    ("backpacks", "(backpacks OR backpack*)"),
    ("Backpacks", "(Backpacks OR Backpack*)"),
    ("canvas backpacks", "canvas (backpacks OR backpack*)"),
    ("mugs OR bottles", "(mugs OR mug*) OR (bottles OR bottle*)"),
    ("hoodies", "(hoodies OR hoodie* OR hoody)"),
    ("accessories", "(accessories OR accessorie* OR accessory)"),
    ("dresses", "(dresses OR dress*)"),
    ("Glasses", "(Glasses OR Glass*)"),
    ("boxes", "(boxes OR box*)"),
    ("watches", "(watches OR watch*)"),
    ("brushes", "(brushes OR brush*)"),
    ("shoes", "(shoes OR shoe*)"),
    ("bikes", "(bikes OR bike*)"),
])
def test_plural_words_also_match_the_singular(query, expected):
    assert match_singulars(query) == expected


@pytest.mark.parametrize("query", [
    "backpack",
    "glass", "dress",            # ends in ss: not a plural
    "canvas", "tennis", "status",  # -as, -is, -us: rarely plurals
    "bus", "gas",                # too short to tell
    "title:backpacks",           # a field value is the customer's exact ask
    "backpacks*",                # already a wildcard
    '"canvas backpacks"',        # a quoted phrase stays a phrase
    "tag:sale AND vendor:Larkfield",
    "",
])
def test_everything_else_is_left_alone(query):
    assert match_singulars(query) == query


def test_operators_are_never_widened():
    assert match_singulars("bags AND totes") == "(bags OR bag*) AND (totes OR tote*)"



@pytest.mark.parametrize("min_price,max_price,vendor,expected", [
    (None, None, None, []),
    (0, 0, "", []),                        # the model's "nothing asked"
    (-5, -1, "   ", []),
    (0, 50, None, ["price:<=50"]),
    (19.5, 0, None, ["price:>=19.5"]),
    (10, 50, "Larkfield", ["price:>=10", "price:<=50", "vendor:'Larkfield'"]),
    (None, None, "O'Neill", ["vendor:'ONeill'"]),   # a quote would end the value early
    (None, None, '"\\', []),
])
def test_catalog_filters(min_price, max_price, vendor, expected):
    assert catalog_filters(min_price, max_price, vendor) == expected


@pytest.mark.parametrize("query,stems", [
    ("mugs", "mug"),
    ("blue mugs", "blue mug"),
    ("accessories", "accessor"),
    ("boxes", "box"),
    ("glass", "glass"),
    ("tennis balls", "tennis ball"),
    ("mugs AND cups", "mug AND cup"),
])
def test_singular_stems(query, stems):
    assert singular_stems(query) == stems
