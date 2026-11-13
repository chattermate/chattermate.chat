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
 * A workflow form's fields, shared by the form in the chat (FormCard) and the
 * full-screen form: every field type the classic widget renders (text, email,
 * phone, number, textarea, select, checkbox, radio). Values, errors and validation
 * are the controller's (useWorkflowScreens, forms/validation.ts); this only draws
 * them, with labels, required marks and errors tied to their fields.
 */
import { inject, nextTick, ref } from 'vue'
import { WIDGET_CTX } from '../controller'
import { fieldOptions } from '../../forms/options'
import { PANEL_COPY } from '../../copy'
import type { WorkflowField } from '../../../composables/useWorkflowScreens'

const props = defineProps<{
    fields: WorkflowField[]
    /** Prefixes the field ids, so two forms never share one. */
    idPrefix: string
    disabled?: boolean
}>()

const ctrl = inject(WIDGET_CTX)!
const { formData, formErrors } = ctrl

const root = ref<HTMLElement | null>(null)
// Read out after a refused submit (focus alone says nothing when it is already there).
const summary = ref('')

const idOf = (field: WorkflowField) => `${props.idPrefix}-${field.name}`
const errorIdOf = (field: WorkflowField) => `${idOf(field)}-error`
const describedBy = (field: WorkflowField) => (formErrors.value[field.name] ? errorIdOf(field) : undefined)
const valueOf = (event: Event) => (event.target as HTMLInputElement).value
const change = (field: WorkflowField, value: unknown) => ctrl.handleFieldChange(field.name, value)

/** After a refused submit: say what to fix, and take the visitor to the first field. */
const reportInvalid = async () => {
    // Emptied first, so the same errors twice are announced twice.
    summary.value = ''
    await nextTick()
    summary.value = PANEL_COPY.formErrors(Object.values(formErrors.value))
    root.value?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
}
defineExpose({ reportInvalid })
</script>

<template>
    <div ref="root" class="cm-form">
        <p class="cm-visually-hidden" role="status">{{ summary }}</p>
        <div v-for="field in fields" :key="field.name" class="cm-form__field">
            <!-- A checkbox with its own wording (placeholder) keeps its label above it,
                 the name its errors use ("Terms is required"). -->
            <fieldset v-if="field.type === 'checkbox' && field.placeholder" class="cm-form__group">
                <legend class="cm-form__label">
                    {{ field.label }}<span v-if="field.required" class="cm-form__required" aria-hidden="true"> *</span>
                </legend>
                <label class="cm-form__check">
                    <input
                        :id="idOf(field)"
                        type="checkbox"
                        :required="field.required"
                        :checked="!!formData[field.name]"
                        :disabled="disabled"
                        :aria-invalid="!!formErrors[field.name]"
                        :aria-describedby="describedBy(field)"
                        @change="change(field, ($event.target as HTMLInputElement).checked)"
                    >
                    <span>{{ field.placeholder }}</span>
                </label>
            </fieldset>
            <label v-else-if="field.type === 'checkbox'" class="cm-form__check">
                <input
                    :id="idOf(field)"
                    type="checkbox"
                    :required="field.required"
                    :checked="!!formData[field.name]"
                    :disabled="disabled"
                    :aria-invalid="!!formErrors[field.name]"
                    :aria-describedby="describedBy(field)"
                    @change="change(field, ($event.target as HTMLInputElement).checked)"
                >
                <span>{{ field.label }}<span v-if="field.required" class="cm-form__required" aria-hidden="true"> *</span></span>
            </label>
            <fieldset v-else-if="field.type === 'radio'" class="cm-form__group" :aria-describedby="describedBy(field)">
                <legend class="cm-form__label">
                    {{ field.label }}<span v-if="field.required" class="cm-form__required" aria-hidden="true"> *</span>
                </legend>
                <label v-for="option in fieldOptions(field.options)" :key="option" class="cm-form__check">
                    <input
                        type="radio"
                        :name="idOf(field)"
                        :value="option"
                        :required="field.required"
                        :checked="formData[field.name] === option"
                        :disabled="disabled"
                        :aria-invalid="!!formErrors[field.name]"
                        @change="change(field, option)"
                    >
                    <span>{{ option }}</span>
                </label>
            </fieldset>
            <template v-else>
                <label :for="idOf(field)" class="cm-form__label">
                    {{ field.label }}<span v-if="field.required" class="cm-form__required" aria-hidden="true"> *</span>
                </label>
                <textarea
                    v-if="field.type === 'textarea'"
                    :id="idOf(field)"
                    class="cm-field cm-form__textarea"
                    rows="3"
                    :placeholder="field.placeholder || ''"
                    :required="field.required"
                    :minlength="field.minLength"
                    :maxlength="field.maxLength"
                    :value="formData[field.name] || ''"
                    :disabled="disabled"
                    :aria-invalid="!!formErrors[field.name]"
                    :aria-describedby="describedBy(field)"
                    @input="change(field, valueOf($event))"
                ></textarea>
                <select
                    v-else-if="field.type === 'select'"
                    :id="idOf(field)"
                    class="cm-field"
                    :required="field.required"
                    :value="formData[field.name] || ''"
                    :disabled="disabled"
                    :aria-invalid="!!formErrors[field.name]"
                    :aria-describedby="describedBy(field)"
                    @change="change(field, valueOf($event))"
                >
                    <option value="">{{ field.placeholder || PANEL_COPY.selectPlaceholder }}</option>
                    <option v-for="option in fieldOptions(field.options)" :key="option" :value="option">{{ option }}</option>
                </select>
                <input
                    v-else
                    :id="idOf(field)"
                    class="cm-field"
                    :type="field.type === 'email' || field.type === 'tel' || field.type === 'number' ? field.type : 'text'"
                    :placeholder="field.placeholder || ''"
                    :required="field.required"
                    :minlength="field.type === 'number' ? undefined : field.minLength"
                    :maxlength="field.type === 'number' ? undefined : field.maxLength"
                    :min="field.type === 'number' ? field.minLength : undefined"
                    :max="field.type === 'number' ? field.maxLength : undefined"
                    :autocomplete="field.type === 'email' ? 'email' : field.type === 'tel' ? 'tel' : 'off'"
                    :inputmode="field.type === 'tel' ? 'tel' : field.type === 'email' ? 'email' : field.type === 'number' ? 'decimal' : 'text'"
                    :value="formData[field.name] || ''"
                    :disabled="disabled"
                    :aria-invalid="!!formErrors[field.name]"
                    :aria-describedby="describedBy(field)"
                    @input="change(field, valueOf($event))"
                    @blur="change(field, valueOf($event))"
                >
            </template>
            <p v-if="formErrors[field.name]" :id="errorIdOf(field)" class="cm-form__error">{{ formErrors[field.name] }}</p>
        </div>
    </div>
</template>

<style scoped>
.cm-form { display: flex; flex-direction: column; gap: 14px; }
.cm-form__field { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.cm-form__label { padding: 0; }
.cm-form__group { margin: 0; padding: 0; border: 0; display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.cm-form__check { display: flex; align-items: center; gap: 8px; min-height: 24px; cursor: pointer; }
.cm-form__check input { width: 18px; height: 18px; margin: 0; flex-shrink: 0; }
.cm-form__textarea { padding-top: 10px; padding-bottom: 10px; resize: vertical; }
.cm-form__error { margin: 0; }
</style>
