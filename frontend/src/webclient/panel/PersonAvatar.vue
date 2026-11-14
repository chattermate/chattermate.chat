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
// A person who joined the conversation: their photo, else (or when it won't load) their initials.
// Decorative: their name is always written next to it.
import { computed, ref } from 'vue'
import { initialsOf } from './agent-face'

const props = withDefaults(defineProps<{
    name: string
    photoUrl?: string
    /** 'md' in the header (34px), 'sm' beside a message (28px). */
    size?: 'md' | 'sm'
}>(), { photoUrl: '', size: 'md' })

const initials = computed(() => initialsOf(props.name))
const failedUrl = ref('')
const showPhoto = computed(() => !!props.photoUrl && failedUrl.value !== props.photoUrl)
</script>

<template>
    <span class="cm-person" :class="`cm-person--${size}`" aria-hidden="true">
        <img v-if="showPhoto" :src="photoUrl" alt="" class="cm-person__photo" @error="failedUrl = photoUrl">
        <template v-else>{{ initials }}</template>
    </span>
</template>

<style scoped>
.cm-person {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    overflow: hidden;
}
.cm-person--md { width: 34px; height: 34px; }
.cm-person--sm { width: 28px; height: 28px; }
.cm-person__photo { width: 100%; height: 100%; object-fit: cover; display: block; }
</style>
