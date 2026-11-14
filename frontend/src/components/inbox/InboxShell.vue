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
 * The inbox's panes: views (200px), the list (320px), the thread, and the
 * details (280px). Below 1440px the details open over the thread; below
 * 1024px the views fold into a picker above the list. On phones one pane at a
 * time, driven by the URL (?session=, ?info=1) so the back button walks them.
 */
import { computed, inject, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { ChatDetail } from '@/types/chat'
import { listTeammates, type Teammate } from '@/services/users'
import { agentService } from '@/services/agent'
import channelsService, { type ChannelAccount } from '@/services/channels'
import { userService } from '@/services/user'
import { useBreakpoint } from '@/composables/useBreakpoint'
import { useEnterpriseFeatures } from '@/composables/useEnterpriseFeatures'
import { useInboxList } from '@/composables/useInboxList'
import { useInboxThread } from '@/composables/useInboxThread'
import { useInboxShortcuts } from '@/composables/useInboxShortcuts'
import { useNow } from '@/composables/useNow'
import NewWhatsAppConversation from '@/components/conversations/NewWhatsAppConversation.vue'
import InboxViews from './InboxViews.vue'
import InboxList from './InboxList.vue'
import ThreadPane from './ThreadPane.vue'
import DetailsPanel from './DetailsPanel.vue'
import ShortcutsSheet from './ShortcutsSheet.vue'
import { isPreset, type InboxViewItem } from './inboxViews'
import { OPEN_NAV_KEY } from '@/components/layout/navDrawer'
import { patchQuery } from '@/utils/patchQuery'

/** Remembers that you folded the views pane away */
const VIEWS_HIDDEN_KEY = 'cm-inbox-views-hidden'
/** Remembers that you closed the details panel (wide screens) */
const DETAILS_HIDDEN_KEY = 'cm-inbox-details-hidden'

const route = useRoute()
const router = useRouter()
const { isMobile, isTablet, isBelowWide } = useBreakpoint()
const { hasEnterpriseModule, enterpriseComponent, moduleImports } = useEnterpriseFeatures()
const PromoInboxCard = enterpriseComponent(moduleImports.promoUsageCard)
// Saved views (nothing in open source): the loader, each one's menu, and New view
const InboxSavedViews = enterpriseComponent(moduleImports.inboxSavedViews)
const InboxSavedViewMenu = enterpriseComponent(moduleImports.inboxSavedViewMenu)
const InboxNewView = enterpriseComponent(moduleImports.inboxNewView)

const currentUserId = userService.getUserId()
// Tablet widths hide the sidebar behind the header's menu button; the inbox has no header
const openNav = inject(OPEN_NAV_KEY, null)
const showNavButton = computed(() => !!openNav && isTablet.value && !isMobile.value)
const now = useNow()
const list = useInboxList()
const thread = useInboxThread((reply) => {
  list.patchConversation(reply.session_id, { last_message: reply.message, updated_at: reply.created_at })
})

// The open thread refetches when the AI answers (its turns aren't streamed):
// its row shows the same latest message rather than waiting for a poll
watch(
  () => {
    const messages = thread.chat.value?.messages
    return messages?.[messages.length - 1]
  },
  (last) => {
    const sessionId = thread.chat.value?.session_id
    const row = list.conversations.value.find((c) => c.session_id === sessionId)
    // Only newer: opening a chat must not move its row's time back
    if (sessionId && row && last?.message && Date.parse(last.created_at) > Date.parse(row.updated_at)) {
      list.patchConversation(sessionId, { last_message: last.message, updated_at: last.created_at })
    }
  },
)

const listRef = ref<InstanceType<typeof InboxList> | null>(null)
const threadRef = ref<InstanceType<typeof ThreadPane> | null>(null)

// ---- Panes ----
function stored(key: string): boolean {
  try {
    return localStorage.getItem(key) === '1'
  } catch {
    return false
  }
}
function store(key: string, value: boolean): void {
  try {
    if (value) localStorage.setItem(key, '1')
    else localStorage.removeItem(key)
  } catch {
    // Private mode: the choice lasts until reload
  }
}

const viewsHidden = ref(stored(VIEWS_HIDDEN_KEY))
const showViewsPane = computed(() => !isTablet.value && !viewsHidden.value)
const setViewsHidden = (hidden: boolean) => {
  viewsHidden.value = hidden
  store(VIEWS_HIDDEN_KEY, hidden)
}

// Wide: beside the thread unless you closed it. Narrower: a drawer, closed
// until asked for. Phones: its own page (?info=1).
const detailsHiddenWide = ref(stored(DETAILS_HIDDEN_KEY))
const detailsDrawerOpen = ref(false)
const detailsOverlay = computed(() => isBelowWide.value && !isMobile.value)
const detailsOpen = computed(() => {
  if (isMobile.value) return route.query.info === '1'
  return detailsOverlay.value ? detailsDrawerOpen.value : !detailsHiddenWide.value
})

function toggleDetails() {
  if (isMobile.value) {
    if (route.query.info === '1') router.back()
    else void patchQuery(router, { info: '1' }, 'push')
  } else if (detailsOverlay.value) {
    detailsDrawerOpen.value = !detailsDrawerOpen.value
  } else {
    detailsHiddenWide.value = !detailsHiddenWide.value
    store(DETAILS_HIDDEN_KEY, detailsHiddenWide.value)
  }
}

function closeDrawer() {
  if (isMobile.value && route.query.info === '1') router.back()
  else detailsDrawerOpen.value = false
}

// ---- Which conversation is open (?session=) ----
const sessionInUrl = computed(() => (typeof route.query.session === 'string' ? route.query.session : null))
const mobilePane = computed(() => {
  if (!isMobile.value || !sessionInUrl.value) return 'list'
  return route.query.info === '1' ? 'details' : 'thread'
})

function openConversation(sessionId: string) {
  if (sessionId === sessionInUrl.value) return
  // Phones push, so back returns to the list; elsewhere the URL just follows
  void patchQuery(router, { session: sessionId, info: undefined }, isMobile.value ? 'push' : 'replace')
}

watch(sessionInUrl, (sessionId) => {
  if (sessionId) void thread.open(sessionId)
  else thread.close()
}, { immediate: true })

// Wider screens open the first conversation of a view rather than a blank pane
watch(() => list.conversations.value, (rows) => {
  if (!isMobile.value && !sessionInUrl.value && rows.length) openConversation(rows[0].session_id)
})

function backToList() {
  const previous = window.history.state?.back
  if (typeof previous === 'string' && previous.startsWith('/conversations') && !previous.includes('session=')) {
    router.back()
  } else {
    void patchQuery(router, { session: undefined, info: undefined })
  }
}

function selectView(item: InboxViewItem) {
  if (isPreset(item)) list.applyPreset(item)
  else list.select(item.selection)
}

function onChatUpdated(chat: ChatDetail) {
  thread.update(chat)
  list.patchConversation(chat.session_id, {
    status: chat.status,
    user_id: chat.user_id,
    user_name: chat.user_name,
    group_id: chat.group_id,
    handed_over_at: chat.handed_over_at,
  })
}

function refreshThread() {
  if (thread.selectedId.value) void thread.open(thread.selectedId.value, true)
}

// ---- Teammates and starting a WhatsApp conversation ----
const teammates = ref<Teammate[]>([])
const agents = ref<Array<{ id: string; name: string; display_name: string | null }>>([])
const filterAgents = computed(() => agents.value.map((a) => ({ id: a.id, label: a.display_name || a.name })))
const filterTeammates = computed(() => teammates.value.map((t) => ({
  id: t.id,
  label: t.id === currentUserId ? `${t.full_name || t.email} (you)` : (t.full_name || t.email),
})))
const whatsappAccounts = ref<ChannelAccount[]>([])
const startingConversation = ref(false)

function onConversationStarted(sessionId: string) {
  startingConversation.value = false
  openConversation(sessionId)
  list.refresh()
}

onMounted(async () => {
  // /users/teammates: /users needs manage_users, which an agent doesn't have
  listTeammates().then((t) => { teammates.value = t }).catch(() => {})
  // The roster, not the full agent list: filtering needs names, and that needs manage_agents
  agentService.getAgentRoster().then((a) => { agents.value = a }).catch(() => {})
  // Resolves to [] on failure: a hidden button, not a broken page
  whatsappAccounts.value = await channelsService.listActiveWhatsAppAccounts()
})

// ---- Keyboard ----
const showShortcuts = ref(false)

function step(delta: number) {
  const rows = list.conversations.value
  if (!rows.length) return
  const index = rows.findIndex((r) => r.session_id === thread.selectedId.value)
  const next = rows[Math.min(Math.max(index + delta, 0), rows.length - 1)]
  if (next) openConversation(next.session_id)
}

useInboxShortcuts({
  next: () => step(1),
  previous: () => step(-1),
  close: () => threadRef.value?.requestClose(),
  search: () => listRef.value?.focusSearch(),
  dismiss: () => { if (detailsOverlay.value && detailsDrawerOpen.value) detailsDrawerOpen.value = false },
  help: () => { showShortcuts.value = true },
})
</script>

<template>
  <div
    class="inbox"
    :class="{
      'with-views': showViewsPane,
      'details-inline': detailsOpen && !detailsOverlay && !isMobile && !!thread.chat.value,
      [`mobile-${mobilePane}`]: isMobile,
    }"
  >
    <InboxViews
      v-if="showViewsPane"
      class="pane-views"
      :groups="list.viewGroups.value"
      :selected-id="list.selectedId.value"
      :can-start-conversation="whatsappAccounts.length > 0"
      @select="selectView"
      @new-conversation="startingConversation = true"
      @hide="setViewsHidden(true)"
    >
      <template v-if="hasEnterpriseModule" #item-actions="{ item }">
        <InboxSavedViewMenu v-if="isPreset(item)" :item="item" :state="list.state.value" />
      </template>
      <template v-if="hasEnterpriseModule" #footer>
        <InboxNewView :state="list.state.value" @saved="list.markPreset" />
      </template>
    </InboxViews>
    <!-- Loads the saved views into the list (the narrow view picker too) -->
    <InboxSavedViews @update="list.setPresets" />

    <div class="pane-list">
      <PromoInboxCard v-if="isMobile && hasEnterpriseModule" compact class="promo" />
      <InboxList
        ref="listRef"
        v-model:sort="list.sort.value"
        v-model:search="list.search.value"
        v-model:filters="list.filters.value"
        :narrowed="list.narrowed.value"
        :filter-agents="filterAgents"
        :filter-teammates="filterTeammates"
        :view="list.currentView.value"
        :groups="list.viewGroups.value"
        :conversations="list.conversations.value"
        :selected-session-id="thread.selectedId.value"
        :unread="thread.unread"
        :current-user-id="currentUserId"
        :now="now"
        :loading="list.loading.value"
        :loading-more="list.loadingMore.value"
        :has-more="list.hasMore.value"
        :error="list.error.value"
        :show-view-picker="!showViewsPane"
        :can-restore-views="!isTablet && viewsHidden"
        :can-start-conversation="!showViewsPane && whatsappAccounts.length > 0"
        :show-nav-button="showNavButton"
        @select="openConversation"
        @select-view="selectView"
        @load-more="list.loadMore"
        @retry="list.load()"
        @restore-views="setViewsHidden(false)"
        @new-conversation="startingConversation = true"
        @open-nav="openNav?.()"
      >
        <template v-if="hasEnterpriseModule" #view-actions>
          <InboxSavedViewMenu
            v-if="isPreset(list.currentView.value)"
            :item="list.currentView.value"
            :state="list.state.value"
            inline
          />
          <InboxNewView :state="list.state.value" compact @saved="list.markPreset" />
        </template>
      </InboxList>
    </div>

    <div class="pane-thread">
      <ThreadPane
        v-if="thread.chat.value"
        ref="threadRef"
        :key="thread.chat.value.session_id"
        :chat="thread.chat.value"
        :details-open="detailsOpen"
        :teammates="teammates"
        :now="now"
        :show-back="isMobile"
        @chat-updated="onChatUpdated"
        @refresh="refreshThread"
        @toggle-details="toggleDetails"
        @back="backToList"
      />
      <div v-else class="thread-empty">
        <p>{{ thread.loadingChat.value ? 'Loading the conversation…' : 'Pick a conversation to read it here.' }}</p>
      </div>
    </div>

    <template v-if="thread.chat.value && detailsOpen">
      <div v-if="detailsOverlay" class="scrim" aria-hidden="true" @click="closeDrawer"></div>
      <DetailsPanel
        class="pane-details"
        :class="{ drawer: detailsOverlay }"
        :chat="thread.chat.value"
        :overlay="detailsOverlay || isMobile"
        @close="closeDrawer"
        @open-conversation="openConversation"
      />
    </template>

    <NewWhatsAppConversation
      v-if="startingConversation"
      :accounts="whatsappAccounts"
      @close="startingConversation = false"
      @started="onConversationStarted"
    />
    <ShortcutsSheet v-if="showShortcuts" @close="showShortcuts = false" />
  </div>
