<!--
ChatterMate - Login View
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
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { authService } from '@/services/auth'
import { permissionChecks } from '@/utils/permissions'
import type { AxiosError } from 'axios'

interface ErrorResponse {
    detail: string
}

const router = useRouter()
const email = ref('')
const password = ref('')
const error = ref('')
const isLoading = ref(false)

const getInitialRoute = () => {
    // Check permissions in order of priority
    if (permissionChecks.canManageAgents()) {
        return '/ai-agents'
    }
    if (permissionChecks.canViewChats()) {
        return '/conversations'
    }
    if (permissionChecks.canManageUsers()) {
        return '/human-agents'
    }
    if (permissionChecks.canViewOrganization()) {
        return '/settings/organization'
    }
    if (permissionChecks.canViewAIConfig()) {
        return '/settings/ai-config'
    }
    // Default route if no specific permissions
    return '/403'
}

const handleLogin = async () => {
    try {
        isLoading.value = true
        error.value = ''

        await authService.login(email.value, password.value)
       

        // Determine initial route based on permissions
        const initialRoute = getInitialRoute()
        router.push(initialRoute)

    } catch (err) {
        console.log(err)
        const axiosError = err as AxiosError<ErrorResponse>
        error.value = axiosError.response?.data?.detail || 'Login failed'
        console.error('Login error:', err)
    } finally {
        isLoading.value = false
    }
}
</script>

<template>
    <div class="login-page">
        <div class="login-container">
            <div class="login-content">
                <!-- Login Form Container -->
                <div class="login-form-container">
                    <div class="logo-container">
                        <img src="@/assets/logo-signup.svg" alt="Logo" class="logo" />
                    </div>

                    <h1 class="title">Welcome Back</h1>
                    <p class="subtitle">Sign in to your account to continue</p>

                    <form @submit.prevent="handleLogin" class="login-form">
                        <div class="form-group">
                            <label for="email">Email</label>
                            <div class="input-wrapper">
                                <input id="email" v-model="email" type="email" required placeholder="Enter your email" />
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="password">Password</label>
                            <div class="input-wrapper">
                                <input id="password" v-model="password" type="password" required placeholder="Enter your password" />
                            </div>
                        </div>

                        <div v-if="error" class="error-message" role="alert">
                            {{ error }}
                        </div>

                        <button type="submit" class="submit-btn" :disabled="isLoading">
                            {{ isLoading ? 'Signing in...' : 'Sign In' }}
                        </button>
                    </form>
                </div>

                <!-- Illustration Container -->
                <div class="illustration-container">
                    <!-- Custom SVG Illustration -->
                    <svg class="background-illustration" viewBox="0 0 800 600" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <!-- Background Elements -->
                        <path d="M0 0 L800 0 L800 600 L0 600 Z" fill="#FEF2F2"/>
                        <path d="M600 100 Q 750 150 700 300 T 600 500 L 800 600 L 800 0 L 600 100Z" fill="#FEE2E2" opacity="0.5"/>
                        <path d="M650 150 Q 800 200 750 350 T 650 550 L 850 650 L 850 50 L 650 150Z" fill="#FECACA" opacity="0.3"/>
                        
                        <!-- Decorative Elements -->
                        <circle cx="600" cy="200" r="8" fill="#f34611" opacity="0.6"/>
                        <circle cx="650" cy="250" r="6" fill="#f34611" opacity="0.4"/>
                        <circle cx="700" cy="180" r="10" fill="#f34611" opacity="0.5"/>
                        <circle cx="580" cy="300" r="7" fill="#f34611" opacity="0.3"/>
                    </svg>

                    <div class="illustration-content">
                        <h2>Welcome to ChatterMate</h2>
                        <p>Access your AI-powered customer support dashboard and deliver exceptional service.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.login-page {
    min-height: 100vh;
    background: var(--background-soft);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
}

.login-container {
    width: 100%;
    max-width: 1200px;
    background: var(--background-color);
    border-radius: var(--radius-lg);
    overflow: hidden;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
}

.login-content {
    display: flex;
    width: 100%;
    background: white;
}

.login-form-container {
    flex: 1;
    padding: 3rem;
    max-width: 480px;
    background: white;
}

.logo-container {
    margin-bottom: 2rem;
    display: inline-block;
}

.logo {
    height: 40px;
    width: auto;
    display: block;
}

.title {
    font-size: 2.5rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: var(--text-primary);
}

.subtitle {
    color: var(--text-muted);
    margin-bottom: 2rem;
}

.login-form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.form-group {
    margin-bottom: 0;
}

.form-group label {
    display: block;
    margin-bottom: 0.5rem;
    color: var(--text-primary);
    font-weight: 500;
    font-size: 0.875rem;
}

.input-wrapper input {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    background: var(--background-color);
    font-size: 1rem;
    color: var(--text-primary);
    transition: var(--transition-fast);
}

.input-wrapper input:focus {
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(243, 70, 17, 0.1);
    outline: none;
}

.input-wrapper input::placeholder {
    color: var(--text-placeholder);
}

.error-message {
    color: var(--error-color);
    text-align: center;
    padding: 0.75rem;
    background: rgba(239, 68, 68, 0.1);
    border-radius: var(--radius-md);
    font-size: 0.875rem;
    margin: 0;
}

.submit-btn {
    width: 100%;
    padding: 0.75rem;
    background: var(--primary-color);
    color: var(--background-color);
    border: none;
    border-radius: var(--radius-md);
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    transition: var(--transition-fast);
}

.submit-btn:hover:not(:disabled) {
    background: var(--accent-color);
}

.submit-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}

.illustration-container {
    flex: 1.2;
    background: var(--background-soft);
    padding: 0;
    display: flex;
    align-items: flex-end;
    position: relative;
    overflow: hidden;
}

.background-illustration {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
}

.illustration-content {
    position: relative;
    z-index: 1;
    padding: 3rem;
    max-width: 400px;
    margin-top: auto;
    margin-bottom: 6rem;
    margin-left: 3rem;
    background: linear-gradient(to bottom, rgba(254, 242, 242, 0), rgba(254, 242, 242, 0.95) 20%);
    border-radius: 16px;
    backdrop-filter: blur(4px);
}

.illustration-content h2 {
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 1.5rem;
    color: var(--text-primary);
    line-height: 1.2;
}

.illustration-content p {
    font-size: 1.125rem;
    color: var(--text-secondary);
    line-height: 1.6;
    opacity: 0.9;
    max-width: 360px;
}

@media (max-width: 1024px) {
    .illustration-container {
        display: none;
    }
    
    .login-form-container {
        max-width: none;
    }
}

@media (max-width: 640px) {
    .login-page {
        padding: 1rem;
    }
    
    .login-form-container {
        padding: 2rem;
    }
    
    .login-container {
        border-radius: 16px;
    }
}
</style>