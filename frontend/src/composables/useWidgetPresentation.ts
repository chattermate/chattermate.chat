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

import { everyPageLabels } from '../webclient/quick-actions'
import { helpCenterLink } from '../webclient/help-center-link'
import { computed, ref, type Ref } from 'vue'
import type { AgentCustomization } from '../types/agent'
import type { HumanAgent } from '../types/widget'
import { resolveOrbStyle } from '../utils/orb'
import { shouldShowAiDisclaimer } from '../utils/aiDisclaimer'
import { presenceLine, PRESENCE_TEXT } from '../utils/widgetPresence'
import { resolveWidgetUploadUrl } from '../webclient/widget-env'
import { themeCssVars } from '../webclient/widget-theme'
import { widgetUiVersion } from '../webclient/widget-ui'
import { PANEL_PRESENCE_TEXT } from '../webclient/copy'

export interface WidgetPresentationOptions {
    customization: Ref<Partial<AgentCustomization>>
    agentName: Ref<string>
    humanAgent: Ref<HumanAgent>
    isAuroraStyle: Readonly<Ref<boolean>>
    isAskAnythingStyle: Readonly<Ref<boolean>>
    messages: Ref<unknown[]>
    loadingHistory: Ref<boolean>
    showEmailGate: Readonly<Ref<boolean>>
    shouldShowNewConversationOption: Readonly<Ref<boolean>>
    allowAttachments: Ref<boolean>
    uploadedAttachments: Ref<unknown[]>
    /** The embed loader frosts the page behind the redesigned panel (Glass may be see-through). */
    hostBackdrop?: Readonly<Ref<boolean>>
}

// Premium design presets → CSS theme class applied on .chat-container.
// Legacy (CHATBOT) and ASK_ANYTHING return no theme class (handled separately).
const THEME_CLASS_MAP: Record<string, string> = {
    GLASS: 'theme-glass',
    TERMINAL: 'theme-terminal',
    PLAYFUL: 'theme-playful',
    CALM_MINT: 'theme-calm',
    SUNRISE: 'theme-sunrise',
}

// File upload limits for the attach control.
const MAX_FILES = 3
const ACCEPT_TYPES = 'image/*,.pdf,.doc,.docx,.txt,.csv,.xlsx,.xls'

/**
 * What the widget looks like and says, derived from the customization and the
 * conversation: theme, avatar, header presence, the on-open intro, footers and
 * the attach control. Read-only view state; no side effects.
 */
