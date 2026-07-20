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
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { authService } from '@/services/auth'
import { permissionChecks } from '@/utils/permissions'
import { useEnterpriseFeatures } from '@/composables/useEnterpriseFeatures'
import { useForgotPassword } from '@/composables/useForgotPassword'
import InstallPrompt from '@/components/pwa/InstallPrompt.vue'
import api from '@/services/api'
import type { AxiosError } from 'axios'
interface ErrorResponse {
    detail: string
}

const router = useRouter()
const { loadModule } = useEnterpriseFeatures()

const trackLogin = async (method: string) => {
  const mod = await loadModule('/src/modules/enterprise/utils/analytics.ts') as any
  mod?.trackLogin?.(method)
}
const email = ref('')
const password = ref('')
const error = ref('')
const isLoading = ref(false)

// Check if enterprise module is available
const { hasEnterpriseModule } = useEnterpriseFeatures()

// Forgot password composable - only initialize if enterprise module is available
const showForgotPasswordModal = ref(false)
const forgotPassword = hasEnterpriseModule ? useForgotPassword() : null

// Check for pending Slack installation from marketplace
const pendingSlackTeam = computed(() => router.currentRoute.value.query.slack_team as string || null)
const hasPendingSlackInstall = computed(() => !!router.currentRoute.value.query.slack_install)

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

        trackLogin('email')

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

        // Check for Slack marketplace installation pending
        const slackInstallKey = router.currentRoute.value.query.slack_install as string
        if (slackInstallKey) {
            console.log('🔗 Slack marketplace installation detected, completing install...')
            try {
                const response = await api.post(`/slack/complete-install?install_key=${slackInstallKey}`)
                console.log('✅ Slack installation completed:', response.data)
                // Redirect to integrations with success
                router.push('/settings/integrations?status=success&integration=slack')
                return
            } catch (slackError: any) {
                console.error('❌ Failed to complete Slack installation:', slackError)
                const errorMsg = slackError.response?.data?.detail || 'Failed to complete Slack installation'
                router.push(`/settings/integrations?status=failure&reason=${encodeURIComponent(errorMsg)}`)
                return
            }
        }

        // Check for redirect query parameter (internal frontend route)
        const redirectPath = router.currentRoute.value.query.redirect as string
        if (redirectPath) {
            // If it's an internal route (starts with /), use router.push
            if (redirectPath.startsWith('/')) {
                router.push(redirectPath)
                return
            }
            // Otherwise treat as API redirect (legacy behavior)
            window.location.href = `${import.meta.env.VITE_API_URL}${redirectPath}`
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
    // Preserve embedded, shop_id, return_to, redirect, slack_install query params if present
    const isEmbedded = router.currentRoute.value.query.embedded
    const shopId = router.currentRoute.value.query.shop_id
    const returnTo = router.currentRoute.value.query.return_to
    const shopifyFlow = router.currentRoute.value.query.shopify_flow
    const redirect = router.currentRoute.value.query.redirect
    const slackInstall = router.currentRoute.value.query.slack_install
    const slackTeam = router.currentRoute.value.query.slack_team

    const query: any = {}

    if (isEmbedded) query.embedded = isEmbedded
    if (shopId) query.shop_id = shopId
    if (returnTo) query.return_to = returnTo
    if (shopifyFlow) query.shopify_flow = shopifyFlow
    if (redirect) query.redirect = redirect
    if (slackInstall) query.slack_install = slackInstall
    if (slackTeam) query.slack_team = slackTeam

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
    <div class="auth-page">
        <!-- Left: form panel -->
        <div class="form-panel">
            <!-- Logo mark -->
            <div class="auth-logo">
                <div class="logo-mark">
                    <div class="dot"></div>
                    <div class="dot"></div>
                    <div class="dot"></div>
                </div>
                <span class="logo-word">ChatterMate</span>
            </div>

            <h1 class="auth-title">Welcome back</h1>
            <p class="auth-sub">Sign in to continue to your dashboard</p>

            <!-- Slack Installation Banner -->
            <div v-if="hasPendingSlackInstall" class="slack-banner">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="var(--accent-ink)">
                    <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/>
                </svg>
                <div>
                    <strong>Connect Slack Workspace</strong>
                    <span v-if="pendingSlackTeam"> — connect <em>{{ pendingSlackTeam }}</em></span>
                    <span v-else> — complete your Slack installation</span>
                </div>
            </div>

            <form @submit.prevent="handleLogin" class="auth-form">
                <div class="field">
                    <label for="email">Email</label>
                    <input id="email" v-model="email" type="email" required placeholder="you@company.com" autocomplete="email" />
                </div>

                <div class="field">
                    <label for="password">Password</label>
                    <input id="password" v-model="password" type="password" required placeholder="••••••••" autocomplete="current-password" />
                    <a v-if="hasEnterpriseModule" href="#" @click.prevent="openForgotPasswordModal" class="forgot-link">Forgot password?</a>
                </div>

                <div v-if="error" class="auth-error" role="alert">{{ error }}</div>

                <button type="submit" class="auth-submit" :disabled="isLoading">
                    <span v-if="isLoading">{{ router.currentRoute.value.query.embedded === 'true' ? 'Connecting…' : 'Signing in…' }}</span>
                    <span v-else>Sign In</span>
                </button>

                <p v-if="hasEnterpriseModule" class="signup-prompt">
                    Don't have an account?
                    <a href="#" @click.prevent="navigateToSignup" class="signup-link">Sign up</a>
                </p>
            </form>

            <div class="install-hint-slot">
                <InstallPrompt />
            </div>
        </div>

        <!-- Right: brand panel with aurora -->
        <div class="brand-panel">
            <div class="aurora-blob blob-lime"></div>
            <div class="aurora-blob blob-purple"></div>
            <div class="aurora-blob blob-teal"></div>

            <div class="brand-copy">
                <!-- Siri orb -->
                <div class="orb">
                    <div class="orb-glow"></div>
                    <div class="orb-gradient"></div>
                    <div class="orb-core"></div>
                    <div class="orb-ring"></div>
                </div>

                <div class="brand-badge">
                    <span class="badge-dot"></span>
                    open source · MCP-native
                </div>

                <h2>Support that <em>learns itself.</em></h2>
                <p class="brand-lede">Reads your knowledge base, answers in any chat design, hands off to humans, and even answers other AI agents over open MCP.</p>

                <ul class="feature-list">
                    <li><span class="check">✓</span> Auto-learning knowledge base — drop a PDF or URL</li>
                    <li><span class="check">✓</span> Human handoff with full context</li>
                    <li><span class="check">✓</span> Self-host or cloud — bring your own models</li>
                </ul>
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
/* Auth page is always dark — do not inherit app theme */
.auth-page {
    min-height: 100vh;
    display: grid;
    grid-template-columns: 1.02fr .98fr;
    background: var(--bg);
    color: var(--text);
    font-family: var(--font-sans);
}

/* ── Form panel ── */
.form-panel {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 60px 56px;
    background: var(--bg);
    min-height: 100vh;
    min-height: 100dvh;
}

/* Install hint (design: dashed card under the form) — mobile only */
.install-hint-slot {
    display: none;
    margin-top: var(--space-lg);
    padding-bottom: var(--safe-bottom);
}

@media (max-width: 768px) {
    .install-hint-slot {
        display: block;
    }
}

.auth-logo {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 44px;
}

.logo-mark {
    width: 32px;
    height: 32px;
    background: var(--accent-solid);
    border-radius: 10px 10px 10px 2px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 3.5px;
    flex-shrink: 0;
}

.dot {
    width: 4.5px;
    height: 4.5px;
    background: var(--on-accent);
    border-radius: 50%;
}

.logo-word {
    font-family: var(--font-display);
    font-weight: 700;
    font-size: 18px;
    letter-spacing: -0.01em;
    color: var(--text);
}

.auth-title {
    font-family: var(--font-display);
    font-size: 40px;
    font-weight: 700;
    letter-spacing: -0.03em;
    color: var(--text);
    margin-bottom: 10px;
    line-height: 1.1;
}

.auth-sub {
    color: var(--muted);
    font-size: 15px;
    margin-bottom: 36px;
}

/* Slack banner */
.slack-banner {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 16px;
    background: color-mix(in srgb, var(--accent-solid) 6%, transparent);
    border: 1px solid color-mix(in srgb, var(--accent-ink) 20%, transparent);
    border-radius: 10px;
    margin-bottom: 24px;
    font-size: 13.5px;
    color: var(--text3);
}

.slack-banner strong { color: var(--text); }
.slack-banner em { color: var(--accent-ink); font-style: normal; }

/* Form */
.auth-form {
    display: flex;
    flex-direction: column;
    gap: 20px;
    max-width: 400px;
}

.field {
    display: flex;
    flex-direction: column;
    gap: 9px;
}

.field-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.field label {
    font-size: 13.5px;
    font-weight: 500;
    color: var(--text3);
}

.field input {
    width: 100%;
    padding: 14px 16px;
    background: var(--o04);
    border: 1px solid var(--o12);
    border-radius: 12px;
    color: var(--text);
    font-family: var(--font-sans);
    font-size: 15px;
    transition: border-color 0.18s, box-shadow 0.18s;
}

.field input::placeholder { color: var(--faint); }

.field input:focus {
    outline: none;
    border-color: var(--accent-ink);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent-ink) 15%, transparent);
}

