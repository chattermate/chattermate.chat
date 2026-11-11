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
 * The sources an answer drew on, numbered as the links in its text are. A source
 * with a web page is a link to it (new tab); any other is a label.
 */
import { citationLabel, citationTooltip } from '../../../citations'
import { PANEL_COPY } from '../../../copy'
import type { AnswerSource } from '../../../answer-links'

defineProps<{ sources: AnswerSource[] }>()

const isWebPage = (source: AnswerSource) => /^https?:\/\//i.test(source.url || '')
const label = (source: AnswerSource) => source.title || citationLabel(source)
</script>

<template>
    <ul class="cm-sources" :aria-label="PANEL_COPY.sources">
        <li v-for="(source, i) in sources" :key="i">
            <a
                v-if="isWebPage(source)"
                class="cm-sources__chip cm-press"
                :href="source.url"
                target="_blank"
                rel="noopener noreferrer"
                :title="citationTooltip(source)"
                :aria-label="`${PANEL_COPY.sourceChip(i + 1, label(source))} ${PANEL_COPY.opensInNewTab}`"
            >
                <span class="cm-sources__n" aria-hidden="true">{{ i + 1 }}</span>
                <span class="cm-sources__label">{{ label(source) }}</span>
            </a>
            <span v-else class="cm-sources__chip" :title="citationTooltip(source)" :aria-label="PANEL_COPY.sourceChip(i + 1, label(source))">
                <span class="cm-sources__n" aria-hidden="true">{{ i + 1 }}</span>
                <span class="cm-sources__label">{{ label(source) }}</span>
            </span>
        </li>
    </ul>
</template>

<style scoped>
.cm-sources { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: 6px; }
.cm-sources__chip { display: inline-flex; align-items: center; gap: 6px; max-width: 220px; }
.cm-sources__label { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
</style>
