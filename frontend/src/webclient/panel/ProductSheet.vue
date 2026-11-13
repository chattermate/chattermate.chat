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
 * The product sheet: slides up over the conversation to choose a product's options
 * (Size, Colour), read from the shop as it opens, and add the chosen variant. A
 * modal dialog inside the panel: focus moves in and stays, Escape closes the sheet
 * (and only the sheet) wherever focus is, and focus goes back to the card that
 * opened it. A product it can't offer whole goes to its own page instead.
 */
import { computed, inject, nextTick, onUnmounted, ref, watch } from 'vue'
import { WIDGET_CTX } from './controller'
import ProductCartButton from '../ProductCartButton.vue'
import { closeProductSheet, productSheet } from '../product-sheet'
import { everyOptionChosen, firstSelection, valueAvailable, variantFor, type Selection } from '../product-choice'
import { productUrl } from '../products'
import { PANEL_COPY } from '../copy'

const ctrl = inject(WIDGET_CTX)!

const dialog = ref<HTMLElement | null>(null)
const selection = ref<Selection>({})
let opener: HTMLElement | null = null

const product = computed(() => productSheet.value?.product ?? null)
const choices = computed(() => productSheet.value?.choices ?? null)
const loading = computed(() => !!product.value && choices.value === null)
const usable = computed(() => (choices.value?.complete ? choices.value : null))
const chosen = computed(() => (usable.value ? variantFor(usable.value, selection.value) : null))
const pageLink = computed(() => {
    if (!product.value) return ''
    const target = productUrl(product.value, productSheet.value?.shopDomain)
    return 'url' in target ? target.url : ''
})
const price = computed(() => {
    const p = product.value
    return p ? ctrl.formatCurrency(chosen.value?.price ?? p.price, p.currency) : ''
})
const note = computed(() => {
    if (!usable.value || (chosen.value && chosen.value.available)) return ''
    if (chosen.value) return PANEL_COPY.soldOut
    return everyOptionChosen(usable.value, selection.value) ? PANEL_COPY.combinationUnavailable : PANEL_COPY.pickEveryOption
})

const focusables = () =>
    Array.from(dialog.value?.querySelectorAll<HTMLElement>('button:not([disabled]), a[href]') ?? [])

// Keys go to the sheet wherever focus is: a button that swaps itself after an add
// (Add → View cart) drops focus to the page, and the next Escape must still close
// only the sheet, not the whole widget.
const onKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
        event.preventDefault()
        event.stopPropagation()
        closeProductSheet()
        return
    }
    if (event.key !== 'Tab') return
    const items = focusables()
    if (!items.length) return
    const first = items[0]
    const last = items[items.length - 1]
    const inside = dialog.value?.contains(document.activeElement) ?? false
    if (!inside) {
        event.preventDefault()
        first.focus()
    } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
    }
}

watch(product, (next, previous) => {
    if (next) {
        if (!previous) {
            opener = document.activeElement as HTMLElement | null
            document.addEventListener('keydown', onKeydown, true)
        }
        selection.value = {}
        ctrl.requestProductOptions(next.id)
        nextTick(() => focusables()[0]?.focus())
    } else {
        document.removeEventListener('keydown', onKeydown, true)
        opener?.focus?.()
        opener = null
    }
}, { immediate: true })

watch(usable, (ready) => { if (ready) selection.value = firstSelection(ready) })

// The sheet's state outlives the panel (it is module state): a new frame starts closed.
onUnmounted(() => {
    document.removeEventListener('keydown', onKeydown, true)
    closeProductSheet()
})

const pick = (option: string, value: string) => {
    selection.value = { ...selection.value, [option]: value }
}
</script>

<template>
    <Transition name="cm-sheet">
        <div v-if="product" class="cm-sheet-backdrop" @click="closeProductSheet">
            <div ref="dialog" class="cm-sheet" role="dialog" aria-modal="true" :aria-label="product.title" :aria-busy="loading" @click.stop>
                <div class="cm-sheet__head">
                    <span class="cm-sheet__image">
                        <img v-if="product.image?.src" :src="product.image.src" :alt="product.title">
                    </span>
                    <span class="cm-sheet__text">
                        <span class="cm-sheet__title">{{ product.title }}</span>
                        <span class="cm-sheet__price">{{ price }}</span>
                    </span>
                    <button type="button" class="cm-icon-button cm-sheet__close" :aria-label="PANEL_COPY.closeSheet" @click="closeProductSheet">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"></path></svg>
                    </button>
                </div>
                <p v-if="loading" class="cm-sheet__note" role="status">{{ PANEL_COPY.loadingOptions }}</p>
                <template v-else-if="usable">
                    <fieldset v-for="option in usable.options" :key="option.name" class="cm-sheet__option">
                        <legend class="cm-sheet__legend">{{ option.name }}</legend>
                        <div class="cm-sheet__values">
                            <button
                                v-for="value in option.values"
                                :key="value"
                                type="button"
                                class="cm-variant-chip cm-press"
                                :class="{ 'is-unavailable': !valueAvailable(usable, selection, option.name, value) }"
                                :aria-pressed="selection[option.name] === value"
                                :aria-label="valueAvailable(usable, selection, option.name, value) ? value : PANEL_COPY.unavailable(value)"
                                @click="pick(option.name, value)"
                            >{{ value }}</button>
                        </div>
                    </fieldset>
                    <div class="cm-sheet__add">
                        <ProductCartButton v-if="chosen && chosen.available" :key="chosen.id" :variant-id="chosen.id" />
                        <p v-else class="cm-sheet__note" role="status">{{ note }}</p>
                    </div>
                </template>
                <div v-else class="cm-sheet__add">
                    <p class="cm-sheet__note">{{ PANEL_COPY.chooseOnStore }}</p>
                    <a v-if="pageLink" class="cm-product__view" :href="pageLink" target="_blank" rel="noopener noreferrer">
                        {{ PANEL_COPY.viewProduct }}
                        <span class="cm-visually-hidden">{{ PANEL_COPY.opensInNewTab }}</span>
                    </a>
                </div>
            </div>
        </div>
    </Transition>
</template>

<style scoped>
.cm-sheet-backdrop { position: absolute; inset: 0; z-index: 15; display: flex; align-items: flex-end; }
.cm-sheet { width: 100%; max-height: 85%; overflow-y: auto; display: flex; flex-direction: column; gap: 14px; padding: 16px 16px 18px; }
.cm-sheet__head { display: flex; align-items: center; gap: 12px; }
.cm-sheet__image { flex: none; width: 56px; height: 56px; overflow: hidden; }
.cm-sheet__image img { width: 100%; height: 100%; object-fit: cover; display: block; }
.cm-sheet__text { display: flex; flex-direction: column; gap: 2px; min-width: 0; flex: 1; }
.cm-sheet__option { border: 0; margin: 0; padding: 0; min-width: 0; }
.cm-sheet__legend { padding: 0; margin: 0 0 8px; }
.cm-sheet__values { display: flex; flex-wrap: wrap; gap: 6px; }
.cm-sheet__note { margin: 0; }
</style>
