"""
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

Launcher logo: checks an uploaded image and re-encodes it to a small WebP.

Nothing from the upload reaches a visitor as sent: only pixels we drew ourselves
are stored, which also drops metadata and anything hiding after the image data.
"""

import io
from dataclasses import dataclass

from PIL import Image, ImageOps

MAX_LOGO_BYTES = 1024 * 1024
MIN_LOGO_PIXELS = 96
LOGO_PIXELS = 256
# Checked from the header, before decoding: a small file can expand to gigabytes.
MAX_SOURCE_PIXELS = 25_000_000
# Judged from the bytes; the client's content type proves nothing. MPO is how Pillow
# names the multi-picture JPEGs many phones and cameras save.
ALLOWED_FORMATS = ('PNG', 'JPEG', 'MPO', 'WEBP')
LOGO_CONTENT_TYPE = 'image/webp'
LOGO_EXTENSION = '.webp'
OPAQUE = 255


class LogoRejected(ValueError):
    """The upload can't be used; the message is shown to the user."""


@dataclass(frozen=True)
class ProcessedLogo:
    content: bytes
    has_transparency: bool


def _open_checked(content: bytes) -> Image.Image:
    if len(content) > MAX_LOGO_BYTES:
        raise LogoRejected("That file is over 1 MB. Try a smaller one.")
    try:
        image = Image.open(io.BytesIO(content))
    except Exception:
        raise LogoRejected("That file isn't an image we can read.")
    if image.format not in ALLOWED_FORMATS:
        raise LogoRejected("Use a PNG, WebP or JPEG file.")
    width, height = image.size
    if width * height > MAX_SOURCE_PIXELS:
        raise LogoRejected("That image is too large. Try a smaller one.")
    if min(width, height) < MIN_LOGO_PIXELS:
        raise LogoRejected(f"That image is too small. Use one at least {MIN_LOGO_PIXELS} px wide and tall.")
    return image


def process_logo(content: bytes) -> ProcessedLogo:
    """Validate and re-encode. CPU-bound: run it off the event loop."""
    image = _open_checked(content)
    try:
        # Animated files open on their first frame, and only that frame is drawn.
        rgba = ImageOps.exif_transpose(image).convert('RGBA')
    except Exception:
        raise LogoRejected("That file isn't an image we can read.")

    has_transparency = rgba.getchannel('A').getextrema()[0] < OPAQUE
    rgba.thumbnail((LOGO_PIXELS, LOGO_PIXELS), Image.Resampling.LANCZOS)

    # Contain, never crop: a wide logo keeps its ends.
    canvas = Image.new('RGBA', (LOGO_PIXELS, LOGO_PIXELS), (0, 0, 0, 0))
    canvas.paste(rgba, ((LOGO_PIXELS - rgba.width) // 2, (LOGO_PIXELS - rgba.height) // 2))

    output = io.BytesIO()
    canvas.save(output, format='WEBP', quality=90)
    return ProcessedLogo(content=output.getvalue(), has_transparency=has_transparency)
