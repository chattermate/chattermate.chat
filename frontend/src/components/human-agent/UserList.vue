<!--
ChatterMate - User List
Copyright (C) 2024 ChatterMate

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>
-->

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import type { User } from '@/types/user'
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'
import { EllipsisVerticalIcon } from '@heroicons/vue/24/outline'
import { useUsers } from '@/composables/useUsers'
import UserForm from './UserForm.vue'
import Modal from '@/components/common/Modal.vue'
import { userService } from '@/services/user'
import { useRouter } from 'vue-router'
import { useSubscriptionStorage } from '@/utils/storage'
import { useEnterpriseFeatures } from '@/composables/useEnterpriseFeatures'
import { getTeamOverview } from '@/services/users'
import type { TeamKpis, TeamAgentStats } from '@/services/users'

const props = defineProps<{
  searchQuery?: string
}>()

const emit = defineEmits<{
  (e: 'changed'): void
}>()

const {
  users,
  loading,
  error,
  showEditModal,
  showDeleteModal,
  showCreateModal,
  selectedUser,
  fetchUsers,
  handleEditUser,
  handleUpdateUser,
  handleDeleteUser,
  confirmDeleteUser,
  handleCreateUser
} = useUsers()

const currentUser = userService.getCurrentUser()
const router = useRouter()
const subscriptionStorage = useSubscriptionStorage()
const { hasEnterpriseModule } = useEnterpriseFeatures()

// Subscription and user limits
const currentSubscription = computed(() => subscriptionStorage.getCurrentSubscription())
const isSubscriptionActive = computed(() => subscriptionStorage.isSubscriptionActive())
const currentUserCount = computed(() => users.value.filter(user => user.is_active).length)

// Check if user creation is locked due to limits (only if enterprise module exists)
const isUserCreationLocked = computed(() => {
  // Only lock if enterprise module exists
  if (!hasEnterpriseModule) {
    return false
  }
  
  if (!currentSubscription.value || !isSubscriptionActive.value) {
    return true
  }
  
  // Check if max_users feature exists in subscription
  const hasMaxUsersFeature = subscriptionStorage.hasFeature('max_users')
  if (!hasMaxUsersFeature) {
    return false // No user limits if feature doesn't exist
  }
  
  // Get max users from subscription quantity (this is the user seat limit)
  const maxUsers = currentSubscription.value.quantity
  if (maxUsers === null || maxUsers === undefined) {
    return false // Unlimited users
  }
  
  return currentUserCount.value >= maxUsers
})

// Show upgrade modal state
const showUpgradeModal = ref(false)

// Modal functions
const closeUpgradeModal = () => {
  showUpgradeModal.value = false
}

const handleUpgrade = () => {
  // Only redirect to subscription page if enterprise module exists
  if (hasEnterpriseModule) {
    window.location.href = '/settings/subscription'
  }
}

const handleCreateUserClick = () => {
  if (isUserCreationLocked.value) {
    // Only show upgrade modal if enterprise module exists
    if (hasEnterpriseModule) {
      showUpgradeModal.value = true
      return
    }
  }
  showCreateModal.value = true
}

// Exposed for the parent's "Invite agent" button
const openCreate = () => {
  handleCreateUserClick()
}

defineExpose({ openCreate })

// -----------------------------------------------------------------------------
// Team overview (KPIs + per-agent stats). Falls back to listUsers() data.
// -----------------------------------------------------------------------------

type AgentRow = TeamAgentStats

const kpis = ref<TeamKpis | null>(null)
const overviewRows = ref<AgentRow[]>([])
const usingOverview = ref(false)

const resolveAvatar = (pic?: string | null) => {
  if (!pic) return null
  if (pic.includes('amazonaws.com')) return pic
  return `${import.meta.env.VITE_API_URL}${pic}`
}

