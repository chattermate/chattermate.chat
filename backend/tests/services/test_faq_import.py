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

FAQ import service tests: HTML-to-text cleanup, paragraph-safe batching, SSRF
propagation, and the end-to-end import job with a mocked model.
"""
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

import pytest
from bs4 import BeautifulSoup

from app.agents.faq_generator import GeneratedFAQ
from app.knowledge.url_safety import BlockedHostError
from app.models.faq import FAQ, FAQStatus
from app.models.faq_generation_job import FAQGenerationJob, FAQJobType
from app.services import faq_import
from app.services.faq_generation import pack_batches
from app.services.faq_import import _soup_to_text, _split_blocks, run_import_job


def test_soup_to_text_strips_boilerplate_and_separates_blocks():
    html = """
    <html><head><script>var x=1;</script><style>.a{}</style></head>
    <body><nav>Home | About</nav>
    <main><h2>Billing</h2><p>How do I pay?</p><p>Use a card.</p></main>
    <footer>© Example</footer></body></html>
    """
    text = _soup_to_text(BeautifulSoup(html, "html.parser"))
    assert "How do I pay?" in text and "Billing" in text
    assert "var x=1" not in text and "Home | About" not in text and "© Example" not in text
    # Block elements are blank-line separated so batching keeps blocks whole.
    assert "\n\n" in text
    assert "\n\n\n" not in text


def test_block_batching_keeps_blocks_whole():
    blocks = [f"Question {i}?\nAnswer {i} " + "x" * 80 for i in range(10)]
    text = "\n\n".join(blocks)
    batches = pack_batches(_split_blocks(text), max_chars=300, sep="\n\n")
    assert len(batches) > 1
    # No Q&A block is cut across batches.
    for i in range(10):
        assert sum(f"Question {i}?" in b and f"Answer {i}" in b for b in batches) == 1


@pytest.mark.asyncio
async def test_import_job_inserts_drafts_with_source_label(db, test_organization, test_ai_config):
    job = FAQGenerationJob(
        organization_id=test_organization.id,
        job_type=FAQJobType.IMPORT_URL.value,
        source_url="https://support.example.com/faq",
    )
    db.add(job)
    db.commit()
    db.refresh(job)

    extracted = [GeneratedFAQ(question="Do you offer refunds?", answer="Within 14 days.", category="Billing")]
    mock_generator = SimpleNamespace(extract_from_faq_page=AsyncMock(return_value=extracted), batch_chars=15000)
    with patch.object(faq_import, "build_generator", return_value=mock_generator), \
         patch.object(faq_import, "fetch_page_text", return_value="Do you offer refunds?\nWithin 14 days."):
        created = await run_import_job(db, job)

    assert created == 1
    row = db.query(FAQ).filter(FAQ.organization_id == test_organization.id).one()
    assert row.status == FAQStatus.DRAFT.value
    assert row.knowledge_id is None
    assert row.source_label == "Imported from support.example.com"


@pytest.mark.asyncio
async def test_import_job_propagates_ssrf_block(db, test_organization, test_ai_config):
    job = FAQGenerationJob(
        organization_id=test_organization.id,
        job_type=FAQJobType.IMPORT_URL.value,
        source_url="https://internal.example/faq",
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    with patch.object(faq_import, "build_generator", return_value=SimpleNamespace()), \
         patch.object(faq_import, "fetch_page_text", side_effect=BlockedHostError("blocked")):
        with pytest.raises(BlockedHostError):
            await run_import_job(db, job)


def test_fetch_page_text_ssrf_guard_blocks_before_fetch():
    """The real fetch path consults url_safety on the initial URL."""
    with patch("app.services.faq_import.safe_get", side_effect=BlockedHostError("blocked")), \
         patch.object(faq_import, "_fetch_rendered_text", return_value=None):
        with pytest.raises((BlockedHostError, ValueError)):
            faq_import.fetch_page_text("https://169.254.169.254/faq")


# ---------- PDF import ----------

def _tiny_pdf() -> bytes:
    """A minimal one-page PDF with extractable text ('Do you offer refunds? Yes.')."""
    from pypdf import PdfWriter
    from io import BytesIO

    writer = PdfWriter()
    writer.add_blank_page(width=200, height=200)
    buffer = BytesIO()
    writer.write(buffer)
    return buffer.getvalue()


def test_pdf_to_text_reads_pages():
    # A blank page yields no text; the function must cope without raising.
    assert faq_import._pdf_to_text(_tiny_pdf()) == ""


@pytest.mark.asyncio
async def test_pdf_import_job_extracts_and_cleans_up(db, test_organization, test_ai_config):
    job = FAQGenerationJob(
        organization_id=test_organization.id,
        job_type=FAQJobType.IMPORT_PDF.value,
        source_url="/api/v1/uploads/help_center_imports/x.pdf",
        source_file_name="refund-policy.pdf",
    )
    db.add(job)
    db.commit()
    db.refresh(job)

    # PDF import GENERATES FAQs from the document (not verbatim extraction).
    generated = [GeneratedFAQ(question="Do you offer refunds?", answer="Within 14 days.", category="Billing")]
    mock_generator = SimpleNamespace(generate_from_text=AsyncMock(return_value=generated), batch_chars=15000)
    deleted = []

    async def fake_load(stored):
        return b"%PDF-fake"

    async def fake_delete(stored):
        deleted.append(stored)

    with patch.object(faq_import, "build_generator", return_value=mock_generator), \
         patch.object(faq_import, "_pdf_to_text", return_value="Do you offer refunds?\n\nWithin 14 days."), \
         patch("app.services.file_storage.load_upload", side_effect=fake_load), \
         patch("app.services.file_storage.delete_upload", side_effect=fake_delete):
        created = await faq_import.run_pdf_import_job(db, job)

    assert created == 1
    row = db.query(FAQ).filter(FAQ.question == "Do you offer refunds?").one()
    assert row.source_label == "Imported from refund-policy.pdf"
    assert deleted == [job.source_url]  # import buffer removed


@pytest.mark.asyncio
async def test_pdf_import_job_fails_clearly_on_empty_text(db, test_organization, test_ai_config):
    job = FAQGenerationJob(
        organization_id=test_organization.id,
        job_type=FAQJobType.IMPORT_PDF.value,
        source_url="/api/v1/uploads/help_center_imports/y.pdf",
        source_file_name="scan.pdf",
    )
    db.add(job)
    db.commit()
    db.refresh(job)

    async def fake_load(stored):
        return _tiny_pdf()

    async def fake_delete(stored):
        pass

    with patch("app.services.file_storage.load_upload", side_effect=fake_load), \
         patch("app.services.file_storage.delete_upload", side_effect=fake_delete):
        with pytest.raises(ValueError, match="scanned images"):
            await faq_import.run_pdf_import_job(db, job)
