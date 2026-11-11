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
 * Which widget design visitors get: the original widget or the redesigned one
 * (customization_metadata.widget_ui, saved with the rest of the customization).
 * Native radios (one tab stop, arrow keys) drawn as the form's chips (.font-chip).
 */
import type { WidgetUiVersion } from '@/types/agent'

withDefaults(defineProps<{
    modelValue: WidgetUiVersion
    /** Whether this server serves the redesign at all (its operator can turn it off). */
    served?: boolean
    /** False for an agent created on the redesign: nothing to choose, only the note. */
    choosable?: boolean
}>(), { served: true, choosable: true })
const emit = defineEmits<{ (e: 'update:modelValue', version: WidgetUiVersion): void }>()

const OFF_NOTE = 'Visitors see the original widget until the new design is turned on for this server.'

const OPTIONS: Array<{ version: WidgetUiVersion; label: string }> = [
    { version: 1, label: 'Original' },
    { version: 2, label: 'New' },
]
</script>

<template>
    <p v-if="!choosable && !served" class="section-subtext widget-design__off">{{ OFF_NOTE }}</p>
    <fieldset v-else-if="choosable" class="widget-design">
        <legend class="widget-design__heading">Widget design</legend>
        <div class="widget-design__chips">
            <label
                v-for="option in OPTIONS"
                :key="option.version"
                class="font-chip chip-tick widget-design__chip"
                :class="{ active: modelValue === option.version }"
            >
                <input
                    type="radio"
                    name="widget-design"
                    class="widget-design__input"
                    :value="option.version"
                    :checked="modelValue === option.version"
                    @change="emit('update:modelValue', option.version)"
                >{{ option.label }}
            </label>
        </div>
        <p class="section-subtext widget-design__note">You can switch back at any time.</p>
        <p v-if="!served" class="section-subtext widget-design__note">{{ OFF_NOTE }}</p>
    </fieldset>
</template>

<style scoped>
.widget-design {
    border: 0;
    margin: 0;
    padding: 0;
    min-width: 0;
}
.widget-design__heading {
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 14px;
    color: var(--text);
    padding: 0;
    margin: 0 0 10px;
}
.widget-design__chips {
    display: flex;
    gap: 8px;
}
/* The radio is see-through over its whole chip, so it takes the click; the chip
   shows the choice and the keyboard focus. */
.widget-design__input {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    margin: 0;
    cursor: pointer;
}
.widget-design__chip {
    position: relative;
}
.widget-design__chip:has(.widget-design__input:focus-visible) {
    outline: 2px solid var(--accent-ink);
    outline-offset: 2px;
}
/* Above the next heading (Style), which brings its own space. */
p.widget-design__off {
    margin: 0;
}
/* Outranks the form's own .section-subtext spacing. */
.widget-design .widget-design__note {
    margin: 10px 0 0;
}
</style>
