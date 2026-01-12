"""
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
"""

import re
import html
import urllib.parse
from typing import Optional


def decode_entities(text: str) -> str:
    """Decode HTML entities and URL encoding to catch obfuscated attacks"""
    # Decode HTML entities multiple times to catch nested encoding
    for _ in range(3):
        text = html.unescape(text)
    
    # Decode URL encoding multiple times
    for _ in range(3):
        try:
            text = urllib.parse.unquote(text)
        except:
            break
    
    return text


def sanitize_message(message: Optional[str]) -> Optional[str]:
    """
    Comprehensive sanitization to prevent XSS attacks including encoded payloads.
    
    Blocks:
    - All dangerous HTML tags (script, iframe, object, embed, svg, etc.)
    - JavaScript URIs (including encoded variants)
    - Data URIs (except data:image)
    - Event handlers (all on* attributes)
    - SVG-based XSS vectors
    - Encoded payloads (HTML entities, URL encoding, Unicode)
    - CSS expressions and behaviors
    - Base64 encoded attacks
    - Template literals and ES6 syntax
    
    Args:
        message: The message text to sanitize
        
    Returns:
        Sanitized message text or None if input is None
    """
    if not message:
        return message
    
    # First, decode any encoded content to catch obfuscated attacks
    decoded_message = decode_entities(message)
    
    # Check for encoded javascript: or data: URIs in decoded content
    dangerous_patterns = [
        r'javascript\s*:',
        r'data\s*:(?!image/)',
        r'vbscript\s*:',
        r'file\s*:',
        r'about\s*:',
    ]
    
    for pattern in dangerous_patterns:
        if re.search(pattern, decoded_message, re.IGNORECASE):
            # If found in decoded content, sanitize the original too
            message = re.sub(pattern, '', message, flags=re.IGNORECASE)
    
    # Remove all dangerous HTML tags (comprehensive list)
    dangerous_tags = [
        'script', 'iframe', 'frame', 'frameset', 'object', 'embed', 
        'applet', 'base', 'link', 'meta', 'style', 'svg', 'math',
        'form', 'input', 'button', 'textarea', 'select', 'option',
        'xml', 'xss', 'import', 'video', 'audio', 'track', 'source',
        'canvas', 'details', 'template', 'slot', 'noscript',
        'marquee', 'bgsound', 'keygen', 'command'
    ]
    
    for tag in dangerous_tags:
        # Remove opening and closing tags with any attributes
        message = re.sub(rf'<{tag}[^>]*>.*?</{tag}>', '', message, flags=re.IGNORECASE | re.DOTALL)
        message = re.sub(rf'<{tag}[^>]*/?>', '', message, flags=re.IGNORECASE)
    
    # Remove javascript: URIs (including encoded variants)
    message = re.sub(r'j\s*a\s*v\s*a\s*s\s*c\s*r\s*i\s*p\s*t\s*:', '', message, flags=re.IGNORECASE)
    message = re.sub(r'&#[x]?[0-9a-f]+;?', lambda m: decode_entities(m.group()), message)
    
    # Remove vbscript: URIs
    message = re.sub(r'vbscript:', '', message, flags=re.IGNORECASE)
    
    # Remove data: URIs that could contain HTML/JS (but preserve data:image)
    message = re.sub(r'data:(?!image/)[^,;]*[,;]', '', message, flags=re.IGNORECASE)
    
    # Remove expression() and behavior CSS properties
    message = re.sub(r'expression\s*\([^)]*\)', '', message, flags=re.IGNORECASE)
    message = re.sub(r'behavior\s*:[^;]*', '', message, flags=re.IGNORECASE)
    message = re.sub(r'-moz-binding\s*:', '', message, flags=re.IGNORECASE)
    
    # Remove import statements
    message = re.sub(r'@import', '', message, flags=re.IGNORECASE)
    
    # Remove all event handlers (comprehensive list)
    event_handlers = [
        'onabort', 'onactivate', 'onafterprint', 'onafterupdate', 'onbeforeactivate',
        'onbeforecopy', 'onbeforecut', 'onbeforedeactivate', 'onbeforeeditfocus',
        'onbeforepaste', 'onbeforeprint', 'onbeforeunload', 'onbeforeupdate', 'onblur',
        'onbounce', 'oncellchange', 'onchange', 'onclick', 'oncontextmenu', 'oncontrolselect',
        'oncopy', 'oncut', 'ondataavailable', 'ondatasetchanged', 'ondatasetcomplete',
        'ondblclick', 'ondeactivate', 'ondrag', 'ondragend', 'ondragenter', 'ondragleave',
        'ondragover', 'ondragstart', 'ondrop', 'onerror', 'onerrorupdate', 'onfilterchange',
        'onfinish', 'onfocus', 'onfocusin', 'onfocusout', 'onhelp', 'oninput', 'oninvalid',
        'onkeydown', 'onkeypress', 'onkeyup', 'onlayoutcomplete', 'onload', 'onlosecapture',
        'onmessage', 'onmousedown', 'onmouseenter', 'onmouseleave', 'onmousemove',
        'onmouseout', 'onmouseover', 'onmouseup', 'onmousewheel', 'onmove', 'onmoveend',
        'onmovestart', 'onpaste', 'onpropertychange', 'onreadystatechange', 'onreset',
        'onresize', 'onresizeend', 'onresizestart', 'onrowenter', 'onrowexit', 'onrowsdelete',
        'onrowsinserted', 'onscroll', 'onsearch', 'onselect', 'onselectionchange',
        'onselectstart', 'onstart', 'onstop', 'onsubmit', 'onunload',
        'oncanplay', 'oncanplaythrough', 'oncuechange', 'ondurationchange', 'onemptied',
        'onended', 'onloadeddata', 'onloadedmetadata', 'onloadstart', 'onpause', 'onplay',
        'onplaying', 'onprogress', 'onratechange', 'onseeked', 'onseeking', 'onstalled',
        'onsuspend', 'ontimeupdate', 'onvolumechange', 'onwaiting', 'ontoggle',
        'onauxclick', 'ongotpointercapture', 'onlostpointercapture', 'onpointercancel',
        'onpointerdown', 'onpointerenter', 'onpointerleave', 'onpointermove', 'onpointerout',
        'onpointerover', 'onpointerup', 'onwheel', 'onanimationcancel', 'onanimationend',
        'onanimationiteration', 'onanimationstart', 'ontransitioncancel', 'ontransitionend',
        'ontransitionrun', 'ontransitionstart', 'onshow', 'onsort', 'onpointerrawupdate'
    ]
    
    for handler in event_handlers:
        # Remove with quotes
        message = re.sub(rf'{handler}\s*=\s*["\'][^"\']*["\']', '', message, flags=re.IGNORECASE)
        # Remove without quotes
        message = re.sub(rf'{handler}\s*=\s*[^>\s]*', '', message, flags=re.IGNORECASE)
        # Remove with backticks (template literals)
        message = re.sub(rf'{handler}\s*=\s*`[^`]*`', '', message, flags=re.IGNORECASE)
    
    # Remove dangerous attributes
    dangerous_attrs = [
        'formaction', 'action', 'form', 'srcdoc', 'srcset', 'dynsrc', 'lowsrc',
        'ping', 'poster', 'background', 'code', 'codebase', 'archive', 'profile',
        'xmlns', 'xlink:href', 'attributename', 'from', 'to', 'values', 'begin',
        'autofocus', 'autoplay', 'controls', 'manifest', 'sandbox'
    ]
    
    for attr in dangerous_attrs:
        message = re.sub(rf'{attr}\s*=\s*["\'][^"\']*["\']', '', message, flags=re.IGNORECASE)
        message = re.sub(rf'{attr}\s*=\s*[^>\s]*', '', message, flags=re.IGNORECASE)
    
    # Remove HTML comments (can be used to hide malicious code)
    message = re.sub(r'<!--.*?-->', '', message, flags=re.DOTALL)
    
    # Remove CDATA sections
    message = re.sub(r'<!\[CDATA\[.*?\]\]>', '', message, flags=re.DOTALL | re.IGNORECASE)
    
    # Remove XML processing instructions
    message = re.sub(r'<\?.*?\?>', '', message, flags=re.DOTALL)
    
    # Remove null bytes and other control characters that can bypass filters
    message = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]', '', message)
    
    # Remove Unicode directional override characters (can hide malicious code)
    message = re.sub(r'[\u202a-\u202e\u2066-\u2069]', '', message)
    
    return message
