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

import { describe, expect, it } from 'vitest'
import { sanitizeHtml } from '@/utils/sanitize'
import { renderMarkdown } from '@/webclient/markdown'

// Both the dashboard chat and the embedded widget render model output through
// sanitizeHtml, so this is the one place an XSS bypass would have to get past.
// The cases pin the behaviour of the DOMPurify config AND the two global hooks
// registered in src/utils/sanitize.ts, so a DOMPurify upgrade cannot quietly
// change what survives.

describe('sanitizeHtml', () => {
  describe('keeps the formatting a chat answer needs', () => {
    it('leaves basic markup and tables alone', () => {
      const html = '<p>Hi <strong>there</strong></p><ul><li>one</li></ul><table><tr><td>x</td></tr></table>'
      expect(sanitizeHtml(html)).toBe(
        '<p>Hi <strong>there</strong></p><ul><li>one</li></ul><table><tbody><tr><td>x</td></tr></tbody></table>',
      )
    })

    it('keeps https links but forces them to open safely in a new tab', () => {
      const out = sanitizeHtml('<a href="https://example.com/docs">docs</a>')
      expect(out).toContain('href="https://example.com/docs"')
      expect(out).toContain('target="_blank"')
      expect(out).toContain('rel="noopener noreferrer nofollow"')
    })

    it('keeps mailto links', () => {
      expect(sanitizeHtml('<a href="mailto:a@b.co">mail</a>')).toContain('href="mailto:a@b.co"')
    })

    it('returns an empty string for empty input', () => {
      expect(sanitizeHtml('')).toBe('')
    })
  })

  describe('strips script execution vectors', () => {
    it.each([
      ['script tag', '<p>x</p><script>alert(1)</script>'],
      ['iframe', '<iframe src="https://evil.example"></iframe>'],
      ['object/embed', '<object data="x"></object><embed src="x">'],
      ['form controls', '<form action="/x"><input onfocus="alert(1)" autofocus></form>'],
      ['template', '<template><img src=x onerror=alert(1)></template>'],
      ['style block', '<style>body{background:url(javascript:alert(1))}</style>'],
    ])('removes %s', (_label, html) => {
      const out = sanitizeHtml(html)
      expect(out).not.toMatch(/<(script|iframe|object|embed|form|input|template|style)/i)
      expect(out).not.toContain('alert(1)')
    })

    it('removes every on* event handler attribute', () => {
      const out = sanitizeHtml('<div onclick="alert(1)" onmouseover="alert(2)" onfoo="alert(3)">x</div>')
      expect(out).toBe('<div>x</div>')
    })

    it('removes svg, math and foreignObject subtrees entirely', () => {
      const out = sanitizeHtml('<p>a</p><svg><foreignObject><script>alert(1)</script></foreignObject></svg><math><mi>x</mi></math>')
      expect(out).toBe('<p>a</p>')
    })

    it('removes img, area and map even though they carry no script', () => {
      const out = sanitizeHtml('<p>a</p><img src="https://x/y.png"><map name="m"><area href="https://x"></map>')
      expect(out).toBe('<p>a</p>')
    })
  })

  describe('strips dangerous URLs from links', () => {
    it.each([
      ['javascript:', 'javascript:alert(1)'],
      ['mixed-case javascript:', 'JaVaScRiPt:alert(1)'],
      ['url-encoded javascript:', 'javascript%3Aalert(1)'],
      ['data:text/html', 'data:text/html,<script>alert(1)</script>'],
      ['vbscript:', 'vbscript:msgbox(1)'],
      ['file:', 'file:///etc/passwd'],
      ['ftp (not in the anchor allow-list)', 'ftp://example.com/x'],
      ['protocol-relative', '//evil.example/x'],
      ['relative path', '/login'],
    ])('drops the href for %s', (_label, href) => {
      const out = sanitizeHtml(`<a href="${href}">x</a>`)
      expect(out).not.toContain('href=')
      expect(out).toContain('>x</a>')
    })
  })

  describe('strips dangerous inline styles', () => {
    it.each([
      'expression(alert(1))',
      'behavior:url(x.htc)',
      '-moz-binding:url(x.xml)',
      'background:url(javascript:alert(1))',
    ])('drops a style containing %s', (style) => {
      expect(sanitizeHtml(`<span style="${style}">x</span>`)).not.toContain('style=')
    })
  })

  it('does not let a mutation-XSS payload survive re-parsing', () => {
    // Classic mXSS shape: a noscript boundary that turns into markup once the
    // sanitised string is parsed again by the browser. The payload text may
    // legitimately survive inside a quoted attribute; what must not survive is
    // an element that executes after the second parse.
    const out = sanitizeHtml('<noscript><p title="</noscript><img src=x onerror=alert(1)>">')
    const reparsed = new DOMParser().parseFromString(out, 'text/html')
    expect(reparsed.querySelector('noscript, img, [onerror]')).toBeNull()
  })
})

describe('renderMarkdown', () => {
  it('turns markdown into sanitised HTML with hardened links', () => {
    const out = renderMarkdown('**bold** and [docs](https://example.com)')
    expect(out).toContain('<strong>bold</strong>')
    expect(out).toContain('href="https://example.com"')
    expect(out).toContain('rel="noopener noreferrer nofollow"')
  })

  it('drops javascript links written in markdown', () => {
    const out = renderMarkdown('[click](javascript:alert(1))')
    expect(out).not.toContain('javascript:')
    expect(out).not.toContain('href=')
    expect(out).toContain('click')
  })

  it('strips raw HTML script vectors embedded in markdown', () => {
    const out = renderMarkdown('hello <img src=x onerror=alert(1)> world')
    expect(out).not.toContain('onerror')
    expect(out).toContain('hello')
  })

  it('renders nothing for empty or missing text', () => {
    expect(renderMarkdown('')).toBe('')
  })
})
