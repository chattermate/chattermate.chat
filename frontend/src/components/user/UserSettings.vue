<!--
ChatterMate - User Settings
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
import { ref, onMounted, inject, computed, watch } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { userService } from '@/services/user'
import { validatePassword, type PasswordStrength } from '@/utils/validators'
import userAvatar from '@/assets/user.svg'
import type { User } from '@/types/user'
import { isAbsoluteUrl } from '@/utils/avatars'

const { user } = useAuth()

const profilePicFile = ref<File | null>(null)
const profilePicPreview = ref<string>('')
const formData = ref({
  full_name: '',
  email: '',
  current_password: '',
  new_password: '',
  confirm_password: ''
})

// Define the fileInput ref with proper typing
const fileInput = ref<HTMLInputElement | null>(null)

const loading = ref(false)
const message = ref('')
const error = ref('')

const passwordTouched = ref(false)
const passwordStrength = ref<PasswordStrength>({
  score: 0,
  hasMinLength: false,
  hasUpperCase: false,
  hasLowerCase: false,
  hasNumber: false,
  hasSpecialChar: false
})


const hasChanges = computed(() => {
  if (!user.value) return false
  
  const hasProfileChanges = 
    formData.value.full_name !== user.value.full_name ||
    formData.value.email !== user.value.email

  const hasPasswordChanges = 
    formData.value.new_password || 
    formData.value.current_password ||
    formData.value.confirm_password

  return hasProfileChanges || hasPasswordChanges
})

const avatarInitial = computed(() => {
  const name = formData.value.full_name || user.value?.full_name || user.value?.email || ''
  return name.trim().charAt(0).toUpperCase() || 'U'
})

const discardChanges = () => {
  if (user.value) {
    formData.value.full_name = user.value.full_name
    formData.value.email = user.value.email
  }
  formData.value.current_password = ''
  formData.value.new_password = ''
  formData.value.confirm_password = ''
  passwordTouched.value = false
  error.value = ''
  message.value = ''
}

const userAvatarSrc = computed(() => {
  if (profilePicPreview.value) return profilePicPreview.value
  if (user.value?.profile_pic) {
    // Absolute S3/CDN URL — use it directly
    if (isAbsoluteUrl(user.value.profile_pic)) {
      return user.value.profile_pic
    }
    // For local storage, prepend the API URL and add timestamp
    const timestamp = new Date().getTime()
    return `${import.meta.env.VITE_API_URL}${user.value.profile_pic}?t=${timestamp}`
  }
  return userAvatar
})

onMounted(async () => {
  // Load current user data
  if (user.value) {
    formData.value.full_name = user.value.full_name
    formData.value.email = user.value.email
  }
})

const handlePasswordInput = (password: string) => {
  if (!passwordTouched.value && password.length > 0) {
    passwordTouched.value = true
  }
  passwordStrength.value = validatePassword(password)
}

const handleFileSelect = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files?.length) return
  
  const file = input.files[0]
  if (!file.type.startsWith('image/')) {
    error.value = 'Please select an image file'
    return
  }
  
  if (file.size > 5 * 1024 * 1024) {
    error.value = 'Image must be less than 5MB'
    return
  }
  
  // Clear any previous error messages
  error.value = ''
  
  // Set the file and create preview
  profilePicFile.value = file
  profilePicPreview.value = URL.createObjectURL(file)
  

}

