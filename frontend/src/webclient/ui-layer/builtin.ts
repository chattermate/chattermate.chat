/*
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
*/

/**
 * The cards and commerce the panel has today, behind the layer seam (index.ts):
 * product replies, status cards and the email check under answers, the cart bar,
 * the product sheet, and the store's cart messages.
 */

import ProductMessage from '../panel/messages/ProductMessage.vue'
import AnswerCards from '../panel/messages/AnswerCards.vue'
import EmailCheckCard from '../panel/messages/EmailCheckCard.vue'
import CartBar from '../panel/CartBar.vue'
import ProductSheet from '../panel/ProductSheet.vue'
import { handleCartMessage } from '../shopify-cart'
import type { WidgetUiLayer } from './types'

const PRODUCT_KIND = 'product'

export const BUILTIN_LAYER: WidgetUiLayer = {
    messageKind: message => (message.shopify_output ? PRODUCT_KIND : undefined),
    messageComponents: { [PRODUCT_KIND]: ProductMessage },
    answerParts: [AnswerCards],
    composerTop: [CartBar],
    overlays: [ProductSheet],
    historyOthers: EmailCheckCard,
    hostMessage: handleCartMessage,
}
