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

import DOMPurify from 'dompurify'

// Register DOMPurify hooks once on module load to prevent duplicate registrations
DOMPurify.addHook('uponSanitizeElement', (node, data) => {
  // Block SVG elements entirely
  if (data.tagName === 'svg') {
    node.parentNode?.removeChild(node)
    return
  }

  // Block math elements
  if (data.tagName === 'math') {
    node.parentNode?.removeChild(node)
    return
  }

  // Block any foreign objects
  if (data.tagName === 'foreignobject') {
    node.parentNode?.removeChild(node)
    return
  }

  // SECURITY: Remove <img>, <area>, and <map> tags completely. Anchors are kept
  // (clickable links) but hardened in afterSanitizeAttributes: protocol-restricted
  // to http(s)/mailto and forced target="_blank" rel="noopener noreferrer nofollow".
  const element = node as HTMLElement
  const tagName = data.tagName?.toUpperCase()
  if (tagName === 'IMG' || tagName === 'AREA' || tagName === 'MAP') {
    element.parentNode?.removeChild(element)
  }
})

DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  // Block javascript: URIs (including encoded variants)
  if (node.hasAttribute('href')) {
    const href = node.getAttribute('href') || ''
    try {
      const decodedHref = decodeURIComponent(href.toLowerCase())

      if (
        decodedHref.includes('javascript:') ||
        decodedHref.includes('data:text/html') ||
        decodedHref.includes('vbscript:') ||
        decodedHref.includes('about:') ||
        decodedHref.includes('file:')
      ) {
        node.removeAttribute('href')
      }
    } catch {
      // If decoding fails, use original value for comparison
      if (
        href.toLowerCase().includes('javascript:') ||
        href.toLowerCase().includes('data:text/html') ||
        href.toLowerCase().includes('vbscript:') ||
        href.toLowerCase().includes('about:') ||
        href.toLowerCase().includes('file:')
      ) {
        node.removeAttribute('href')
      }
    }
  }

  // Harden anchors so markdown links render clickable but safely: positively allow
  // only http(s)/mailto, and always open in a new tab with noopener.
  if (node.nodeName === 'A') {
    const href = (node.getAttribute('href') || '').trim()
    if (!/^(https?:|mailto:)/i.test(href)) {
      node.removeAttribute('href')
    } else {
      node.setAttribute('target', '_blank')
      node.setAttribute('rel', 'noopener noreferrer nofollow')
    }
  }

  // Block javascript: and malicious data: URIs in src
  if (node.hasAttribute('src')) {
    const src = node.getAttribute('src') || ''
    try {
      const decodedSrc = decodeURIComponent(src.toLowerCase())

      if (
        decodedSrc.includes('javascript:') ||
        decodedSrc.includes('data:text/html') ||
        decodedSrc.includes('vbscript:') ||
        decodedSrc.includes('about:') ||
        decodedSrc.includes('file:')
      ) {
        node.removeAttribute('src')
      }
    } catch {
      // If decoding fails, use original value for comparison
      if (
        src.toLowerCase().includes('javascript:') ||
        src.toLowerCase().includes('data:text/html') ||
        src.toLowerCase().includes('vbscript:') ||
        src.toLowerCase().includes('about:') ||
        src.toLowerCase().includes('file:')
      ) {
        node.removeAttribute('src')
      }
    }
  }

  // Check for CSS expressions in style attribute
  if (node.hasAttribute('style')) {
    const style = node.getAttribute('style') || ''
    try {
      const decodedStyle = decodeURIComponent(style.toLowerCase())

      if (
        decodedStyle.includes('expression(') ||
        decodedStyle.includes('behavior:') ||
        decodedStyle.includes('-moz-binding') ||
        decodedStyle.includes('import') ||
        decodedStyle.includes('javascript:') ||
        decodedStyle.includes('vbscript:')
      ) {
        node.removeAttribute('style')
      }
    } catch {
      // If decoding fails, use original value for comparison
      if (
        style.toLowerCase().includes('expression(') ||
        style.toLowerCase().includes('behavior:') ||
        style.toLowerCase().includes('-moz-binding') ||
        style.toLowerCase().includes('import') ||
        style.toLowerCase().includes('javascript:') ||
        style.toLowerCase().includes('vbscript:')
      ) {
        node.removeAttribute('style')
      }
    }
  }

  // Remove any attribute that starts with "on" (event handlers)
  Array.from(node.attributes).forEach((attr) => {
    if (attr.name.toLowerCase().startsWith('on')) {
      node.removeAttribute(attr.name)
    }
  })
})

/**
 * Comprehensive HTML sanitization to prevent all XSS attacks including:
 * - Encoded payloads (HTML entities, URL encoding, Unicode)
 * - SVG-based XSS vectors
 * - JavaScript URIs and protocol handlers
 * - Data URIs (except images)
 * - CSS expressions and injections
 * - Event handlers
 * - All dangerous HTML tags
 */