.field input:-webkit-autofill,
.field input:-webkit-autofill:hover,
.field input:-webkit-autofill:focus {
    -webkit-box-shadow: 0 0 0 1000px var(--bg2) inset !important;
    -webkit-text-fill-color: var(--text) !important;
    caret-color: var(--text);
    border: 1px solid var(--o12) !important;
    transition: background-color 9999s ease-in-out 0s;
}

.forgot-link {
    align-self: flex-end;
    margin-top: 2px;
    font-size: 13px;
    color: var(--accent-ink);
    text-decoration: none;
}
.forgot-link:hover { text-decoration: underline; }

.auth-error {
    color: var(--c-coral);
    background: color-mix(in srgb, var(--c-coral) 10%, transparent);
    border: 1px solid color-mix(in srgb, var(--c-coral) 20%, transparent);
    border-radius: 10px;
    padding: 10px 14px;
    font-size: 13.5px;
}

.auth-submit {
    width: 100%;
    padding: 15px;
    background: var(--accent-solid);
    color: var(--on-accent-solid);
    border: none;
    border-radius: 12px;
    font-family: var(--font-sans);
    font-weight: 600;
    font-size: 15px;
    cursor: pointer;
    transition: opacity 0.18s;
}

.auth-submit:hover:not(:disabled) { opacity: 0.88; }
.auth-submit:disabled { opacity: 0.45; cursor: not-allowed; }

