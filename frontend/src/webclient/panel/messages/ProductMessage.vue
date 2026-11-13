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
 * A reply with products (Shopify): its text, then the products as a carousel
 * (ProductCarousel: Add, Choose options for the product sheet, View on store).
 * Keeps the classic hooks: `message agent-message product-message`.
 */
import { computed } from 'vue'
import ProductCarousel from './products/ProductCarousel.vue'
import { stripUrlsForProducts } from '../../products'
import { renderMarkdown } from '../../markdown'
import { PANEL_COPY } from '../../copy'
import type { WidgetMessage, WidgetProduct } from '../../../types/widget'

const props = defineProps<{ message: WidgetMessage; index: number }>()

const output = computed(() => props.message.shopify_output)
const products = computed<WidgetProduct[]>(() => output.value?.products ?? [])

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
</script>

<template>
    <div class="message agent-message product-message cm-products">
        <div v-if="message.message" class="message-bubble cm-products__text" v-html="html"></div>
        <p v-if="emptyNote" class="cm-products__empty">{{ emptyNote }}</p>
        <ProductCarousel v-if="products.length" :products="products" :shop-domain="output?.shop_domain" />
    </div>
</template>

<style scoped>
.cm-products__empty { margin: 0; }
</style>