const resetFileInput = () => {
  // Clear preview and file
  profilePicFile.value = null
  profilePicPreview.value = ''
  
  // Reset the file input element to allow selecting the same file again
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const uploadProfilePic = async () => {
  if (!profilePicFile.value) return
  
  loading.value = true
  error.value = ''
  message.value = ''
  
  try {
    const formData = new FormData()
    formData.append('file', profilePicFile.value)
    
    await userService.uploadProfilePic(formData)
    message.value = 'Profile picture updated successfully'
    
    // Update the current user data with new profile pic and force refresh
    if (user.value) {
      const updatedUser = userService.getCurrentUser() as User
      if (updatedUser && updatedUser.profile_pic) {
        user.value = {
          ...updatedUser,
          profile_pic: isAbsoluteUrl(updatedUser.profile_pic) ? updatedUser.profile_pic : `${updatedUser.profile_pic}?t=${new Date().getTime()}`
        }
      }
    }
    
    // Reset the file input
    resetFileInput()
    

    
  } catch (err: any) {
    error.value = err.message || 'Failed to upload profile picture'
  } finally {
    loading.value = false
  }
}

const updateProfile = async () => {
  if (!hasChanges.value) {
    message.value = 'No changes to save'
    return
  }

  loading.value = true
  error.value = ''
  message.value = ''

  try {
    // Create update data only with changed fields
    const updateData: Record<string, string> = {}
    
    if (formData.value.full_name !== user.value?.full_name) {
      updateData.full_name = formData.value.full_name
    }
    
    if (formData.value.email !== user.value?.email) {
      updateData.email = formData.value.email
    }
    
    if (formData.value.new_password) {
      if (formData.value.new_password !== formData.value.confirm_password) {
        throw new Error('New passwords do not match')
      }
      if (!formData.value.current_password) {
        throw new Error('Current password is required to set new password')
      }
      if (passwordStrength.value.score < 3) {
        throw new Error('Password is not strong enough')
      }
      updateData.password = formData.value.new_password
      updateData.current_password = formData.value.current_password
    }

    if (Object.keys(updateData).length === 0) {
      message.value = 'No changes to save'
      return
    }

    await userService.updateProfile(updateData)
    user.value = userService.getCurrentUser()
    message.value = 'Profile updated successfully'
    
    // Clear password fields
    formData.value.current_password = ''
    formData.value.new_password = ''
    formData.value.confirm_password = ''
    
  } catch (err: any) {
    error.value = err.message || 'Failed to update profile'
  } finally {
    loading.value = false
  }
}

// Watch for changes to profilePicFile
watch(profilePicFile, (newFile) => {
  if (newFile) {
    // Auto-upload when a file is selected
    uploadProfilePic()
  }
})

const handleProfilePicClick = () => {
  if (fileInput.value) {
    fileInput.value.click()
  }
}
</script>

<template>
  <div class="settings-page">
    <div class="settings-head">
      <h1>User Settings</h1>
      <p>Manage your personal profile, password and notifications.</p>
    </div>

    <form @submit.prevent="updateProfile" class="settings-form">
      <!-- Profile card -->
      <div class="settings-card">
        <h3 class="card-title">Profile</h3>

        <div class="profile-row">
          <div class="profile-pic-wrapper" @click="handleProfilePicClick">
            <img
              v-if="profilePicPreview || user?.profile_pic"
              :src="userAvatarSrc"
              alt="Profile"
              class="profile-pic"
            />
            <span v-else class="avatar-initial">{{ avatarInitial }}</span>
            <div class="profile-pic-overlay">
              <i class="fas fa-camera"></i>
              <span>Change Photo</span>
            </div>
          </div>
          <input
            type="file"
            accept="image/*"
            @change="handleFileSelect"
            class="file-input"
            ref="fileInput"
          >
          <div class="profile-pic-meta">
            <div class="profile-pic-title">Profile photo</div>
            <div class="profile-pic-hint">JPG, PNG or GIF. Max 5MB.</div>
          </div>
          <div class="profile-pic-actions">
            <button
              type="button"
              class="upload-button"
              @click="handleProfilePicClick"
              :disabled="loading"
            >
              {{ loading ? 'Uploading...' : 'Upload' }}
            </button>
          </div>
        </div>

        <div class="field-grid">
          <div class="form-group">
            <label>Full name</label>
            <input
              type="text"
              v-model="formData.full_name"
              placeholder="Your full name"
            >
          </div>
          <div class="form-group">
            <label>Email</label>
            <input
              type="email"
              v-model="formData.email"
              placeholder="Your email"
              class="input-mono"
              disabled
            >
          </div>
        </div>

        <div class="role-row">
          <span class="role-label">Role</span>
          <span class="role-badge">{{ user?.role?.name || 'User' }}</span>
          <span class="role-note">Contact an admin to change your role.</span>
        </div>
      </div>

      <!-- Change password card -->
      <div class="settings-card">
        <h3 class="card-title">Change password</h3>
        <p class="card-subtitle">Use at least 8 characters with a mix of letters and numbers.</p>

        <div class="form-group">
          <label>Current password</label>
          <input
            type="password"
            v-model="formData.current_password"
            placeholder="••••••••"
          >
        </div>

        <div class="field-grid">
          <div class="form-group">
            <label>New password</label>
            <input
              type="password"
              v-model="formData.new_password"
              @input="handlePasswordInput(formData.new_password)"
              placeholder="Enter new password"
              minlength="8"
            >
          </div>
          <div class="form-group">
            <label>Confirm new password</label>
            <input
              type="password"
              v-model="formData.confirm_password"
              placeholder="Confirm new password"
            >
          </div>
        </div>

        <div v-if="passwordTouched && formData.new_password" class="password-strength">
          <div class="strength-meter">
            <div
              class="strength-bar"
              :style="{ width: `${(passwordStrength.score / 5) * 100}%` }"
              :class="[
                passwordStrength.score < 3 ? 'weak' :
                passwordStrength.score < 4 ? 'medium' : 'strong'
              ]"
            ></div>
          </div>
          <ul class="strength-requirements">
            <li :class="{ met: passwordStrength.hasMinLength }">At least 8 characters</li>
            <li :class="{ met: passwordStrength.hasUpperCase }">Contains uppercase letter</li>
            <li :class="{ met: passwordStrength.hasLowerCase }">Contains lowercase letter</li>
            <li :class="{ met: passwordStrength.hasNumber }">Contains number</li>
            <li :class="{ met: passwordStrength.hasSpecialChar }">Contains special character (!@#$%^&*)</li>
          </ul>
        </div>
      </div>

      <div v-if="error" class="error-message">{{ error }}</div>

      <!-- Sticky save bar -->
      <div v-if="hasChanges" class="save-bar">
        <span class="save-bar-text">You have unsaved changes</span>
        <div class="save-bar-actions">
          <button type="button" class="discard-button" @click="discardChanges">Discard</button>
          <button type="submit" class="submit-button" :disabled="loading">
            {{ loading ? 'Saving...' : 'Save changes' }}
          </button>
        </div>
      </div>
      <div v-else-if="message" class="save-bar saved-bar">
        <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"></path></svg>
        <span class="saved-text">{{ message }}</span>
      </div>
    </form>
  </div>
</template>

<style scoped>
.settings-page {
  max-width: 760px;
  margin: 0 auto;
  padding: var(--space-lg);
  padding-bottom: 80px;
}

.settings-head {
  margin-bottom: 26px;
}

.settings-head h1 {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 30px;
  letter-spacing: -0.02em;
  color: var(--text);
  margin: 0 0 6px;
}

.settings-head p {
  font-size: 15px;
  color: var(--muted);
  margin: 0;
}

.settings-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.settings-card {
  background: var(--surface);
  border: 1px solid var(--o08);
  border-radius: 18px;
  padding: 26px;
}

.card-title {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 17px;
  color: var(--text);
  margin: 0 0 20px;
}

.card-subtitle {
  font-size: 13.5px;
  color: var(--muted);
  margin: -16px 0 20px;
}

/* Avatar row */
.profile-row {
  display: flex;
  align-items: center;
  gap: 18px;
  padding-bottom: 22px;
  border-bottom: 1px solid var(--o07);
  margin-bottom: 22px;
}

.profile-pic-wrapper {
  position: relative;
  width: 64px;
  height: 64px;
  flex-shrink: 0;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  background: var(--grad-purple-teal);
  display: flex;
  align-items: center;
  justify-content: center;
}

.profile-pic-wrapper:hover .profile-pic-overlay {
  opacity: 1;
}

.avatar-initial {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 26px;
  color: var(--on-accent-solid);
}

.profile-pic {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-pic-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  opacity: 0;
  transition: opacity 0.3s ease;
  font-size: 10px;
  gap: 2px;
}

.profile-pic-overlay i {
  font-size: 1rem;
}

.profile-pic-meta {
  flex: 1;
  min-width: 0;
}

.profile-pic-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text2);
  margin-bottom: 3px;
}

