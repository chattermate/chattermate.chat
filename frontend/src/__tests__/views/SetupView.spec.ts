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
import { mount, VueWrapper } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'
import SetupView from '../../views/SetupView.vue'
import { nextTick } from 'vue'
import { flushPromises } from '@vue/test-utils'

// Mock timezone-select-js
vi.mock('timezone-select-js', () => ({
  listTz: () => [
    { value: 'America/New_York', label: 'New York' },
    { value: 'Europe/London', label: 'London' },
    { value: 'Asia/Tokyo', label: 'Tokyo' }
  ],
  clientTz: () => 'America/New_York'
}))

// Mock the organization service
vi.mock('@/services/organization', () => ({
  createOrganization: vi.fn(),
  getSetupStatus: vi.fn().mockResolvedValue(false)
}))

// Mock Firebase services
vi.mock('@/services/firebase', () => ({
  messaging: {},
  requestNotificationPermission: vi.fn()
}))

vi.mock('@/composables/useNotifications', () => ({
  useNotifications: vi.fn(() => ({
    requestPermission: vi.fn(),
    hasPermission: { value: false }
  }))
}))

// Import mocked services
import { createOrganization, getSetupStatus } from '@/services/organization'

describe('SetupView', () => {
  let wrapper: VueWrapper
  let router: any

  beforeEach(async () => {
    // Create a fresh pinia instance
    setActivePinia(createPinia())

    // Create router instance
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', name: 'home', component: { template: '<div>Home</div>' } },
        { path: '/ai-agents', name: 'ai-agents', component: { template: '<div>AI Agents</div>' } }
      ]
    })

    // Reset mocks
    vi.clearAllMocks()

    // Initialize router
    await router.push('/')
    await router.isReady()

    wrapper = mount(SetupView, {
      global: {
        plugins: [router]
      }
    })

    // Wait for initial organization check
    await nextTick()
  })

  it('renders properly', () => {
    expect(wrapper.find('.setup').exists()).toBe(true)
    expect(wrapper.find('h1').text()).toBe('Welcome to ChatterMate')
  })

  it('checks for existing organization on mount', async () => {
    expect(getSetupStatus).toHaveBeenCalled()
  })

  it('redirects to ai-agents if organization exists', async () => {
    // Mock organization exists
    vi.mocked(getSetupStatus).mockResolvedValueOnce(true)
    
    // Remount component
    wrapper = mount(SetupView, {
      global: {
        plugins: [router]
      }
    })
    
    // Wait for all promises to resolve and navigation to complete
    await flushPromises()
    await router.isReady()
    
    expect(router.currentRoute.value.path).toBe('/login')
    expect(getSetupStatus).toHaveBeenCalled()
  })

  it('displays form fields with default values', () => {
    expect(wrapper.find('#orgName').exists()).toBe(true)
    expect(wrapper.find('#domain').exists()).toBe(true)
    expect(wrapper.find('#timezone').exists()).toBe(true)
    expect(wrapper.find('#adminName').exists()).toBe(true)
    expect(wrapper.find('#adminEmail').exists()).toBe(true)
    expect(wrapper.find('#adminPassword').exists()).toBe(true)
    expect(wrapper.find('#confirmPassword').exists()).toBe(true)
  })

  it('validates organization name', async () => {
    const orgNameInput = wrapper.find('#orgName')
    
    // Test invalid name
    await orgNameInput.setValue('a')
    await orgNameInput.trigger('input')
    expect(wrapper.find('.error-hint').text()).toContain('Organization name must be')
    
    // Test valid name
    await orgNameInput.setValue('Valid Organization')
    await orgNameInput.trigger('input')
    expect(wrapper.find('.error-hint').exists()).toBe(false)
  })

  it('validates domain', async () => {
    const domainInput = wrapper.find('#domain')
    
    // Test invalid domain
    await domainInput.setValue('invalid')
    await domainInput.trigger('input')
    expect(wrapper.find('.error-hint').text()).toContain('Please enter a valid domain')
    
    // Test valid domain
    await domainInput.setValue('example.com')
    await domainInput.trigger('input')
    expect(wrapper.find('.error-hint').exists()).toBe(false)
  })

  it('validates admin email', async () => {
    const emailInput = wrapper.find('#adminEmail')
    
    // Test invalid email
    await emailInput.setValue('invalid-email')
    await emailInput.trigger('input')
    expect(wrapper.find('.error-hint').text()).toContain('Please enter a valid email address')
    
    // Test valid email
    await emailInput.setValue('admin@example.com')
    await emailInput.trigger('input')
    expect(wrapper.find('.error-hint').exists()).toBe(false)
  })

  it('validates password strength', async () => {
    const passwordInput = wrapper.find('#adminPassword')
    
    // Test weak password
    await passwordInput.setValue('weak')
    await passwordInput.trigger('input')
    expect(wrapper.find('.strength-bar').classes()).toContain('weak')
    
    // Test strong password
    await passwordInput.setValue('StrongP@ss123')
    await passwordInput.trigger('input')
    expect(wrapper.find('.strength-bar').classes()).toContain('strong')
  })

  it('validates password confirmation', async () => {
    // Fill in all required fields with valid data first
    await wrapper.find('#orgName').setValue('Test Organization')
    await wrapper.find('#domain').setValue('test.com')
    await wrapper.find('#adminName').setValue('Test Admin')
    await wrapper.find('#adminEmail').setValue('admin@test.com')
    
    // Set different passwords
    const passwordInput = wrapper.find('#adminPassword')
    const confirmInput = wrapper.find('#confirmPassword')
    
    await passwordInput.setValue('StrongP@ss123')
    await passwordInput.trigger('input')
    await confirmInput.setValue('DifferentP@ss123')
    
    // Submit form
    await wrapper.find('form').trigger('submit')
    await nextTick()
    
    expect(wrapper.find('.error-message').text()).toBe('Passwords do not match')
  })

  it('handles timezone selection', async () => {
    const timezoneSelect = wrapper.find('#timezone')
    await timezoneSelect.setValue('Europe/London')
    
    expect((wrapper.vm as any).selectedTimezone).toBe('Europe/London')
    expect((wrapper.vm as any).orgData.timezone).toBe('Europe/London')
  })

  it('handles business hours configuration', async () => {
    // Toggle Saturday to enabled
    const saturdayToggle = wrapper.findAll('.toggle input')[5]
    await saturdayToggle.setValue(true)
    
    // Change Saturday hours
    const timeSelects = wrapper.findAll('.time-selects select')
    await timeSelects[10].setValue('10:00') // Start time
    await timeSelects[11].setValue('18:00') // End time
    
    const businessHours = (wrapper.vm as any).orgData.business_hours
    expect(businessHours.saturday.enabled).toBe(true)
    expect(businessHours.saturday.start).toBe('10:00')
    expect(businessHours.saturday.end).toBe('18:00')
  })

  it('submits form with valid data', async () => {
    // Fill in all required fields with valid data
    await wrapper.find('#orgName').setValue('Test Organization')
    await wrapper.find('#domain').setValue('test.com')
    await wrapper.find('#adminName').setValue('Test Admin')
    await wrapper.find('#adminEmail').setValue('admin@test.com')
    await wrapper.find('#adminPassword').setValue('StrongP@ss123')
    await wrapper.find('#confirmPassword').setValue('StrongP@ss123')
    
    // Submit form
    await wrapper.find('form').trigger('submit')
    await nextTick()
    
    // Verify organization creation was called
    expect(createOrganization).toHaveBeenCalledWith(expect.objectContaining({
      name: 'Test Organization',
      domain: 'test.com',
      admin_name: 'Test Admin',
      admin_email: 'admin@test.com',
      admin_password: 'StrongP@ss123'
    }))
  })

  it('handles organization creation error', async () => {
    const error = 'Failed to create organization'
    ;(createOrganization as any).mockRejectedValueOnce(new Error(error))
    
    // Fill in required fields
    await wrapper.find('#orgName').setValue('Test Organization')
    await wrapper.find('#domain').setValue('test.com')
    await wrapper.find('#adminName').setValue('Test Admin')
    await wrapper.find('#adminEmail').setValue('admin@test.com')
    await wrapper.find('#adminPassword').setValue('StrongP@ss123')
    await wrapper.find('#confirmPassword').setValue('StrongP@ss123')
    
    // Submit form
    await wrapper.find('form').trigger('submit')
    await nextTick()
    
    expect(wrapper.find('.error-message').text()).toBe(error)
  })

  it('shows loading state during submission', async () => {
    // Mock slow organization creation
    ;(createOrganization as any).mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 100)))
    
    // Fill in required fields
    await wrapper.find('#orgName').setValue('Test Organization')
    await wrapper.find('#domain').setValue('test.com')
    await wrapper.find('#adminName').setValue('Test Admin')
    await wrapper.find('#adminEmail').setValue('admin@test.com')
    await wrapper.find('#adminPassword').setValue('StrongP@ss123')
    await wrapper.find('#confirmPassword').setValue('StrongP@ss123')
    
    // Submit form
    await wrapper.find('form').trigger('submit')
    await nextTick()
    
    expect(wrapper.find('button[type="submit"]').classes()).toContain('loading')
  })
}) 