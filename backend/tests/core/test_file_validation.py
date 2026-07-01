"""
Copyright 2024-2026 ChatterMate

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0
"""

import io
import os

import pytest
from fastapi import HTTPException
from starlette.datastructures import Headers, UploadFile

from app.core.file_validation import PDF_MAGIC, read_validated, safe_filename

PDF_TYPES = ("application/pdf",)


def _pdf_upload(content: bytes, filename="doc.pdf", content_type="application/pdf"):
    headers = Headers({"content-type": content_type}) if content_type else None
    return UploadFile(io.BytesIO(content), filename=filename, headers=headers)


# ---- safe_filename (path traversal) ----------------------------------------

@pytest.mark.parametrize("name", ["../../etc/passwd", "..\\..\\x.pdf", "/abs/path/a.pdf", "a/b/c.pdf"])
def test_safe_filename_cannot_escape_target_dir(name):
    out = safe_filename(name)
    assert "/" not in out and "\\" not in out
    # The real property: joining under a base dir stays inside it.
    joined = os.path.normpath(os.path.join("temp", out))
    assert joined.startswith("temp" + os.sep)


def test_safe_filename_prefixes_uuid_and_keeps_basename():
    out = safe_filename("report.pdf")
    assert out.endswith("_report.pdf")
    assert out != safe_filename("report.pdf")  # unique per call


def test_safe_filename_handles_empty_and_dots():
    assert safe_filename("").endswith("_upload")
    assert safe_filename("..").endswith("_upload")


# ---- read_validated ---------------------------------------------------------

@pytest.mark.asyncio
async def test_read_validated_accepts_pdf():
    content = b"%PDF-1.7\n...body..."
    data = await read_validated(
        _pdf_upload(content), max_size=1024, allowed_content_types=PDF_TYPES,
        magic_prefix=PDF_MAGIC, label="PDF",
    )
    assert data == content


@pytest.mark.asyncio
async def test_read_validated_rejects_wrong_content_type():
    with pytest.raises(HTTPException) as e:
        await read_validated(
            _pdf_upload(b"%PDF-1.7", content_type="text/html"),
            max_size=1024, allowed_content_types=PDF_TYPES, magic_prefix=PDF_MAGIC, label="PDF",
        )
    assert e.value.status_code == 400


@pytest.mark.asyncio
async def test_read_validated_rejects_bad_magic_bytes():
    with pytest.raises(HTTPException) as e:
        await read_validated(
            _pdf_upload(b"<html>not a pdf</html>"),
            max_size=1024, allowed_content_types=PDF_TYPES, magic_prefix=PDF_MAGIC, label="PDF",
        )
    assert e.value.status_code == 400
    assert "not a valid" in e.value.detail.lower()


@pytest.mark.asyncio
async def test_read_validated_rejects_oversize():
    with pytest.raises(HTTPException) as e:
        await read_validated(
            _pdf_upload(b"%PDF-" + b"x" * 5000),
            max_size=1024, allowed_content_types=PDF_TYPES, magic_prefix=PDF_MAGIC, label="PDF",
        )
    assert e.value.status_code == 413


@pytest.mark.asyncio
async def test_read_validated_rejects_empty():
    with pytest.raises(HTTPException) as e:
        await read_validated(
            _pdf_upload(b""), max_size=1024, allowed_content_types=PDF_TYPES,
            magic_prefix=PDF_MAGIC, label="PDF",
        )
    assert e.value.status_code == 400
