<!--
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
-->

<script setup lang="ts">
/**
 * One product in a reply's carousel: a group named by its title, with its image,
 * price ("From" for a range), low stock, and what the visitor can do: Add (one tap,
 * a single variant on sale), Choose options (the product sheet), and View on store.
 */
import { computed, inject } from 'vue'
import { WIDGET_CTX } from '../../controller'
import ProductCartButton from '../../../ProductCartButton.vue'
import { canAddToCart, cartAvailableFor } from '../../../shopify-cart'
import { productUrl } from '../../../products'
import { hasPriceRange, lowStock, needsChoice } from '../../../product-choice'
import { openProductSheet } from '../../../product-sheet'
import { PANEL_COPY } from '../../../copy'
import type { WidgetProduct } from '../../../../types/widget'

const props = defineProps<{ product: WidgetProduct; shopDomain?: string | null }>()
const ctrl = inject(WIDGET_CTX)!

const price = computed(() => {
    const shown = props.product.price_formatted || ctrl.formatCurrency(props.product.price, props.product.currency)
    return hasPriceRange(props.product) ? PANEL_COPY.priceFrom(shown) : shown
})
const left = computed(() => lowStock(props.product))
const link = computed(() => {
    const target = productUrl(props.product, props.shopDomain)
    return 'url' in target ? target.url : ''
})
const variant = computed(() =>
    props.product.variant_title && props.product.variant_title !== 'Default Title' ? props.product.variant_title : '')
const oneTap = computed(() => canAddToCart(props.product, props.shopDomain))
const choose = computed(() => !oneTap.value && needsChoice(props.product) && cartAvailableFor(props.shopDomain))
</script>

<template>
    <div class="cm-product" role="group" :aria-label="product.title">
        <span class="cm-product__image">
            <img v-if="product.image?.src" :src="product.image.src" :alt="product.title" loading="lazy">
        </span>
        <span class="cm-product__title">{{ product.title }}</span>
        <span v-if="variant" class="cm-product__variant">{{ variant }}</span>
        <span class="cm-product__price">{{ price }}</span>
        <span v-if="left" class="cm-product__stock">{{ PANEL_COPY.onlyLeft(left) }}</span>
        <div class="cm-product__actions">
            <ProductCartButton v-if="oneTap" :variant-id="product.cart_variant_id ?? ''" />
            <button v-else-if="choose" type="button" class="cm-cart-button cm-product__choose cm-press" @click="openProductSheet(product, shopDomain)">
                {{ PANEL_COPY.chooseOptions }}
            </button>
            <a v-if="link" class="cm-product__view" :href="link" target="_blank" rel="noopener noreferrer">
                {{ PANEL_COPY.viewProduct }}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 4h6v6M20 4l-9 9"></path></svg>
                <span class="cm-visually-hidden">{{ PANEL_COPY.opensInNewTab }}</span>
            </a>
        </div>
    </div>
</template>

<style scoped>
.cm-product {
    flex: 0 0 160px;
    scroll-snap-align: start;
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding-bottom: 10px;
    overflow: hidden;
}
.cm-product__image { display: block; aspect-ratio: 1 / 1; }
.cm-product__image img { display: block; width: 100%; height: 100%; object-fit: cover; }
.cm-product__title, .cm-product__variant, .cm-product__price, .cm-product__stock { padding: 0 10px; overflow-wrap: anywhere; }
.cm-product__actions { margin-top: auto; padding: 6px 10px 0; display: flex; flex-direction: column; gap: 6px; }
.cm-product__view { min-height: 32px; display: inline-flex; align-items: center; justify-content: center; gap: 4px; text-decoration: none; }
</style>