.signup-prompt {
    text-align: center;
    font-size: 14px;
    color: var(--muted2);
}

.signup-link {
    color: var(--accent-ink);
    text-decoration: none;
    font-weight: 500;
}
.signup-link:hover { text-decoration: underline; }

/* ── Brand panel ── */
.brand-panel {
    position: relative;
    background: linear-gradient(160deg, var(--bg-elevated), var(--bg-deep));
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 56px 6vw;
    min-height: 100vh;
    border-left: 1px solid var(--o06);
}

/* Aurora blobs */
.aurora-blob {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    animation: cm-aurora 14s ease-in-out infinite;
}

.blob-lime {
    width: 420px;
    height: 420px;
    background: radial-gradient(circle, color-mix(in srgb, var(--accent-solid) 32%, transparent), color-mix(in srgb, var(--accent-solid) 6%, transparent));
    top: -80px;
    right: -60px;
    animation-duration: 16s;
}

.blob-purple {
    width: 360px;
    height: 360px;
    background: radial-gradient(circle, color-mix(in srgb, var(--c-purple) 28%, transparent), color-mix(in srgb, var(--c-purple) 4%, transparent));
    top: 20%;
    left: -80px;
    animation-duration: 20s;
    animation-delay: -5s;
}

.blob-teal {
    width: 300px;
    height: 300px;
    background: radial-gradient(circle, color-mix(in srgb, var(--c-teal) 22%, transparent), color-mix(in srgb, var(--c-teal) 3%, transparent));
    bottom: 15%;
    right: 10%;
    animation-duration: 18s;
    animation-delay: -9s;
}

/* Brand copy */
.brand-copy {
    position: relative;
    z-index: 1;
    max-width: 460px;
}

/* Siri orb */
.orb {
    position: relative;
    width: 120px;
    height: 120px;
    margin-bottom: 38px;
    animation: cm-float 7s ease-in-out infinite;
}

.orb-glow {
    position: absolute;
    inset: -36px;
    border-radius: 50%;
    background: radial-gradient(circle, color-mix(in srgb, var(--accent-solid) 20%, transparent), transparent 70%);
    filter: blur(10px);
}

.orb-gradient {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: conic-gradient(from 0deg, var(--accent-solid), var(--c-purple), var(--c-teal), var(--c-coral), var(--accent-solid));
    filter: blur(6px);
    animation: cm-spin 6s linear infinite;
}

.orb-core {
    position: absolute;
    inset: 24px;
    border-radius: 50%;
    background: radial-gradient(circle at 40% 35%, color-mix(in srgb, var(--text) 92%, transparent), color-mix(in srgb, var(--text) 12%, transparent) 55%, transparent 72%);
    animation: cm-pulse 2.6s ease-in-out infinite;
}

.orb-ring {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    box-shadow: inset 0 0 26px color-mix(in srgb, var(--bg-deep) 55%, transparent);
}

/* Badge pill */
.brand-badge {
    display: inline-flex;
    align-items: center;
    gap: 9px;
    padding: 7px 14px;
    border: 1px solid var(--o12);
    border-radius: 999px;
    background: var(--o03);
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--text3);
    margin-bottom: 26px;
}

.badge-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--accent-solid);
    box-shadow: 0 0 10px var(--accent-ink);
    animation: cm-pulse 2.6s ease-in-out infinite;
}

