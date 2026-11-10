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
import { computed, ref } from 'vue'
import {
  LAUNCHER_ANIMATIONS as ANIMATIONS,
  LAUNCHER_BACKGROUNDS as BACKGROUNDS,
  LAUNCHER_ICONS as ICONS,
  LAUNCHER_SHAPES as SHAPES,
  LAUNCHER_SIZES as SIZES,
  LOGO_ACCEPT,
  type LauncherSettings,
} from '@/composables/useLauncherSettings'
import LauncherUpsell from './LauncherUpsell.vue'
import {
  BUTTON_ANIMATIONS,
  LAUNCHER_ICON_SVG,
  LAUNCHER_SIZE_PX,
  PAID_ANIMATIONS,
  launcherRadius,
  type LauncherAnimation,
} from '@/webclient/launcher-style'

const props = defineProps<{
  settings: LauncherSettings
  locked: boolean
  // Replaces the controls when there's no launcher to style.
  hiddenNote: string | null
  // Above the controls when they only apply on some screens.
  phoneOnlyNote: string | null
}>()

const emit = defineEmits<{
  (e: 'upgrade'): void
}>()

const fileInput = ref<HTMLInputElement | null>(null)

const style = computed(() => props.settings.allowed.value)
const look = computed(() => props.settings.look.value)
const logoChosen = computed(() => style.value.icon === 'logo')
const hasLogo = computed(() => !!props.settings.logoUrl.value)
const isPaid = (animation: LauncherAnimation) => PAID_ANIMATIONS.includes(animation)
const trialLabel = computed(() =>
  ANIMATIONS.find((option) => option.value === props.settings.trialAnimation.value)?.label)

const animationSelected = (animation: LauncherAnimation) =>
  !props.settings.trialAnimation.value && look.value.animation === animation

const chooseFile = () => fileInput.value?.click()

const onFile = (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  // Cleared so picking the same file again after an error still fires.
  input.value = ''
  if (file) props.settings.pickFile(file)
}
</script>