.profile-pic-hint {
  font-size: 12.5px;
  color: var(--muted2);
}

.profile-pic-actions {
  flex-shrink: 0;
}

.file-input {
  opacity: 0;
  width: 0;
  height: 0;
  cursor: pointer;
  position: absolute;
}

.upload-button {
  padding: 9px 16px;
  background: var(--o06);
  border: 1px solid var(--o14);
  border-radius: 10px;
  color: var(--text);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  font-family: var(--font-sans);
  transition: background 0.2s ease;
}

.upload-button:hover:not(:disabled) {
  background: var(--o10);
}

.upload-button:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

/* Inputs */
.field-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group + .form-group,
.form-group + .field-grid,
.field-grid + .form-group {
  margin-top: 16px;
}

/* Form-groups inside a 2-col grid align at the top — the grid gap handles spacing */
.field-grid > .form-group + .form-group {
  margin-top: 0;
}

.field-grid {
  align-items: start;
}

.form-group label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: var(--text3);
  margin-bottom: 8px;
}

.form-group input {
  width: 100%;
  padding: 13px 15px;
  background: var(--bg);
  border: 1px solid var(--o12);
  border-radius: 11px;
  color: var(--text);
  font-family: var(--font-sans);
  font-size: 14.5px;
  outline: none;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.form-group input:focus {
  border-color: var(--accent-ink);
  box-shadow: var(--ring-focus);
}

.form-group input.input-mono,
.form-group input:disabled {
  background: var(--o03);
  border: 1px solid var(--o08);
  color: var(--muted);
  font-family: var(--font-mono);
  cursor: not-allowed;
}

/* Role badge */
.role-row {
  margin-top: 18px;
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.role-label {
  font-size: 13px;
  color: var(--muted);
}

.role-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: var(--radius-pill);
  background: var(--accent-bg-12);
  border: 1px solid var(--accent-border);
  color: var(--accent-ink);
  font-size: 12.5px;
  font-weight: 600;
}

.role-note {
  font-size: 12px;
  color: var(--faint);
}

/* Sticky save bar */
.save-bar {
  position: fixed;
  left: 50%;
  bottom: 26px;
  transform: translateX(-50%);
  z-index: 50;
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 12px 14px 12px 22px;
  background: color-mix(in srgb, var(--surface) 96%, transparent);
  backdrop-filter: blur(12px);
  border: 1px solid var(--o12);
  border-radius: 14px;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.45);
}

