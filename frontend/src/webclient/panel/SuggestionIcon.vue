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
/** One of the fixed suggestion icons (stroke, currentColor), chosen by where a row came from. */
import type { SuggestionIcon } from '../quick-actions'

defineProps<{ icon: SuggestionIcon }>()
</script>

<template>
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <template v-if="icon === 'order'"><path d="M3 7.5L12 3l9 4.5v9L12 21l-9-4.5z"></path><path d="M3 7.5l9 4.5 9-4.5M12 12v9"></path></template>
        <template v-else-if="icon === 'shipping'"><path d="M3 6h11v10H3zM14 9h4l3 3v4h-7"></path><circle cx="7" cy="17.5" r="1.8"></circle><circle cx="17" cy="17.5" r="1.8"></circle></template>
        <template v-else-if="icon === 'returns'"><path d="M4 12a8 8 0 1 0 2.3-5.6"></path><path d="M4 4v4.5h4.5"></path></template>
        <template v-else-if="icon === 'product'"><path d="M3 12V4h8l10 10-8 8z"></path><circle cx="7.5" cy="8.5" r="1.3"></circle></template>
        <template v-else-if="icon === 'billing'"><rect x="3" y="6" width="18" height="12" rx="2"></rect><path d="M3 10h18M7 14.5h3"></path></template>
        <template v-else-if="icon === 'account'"><circle cx="12" cy="8.5" r="3.5"></circle><path d="M5 20a7 7 0 0 1 14 0"></path></template>
        <template v-else-if="icon === 'person'"><circle cx="10" cy="8.5" r="3.5"></circle><path d="M3.5 20a6.5 6.5 0 0 1 13 0M19 8v6M16 11h6"></path></template>
        <template v-else-if="icon === 'article'"><path d="M5 4h10l4 4v12H5z"></path><path d="M9 12h6M9 16h6"></path></template>
        <path v-else d="M21 12a8 8 0 01-11.6 7.1L4 20l1-4.6A8 8 0 1121 12z"></path>
    </svg>
</template>
