<!--
ChatterMate - User Form
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
import { ref, computed, onMounted } from 'vue'
import type { Role, User } from '@/types/user'
import { validatePassword, type PasswordStrength } from '@/utils/validators'
import { listRoles } from '@/services/roles'
import { toast } from 'vue-sonner'

const props = defineProps<{
  user?: User | null
}>()

const emit = defineEmits<{
  submit: [userData: Partial<User> & { password?: string, role_id?: number }]
  cancel: []
}>()

const fullName = ref(props.user?.full_name || '')
const email = ref(props.user?.email || '')
const isActive = ref(props.user?.is_active ?? true)
const password = ref('')
const confirmPassword = ref('')
const showPasswordFields = ref(!props.user)
const passwordTouched = ref(false)
const error = ref('')
const roles = ref<Role[]>([])
const selectedRole = ref(props.user?.role?.id || '')
const loadingRoles = ref(false)

const passwordStrength = ref<PasswordStrength>({
  score: 0,
  hasMinLength: false,
  hasUpperCase: false,
  hasLowerCase: false,
  hasNumber: false,
  hasSpecialChar: false
})

const handlePasswordInput = (password: string) => {
  if (!passwordTouched.value && password.length > 0) {
    passwordTouched.value = true
  }
  passwordStrength.value = validatePassword(password)
  error.value = ''
}

const handleConfirmPasswordInput = () => {
  if (confirmPassword.value && password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match'
  } else {
    error.value = ''
  }
}

const strengthClass = computed(() => {
  if (passwordStrength.value.score >= 4) return 'strong'
  if (passwordStrength.value.score >= 3) return 'medium'
  return 'weak'
})

const fetchRoles = async () => {
  try {
    loadingRoles.value = true
    roles.value = await listRoles()
  } catch (err) {
    console.error('Error loading roles:', err)
    toast.error('Error', {
      description: 'Failed to load roles',
      duration: 4000,
      closeButton: true
    })
  } finally {
    loadingRoles.value = false
  }
}

onMounted(fetchRoles)

const handleSubmit = () => {
  if (showPasswordFields.value) {
    if (password.value !== confirmPassword.value) {
      error.value = 'Passwords do not match'
      return
    }
    if (passwordStrength.value.score < 3) {
      error.value = 'Password is not strong enough'
      return
    }
  }

  if (!selectedRole.value) {
    error.value = 'Please select a role'
    return
  }

  const userData = {
    full_name: fullName.value,
    email: email.value,
    is_active: isActive.value,
    role_id: Number(selectedRole.value),
    ...(showPasswordFields.value && { password: password.value })
  }

  emit('submit', userData)
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="user-form">
    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <div class="form-group">
      <label for="fullName">Full Name</label>
      <input
        id="fullName"
        v-model="fullName"
        type="text"
        required
        class="form-input"
      />
    </div>

    <div class="form-group">
      <label for="email">Email</label>
      <input
        id="email"
        v-model="email"
        type="email"
        required
        class="form-input"
      />
    </div>

    <div class="form-group">
      <label for="role">Role</label>
      <select 
        id="role"
        v-model="selectedRole"
        required
        class="form-input"
        :disabled="loadingRoles"
      >
        <option value="" disabled>Select a role</option>
        <option 
          v-for="role in roles" 
          :key="role.id" 
          :value="role.id"
        >
          {{ role.name }}
        </option>
      </select>
      <span v-if="loadingRoles" class="loading-text">Loading roles...</span>
    </div>

    <template v-if="showPasswordFields">
      <div class="form-group">
        <label for="password">Password</label>
        <input
          id="password"
          v-model="password"
          type="password"
          required
          class="form-input"
          autocomplete="new-password"
          @input="handlePasswordInput(password)"
        />
        <div v-if="passwordTouched" class="password-strength">
          <div class="strength-meter">
            <div 
              class="strength-bar" 
              :class="strengthClass"
              :style="{ width: `${(passwordStrength.score / 4) * 100}%` }"
            />
          </div>
          <ul class="strength-requirements">
            <li :class="{ met: passwordStrength.hasMinLength }">
              At least 8 characters
            </li>
            <li :class="{ met: passwordStrength.hasUpperCase }">
              At least one uppercase letter
            </li>
            <li :class="{ met: passwordStrength.hasLowerCase }">
              At least one lowercase letter
            </li>
            <li :class="{ met: passwordStrength.hasNumber }">
              At least one number
            </li>
            <li :class="{ met: passwordStrength.hasSpecialChar }">
              At least one special character
            </li>
          </ul>
        </div>
      </div>

      <div class="form-group">
        <label for="confirmPassword">Confirm Password</label>
        <input
          id="confirmPassword"
          v-model="confirmPassword"
          type="password"
          required
          class="form-input"
          autocomplete="new-password"
          @input="handleConfirmPasswordInput"
          :class="{ 'error': error && error.includes('match') }"
        />
      </div>
    </template>

    <div class="form-group">
      <label class="checkbox-label">
        <input
          type="checkbox"
          v-model="isActive"
        />
        Active User
      </label>
    </div>

    <div class="form-actions">
      <button type="button" class="btn btn-secondary" @click="emit('cancel')">
        Cancel
      </button>
      <button type="submit" class="btn btn-primary">
        {{ props.user ? 'Update' : 'Create' }}
      </button>
    </div>
  </form>
</template>

<style scoped>
.user-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);

}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.form-input {
  padding: var(--space-sm);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-md);
  margin-top: var(--space-md);
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

.error-message {
  color: var(--error-color);
  font-size: var(--text-sm);
  margin-bottom: var(--space-md);
  padding: var(--space-sm);
  background: var(--error-soft);
  border-radius: var(--radius-sm);
}

.form-input.error {
  border-color: var(--error-color);
}

.form-input.error:focus {
  box-shadow: 0 0 0 2px var(--error-soft);
}

.loading-text {
  font-size: var(--text-sm);
  color: var(--text-color);
  opacity: 0.7;
  margin-top: var(--space-xs);
}

select.form-input {
  appearance: none;
  background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E");
  background-position: right 0.5rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
  padding-right: 2.5rem;
}

select.form-input:disabled {
  background-color: var(--background-mute);
  cursor: not-allowed;
}
</style> 