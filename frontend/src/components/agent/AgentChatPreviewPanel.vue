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
 * The agent page's widget preview: the widget's own panel (AgentPanelPreview) with
 * the agent's photo, or its orb, and the plan's branding, as visitors get them.
 */
import { computed, onMounted } from 'vue'
import type { AgentCustomization } from '@/types/agent'
import { resolveUploadUrl } from '@/config/api'
import { orbSvgDataUri } from '@/utils/orb'
import { useEnterpriseFeatures } from '@/composables/useEnterpriseFeatures'
import AgentPanelPreview from './AgentPanelPreview.vue'

const props = defineProps<{
    customization: AgentCustomization
    agentName: string
    agentId: string
    // Seed for the fallback orb; pass the agent slug so it matches the list and
    // detail header. Falls back to agentName when not given.
    orbSeed?: string
    // The chat window size chosen in Placement; the default window when not given.
    windowWidth?: number
    windowHeight?: number
}>()

// The preview matches what visitors see: a plan with custom branding drops
// "Powered by" (the server decides the same for the live widget). Open
// source always shows it. Read from the store so it follows the plan once
// it loads, not just whatever was cached when the panel mounted.
const { hasEnterpriseModule, subscriptionStore, initializeSubscriptionStore } = useEnterpriseFeatures()
const showBranding = computed(() =>
    !(hasEnterpriseModule && subscriptionStore.value.currentPlan?.plan?.features?.custom_branding === true))
onMounted(() => { if (hasEnterpriseModule) initializeSubscriptionStore() })

// The agent's photo, or the orb seeded off orbSeed (the agent slug) so it matches
// the detail header and the list. Absolute S3/CDN URLs pass through (the API signs
// photo_url itself); local paths resolve against the runtime API origin.
const photoUrl = computed(() =>
    !props.customization.photo_url
        ? orbSvgDataUri(props.orbSeed || props.agentName, props.customization.customization_metadata?.orb_variant)
        : resolveUploadUrl(props.customization.photo_url))
</script>

<template>
    <AgentPanelPreview
        :customization="customization"
        :agent-id="agentId"
        :agent-name="agentName"
        :photo-url="photoUrl"
        :show-branding="showBranding"
        :window-width="windowWidth"
        :window-height="windowHeight"
    />
</template>
