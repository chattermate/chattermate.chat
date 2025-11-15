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
import { useEnterpriseFeatures } from '@/composables/useEnterpriseFeatures'
import { useForgotPassword } from '@/composables/useForgotPassword'
import api from '@/services/api'
import type { AxiosError } from 'axios'

interface ErrorResponse {
    detail: string
}

const router = useRouter()
const email = ref('')
const password = ref('')
const error = ref('')
const isLoading = ref(false)

// Check if enterprise module is available
const { hasEnterpriseModule } = useEnterpriseFeatures()

// Forgot password composable - only initialize if enterprise module is available
const showForgotPasswordModal = ref(false)
const forgotPassword = hasEnterpriseModule ? useForgotPassword() : null

// Destructure with fallbacks for when enterprise module is not available
const isForgotPasswordLoading = forgotPassword?.isLoading ?? ref(false)
const forgotPasswordError = forgotPassword?.error ?? ref('')
const forgotPasswordSuccess = forgotPassword?.success ?? ref('')
const forgotPasswordStep = forgotPassword?.currentStep ?? ref(1)
const forgotPasswordEmail = forgotPassword?.email ?? ref('')
const forgotPasswordOtp = forgotPassword?.otp ?? ref('')
const newPassword = forgotPassword?.newPassword ?? ref('')
const confirmPassword = forgotPassword?.confirmPassword ?? ref('')
const passwordValidation = forgotPassword?.passwordValidation ?? ref({
    score: 0,
    hasMinLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false
})
const requestPasswordReset = forgotPassword?.requestPasswordReset ?? (() => Promise.resolve(false))
const verifyAndResetPassword = forgotPassword?.verifyAndResetPassword ?? (() => Promise.resolve(false))
const resetForgotPasswordForm = forgotPassword?.resetForm ?? (() => {})
const goBackToEmailStep = forgotPassword?.goBackToEmailStep ?? (() => {})

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

        // Check if this is Shopify flow (new managed installation)
        const urlParams = new URLSearchParams(window.location.search)
        const isShopifyFlow = urlParams.get('shopify_flow') === '1'
        const shopId = urlParams.get('shop_id')
        const returnTo = urlParams.get('return_to')

        if (isShopifyFlow && shopId) {
            console.log('🔗 Shopify flow detected, linking organization')

            try {


                // If return_to is specified, redirect there
                if (returnTo) {
                    console.log('📍 Redirecting to return_to:', returnTo)
                    window.location.href = returnTo
                    return
                }
            } catch (linkError: any) {
                console.error('❌ Failed to link organization:', linkError)
                error.value = linkError.response?.data?.detail || 'Failed to link organization'
                isLoading.value = false
                return
            }
        }
        
        // Check if this is an OLD embedded Shopify login (opened in popup) - for backward compatibility
        const isEmbedded = router.currentRoute.value.query.embedded === 'true'
        const legacyShopId = router.currentRoute.value.query.shop_id as string
        
        if (isEmbedded && legacyShopId && window.opener) {
            // This is a popup for Shopify embedded app (old flow)
            console.log('Login successful in popup, notifying parent window')
            
            // Show success state
            isLoading.value = true
            error.value = ''
            
            // Notify the parent window of successful login
            if (window.opener && !window.opener.closed) {
                window.opener.postMessage(
                    { type: 'login_success', shop_id: legacyShopId },
                    window.location.origin
                )
                
                // Close the popup after a brief delay to ensure message is sent
                setTimeout(() => {
                    window.close()
                }, 300)
            } else {
                // If opener is gone, just close the window
                setTimeout(() => {
                    window.close()
                }, 300)
            }
            
            return
        }
       
        // Check for Shopify flow (new simplified flow)
        if (router.currentRoute.value.query.shopify_flow === '1') {
            const shop = router.currentRoute.value.query.shop as string
            const shopId = router.currentRoute.value.query.shop_id as string
            const host = router.currentRoute.value.query.host as string
            const returnTo = router.currentRoute.value.query.return_to as string

            // Redirect to auth complete page
            const query: any = { shop, shop_id: shopId, host }
            if (returnTo) {
                query.return_to = returnTo
            }

            router.push({
                path: '/shopify/auth-complete',
                query
            })
            return
        }
       
        // Check if there's a Shopify redirect pending in localStorage (legacy flow)
        const shopifyRedirectData = localStorage.getItem('shopifyRedirect')
        if (shopifyRedirectData) {
            try {
                const redirectInfo = JSON.parse(shopifyRedirectData)
                // Clear the stored redirect
                localStorage.removeItem('shopifyRedirect')
                
                // Build the full URL with all query parameters
                const queryParams = new URLSearchParams()
                for (const [key, value] of Object.entries(redirectInfo)) {
                    queryParams.append(key, value as string)
                }
                
                // Redirect to the backend Shopify auth endpoint
                window.location.href = `${import.meta.env.VITE_API_URL}/shopify/auth?${queryParams.toString()}`
                return // Don't do the normal navigation
            } catch (e) {
                console.error('Failed to parse shopifyRedirect data:', e)
                // Clear invalid data
                localStorage.removeItem('shopifyRedirect')
            }
        }

        // Check for redirect query parameter
        const redirectUrl = router.currentRoute.value.query.redirect as string
        if (redirectUrl) {
            window.location.href = `${import.meta.env.VITE_API_URL}${redirectUrl}`
            return
        }

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

