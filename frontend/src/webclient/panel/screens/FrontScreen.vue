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
// A screen in front of the chat: the widget cannot be used (blocked), a
// workflow's landing page, or its full-screen form; the branding stays under it.
import { inject } from 'vue'
import { WIDGET_CTX } from '../controller'
import BlockedScreen from './BlockedScreen.vue'
import LandingScreen from './LandingScreen.vue'
import FullScreenForm from './FullScreenForm.vue'
import PanelFooter from '../PanelFooter.vue'

defineProps<{ blocked: boolean }>()

const { showLandingPage, landingPageData } = inject(WIDGET_CTX)!
</script>

<template>
    <BlockedScreen v-if="blocked" />
    <LandingScreen v-else-if="showLandingPage && landingPageData" />
    <FullScreenForm v-else />
    <div class="cm-panel__bottom">
        <PanelFooter branding-only />
    </div>
</template>
