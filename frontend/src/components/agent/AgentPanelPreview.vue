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
/**
 * The dashboard preview of the redesigned widget (widget_ui 2): the widget's own
 * PanelWidget, under a preview controller (usePreviewController) instead of the live
 * one, so the preview and the widget share every component.
 */
import { computed, provide, toRef } from 'vue'
import type { AgentCustomization } from '@/types/agent'
import PanelWidget from '@/webclient/panel/PanelWidget.vue'
import { WIDGET_CTX, WIDGET_PREVIEW } from '@/webclient/panel/controller'
import { previewSampleConversation } from '@/webclient/panel/preview-sample'
import { usePreviewController } from '@/composables/usePreviewController'
import '@/webclient/widget-surface.css'

const props = defineProps<{
    customization: AgentCustomization
    agentId: string
    agentName: string
    photoUrl: string
    showBranding: boolean
    windowWidth?: number
    windowHeight?: number
}>()

// The redesign's window (the loader's 400 px default) unless Placement set one.
const width = computed(() => props.windowWidth ?? 400)
const height = computed(() => props.windowHeight ?? 600)

provide(WIDGET_PREVIEW, true)
provide(WIDGET_CTX, usePreviewController(toRef(props, 'customization'), previewSampleConversation(), {
    widgetId: computed(() => props.agentId || 'preview'),
    agentName: toRef(props, 'agentName'),
    photoUrl: toRef(props, 'photoUrl'),
    showBranding: toRef(props, 'showBranding'),
    width,
    height,
}))
</script>

<template>
    <div class="cm-panel-preview" data-testid="panel-preview" role="region" aria-label="Widget preview" :style="{ width: `${width}px`, height: `${height}px` }">
        <PanelWidget />
    </div>
</template>

<style scoped>
.cm-panel-preview {
    max-width: 100%;
    display: flex;
}
/* The panel fills its frame's viewport in the widget; here it fills the preview
   box, and narrows with it when the dashboard column is narrower than the window. */
.cm-panel-preview :deep(.chat-container.cm-ui-2) {
    height: 100%;
    max-width: 100%;
    min-width: 0;
    flex: 1 1 auto;
}
</style>
