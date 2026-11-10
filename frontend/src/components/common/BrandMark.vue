<script setup lang="ts">
/*
 * The ChatterMate mark: an ink rounded square holding a lime dot (the AI) and a
 * coral dot (the human). Colours come from config/brand.ts, so the mark is the
 * same in the dashboard and in the widget iframe (which has no design tokens).
 * Only the hairline ring follows the theme: it keeps the ink tile's edge visible
 * on dark surfaces.
 */
import { computed } from 'vue'
import { BRAND_COLORS } from '../../config/brand' // relative: the widget build has no @ alias

const props = withDefaults(defineProps<{ size?: number }>(), { size: 32 })

// Small renders use the favicon geometry (bigger dots) so the mark stays legible.
const SMALL_MAX = 24
const dots = computed(() =>
    props.size <= SMALL_MAX
        ? { left: 22, right: 42, r: 10 }
        : { left: 23, right: 41, r: 8 },
)
</script>

<template>
    <svg
        class="brand-mark"
        :width="size"
        :height="size"
        viewBox="0 0 64 64"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        focusable="false"
    >
        <rect class="brand-mark__tile" x="0.75" y="0.75" width="62.5" height="62.5" rx="15.25" :fill="BRAND_COLORS.ink" />
        <circle :cx="dots.left" cy="32" :r="dots.r" :fill="BRAND_COLORS.lime" />
        <circle :cx="dots.right" cy="32" :r="dots.r" :fill="BRAND_COLORS.coral" />
    </svg>
</template>

<style scoped>
.brand-mark {
    display: block;
    flex-shrink: 0;
}
.brand-mark__tile {
    stroke: var(--logo-ring, color-mix(in srgb, currentColor 18%, transparent));
    stroke-width: 1.5;
}
</style>
