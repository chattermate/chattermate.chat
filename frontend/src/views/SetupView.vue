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
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import type { OrganizationCreate } from '@/types/organization'
import { createOrganization, getSetupStatus } from '@/services/organization'
import { userService } from '@/services/user'
import { validatePassword, validateDomain, validateEmail, validateName, validateOrgName, type PasswordStrength } from '@/utils/validators'
// @ts-ignore
import { listTz, clientTz } from 'timezone-select-js'
import type { BusinessHoursDict } from '@/types/organization'


const router = useRouter()
const loading = ref(false)
const error = ref('')
const checkingOrganization = ref(true)

// Check if organization exists
onMounted(async () => {
    try {
        const isSetupComplete = await getSetupStatus()
        // Only query setup status if user is authenticated
        if (userService.isAuthenticated()) {
            
            if (isSetupComplete) {
                router.push('/ai-agents')
            }
        }
        else if (isSetupComplete){
            router.push('/login') 
        }   
        
    } catch (e) {
        error.value = e instanceof Error ? e.message : 'Failed to check organization status'
    } finally {
        checkingOrganization.value = false
    }
})

const timezones = ref(listTz())
const selectedTimezone = ref(clientTz())

// Add default business hours
const defaultBusinessHours: BusinessHoursDict = {
  monday: { start: '09:00', end: '17:00', enabled: true },
  tuesday: { start: '09:00', end: '17:00', enabled: true },
  wednesday: { start: '09:00', end: '17:00', enabled: true },
  thursday: { start: '09:00', end: '17:00', enabled: true },
  friday: { start: '09:00', end: '17:00', enabled: true },
  saturday: { start: '09:00', end: '17:00', enabled: false },
  sunday: { start: '09:00', end: '17:00', enabled: false }
}

// Update orgData initialization
const orgData = ref<OrganizationCreate>({
    name: '',
    domain: '',
    admin_email: '',
    admin_name: '',
    admin_password: '',
    timezone: selectedTimezone.value,
    business_hours: defaultBusinessHours,
    settings: {}
})

const confirmPassword = ref('')
const passwordTouched = ref(false)
const passwordStrength = ref<PasswordStrength>({
    score: 0,
    hasMinLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false
})

const domainTouched = ref(false)
const isDomainValid = ref(false)
const orgNameTouched = ref(false)
const isOrgNameValid = ref(false)
const adminNameTouched = ref(false)
const isAdminNameValid = ref(false)
const emailTouched = ref(false)
const isEmailValid = ref(false)

// Input handlers
const handleOrgNameInput = (name: string) => {
    if (!orgNameTouched.value && name.length > 0) {
        orgNameTouched.value = true
    }
    isOrgNameValid.value = validateOrgName(name)
}

const handleAdminNameInput = (name: string) => {
    if (!adminNameTouched.value && name.length > 0) {
        adminNameTouched.value = true
    }
    isAdminNameValid.value = validateName(name)
}

const handleEmailInput = (email: string) => {
    if (!emailTouched.value && email.length > 0) {
        emailTouched.value = true
    }
    isEmailValid.value = validateEmail(email)
}

const handlePasswordInput = (password: string) => {
    if (!passwordTouched.value && password.length > 0) {
        passwordTouched.value = true
    }
    passwordStrength.value = validatePassword(password)
}

const handleDomainInput = (domain: string) => {
    if (!domainTouched.value && domain.length > 0) {
        domainTouched.value = true
    }
    isDomainValid.value = validateDomain(domain)
}