export function useWidgetPresentation({
    customization,
    agentName,
    humanAgent,
    isAuroraStyle,
    isAskAnythingStyle,
    messages,
    loadingHistory,
    showEmailGate,
    shouldShowNewConversationOption,
    allowAttachments,
    uploadedAttachments,
    hostBackdrop,
}: WidgetPresentationOptions) {
    // Handle human agent profile picture URL. Signed S3 URLs pass through; local
    // paths are resolved against the runtime API origin (the stored path already
    // carries the /api/v1 prefix).
    const humanAgentPhotoUrl = computed(() =>
        resolveWidgetUploadUrl(humanAgent.value.human_agent_profile_pic)
    )

    // Pinned current behaviour (odd): nothing ever sets this, so the upload
    // spinner never shows.
    const isUploading = ref(false)

    // A human agent has claimed the conversation, so replies no longer come from the AI.
    const isHandedOverToHuman = computed(() => !!humanAgent.value?.human_agent_name)

    // Which design renders: the classic widget (1) or the redesigned panel (2).
    const ui = computed(() => widgetUiVersion(customization.value))

    // What the header may honestly say about how soon someone replies. Server-sent
    // at load; a takeover flips it to the human wording without a round trip.
    const presence = computed(() => presenceLine(
        window.__INITIAL_DATA__?.presence,
        isHandedOverToHuman.value,
        ui.value === 2 ? PANEL_PRESENCE_TEXT : PRESENCE_TEXT,
    ))

    // The plan decides, so a page with no answer yet keeps the branding.
    const showBranding = computed(() => !window.__INITIAL_DATA__?.hideBranding)

    // The org's live help center, offered on the redesign's start state.
    const helpCenterUrl = computed(() => helpCenterLink(window.__INITIAL_DATA__?.helpCenterUrl))

    // Attachments only allowed when:
    // 1. allow_attachments setting is enabled
    // 2. Chat has been handed over to a human agent (no need to wait for agent message)
    // 3. Haven't reached max file limit
    const canUploadMore = computed(() =>
        allowAttachments.value && isHandedOverToHuman.value && uploadedAttachments.value.length < MAX_FILES
    )

    // Use the generated aurora orb when the user explicitly picked "orb", or as the Aurora
    // fallback when no profile photo is set. A selected profile picture always takes precedence.
    const orbMeta = computed(() => customization.value.customization_metadata as Record<string, unknown> | undefined)
    const useOrbAvatar = computed(() => {
        const avatarStyle = orbMeta.value?.avatar_style
        if (avatarStyle === 'orb') return true
        if (avatarStyle === 'photo') return false
        return isAuroraStyle.value && !customization.value.photo_url
    })

    const orbStyle = computed(() => resolveOrbStyle(agentName.value || '', orbMeta.value?.orb_variant))

    const themeClass = computed(() => THEME_CLASS_MAP[customization.value.chat_style as string] || '')

    // Structural theme tokens (radius/glow/border/agent-surface) as CSS vars on the container.
    const themeVars = computed(() => themeCssVars(customization.value.chat_style as string, {
        chat_background_color: customization.value.chat_background_color,
        chat_text_color: customization.value.chat_text_color,
        accent_color: customization.value.accent_color,
        font_family: customization.value.font_family,
    }, { ui: ui.value, hostBackdrop: !!hostBackdrop?.value }))

    // Welcome message + quick actions shown on open (no history yet); they clear once
    // the visitor sends their first message.
    // Only the every-page ones: a rule for some pages is the server's to place
    // ("Suggested for this page", usePageSuggestions).
    const quickActions = computed<string[]>(() => everyPageLabels(customization.value.quick_actions))
    const welcomeMessageText = computed(() => (customization.value.welcome_message || '').trim())
    // The welcome bubble shows at the top of the thread; the quick actions render as a
    // bar just above the input (comp layout). Both only appear before the first message.
    const showOnOpenIntro = computed(() =>
        !isAskAnythingStyle.value
        && messages.value.length === 0
        && !loadingHistory.value
        && !showEmailGate.value
    )
    const showWelcomeBlock = computed(() =>
        showOnOpenIntro.value && welcomeMessageText.value.length > 0
    )
    const showQuickActions = computed(() =>
        showOnOpenIntro.value
        && !shouldShowNewConversationOption.value
        && quickActions.value.length > 0
    )

    // Citations are shown only when explicitly enabled (off by default for now)
    const showCitations = computed(() => customization.value.show_citations === true)

    // Footer disclosure that replies are AI-generated (see utils/aiDisclaimer).
    const showAiDisclaimer = computed(() =>
        shouldShowAiDisclaimer(customization.value.show_ai_disclaimer, isHandedOverToHuman.value))

    const shouldShowWelcomeMessage = computed(() => {
        return isAskAnythingStyle.value && messages.value.length === 0
    })

    const askAiSubtitle = computed(() =>
        customization.value.welcome_subtitle || `Ask a question — ${agentName.value || 'the assistant'} answers from what it knows.`
    )

    return {
        ui,
        humanAgentPhotoUrl,
        isUploading,
        maxFiles: MAX_FILES,
        acceptTypes: ACCEPT_TYPES,
        isHandedOverToHuman,
        presence,
        showBranding,
        helpCenterUrl,
        canUploadMore,
        useOrbAvatar,
        orbStyle,
        themeClass,
        themeVars,
        quickActions,
        welcomeMessageText,
        showWelcomeBlock,
        showQuickActions,
        showCitations,
        showAiDisclaimer,
        shouldShowWelcomeMessage,
        askAiSubtitle,
    }
}
