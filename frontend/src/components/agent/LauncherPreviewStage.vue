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
import type { LauncherBackdrop } from '@/composables/useLauncherSettings'
import {
  LAUNCHER_BADGE_COLORS,
  LAUNCHER_ICON_SCALE,
  LAUNCHER_ICON_SVG,
  LAUNCHER_LOGO_SCALE,
  launcherAccent,
  launcherDotColors,
  launcherFill,
  launcherMotionCss,
  type LauncherLook,
} from '@/webclient/launcher-style'
import { readableInkOn } from '@/utils/color'

const WINDOW_SCALE = 0.75
const EDGE = 20
const GAP = 12
const ROOT = '.launcher-stage-button'

const props = defineProps<{
  look: LauncherLook
  logoUrl: string | null
  brand: string
  agentName: string
  side: 'left' | 'right'
  windowWidth: number
  windowHeight: number
  greeting: string | null
  greetingCount: number
  hidden: boolean
  // The customer's site behind the launcher, to check it reads on light and dark pages.
  backdrop: LauncherBackdrop
}>()

const open = ref(false)

const fill = computed(() => launcherFill(props.look, props.brand))
const accent = computed(() => launcherAccent(props.brand))
// The default launcher is the ChatterMate mark: lime and coral dots on the ink tile.
const dotColors = computed(() => (props.look.icon === 'dots' ? launcherDotColors(props.brand) : null))
const onBrand = computed(() => readableInkOn(props.brand))
const aboveLauncher = computed(() => EDGE + props.look.px + GAP)

// Inline because the motion comes from the loader's own CSS, built per look.
const motionCss = computed(() => `
  @keyframes chattermate-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
  @keyframes chattermate-ring { 0% { transform: scale(.85); opacity: .5; } 100% { transform: scale(1.6); opacity: 0; } }
  ${launcherMotionCss(ROOT, props.look, accent.value, props.side, fill.value.shadow)}
`)

const buttonStyle = computed(() => {
  const openBare = open.value && props.look.bare
  return {
    width: `${props.look.px}px`,
    height: `${props.look.px}px`,
    borderRadius: props.look.radius,
    background: openBare ? props.brand : fill.value.fill,
    color: openBare ? onBrand.value : fill.value.ink,
    boxShadow: fill.value.shadow,
  }
})

const iconStyle = computed(() => {
  const scale = props.look.isLogo ? (props.look.bare ? 1 : LAUNCHER_LOGO_SCALE) : LAUNCHER_ICON_SCALE
  return { width: `${scale * 100}%`, height: `${scale * 100}%` }
})

const iconSvg = computed(() => (props.look.icon === 'logo' ? '' : LAUNCHER_ICON_SVG[props.look.icon]))

const windowStyle = computed(() => ({
  bottom: `${aboveLauncher.value}px`,
  width: `${Math.round(props.windowWidth * WINDOW_SCALE)}px`,
  height: `${Math.round(props.windowHeight * WINDOW_SCALE)}px`,
  // The stage shrinks with the browser window; the chat window never runs off its top.
  maxHeight: `calc(100% - ${aboveLauncher.value + GAP}px)`,
}))

const badgeStyle = computed(() => ({
  minWidth: `${props.look.badgePx}px`,
  height: `${props.look.badgePx}px`,
  padding: `0 ${props.look.badgePaddingPx}px`,
  background: LAUNCHER_BADGE_COLORS.fill,
  color: LAUNCHER_BADGE_COLORS.ink,
  borderColor: LAUNCHER_BADGE_COLORS.ring,
  fontSize: `${props.look.badgeFontPx}px`,
}))
</script>

<template>
  <div class="launcher-stage-wrap" role="region" aria-label="Launcher preview">
    <component :is="'style'">{{ motionCss }}</component>

    <div class="stage" :class="`stage-${backdrop}`">
      <div class="site-bar"><span class="site-logo"></span><span class="site-link"></span><span class="site-link"></span></div>
      <div class="site-copy"><span></span><span></span><span class="short"></span></div>
      <div class="site-cards"><span></span><span></span></div>

      <div v-if="open" class="chat-window" :class="`at-${side}`" :style="windowStyle">
        <div class="chat-window-head" :style="{ background: brand, color: onBrand }">{{ agentName }}</div>
        <div class="chat-window-body"><span>Hi! How can we help today?</span></div>
        <div class="chat-window-input">Type a message…</div>
      </div>

      <div v-else-if="greeting && !hidden" class="greeting" :class="`at-${side}`" :style="{ bottom: `${aboveLauncher}px` }">{{ greeting }}</div>

      <button
        v-if="!hidden"
        type="button"
        class="launcher-stage-button"
        :class="[`at-${side}`, { active: open, bare: look.bare && !open }]"
        :style="buttonStyle"
        :aria-label="open ? 'Close chat' : 'Open chat'"
        :aria-expanded="open"
        @click="open = !open"
      >
        <span class="cm-ring"></span>
        <span class="cm-ring r2"></span>
        <span class="cm-swoosh"><span></span><span></span><span></span></span>
        <span v-if="open" class="stage-icon chevron" :style="iconStyle">
          <font-awesome-icon icon="fa-solid fa-chevron-down" />
        </span>
        <span v-else-if="look.isLogo" class="stage-icon" :style="iconStyle"><img :src="logoUrl ?? undefined" alt=""></span>
        <span
          v-else
          class="stage-icon"
          :class="{ 'brand-dots': dotColors }"
          :style="{ ...iconStyle, '--dot-a': dotColors?.[0], '--dot-b': dotColors?.[1] }"
          v-html="iconSvg"
        ></span>
        <span v-if="greeting && !open" class="stage-badge" :style="badgeStyle">{{ greetingCount }}</span>
      </button>
    </div>

  </div>