const handleSubmit = async () => {
    if (!isOrgNameValid.value) {
        error.value = 'Please enter a valid organization name'
        return
    }

    if (!isDomainValid.value) {
        error.value = 'Please enter a valid domain'
        return
    }

    if (!isAdminNameValid.value) {
        error.value = 'Please enter a valid admin name'
        return
    }

    if (!isEmailValid.value) {
        error.value = 'Please enter a valid email address'
        return
    }

    if (orgData.value.admin_password !== confirmPassword.value) {
        error.value = 'Passwords do not match'
        return
    }

    if (!passwordStrength.value.hasMinLength || 
        !passwordStrength.value.hasUpperCase || 
        !passwordStrength.value.hasLowerCase || 
        !passwordStrength.value.hasNumber || 
        !passwordStrength.value.hasSpecialChar) {
        error.value = 'Password must meet all requirements'
        return
    }

    loading.value = true
    error.value = ''

    try {
        await createOrganization(orgData.value)
        router.push('/ai-agents')
    } catch (e) {
        error.value = e instanceof Error ? e.message : 'Failed to create organization'
    } finally {
        loading.value = false
    }
}

// Add watch to update orgData.timezone when selectedTimezone changes
watch(selectedTimezone, (newTz) => {
    orgData.value.timezone = newTz
})

// Add these helper functions
const days = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' }
] as const

const timeOptions = Array.from({ length: 24 * 4 }, (_, i) => {
  const hour = Math.floor(i / 4)
  const minute = (i % 4) * 15
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
})
</script>

