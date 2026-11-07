/*
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
*/

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import { flushPromises, mount } from '@vue/test-utils'

const state = vi.hoisted(() => ({ hasEnterpriseModule: true }))

type Member = { id: string; is_active: boolean; full_name: string; email: string; role: null }
const users = ref<Member[]>([])
const showCreateModal = ref(false)

vi.mock('@/composables/useUsers', () => ({
  useUsers: () => ({
    users, loading: ref(false), error: ref(''), showEditModal: ref(false), showDeleteModal: ref(false),
    showCreateModal, showResetPasswordModal: ref(false), resettingPassword: ref(false), selectedUser: ref(null),
    fetchUsers: vi.fn(), handleEditUser: vi.fn(), handleUpdateUser: vi.fn(), handleDeleteUser: vi.fn(),
    confirmDeleteUser: vi.fn(), handleCreateUser: vi.fn(), handleResetPassword: vi.fn(), confirmResetPassword: vi.fn(),
  }),
}))
vi.mock('@/composables/useEnterpriseFeatures', () => ({
  useEnterpriseFeatures: () => ({ hasEnterpriseModule: state.hasEnterpriseModule }),
}))
vi.mock('@/services/users', () => ({ getTeamOverview: vi.fn().mockResolvedValue(null) }))
vi.mock('@/services/user', () => ({ userService: { getCurrentUser: () => ({ id: 'me' }) } }))
vi.mock('vue-router', () => ({ useRouter: () => ({ push: vi.fn() }) }))
vi.mock('@/services/api', () => ({ default: { get: vi.fn(), post: vi.fn() } }))

import UserList from '@/components/human-agent/UserList.vue'
import { subscriptionStorage } from '@/utils/storage'

const member = (id: string, is_active = true): Member => ({ id, is_active, full_name: `Member ${id}`, email: `${id}@acme.test`, role: null })
const team = (count: number) => Array.from({ length: count }, (_, i) => member(`u${i}`))
const onPlan = (features: Record<string, unknown>, status = 'active') =>
  subscriptionStorage.setCurrentSubscription({ status, quantity: 5, plan: { features } } as never)

const tryToInvite = async () => {
  const wrapper = mount(UserList, { global: { stubs: { UserForm: true, ResetPasswordForm: true, Modal: true } } })
  await flushPromises()
  ;(wrapper.vm as unknown as { openCreate: () => void }).openCreate()
  await flushPromises()
  return wrapper
}

describe('UserList team limit', () => {
  beforeEach(() => {
    localStorage.clear()
    showCreateModal.value = false
    state.hasEnterpriseModule = true
  })

  it("blocks an invite at the plan's team limit, not the seat count", async () => {
    // Free allows one member; the old seat count of 5 must not widen it
    onPlan({ max_users: 1 })
    users.value = team(1)

    const wrapper = await tryToInvite()

    expect(showCreateModal.value).toBe(false)
    expect(wrapper.find('.upgrade-modal').text()).toContain('Your plan includes 1 team member. Upgrade to add more.')
  })

  it('lets a paid plan with no team limit invite anyone', async () => {
    onPlan({ max_users: null })
    users.value = team(12)

    const wrapper = await tryToInvite()

    expect(showCreateModal.value).toBe(true)
    expect(wrapper.find('.upgrade-modal').exists()).toBe(false)
  })

  it('counts only active members against the limit', async () => {
    onPlan({ max_users: 2 })
    users.value = [...team(1), member('gone', false)]

    await tryToInvite()

    expect(showCreateModal.value).toBe(true)
  })

  it('asks for a plan when there is none, without quoting a limit', async () => {
    users.value = team(1)

    const wrapper = await tryToInvite()

    expect(wrapper.find('.upgrade-modal').text()).toContain('Upgrade your plan to add team members.')
  })

  it('never limits the open-source build', async () => {
    state.hasEnterpriseModule = false
    onPlan({ max_users: 1 })
    users.value = team(3)

    await tryToInvite()

    expect(showCreateModal.value).toBe(true)
  })
})