</template>

<style scoped>
.launcher-stage-wrap {
  width: 460px;
  max-width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* The stage stands in for a customer's website, not for our UI, so its colors are
   deliberately not theme tokens: it must look the same in light and dark dashboards. */
.stage {
  position: relative;
  /* Short browser windows still show the launcher, which sits at the bottom. */
  height: min(560px, calc(100vh - 360px));
  min-height: 360px;
  border-radius: var(--radius-card);
  border: 1px solid var(--o12);
  box-shadow: 0 24px 48px -16px rgba(0, 0, 0, 0.35);
  overflow: hidden;
  background: var(--page);
}

.stage-light { --page: #F4F5F7; --panel: #FFFFFF; --block: #D5DBE3; --soft: #E1E5EB; --line: #E5E7EB; }
.stage-dark { --page: #14171F; --panel: #1D212B; --block: #303644; --soft: #272C38; --line: #2C3240; }

.site-bar {
  height: 48px;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 0 20px;
  background: var(--panel);
  border-bottom: 1px solid var(--line);
}

.site-logo { width: 80px; height: 12px; margin-right: auto; border-radius: 4px; background: var(--block); }
.site-link { width: 40px; height: 9px; border-radius: 4px; background: var(--soft); }

.site-copy {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 40px 20px 0;
}

.site-copy span { height: 24px; width: 78%; border-radius: 6px; background: var(--block); }
.site-copy .short { height: 10px; width: 88%; background: var(--soft); }

.site-cards {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  padding: 32px 20px 0;
}

.site-cards span { height: 110px; border-radius: 12px; background: var(--panel); border: 1px solid var(--line); }

.at-right { right: 20px; }
.at-left { left: 20px; }

.greeting {
  position: absolute;
  max-width: 260px;
  padding: 10px 14px;
  font-size: 14px;
  color: #374151;
  background: #FFFFFF;
  border: 1px solid #E5E7EB;
  border-radius: 16px;
  box-shadow: 0 10px 30px -10px rgba(15, 23, 42, .25);
}

.chat-window {
  position: absolute;
  max-width: calc(100% - 40px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 16px;
  background: #FFFFFF;
  box-shadow: 0 24px 60px -12px rgba(15, 23, 42, .35);
}

.chat-window-head { padding: 14px 16px; font-size: 14px; font-weight: 600; }
.chat-window-body { flex: 1 1 auto; padding: 14px; }

.chat-window-body span {
  display: inline-block;
  padding: 9px 11px;
  font-size: 12.5px;
  color: #374151;
  background: #F1F3F6;
  border-radius: 12px 12px 12px 4px;
}

.chat-window-input {
  margin: 0 10px 10px;
  padding: 10px 12px;
  font-size: 12.5px;
  color: #6B7280;
  border: 1px solid #E5E7EB;
  border-radius: 10px;
}

.launcher-stage-button {
  position: absolute;
  bottom: 20px;
  padding: 0;
  border: 0;
  cursor: pointer;
}

.launcher-stage-button:focus-visible {
  outline: 2px solid var(--accent-ink);
  outline-offset: 3px;
}

.launcher-stage-button .cm-ring {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  border: 1.5px solid v-bind(accent);
  animation: chattermate-ring 2.4s ease-out infinite;
  pointer-events: none;
}

.launcher-stage-button .cm-ring.r2 { animation-delay: 1.2s; }

.stage-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: translate(-50%, -50%);
}

.stage-icon img { width: 100%; height: 100%; object-fit: contain; }
.brand-dots :deep(circle:nth-child(1)) { fill: var(--dot-a); }
.brand-dots :deep(circle:nth-child(2)) { fill: var(--dot-b); }

.bare .stage-icon img {
  filter: drop-shadow(0 0 1.5px rgba(255, 255, 255, .95)) drop-shadow(0 6px 10px rgba(15, 23, 42, .25));
}

.stage-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  border: 2px solid;
  font-weight: 700;
}

</style>
