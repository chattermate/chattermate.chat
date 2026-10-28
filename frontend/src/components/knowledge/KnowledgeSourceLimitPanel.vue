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
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import type { ReplaceableSource } from '@/types/knowledge'

// Shown in the add-source dialog when the plan's source cap refused the add.
// Removing a source from an agent keeps it in the organization, where it still
// counts, so the way forward is to replace one (or upgrade), not to retry.
const props = defineProps<{
  message: string
  sources: ReplaceableSource[]
  busy: boolean
  canReplace: boolean
}>()

const emit = defineEmits<{
  (e: 'replace', replacedId: number): void
}>()

// It appears below the form, often past the bottom of a short screen, right
// after Add was clicked: bring it into view or the refusal goes unseen.
const root = ref<HTMLElement | null>(null)
onMounted(() => root.value?.scrollIntoView?.({ block: 'nearest', behavior: 'smooth' }))

// The plans page comes with the enterprise module; a link to a route the app
// doesn't have would throw while rendering.
const PLANS_ROUTE = 'subscription'
const hasPlansPage = useRouter()?.hasRoute(PLANS_ROUTE) ?? false

// "...knowledge sources (1) would be exceeded" -> 1
const limit = computed(() => Number(/\((\d+)\)/.exec(props.message)?.[1]) || null)

const headline = computed(() => {
  if (!limit.value) return 'Your plan’s knowledge sources are all in use.'
  return limit.value === 1
    ? 'Your plan includes 1 knowledge source, and it’s in use.'
    : `Your plan includes ${limit.value} knowledge sources, and they’re all in use.`
})
</script>

<template>
  <div ref="root" class="limit" role="alert">
    <p class="limit__title">{{ headline }}</p>
    <template v-if="sources.length">
      <p class="limit__sub">Replace one with this source. Its pages are deleted.</p>
      <ul class="limit__list">
        <li v-for="source in sources" :key="source.id" class="limit__row">
          <span class="limit__meta">
            <span class="limit__name" :title="source.name">{{ source.name }}</span>
            <span v-if="source.usedBy.length" class="limit__used">Used by {{ source.usedBy.join(', ') }}</span>
          </span>
          <button
            type="button"
            class="limit__replace"
            :disabled="busy || !canReplace"
            @click="emit('replace', source.id)"
          >
            Replace
          </button>
        </li>
      </ul>
    </template>
    <p v-else class="limit__sub">A crawl still in progress counts too. Wait for it to finish, or cancel it.</p>
    <router-link v-if="hasPlansPage" class="limit__plans" :to="{ name: PLANS_ROUTE }">See plans with more sources</router-link>
  </div>
</template>

<style scoped>
.limit {
  margin-top: 16px;
  padding: 14px;
  border-radius: 11px;
  background: var(--warning-bg);
  border: 1px solid var(--warning-border);
}

.limit__title {
  margin: 0;
  font-size: 13.5px;
  font-weight: 600;
  color: var(--text);
}

.limit__sub {
  margin: 4px 0 0;
  font-size: 12.5px;
  color: var(--text3);
}

.limit__list {
  list-style: none;
  margin: 10px 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.limit__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 9px;
  background: var(--surface);
  border: 1px solid var(--o08);
}

.limit__meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.limit__used {
  font-size: 11.5px;
  color: var(--muted);
}

.limit__name {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
  font-family: var(--font-mono);
  color: var(--text);
}

.limit__replace {
  flex-shrink: 0;
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid var(--coral-border);
  background: var(--coral-bg);
  color: var(--c-coral);
  font-size: 12.5px;
  font-weight: 600;
  font-family: var(--font-sans);
  cursor: pointer;
}

.limit__replace:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.limit__plans {
  display: inline-block;
  margin-top: 10px;
  font-size: 12.5px;
  font-weight: 600;
  color: var(--accent-ink);
}
</style>
