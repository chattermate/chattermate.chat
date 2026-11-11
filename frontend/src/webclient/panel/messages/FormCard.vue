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
// A form the workflow put in the chat (handover details, a lead form): its title,
// description and fields (FormFields), submitted through the controller, which
// validates and sends it (useWorkflowScreens). A refused submit says what to fix
// and takes the visitor to the first field. Keeps the classic form-message hook.
import { computed, inject, nextTick, ref, useId } from 'vue'
import { WIDGET_CTX } from '../controller'
import FormFields from '../screens/FormFields.vue'
import { PANEL_COPY } from '../../copy'
import type { WidgetMessage } from '../../../types/widget'
import type { WorkflowForm } from '../../../composables/useWorkflowScreens'

const props = defineProps<{ message: WidgetMessage; index: number }>()

const ctrl = inject(WIDGET_CTX)!
const { isSubmittingForm, formErrors } = ctrl

const fields = ref<InstanceType<typeof FormFields> | null>(null)
const idPrefix = `cm-form-${useId()}`
const form = computed<WorkflowForm>(() => props.message.attributes?.form_data ?? { fields: [] })

const submit = async () => {
    await ctrl.handleFormSubmit(form.value)
    if (Object.keys(formErrors.value).length) nextTick(() => fields.value?.reportInvalid())
}
</script>

<template>
    <form class="message form-message cm-form-card" novalidate @submit.prevent="submit">
        <p v-if="form.title" class="cm-form-card__title">{{ form.title }}</p>
        <p v-if="form.description" class="cm-form-card__text">{{ form.description }}</p>
        <FormFields ref="fields" :fields="form.fields ?? []" :id-prefix="idPrefix" :disabled="isSubmittingForm" />
        <button type="submit" class="cm-primary cm-press" :disabled="isSubmittingForm">
            {{ isSubmittingForm ? PANEL_COPY.submitting : (form.submit_button_text || PANEL_COPY.submit) }}
        </button>
    </form>
</template>

<style scoped>
.cm-form-card { display: flex; flex-direction: column; gap: 12px; padding: 14px; }
.cm-form-card__title, .cm-form-card__text { margin: 0; }
</style>