// Build rows from the fallback users list when team-overview isn't deployed.
const mapUsersToRows = (list: User[]): AgentRow[] =>
  list.map((u) => {
    const roleName = u.role?.name ?? null
    return {
      id: u.id,
      full_name: u.full_name,
      email: u.email,
      profile_pic: u.profile_pic ?? null,
      is_online: !!u.is_online,
      last_seen: u.last_seen ?? null,
      is_active: u.is_active ?? true,
      role: roleName,
      is_admin: !!roleName && /admin/i.test(roleName),
      groups: u.groups?.map((g) => g.name) ?? [],
      active_chats: 0,
      resolved_chats: 0,
      capacity: 0,
    }
  })

// KPIs derived from the fallback users list.
const deriveKpis = (list: User[]): TeamKpis => {
  const admins = list.filter((u) => !!u.role?.name && /admin/i.test(u.role.name)).length
  return {
    team_size: list.length,
    admins,
    agents: list.length - admins,
    online_now: list.filter((u) => u.is_online).length,
    active_chats: 0,
    total_capacity: 0,
    waiting_handoff: 0,
    oldest_wait_minutes: 0,
  }
}

const loadOverview = async () => {
  const overview = await getTeamOverview()
  if (overview) {
    usingOverview.value = true
    kpis.value = overview.kpis
    overviewRows.value = overview.agents
  } else {
    usingOverview.value = false
    kpis.value = deriveKpis(users.value)
    overviewRows.value = mapUsersToRows(users.value)
  }
}

// Rows always reflect the current users list (so create/delete stays in sync),
// merged with overview stats by id when available.
const rows = computed<AgentRow[]>(() => {
  if (usingOverview.value) {
    const userById = new Map(users.value.map((u) => [u.id, u]))
    return overviewRows.value
      // keep only agents that still exist in the CRUD list (handles deletes)
      .filter((r) => userById.has(r.id) || users.value.length === 0)
      .map((r) => r)
  }
  return mapUsersToRows(users.value)
})

const filteredRows = computed<AgentRow[]>(() => {
  const q = (props.searchQuery ?? '').trim().toLowerCase()
  if (!q) return rows.value
  return rows.value.filter(
    (r) =>
      r.full_name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q),
  )
})

const displayKpis = computed(() => {
  const k = kpis.value
  if (k) {
    const pct = k.total_capacity > 0 ? Math.round((k.active_chats / k.total_capacity) * 100) : 0
    return [
      {
        label: 'TEAM SIZE',
        value: String(k.team_size),
        sub: `${k.admins} admins · ${k.agents} agents`,
        color: 'var(--c-online)',
      },
      {
        label: 'ONLINE NOW',
        value: String(k.online_now),
        sub: 'available for handoff',
        color: 'var(--accent-ink)',
      },
      {
        label: 'LIVE CHAT LOAD',
        value: `${k.active_chats} / ${k.total_capacity}`,
        sub: `${pct}% of capacity used`,
        color: 'var(--c-pro)',
      },
      {
        label: 'WAITING HANDOFF',
        value: String(k.waiting_handoff),
        sub: `oldest waiting ${k.oldest_wait_minutes}m`,
        color: 'var(--c-coral)',
      },
    ]
  }
  return []
})

// Avatar helpers ---------------------------------------------------------------
const avatarColors = [
  'var(--c-teal)',
  'var(--accent-ink)',
  'var(--c-pro)',
  'var(--c-coral)',
  'var(--c-online)',
]

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('') || '?'

const avatarColor = (id: string) => {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0
  return avatarColors[h % avatarColors.length]
}

// Live-load pips ---------------------------------------------------------------
const loadPips = (active: number, capacity: number) => {
  const full = active >= capacity
  return Array.from({ length: capacity }, (_, i) => ({
    filled: i < active,
    color: full ? 'var(--c-warn)' : 'var(--c-teal)',
  }))
}

// Row menu actions wire into the existing user CRUD modals.
const findUser = (id: string) => users.value.find((u) => u.id === id) ?? null

