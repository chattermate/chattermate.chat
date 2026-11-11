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
// The widget root: one controller (state, socket, host page) provided to the view
// the agent's design asks for (customization_metadata.widget_ui).
import { provide } from 'vue'
import { useWidgetController } from '../composables/useWidgetController'
import { WIDGET_CTX, type WidgetControllerProps } from './panel/controller'
import ClassicWidget from './ClassicWidget.vue'
import PanelWidget from './panel/PanelWidget.vue'

const props = defineProps<WidgetControllerProps>()

// Its lifecycle hooks (initialize on mount, clean up on unmount) register here.
const ctrl = useWidgetController(props)
provide(WIDGET_CTX, ctrl)
const { ui } = ctrl
</script>

<template>
    <PanelWidget v-if="ui === 2" />
    <ClassicWidget v-else />
</template>
