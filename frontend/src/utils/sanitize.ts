/*
ChatterMate - HTML Sanitization Utility
Copyright (C) 2024 ChatterMate

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>
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

  // SECURITY: Remove any remaining <a> and <img> tags completely
  DOMPurify.addHook('uponSanitizeElement', (node, data) => {
    const element = node as HTMLElement
    if (element.tagName === 'A' || element.tagName === 'IMG' || element.tagName === 'AREA' || element.tagName === 'MAP') {
      // For links, keep the text content if it exists
      if (element.tagName === 'A') {
        const textContent = element.textContent
        if (textContent) {
          element.replaceWith(textContent)
        } else {
          element.parentNode?.removeChild(element)
        }
      } else {
        // For images and maps, just remove them
        element.parentNode?.removeChild(element)
      }
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
    // Block all dangerous tags including SVG, form elements, links and images
    FORBID_TAGS: [
      'iframe', 'frame', 'frameset', 'object', 'embed', 'applet', 'script',
      'base', 'link', 'meta', 'style', 'svg', 'math', 'form', 'input',
      'button', 'textarea', 'select', 'option', 'xml', 'xss', 'import',
      'video', 'audio', 'track', 'source', 'canvas', 'details', 'template',
      'slot', 'noscript', 'marquee', 'bgsound', 'keygen', 'command',
      'a', 'img', 'area', 'map'  // SECURITY: Remove link and image tags completely
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
      'href', 'src', 'data'  // SECURITY: Block resource loading attributes
    ],

    // Only allow safe protocols
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,

    // SECURITY: Strip ALL HTML tags to prevent rendering exploits
    // Only allow basic text formatting for markdown (no links, images, or any potentially dangerous tags)
    ALLOWED_TAGS: [
      'b', 'i', 'u', 'strong', 'em', 'p', 'br', 'ul', 'ol', 'li',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre',
      'table', 'thead', 'tbody', 'tr', 'th', 'td', 'span', 'div',
      'del', 'hr', 'sup', 'sub', 'abbr', 'cite', 'dfn', 'kbd', 'mark',
      'q', 'samp', 'small', 'time', 'var'
    ],

    // SECURITY: No href, src, or any attributes that can load external resources
    ALLOWED_ATTR: [
      'title', 'class', 'id', 'align', 'colspan', 'rowspan'
    ],

    // Return a string instead of a document
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,

    // Keep HTML comments removed
    ALLOW_DATA_ATTR: false,

    // Forbid unknown protocols
    USE_PROFILES: { html: true }
  }

  // Sanitize the HTML using the pre-configured hooks
  return DOMPurify.sanitize(html, config)
}