<template>
    <main v-if="!checkingOrganization" class="setup">
        <div class="container">
            <!-- Header -->
            <header class="setup-header text-center">
                <h1 class="gradient-text">Welcome to ChatterMate</h1>
                <p class="subtitle opacity-80">Let's get your organization set up</p>
            </header>

            <!-- Content -->
            <div class="setup-content">
                <div class="card">
                    <form @submit.prevent="handleSubmit">
                        <div class="form-group">
                            <label class="form-label" for="orgName">Organization Name</label>
                            <input class="form-input" id="orgName" v-model="orgData.name"
                                @input="handleOrgNameInput(orgData.name)" type="text" required
                                :class="{ 'invalid': orgNameTouched && !isOrgNameValid }"
                                placeholder="Enter your organization name" autocomplete="organization">
                            <p v-if="orgNameTouched && !isOrgNameValid" class="error-hint">
                                Organization name must be 2-100 characters and can contain letters, numbers, spaces,
                                hyphens, apostrophes, & and dots
                            </p>
                        </div>

                        <div class="form-group">
                            <label class="form-label" for="domain">Domain</label>
                            <input class="form-input" id="domain" v-model="orgData.domain"
                                @input="handleDomainInput(orgData.domain)" type="text" required
                                :class="{ 'invalid': domainTouched && !isDomainValid }" placeholder="yourdomain.com">
                            <p v-if="domainTouched && !isDomainValid" class="error-hint">
                                Please enter a valid domain (e.g., example.com)
                            </p>
                        </div>

                        <div class="form-group">
                            <label class="form-label" for="timezone">Timezone</label>
                            <select 
                                class="form-input" 
                                id="timezone" 
                                v-model="selectedTimezone" 
                                required
                            >
                                <option 
                                    v-for="tz in timezones" 
                                    :key="tz.value" 
                                    :value="tz.value"
                                    :selected="selectedTimezone === tz.value"
                                >
                                    {{ tz.label }}
                                </option>
                            </select>
                            <p class="form-hint">
                                Select your organization's primary timezone
                            </p>
                        </div>

                        <div class="form-group">
                            <label class="form-label">Business Hours</label>
                            <div class="business-hours">
                                <div v-for="day in days" :key="day.key" class="day-row">
                                    <div class="day-toggle">
                                        <label class="toggle">
                                            <input 
                                                type="checkbox" 
                                                v-model="orgData.business_hours[day.key].enabled"
                                            >
                                            <span class="toggle-slider"></span>
                                        </label>
                                        <span class="day-label">{{ day.label }}</span>
                                    </div>
                                    <div class="time-selects" :class="{ disabled: !orgData.business_hours[day.key].enabled }">
                                        <select 
                                            v-model="orgData.business_hours[day.key].start"
                                            :disabled="!orgData.business_hours[day.key].enabled"
                                        >
                                            <option v-for="time in timeOptions" :key="time" :value="time">
                                                {{ time }}
                                            </option>
                                        </select>
                                        <span class="time-separator">to</span>
                                        <select 
                                            v-model="orgData.business_hours[day.key].end"
                                            :disabled="!orgData.business_hours[day.key].enabled"
                                        >
                                            <option v-for="time in timeOptions" :key="time" :value="time">
                                                {{ time }}
                                            </option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <p class="form-hint">Set your organization's operating hours for each day</p>
                        </div>

                        <div class="form-group">
                            <label class="form-label" for="adminName">Admin Name</label>
                            <input class="form-input" id="adminName" v-model="orgData.admin_name"
                                @input="handleAdminNameInput(orgData.admin_name)" type="text" required
                                :class="{ 'invalid': adminNameTouched && !isAdminNameValid }"
                                placeholder="Your full name" autocomplete="name">
                            <p v-if="adminNameTouched && !isAdminNameValid" class="error-hint">
                                Name must be 2-100 characters and can contain letters, numbers, spaces, hyphens and
                                apostrophes
                            </p>
                        </div>

                        <div class="form-group">
                            <label class="form-label" for="adminEmail">Admin Email</label>
                            <input class="form-input" id="adminEmail" v-model="orgData.admin_email"
                                @input="handleEmailInput(orgData.admin_email)" type="email" required
                                :class="{ 'invalid': emailTouched && !isEmailValid }" placeholder="admin@yourdomain.com"
                                autocomplete="email">
                            <p v-if="emailTouched && !isEmailValid" class="error-hint">
                                Please enter a valid email address
                            </p>
                        </div>

                        <div class="form-group">
                            <label class="form-label" for="adminPassword">Admin Password</label>
                            <input class="form-input" id="adminPassword" v-model="orgData.admin_password"
                                @input="handlePasswordInput(orgData.admin_password)" type="password" required
                                placeholder="Enter a secure password" autocomplete="new-password" minlength="8">
                            <div v-if="passwordTouched" class="password-strength">
                                <div class="strength-meter">
                                    <div class="strength-bar"
                                        :style="{ width: `${(passwordStrength.score / 5) * 100}%` }" :class="[
                                            passwordStrength.score < 3 ? 'weak' :
                                                passwordStrength.score < 4 ? 'medium' : 'strong'
                                        ]"></div>
                                </div>
                                <ul class="strength-requirements">
                                    <li :class="{ met: passwordStrength.hasMinLength }">
                                        At least 8 characters
                                    </li>
                                    <li :class="{ met: passwordStrength.hasUpperCase }">
                                        Contains uppercase letter
                                    </li>
                                    <li :class="{ met: passwordStrength.hasLowerCase }">
                                        Contains lowercase letter
                                    </li>
                                    <li :class="{ met: passwordStrength.hasNumber }">
                                        Contains number
                                    </li>
                                    <li :class="{ met: passwordStrength.hasSpecialChar }">
                                        Contains special character (!@#$%^&*)
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div class="form-group">
                            <label class="form-label" for="confirmPassword">Confirm Password</label>
                            <input class="form-input" id="confirmPassword" v-model="confirmPassword" type="password"
                                required placeholder="Confirm your password" autocomplete="new-password">
                        </div>

                        <div v-if="error" class="error-message" role="alert">
                            {{ error }}
                        </div>

                        <div class="form-actions">
                            <button type="submit" class="btn btn-primary" :class="{ loading }" :disabled="loading">
                                {{ loading ? '' : 'Create Organization' }}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </main>
    <div v-else class="loading-screen">
        <div class="loading-spinner"></div>
    </div>
</template>

<style scoped>
.setup {
    min-height: 100vh;
    background: var(--background-color);
}

.container {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: var(--space-2xl);
    padding-bottom: var(--space-2xl);
}

.setup-header {
    width: 100%;
    max-width: 600px;
    margin-bottom: var(--space-2xl);
}

.gradient-text {
    background: linear-gradient(to right, var(--accent-solid), var(--secondary-color));
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: var(--space-md);
}

.subtitle {
    font-size: var(--text-lg);
}

.setup-progress {
    width: 100%;
    max-width: 800px;
    margin-bottom: var(--space-2xl);
}

.setup-content {
    width: 100%;
    display: flex;
    justify-content: center;
}

.setup-form {
    width: 100%;
}

.form-actions {
    display: flex;
    justify-content: flex-end;
    margin-top: var(--space-xl);
}

.setup-navigation {
    display: flex;
    justify-content: space-between;
    margin-top: var(--space-xl);
    padding-top: var(--space-xl);
    border-top: 1px solid var(--border-color);
}

@media (max-width: 768px) {
    .setup {
        padding: var(--space-xl) var(--space-md);
    }
}

.loading-screen {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--background-color);
}

.loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid var(--border-color);
    border-radius: 50%;
    border-top-color: var(--accent-color);
    animation: spin 1s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

.form-hint {
    font-size: var(--text-sm);
    color: var(--text-color);
    opacity: 0.7;
    margin-top: var(--space-xs);
}

.password-strength {
    margin-top: var(--space-sm);
}

.strength-meter {
    height: 4px;
    background: var(--background-mute);
    border-radius: var(--radius-full);
    margin-bottom: var(--space-sm);
}

.strength-bar {
    height: 100%;
    border-radius: var(--radius-full);
    transition: width var(--transition-normal);
}

.strength-bar.weak {
    background: var(--error-color);
}

.strength-bar.medium {
    background: var(--warning-color);
}

.strength-bar.strong {
    background: var(--success-color);
}

.strength-requirements {
    list-style: none;
    padding: 0;
    margin: 0;
    font-size: var(--text-sm);
    color: var(--text-color);
    opacity: 0.7;
}

.strength-requirements li {
    margin-bottom: var(--space-xs);
    display: flex;
    align-items: center;
    gap: var(--space-xs);
}

.strength-requirements li::before {
    content: '×';
    color: var(--error-color);
}

.strength-requirements li.met::before {
    content: '✓';
    color: var(--success-color);
}

.form-input.invalid {
    border-color: var(--error-color);
}

.error-hint {
    font-size: var(--text-sm);
    color: var(--error-color);
    margin-top: var(--space-xs);
}

select.form-input {
    padding-right: var(--space-xl);
    appearance: none;
    background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right var(--space-sm) center;
    background-size: 16px;
}

.business-hours {
    background: var(--background-soft);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-lg);
    padding: var(--space-md);
}

.day-row {
    display: flex;
    align-items: center;
    padding: var(--space-sm) 0;
    gap: var(--space-lg);
}

.day-row:not(:last-child) {
    border-bottom: 1px solid var(--border-color);
}

.day-toggle {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    min-width: 120px;
}

.day-label {
    font-size: var(--text-sm);
    color: var(--text-color);
}

.time-selects {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
}

.time-selects.disabled {
    opacity: 0.5;
}

.time-selects select {
    padding: var(--space-xs) var(--space-sm);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    background: var(--background-mute);
    color: var(--text-color);
    font-size: var(--text-sm);
}

.time-separator {
    color: var(--text-color);
    opacity: 0.7;
    font-size: var(--text-sm);
}

.toggle {
    position: relative;
    display: inline-block;
    width: 40px;
    height: 20px;
}

.toggle input {
    opacity: 0;
    width: 0;
    height: 0;
}

.toggle-slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: var(--background-mute);
    transition: .4s;
    border-radius: 34px;
}

.toggle-slider:before {
    position: absolute;
    content: "";
    height: 16px;
    width: 16px;
    left: 2px;
    bottom: 2px;
    background-color: white;
    transition: .4s;
    border-radius: 50%;
}

input:checked + .toggle-slider {
    background-color: var(--accent-solid);
}

input:checked + .toggle-slider:before {
    transform: translateX(20px);
}

@media (max-width: 640px) {
    .day-row {
        flex-direction: column;
        align-items: flex-start;
        gap: var(--space-sm);
    }
    
    .day-toggle {
        width: 100%;
    }
    
    .time-selects {
        width: 100%;
        justify-content: space-between;
    }
}
</style>