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

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import OrganizationSettings from '../../../views/settings/OrganizationSettings.vue'

// Mock the DashboardLayout component
vi.mock('@/layouts/DashboardLayout.vue', () => ({
  default: {
    name: 'DashboardLayout',
    template: '<div class="dashboard-layout"><slot /></div>'
  }
}))

// Mock the OrganizationSettingsSetup component
vi.mock('@/components/organization/Organizations.vue', () => ({
  default: {
    name: 'OrganizationSettingsSetup',
    template: '<div class="organization-settings-setup"></div>'
  }
}))

describe('OrganizationSettings', () => {
  let wrapper: VueWrapper

  beforeEach(() => {
    // Create a fresh pinia instance
    setActivePinia(createPinia())

    // Mount component with proper stubs
    wrapper = mount(OrganizationSettings, {
      global: {
        stubs: {
          DashboardLayout: {
            template: '<div class="dashboard-layout"><slot /></div>'
          }
        }
      }
    })
  })

  it('renders properly', () => {
    expect(wrapper.find('.dashboard-container').exists()).toBe(true)
    expect(wrapper.find('.settings-section').exists()).toBe(true)
  })

  it('is wrapped in DashboardLayout', () => {
    const dashboardLayout = wrapper.find('.dashboard-layout')
    expect(dashboardLayout.exists()).toBe(true)
  })

  it('contains OrganizationSettingsSetup component', () => {
    const orgSettings = wrapper.findComponent({ name: 'OrganizationSettingsSetup' })
    expect(orgSettings.exists()).toBe(true)
  })

  it('applies correct styling', () => {
    // Check container styling
    const container = wrapper.find('.dashboard-container')
    expect(container.classes()).toContain('dashboard-container')
    
    // Check settings section styling
    const settingsSection = wrapper.find('.settings-section')
    expect(settingsSection.classes()).toContain('settings-section')
  })

  it('maintains proper layout structure', () => {
    // Check nested structure
    const container = wrapper.find('.dashboard-container')
    const settingsSection = container.find('.settings-section')
    
    expect(container.exists()).toBe(true)
    expect(settingsSection.exists()).toBe(true)
    
    // Verify OrganizationSettingsSetup is inside settings section
    const orgSettings = settingsSection.findComponent({ name: 'OrganizationSettingsSetup' })
    expect(orgSettings.exists()).toBe(true)
  })
}) 