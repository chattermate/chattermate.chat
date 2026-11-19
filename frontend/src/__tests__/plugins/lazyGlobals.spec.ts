import { describe, expect, it } from 'vitest'
import { defineComponent, h, resolveComponent } from 'vue'
import { flushPromises, mount } from '@vue/test-utils'
import { findIconDefinition } from '@fortawesome/fontawesome-svg-core'
import { loadApexChart, loadFontAwesomeIcon, registerLazyGlobals } from '@/plugins/lazyGlobals'

describe('lazyGlobals', () => {
    it('loads the icon component with every icon set registered', async () => {
        const component = await loadFontAwesomeIcon()

        expect(component).toBeTruthy()
        expect(findIconDefinition({ prefix: 'fas', iconName: 'lock' })).toBeTruthy()
        expect(findIconDefinition({ prefix: 'far', iconName: 'clock' })).toBeTruthy()
        expect(findIconDefinition({ prefix: 'fab', iconName: 'whatsapp' })).toBeTruthy()
    })

    it('loads the chart component', async () => {
        expect(await loadApexChart()).toBeTruthy()
    })

    it('renders an icon by name once its code has loaded', async () => {
        const Page = defineComponent({ render: () => h('div', [h(resolveComponent('font-awesome-icon'), { icon: ['fas', 'lock'] })]) })
        const wrapper = mount(Page, { global: { plugins: [{ install: registerLazyGlobals }] } })
        await loadFontAwesomeIcon()
        await flushPromises()
        await flushPromises()

        expect(wrapper.find('svg[data-icon="lock"]').exists()).toBe(true)
    })
})

