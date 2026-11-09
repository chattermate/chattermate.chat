<script setup lang="ts">
/*
 * The ChatterMate mark: an ink rounded square holding a lime dot (the AI) and a
 * coral dot (the human). Colours come from the --logo-* design tokens; the
 * fallbacks keep it right where the dashboard tokens aren't loaded (the widget
 * iframe). The hairline ring keeps the ink tile's edge visible on dark surfaces.
 */
import { computed } from 'vue'

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
        <rect class="brand-mark__tile" x="0.75" y="0.75" width="62.5" height="62.5" rx="15.25" />
        <circle class="brand-mark__ai" :cx="dots.left" cy="32" :r="dots.r" />
        <circle class="brand-mark__human" :cx="dots.right" cy="32" :r="dots.r" />
    </svg>
</template>

<style scoped>
.brand-mark {
    display: block;
    flex-shrink: 0;
}
.brand-mark__tile {
    fill: var(--logo-ink, #12150E);
    stroke: var(--logo-ring, color-mix(in srgb, currentColor 18%, transparent));
    stroke-width: 1.5;
}
.brand-mark__ai { fill: var(--logo-lime, #C9F24E); }
.brand-mark__human { fill: var(--logo-coral, #FF9D87); }
</style>
