/*
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
*/

import { computed, ref, shallowRef, type Ref } from 'vue'
import { agentService } from '@/services/agent'
import { resolveUploadUrl } from '@/config/api'
import type { AgentCustomization } from '@/types/agent'
import { BRAND_COLORS } from '@/config/brand'
import {
  BUTTON_ANIMATIONS,
  DEFAULT_LAUNCHER_COLOR,
  LAUNCHER_DEFAULTS,
  PAID_ANIMATIONS,
  launcherLook,
  pickLauncherStyle,
  type LauncherAnimation,
  type LauncherBackground,
  type LauncherIcon,
  type LauncherLook,
  type LauncherShape,
  type LauncherSize,
  type LauncherStyle,
} from '@/webclient/launcher-style'

// Labels for the Launcher card's options and the closed section's summary.
export const LAUNCHER_SIZES: { value: LauncherSize; label: string }[] = [
  { value: 'sm', label: 'Small' },
  { value: 'md', label: 'Medium' },
  { value: 'lg', label: 'Large' },
]
export const LAUNCHER_SHAPES: { value: LauncherShape; label: string }[] = [
  { value: 'bubble', label: 'Bubble' },
  { value: 'circle', label: 'Circle' },
]
export const LAUNCHER_ICONS: { value: Exclude<LauncherIcon, 'logo'>; label: string }[] = [
  { value: 'dots', label: 'Dots' },
  { value: 'chat', label: 'Chat' },
  { value: 'headset', label: 'Headset' },
  { value: 'help', label: 'Help' },
  { value: 'sparkle', label: 'Sparkle' },
]
export const LAUNCHER_ANIMATIONS: { value: LauncherAnimation; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'classic', label: 'Classic' },
  { value: 'bounce', label: 'Bounce' },
  { value: 'swoosh', label: 'Swoosh' },
  { value: 'glow', label: 'Glow' },
]
export const LAUNCHER_BACKGROUNDS: { value: LauncherBackground; label: string }[] = [
  { value: 'white', label: 'White' },
  { value: 'brand', label: 'Brand color' },
  { value: 'none', label: 'None' },
]


export const LOGO_ACCEPT = 'image/png,image/webp,image/jpeg'
const LOGO_MAX_BYTES = 1024 * 1024
const LOGO_MIN_PIXELS = 96
const ALPHA_SAMPLE_PIXELS = 64
const OPAQUE = 255

export interface LauncherPreview {
    look: LauncherLook
    logoUrl: string | null
    brand: string
    side: 'left' | 'right'
    windowWidth: number
    windowHeight: number
    greeting: string | null
    greetingCount: number
    hidden: boolean
}

export type LauncherBackdrop = 'light' | 'dark'

interface PendingLogo {
  file: File | null // null: the saved logo is to be removed
  url: string | null
  transparent: boolean
}

// Per agent, outside the component: the tabs unmount this form, and the rest of an
// unsaved edit survives that, so a chosen logo has to as well.
const pendingLogos = new Map<string, PendingLogo>()

interface LogoFacts {
  width: number
  height: number
  hasTransparency: boolean
}

async function readLogo(url: string): Promise<LogoFacts> {
  const image = new Image()
  image.src = url
  await image.decode()
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = ALPHA_SAMPLE_PIXELS
  const context = canvas.getContext('2d', { willReadFrequently: true })
  let hasTransparency = false
  if (context) {
    context.drawImage(image, 0, 0, ALPHA_SAMPLE_PIXELS, ALPHA_SAMPLE_PIXELS)
    const { data } = context.getImageData(0, 0, ALPHA_SAMPLE_PIXELS, ALPHA_SAMPLE_PIXELS)
    for (let alpha = 3; alpha < data.length && !hasTransparency; alpha += 4) {
      hasTransparency = data[alpha] < OPAQUE
    }
  }
  return { width: image.naturalWidth, height: image.naturalHeight, hasTransparency }
}