.save-bar-text {
  font-size: 13.5px;
  color: var(--text3);
}

.save-bar-actions {
  display: flex;
  gap: 10px;
}

.discard-button {
  padding: 10px 16px;
  background: transparent;
  border: 1px solid var(--o14);
  border-radius: 10px;
  color: var(--text3);
  font-size: 13.5px;
  font-weight: 500;
  cursor: pointer;
  font-family: var(--font-sans);
  transition: background 0.2s ease;
}

.discard-button:hover {
  background: var(--o06);
}

.submit-button {
  padding: 10px 20px;
  background: var(--accent-solid);
  color: var(--on-accent-solid);
  border: none;
  border-radius: 10px;
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
  font-family: var(--font-sans);
  transition: filter 0.2s ease;
}

.submit-button:hover:not(:disabled) {
  filter: brightness(1.05);
}

.submit-button:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.saved-bar {
  gap: 10px;
  padding: 12px 20px;
  border-color: var(--accent-border);
  color: var(--accent-ink);
}

.saved-text {
  font-size: 13.5px;
  color: var(--accent-ink);
  font-weight: 500;
}

.error-message {
  color: var(--error-color);
  font-size: 0.875rem;
}

@media (max-width: 768px) {
  .settings-page {
    padding: var(--space-md);
    padding-bottom: 90px;
  }

  .settings-card {
    padding: var(--space-lg);
  }

  .field-grid {
    grid-template-columns: 1fr;
  }

  .save-bar {
    left: var(--space-md);
    right: var(--space-md);
    transform: none;
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
}

.password-strength {
  margin-top: var(--space-md);
}

.strength-meter {
  height: 4px;
  background: var(--o10);
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
</style> 