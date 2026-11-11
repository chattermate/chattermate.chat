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
 * A reply with products (Shopify): its text, then a row of product cards. Each
 * card is a group named by the product, with Add to cart (one-tap only when the
 * product has a single variant on sale: canAddToCart) and View product, a plain
 * link to the store page (productUrl), left out when there is none to link to:
 * never the classic widget's blocking alert(). Keeps the
 * classic hooks: `message agent-message product-message`. The carousel and the
 * product sheet come with plan 3.x.
 */
import { computed, inject } from 'vue'
import { WIDGET_CTX } from '../controller'
import ProductCartButton from '../../ProductCartButton.vue'
import { canAddToCart } from '../../shopify-cart'
import { productUrl, stripUrlsForProducts } from '../../products'
import { renderMarkdown } from '../../markdown'
import { PANEL_COPY } from '../../copy'
import type { WidgetMessage, WidgetProduct } from '../../../types/widget'

const props = defineProps<{ message: WidgetMessage; index: number }>()

const ctrl = inject(WIDGET_CTX)!

const output = computed(() => props.message.shopify_output)
const products = computed<WidgetProduct[]>(() => output.value?.products ?? [])
const shopDomain = computed(() => output.value?.shop_domain)

// With cards to show, links in the text are the cards' job.
const html = computed(() => {
    const text = props.message.message || ''
    return renderMarkdown(products.value.length ? stripUrlsForProducts(text) : text)
})

// Nothing found, said only when the reply has no words of its own (as classic).
const emptyNote = computed(() => {
    if (props.message.message || products.value.length) return ''
    return output.value?.products ? PANEL_COPY.noProducts : PANEL_COPY.noProductsToShow
})

const priceOf = (product: WidgetProduct) => product.price_formatted || ctrl.formatCurrency(product.price, product.currency)
/** The product's store page, or '' when the shop or the product is unknown. */
const linkOf = (product: WidgetProduct) => {
    const target = productUrl(product, shopDomain.value)
    return 'url' in target ? target.url : ''
}
const variantOf = (product: WidgetProduct) =>
    product.variant_title && product.variant_title !== 'Default Title' ? product.variant_title : ''
</script>

<template>
    <div class="message agent-message product-message cm-products">
        <div v-if="message.message" class="message-bubble cm-products__text" v-html="html"></div>
        <p v-if="emptyNote" class="cm-products__empty">{{ emptyNote }}</p>
        <div v-if="products.length" class="cm-products__row">
            <div v-for="product in products" :key="product.id" class="cm-product" role="group" :aria-label="product.title">
                <span class="cm-product__image">
                    <img v-if="product.image?.src" :src="product.image.src" :alt="product.title" loading="lazy">
                </span>
                <span class="cm-product__title">{{ product.title }}</span>
                <span v-if="variantOf(product)" class="cm-product__variant">{{ variantOf(product) }}</span>
                <span class="cm-product__price">{{ priceOf(product) }}</span>
                <div class="cm-product__actions">
                    <ProductCartButton
                        v-if="canAddToCart(product, shopDomain)"
                        :variant-id="product.cart_variant_id ?? ''"
                    />
                    <a
                        v-if="linkOf(product)"
                        class="cm-product__view"
                        :href="linkOf(product)"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {{ PANEL_COPY.viewProduct }}
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 4h6v6M20 4l-9 9"></path></svg>
                        <span class="cm-visually-hidden">{{ PANEL_COPY.opensInNewTab }}</span>
                    </a>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.cm-products__empty { margin: 0; }
.cm-products__row {
    margin: 0;
    padding: 2px 2px 6px;
    display: flex;
    gap: 10px;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    overscroll-behavior-x: contain;
}
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
.cm-product__title, .cm-product__variant, .cm-product__price { padding: 0 10px; overflow-wrap: anywhere; }
.cm-product__actions { margin-top: auto; padding: 6px 10px 0; display: flex; flex-direction: column; gap: 6px; }
.cm-product__view { min-height: 32px; display: inline-flex; align-items: center; justify-content: center; gap: 4px; text-decoration: none; }
</style>
