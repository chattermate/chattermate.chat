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

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref } from 'vue'
import { useLauncherSettings, type LauncherSettings } from '@/composables/useLauncherSettings'
import LauncherSection from '@/components/agent/LauncherSection.vue'
import { agentService } from '@/services/agent'
import type { AgentCustomization } from '@/types/agent'

vi.mock('@/services/agent', () => ({
  agentService: { uploadLauncherLogo: vi.fn(), removeLauncherLogo: vi.fn() },
}))
vi.mock('@/config/api', () => ({ resolveUploadUrl: (url: string) => url }))

/** What readLogo sees in the browser; jsdom can't decode images. */
function fakeImage({ width = 200, height = 200, alpha = 255, broken = false } = {}) {
  vi.stubGlobal('Image', class {
    naturalWidth = width
    naturalHeight = height
    src = ''
    decode = () => (broken ? Promise.reject(new Error('bad')) : Promise.resolve())
  })
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
    drawImage: () => {},
    getImageData: () => ({ data: new Uint8ClampedArray([0, 0, 0, alpha]) }),
  } as any)
}

const png = (bytes = 10, type = 'image/png') => new File([new Uint8Array(bytes)], 'logo.png', { type })

let agentCount = 0

function setup(customization: Partial<AgentCustomization> = {}, locked = false, agentId = `agent-${++agentCount}`) {
  const state = ref({ id: 1, ...customization } as AgentCustomization)
  const lockedRef = ref(locked)
  let settings!: LauncherSettings
  const wrapper = mount(defineComponent({
    setup() {
      settings = useLauncherSettings(state, () => agentId, () => lockedRef.value)
      return () => h(LauncherSection, {
        settings, locked: lockedRef.value, hiddenNote: null, phoneOnlyNote: null,
      })
    },
  }), { global: { stubs: { 'font-awesome-icon': true } } })
  return { state, settings, wrapper, launcher: () => state.value.customization_metadata?.launcher }
}

const chip = (wrapper: ReturnType<typeof setup>['wrapper'], label: string) =>
  wrapper.findAll('button').find((button) => button.text().startsWith(label))!

