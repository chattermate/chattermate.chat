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
 * STOPGAP until plan 1.4 (message-kind parity): ratings, forms, product messages,
 * free-text questions and any unknown kind are drawn as plain text here, so nothing
 * the conversation holds is silently dropped. They are not interactive yet; the
 * classic class hooks (form-message, rating-message, product-message) are kept.
 */
import { computed, inject } from 'vue'
import { WIDGET_CTX } from '../controller'
import { fallbackClass } from '../message-kind'
import { renderMarkdown } from '../../markdown'
import { stripUrlsForProducts } from '../../products'
import { PANEL_COPY } from '../../copy'
import type { WidgetMessage } from '../../../types/widget'

const props = defineProps<{ message: WidgetMessage; index: number }>()

const ctrl = inject(WIDGET_CTX)!

const products = computed(() => props.message.shopify_output?.products ?? [])

/** Plain lines for the structured kinds (escaped by the template). */
const lines = computed<string[]>(() => {
    const { message } = props
    const attributes = message.attributes ?? {}
    if (message.message_type === 'rating') {
        const name = message.agent_name || ctrl.humanAgent.value.human_agent_name || ctrl.agentName.value
        return [PANEL_COPY.ratingPrompt(name)]
    }
    if (message.message_type === 'form') {
        const form = attributes.form_data ?? {}
        const formLines = [form.title, form.description].filter((line): line is string => !!line)
        return formLines.length ? formLines : [PANEL_COPY.formFallback]
    }
    if (message.message_type === 'user_input') {
        return [attributes.prompt_message, message.submittedValue].filter((line): line is string => !!line)
    }
    return []
})

/** Markdown body for product messages and unknown kinds (sanitised by renderMarkdown). */
const html = computed(() => {
    if (lines.value.length) return ''
    const text = props.message.message || ''
    return renderMarkdown(products.value.length ? stripUrlsForProducts(text) : text)
})

const priceOf = (product: (typeof products.value)[number]) =>
    product.price_formatted || ctrl.formatCurrency(product.price, product.currency)
</script>

<template>
    <div class="message cm-fallback" :class="fallbackClass(message)">
        <div class="message-bubble">
            <p v-for="(line, i) in lines" :key="i" class="cm-fallback__line">{{ line }}</p>
            <div v-if="html" v-html="html"></div>
            <ul v-if="products.length" class="cm-fallback__products" :aria-label="PANEL_COPY.productsFallback">
                <li v-for="product in products" :key="product.id">{{ product.title }} · {{ priceOf(product) }}</li>
            </ul>
        </div>
    </div>
</template>

<style scoped>
.cm-fallback__line { margin: 0; }
.cm-fallback__products { margin: 6px 0 0; padding-left: 18px; }
</style>