export function sanitizeHtml(html: string): string {
  // Configure DOMPurify with strict security settings
  const config = {
    // Block all dangerous tags including SVG, form elements and images.
    // NOTE: 'a' must NOT be in this list — FORBID_TAGS beats ALLOWED_TAGS, and
    // anchors are intentionally kept (markdown links) then hardened by the
    // afterSanitizeAttributes hook (http(s)/mailto only, forced target+rel).
    FORBID_TAGS: [
      'iframe', 'frame', 'frameset', 'object', 'embed', 'applet', 'script',
      'base', 'link', 'meta', 'style', 'svg', 'math', 'form', 'input',
      'button', 'textarea', 'select', 'option', 'xml', 'xss', 'import',
      'video', 'audio', 'track', 'source', 'canvas', 'details', 'template',
      'slot', 'noscript', 'marquee', 'bgsound', 'keygen', 'command',
      'img', 'area', 'map'  // SECURITY: Remove image/map tags completely
    ],

    // Block dangerous attributes
    FORBID_ATTR: [
      // Event handlers
      'onerror', 'onload', 'onclick', 'onmouseover', 'onmouseout', 'onmousemove',
      'onkeydown', 'onkeyup', 'onkeypress', 'onfocus', 'onblur', 'onchange',
      'onsubmit', 'ondblclick', 'oncontextmenu', 'oninput', 'oninvalid',
      'onreset', 'onsearch', 'onselect', 'onabort', 'oncanplay', 'oncanplaythrough',
      'oncuechange', 'ondurationchange', 'onemptied', 'onended', 'onloadeddata',
      'onloadedmetadata', 'onloadstart', 'onpause', 'onplay', 'onplaying',
      'onprogress', 'onratechange', 'onseeked', 'onseeking', 'onstalled',
      'onsuspend', 'ontimeupdate', 'onvolumechange', 'onwaiting', 'ontoggle',
      'onauxclick', 'ongotpointercapture', 'onlostpointercapture', 'onpointercancel',
      'onpointerdown', 'onpointerenter', 'onpointerleave', 'onpointermove',
      'onpointerout', 'onpointerover', 'onpointerup', 'onwheel', 'onanimationcancel',
      'onanimationend', 'onanimationiteration', 'onanimationstart', 'ontransitioncancel',
      'ontransitionend', 'ontransitionrun', 'ontransitionstart', 'ondrag', 'ondragend',
      'ondragenter', 'ondragleave', 'ondragover', 'ondragstart', 'ondrop', 'oncopy',
      'oncut', 'onpaste', 'onscroll', 'onmessage', 'onmouseenter', 'onmouseleave',
      'onmousewheel', 'onbeforeunload', 'onerrorupdate', 'onhelp', 'onmove',
      'onreadystatechange', 'onresize', 'onstart', 'onstop', 'onunload',
      'onactivate', 'onafterprint', 'onafterupdate', 'onbeforeactivate',
      'onbeforecopy', 'onbeforecut', 'onbeforedeactivate', 'onbeforeeditfocus',
      'onbeforepaste', 'onbeforeprint', 'onbeforeupdate', 'onbounce',
      'oncellchange', 'oncontrolselect', 'ondataavailable', 'ondatasetchanged',
      'ondatasetcomplete', 'ondeactivate', 'onfilterchange', 'onfinish',
      'onfocusin', 'onfocusout', 'onlayoutcomplete', 'onlosecapture',
      'onmoveend', 'onmovestart', 'onpropertychange', 'onresizeend',
      'onresizestart', 'onrowenter', 'onrowexit', 'onrowsdelete', 'onrowsinserted',
      'onselectionchange', 'onselectstart', 'onshow', 'onsort', 'onpointerrawupdate',

      // Dangerous attributes
      'formaction', 'action', 'form', 'srcdoc', 'srcset', 'dynsrc', 'lowsrc',
      'ping', 'poster', 'background', 'code', 'codebase', 'archive', 'profile',
      'xmlns', 'xlink:href', 'attributename', 'from', 'to', 'values', 'begin',
      'autofocus', 'autoplay', 'controls', 'manifest', 'sandbox',
      // SECURITY: block resource-loading attributes. 'href' is intentionally NOT
      // here (FORBID_ATTR beats ALLOWED_ATTR): markdown links need it, and the
      // afterSanitizeAttributes hook strips any href that isn't http(s)/mailto.
      'src', 'data'
    ],

    // Only allow safe protocols
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,

    // SECURITY: Strip ALL HTML tags to prevent rendering exploits
    // Only allow basic text formatting for markdown (no links, images, or any potentially dangerous tags)
    ALLOWED_TAGS: [
      'a',
      'b', 'i', 'u', 'strong', 'em', 'p', 'br', 'ul', 'ol', 'li',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre',
      'table', 'thead', 'tbody', 'tr', 'th', 'td', 'span', 'div',
      'del', 'hr', 'sup', 'sub', 'abbr', 'cite', 'dfn', 'kbd', 'mark',
      'q', 'samp', 'small', 'time', 'var'
    ],

    // Allow safe link attributes only (href is protocol-restricted + target/rel are
    // forced by the afterSanitizeAttributes hook above). No src or resource-loading attrs.
    ALLOWED_ATTR: [
      'href', 'target', 'rel',
      'title', 'class', 'id', 'align', 'colspan', 'rowspan'
    ],

    // Return a string instead of a document
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,

    // Keep HTML comments removed
    ALLOW_DATA_ATTR: false
    // NOTE: do NOT set USE_PROFILES here — it overrides ALLOWED_TAGS/ALLOWED_ATTR,
    // which would drop the <a> tags we explicitly allow above. The explicit
    // ALLOWED_TAGS/ALLOWED_ATTR allowlist is authoritative; protocols are still
    // restricted by the afterSanitizeAttributes hook (href → http/https/mailto only).
  }

  // Sanitize the HTML using the pre-configured hooks
  return DOMPurify.sanitize(html, config)
}