describe('useLauncherSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    URL.createObjectURL = vi.fn(() => 'blob:logo')
    URL.revokeObjectURL = vi.fn()
    fakeImage()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  describe('defaults', () => {
    it('a saved agent with nothing chosen keeps the original size', () => {
      expect(setup().settings.allowed.value.size).toBe('lg')
    })

    it('an agent with no row yet starts Medium', () => {
      expect(setup({ id: 0 }).settings.allowed.value.size).toBe('md')
    })
  })

  describe('free options', () => {
    it('saves into the launcher key and leaves the rest of the metadata', () => {
      const { settings, state } = setup({ customization_metadata: { avatar_style: 'orb', launcher: { shape: 'circle' } } })
      settings.update({ size: 'sm' })
      expect(state.value.customization_metadata).toEqual({ avatar_style: 'orb', launcher: { shape: 'circle', size: 'sm' } })
    })

    it('ignores stored values it does not know', () => {
      const { settings } = setup({ customization_metadata: { launcher: { size: 'huge' } } })
      expect(settings.allowed.value.size).toBe('lg')
    })
  })

  describe('locked plan', () => {
    it('a premium animation plays in the preview but is not saved', () => {
      const { settings, launcher } = setup({}, true)
      settings.pickAnimation('swoosh')
      expect(settings.look.value.animation).toBe('swoosh')
      expect(settings.upsell.value).toBe('animation')
      expect(launcher()).toBeUndefined()
    })

    it('picking a free animation ends the trial', () => {
      const { settings, launcher } = setup({}, true)
      settings.pickAnimation('glow')
      settings.pickAnimation('bounce')
      expect(settings.trialAnimation.value).toBeNull()
      expect(settings.upsell.value).toBeNull()
      expect(launcher().animation).toBe('bounce')
    })

    it('the logo is refused with the upsell by its row', () => {
      const { settings, launcher } = setup({}, true)
      settings.pickIcon('logo')
      expect(settings.upsell.value).toBe('icon')
      expect(launcher()).toBeUndefined()
    })

    it('a downgraded org sees the fallback, and its choice is kept', () => {
      const stored = { launcher: { icon: 'logo', animation: 'glow' } }
      const { settings, state } = setup({ customization_metadata: stored, icon_url: '/l.webp' }, true)
      expect(settings.downgraded.value).toBe(true)
      expect(settings.allowed.value.icon).toBe('dots')
      expect(settings.allowed.value.animation).toBe('classic')
      expect(settings.look.value.isLogo).toBe(false)
      expect(state.value.customization_metadata).toEqual(stored)
    })

    it('a paying org is not told it was downgraded', () => {
      const { settings } = setup({ customization_metadata: { launcher: { icon: 'logo' } } })
      expect(settings.downgraded.value).toBe(false)
    })
  })

  describe('choosing a logo', () => {
    it('a transparent file defaults to no background', async () => {
      fakeImage({ alpha: 0 })
      const { settings, launcher } = setup()
      await settings.pickFile(png())
      expect(launcher()).toMatchObject({ icon: 'logo', background: 'none' })
      expect(settings.logoUrl.value).toBe('blob:logo')
      expect(settings.logoTransparent.value).toBe(true)
      expect(agentService.uploadLauncherLogo).not.toHaveBeenCalled()
    })

    it('an opaque file defaults to white', async () => {
      const { settings, launcher } = setup()
      await settings.pickFile(png())
      expect(launcher().background).toBe('white')
    })

    it('an opaque file cannot keep background None', async () => {
      const { settings, launcher } = setup({ customization_metadata: { launcher: { background: 'none' } } })
      await settings.pickFile(png())
      expect(launcher().background).toBe('white')
    })

    it('keeps a background that still fits', async () => {
      const { settings, launcher } = setup({ customization_metadata: { launcher: { background: 'brand' } } })
      await settings.pickFile(png())
      expect(launcher().background).toBe('brand')
    })

    it.each([
      [() => png(10, 'image/gif'), {}, 'PNG, WebP or JPEG'],
      [() => png(10, 'image/svg+xml'), {}, 'PNG, WebP or JPEG'],
      [() => png(1024 * 1024 + 1), {}, 'over 1 MB'],
      [() => png(), { broken: true }, "isn't an image"],
      [() => png(), { width: 95 }, 'too small'],
    ])('refuses %#', async (file, image, message) => {
      fakeImage(image)
      const { settings, launcher } = setup()
      await settings.pickFile(file())
      expect(settings.logoError.value).toContain(message)
      expect(settings.logoUrl.value).toBeNull()
      expect(launcher()).toBeUndefined()
    })

    it('a refused file leaves the staged one in place, and a good one clears the error', async () => {
      const { settings } = setup()
      await settings.pickFile(png())
      await settings.pickFile(png(10, 'image/gif'))
      expect(settings.logoUrl.value).toBe('blob:logo')
      await settings.pickFile(png())
      expect(settings.logoError.value).toBeNull()
    })

    it('releases the previous preview', async () => {
      const { settings } = setup()
      await settings.pickFile(png())
      await settings.pickFile(png())
      expect(URL.revokeObjectURL).toHaveBeenCalledTimes(1)
    })

    it('background None turns off animations that need a button', () => {
      const { settings, launcher } = setup({ customization_metadata: { launcher: { animation: 'classic' } } })
      settings.pickBackground('none')
      expect(launcher()).toMatchObject({ background: 'none', animation: 'none' })
    })

    it('a saved logo reports its transparency', () => {
      const { settings } = setup({ customization_metadata: { launcher: { logo_transparent: true } }, icon_url: '/l.webp' })
      expect(settings.logoTransparent.value).toBe(true)
      expect(settings.logoUrl.value).toBe('/l.webp')
    })
  })

  describe('saving', () => {
    it('uploads the staged file once', async () => {
      vi.mocked(agentService.uploadLauncherLogo).mockResolvedValue({ id: 7, icon_url: 'https://s3/l.webp' } as any)
      const { settings, state } = setup()
      await settings.pickFile(png())
      await settings.commitLogo()
      await settings.commitLogo()
      expect(agentService.uploadLauncherLogo).toHaveBeenCalledTimes(1)
      expect(state.value.icon_url).toBe('https://s3/l.webp')
      expect(state.value.id).toBe(7)
      expect(settings.logoUrl.value).toBe('https://s3/l.webp')
    })

    it('keeps the file staged and shows the server reason when the upload fails', async () => {
      vi.mocked(agentService.uploadLauncherLogo).mockRejectedValue({ response: { data: { detail: 'That image is too large.' } } })
      const { settings } = setup()
      await settings.pickFile(png())
      await expect(settings.commitLogo()).rejects.toThrow('too large')
      expect(settings.logoError.value).toBe('That image is too large.')
      expect(settings.logoUrl.value).toBe('blob:logo')

      vi.mocked(agentService.uploadLauncherLogo).mockResolvedValue({ id: 1, icon_url: 'https://s3/l.webp' } as any)
      await settings.commitLogo()
      expect(settings.logoUrl.value).toBe('https://s3/l.webp')
    })

    it("keeps the server's logo metadata after the upload", async () => {
      vi.mocked(agentService.uploadLauncherLogo).mockResolvedValue({
        id: 7, icon_url: 'https://s3/l.webp', customization_metadata: { launcher: { icon: 'logo', logo_transparent: true } },
      } as any)
      const { settings, state } = setup()
      await settings.pickFile(png())
      await settings.commitLogo()
      expect(state.value.customization_metadata?.launcher?.logo_transparent).toBe(true)
      expect(settings.logoTransparent.value).toBe(true)
    })

    it('has a fallback for errors with no reason', async () => {
      vi.mocked(agentService.uploadLauncherLogo).mockRejectedValue({ response: { data: { detail: [{ msg: 'x' }] } } })
      const { settings } = setup()
      await settings.pickFile(png())
      await expect(settings.commitLogo()).rejects.toThrow("couldn't save")
    })

    it('Remove waits for Save, then deletes and falls back to Dots', async () => {
      const { settings, state, launcher } = setup({ icon_url: '/l.webp', customization_metadata: { launcher: { icon: 'logo' } } }, false, 'removing')
      settings.removeLogo()
      expect(settings.logoUrl.value).toBeNull()
      expect(launcher().icon).toBe('dots')
      expect(agentService.removeLauncherLogo).not.toHaveBeenCalled()
      await settings.commitLogo()
      expect(agentService.removeLauncherLogo).toHaveBeenCalledWith('removing')
      expect(state.value.icon_url).toBeUndefined()
    })

    it('removing a logo that was never saved calls nothing', async () => {
      const { settings } = setup()
      await settings.pickFile(png())
      settings.removeLogo()
      await settings.commitLogo()
      expect(agentService.removeLauncherLogo).not.toHaveBeenCalled()
      expect(agentService.uploadLauncherLogo).not.toHaveBeenCalled()
    })

    it('with nothing staged, does nothing', async () => {
      await setup().settings.commitLogo()
      expect(agentService.uploadLauncherLogo).not.toHaveBeenCalled()
    })

    it('a chosen logo survives a tab change and still saves', async () => {
      vi.mocked(agentService.uploadLauncherLogo).mockResolvedValue({ id: 1, icon_url: 'https://s3/l.webp' } as any)
      const first = setup({}, false, 'tabs')
      await first.settings.pickFile(png())
      first.wrapper.unmount()
      expect(URL.revokeObjectURL).not.toHaveBeenCalled()

      const second = setup({ customization_metadata: first.state.value.customization_metadata }, false, 'tabs')
      expect(second.settings.logoUrl.value).toBe('blob:logo')
      expect(second.settings.logoName.value).toBe('logo.png')
      await second.settings.commitLogo()
      expect(agentService.uploadLauncherLogo).toHaveBeenCalledTimes(1)
      expect(setup({}, false, 'tabs').settings.logoUrl.value).toBeNull()
    })

    it('a pending removal survives a tab change too', () => {
      const first = setup({ icon_url: '/l.webp' }, false, 'removal-tabs')
      first.settings.removeLogo()
      expect(setup({ icon_url: '/l.webp' }, false, 'removal-tabs').settings.logoUrl.value).toBeNull()
    })

    it("one agent's chosen logo never shows on another", async () => {
      const first = setup({}, false, 'one')
      await first.settings.pickFile(png())
      expect(setup({}, false, 'two').settings.logoUrl.value).toBeNull()
    })
  })

  describe('LauncherSection', () => {
    it('marks the selected chip for screen readers', async () => {
      const { wrapper } = setup({ customization_metadata: { launcher: { size: 'sm' } } })
      expect(chip(wrapper, 'Small').attributes('aria-checked')).toBe('true')
      expect(chip(wrapper, 'Large').attributes('aria-checked')).toBe('false')
      await chip(wrapper, 'Large').trigger('click')
      expect(chip(wrapper, 'Large').attributes('aria-checked')).toBe('true')
    })

    it('names premium options, locked or not', () => {
      expect(chip(setup().wrapper, 'Swoosh').attributes('aria-label')).toBe('Swoosh, premium')
      expect(chip(setup({}, true).wrapper, 'Your logo').attributes('aria-label')).toBe('Your logo, premium')
    })

    it('puts the upsell right under the clicked row', async () => {
      const { wrapper } = setup({}, true)
      await chip(wrapper, 'Swoosh').trigger('click')
      expect(wrapper.text()).toContain('Swoosh is on Base and Pro.')
      await chip(wrapper, 'Your logo').trigger('click')
      expect(wrapper.text()).toContain('Your own logo is on Base and Pro.')
      expect(wrapper.text()).not.toContain('Swoosh is on Base')
    })

    it('shows the upload once the logo is chosen, and the file after', async () => {
      const { wrapper, settings } = setup()
      expect(wrapper.text()).not.toContain('Upload logo')
      await chip(wrapper, 'Your logo').trigger('click')
      expect(wrapper.text()).toContain('Upload logo')
      await settings.pickFile(png())
      await nextTick()
      expect(wrapper.text()).toContain('logo.png')
      expect(wrapper.text()).toContain('Replace')
    })

    it('shows the refusal inline', async () => {
      const { wrapper, settings } = setup({ customization_metadata: { launcher: { icon: 'logo' } } })
      await settings.pickFile(png(10, 'image/gif'))
      await nextTick()
      expect(wrapper.find('[role="alert"]').text()).toContain('PNG, WebP or JPEG')
    })

    it('background None is off for an opaque logo', async () => {
      const { wrapper, settings } = setup()
      await settings.pickFile(png())
      await nextTick()
      const none = wrapper.findAll('button').filter((button) => button.text() === 'None')[0]
      expect(none.attributes('disabled')).toBeDefined()
      expect(wrapper.text()).toContain('None needs a transparent PNG or WebP.')
    })

    it('with no background: no Shape, and no Classic or Glow', async () => {
      fakeImage({ alpha: 0 })
      const { wrapper, settings } = setup()
      await settings.pickFile(png())
      await nextTick()
      expect(wrapper.text()).not.toContain('Shape')
      expect(chip(wrapper, 'Classic').attributes('disabled')).toBeDefined()
      expect(chip(wrapper, 'Glow').attributes('disabled')).toBeDefined()
      expect(chip(wrapper, 'Swoosh').attributes('disabled')).toBeUndefined()
    })

    it('shows the downgrade notice', () => {
      const { wrapper } = setup({ customization_metadata: { launcher: { animation: 'glow' } } }, true)
      expect(wrapper.text()).toContain('off on your current plan')
    })

    it('replaces the controls when the launcher is hidden', () => {
      const state = ref({ id: 1 } as AgentCustomization)
      const wrapper = mount(defineComponent({
        setup() {
          const settings = useLauncherSettings(state, () => 'a', () => false)
          return () => h(LauncherSection, { settings, locked: false, hiddenNote: 'The launcher is hidden.', phoneOnlyNote: null })
        },
      }), { global: { stubs: { 'font-awesome-icon': true } } })
      expect(wrapper.text()).toContain('The launcher is hidden.')
      expect(wrapper.find('[role="radiogroup"]').exists()).toBe(false)
    })
  })
})
