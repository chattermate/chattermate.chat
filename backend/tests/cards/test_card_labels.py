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


Status cards in the visitor's language: the tables, picking one from the
browser's languages, and the cards built with them.
"""

import json
import string
from datetime import datetime

import pytest

from app.cards import labels as card_labels
from app.cards.labels import CardLabels, labels_for, pick_language, supported
from app.cards.order_card import order_card, recent_orders_card
from app.cards.ticket_card import ticket_card
from app.cards.turn_cards import TurnCards


def _table(code):
    return json.loads((card_labels.LOCALES_DIR / f'{code}.json').read_text(encoding='utf-8'))


def _placeholders(text):
    return {name for _, name, _, _ in string.Formatter().parse(str(text)) if name}


ENGLISH = _table('en')
OTHERS = sorted(supported() - {'en'})


def test_the_tables_cover_the_languages_we_offer():
    assert {'en', 'es', 'fr', 'de', 'it', 'pt', 'nl', 'ja', 'zh', 'zh-Hant', 'ar', 'hi'} <= supported()


@pytest.mark.parametrize('code', OTHERS)
def test_every_table_has_every_word(code):
    table = _table(code)
    numeric_date = '{month_number}' in table['date']
    expected = set(ENGLISH) - ({'months'} if numeric_date else set())
    assert set(table) == expected
    if not numeric_date:
        assert len(table['months']) == 12 and all(table['months'])


@pytest.mark.parametrize('code', OTHERS)
def test_every_translation_fills_the_same_blanks(code):
    table = _table(code)
    for key, english in ENGLISH.items():
        if key in ('months', 'date'):
            continue
        assert _placeholders(table[key]) == _placeholders(english), key
        assert table[key].strip(), key
    assert _placeholders(table['date']) <= {'day', 'month', 'month_number'}


@pytest.mark.parametrize('preferences,expected', [
    (['de-DE', 'en-US'], 'de'),
    (['en-GB', 'de'], 'en'),
    (['xx-YY', 'fr-CA'], 'fr'),
    (['pt-BR'], 'pt'),
    (['zh-CN'], 'zh'),
    (['zh-TW'], 'zh-Hant'),
    (['zh-Hant-HK'], 'zh-Hant'),
    (['zh_HK'], 'zh-Hant'),
    (['no'], 'nb'),
    (['nn-NO'], 'nb'),
    ('es', 'es'),
    ([], 'en'),
    (None, 'en'),
    ({'lang': 'de'}, 'en'),
    ([42, None, 'it'], 'it'),
    (['x' * 40, 'ja'], 'ja'),
    # Only the first five are read
    (['xx', 'xx', 'xx', 'xx', 'xx', 'de'], 'en'),
    (['../en'], 'en'),
])
def test_the_first_language_with_a_table_wins(preferences, expected):
    assert pick_language(preferences) == expected


def test_an_unknown_language_reads_as_english():
    assert labels_for('xx').language == 'en'
    assert labels_for(None).language == 'en'


def test_a_word_a_table_lacks_falls_back_to_english(monkeypatch):
    labels = CardLabels('de')
    monkeypatch.setattr(labels, '_own', {k: v for k, v in labels._own.items() if k != 'total'})
    assert labels.text('total') == 'Total'
    assert labels.text('refunded') == 'Erstattet'


@pytest.mark.parametrize('code,expected', [
    ('en', '3 Nov'), ('de', '3. Nov.'), ('fr', '3 nov.'), ('ja', '11月3日'), ('fi', '3.11.'), ('ko', '11월 3일'),
])
def test_dates_read_the_local_way(code, expected):
    assert labels_for(code).date(datetime(2026, 11, 3)) == expected


def _order(**fields):
    base = {
        "id": "55", "name": "#1042", "created_at": "2026-11-03T10:00:00Z",
        "financial_status": "PAID", "fulfillment_status": "FULFILLED", "cancelled_at": None,
        "total_price": "45.00", "currency": "EUR",
        "shipping_address": {"city": "Berlin", "zip": "10115"},
        "line_items": [{"name": "Becher", "quantity": 2, "price": "20.00", "currency": "EUR"}],
        "fulfillments": [{"status": "SUCCESS", "display_status": "IN_TRANSIT", "shipped_quantity": 2,
                          "estimated_delivery_at": "2026-11-12T00:00:00Z",
                          "tracking_info": [{"company": "DHL", "number": "00340434161234",
                                             "url": "https://dhl.example/t"}]}],
    }
    return {**base, **fields}


def test_an_order_card_in_german():
    card = order_card(_order(), labels_for('de'))
    assert card.lang == 'de'
    assert card.title == 'Bestellung #1042'
    assert card.subtitle == 'Bestellt am 3. Nov. · 2 Artikel'
    assert card.status.label == 'Unterwegs' and card.status.key == 'in_transit'
    assert [s.label for s in card.steps] == ['Bestellt', 'In Bearbeitung', 'Versandt', 'Zugestellt']
    assert [r.label for r in card.rows] == ['Voraussichtliche Lieferung', 'Lieferung an', 'Sendungsverfolgung']
    assert card.rows[0].value == '12. Nov.'
    assert card.total.label == 'Gesamt'
    track, get_help = card.actions
    assert track.label == 'Beim Versanddienst verfolgen'
    # Sent as the visitor's own message, so in their language too
    assert get_help.value == 'Ich brauche Hilfe mit Bestellung #1042'
    assert card.fallback_text == 'Bestellung #1042: Unterwegs'


def test_a_partly_shipped_order_counts_in_the_visitors_language():
    order = _order(fulfillment_status='PARTIALLY_FULFILLED',
                   fulfillments=[{"status": "SUCCESS", "shipped_quantity": 1}])
    assert order_card(order, labels_for('fr')).status.label == '1 sur 2 expédiés'
    assert order_card(order, labels_for('ja')).status.label == '2点中1点発送済み'


def test_one_item_is_singular():
    order = _order(line_items=[{"name": "Mug", "quantity": 1, "price": "5.00"}])
    assert order_card(order, labels_for('es')).subtitle == 'Realizado el 3 nov · 1 artículo'


def test_the_status_keys_stay_english_whatever_the_language():
    """The widget picks colours and icons by key; only the words change."""
    for code in OTHERS:
        assert order_card(_order(), labels_for(code)).status.key == 'in_transit'


def test_an_order_with_no_number_is_your_order():
    card = order_card(_order(name=None), labels_for('it'))
    assert card.title == 'Il tuo ordine'


def test_recent_orders_in_spanish():
    card = recent_orders_card([{"order_number": "#1001", "created_at": "2026-11-03T00:00:00Z",
                                "financial_status": "PAID", "fulfillment_status": "UNFULFILLED"}], labels_for('es'))
    assert card.title == 'Tus pedidos recientes'
    assert card.rows[0].label == '#1001 · 3 nov' and card.rows[0].value == 'En preparación'
    assert card.actions[0].label == 'Pedido #1001'
    assert card.actions[0].value == '¿Dónde está mi pedido #1001?'


def test_a_ticket_card_in_french():
    card = ticket_card('TKT-7', 'investigating', labels_for('fr'))
    assert card.lang == 'fr'
    assert card.title == 'Ticket d’assistance'
    assert card.status.label == 'En cours d’examen' and card.status.key == 'investigating'
    assert [s.label for s in card.steps] == ['Reçu', 'En cours', 'Résolu']
    assert card.fallback_text == 'Ticket TKT-7: En cours d’examen'


def test_cards_default_to_english():
    assert order_card(_order()).title == 'Order #1042'
    assert ticket_card('TKT-7', 'open').status.label == 'Received'
    assert TurnCards().labels.language == 'en'


def test_every_language_builds_every_card():
    for code in sorted(supported()):
        labels = labels_for(code)
        for status in ('REFUNDED', 'ON_HOLD', 'UNFULFILLED', 'FULFILLED', 'DELIVERED', 'SOMETHING_NEW'):
            order_card(_order(fulfillment_status=status, financial_status='PAID'), labels).model_dump()
        for status in ('open', 'triaging', 'resolved_pending_confirmation', 'closed', 'reopened', 'odd'):
            ticket_card('TKT-1', status, labels).model_dump()
