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
from PIL import Image

from app.services.launcher_logo import (
    LOGO_PIXELS,
    MAX_LOGO_BYTES,
    LogoRejected,
    process_logo,
)


def _image_bytes(fmt="PNG", size=(200, 200), mode="RGBA", color=(10, 20, 30, 255), **save):
    buffer = io.BytesIO()
    Image.new(mode, size, color).save(buffer, format=fmt, **save)
    return buffer.getvalue()


def _decoded(result):
    return Image.open(io.BytesIO(result.content))


class TestProcessLogo:
    def test_output_is_a_square_webp(self):
        image = _decoded(process_logo(_image_bytes()))
        assert image.format == "WEBP"
        assert image.size == (LOGO_PIXELS, LOGO_PIXELS)

    @pytest.mark.parametrize("fmt,mode,color", [
        ("PNG", "RGB", (1, 2, 3)), ("JPEG", "RGB", (1, 2, 3)), ("WEBP", "RGB", (1, 2, 3)),
    ])
    def test_accepted_formats_are_opaque(self, fmt, mode, color):
        assert process_logo(_image_bytes(fmt, mode=mode, color=color)).has_transparency is False

    def test_multi_picture_jpegs_count_as_jpegs(self):
        frame = Image.new("RGB", (200, 200))
        buffer = io.BytesIO()
        frame.save(buffer, format="MPO", save_all=True, append_images=[frame])
        assert Image.open(io.BytesIO(buffer.getvalue())).format == "MPO"
        assert _decoded(process_logo(buffer.getvalue())).format == "WEBP"

    def test_transparency_is_detected(self):
        assert process_logo(_image_bytes(color=(0, 0, 0, 0))).has_transparency is True

    def test_wide_logo_is_contained_not_cropped(self):
        image = _decoded(process_logo(_image_bytes(size=(400, 100), color=(200, 0, 0, 255)))).convert("RGBA")
        assert image.getpixel((2, LOGO_PIXELS // 2))[3] > 200
        assert image.getpixel((LOGO_PIXELS - 3, LOGO_PIXELS // 2))[3] > 200
        assert image.getpixel((LOGO_PIXELS // 2, 2))[3] == 0

    def test_exif_rotation_is_applied(self):
        source = Image.new("RGB", (400, 100), (0, 200, 0))
        exif = Image.Exif()
        exif[0x0112] = 6
        buffer = io.BytesIO()
        source.save(buffer, format="JPEG", exif=exif)
        image = _decoded(process_logo(buffer.getvalue())).convert("RGBA")
        assert image.getpixel((LOGO_PIXELS // 2, 2))[3] > 200
        assert image.getpixel((2, LOGO_PIXELS // 2))[3] == 0

    def test_animated_file_keeps_only_a_still(self):
        frames = [Image.new("RGBA", (200, 200), c) for c in ((255, 0, 0, 255), (0, 0, 255, 255))]
        buffer = io.BytesIO()
        frames[0].save(buffer, format="WEBP", save_all=True, append_images=frames[1:], duration=100)
        image = _decoded(process_logo(buffer.getvalue()))
        assert getattr(image, "n_frames", 1) == 1

    def test_metadata_does_not_survive(self):
        source = Image.new("RGB", (200, 200))
        exif = Image.Exif()
        exif[0x010E] = "secret"
        buffer = io.BytesIO()
        source.save(buffer, format="JPEG", exif=exif)
        assert b"secret" not in process_logo(buffer.getvalue()).content

    @pytest.mark.parametrize("content", [
        b"not an image",
        b"",
        b'<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>',
    ])
    def test_non_images_are_refused(self, content):
        with pytest.raises(LogoRejected):
            process_logo(content)

    def test_other_real_formats_are_refused(self):
        with pytest.raises(LogoRejected, match="PNG, WebP or JPEG"):
            process_logo(_image_bytes("GIF", mode="P", color=0))

    def test_truncated_image_is_refused(self):
        content = _image_bytes("JPEG", size=(400, 400), mode="RGB", color=(1, 2, 3))
        with pytest.raises(LogoRejected):
            process_logo(content[: len(content) // 3])

    def test_over_the_size_limit(self):
        with pytest.raises(LogoRejected, match="1 MB"):
            process_logo(b"x" * (MAX_LOGO_BYTES + 1))

    def test_too_small(self):
        with pytest.raises(LogoRejected, match="too small"):
            process_logo(_image_bytes(size=(95, 300)))

    def test_pixel_bomb_is_refused_before_decoding(self):
        content = _image_bytes(size=(6000, 6000), mode="L", color=0, optimize=True)
        assert len(content) < MAX_LOGO_BYTES
        with pytest.raises(LogoRejected, match="too large"):
            process_logo(content)
