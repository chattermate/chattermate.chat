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
import { computed } from 'vue'

const props = withDefaults(defineProps<{ size?: number }>(), { size: 40 })

const style = computed(() => ({
  width: `${props.size}px`,
  height: `${props.size}px`,
  '--orb-blur': `${props.size * 0.05}px`,
  '--orb-inset': `${props.size * 0.21}px`,
  '--orb-shadow': `${props.size * 0.22}px`,
}))
</script>

<template>
  <div class="orb" :style="style" aria-hidden="true">
    <div class="orb__gradient"></div>
    <div class="orb__core"></div>
    <div class="orb__ring"></div>
  </div>
</template>

<style scoped>
.orb {
  position: relative;
  flex-shrink: 0;
}

.orb__gradient {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: conic-gradient(
    from 0deg,
    var(--c-purple),
    var(--c-teal),
    var(--accent-ink),
    var(--c-coral),
    var(--c-purple)
  );
  filter: blur(var(--orb-blur));
  animation: orb-spin 6s linear infinite;
}

.orb__core {
  position: absolute;
  inset: var(--orb-inset);
  border-radius: 50%;
  background: radial-gradient(circle at 40% 35%, rgba(255, 255, 255, 0.92), var(--o12) 55%, transparent 72%);
  animation: orb-pulse 2.6s ease-in-out infinite;
}

.orb__ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  box-shadow: inset 0 0 var(--orb-shadow) rgba(0, 0, 0, 0.4);
}

@keyframes orb-spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes orb-pulse {
  0% { opacity: 0.4; }
  50% { opacity: 1; }
  100% { opacity: 0.4; }
}
</style>