</template>

<style scoped>
.inbox {
  position: relative;
  /* The rest of the page's column, below any bar above it */
  flex: 1 1 auto;
  height: 100%;
  min-height: 0;
  display: grid;
  grid-template-columns: minmax(300px, 320px) minmax(0, 1fr);
  grid-template-rows: minmax(0, 1fr);
  background: var(--bg);
  overflow: hidden;
}

.inbox.with-views {
  grid-template-columns: 200px minmax(300px, 320px) minmax(0, 1fr);
}

.inbox.details-inline {
  grid-template-columns: minmax(300px, 320px) minmax(0, 1fr) 280px;
}

.inbox.with-views.details-inline {
  grid-template-columns: 200px minmax(300px, 320px) minmax(0, 1fr) 280px;
}

.pane-list,
.pane-thread,
.pane-views {
  min-width: 0;
  min-height: 0;
}

.pane-list {
  display: flex;
  flex-direction: column;
}

.pane-list > :last-child {
  flex: 1;
  min-height: 0;
}

.promo {
  flex-shrink: 0;
  margin: 8px 12px;
}

.thread-empty {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  text-align: center;
  font-size: 14px;
  color: var(--muted);
}

.thread-empty p {
  margin: 0;
}

.pane-details.drawer {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 320px;
  max-width: 90%;
  z-index: 30;
}

.scrim {
  position: absolute;
  inset: 0;
  z-index: 29;
  background: var(--scrim);
}

/* Phones: one pane at a time */
@media (max-width: 768px) {
  .inbox,
  .inbox.with-views,
  .inbox.details-inline,
  .inbox.with-views.details-inline {
    grid-template-columns: minmax(0, 1fr);
  }

  .inbox.mobile-list .pane-thread,
  .inbox.mobile-thread .pane-list,
  .inbox.mobile-details .pane-list,
  .inbox.mobile-details .pane-thread {
    display: none;
  }

  .inbox.mobile-details .pane-details {
    position: absolute;
    inset: 0;
    width: auto;
    z-index: 30;
  }
}
</style>
