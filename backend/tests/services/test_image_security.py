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
"""

import io

import pytest
from fastapi import HTTPException
from PIL import Image

from app.services.image_security import sanitize_image

RASTER = {"image/png", "image/jpeg", "image/webp"}


def _img_bytes(fmt: str, size=(64, 48), color=(200, 30, 30)) -> bytes:
    buf = io.BytesIO()
    Image.new("RGB", size, color).save(buf, format=fmt)
    return buf.getvalue()


def test_png_reencoded_to_png():
    out, ctype, ext = sanitize_image(
        _img_bytes("PNG"), allowed_content_types=RASTER, max_bytes=2_000_000, max_dim=4000
    )
    assert ctype == "image/png" and ext == ".png"
    assert Image.open(io.BytesIO(out)).format == "PNG"


def test_jpeg_stays_jpeg():
    out, ctype, ext = sanitize_image(
        _img_bytes("JPEG"), allowed_content_types=RASTER, max_bytes=2_000_000, max_dim=4000
    )
    assert ctype == "image/jpeg" and ext == ".jpg"
    assert Image.open(io.BytesIO(out)).format == "JPEG"


def test_fit_downscales_longest_side():
    out, _c, _e = sanitize_image(
        _img_bytes("PNG", size=(1200, 600)),
        allowed_content_types=RASTER,
        max_bytes=2_000_000,
        max_dim=4000,
        fit=512,
    )
    w, h = Image.open(io.BytesIO(out)).size
    assert max(w, h) == 512 and (w, h) == (512, 256)


def test_rejects_non_image():
    with pytest.raises(HTTPException) as e:
        sanitize_image(b"not an image", allowed_content_types=RASTER, max_bytes=2_000_000, max_dim=4000)
    assert e.value.status_code == 400


def test_rejects_oversized_bytes():
    with pytest.raises(HTTPException) as e:
        sanitize_image(_img_bytes("PNG"), allowed_content_types=RASTER, max_bytes=10, max_dim=4000)
    assert e.value.status_code == 400


def test_rejects_dimensions_over_cap():
    with pytest.raises(HTTPException) as e:
        sanitize_image(
            _img_bytes("PNG", size=(300, 300)),
            allowed_content_types=RASTER,
            max_bytes=2_000_000,
            max_dim=100,
        )
    assert e.value.status_code == 400


def test_rejects_disallowed_format():
    # GIF is a valid image but not in the allowlist here → rejected.
    with pytest.raises(HTTPException) as e:
        sanitize_image(_img_bytes("GIF"), allowed_content_types=RASTER, max_bytes=2_000_000, max_dim=4000)
    assert e.value.status_code == 400


def test_empty_rejected():
    with pytest.raises(HTTPException):
        sanitize_image(b"", allowed_content_types=RASTER, max_bytes=2_000_000, max_dim=4000)
