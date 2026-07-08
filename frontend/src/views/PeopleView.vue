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
import { ref, onMounted, computed, watch } from 'vue'
import { toast } from 'vue-sonner'
import { peopleService } from '@/services/people'
import type { PersonListItem, PeopleStats } from '@/types/people'
import PersonDetailDrawer from '@/components/people/PersonDetailDrawer.vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'

const stats = ref<PeopleStats | null>(null)
const items = ref<PersonListItem[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = 20
const loading = ref(false)
const stage = ref<'all' | 'visitor' | 'lead' | 'customer'>('all')
const search = ref('')
const selectedId = ref<string | null>(null)

const STAGES = [
  { value: 'all', label: 'All' },
  { value: 'visitor', label: 'Visitors' },
  { value: 'lead', label: 'Leads' },
  { value: 'customer', label: 'Customers' },
] as const

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize)))

async function loadStats() {
  try { stats.value = await peopleService.getStats() } catch { /* non-blocking */ }
}

async function loadList() {
  loading.value = true
  try {
    const res = await peopleService.listPeople({
      stage: stage.value, search: search.value || undefined, page: page.value, page_size: pageSize,
    })
    items.value = res.items
    total.value = res.total
  } catch {
    toast.error('Failed to load people')
  } finally {
    loading.value = false
  }
}

function setStage(s: typeof stage.value) { stage.value = s; page.value = 1; loadList() }
function nextPage() { if (page.value < totalPages.value) { page.value++; loadList() } }
function prevPage() { if (page.value > 1) { page.value--; loadList() } }

let searchTimer: any = null
watch(search, () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => { page.value = 1; loadList() }, 350)
})

function initials(p: PersonListItem): string {
  if (p.is_anonymous || !p.name) return ''
  return p.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
}
function stageLabel(s: string) { return s.charAt(0).toUpperCase() + s.slice(1) }
function fmtDate(d?: string | null) {
  if (!d) return '—'
  try { return new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) } catch { return '—' }
}
function sourceLabel(p: PersonListItem) {
  const s = p.source || {}
  if (s.page_url) {
    // Show a compact host+path; the full URL is in the tooltip.
    try {
      const u = new URL(s.page_url)
      const path = u.pathname === '/' ? '' : u.pathname
      return `${u.host}${path}`
    } catch { return s.page_url }
  }
  return s.channel || '—'
}
function sourceTitle(p: PersonListItem): string {
  return p.source?.page_url || ''
}
// Short stable visitor id (first 8 chars of the customer UUID) — lets you match a
// person to widget sessions/devices even before they share an email.
function shortId(p: PersonListItem): string {
  return `#${String(p.id).slice(0, 8)}`
}

function onPersonUpdated(updatedStage?: string) {
  // A person changed (e.g. marked customer) — refresh list + stats.
  loadList(); loadStats()
}

onMounted(() => { loadStats(); loadList() })
</script>

<template>
  <DashboardLayout>
  <div class="people-view">
    <div class="pv-header">
      <div>
        <h1 class="pv-title">People</h1>
        <p class="pv-sub">Every lead your agents capture, deduplicated into one profile.</p>
      </div>
    </div>

    <!-- KPI strip -->
    <div class="pv-kpis" v-if="stats">
      <div class="pv-kpi"><div class="pv-kpi-label">TOTAL PEOPLE</div><div class="pv-kpi-value">{{ stats.total_people }}</div></div>
      <div class="pv-kpi"><div class="pv-kpi-label">NEW LEADS · 7D</div><div class="pv-kpi-value accent">{{ stats.new_leads_7d }}</div></div>
      <div class="pv-kpi"><div class="pv-kpi-label">CUSTOMERS</div><div class="pv-kpi-value">{{ stats.customers }}</div></div>
      <div class="pv-kpi"><div class="pv-kpi-label">SYNCED TO CRM</div><div class="pv-kpi-value muted">{{ stats.synced_to_crm }}</div></div>
    </div>

    <!-- toolbar -->
    <div class="pv-toolbar">
      <div class="pv-tabs">
        <button v-for="s in STAGES" :key="s.value" class="pv-tab" :class="{ on: stage === s.value }" @click="setStage(s.value)">{{ s.label }}</button>
      </div>
      <input class="pv-search" v-model="search" placeholder="Search name, email or company…" />
    </div>

    <!-- table -->
    <div class="pv-table">
      <div class="pv-thead">
        <span>Person</span><span>Stage</span><span>Source</span><span>Captured</span><span>Last activity</span><span>Sync</span>
      </div>
      <button v-for="p in items" :key="p.id" class="pv-row" @click="selectedId = p.id">
        <span class="pv-person">
          <span class="pv-avatar" :class="{ anon: p.is_anonymous }">{{ initials(p) }}</span>
          <span class="pv-person-text">
            <span class="pv-name">{{ p.name || (p.is_anonymous ? 'Anonymous visitor' : (p.email || '—')) }}</span>
            <span class="pv-email">
              {{ p.is_anonymous ? 'anonymous' : (p.email || '') }}
              <span class="pv-id" :title="String(p.id)">{{ shortId(p) }}</span>
            </span>
          </span>
        </span>
        <span class="pv-stage">
          <span class="pv-badge" :class="p.lead_stage">{{ stageLabel(p.lead_stage) }}</span>
          <span v-if="p.qualified" class="pv-star" title="Qualified">★</span>
        </span>
        <span class="pv-source" :title="sourceTitle(p)">{{ sourceLabel(p) }}</span>
        <span>{{ fmtDate(p.captured_at) }}</span>
        <span>{{ fmtDate(p.last_activity) }}</span>
        <span class="pv-sync">{{ p.synced ? 'Synced' : '—' }}</span>
      </button>
      <div v-if="!loading && items.length === 0" class="pv-empty">No people match this filter.</div>
      <div v-if="loading" class="pv-empty">Loading…</div>
      <div class="pv-foot">
        <span>{{ total }} people</span>
        <span class="pv-pager">
          <button :disabled="page <= 1" @click="prevPage">‹</button>
          <span>Page {{ page }} / {{ totalPages }}</span>
          <button :disabled="page >= totalPages" @click="nextPage">›</button>
        </span>
      </div>
    </div>

    <PersonDetailDrawer
      v-if="selectedId"
      :customer-id="selectedId"
      @close="selectedId = null"
      @updated="onPersonUpdated"
    />
  </div>
  </DashboardLayout>
