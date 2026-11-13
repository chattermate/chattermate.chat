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
// "<name> joined the conversation", centred between two hairlines that draw in.
// Other system notes ("Thank you for your feedback!") use it without the lines.
import { computed } from 'vue'
import { isJoinedNote } from '../message-kind'
import type { WidgetMessage } from '../../../types/widget'

const props = defineProps<{ message: WidgetMessage; index: number }>()

const joined = computed(() => isJoinedNote(props.message))
</script>

<template>
    <div class="message system-message cm-joined" :class="{ 'is-joined': joined }">
        <span v-if="joined" class="cm-joined__line cm-joined__line--start" aria-hidden="true"></span>
        <span class="cm-joined__text">{{ message.message }}</span>
        <span v-if="joined" class="cm-joined__line cm-joined__line--end" aria-hidden="true"></span>
    </div>
</template>

<style scoped>
.cm-joined__line { flex: 1; height: 1px; }
</style>