const navigateToSignup = () => {
    // Preserve embedded, shop_id, and return_to query params if present
    const isEmbedded = router.currentRoute.value.query.embedded
    const shopId = router.currentRoute.value.query.shop_id
    const returnTo = router.currentRoute.value.query.return_to
    const shopifyFlow = router.currentRoute.value.query.shopify_flow

    const query: any = {}

    if (isEmbedded) query.embedded = isEmbedded
    if (shopId) query.shop_id = shopId
    if (returnTo) query.return_to = returnTo
    if (shopifyFlow) query.shopify_flow = shopifyFlow

    if (Object.keys(query).length > 0) {
        console.log('Navigating to signup with params:', query)
        router.push({
            path: '/signup',
            query
        })
    } else {
        router.push('/signup')
    }
}

const openForgotPasswordModal = () => {
    resetForgotPasswordForm()
    showForgotPasswordModal.value = true
}

const closeForgotPasswordModal = () => {
    showForgotPasswordModal.value = false
    resetForgotPasswordForm()
}

const handleRequestPasswordReset = async () => {
    const success = await requestPasswordReset()
    // Keep modal open to proceed to step 2
}

const handleVerifyAndResetPassword = async () => {
    const success = await verifyAndResetPassword()
    if (success) {
        // Wait a moment to show success message, then close modal
        setTimeout(() => {
            closeForgotPasswordModal()
            // Optionally pre-fill the email in login form
            email.value = forgotPasswordEmail.value
        }, 2000)
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
                            <div v-if="hasEnterpriseModule" class="forgot-password-link-wrapper">
                                <a href="#" @click.prevent="openForgotPasswordModal" class="forgot-password-link">Forgot Password?</a>
                            </div>
                        </div>

                        <div v-if="error" class="error-message" role="alert">
                            {{ error }}
                        </div>

                        <button type="submit" class="submit-btn" :disabled="isLoading">
                            <span v-if="isLoading">{{ router.currentRoute.value.query.embedded === 'true' ? 'Connecting...' : 'Signing in...' }}</span>
                            <span v-else>Sign In</span>
                        </button>
                        
                        <div v-if="hasEnterpriseModule" class="signup-link-container">
                            <p>Don't have an account? <a href="#" @click.prevent="navigateToSignup" class="signup-link">Sign up</a></p>
                        </div>
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

        <!-- Forgot Password Modal - only show if enterprise module is available -->
        <div v-if="hasEnterpriseModule && showForgotPasswordModal" class="modal-overlay">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>{{ forgotPasswordStep === 1 ? 'Reset Password' : 'Verify & Reset' }}</h2>
                    <button class="close-btn" @click="closeForgotPasswordModal" aria-label="Close">×</button>
                </div>

                <div class="modal-body">
                    <!-- Step 1: Request OTP -->
                    <div v-if="forgotPasswordStep === 1" class="forgot-password-step">
                        <p class="step-description">Enter your email address and we'll send you a verification code to reset your password.</p>
                        
                        <div class="form-group">
                            <label for="forgot-email">Email Address</label>
                            <div class="input-wrapper">
                                <input 
                                    id="forgot-email" 
                                    v-model="forgotPasswordEmail" 
                                    type="email" 
                                    required 
                                    placeholder="Enter your email"
                                    :disabled="isForgotPasswordLoading"
                                />
                            </div>
                        </div>

                        <div v-if="forgotPasswordError" class="error-message" role="alert">
                            {{ forgotPasswordError }}
                        </div>

                        <div v-if="forgotPasswordSuccess" class="success-message" role="status">
                            {{ forgotPasswordSuccess }}
                        </div>

                        <button 
                            class="modal-submit-btn" 
                            @click="handleRequestPasswordReset"
                            :disabled="isForgotPasswordLoading || !forgotPasswordEmail"
                        >
                            {{ isForgotPasswordLoading ? 'Sending...' : 'Send Verification Code' }}
                        </button>
                    </div>

                    <!-- Step 2: Verify OTP and Reset Password -->
                    <div v-if="forgotPasswordStep === 2" class="forgot-password-step">
                        <p class="step-description">Enter the verification code sent to your email and your new password.</p>
                        
                        <div class="form-group">
                            <label for="forgot-otp">Verification Code</label>
                            <div class="input-wrapper">
                                <input 
                                    id="forgot-otp" 
                                    v-model="forgotPasswordOtp" 
                                    type="text" 
                                    required 
                                    placeholder="Enter 6-digit code"
                                    maxlength="6"
                                    :disabled="isForgotPasswordLoading"
                                />
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="new-password">New Password</label>
                            <div class="input-wrapper">
                                <input 
                                    id="new-password" 
                                    v-model="newPassword" 
                                    type="password" 
                                    required 
                                    placeholder="Enter new password"
                                    :disabled="isForgotPasswordLoading"
                                />
                            </div>
                            <div class="password-requirements">
                                <p class="requirements-title">Password must include:</p>
                                <ul>
                                    <li :class="{ valid: passwordValidation.hasMinLength }">At least 8 characters</li>
                                    <li :class="{ valid: passwordValidation.hasUpperCase }">Contains an uppercase letter</li>
                                    <li :class="{ valid: passwordValidation.hasLowerCase }">Contains a lowercase letter</li>
                                    <li :class="{ valid: passwordValidation.hasNumber }">Contains a number</li>
                                    <li :class="{ valid: passwordValidation.hasSpecialChar }">Contains a special character (!@#$%^&*)</li>
                                </ul>
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="confirm-password">Confirm Password</label>
                            <div class="input-wrapper">
                                <input 
                                    id="confirm-password" 
                                    v-model="confirmPassword" 
                                    type="password" 
                                    required 
                                    placeholder="Confirm new password"
                                    :disabled="isForgotPasswordLoading"
                                />
                            </div>
                        </div>

                        <div v-if="forgotPasswordError" class="error-message" role="alert">
                            {{ forgotPasswordError }}
                        </div>

                        <div v-if="forgotPasswordSuccess" class="success-message" role="status">
                            {{ forgotPasswordSuccess }}
                        </div>

                        <div class="modal-actions">
                            <button 
                                class="modal-back-btn" 
                                @click="goBackToEmailStep"
                                :disabled="isForgotPasswordLoading"
                            >
                                Back
                            </button>
                            <button 
                                class="modal-submit-btn" 
                                @click="handleVerifyAndResetPassword"
                                :disabled="isForgotPasswordLoading || !forgotPasswordOtp || !newPassword || !confirmPassword"
                            >
                                {{ isForgotPasswordLoading ? 'Resetting...' : 'Reset Password' }}
                            </button>
                        </div>
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

.signup-link-container {
    text-align: center;
    margin-top: 1rem;
    font-size: 0.875rem;
    color: var(--text-secondary);
}

.signup-link {
    color: var(--primary-color);
    font-weight: 500;
    text-decoration: none;
    transition: var(--transition-fast);
}

.signup-link:hover {
    color: var(--accent-color);
    text-decoration: underline;
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

/* Forgot Password Link */
.forgot-password-link-wrapper {
    margin-top: 0.5rem;
    text-align: right;
}

.forgot-password-link {
    color: var(--primary-color);
    font-size: 0.875rem;
    text-decoration: none;
    transition: var(--transition-fast);
}

.forgot-password-link:hover {
    color: var(--accent-color);
    text-decoration: underline;
}

/* Modal Overlay */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1rem;
}

.modal-content {
    background: var(--background-color);
    border-radius: var(--radius-lg);
    width: 100%;
    max-width: 500px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid var(--border-color);
}

.modal-header h2 {
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0;
    color: var(--text-primary);
}

.close-btn {
    background: none;
    border: none;
    font-size: 2rem;
    color: var(--text-muted);
    cursor: pointer;
    padding: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-md);
    transition: var(--transition-fast);
}

.close-btn:hover {
    background: var(--background-soft);
    color: var(--text-primary);
}

.modal-body {
    padding: 1.5rem;
}

.forgot-password-step {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
}

.step-description {
    color: var(--text-secondary);
    margin: 0;
    line-height: 1.5;
}

.success-message {
    color: var(--success-color, #10b981);
    text-align: center;
    padding: 0.75rem;
    background: rgba(16, 185, 129, 0.1);
    border-radius: var(--radius-md);
    font-size: 0.875rem;
    margin: 0;
}

/* Password requirements styling matching signup */
.password-requirements {
    margin-top: 0.5rem;
}

.password-requirements .requirements-title {
    margin: 0 0 0.25rem 0;
    font-size: 0.75rem;
    color: var(--text-muted);
}

.password-requirements ul {
    margin: 0;
    padding-left: 1rem;
}

.password-requirements li {
    font-size: 0.8125rem;
    color: var(--text-secondary);
    margin: 0.125rem 0;
}

.password-requirements li.valid {
    color: var(--success-color, #10b981);
}

.modal-submit-btn {
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

.modal-submit-btn:hover:not(:disabled) {
    background: var(--accent-color);
}

.modal-submit-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.modal-actions {
    display: flex;
    gap: 1rem;
    margin-top: 1rem;
}

.modal-back-btn {
    flex: 1;
    padding: 0.75rem;
    background: var(--background-soft);
    color: var(--text-primary);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    transition: var(--transition-fast);
}

.modal-back-btn:hover:not(:disabled) {
    background: var(--background-color);
    border-color: var(--text-muted);
}

.modal-back-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

@media (max-width: 640px) {
    .modal-content {
        max-width: 100%;
        margin: 1rem;
    }
    
    .modal-header {
        padding: 1rem;
    }
    
    .modal-body {
        padding: 1rem;
    }
}
</style>