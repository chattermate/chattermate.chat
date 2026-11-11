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
 * The agent's mark: two dots on the accent, the left one for the AI and the right
 * one for a person. The AI dot pulses while a reply is being worked on; the person's
 * dot stays faint until someone has joined. The agent's photo or the orb (see
 * agent-face.ts) replace the dots. Decorative: the name beside it says who it is.
 */
import type { AgentFace } from './agent-face'

withDefaults(defineProps<{
    face?: AgentFace
    /** 'md' in the header (34px), 'sm' on an answer's label row (20px). */
    size?: 'md' | 'sm'
    photoUrl?: string
    orbStyle?: Record<string, string>
    /** A reply is being worked on. */
    working?: boolean
    /** A person has joined the conversation. */
    humanJoined?: boolean
}>(), { face: 'mark', size: 'md', photoUrl: '', orbStyle: () => ({}), working: false, humanJoined: false })
</script>

<template>
    <span class="cm-mark" :class="[`cm-mark--${size}`, { 'cm-mark--plain': face !== 'mark' }]" aria-hidden="true">
        <img v-if="face === 'photo' && photoUrl" :src="photoUrl" alt="" class="cm-mark__photo">
        <span v-else-if="face === 'orb'" class="cm-mark__orb" :style="orbStyle"></span>
        <template v-else>
            <span class="cm-mark__dot" :class="{ 'cm-pulse': working }" data-dot="ai"></span>
            <span class="cm-mark__dot cm-mark__dot--human" :class="{ 'is-joined': humanJoined }" data-dot="human"></span>
        </template>
    </span>
</template>

<style scoped>
.cm-mark {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    overflow: hidden;
}
.cm-mark--md { width: 34px; height: 34px; gap: 4px; }
.cm-mark--sm { width: 20px; height: 20px; gap: 2.5px; }
.cm-mark__dot { display: block; }
.cm-mark--md .cm-mark__dot { width: 8px; height: 8px; }
.cm-mark--sm .cm-mark__dot { width: 5px; height: 5px; }
.cm-mark__photo,
.cm-mark__orb {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
}
</style>
