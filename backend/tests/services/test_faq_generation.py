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

FAQ generation service tests: batching/dedup helpers, the end-to-end job with
a mocked model, and the auto-generation hook's skip conditions.
"""
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

import pytest

from app.agents.faq_generator import GeneratedFAQ
from app.models.faq import FAQ, FAQStatus
from app.models.faq_generation_job import FAQGenerationJob, FAQJobStatus, FAQJobType
from app.models.help_center import HelpCenterSettings
from app.models.knowledge import Knowledge, SourceType
from app.repositories.faq import FAQRepository
from app.repositories.faq_generation_job import FAQGenerationJobRepository
from app.services import faq_generation
from app.services.faq_generation import (
    CategoryMerger,
    DedupState,
    maybe_enqueue_auto_faq_job,
    normalize_question,
    pack_batches,
    run_generation_job,
)


# ---------- helpers ----------

def _make_knowledge(db, org_id, source="docs.example.com"):
    knowledge = Knowledge(
        source=source, source_type=SourceType.WEBSITE,
        schema="ai", table_name="d_test", organization_id=org_id,
    )
    db.add(knowledge)
    db.commit()
    db.refresh(knowledge)
    return knowledge


def _make_job(db, org_id, **kwargs):
    job = FAQGenerationJob(organization_id=org_id, **kwargs)
    db.add(job)
    db.commit()
    db.refresh(job)
    return job


# ---------- unit helpers ----------

def test_normalize_question():
    assert normalize_question("How do I sign up?") == normalize_question("how do i SIGN UP")
    assert normalize_question("  A,  b!! ") == "a b"


def test_pack_batches_packs_whole_pages():
    pages = ["a" * 6000, "b" * 6000, "c" * 6000]
    batches = pack_batches(pages, max_chars=15000)
    assert len(batches) == 2
    assert "a" in batches[0] and "b" in batches[0]
    assert batches[1].startswith("c")


def test_pack_batches_truncates_oversize_item():
    batches = pack_batches(["x" * 20000, "y" * 10], max_chars=15000)
    assert len(batches) == 2
    assert len(batches[0]) <= 15000  # oversized item truncated, never split


def test_dedup_state_blocks_existing_and_repeats():
    dedup = DedupState(["How do I sign up?"])
    accepted = dedup.accept_new([
        GeneratedFAQ(question="how do i sign up", answer="a", category="c"),   # rephrased dupe
        GeneratedFAQ(question="What does it cost?", answer="a", category="c"),
        GeneratedFAQ(question="What does it cost", answer="b", category="c"),  # same-run dupe
    ])
    assert [f.question for f in accepted] == ["What does it cost?"]


def test_category_merger_case_insensitive(db, test_organization):
    FAQRepository(db).create(FAQ(
        organization_id=test_organization.id, question="q", answer="a", category="Billing",
    ))
    merger = CategoryMerger(db, test_organization.id)
    assert merger.merge("BILLING") == "Billing"
    assert merger.merge("Refunds") == "Refunds"
    assert merger.merge("  ") == "General"
    assert "Refunds" in merger.names


# ---------- generation job ----------

@pytest.mark.asyncio
async def test_run_generation_job_inserts_deduped_drafts(db, test_organization, test_ai_config):
    knowledge = _make_knowledge(db, test_organization.id)
    # Pre-existing FAQ that generated output must not duplicate.
    FAQRepository(db).create(FAQ(
        organization_id=test_organization.id, question="How do I sign up?",
        answer="Existing.", category="Getting started",
    ))
    job = _make_job(db, test_organization.id, job_type=FAQJobType.GENERATE_ALL.value)

    generated = [
        GeneratedFAQ(question="How do I sign up?", answer="dupe", category="Getting started"),
        GeneratedFAQ(question="Is my data safe?", answer="Yes.", category="SECURITY"),
    ]
    mock_generator = SimpleNamespace(generate_from_text=AsyncMock(return_value=generated))
    with patch.object(faq_generation, "build_generator", return_value=mock_generator), \
         patch.object(faq_generation, "load_source_pages", return_value=["page one text"]):
        created = await run_generation_job(db, job)

    assert created == 1
    rows = db.query(FAQ).filter(FAQ.question == "Is my data safe?").all()
    assert len(rows) == 1
    assert rows[0].status == FAQStatus.DRAFT.value
    assert rows[0].knowledge_id == knowledge.id
    assert rows[0].source_label == "docs.example.com"
    assert rows[0].generation_job_id == job.id
    # Category kept the model's spelling since no existing "security" category.
    assert rows[0].category == "SECURITY"


@pytest.mark.asyncio
async def test_run_generation_job_fails_without_sources(db, test_organization, test_ai_config):
    job = _make_job(db, test_organization.id, job_type=FAQJobType.GENERATE_ALL.value)
    with patch.object(faq_generation, "build_generator", return_value=SimpleNamespace()):
        with pytest.raises(ValueError, match="No knowledge sources"):
            await run_generation_job(db, job)


@pytest.mark.asyncio
async def test_run_generation_job_fails_when_all_batches_fail(db, test_organization, test_ai_config):
    _make_knowledge(db, test_organization.id)
    job = _make_job(db, test_organization.id, job_type=FAQJobType.GENERATE_ALL.value)
    mock_generator = SimpleNamespace(generate_from_text=AsyncMock(side_effect=RuntimeError("boom")))
    with patch.object(faq_generation, "build_generator", return_value=mock_generator), \
         patch.object(faq_generation, "load_source_pages", return_value=["text"]):
        with pytest.raises(RuntimeError, match="every content batch"):
            await run_generation_job(db, job)
    # One retry per batch.
    assert mock_generator.generate_from_text.await_count == 2


@pytest.mark.asyncio
async def test_generate_source_job_scopes_to_one_source(db, test_organization, test_ai_config):
    k1 = _make_knowledge(db, test_organization.id, "a.example.com")
    _make_knowledge(db, test_organization.id, "b.example.com")
    job = _make_job(
        db, test_organization.id,
        job_type=FAQJobType.GENERATE_SOURCE.value, knowledge_id=k1.id,
    )
    seen_sources = []

    def fake_load(db_, knowledge):
        seen_sources.append(knowledge.source)
        return ["content"]

    mock_generator = SimpleNamespace(generate_from_text=AsyncMock(return_value=[]))
    with patch.object(faq_generation, "build_generator", return_value=mock_generator), \
         patch.object(faq_generation, "load_source_pages", side_effect=fake_load):
        await run_generation_job(db, job)
    assert seen_sources == ["a.example.com"]


# ---------- auto-generation hook ----------

def _queue_item(org_id, source="docs.example.com", user_id=None):
    return SimpleNamespace(organization_id=org_id, source=source, user_id=user_id)


def test_auto_hook_skips_when_feature_never_used(db, test_organization):
    _make_knowledge(db, test_organization.id)
    assert maybe_enqueue_auto_faq_job(db, _queue_item(test_organization.id)) is None


def test_auto_hook_enqueues_for_adopted_org(db, test_organization):
    knowledge = _make_knowledge(db, test_organization.id)
    db.add(HelpCenterSettings(organization_id=test_organization.id, slug="test-org"))
    db.commit()
    job = maybe_enqueue_auto_faq_job(db, _queue_item(test_organization.id))
    assert job is not None
    assert job.job_type == FAQJobType.GENERATE_SOURCE.value
    assert job.knowledge_id == knowledge.id
    assert job.status == FAQJobStatus.PENDING.value


def test_auto_hook_respects_auto_generate_toggle(db, test_organization):
    _make_knowledge(db, test_organization.id)
    db.add(HelpCenterSettings(
        organization_id=test_organization.id, slug="test-org", auto_generate=False,
    ))
    db.commit()
    assert maybe_enqueue_auto_faq_job(db, _queue_item(test_organization.id)) is None


def test_auto_hook_dedups_active_job(db, test_organization):
    knowledge = _make_knowledge(db, test_organization.id)
    db.add(HelpCenterSettings(organization_id=test_organization.id, slug="test-org"))
    db.commit()
    first = maybe_enqueue_auto_faq_job(db, _queue_item(test_organization.id))
    assert first is not None
    assert maybe_enqueue_auto_faq_job(db, _queue_item(test_organization.id)) is None
    # Once the first completes, a new one may be enqueued.
    FAQGenerationJobRepository(db).mark_completed(first.id, faqs_created=0)
    assert maybe_enqueue_auto_faq_job(db, _queue_item(test_organization.id)) is not None
    assert knowledge.id is not None


def test_auto_hook_skips_when_plan_disallows(db, test_organization):
    _make_knowledge(db, test_organization.id)
    db.add(HelpCenterSettings(organization_id=test_organization.id, slug="test-org"))
    db.commit()
    # Effective because the hook imports help_center_allowed at call time.
    with patch("app.services.help_center_access.help_center_allowed", return_value=False):
        assert maybe_enqueue_auto_faq_job(db, _queue_item(test_organization.id)) is None


def test_auto_hook_never_raises(db, test_organization):
    broken = SimpleNamespace(organization_id=None, source=None, user_id=None)
    assert maybe_enqueue_auto_faq_job(db, broken) is None
