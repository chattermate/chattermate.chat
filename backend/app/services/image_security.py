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

Hardening for user-uploaded images (help-center logo + article images). Every
uploaded raster is:
  - size-capped (bytes),
  - checked for a real, decodable image (not a polyglot / renamed file),
  - guarded against decompression bombs (pixel-count cap read from the header
    BEFORE the full image is decoded),
  - re-encoded from decoded pixels — which strips EXIF/metadata, trailing bytes
    and any appended payload, and normalises the stored format.

SVG is intentionally NOT accepted here: it is active markup and would be stored
XSS on the public help center. Callers that previously took SVG rasterise on the
client (the cropper) or drop it.
"""

import io

from fastapi import HTTPException
from PIL import Image

# Refuse absurd pixel counts before decoding — a few-KB file can claim to be
# tens of thousands of pixels per side and exhaust memory on decode.
_MAX_PIXELS = 40_000_000  # 40 MP
Image.MAX_IMAGE_PIXELS = _MAX_PIXELS

# PIL format -> (content type, extension) for the formats we re-encode to.
_PNG = ("image/png", ".png")
_JPEG = ("image/jpeg", ".jpg")

_FORMAT_CONTENT_TYPE = {
    "PNG": "image/png",
    "JPEG": "image/jpeg",
    "WEBP": "image/webp",
    "GIF": "image/gif",
}


def _open_validated(content: bytes, *, max_bytes: int, max_dim: int) -> Image.Image:
    """Open bytes as an image, enforcing byte size, decodability and a pixel /
    dimension cap (bomb guard) — all before the pixels are fully decoded."""
    if not content:
        raise HTTPException(status_code=400, detail="Empty image file.")
    if len(content) > max_bytes:
        raise HTTPException(status_code=400, detail=f"Image must be {max_bytes // (1024 * 1024)} MB or smaller.")
    try:
        img = Image.open(io.BytesIO(content))
        width, height = img.size  # header only; no full decode yet
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid or corrupt image file.")
    if width <= 0 or height <= 0:
        raise HTTPException(status_code=400, detail="Invalid image dimensions.")
    if width > max_dim or height > max_dim or width * height > _MAX_PIXELS:
        raise HTTPException(
            status_code=400,
            detail=f"Image is too large — keep it within {max_dim}×{max_dim} pixels.",
        )
    try:
        img.load()  # dimensions are now known-safe, so decoding is bounded
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid or corrupt image file.")
    return img


def sanitize_image(
    content: bytes,
    *,
    allowed_content_types: set[str],
    max_bytes: int,
    max_dim: int,
    fit: int | None = None,
) -> tuple[bytes, str, str]:
    """Validate and re-encode an uploaded raster image.

    Returns (safe_bytes, content_type, extension). Raises HTTPException(400) on
    anything that is not a clean, in-policy raster image. `fit`, when given,
    downscales the longest side to at most `fit` px (aspect preserved).

    JPEG re-encodes to JPEG (keeps photos small); everything else re-encodes to
    PNG (keeps transparency). Either path strips metadata and any non-pixel
    payload because the output is built from decoded pixels only.
    """
    img = _open_validated(content, max_bytes=max_bytes, max_dim=max_dim)

    detected = _FORMAT_CONTENT_TYPE.get((img.format or "").upper())
    if detected is None or detected not in allowed_content_types:
        raise HTTPException(
            status_code=400,
            detail="Unsupported image type. Use PNG, JPEG or WebP.",
        )

    if fit and max(img.size) > fit:
        img.thumbnail((fit, fit), Image.LANCZOS)

    out = io.BytesIO()
    if detected == "image/jpeg":
        img.convert("RGB").save(out, format="JPEG", quality=85, optimize=True)
        content_type, ext = _JPEG
    else:
        img.convert("RGBA").save(out, format="PNG", optimize=True)
        content_type, ext = _PNG
    return out.getvalue(), content_type, ext