const onEditRow = (row: AgentRow) => {
  const user = findUser(row.id)
  if (!user) return
  if (user.id === currentUser?.id) {
    router.push('/settings/user')
    return
  }
  handleEditUser(user)
}

const onDeleteRow = (row: AgentRow) => {
  const user = findUser(row.id)
  if (!user) return
  handleDeleteUser(user)
}

// Wrap the CRUD handlers so the parent gets notified to reload counts.
const handleCreateUserAndNotify = async (
  userData: Partial<User> & { password?: string },
) => {
  await handleCreateUser(userData)
  if (!error.value) {
    emit('changed')
    await loadOverview()
  }
}

const confirmDeleteUserAndNotify = async () => {
  await confirmDeleteUser()
  if (!error.value) {
    emit('changed')
    await loadOverview()
  }
}

onMounted(async () => {
  await fetchUsers()
  await loadOverview()
})
</script>

<template>
  <div class="user-list">
    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <div v-if="loading && rows.length === 0" class="loading">Loading people...</div>

    <template v-else>
      <!-- KPI strip -->
      <div class="kpi-strip">
        <div v-for="k in displayKpis" :key="k.label" class="kpi-card">
          <div class="kpi-label">{{ k.label }}</div>
          <div class="kpi-value">{{ k.value }}</div>
          <div class="kpi-sub" :style="{ color: k.color }">{{ k.sub }}</div>
        </div>
      </div>

      <!-- Agents table -->
      <div class="people-table">
        <div class="table-head">
          <div class="th th-agent">AGENT</div>
          <div class="th">STATUS</div>
          <div class="th">ROLE</div>
          <div class="th">TEAMS</div>
          <div class="th">LIVE LOAD</div>
          <div class="th th-center">RESOLVED</div>
          <div class="th"></div>
        </div>

        <div v-for="row in filteredRows" :key="row.id" class="table-row">
          <!-- AGENT -->
          <div class="cell-agent">
            <div class="avatar">
              <img
                v-if="resolveAvatar(row.profile_pic)"
                :src="resolveAvatar(row.profile_pic)!"
                alt=""
                class="avatar-img"
              />
              <div
                v-else
                class="avatar-fallback"
                :style="{ background: avatarColor(row.id) }"
              >
                {{ initials(row.full_name) }}
              </div>
              <span
                class="status-dot"
                :class="row.is_online ? 'online' : 'offline'"
              ></span>
            </div>
            <div class="agent-meta">
              <div class="agent-name">{{ row.full_name }}</div>
              <div class="agent-email">{{ row.email }}</div>
            </div>
          </div>

          <!-- STATUS -->
          <div>
            <span class="status-pill" :class="row.is_online ? 'online' : 'offline'">
              <span class="pill-dot"></span>
              {{ row.is_online ? 'Available' : 'Offline' }}
            </span>
          </div>

          <!-- ROLE -->
          <div>
            <span class="role-badge2" :class="{ admin: row.is_admin }">
              {{ row.role || '—' }}
            </span>
          </div>

          <!-- TEAMS -->
          <div class="cell-teams">
            <template v-if="row.groups.length">
              <span v-for="(t, i) in row.groups" :key="i" class="team-chip">{{ t }}</span>
            </template>
            <span v-else class="dash">—</span>
          </div>

          <!-- LIVE LOAD -->
          <div>
            <span v-if="!row.capacity" class="load-dash">—</span>
            <div v-else class="load">
              <div class="pips">
                <span
                  v-for="(pip, i) in loadPips(row.active_chats, row.capacity)"
                  :key="i"
                  class="pip"
                  :style="{ background: pip.filled ? pip.color : 'var(--o08)' }"
                ></span>
              </div>
              <span
                class="load-label"
                :style="{ color: row.active_chats >= row.capacity ? 'var(--c-warn)' : 'var(--muted)' }"
              >
                {{ row.active_chats >= row.capacity ? 'Full' : `${row.active_chats}/${row.capacity}` }}
              </span>
            </div>
          </div>

          <!-- RESOLVED -->
          <div class="cell-resolved">{{ row.resolved_chats }}</div>

          <!-- MENU -->
          <Menu as="div" class="row-menu">
            <MenuButton class="menu-btn" title="More">
              <EllipsisVerticalIcon class="h-4 w-4" />
            </MenuButton>
            <MenuItems class="menu-items">
              <MenuItem v-slot="{ active }">
                <button :class="['menu-item', { active }]" @click="onEditRow(row)">
                  {{ row.id === currentUser?.id ? 'Edit Profile' : 'Edit' }}
                </button>
              </MenuItem>
              <MenuItem v-if="row.id !== currentUser?.id" v-slot="{ active }">
                <button :class="['menu-item', { active }]" @click="onDeleteRow(row)">
                  Delete
                </button>
              </MenuItem>
            </MenuItems>
          </Menu>
        </div>

        <div v-if="filteredRows.length === 0" class="empty-row">
          No people match “{{ props.searchQuery }}”.
        </div>
      </div>
    </template>

    <!-- Edit User Modal -->
    <Modal v-if="showEditModal" @close="showEditModal = false">
      <template #title>Edit User</template>
      <template #content>
        <UserForm 
          :user="selectedUser"
          @submit="handleUpdateUser"
          @cancel="showEditModal = false"
        />
      </template>
    </Modal>

    <!-- Delete Confirmation Modal -->
    <Modal v-if="showDeleteModal" @close="showDeleteModal = false">
      <template #title>Delete User</template>
      <template #content>
        <p>Are you sure you want to delete this user?</p>
        <div class="modal-actions">
          <button
            class="btn btn-danger"
            @click="confirmDeleteUserAndNotify"
          >
            Delete
          </button>
          <button 
            class="btn btn-secondary" 
            @click="showDeleteModal = false"
          >
            Cancel
          </button>
        </div>
      </template>
    </Modal>

    <!-- Create User Modal -->
    <Modal v-if="showCreateModal" @close="showCreateModal = false">
      <template #title>Create New User</template>
      <template #content>
        <UserForm
          @submit="handleCreateUserAndNotify"
          @cancel="showCreateModal = false"
        />
      </template>
    </Modal>

    <!-- User Limit Upgrade Modal (only shown when enterprise module exists) -->
    <div v-if="hasEnterpriseModule && showUpgradeModal" class="upgrade-modal-overlay" @click="closeUpgradeModal">
      <div class="upgrade-modal" @click.stop>
        <div class="upgrade-modal-header">
          <h3>User Limit Reached</h3>
          <button class="close-button" @click="closeUpgradeModal">×</button>
        </div>
        <div class="upgrade-modal-content">
          <p class="upgrade-description">
            You've reached your plan's user limit ({{ currentUserCount }}/{{ currentSubscription?.quantity }}). 
            Upgrade your plan to add more users and unlock additional features.
          </p>
          <div class="upgrade-features">
            <div class="feature-item">
              <font-awesome-icon icon="fa-solid fa-check" class="feature-icon" />
              <span>More user seats for your team</span>
            </div>
            <div class="feature-item">
              <font-awesome-icon icon="fa-solid fa-check" class="feature-icon" />
              <span>Advanced user management features</span>
            </div>
            <div class="feature-item">
              <font-awesome-icon icon="fa-solid fa-check" class="feature-icon" />
              <span>Enhanced collaboration tools</span>
            </div>
            <div class="feature-item">
              <font-awesome-icon icon="fa-solid fa-check" class="feature-icon" />
              <span>Priority support</span>
            </div>
          </div>
        </div>
        <div class="upgrade-modal-footer">
          <button class="upgrade-button primary" @click="handleUpgrade">
            Upgrade Plan
          </button>
          <button class="upgrade-button secondary" @click="closeUpgradeModal">
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.user-list {
  display: flex;
  flex-direction: column;
}

