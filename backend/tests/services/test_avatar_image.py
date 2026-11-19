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
import random

import pytest
from PIL import Image

from app.core.config import settings
from app.core.s3 import url_for_s3_key
from app.services.avatar_image import (
    AVATAR_PIXELS,
    AvatarRejected,
    is_shrunk,
    owned_key_in,
    shrink_avatar,
    store_avatar,
)
from app.services.file_storage import agent_photo_folder, profile_pic_folder

ORG = "11111111-1111-1111-1111-111111111111"
OTHER_ORG = "22222222-2222-2222-2222-222222222222"

# What a 40 px avatar may weigh once stored.
SIZE_BUDGET_BYTES = 25 * 1024


def _encode(image: Image.Image, fmt: str, **kwargs) -> bytes:
    buffer = io.BytesIO()
    image.save(buffer, format=fmt, **kwargs)
    return buffer.getvalue()


def _photo_like(width: int, height: int, mode: str = "RGB") -> Image.Image:
    """A smooth gradient with mild grain: compresses like a portrait does, unlike
    flat colour (too easy) or pure noise (incompressible)."""
    rng = random.Random(7)
    image = Image.new(mode, (width, height))
    pixels = image.load()
    for y in range(height):
        for x in range(width):
            grain = rng.randint(-6, 6)
            rgb = (
                max(0, min(255, x * 255 // width + grain)),
                max(0, min(255, y * 255 // height + grain)),
                max(0, min(255, 128 + grain)),
            )
            pixels[x, y] = rgb + ((255,) if mode == "RGBA" else ())
    return image


def _open(content: bytes) -> Image.Image:
    return Image.open(io.BytesIO(content))


class TestShrinkAvatar:
    def test_a_large_png_comes_out_as_a_small_webp(self):
        source = _encode(_photo_like(512, 512), "PNG")

        out = shrink_avatar(source)

        image = _open(out)
        assert image.format == "WEBP"
        assert image.size == (AVATAR_PIXELS, AVATAR_PIXELS)
        assert len(out) < SIZE_BUDGET_BYTES
        assert len(out) < len(source)

    def test_aspect_ratio_is_kept(self):
        out = shrink_avatar(_encode(_photo_like(800, 400), "JPEG"))

        assert _open(out).size == (AVATAR_PIXELS, AVATAR_PIXELS // 2)

    def test_a_small_image_is_not_enlarged(self):
        out = shrink_avatar(_encode(_photo_like(64, 48), "PNG"))

        assert _open(out).size == (64, 48)

    def test_transparency_is_kept(self):
        source = Image.new("RGBA", (300, 300), (255, 0, 0, 255))
        # A see-through corner, as a cut-out avatar has.
        for x in range(100):
            for y in range(100):
                source.putpixel((x, y), (0, 0, 0, 0))

        image = _open(shrink_avatar(_encode(source, "PNG")))

        assert image.mode == "RGBA"
        assert image.getpixel((0, 0))[3] == 0
        assert image.getpixel((AVATAR_PIXELS - 1, AVATAR_PIXELS - 1))[3] == 255

    def test_an_opaque_image_has_no_alpha_channel(self):
        image = _open(shrink_avatar(_encode(_photo_like(300, 300, mode="RGBA"), "PNG")))

        assert image.mode == "RGB"

    def test_palette_transparency_is_kept(self):
        source = Image.new("P", (120, 120), 1)
        source.putpalette([0, 0, 0, 255, 0, 0] + [0] * (256 * 3 - 6))
        for x in range(40):
            source.putpixel((x, 0), 0)

        image = _open(shrink_avatar(_encode(source, "PNG", transparency=0)))

        assert image.mode == "RGBA"
        assert image.getpixel((0, 0))[3] == 0

    def test_metadata_is_stripped(self):
        exif = Image.Exif()
        exif[0x010E] = "secret description"  # ImageDescription
        source = _encode(_photo_like(300, 300), "JPEG", exif=exif.tobytes(), icc_profile=b"\0" * 128)

        image = _open(shrink_avatar(source))

        assert not image.info.get("exif")
        assert not image.info.get("icc_profile")
        assert not image.info.get("xmp")

    def test_exif_orientation_is_applied(self):
        exif = Image.Exif()
        exif[0x0112] = 6  # rotate 90° clockwise to display
        source = _encode(_photo_like(400, 200), "JPEG", exif=exif.tobytes())

        # Stored upright, so no viewer has to read the (now stripped) tag.
        assert _open(shrink_avatar(source)).size == (AVATAR_PIXELS // 2, AVATAR_PIXELS)

    @pytest.mark.parametrize("content", [
        b"",
        b"not an image at all",
        b"<svg xmlns='http://www.w3.org/2000/svg'></svg>",
    ])
    def test_a_non_image_is_refused(self, content):
        with pytest.raises(AvatarRejected):
            shrink_avatar(content)

    def test_a_format_outside_the_allow_list_is_refused(self):
        with pytest.raises(AvatarRejected):
            shrink_avatar(_encode(_photo_like(32, 32), "BMP"))

    def test_a_gif_profile_picture_is_accepted(self):
        # Profile pictures have always allowed .gif; the first frame is kept.
        assert _open(shrink_avatar(_encode(_photo_like(300, 300), "GIF"))).format == "WEBP"

    def test_a_decompression_bomb_is_refused_before_decoding(self, monkeypatch):
        monkeypatch.setattr("app.services.avatar_image.MAX_SOURCE_PIXELS", 100 * 100)

        with pytest.raises(AvatarRejected):
            shrink_avatar(_encode(_photo_like(101, 100), "PNG"))


class TestIsShrunk:
    def test_its_own_output_counts_as_shrunk(self):
        assert is_shrunk(shrink_avatar(_encode(_photo_like(512, 512), "PNG")))

    def test_the_original_upload_does_not(self):
        assert not is_shrunk(_encode(_photo_like(512, 512), "PNG"))

    def test_a_large_webp_does_not(self):
        assert not is_shrunk(_encode(_photo_like(512, 512), "WEBP"))

    def test_junk_does_not(self):
        assert not is_shrunk(b"junk")

    def test_a_small_webp_still_carrying_exif_does_not(self):
        exif = Image.Exif()
        exif[0x010E] = "secret"
        assert not is_shrunk(_encode(_photo_like(64, 64), "WEBP", exif=exif.tobytes()))

    def test_a_small_animated_webp_does_not(self):
        frames = [_photo_like(64, 64), _photo_like(64, 64).rotate(90)]
        assert not is_shrunk(_encode(frames[0], "WEBP", save_all=True, append_images=frames[1:]))


class TestOwnedKeyIn:
    AGENTS = agent_photo_folder(ORG)

    @pytest.mark.parametrize("url,expected", [
        (f"{settings.API_V1_STR}/uploads/agents/{ORG}/a.webp", f"agents/{ORG}/a.webp"),
        (f"/uploads/agents/{ORG}/a.png", f"agents/{ORG}/a.png"),
        (f"{settings.API_V1_STR}/uploads/agents/{OTHER_ORG}/a.webp", None),
        (f"{settings.API_V1_STR}/uploads/agents/{ORG}/../{OTHER_ORG}/a.webp", None),
        (f"{settings.API_V1_STR}/uploads/agents/{ORG}/../../../etc/passwd", None),
        (f"{settings.API_V1_STR}/uploads/agents/{ORG}x/a.webp", None),
        (f"{settings.API_V1_STR}/uploads/user/{ORG}/a.png", None),
        ("https://example.com/a.png", None),
        ("data:image/png;base64,AAAA", None),
        ("", None),
        (None, None),
    ])
    def test_local_storage(self, monkeypatch, url, expected):
        monkeypatch.setattr(settings, "S3_FILE_STORAGE", False)
        assert owned_key_in(url, self.AGENTS) == expected

    def test_s3_storage(self, monkeypatch):
        monkeypatch.setattr(settings, "S3_FILE_STORAGE", True)

        assert owned_key_in(url_for_s3_key(f"agents/{ORG}/a.webp"), self.AGENTS) == f"agents/{ORG}/a.webp"
        assert owned_key_in(url_for_s3_key(f"agents/{OTHER_ORG}/a.webp"), self.AGENTS) is None
        assert owned_key_in(url_for_s3_key(f"knowledge/{ORG}/doc.pdf"), self.AGENTS) is None
        assert owned_key_in("https://other-bucket.s3.amazonaws.com/agents/x.png", self.AGENTS) is None

    def test_a_profile_picture_belongs_to_one_user_only(self, monkeypatch):
        monkeypatch.setattr(settings, "S3_FILE_STORAGE", True)
        mine = profile_pic_folder(ORG, "user-a")

        assert owned_key_in(url_for_s3_key(f"{mine}/p.webp"), mine) == f"{mine}/p.webp"
        assert owned_key_in(url_for_s3_key(f"{profile_pic_folder(ORG, 'user-b')}/p.webp"), mine) is None


@pytest.mark.asyncio
class TestStoreAvatar:
    async def test_every_upload_gets_a_fresh_webp_name(self, tmp_path, monkeypatch):
        monkeypatch.chdir(tmp_path)
        monkeypatch.setattr(settings, "S3_FILE_STORAGE", False)
        source = _encode(_photo_like(300, 300), "PNG")

        first = await store_avatar(source, agent_photo_folder(ORG))
        second = await store_avatar(source, agent_photo_folder(ORG))

        assert first != second
        assert first.endswith(".webp") and second.endswith(".webp")

    async def test_a_non_image_is_refused_and_nothing_is_written(self, tmp_path, monkeypatch):
        monkeypatch.chdir(tmp_path)
        monkeypatch.setattr(settings, "S3_FILE_STORAGE", False)

        with pytest.raises(AvatarRejected):
            await store_avatar(b"junk", agent_photo_folder(ORG))
        assert not (tmp_path / "uploads").exists()