<template>
  <div class="launcher-settings">
    <p class="section-subtext">The chat button visitors click to open the widget.</p>

    <p v-if="hiddenNote" class="launcher-note">{{ hiddenNote }}</p>

    <template v-else>
      <p v-if="phoneOnlyNote" class="launcher-note">{{ phoneOnlyNote }}</p>

      <LauncherUpsell v-if="settings.downgraded.value" message="Your logo and premium animation are off on your current plan." @upgrade="emit('upgrade')" />

      <div class="launcher-row">
        <span id="launcher-color" class="placement-label">Color</span>
        <slot name="color" />
      </div>

      <div class="launcher-row">
        <span id="launcher-size" class="placement-label">Size</span>
        <div class="font-chips" role="radiogroup" aria-labelledby="launcher-size">
          <button
            v-for="option in SIZES"
            :key="option.value"
            type="button"
            role="radio"
            class="font-chip chip-tick"
            :class="{ active: style.size === option.value }"
            :aria-checked="style.size === option.value"
            @click="settings.update({ size: option.value })"
          >{{ option.label }} <small>{{ LAUNCHER_SIZE_PX[option.value] }}</small></button>
        </div>
      </div>

      <div v-if="!look.bare" class="launcher-row">
        <span id="launcher-shape" class="placement-label">Shape</span>
        <div class="font-chips" role="radiogroup" aria-labelledby="launcher-shape">
          <button
            v-for="option in SHAPES"
            :key="option.value"
            type="button"
            role="radio"
            class="font-chip chip-tick"
            :class="{ active: style.shape === option.value }"
            :aria-checked="style.shape === option.value"
            @click="settings.update({ shape: option.value })"
          >
            <span class="shape-glyph" :style="{ borderRadius: launcherRadius(option.value, 13) }"></span>
            {{ option.label }}
          </button>
        </div>
      </div>

      <div class="launcher-row">
        <span id="launcher-icon" class="placement-label">Icon</span>
        <div class="font-chips" role="radiogroup" aria-labelledby="launcher-icon">
          <button
            v-for="option in ICONS"
            :key="option.value"
            type="button"
            role="radio"
            class="font-chip chip-tick"
            :class="{ active: style.icon === option.value }"
            :aria-checked="style.icon === option.value"
            @click="settings.pickIcon(option.value)"
          >
            <span class="chip-glyph" v-html="LAUNCHER_ICON_SVG[option.value]"></span>
            {{ option.label }}
          </button>
          <button
            type="button"
            role="radio"
            class="font-chip chip-tick"
            :class="{ active: logoChosen }"
            :aria-checked="logoChosen"
            :aria-label="locked ? 'Your logo, premium' : 'Your logo'"
            @click="settings.pickIcon('logo')"
          >
            Your logo
            <font-awesome-icon v-if="locked" icon="fa-solid fa-lock" class="chip-lock" />
          </button>
        </div>
      </div>

      <LauncherUpsell v-if="settings.upsell.value === 'icon' && locked" message="Your own logo is on paid plans." @upgrade="emit('upgrade')" />

      <div v-if="logoChosen" class="logo-area">
        <input ref="fileInput" type="file" class="logo-input" :accept="LOGO_ACCEPT" aria-label="Upload logo" @change="onFile">

        <div v-if="hasLogo" class="logo-file">
          <span class="logo-thumb"><img :src="settings.logoUrl.value ?? undefined" alt=""></span>
          <span class="logo-name">{{ settings.logoName.value }}</span>
          <button type="button" class="font-chip logo-action" @click="chooseFile">Replace</button>
          <button type="button" class="font-chip logo-action" @click="settings.removeLogo()">Remove</button>
        </div>
        <div v-else class="logo-empty">
          <button type="button" class="font-chip" @click="chooseFile">Upload logo</button>
          <span class="launcher-hint">PNG, WebP or JPEG, up to 1 MB.</span>
        </div>

        <p v-if="settings.logoError.value" class="logo-error" role="alert">{{ settings.logoError.value }}</p>

        <div v-if="hasLogo" class="launcher-row">
          <span id="launcher-background" class="placement-label">Background</span>
          <div class="font-chips" role="radiogroup" aria-labelledby="launcher-background">
            <button
              v-for="option in BACKGROUNDS"
              :key="option.value"
              type="button"
              role="radio"
              class="font-chip chip-tick"
              :class="{ active: look.background === option.value }"
              :aria-checked="look.background === option.value"
              :disabled="option.value === 'none' && !settings.logoTransparent.value"
              @click="settings.pickBackground(option.value)"
            >{{ option.label }}</button>
          </div>
        </div>
        <p v-if="hasLogo && !settings.logoTransparent.value" class="launcher-hint">None needs a transparent PNG or WebP.</p>
      </div>

      <div class="launcher-row">
        <span id="launcher-animation" class="placement-label">Animation</span>
        <div class="font-chips" role="radiogroup" aria-labelledby="launcher-animation">
          <button
            v-for="option in ANIMATIONS"
            :key="option.value"
            type="button"
            role="radio"
            class="font-chip chip-tick"
            :class="{ active: animationSelected(option.value) }"
            :aria-checked="animationSelected(option.value)"
            :aria-label="isPaid(option.value) ? `${option.label}, premium` : option.label"
            :disabled="look.bare && BUTTON_ANIMATIONS.includes(option.value)"
            @click="settings.pickAnimation(option.value)"
          >
            {{ option.label }}
            <font-awesome-icon v-if="locked && isPaid(option.value)" icon="fa-solid fa-lock" class="chip-lock" />
          </button>
        </div>
      </div>

      <LauncherUpsell v-if="settings.upsell.value === 'animation' && locked" :message="`${trialLabel} is on paid plans.`" @upgrade="emit('upgrade')" />
    </template>

    <!-- Placement settings that belong with the launcher (hide it, use your own button). -->
    <slot />
  </div>
</template>

<style scoped>
.launcher-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 16px;
}



.launcher-row .font-chips {
  margin: 0;
  min-width: 0;
}

.launcher-row .font-chip {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 8px 12px;
}

.font-chip small {
  font-size: 11.5px;
  color: var(--muted);
}

.font-chip.active small {
  color: inherit;
}

.font-chip:disabled {
  cursor: not-allowed;
  border-style: dashed;
  color: var(--muted2);
}

.chip-glyph {
  display: inline-flex;
  width: 16px;
  height: 16px;
}

.chip-lock {
  font-size: 11px;
}

.shape-glyph {
  width: 13px;
  height: 13px;
  box-sizing: border-box;
  border: 2px solid currentColor;
}

.launcher-note,
.launcher-hint {
  font-size: 12px;
  line-height: 1.4;
  color: var(--muted);
  margin: 0;
}

.launcher-note {
  font-size: 13.5px;
  margin-bottom: 12px;
}

.logo-area {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.logo-input {
  display: none;
}

.logo-file,
.logo-empty {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid var(--o10);
  border-radius: var(--radius-btn);
  background: var(--bg);
}

.logo-empty {
  flex-direction: column;
  border-style: dashed;
}

.logo-thumb {
  width: 44px;
  height: 44px;
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-chip);
  border: 1px solid var(--o08);
  background: var(--surface);
  overflow: hidden;
}

.logo-thumb img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.logo-name {
  flex: 1 1 auto;
  min-width: 0;
  font-size: 13.5px;
  font-weight: 600;
  color: var(--text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.logo-action {
  flex: none;
  padding: 6px 10px;
  font-size: 12.5px;
}

.logo-error {
  margin: 0;
  font-size: 13px;
  color: var(--text2);
}
</style>
