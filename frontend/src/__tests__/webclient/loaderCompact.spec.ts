// @vitest-environment node
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

import { beforeAll, describe, expect, it } from 'vitest'
import { build } from 'esbuild'
import { JSDOM } from 'jsdom'
import { compactLoaderSource, compactTemplateText } from '../../../scripts/loader-css'
import { loaderBuildOptions } from '../../../scripts/loader-build'

/**
 * The build step that takes the comments and indentation out of the loader's
 * template-literal CSS: what it touches, and that the bundle it makes gives the
 * page exactly the same stylesheet and markup as the plain one.
 */

describe('compactLoaderSource', () => {
    it('drops CSS comments and indentation from multi-line template text', () => {
        const source = 'const css = `\n      /* The launcher */\n      #b {\n        color: red;\n      }\n    `'
        expect(compactLoaderSource(source)).toBe('const css = `\n#b {\ncolor: red;\n}\n`')
    })

    it('keeps the CSS meaning of a comment between two selectors', () => {
        expect(compactTemplateText('\n  .a/* x */.b { }')).toBe('\n.a.b { }')
    })

    it('leaves code, strings, regexes, expressions and one-line templates alone', () => {
        const source = [
            "const a = '/* not css */'",
            'const r = /\\/\\*  x/g',
            'const t = `bottom ${side}  /* one line */`',
            'const n = `\n  ${cond ? `\n    /* inner */\n    x` : \'/* kept */\'}\n  y`',
            'const tagged = String.raw`\n  /* raw */\n`',
            '/* a real comment */ const z = 1',
        ].join('\n')
        const out = compactLoaderSource(source)
        expect(out).toContain("const a = '/* not css */'")
        expect(out).toContain('const r = /\\/\\*  x/g')
        expect(out).toContain('`bottom ${side}  /* one line */`')
        expect(out).toContain("const n = `\n${cond ? `\nx` : '/* kept */'}\ny`")
        expect(out).toContain('String.raw`\n  /* raw */\n`')
        expect(out).toContain('/* a real comment */ const z = 1')
    })
})

describe('the compacted loader bundle', () => {
    const bundles: Record<'plain' | 'compact', string> = { plain: '', compact: '' }

    beforeAll(async () => {
        const options = loaderBuildOptions({ outfile: 'chattermate.min.js', apiUrl: 'https://api.example.com/api/v1', nodeEnv: 'production', minify: true })
        const compact = await build({ ...options, write: false })
        const plain = await build({ ...options, plugins: [], write: false })
        bundles.compact = compact.outputFiles[0].text
        bundles.plain = plain.outputFiles[0].text
    }, 30000)

    /** What the loader leaves on a page with `options`, after the frame sends `look`. */
    async function render(bundle: string, options: Record<string, unknown>, look?: Record<string, unknown>) {
        const dom = new JSDOM('<!doctype html><html><head></head><body></body></html>', { runScripts: 'outside-only', url: 'https://shop.example/' })
        const w = dom.window as any
        w.chattermateId = 'w-1'
        w.chattermateBaseUrl = 'https://api.example.com/api/v1'
        w.chattermateConfig = options
        w.fetch = () => new Promise(() => {})
        w.eval(bundle)
        // The loader builds on DOMContentLoaded while the document is still loading.
        if (w.document.readyState === 'loading') await new Promise(done => w.document.addEventListener('DOMContentLoaded', done))
        const iframe = w.document.querySelector('.chattermate-iframe')
        const say = (data: Record<string, unknown>) =>
            w.dispatchEvent(new w.MessageEvent('message', { data, origin: 'https://api.example.com', source: iframe.contentWindow }))
        say({ type: 'FRAME_READY' })
        say({ type: 'WIDGET_READY' })
        if (look) say({ type: 'CUSTOMIZATION_UPDATE', data: look })
        const normalize = (text: string) => text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ').trim()
        const out = {
            css: normalize(w.document.getElementById('chattermate-styles').textContent),
            markup: normalize(w.document.body.innerHTML),
            rawCss: w.document.getElementById('chattermate-styles').textContent.length,
        }
        w.ChatterMate.destroy()
        dom.window.close()
        return out
    }

    it('is smaller', () => {
        expect(bundles.compact.length).toBeLessThan(bundles.plain.length - 8000)
    })

    const LOOK = { ui: 2, radius: 22, elevation: 'dark', glow: 'rgba(157,140,255,.26)', glass: true }
    it.each([
        ['the widget before the frame says how to frame it', {}, { chat_bubble_color: '#2F5BEA' }],
        ['the widget', {}, { chat_bubble_color: '#2F5BEA', panel: LOOK }],
        ['a drawer', { displayMode: 'sidebar-right' }, { chat_bubble_color: '#2F5BEA', panel: LOOK }],
        ['the search bar', { displayMode: 'search-bar' }, { chat_bubble_color: '#2F5BEA', chat_style: 'ASK_ANYTHING', panel: LOOK }],
        ['the bottom sheet', { mobileMode: 'sheet', launcher: false }, { chat_bubble_color: '#2F5BEA', panel: LOOK }],
    ])('gives %s the same stylesheet and markup', async (_name, options, look) => {
        const plain = await render(bundles.plain, options, look)
        const compact = await render(bundles.compact, options, look)
        expect(compact.css).toBe(plain.css)
        expect(compact.markup).toBe(plain.markup)
        expect(compact.rawCss).toBeLessThan(plain.rawCss)
        // The panel's rules are always there; the look really arrived.
        expect(plain.css).toContain('#chattermate-container.cm-v2')
        expect(plain.css).toContain('#2F5BEA')
    })
})