/**
 * Launcher settings for one agent. The form edits customization_metadata.launcher;
 * a chosen logo stays in the browser until Save, so Cancel leaves the live one alone.
 */
export function useLauncherSettings(
  customization: Ref<AgentCustomization>,
  agentId: () => string,
  locked: () => boolean,
) {
  const trialAnimation = ref<LauncherAnimation | null>(null)
  const pending = shallowRef<PendingLogo | null>(pendingLogos.get(agentId()) ?? null)
  const logoError = ref<string | null>(null)
  const upsell = ref<'icon' | 'animation' | null>(null)

  const metadata = computed<Record<string, any>>(() => customization.value.customization_metadata ?? {})
  const stored = computed<Record<string, any>>(() => metadata.value.launcher ?? {})

  // A row with nothing saved predates this feature and keeps the original size; an
  // agent with no row yet starts Medium, as the server serves it.
  const defaults = computed<LauncherStyle>(() => ({
    ...LAUNCHER_DEFAULTS,
    size: customization.value.id ? LAUNCHER_DEFAULTS.size : 'md',
  }))

  const chosen = computed<LauncherStyle>(() => ({ ...defaults.value, ...pickLauncherStyle(stored.value) }))

  const isPaidAnimation = (animation: LauncherAnimation) => PAID_ANIMATIONS.includes(animation)

  /** What a visitor gets on this plan: paid choices are kept but fall back. */
  const allowed = computed<LauncherStyle>(() => {
    const style = { ...chosen.value }
    if (locked()) {
      if (style.icon === 'logo') style.icon = 'dots'
      if (isPaidAnimation(style.animation)) style.animation = 'classic'
    }
    return style
  })

  const downgraded = computed(() =>
    locked() && (chosen.value.icon === 'logo' || isPaidAnimation(chosen.value.animation)))

  const logoUrl = computed<string | null>(() => {
    if (pending.value) return pending.value.url
    return customization.value.icon_url ? resolveUploadUrl(customization.value.icon_url) : null
  })
  const logoName = computed(() => pending.value?.file?.name ?? 'Your logo')
  const logoTransparent = computed(() =>
    pending.value?.file ? pending.value.transparent : !!stored.value.logo_transparent)

  const update = (patch: Partial<LauncherStyle>) => {
    customization.value.customization_metadata = {
      ...metadata.value,
      launcher: { ...stored.value, ...patch },
    }
  }

  const pickIcon = (icon: LauncherIcon) => {
    if (icon === 'logo' && locked()) {
      upsell.value = 'icon'
      return
    }
    upsell.value = null
    update({ icon })
  }

  const pickAnimation = (animation: LauncherAnimation) => {
    if (isPaidAnimation(animation) && locked()) {
      trialAnimation.value = animation
      upsell.value = 'animation'
      return
    }
    trialAnimation.value = null
    upsell.value = null
    update({ animation })
  }

  const pickBackground = (background: LauncherBackground) => {
    const patch: Partial<LauncherStyle> = { background }
    if (background === 'none' && BUTTON_ANIMATIONS.includes(chosen.value.animation)) patch.animation = 'none'
    update(patch)
  }

  const setPending = (next: PendingLogo | null) => {
    if (pending.value?.url) URL.revokeObjectURL(pending.value.url)
    pending.value = next
    if (next) pendingLogos.set(agentId(), next)
    else pendingLogos.delete(agentId())
  }

  const refuse = (message: string) => {
    logoError.value = message
  }

  const pickFile = async (file: File) => {
    logoError.value = null
    if (!LOGO_ACCEPT.split(',').includes(file.type)) return refuse('Use a PNG, WebP or JPEG file.')
    if (file.size > LOGO_MAX_BYTES) return refuse('That file is over 1 MB. Try a smaller one.')

    const url = URL.createObjectURL(file)
    let facts: LogoFacts
    try {
      facts = await readLogo(url)
    } catch {
      URL.revokeObjectURL(url)
      return refuse("That file isn't an image we can read.")
    }
    if (Math.min(facts.width, facts.height) < LOGO_MIN_PIXELS) {
      URL.revokeObjectURL(url)
      return refuse(`That image is too small. Use one at least ${LOGO_MIN_PIXELS} px wide and tall.`)
    }

    setPending({ file, url, transparent: facts.hasTransparency })
    const background = stored.value.background as LauncherBackground | undefined
    const fits = background && (background !== 'none' || facts.hasTransparency)
    update({ icon: 'logo', background: fits ? background : facts.hasTransparency ? 'none' : 'white' })
  }

  const removeLogo = () => {
    setPending(customization.value.icon_url ? { file: null, url: null, transparent: false } : null)
    logoError.value = null
    update({ icon: 'dots' })
  }

  // The server's row after a logo change: icon_url plus the logo's own metadata.
  const keepSaved = (saved: Partial<AgentCustomization> | undefined) => {
    customization.value = { ...customization.value, ...saved }
  }

  /**
   * Apply the staged logo change. Call after the form has saved, so a failed save
   * never leaves a new logo live; a failed upload keeps it staged to retry.
   */
  const commitLogo = async () => {
    try {
      if (pending.value?.file) {
        keepSaved(await agentService.uploadLauncherLogo(agentId(), pending.value.file))
      } else if (pending.value) {
        keepSaved(await agentService.removeLauncherLogo(agentId()))
        customization.value.icon_url = undefined
      }
    } catch (error: any) {
      const message = error?.response?.data?.detail
      logoError.value = typeof message === 'string' ? message : "We couldn't save your logo. Try again."
      throw new Error(logoError.value)
    }
    setPending(null)
  }

  const previewStyle = computed<LauncherStyle>(() => ({
    ...allowed.value,
    animation: trialAnimation.value ?? allowed.value.animation,
  }))

  return {
    allowed,
    downgraded,
    logoError,
    logoName,
    logoTransparent,
    logoUrl,
    look: computed(() => launcherLook(previewStyle.value, logoUrl.value)),
    trialAnimation,
    upsell,
    commitLogo,
    pickAnimation,
    pickBackground,
    pickFile,
    pickIcon,
    removeLogo,
    update,
  }
}

