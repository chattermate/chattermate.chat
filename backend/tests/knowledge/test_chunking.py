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

from unittest.mock import MagicMock

import pytest
from agno.document import Document

from app.knowledge.chunking import (
    ChunkDocument,
    PageChunking,
    chunk_id,
    chunk_page,
    page_id_of,
    page_title,
    split_text,
)


class TestSplitText:
    def test_short_text_is_one_piece(self):
        assert split_text("hello world", size=100) == ["hello world"]

    def test_pieces_respect_size_and_join_back_exactly(self):
        text = "\n\n".join(
            f"Paragraph {i}. " + " ".join(f"word{j}" for j in range(40)) for i in range(30)
        )
        pieces = split_text(text, size=300)
        assert len(pieces) > 5
        assert all(len(p) <= 300 for p in pieces)
        assert "".join(pieces) == text

    def test_whitespace_and_structure_preserved(self):
        table = "| plan | price |\n|------|-------|\n| Free | $0    |\n| Pro  | $29   |\n"
        text = (table + "\n") * 40
        pieces = split_text(text, size=200)
        assert "".join(pieces) == text
        assert all("|" in p for p in pieces)

    def test_prefers_paragraph_breaks(self):
        text = "a" * 150 + "\n\n" + "b" * 150 + "\n\n" + "c" * 150
        assert split_text(text, size=200) == ["a" * 150 + "\n\n", "b" * 150 + "\n\n", "c" * 150]

    def test_hard_cut_when_no_separator(self):
        pieces = split_text("x" * 1000, size=300)
        assert [len(p) for p in pieces] == [300, 300, 300, 100]

    @pytest.mark.parametrize("size", [1, 2, 3, 5, 10])
    def test_always_terminates_and_covers_input_for_tiny_sizes(self, size):
        text = "ab. cd\n\nef gh. ij kl\nmn op"
        pieces = split_text(text, size=size)
        assert "".join(pieces) == text
        assert all(0 < len(p) <= size for p in pieces)

    def test_rejects_zero_size(self):
        with pytest.raises(ValueError):
            split_text("abc", size=0)


class TestIds:
    def test_chunk_id_round_trip(self):
        assert page_id_of(chunk_id("https://x.com/docs", 3)) == "https://x.com/docs"

    def test_legacy_pdf_suffix_still_grouped(self):
        assert page_id_of("manual.pdf_12") == "manual.pdf"

    def test_url_ending_in_number_is_its_own_page(self):
        # The `::` separator is why: `_2` alone would merge it into `/post`.
        assert page_id_of("https://x.com/post_2::1") == "https://x.com/post_2"

    def test_plain_id_unchanged(self):
        assert page_id_of("getting_started") == "getting_started"


class TestChunkPage:
    def _page(self, content: str, **meta) -> Document:
        return Document(id="https://x.com/pricing", name="https://x.com", content=content, meta_data=meta)

    def test_small_page_returned_unchanged(self):
        page = self._page("short", url="https://x.com/pricing")
        assert chunk_page(page, size=100) == [page]

    def test_large_page_becomes_numbered_disjoint_chunks_with_metadata(self):
        body = "\n\n".join(f"Section {i}: " + "detail " * 30 for i in range(20))
        page = self._page(body, url="https://x.com/pricing", agent_id=["a1"])
        chunks = chunk_page(page, size=400, overlap=50)
        assert len(chunks) > 1
        assert [c.id for c in chunks] == [f"https://x.com/pricing::{i}" for i in range(1, len(chunks) + 1)]
        # Stored text is disjoint: rejoining the page never duplicates anything.
        assert "".join(c.content for c in chunks) == body
        for i, c in enumerate(chunks, start=1):
            assert c.name == "https://x.com"
            assert c.meta_data["url"] == "https://x.com/pricing"
            assert c.meta_data["agent_id"] == ["a1"]
            assert c.meta_data["page_id"] == "https://x.com/pricing"
            assert c.meta_data["chunk"] == i
            assert c.meta_data["chunk_count"] == len(chunks)
            assert c.meta_data["chunk_size"] == len(c.content)

    def test_embedding_text_carries_title_and_previous_tail_but_content_does_not(self):
        body = "Pricing plans\n" + "x " * 600
        chunks = chunk_page(self._page(body), size=300, overlap=40)
        embedder = MagicMock()
        embedder.get_embedding_and_usage.return_value = ([0.1], None)
        chunks[1].embed(embedder=embedder)
        embedded_text = embedder.get_embedding_and_usage.call_args.args[0]
        assert embedded_text == "Pricing plans\n" + chunks[0].content[-40:] + chunks[1].content
        assert "Pricing plans" not in chunks[1].content
        # A first line guessed from the content is for the embedding only; a
        # crawled first line is as likely to be a cookie banner as a heading.
        assert "title" not in chunks[1].meta_data

    def test_zero_overlap_embeds_title_and_chunk_only(self):
        chunks = chunk_page(self._page("T\n" + "y " * 400), size=200, overlap=0)
        assert chunks[1].embedding_text == "T\n" + chunks[1].content

    def test_explicit_title_wins(self):
        page = self._page("first line\n" + "y " * 400, title="Given Title")
        assert page_title(page) == "Given Title"
        assert chunk_page(page, size=200)[0].meta_data["title"] == "Given Title"

    def test_stale_chunk_metadata_is_not_carried_over(self):
        page = self._page("w " * 400, url="u", chunk=1, chunk_count=5, chunk_size=9, page_id="old")
        chunks = chunk_page(page, size=200)
        assert chunks[0].meta_data["chunk_count"] == len(chunks)
        assert chunks[0].meta_data["page_id"] == "https://x.com/pricing"

    def test_small_page_whose_id_ends_in_number_gets_explicit_chunk_id(self):
        page = Document(id="https://x.com/post_2", name="https://x.com", content="short", meta_data={"url": "u"})
        chunks = chunk_page(page, size=100)
        assert [c.id for c in chunks] == ["https://x.com/post_2::1"]
        assert chunks[0].content == "short"
        assert chunks[0].meta_data["chunk_count"] == 1
        assert page_id_of(chunks[0].id) == "https://x.com/post_2"

    def test_chunk_document_embed_requires_embedder(self):
        with pytest.raises(ValueError):
            ChunkDocument(content="x").embed()

    def test_strategy_adapter_uses_same_splitter(self):
        page = self._page("z " * 500)
        assert [c.id for c in PageChunking(size=200).chunk(page)] == [
            c.id for c in chunk_page(page, size=200)
        ]
