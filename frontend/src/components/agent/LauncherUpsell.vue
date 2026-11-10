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
defineProps<{
  message: string
}>()

const emit = defineEmits<{
  (e: 'upgrade'): void
}>()
</script>

<template>
  <div class="locked-overlay-compact launcher-upsell">
    <div class="locked-content-compact">
      <p class="locked-text">{{ message }}</p>
      <button type="button" class="upgrade-btn-compact" @click="emit('upgrade')">
        <font-awesome-icon icon="fa-solid fa-crown" />
        <span>Upgrade</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.launcher-upsell {
  margin-top: 12px;
}
</style>
