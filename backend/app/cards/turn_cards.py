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

The status cards one turn's tools produced, in order. Given to the toolkits by
the chat agent (widget channels on the redesign only) and read once the reply
is ready, as ShopifyTools.has_cached_products is.
"""

from typing import List

from app.models.schemas.cards import StatusCard

# More cards than this in one reply are not shown.
MAX_CARDS = 4


class TurnCards:
    def __init__(self) -> None:
        self._cards: List[StatusCard] = []
        # The reply asks the visitor to prove their email (the email check card)
        self.email_check = False

    def add(self, card: StatusCard) -> None:
        """Keep a card; the same card again (an order looked up twice) replaces the first."""
        self._cards = [c for c in self._cards if c.id != card.id]
        if len(self._cards) < MAX_CARDS:
            self._cards.append(card)

    def reset(self) -> None:
        self._cards = []
        self.email_check = False

    def payload(self) -> List[dict]:
        return [card.model_dump(exclude_none=True) for card in self._cards]