</template>

<style scoped>
.people-view { padding: 28px 32px; max-width: 1200px; margin: 0 auto; }
.pv-header { margin-bottom: 22px; }
.pv-title { font-size: 28px; font-weight: 700; margin: 0 0 6px; }
.pv-sub { font-size: 15px; color: var(--muted); margin: 0; }
.pv-kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 22px; }
.pv-kpi { background: var(--surface); border: 1px solid var(--border-color); border-radius: 14px; padding: 16px 18px; }
.pv-kpi-label { font-size: 10.5px; letter-spacing: .08em; color: var(--muted); margin-bottom: 10px; }
.pv-kpi-value { font-size: 26px; font-weight: 700; }
.pv-kpi-value.accent { color: var(--primary-color); }
.pv-kpi-value.muted { color: var(--muted); }
.pv-toolbar { display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; margin-bottom: 14px; }
.pv-tabs { display: flex; gap: 4px; padding: 4px; background: var(--o05); border-radius: 11px; }
.pv-tab { padding: 8px 14px; border: none; background: transparent; border-radius: 8px; font-size: 13.5px; cursor: pointer; color: var(--muted); }
.pv-tab.on { background: var(--surface); color: var(--text); font-weight: 600; box-shadow: 0 1px 3px rgba(0,0,0,.08); }
.pv-search { flex: 1; min-width: 240px; max-width: 340px; padding: 9px 13px; border: 1px solid var(--border-color); border-radius: 10px; font-size: 13.5px; background: var(--bg); color: var(--text); }
.pv-table { background: var(--surface); border: 1px solid var(--border-color); border-radius: 16px; overflow: hidden; }
.pv-thead, .pv-row { display: grid; grid-template-columns: minmax(0,2.4fr) 1fr 1.2fr .9fr .9fr .7fr; gap: 14px; align-items: center; padding: 12px 20px; }
.pv-thead { font-size: 10.5px; letter-spacing: .06em; color: var(--muted); text-transform: uppercase; border-bottom: 1px solid var(--border-color); background: var(--o05); }
.pv-row { width: 100%; border: none; background: transparent; border-bottom: 1px solid var(--border-color); cursor: pointer; text-align: left; font-size: 13.5px; color: var(--text); }
.pv-row:hover { background: var(--o05); }
.pv-person { display: flex; align-items: center; gap: 12px; min-width: 0; }
.pv-avatar { width: 34px; height: 34px; flex-shrink: 0; border-radius: 50%; background: var(--accent-solid); color: var(--on-accent-solid); display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; }
.pv-avatar.anon { background: transparent; border: 1.5px dashed var(--border-color); }
.pv-person-text { min-width: 0; display: flex; flex-direction: column; }
.pv-name { font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.pv-email { font-size: 12px; color: var(--muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.pv-id { font-family: var(--font-mono, ui-monospace, monospace); font-size: 11px; color: var(--muted); opacity: 0.75; margin-left: 6px; }
.pv-stage { display: flex; align-items: center; gap: 6px; }
.pv-badge { padding: 3px 10px; border-radius: 999px; font-size: 12px; font-weight: 600; }
.pv-badge.visitor { background: rgba(0,0,0,.06); color: var(--muted); }
.pv-badge.lead { background: var(--purple-bg); color: var(--c-purple); }
.pv-badge.customer { background: var(--accent-bg-12); color: var(--primary-color); }
.pv-star { color: #f59e0b; }
.pv-source { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--muted); }
.pv-sync { color: var(--muted); }
.pv-empty { padding: 40px; text-align: center; color: var(--muted); font-size: 14px; }
.pv-foot { display: flex; align-items: center; justify-content: space-between; padding: 14px 20px; font-size: 12.5px; color: var(--muted); border-top: 1px solid var(--border-color); }
.pv-pager { display: flex; align-items: center; gap: 10px; }
.pv-pager button { width: 28px; height: 28px; border-radius: 8px; border: 1px solid var(--border-color); background: transparent; cursor: pointer; }
.pv-pager button:disabled { opacity: .4; cursor: default; }
</style>