.loading {
  text-align: center;
  padding: var(--space-xl);
  opacity: 0.7;
}

.error-message {
  color: var(--error-color);
  text-align: center;
  padding: var(--space-lg);
}

.modal-actions {
  display: flex;
  gap: var(--space-md);
  justify-content: flex-end;
  margin-top: var(--space-lg);
}

/* ---------------------------------------------------------------- KPI strip */
.kpi-strip {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.kpi-card {
  background: var(--surface);
  border: 1px solid var(--o08);
  border-radius: 16px;
  padding: 18px 20px;
}

.kpi-label {
  font-family: var(--font-mono);
  font-size: 10.5px;
  color: var(--muted2);
  letter-spacing: 0.06em;
}

.kpi-value {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 28px;
  letter-spacing: -0.02em;
  margin: 8px 0 4px;
  color: var(--text);
}

.kpi-sub {
  font-size: 12.5px;
}

/* ------------------------------------------------------------- People table */
.people-table {
  background: var(--surface);
  border: 1px solid var(--o08);
  border-radius: 18px;
  padding: 18px 0 6px;
}

.table-head,
.table-row {
  display: grid;
  grid-template-columns:
    minmax(220px, 2.2fr) 130px 92px minmax(150px, 1.5fr) 132px 88px 40px;
  gap: 14px;
  align-items: center;
}

.table-head {
  padding: 0 20px 14px;
}

.th {
  font-family: var(--font-mono);
  font-size: 10.5px;
  letter-spacing: 0.06em;
  color: var(--faint);
  text-align: left;
}

.th-center {
  text-align: center;
}

.table-row {
  padding: 14px 20px;
  border-top: 1px solid var(--o06);
  transition: background 0.12s ease;
}

.table-row:hover {
  background: var(--o03);
}

/* Agent cell */
.cell-agent {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.avatar {
  position: relative;
  width: 38px;
  height: 38px;
  flex-shrink: 0;
}

.avatar-img,
.avatar-fallback {
  width: 38px;
  height: 38px;
  border-radius: 50%;
}

.avatar-img {
  object-fit: cover;
}

.avatar-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 15px;
  color: var(--on-accent);
}

.status-dot {
  position: absolute;
  right: -1px;
  bottom: -1px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid var(--surface);
}

.status-dot.online {
  background: var(--c-teal);
  box-shadow: 0 0 6px var(--c-teal);
}

.status-dot.offline {
  background: var(--muted);
}

.agent-meta {
  min-width: 0;
}

.agent-name {
  font-size: 14.5px;
  font-weight: 600;
  color: var(--text2);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.agent-email {
  font-family: var(--font-mono);
  font-size: 11.5px;
  color: var(--muted2);
  margin-top: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Status pill */
.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 500;
}

.status-pill.online {
  background: var(--teal-bg);
  border: 1px solid var(--teal-border);
  color: var(--c-online);
}

.status-pill.offline {
  background: var(--o05);
  border: 1px solid var(--o12);
  color: var(--muted);
}

.pill-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.status-pill.online .pill-dot {
  background: var(--c-teal);
  box-shadow: 0 0 6px var(--c-teal);
}

.status-pill.offline .pill-dot {
  background: var(--muted);
}

/* Role badge */
.role-badge2 {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 7px;
  font-size: 12.5px;
  font-weight: 500;
  background: var(--o05);
  border: 1px solid var(--o10);
  color: var(--text3);
}

.role-badge2.admin {
  background: var(--accent-bg-12);
  border: 1px solid var(--accent-border);
  color: var(--accent-ink);
}

/* Teams */
.cell-teams {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.team-chip {
  font-size: 12px;
  padding: 3px 9px;
  border-radius: 7px;
  background: var(--o05);
  border: 1px solid var(--o10);
  color: var(--text3);
  white-space: nowrap;
}

.dash {
  font-size: 12.5px;
  color: var(--faint);
}

/* Live load */
.load-dash {
  font-family: var(--font-mono);
  font-size: 12.5px;
  color: var(--faint);
}

.load {
  display: flex;
  align-items: center;
  gap: 9px;
}

.pips {
  display: flex;
  gap: 3px;
}

.pip {
  width: 7px;
  height: 15px;
  border-radius: 3px;
}

.load-label {
  font-family: var(--font-mono);
  font-size: 12px;
}

/* Resolved */
.cell-resolved {
  text-align: center;
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 16px;
  color: var(--text2);
}

/* Row menu */
.row-menu {
  position: relative;
  justify-self: end;
}

.menu-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: transparent;
  border: 1px solid var(--o10);
  color: var(--muted);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.menu-btn:hover {
  color: var(--text);
  background: var(--o05);
}

.menu-items {
  position: absolute;
  right: 0;
  margin-top: var(--space-xs);
  background: var(--surface);
  border: 1px solid var(--o10);
  border-radius: 12px;
  padding: 4px;
  min-width: 150px;
  z-index: 10;
  box-shadow: var(--shadow-md);
}

.menu-item {
  display: block;
  width: 100%;
  text-align: left;
  padding: var(--space-sm) var(--space-md);
  border-radius: 8px;
  font-size: var(--text-sm);
  color: var(--text3);
  transition: all var(--transition-fast);
}

.menu-item:hover,
.menu-item.active {
  background: var(--o08);
  color: var(--text);
}

/* Empty state */
.empty-row {
  padding: 40px 20px;
  text-align: center;
  color: var(--muted2);
  font-size: 14px;
  border-top: 1px solid var(--o06);
}

/* Locked button styles */
.btn.locked {
  background: var(--o06);
  color: var(--muted);
  cursor: not-allowed;
  opacity: 0.7;
}

.btn.locked:hover {
  background: var(--o06);
  transform: none;
}

.lock-icon {
  font-size: 12px;
  margin-left: var(--space-xs);
  color: var(--warning-color);
}

/* Upgrade Modal Styles */
.upgrade-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(5, 6, 9, 0.66);
  backdrop-filter: blur(3px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.upgrade-modal {
  background: var(--surface);
  border: 1px solid var(--o10);
  border-radius: 20px;
  padding: 0;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-lg);
}

.upgrade-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-lg);
  border-bottom: 1px solid var(--o08);
}

.upgrade-modal-header h3 {
  margin: 0;
  font-family: var(--font-display);
  color: var(--text);
  font-size: 1.25rem;
  font-weight: 700;
}

.close-button {
  background: var(--o05);
  border: 1px solid var(--o12);
  font-size: 1.2rem;
  color: var(--muted);
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.close-button:hover {
  background: var(--o10);
  color: var(--text);
}

.upgrade-modal-content {
  padding: var(--space-lg);
}

.upgrade-description {
  color: var(--muted);
  line-height: 1.6;
  margin-bottom: var(--space-lg);
}

.upgrade-features {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.feature-item {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.feature-icon {
  color: var(--accent-ink);
  font-size: 0.875rem;
}

.upgrade-modal-footer {
  display: flex;
  gap: var(--space-sm);
  padding: var(--space-lg);
  border-top: 1px solid var(--o08);
}

.upgrade-button {
  flex: 1;
  padding: var(--space-md);
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.upgrade-button.primary {
  background: var(--accent-ink);
  color: var(--on-accent);
}

.upgrade-button.primary:hover {
  filter: brightness(1.08);
  transform: translateY(-1px);
}

.upgrade-button.secondary {
  background: var(--o06);
  color: var(--text3);
  border: 1px solid var(--o10);
}

.upgrade-button.secondary:hover {
  background: var(--o10);
  color: var(--text);
}
</style> 