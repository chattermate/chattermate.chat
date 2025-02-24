<!--
ChatterMate - Agent Customization View
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
import { ref, watch, onMounted, computed, onUnmounted } from 'vue'
import type { AgentWithCustomization, AgentCustomization } from '@/types/agent'
import { agentService } from '@/services/agent'
import WebFont from 'webfontloader'

const props = defineProps<{
    agent: AgentWithCustomization
}>()

const emit = defineEmits<{
    (e: 'save', agent: AgentWithCustomization): void
    (e: 'cancel'): void
    (e: 'preview', customization: AgentCustomization & { showBubblePreview?: boolean }): void
}>()

const customization = ref<AgentCustomization>({
    id: props.agent.customization?.id ?? 0,
    agent_id: props.agent.id,
    chat_background_color: props.agent.customization?.chat_background_color ?? '#F8F9FA',
    chat_bubble_color: props.agent.customization?.chat_bubble_color ?? '#E9ECEF',
    icon_color: props.agent.customization?.icon_color ?? '#6C757D',
    accent_color: props.agent.customization?.accent_color ?? '#f34611',
    font_family: props.agent.customization?.font_family ?? 'Inter, system-ui, sans-serif',
    photo_url: props.agent.customization?.photo_url,
    custom_css: props.agent.customization?.custom_css,
    customization_metadata: props.agent.customization?.customization_metadata ?? {},
})

const handleSave = async () => {
    try {
        const updatedCustomization = await agentService.updateCustomization(
            props.agent.id,
            customization.value,

        )

        emit('save', {
            ...props.agent,
            customization: updatedCustomization,
        })
    } catch (error) {
        console.error('Failed to update customization:', error)
    }
}

// Watch for changes and emit preview event
watch(customization, (newValue) => {
    emit('preview', newValue)
}, { deep: true })

// Add state for Google Fonts
const googleFonts = ref<Array<{ family: string, variants: string[] }>>([])
const isLoadingFonts = ref(true)

// Load Google Fonts
onMounted(async () => {
    try {
        const response = await fetch(`https://www.googleapis.com/webfonts/v1/webfonts?key=${import.meta.env.VITE_GOOGLE_FONTS_API_KEY}&sort=popularity`)
        const data = await response.json()
        googleFonts.value = data.items
    } catch (error) {
        console.error('Failed to load Google Fonts:', error)
    } finally {
        isLoadingFonts.value = false
    }
})

// Update font preview when selection changes
watch(() => customization.value.font_family, (newFont) => {
    if (!newFont) return

    // Create a style element for this specific font
    const styleId = 'preview-font-style'
    let styleEl = document.getElementById(styleId)

    if (!styleEl) {
        styleEl = document.createElement('style')
        styleEl.id = styleId
        document.head.appendChild(styleEl)
    }

    // Load font but scope it to the chat panel
    WebFont.load({
        google: {
            families: [newFont]
        },
        active: () => {
            if (styleEl) {
                styleEl.textContent = `
                    .chat-panel {
                        font-family: "${newFont}", system-ui, sans-serif;
                    }
                `
            }
        }
    })
})

// Clean up the style element when component is unmounted
onUnmounted(() => {
    const styleEl = document.getElementById('preview-font-style')
    if (styleEl) {
        styleEl.remove()
    }
})

const fontSearch = ref('')
const filteredFonts = computed(() => {
    if (!fontSearch.value) return googleFonts.value
    return googleFonts.value.filter(font =>
        font.family.toLowerCase().includes(fontSearch.value.toLowerCase())
    )
})

const showFontDropdown = ref(false)

const handleFontSelect = (font: string) => {
    customization.value.font_family = font
    showFontDropdown.value = false
}
</script>

