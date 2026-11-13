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
 * The one page an answer links to, when that page is a source with a title: its
 * title, domain and description from the stored source, never fetched live.
 */
import { computed } from 'vue'
import { PANEL_COPY } from '../../../copy'
import type { AnswerSource } from '../../../answer-links'

const props = defineProps<{ source: AnswerSource }>()

const domain = computed(() => {
    try {
        return new URL(props.source.url || '').hostname.replace(/^www\./, '')
    } catch {
        return ''
    }
})
</script>

<template>
    <a class="cm-link-card cm-press" :href="source.url" target="_blank" rel="noopener noreferrer">
        <span class="cm-link-card__tile" aria-hidden="true">{{ domain.charAt(0).toUpperCase() }}</span>
        <span class="cm-link-card__text">
            <span class="cm-link-card__title">{{ source.title }}</span>
            <span class="cm-link-card__domain">{{ domain }}</span>
            <span v-if="source.description" class="cm-link-card__description">{{ source.description }}</span>
        </span>
        <span class="cm-sr-only">{{ PANEL_COPY.opensInNewTab }}</span>
    </a>
</template>

<style scoped>
.cm-link-card { display: flex; gap: 12px; align-items: flex-start; text-decoration: none; }
.cm-link-card__tile { flex: none; display: grid; place-items: center; width: 32px; height: 32px; }
.cm-link-card__text { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.cm-link-card__title, .cm-link-card__domain { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cm-link-card__description {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
</style>