export type LauncherSettings = ReturnType<typeof useLauncherSettings>

// Launcher colour swatches: the ChatterMate mark first, then the brand accents.
export const LAUNCHER_SWATCHES = [DEFAULT_LAUNCHER_COLOR, BRAND_COLORS.lime, BRAND_COLORS.coral, '#9D8CFF', '#5FE3D6', '#6EA8FF']

/** Everything the launcher preview draws, from the form as it stands. */
export function launcherPreview(
  settings: LauncherSettings,
  customization: AgentCustomization,
  display: Record<string, any>,
  window: { width: number; height: number },
  greetingsLocked: boolean,
): LauncherPreview {
  const messages = customization.chat_initiation_messages ?? []
  return {
    look: settings.look.value,
    logoUrl: settings.logoUrl.value,
    brand: customization.chat_bubble_color ?? DEFAULT_LAUNCHER_COLOR,
    side: display.side === 'left' ? 'left' : 'right',
    windowWidth: display.width ?? window.width,
    windowHeight: display.height ?? window.height,
    greeting: greetingsLocked ? null : messages[0] ?? null,
    greetingCount: messages.length,
    hidden: display.launcher === false,
  }
}

const labelOf = <T extends string>(options: { value: T; label: string }[], value: T) =>
  options.find((option) => option.value === value)?.label ?? value

/** One line for the closed Launcher section, e.g. "Small · Circle · Chat · Bounce". */
export function launcherSummary(style: LauncherStyle): string {
  const icon = style.icon === 'logo' ? 'Your logo' : labelOf(LAUNCHER_ICONS, style.icon)
  return [labelOf(LAUNCHER_SIZES, style.size), labelOf(LAUNCHER_SHAPES, style.shape), icon,
    labelOf(LAUNCHER_ANIMATIONS, style.animation)].join(' · ')
}
