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
// A full-screen workflow form in front of the chat: title, description, the shared
// FormFields and submit (the controller validates and sends it). A refused submit
// takes the visitor to the first field to fix.
import { computed, inject, nextTick, ref } from 'vue'
import { WIDGET_CTX } from '../controller'
import FormFields from './FormFields.vue'
import { PANEL_COPY } from '../../copy'

const ctrl = inject(WIDGET_CTX)!
const { fullScreenFormData, isSubmittingForm, formErrors } = ctrl

const fields = ref<InstanceType<typeof FormFields> | null>(null)
const form = computed(() => fullScreenFormData.value ?? { fields: [] })

const submit = async () => {
    await ctrl.submitFullScreenForm()
    if (Object.keys(formErrors.value).length) nextTick(() => fields.value?.reportInvalid())
}
</script>

<template>
    <form class="cm-screen cm-screen--form" novalidate @submit.prevent="submit">
        <h2 v-if="form.title" class="cm-screen__title">{{ form.title }}</h2>
        <p v-if="form.description" class="cm-screen__text">{{ form.description }}</p>
        <FormFields ref="fields" class="cm-screen__fields" :fields="form.fields ?? []" id-prefix="cm-fullscreen" :disabled="isSubmittingForm" />
        <button type="submit" class="cm-primary cm-press cm-screen__action" :disabled="isSubmittingForm">
            {{ isSubmittingForm ? PANEL_COPY.submitting : (form.submit_button_text || PANEL_COPY.submit) }}
        </button>
    </form>
</template>
