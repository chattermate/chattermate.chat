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


The reply seam: turn events, the installed chat UI layer, the email proof it
provides, and the visitor's languages.
"""

import sys
import types
from types import SimpleNamespace
from unittest.mock import MagicMock

import pytest

from app.cards.builtin_layer import BUILTIN_EMAIL_PROOF, BUILTIN_LAYER
from app.services import email_proof, reply_ui
from app.services.reply_ui import (
    EMAIL_CHECK_EVENT, ORDER_EVENT, RECENT_ORDERS_EVENT, TICKET_EVENT, TurnEvents,
)
from app.services.visitor_language import MAX_PREFERENCES, preferred_languages
from app.services.widget_reply import reply_payload


@pytest.fixture(autouse=True)
def no_installed_layer():
    reply_ui.install(None)
    email_proof.install(None)
    yield
    reply_ui.install(None)
    email_proof.install(None)


def _order():
    return {
        "id": "55", "name": "#1042", "created_at": "2026-11-03T10:00:00Z",
        "financial_status": "PAID", "fulfillment_status": "UNFULFILLED", "cancelled_at": None,
        "total_price": "45.00", "currency": "GBP", "shipping_address": None,
        "line_items": [{"name": "Mug", "quantity": 2, "price": "20.00", "currency": "GBP"}],
        "fulfillments": [],
    }


class TestTurnEvents:
    def test_keeps_events_in_order_and_resets(self):
        events = TurnEvents(["de"])
        events.add(TICKET_EVENT, {"number": "TKT-1", "status": "open"})
        events.add(EMAIL_CHECK_EVENT)
        assert [kind for kind, _ in events.all()] == [TICKET_EVENT, EMAIL_CHECK_EVENT]
        assert events.of(EMAIL_CHECK_EVENT) == [{}]
        events.reset()
        assert events.all() == [] and events.languages == ["de"]

    def test_an_events_data_is_its_own_copy(self):
        data = {"number": "TKT-1", "status": "open"}
        events = TurnEvents()
        events.add(TICKET_EVENT, data)
        data["status"] = "closed"
        assert events.of(TICKET_EVENT) == [{"number": "TKT-1", "status": "open"}]


class TestInstalledLayer:
    def test_an_installed_layer_draws_the_reply(self):
        layer = MagicMock()
        layer.reply_extras.return_value = {"blocks": [{"type": "x"}]}
        reply_ui.install(layer)
        events = TurnEvents()
        assert reply_ui.reply_extras(events) == {"blocks": [{"type": "x"}]}
        layer.reply_extras.assert_called_once_with(events)

    def test_a_failing_layer_leaves_the_reply_as_text(self):
        layer = MagicMock()
        layer.reply_extras.side_effect = RuntimeError("boom")
        layer.add_shopify_tools.side_effect = RuntimeError("boom")
        reply_ui.install(layer)
        assert reply_ui.reply_extras(TurnEvents()) == {}
        reply_ui.add_shopify_tools(MagicMock())  # does not raise

    def test_no_events_means_nothing_to_draw(self):
        assert reply_ui.reply_extras(None) == {}

    def test_load_without_a_layer_module_is_quiet(self, monkeypatch):
        monkeypatch.setattr(reply_ui, "LAYER_MODULE", "app.no_such_package.chat_ui")
        assert reply_ui.load() is False

    def test_load_installs_the_layer_a_module_registers(self, monkeypatch):
        layer = MagicMock()
        module = types.ModuleType("cm_test_chat_ui")
        module.register = lambda: reply_ui.install(layer)
        monkeypatch.setitem(sys.modules, "cm_test_chat_ui", module)
        monkeypatch.setattr(reply_ui, "LAYER_MODULE", "cm_test_chat_ui")
        assert reply_ui.load() is True
        assert reply_ui._active() is layer

    def test_a_layer_that_fails_to_register_is_not_installed(self, monkeypatch):
        module = types.ModuleType("cm_test_broken_ui")
        module.register = MagicMock(side_effect=RuntimeError("boom"))
        monkeypatch.setitem(sys.modules, "cm_test_broken_ui", module)
        monkeypatch.setattr(reply_ui, "LAYER_MODULE", "cm_test_broken_ui")
        assert reply_ui.load() is False

    def test_a_broken_import_inside_the_layer_is_not_mistaken_for_its_absence(self, monkeypatch):
        def broken(name, *args, **kwargs):
            raise ModuleNotFoundError("No module named 'missing_dependency'", name="missing_dependency")
        monkeypatch.setattr(reply_ui.importlib, "import_module", broken)
        error = MagicMock()
        monkeypatch.setattr(reply_ui.logger, "error", error)
        assert reply_ui.load() is False
        error.assert_called_once()


class TestBuiltinLayer:
    def test_draws_status_cards_in_the_visitors_language(self):
        events = TurnEvents(["xx-YY", "de-AT"])
        events.add(ORDER_EVENT, {"order": _order()})
        events.add(TICKET_EVENT, {"number": "TKT-7", "status": "open"})
        extras = reply_ui.reply_extras(events)
        assert [card["kind"] for card in extras["cards"]] == ["order", "ticket"]
        assert {card["lang"] for card in extras["cards"]} == {"de"}
        assert "email_check" not in extras

    def test_the_same_order_twice_is_one_card(self):
        events = TurnEvents()
        events.add(ORDER_EVENT, {"order": _order()})
        events.add(ORDER_EVENT, {"order": _order()})
        assert len(BUILTIN_LAYER.reply_extras(events)["cards"]) == 1

    def test_recent_orders_become_one_card_with_a_question_per_order(self):
        events = TurnEvents()
        events.add(RECENT_ORDERS_EVENT, {"orders": [
            {"order_number": "#1001", "created_at": "2026-11-03T10:00:00Z",
             "financial_status": "PAID", "fulfillment_status": "FULFILLED"}]})
        [card] = BUILTIN_LAYER.reply_extras(events)["cards"]
        assert card["title"] == "Your recent orders"
        assert card["actions"][0]["value"] == "Where is my order #1001?"

    def test_an_event_that_cannot_be_drawn_loses_only_itself(self):
        events = TurnEvents()
        events.add(ORDER_EVENT, {"order": None})
        events.add(TICKET_EVENT, {"number": "TKT-7", "status": "open"})
        assert [card["kind"] for card in BUILTIN_LAYER.reply_extras(events)["cards"]] == ["ticket"]

    def test_the_email_check_is_asked_for(self):
        events = TurnEvents()
        events.add(EMAIL_CHECK_EVENT)
        assert BUILTIN_LAYER.reply_extras(events) == {"email_check": True}

    def test_a_turn_with_nothing_to_draw(self):
        assert BUILTIN_LAYER.reply_extras(TurnEvents()) == {}

    def test_it_offers_the_own_orders_tools(self):
        toolkit = MagicMock()
        reply_ui.add_shopify_tools(toolkit)
        toolkit.offer_email_check.assert_called_once_with()


class TestEmailProof:
    def test_an_installed_provider_answers(self):
        provider = MagicMock()
        provider.verified_email.return_value = "jane@acme.com"
        provider.available.return_value = True
        email_proof.install(provider)
        assert email_proof.verified_email("s1", "c1") == "jane@acme.com"
        provider.verified_email.assert_called_once_with("s1", "c1")
        assert email_proof.available() is True

    def test_the_builtin_check_stands_in_until_one_is_installed(self, monkeypatch):
        monkeypatch.setattr("app.services.email_check.verified_email", lambda s, c=None: "j@acme.com")
        assert email_proof._active() is BUILTIN_EMAIL_PROOF
        assert email_proof.verified_email("s1") == "j@acme.com"
        assert email_proof.mask("jane@acme.com") == "j•••@acme.com"

    def test_without_any_provider_nothing_is_proven(self, monkeypatch):
        monkeypatch.setattr(email_proof, "_fallback_provider", lambda: None)
        assert email_proof.verified_email("s1") is None
        assert email_proof.available() is False
        assert email_proof.offer("s1") is False
        assert email_proof.email_key("jane@acme.com", "org") is None
        assert email_proof.accept_store_sign_in({}, {}) is False
        email_proof.forget("s1")  # does nothing, does not raise


class TestReplyPayload:
    def _response(self):
        return SimpleNamespace(message="Hi", transfer_to_human=False, end_chat=False, end_chat_reason=None,
                               end_chat_description=None, request_rating=False, sources=None,
                               shopify_output=None, quick_replies=None)

    def test_carries_what_the_layer_drew(self):
        agent = SimpleNamespace(last_bot_message_id="m1", last_handover=None,
                                last_ui_extras={"cards": [{"id": "c"}], "email_check": True})
        payload = reply_payload(self._response(), "s1", agent)
        assert payload["cards"] == [{"id": "c"}] and payload["email_check"] is True

    def test_a_layer_never_overwrites_the_reply(self):
        agent = SimpleNamespace(last_bot_message_id="m1", last_handover=None,
                                last_ui_extras={"message": "hijacked", "session_id": "other"})
        payload = reply_payload(self._response(), "s1", agent)
        assert payload["message"] == "Hi" and payload["session_id"] == "s1"


class TestVisitorLanguage:
    def test_keeps_the_browsers_order(self):
        assert preferred_languages(["fr-CA", " en "]) == ["fr-CA", "en"]

    def test_one_tag_alone(self):
        assert preferred_languages("de") == ["de"]

    @pytest.mark.parametrize("raw", [None, 42, {"a": 1}, [None, 3, "", "   "]])
    def test_anything_else_is_nothing(self, raw):
        assert preferred_languages(raw) == []

    def test_caps_how_many_and_how_long(self):
        assert len(preferred_languages(["en"] * 20)) == MAX_PREFERENCES
        assert preferred_languages(["x" * 200, "it"]) == ["it"]
