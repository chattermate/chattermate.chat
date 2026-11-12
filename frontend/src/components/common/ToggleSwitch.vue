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
const model = defineModel<boolean>({ required: true })
defineProps<{ label: string; disabled?: boolean }>()
</script>

<template>
  <button
    type="button"
    class="toggle-switch"
    role="switch"
    :class="{ on: model }"
    :aria-checked="model"
    :aria-label="label"
    :disabled="disabled"
    @click="model = !model"
  >
    <span class="toggle-knob"></span>
  </button>
</template>

<style scoped>
.toggle-switch {
  flex-shrink: 0;
  width: 46px;
  height: 26px;
  padding: 3px;
  border: none;
  border-radius: 999px;
  background: var(--o12);
  cursor: pointer;
  transition: background var(--transition-fast);
}
.toggle-switch.on { background: var(--accent-solid); }
.toggle-switch:disabled { opacity: 0.5; cursor: not-allowed; }
.toggle-switch:focus-visible { outline: none; box-shadow: var(--ring-focus); }
.toggle-knob {
  display: block;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--toggle-knob);
  box-shadow: var(--shadow-md);
  transition: transform var(--transition-fast);
}
.toggle-switch.on .toggle-knob { transform: translateX(20px); }
@media (prefers-reduced-motion: reduce) {
  .toggle-switch, .toggle-knob { transition: none; }
}
</style>
