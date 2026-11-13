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
 * Above the message box on the store: what is in the visitor's cart, with View
 * cart and Checkout. Shown once the cart has something in it.
 */
import { computed, inject, watch } from 'vue'
import { WIDGET_CTX } from './controller'
import { cartOnPage, cartSummary, goToCheckout, requestCart, viewCart } from '../shopify-cart'
import { PANEL_COPY } from '../copy'

const ctrl = inject(WIDGET_CTX)!

const cart = computed(() => (cartSummary.value && cartSummary.value.item_count > 0 ? cartSummary.value : null))
const summary = computed(() => {
    const c = cart.value
    return c ? PANEL_COPY.cartSummary(c.item_count, ctrl.formatCurrency(c.total_price / 100, c.currency)) : ''
})
const thumbs = computed(() => (cart.value?.items ?? []).filter(item => item.image).slice(0, 3))

// Read the cart each time the panel opens on the store: the visitor may have
// changed it in the theme's own drawer meanwhile.
watch(() => cartOnPage.value && ctrl.hostVisible.value, (open) => { if (open) requestCart() }, { immediate: true })
</script>

<template>
    <div v-if="cart" class="cm-cart-bar cm-enter" role="region" :aria-label="PANEL_COPY.yourCart">
        <span class="cm-cart-bar__thumbs" aria-hidden="true">
            <img v-for="(item, i) in thumbs" :key="i" :src="item.image ?? ''" alt="">
        </span>
        <span class="cm-cart-bar__summary" aria-live="polite">{{ summary }}</span>
        <button type="button" class="cm-cart-bar__view cm-press" @click="viewCart">{{ PANEL_COPY.viewCart }}</button>
        <button type="button" class="cm-cart-bar__checkout cm-press" @click="goToCheckout">{{ PANEL_COPY.checkout }}</button>
    </div>
</template>

<style scoped>
.cm-cart-bar { display: flex; align-items: center; gap: 8px; margin: 0 12px 8px; padding: 8px 8px 8px 10px; }
.cm-cart-bar__thumbs { display: flex; }
.cm-cart-bar__thumbs img { width: 24px; height: 24px; object-fit: cover; margin-left: -6px; }
.cm-cart-bar__thumbs img:first-child { margin-left: 0; }
.cm-cart-bar__summary { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
</style>