<template>
    <div class="customization-form">
        <div class="form-section">
            <h4>Colors</h4>
            <div class="color-grid">

                <div class="color-picker">
                    <label>Background</label>
                    <div class="color-input">
                        <input type="color" v-model="customization.chat_background_color">
                        <span class="color-value">{{ customization.chat_background_color }}</span>
                    </div>
                </div>

                <div class="color-picker">
                    <label>Chat Bubble</label>
                    <div class="color-input">
                        <input type="color" v-model="customization.chat_bubble_color"
                            @input="emit('preview', { ...customization, showBubblePreview: true })"
                            @focus="emit('preview', { ...customization, showBubblePreview: true })"
                            @blur="emit('preview', { ...customization, showBubblePreview: false })">
                        <span class="color-value">{{ customization.chat_bubble_color }}</span>
                    </div>
                </div>

                <div class="color-picker">
                    <label>Accent</label>
                    <div class="color-input">
                        <input type="color" v-model="customization.accent_color">
                        <span class="color-value">{{ customization.accent_color }}</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="form-section">
            <h4>Typography</h4>
            <div class="form-group">
                <label>Font Family</label>
                <div class="font-picker">
                    <div class="font-dropdown" :class="{ 'active': showFontDropdown }">
                        <input type="text" :value="showFontDropdown ? fontSearch : customization.font_family"
                            @input="e => fontSearch = (e.target as HTMLInputElement).value"
                            placeholder="Search fonts..." class="font-search"
                            :style="!showFontDropdown ? { fontFamily: customization.font_family } : {}"
                            :disabled="isLoadingFonts" @focus="showFontDropdown = true">
                        <div v-if="showFontDropdown" class="font-options">
                            <div v-for="font in filteredFonts" :key="font.family" class="font-option"
                                :style="{ fontFamily: font.family }" @click="handleFontSelect(font.family)">
                                {{ font.family }}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="button-group">
            <button class="cancel-button" @click="emit('cancel')">Cancel</button>
            <button class="save-button" @click="handleSave">Save Changes</button>
        </div>
    </div>
</template>

<style scoped>
.customization-form {
    padding: var(--space-md);
    max-width: 480px;
}

.form-section {
    margin-bottom: var(--space-lg);
}

.form-section h4 {
    color: var(--text-muted);
    margin-bottom: var(--space-sm);
    font-size: var(--text-sm);
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.form-group {
    margin-bottom: var(--space-sm);
}

.form-group label {
    display: block;
    margin-bottom: var(--space-xs);
    color: var(--text-muted);
}

.form-group input[type="file"],
.form-group select,
.form-group textarea {
    width: 100%;
    padding: var(--space-sm);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    background: var(--background-soft);
}

.file-input {
    position: relative;
}

.file-input input[type="file"] {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    border: 0;
}

.file-label {
    display: block;
    padding: var(--space-xs) var(--space-sm);
    background: var(--background-soft);
    border: 1px dashed var(--border-color);
    border-radius: var(--radius-md);
    cursor: pointer;
    text-align: center;
    color: var(--text-muted);
    font-size: var(--text-sm);
}

.image-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-sm);
    margin-bottom: var(--space-sm);
}

.color-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-sm);
}

.color-picker {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
}

.color-input {
    display: flex;
    align-items: center;
    gap: var(--space-xs);
    background: var(--background-soft);
    padding: var(--space-xs);
    border-radius: var(--radius-md);
    border: 1px solid var(--border-color);
}

.color-input input[type="color"] {
    width: 32px;
    height: 32px;
    padding: 0;
    border: none;
    border-radius: var(--radius-sm);
    cursor: pointer;
}

.color-value {
    font-family: monospace;
    color: var(--text-muted);
    font-size: var(--text-xs);
}

.button-group {
    display: flex;
    gap: var(--space-sm);
    position: sticky;
    bottom: 0;
    background: var(--background-base);
    padding: var(--space-md);
    margin: 0 calc(var(--space-md) * -1);
    border-top: 1px solid var(--border-color);
    box-shadow: 0 -4px 6px -1px rgb(0 0 0 / 0.1);
}

.save-button,
.cancel-button {
    padding: var(--space-sm) var(--space-lg);
    border: none;
    border-radius: var(--radius-md);
    cursor: pointer;
    font-weight: 500;
    flex: 1;
    min-width: 120px;
}

.save-button {
    background: var(--primary-color);
    color: white;
}

.cancel-button {
    background: var(--background-soft);
    color: var(--text-color);
}

.font-picker {
    position: relative;
}

.font-dropdown {
    position: relative;
}

.font-search {
    width: 100%;
    padding: var(--space-sm);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    background: var(--background-soft);
    color: var(--text-color);
    font-size: var(--text-sm);
}

.font-options {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    max-height: 200px;
    overflow-y: auto;
    background: white;
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    margin-top: var(--space-xs);
    z-index: 10;
}

.font-option {
    padding: var(--space-sm);
    cursor: pointer;
}

.font-option:hover {
    background: var(--background-soft);
}

.color-picker label {
    font-size: var(--text-sm);
    margin-bottom: var(--space-xs);
}
</style>