.brand-copy h2 {
    font-family: var(--font-display);
    font-size: 42px;
    font-weight: 700;
    letter-spacing: -0.03em;
    color: var(--text);
    line-height: 1.06;
    margin: 0 0 18px;
}

.brand-copy h2 em {
    font-style: normal;
    color: var(--accent-ink);
}

.brand-lede {
    font-size: 17px;
    line-height: 1.6;
    color: var(--muted);
    margin: 0 0 30px;
}

.feature-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 14px;
}

.feature-list li {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 15px;
    color: var(--text3);
}

.check {
    color: var(--accent-ink);
    font-weight: 700;
    font-size: 14px;
}

/* ── Responsive ── */
@media (max-width: 1024px) {
    .auth-page { grid-template-columns: 1fr; }
    .brand-panel { display: none; }
}

@media (max-width: 600px) {
    .form-panel { padding: 40px 28px; }
    .auth-title { font-size: 30px; }
}

/* Modal Overlay */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(5,6,9,.7);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1rem;
}

.modal-content {
    background: var(--surface);
    border: 1px solid var(--o10);
    border-radius: 20px;
    width: 100%;
    max-width: 500px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 20px 50px rgba(0,0,0,.5);
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid var(--o08);
}

.modal-header h2 {
    font-family: var(--font-display);
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0;
    color: var(--text);
}

.close-btn {
    background: none;
    border: 1px solid var(--o12);
    border-radius: 8px;
    font-size: 1.5rem;
    color: var(--muted2);
    cursor: pointer;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: 0.18s;
}

.close-btn:hover {
    background: var(--o06);
    color: var(--text);
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
    color: var(--muted);
    margin: 0;
    line-height: 1.5;
    font-size: 14px;
}

.success-message {
    color: #0f9d6e;
    text-align: center;
    padding: 0.75rem;
    background: rgba(15,157,110,.1);
    border-radius: 10px;
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
    color: var(--muted2);
}

.password-requirements ul {
    margin: 0;
    padding-left: 1rem;
}

.password-requirements li {
    font-size: 0.8125rem;
    color: var(--muted);
    margin: 0.125rem 0;
}

.password-requirements li.valid {
    color: var(--success-color, #10b981);
}

/* Modal uses the same dark form-field style as the auth form */
.form-group { margin-bottom: 0; }

.form-group label {
    display: block;
    margin-bottom: 9px;
    font-size: 13.5px;
    font-weight: 500;
    color: var(--text3);
}

.input-wrapper input {
    width: 100%;
    padding: 13px 15px;
    background: var(--o04);
    border: 1px solid var(--o12);
    border-radius: 12px;
    color: var(--text);
    font-family: var(--font-sans);
    font-size: 14px;
    transition: border-color 0.18s, box-shadow 0.18s;
}

.input-wrapper input::placeholder { color: var(--faint); }
.input-wrapper input:focus {
    outline: none;
    border-color: var(--accent-ink);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent-ink) 15%, transparent);
}
.input-wrapper input:disabled { opacity: 0.5; cursor: not-allowed; }

.error-message {
    color: var(--c-coral);
    background: color-mix(in srgb, var(--c-coral) 10%, transparent);
    border: 1px solid color-mix(in srgb, var(--c-coral) 20%, transparent);
    border-radius: 10px;
    padding: 10px 14px;
    font-size: 13.5px;
}

.modal-submit-btn {
    width: 100%;
    padding: 13px;
    background: var(--accent-solid);
    color: var(--on-accent-solid);
    border: none;
    border-radius: 12px;
    font-family: var(--font-sans);
    font-weight: 600;
    font-size: 15px;
    cursor: pointer;
    transition: opacity 0.18s;
}

.modal-submit-btn:hover:not(:disabled) { opacity: 0.88; }
.modal-submit-btn:disabled { opacity: 0.45; cursor: not-allowed; }

.modal-actions {
    display: flex;
    gap: 1rem;
    margin-top: 1rem;
}

.modal-back-btn {
    flex: 1;
    padding: 13px;
    background: var(--o06);
    color: var(--text3);
    border: 1px solid var(--o12);
    border-radius: 12px;
    font-family: var(--font-sans);
    font-weight: 600;
    font-size: 15px;
    cursor: pointer;
    transition: 0.18s;
}

.modal-back-btn:hover:not(:disabled) {
    background: var(--o10);
    color: var(--text);
}

.modal-back-btn:disabled { opacity: 0.5; cursor: not-allowed; }

@media (max-width: 640px) {
    .modal-content { max-width: 100%; margin: 1rem; }
    .modal-header, .modal-body { padding: 1rem; }
}
</style>