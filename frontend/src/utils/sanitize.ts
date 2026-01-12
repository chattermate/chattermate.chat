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
    // Block all dangerous tags including SVG and form elements
    FORBID_TAGS: [
      'iframe', 'frame', 'frameset', 'object', 'embed', 'applet', 'script',
      'base', 'link', 'meta', 'style', 'svg', 'math', 'form', 'input',
      'button', 'textarea', 'select', 'option', 'xml', 'xss', 'import',
      'video', 'audio', 'track', 'source', 'canvas', 'details', 'template',
      'slot', 'noscript', 'marquee', 'bgsound', 'keygen', 'command'
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
      'autofocus', 'autoplay', 'controls', 'manifest', 'sandbox'
    ],
    
    // Only allow safe protocols
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    
    // Keep safe HTML elements for markdown
    ALLOWED_TAGS: [
      'a', 'b', 'i', 'u', 'strong', 'em', 'p', 'br', 'ul', 'ol', 'li',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre',
      'table', 'thead', 'tbody', 'tr', 'th', 'td', 'span', 'div', 'img',
      'del', 'hr', 'sup', 'sub', 'abbr', 'cite', 'dfn', 'kbd', 'mark',
      'q', 'samp', 'small', 'time', 'var'
    ],
    
    ALLOWED_ATTR: [
      'href', 'title', 'target', 'rel', 'src', 'alt', 'class', 'id',
      'width', 'height', 'align', 'colspan', 'rowspan'
    ],
    
    // Return a string instead of a document
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
    
    // Keep HTML comments removed
    ALLOW_DATA_ATTR: false,
    
    // Forbid unknown protocols
    USE_PROFILES: { html: true }
  }

  // Add custom hooks for additional security
  DOMPurify.addHook('uponSanitizeElement', (node, data) => {
    // Block SVG elements entirely
    if (data.tagName === 'svg') {
      node.remove()
      return
    }
    
    // Block math elements
    if (data.tagName === 'math') {
      node.remove()
      return
    }
    
    // Block any foreign objects
    if (data.tagName === 'foreignobject') {
      node.remove()
      return
    }
  })

  DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    // Block javascript: URIs (including encoded variants)
    if (node.hasAttribute('href')) {
      const href = node.getAttribute('href') || ''
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
    }
    
    // Block javascript: and malicious data: URIs in src
    if (node.hasAttribute('src')) {
      const src = node.getAttribute('src') || ''
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
    }
    
    // Check for CSS expressions in style attribute
    if (node.hasAttribute('style')) {
      const style = node.getAttribute('style') || ''
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
    }
    
    // Remove any attribute that starts with "on" (event handlers)
    Array.from(node.attributes).forEach((attr) => {
      if (attr.name.toLowerCase().startsWith('on')) {
        node.removeAttribute(attr.name)
      }
    })
    
    // Ensure external links have proper security attributes
    if (node.tagName === 'A' && node.hasAttribute('href')) {
      const href = node.getAttribute('href') || ''
      
      // Only add security attributes for external links
      if (href.startsWith('http://') || href.startsWith('https://')) {
        node.setAttribute('target', '_blank')
        node.setAttribute('rel', 'nofollow noopener noreferrer')
      }
    }
  })

  // Sanitize the HTML
  return DOMPurify.sanitize(html, config)
}
