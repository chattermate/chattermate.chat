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


"Suggested for this page": rules, page type, the page's FAQs, then the agent's
every-page quick actions; at most three, no repeats, icons by source.
"""

from types import SimpleNamespace
from uuid import uuid4

import pytest

from app.models.faq import FAQ
from app.services.page_suggestions import _matches, every_page_labels, keyword_icon, normalise_url, suggestions_for


def _agent(actions):
    return SimpleNamespace(customization=SimpleNamespace(quick_actions=actions))


def _faq(db, org_id, question, url, status="published", yes=0, no=0, category="General"):
    db.add(FAQ(id=uuid4(), organization_id=org_id, question=question, answer="A", source_url=url,
               status=status, helpful_yes=yes, helpful_no=no, category=category))
    db.commit()


@pytest.mark.parametrize("url,expected", [
    ("https://Shop.Example/products/tee/?variant=1#x", "https://shop.example/products/tee"),
    ("http://shop.example:8080/", "http://shop.example:8080"),
    ("javascript:alert(1)", None),
    ("ftp://x/y", None),
    ("http://x:99999/a", None),
    (None, None),
])
def test_normalise_url(url, expected):
    assert normalise_url(url) == expected


@pytest.mark.parametrize("label,icon", [
    ("Track my order", "order"), ("Do you ship abroad?", "shipping"), ("Can I get a refund?", "returns"),
    ("What plans do you have?", "billing"), ("I forgot my password", "account"),
    ("Talk to a person", "person"), ("Hello there", "question"),
])
def test_keyword_icons(label, icon):
    assert keyword_icon(label) == icon


class TestSuggestions:
    def test_a_rule_for_this_page_comes_first_with_the_page_title_pill(self, db, test_organization_id):
        agent = _agent([{"label": "Does it run small?", "match": "/products/*", "icon": "product"}, "Track my order"])
        result = suggestions_for(db, test_organization_id, agent, "https://shop.example/products/tee", "Organic Cotton Tee Classic Fit")
        assert result["heading"] == "page" and result["pill"] == "Organic Cotton Tee Clas…"
        assert result["items"][0] == {"label": "Does it run small?", "icon": "product", "source": "rule"}
        assert result["items"][-1]["label"] == "Track my order"

    def test_a_rule_for_another_page_is_not_shown(self, db, test_organization_id):
        agent = _agent([{"label": "Sizes?", "match": "/products/*"}, "Track my order"])
        result = suggestions_for(db, test_organization_id, agent, "https://shop.example/pages/about", "About")
        assert [i["label"] for i in result["items"]] == ["Track my order"]
        assert result["heading"] == "popular" and result["pill"] is None

    def test_store_pages_get_their_own_questions(self, db, test_organization_id):
        cart = suggestions_for(db, test_organization_id, _agent([]), "https://shop.example/cart", "Cart", store=True)
        assert [i["label"] for i in cart["items"]] == ["How long does shipping take?", "What is your returns policy?"]
        product = suggestions_for(db, test_organization_id, _agent([]), "https://shop.example/fr/products/tee", "Tee", store=True)
        assert product["items"][0]["icon"] == "product"
        not_a_store = suggestions_for(db, test_organization_id, _agent([]), "https://shop.example/cart", "Cart")
        assert not_a_store["items"] == []

    def test_the_pages_published_faqs_best_first(self, db, test_organization_id):
        page = "https://shop.example/pages/shipping"
        _faq(db, test_organization_id, "How long is delivery?", page + "/", yes=1, category="Shipping")
        _faq(db, test_organization_id, "Do you ship to Canada?", page, yes=9)
        _faq(db, test_organization_id, "A draft", page, status="draft")
        _faq(db, test_organization_id, "Another page", "https://shop.example/pages/returns")
        result = suggestions_for(db, test_organization_id, _agent([]), page + "?utm=1", "Shipping")
        assert [i["label"] for i in result["items"]] == ["Do you ship to Canada?", "How long is delivery?"]
        assert result["items"][1]["icon"] == "shipping" and result["items"][0]["icon"] == "article"
        assert result["heading"] == "page"

    def test_another_orgs_faqs_never_show(self, db, test_organization_id):
        page = "https://shop.example/pages/shipping"
        _faq(db, uuid4(), "Theirs", page)
        assert suggestions_for(db, test_organization_id, _agent([]), page)["items"] == []

    def test_at_most_three_and_no_repeats(self, db, test_organization_id):
        agent = _agent(["Track my order", "track my order", "A", "B", "C"])
        result = suggestions_for(db, test_organization_id, agent, "https://shop.example/")
        assert [i["label"] for i in result["items"]] == ["Track my order", "A", "B"]

    def test_no_quick_actions_and_nothing_for_the_page_shows_nothing(self, db, test_organization_id):
        assert suggestions_for(db, test_organization_id, _agent(None), "https://shop.example/x")["items"] == []

    def test_without_page_suggestions_only_every_page_rows_show(self, db, test_organization_id):
        page = "https://shop.example/products/tee"
        _faq(db, test_organization_id, "Is the tee organic?", page)
        agent = _agent([{"label": "Does it run small?", "match": "/products/*"}, "Track my order"])
        result = suggestions_for(db, test_organization_id, agent, page, "Tee", store=True, for_page=False)
        assert [i["label"] for i in result["items"]] == ["Track my order"]
        assert result["heading"] == "popular" and result["pill"] is None



@pytest.mark.parametrize("pattern,path,hit", [
    ("/products/*", "/products/tee", True),
    ("/products/*", "/fr/products/tee", True),
    ("/products/*", "/products/tee/reviews", False),
    ("/products/*", "/products", False),
    ("/blog*", "/blogger", True),
    ("/blog*", "/blog/post", False),
    ("/help/", "/help", True),
    ("/help/", "/help/returns/long", True),
    ("/Cart", "/cart", True),
    ("/pages/über", "/pages/%C3%BCber", True),
    ("/a[b]", "/a[b]", True),
    ("/a?", "/ab", False),
    ("cart", "/cart", True),
])
def test_path_patterns(pattern, path, hit):
    assert _matches(pattern, path) is hit


def test_visitor_payloads_carry_only_every_page_strings():
    assert every_page_labels(["Track my order", {"label": "Sizes?", "match": "/products/*"},
                              {"label": "Hours?", "match": None, "icon": "question"}, " ", 7, None]) == \
        ["Track my order", "Hours?"]
    assert every_page_labels(None) == []


def test_a_percent_or_backslash_in_the_page_url_is_literal(db, test_organization_id):
    _faq(db, test_organization_id, "Wildcard?", "https://shop.example/pages/x")
    assert suggestions_for(db, test_organization_id, _agent([]), "https://shop.example/%25")["items"] == []
    assert suggestions_for(db, test_organization_id, _agent([]), "https://shop.example/a%5C")["items"] == []



def test_the_visitor_schema_turns_stored_rules_into_every_page_labels():
    """Older widget bundles call .trim() on each quick action: they only ever get strings."""
    from app.models.schemas.widget import AgentCustomizationResponse
    response = AgentCustomizationResponse.model_validate(
        {"quick_actions": ["Track my order", {"label": "Sizes?", "match": "/products/*"}]})
    assert response.quick_actions == ["Track my order"]
    assert AgentCustomizationResponse.model_validate({"quick_actions": None}).quick_actions is None
