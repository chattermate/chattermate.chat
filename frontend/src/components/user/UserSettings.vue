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

const userAvatarSrc = computed(() => {
  if (profilePicPreview.value) return profilePicPreview.value
  if (user.value?.profile_pic) {
    // If it's an S3 URL (contains amazonaws.com), use it directly
    if (user.value.profile_pic.includes('amazonaws.com')) {
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
          profile_pic: updatedUser.profile_pic.includes('amazonaws.com') ? updatedUser.profile_pic : `${updatedUser.profile_pic}?t=${new Date().getTime()}`
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

    <div class="settings-content">
      <form @submit.prevent="updateProfile" class="settings-form">
        <div class="form-section profile-section">
          <div class="profile-pic-section">
            <div class="profile-pic-wrapper">
              <img :src="userAvatarSrc" alt="Profile" class="profile-pic" />
              <div 
                class="profile-pic-overlay"
                @click="handleProfilePicClick"
              >
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
            <div class="profile-pic-actions">
              <button 
                v-if="profilePicPreview"
                type="button" 
                class="upload-button"
                @click="uploadProfilePic"
                :disabled="loading || !profilePicFile"
              >
                {{ loading ? 'Uploading...' : 'Save New Picture' }}
              </button>
              <p class="upload-hint">Maximum size: 5MB</p>
            </div>
          </div>
        </div>

        <div class="form-section">
          <h4>Profile Information</h4>
          
          <div class="form-group">
            <label>Full Name</label>
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
            >
          </div>

          <div class="form-group">
            <label>Role</label>
            <input 
              type="text" 
              :value="user?.role?.name || 'User'" 
              disabled
            >
          </div>
        </div>

        <div class="form-section">
          <h4>Change Password</h4>
          
          <div class="form-group">
            <label>Current Password</label>
            <input 
              type="password" 
              v-model="formData.current_password"
              placeholder="Enter current password"
            >
          </div>

          <div class="form-group">
            <label>New Password</label>
            <input 
              type="password" 
              v-model="formData.new_password"
              @input="handlePasswordInput(formData.new_password)"
              placeholder="Enter new password"
              minlength="8"
            >
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
            <label>Confirm New Password</label>
            <input 
              type="password" 
              v-model="formData.confirm_password"
              placeholder="Confirm new password"
            >
          </div>
        </div>

        <div class="form-actions">
          <div v-if="message" class="success-message">{{ message }}</div>
          <div v-if="error" class="error-message">{{ error }}</div>
          
          <button 
            type="submit" 
            class="submit-button" 
            :disabled="loading || !hasChanges"
          >
            {{ loading ? 'Saving...' : hasChanges ? 'Save Changes' : 'No Changes' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.settings-page {
  padding: var(--space-lg);
  max-width: 800px;
  margin: 0 auto;
}

.settings-header {
  margin-bottom: var(--space-xl);
  padding: 0;
}

.settings-header h3 {
  font-family: var(--font-display);
  font-size: 30px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--text);
  margin-bottom: var(--space-xs);
}

.settings-description {
  color: var(--muted);
  font-size: 15px;
  line-height: 1.6;
}

.settings-content {
  background: var(--surface);
  border-radius: 20px;
  border: 1px solid var(--o08);
  padding: var(--space-xl);
}

.settings-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-xl);
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.form-section h4 {
  font-family: var(--font-display);
  font-size: 17px;
  font-weight: 600;
  color: var(--text);
  margin-bottom: var(--space-sm);
  padding-bottom: var(--space-sm);
  border-bottom: 1px solid var(--o07);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.form-group label {
  font-size: 13.5px;
  font-weight: 500;
  color: var(--text3);
  margin-bottom: 6px;
}

.form-group input {
  padding: 12px var(--space-md);
  border: 1px solid var(--o12);
  border-radius: 12px;
  background: var(--bg);
  color: var(--text);
  font-family: var(--font-sans);
  font-size: 14px;
  transition: all 0.2s ease;
}

.form-group input:disabled {
  background: var(--o04);
  color: var(--muted);
  cursor: not-allowed;
}

.form-group input:focus {
  border-color: var(--accent-ink);
  outline: none;
  box-shadow: var(--ring-focus);
}

.form-actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  align-items: flex-start;
}

.submit-button {
  padding: var(--space-sm) var(--space-xl);
  background: var(--accent-ink);
  color: var(--on-accent);
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.submit-button:hover {
  filter: brightness(1.08);
}

.submit-button:disabled {
  background: var(--o10);
  color: var(--muted);
  cursor: not-allowed;
}

.success-message {
  color: var(--success-color);
  font-size: 0.875rem;
}

.error-message {
  color: var(--error-color);
  font-size: 0.875rem;
}

@media (max-width: 768px) {
  .settings-page {
    padding: var(--space-md);
  }

  .settings-header {
    padding: var(--space-lg);
  }

  .settings-header h3 {
    font-size: 1.5rem;
  }

  .settings-content {
    padding: var(--space-lg);
  }
}

.header-content {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.back-button {
  background: var(--o05);
  border: 1px solid var(--o10);
  color: var(--muted);
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-xs) var(--space-sm);
  border-radius: 8px;
  transition: all 0.2s ease;
}

.back-button:hover {
  background: var(--o10);
  color: var(--text);
}

.password-strength {
  margin-top: var(--space-sm);
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

.profile-section {
  display: flex;
  justify-content: center;
  padding: var(--space-xl) 0;
  border-bottom: 1px solid var(--border-color);
}

.profile-pic-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-md);
}

.profile-pic-wrapper {
  position: relative;
  width: 150px;
  height: 150px;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  border: 3px solid var(--primary-soft);
  transition: all 0.3s ease;
}

.profile-pic-wrapper:hover .profile-pic-overlay {
  opacity: 1;
}

.profile-pic {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: all 0.3s ease;
}

.profile-pic-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  opacity: 0;
  transition: all 0.3s ease;
}

.profile-pic-overlay i {
  font-size: 1.5rem;
  margin-bottom: var(--space-xs);
}

.profile-pic-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-xs);
}

.file-input {
  opacity: 0;
  width: 0;
  height: 0;
  cursor: pointer;
  position: absolute;
}

.upload-button {
  padding: var(--space-xs) var(--space-md);
  background: var(--primary-color);
  color: var(--on-accent);
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.upload-button:disabled {
  background: var(--background-mute);
  cursor: not-allowed;
}

.upload-hint {
  font-size: var(--text-sm);
  color: var(--text-muted);
  margin: 0;
}
</style> 