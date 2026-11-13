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
 * A reply's products as a carousel: cards snap into place with the next one
 * peeking, and Previous / Next buttons when they don't all fit.
 */
import { onMounted, onUnmounted, ref } from 'vue'
import ProductCard from './ProductCard.vue'
import { PANEL_COPY } from '../../../copy'
import type { WidgetProduct } from '../../../../types/widget'

defineProps<{ products: WidgetProduct[]; shopDomain?: string | null }>()

const track = ref<HTMLElement | null>(null)
const atStart = ref(true)
const atEnd = ref(true)

const measure = () => {
    const el = track.value
    if (!el) return
    atStart.value = el.scrollLeft <= 1
    atEnd.value = el.scrollLeft + el.clientWidth >= el.scrollWidth - 1
}
const step = (direction: 1 | -1) => {
    const el = track.value
    if (!el) return
    const card = el.querySelector<HTMLElement>('.cm-product')
    el.scrollBy({ left: direction * ((card?.offsetWidth ?? 160) + 10), behavior: 'smooth' })
}

let resize: ResizeObserver | null = null
onMounted(() => {
    measure()
    if (typeof ResizeObserver !== 'undefined' && track.value) {
        resize = new ResizeObserver(measure)
        resize.observe(track.value)
    }
})
onUnmounted(() => resize?.disconnect())
</script>

<template>
    <div class="cm-carousel" aria-roledescription="carousel" :aria-label="PANEL_COPY.products">
        <div ref="track" class="cm-carousel__track" @scroll.passive="measure">
            <ProductCard v-for="product in products" :key="product.id" :product="product" :shop-domain="shopDomain" />
        </div>
        <div v-if="!(atStart && atEnd)" class="cm-carousel__nav">
            <button type="button" class="cm-icon-button cm-carousel__btn" :aria-label="PANEL_COPY.previousProducts" :disabled="atStart" @click="step(-1)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6"></path></svg>
            </button>
            <button type="button" class="cm-icon-button cm-carousel__btn" :aria-label="PANEL_COPY.nextProducts" :disabled="atEnd" @click="step(1)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"></path></svg>
            </button>
        </div>
    </div>
</template>

<style scoped>
.cm-carousel { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.cm-carousel__track {
    margin: 0;
    padding: 2px 30px 6px 2px;
    display: flex;
    gap: 10px;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    overscroll-behavior-x: contain;
    scrollbar-width: none;
}
.cm-carousel__track::-webkit-scrollbar { display: none; }
.cm-carousel__nav { display: flex; justify-content: flex-end; gap: 6px; }
</style>
