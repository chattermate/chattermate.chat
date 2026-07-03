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

import unittest
from unittest.mock import patch, MagicMock
import httpx

from app.knowledge.cloudflare_crawler import CloudflareCrawler


class TestCloudflareCrawler(unittest.TestCase):
    """Test cases for CloudflareCrawler"""

    def setUp(self):
        self.crawler = CloudflareCrawler(
            max_depth=2,
            max_links=10,
            min_content_length=50,
            poll_interval=0,  # No delay in tests
            crawl_timeout=5,
            account_id="test_account_id",
            api_token="test_api_token",
        )

    # ------------------------------------------------------------------
    # _build_include_pattern
    # ------------------------------------------------------------------

    def test_include_pattern_basic(self):
        result = self.crawler._build_include_pattern("https://example.com/page")
        self.assertEqual(result, "https://example.com/*")

    def test_include_pattern_with_subdomain(self):
        result = self.crawler._build_include_pattern("https://docs.example.com/guide")
        self.assertEqual(result, "https://docs.example.com/*")

    def test_include_pattern_http(self):
        result = self.crawler._build_include_pattern("http://example.com/page")
        self.assertEqual(result, "http://example.com/*")

    def test_include_pattern_with_port(self):
        result = self.crawler._build_include_pattern("https://example.com:8080/page")
        self.assertEqual(result, "https://example.com:8080/*")

    # ------------------------------------------------------------------
    # _start_crawl
    # ------------------------------------------------------------------

    @patch("app.knowledge.cloudflare_crawler.httpx.post")
    def test_start_crawl_success(self, mock_post):
        """CF returns { 'success': true, 'result': '<job-id>' }"""
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "success": True,
            "result": "c7f8s2d9-a8e7-4b6e-8e4d-3d4a1b2c3f4e",
        }
        mock_response.raise_for_status = MagicMock()
        mock_post.return_value = mock_response

        job_id = self.crawler._start_crawl("https://example.com")

        self.assertEqual(job_id, "c7f8s2d9-a8e7-4b6e-8e4d-3d4a1b2c3f4e")
        mock_post.assert_called_once()
        call_kwargs = mock_post.call_args
        self.assertIn("Bearer test_api_token", call_kwargs.kwargs["headers"]["Authorization"])
        # Verify correct CF param names
        body = call_kwargs.kwargs["json"]
        self.assertEqual(body["depth"], 2)
        self.assertEqual(body["limit"], 10)
        self.assertEqual(body["source"], "all")
        self.assertIn("includePatterns", body["options"])

    @patch("app.knowledge.cloudflare_crawler.httpx.post")
    def test_start_crawl_auth_error(self, mock_post):
        mock_response = MagicMock()
        mock_response.status_code = 401
        mock_response.raise_for_status.side_effect = httpx.HTTPStatusError(
            "401 Unauthorized", request=MagicMock(), response=mock_response
        )
        mock_post.return_value = mock_response

        with self.assertRaises(httpx.HTTPStatusError):
            self.crawler._start_crawl("https://example.com")

    @patch("app.knowledge.cloudflare_crawler.httpx.post")
    def test_start_crawl_missing_job_id(self, mock_post):
        mock_response = MagicMock()
        mock_response.json.return_value = {"success": True}
        mock_response.raise_for_status = MagicMock()
        mock_post.return_value = mock_response

        with self.assertRaises(ValueError):
            self.crawler._start_crawl("https://example.com")

    # ------------------------------------------------------------------
    # _poll_crawl
    # ------------------------------------------------------------------

    @patch("app.knowledge.cloudflare_crawler.httpx.get")
    def test_poll_crawl_completed(self, mock_get):
        """Phase 1 returns completed, phase 2 returns records."""
        records = [
            {"url": "https://example.com", "status": "completed", "markdown": "# Home"},
            {"url": "https://example.com/about", "status": "completed", "markdown": "# About"},
        ]
        # First call: poll with limit=1 → completed
        poll_response = MagicMock()
        poll_response.json.return_value = {
            "success": True,
            "result": {"id": "job_123", "status": "completed", "total": 2, "finished": 2, "records": []},
        }
        poll_response.raise_for_status = MagicMock()

        # Second call: fetch all completed records (no cursor → done)
        records_response = MagicMock()
        records_response.json.return_value = {
            "success": True,
            "result": {"records": records},
        }
        records_response.raise_for_status = MagicMock()

        mock_get.side_effect = [poll_response, records_response]

        result = self.crawler._poll_crawl("job_123")
        self.assertEqual(len(result), 2)
        self.assertEqual(result[0]["url"], "https://example.com")

    @patch("app.knowledge.cloudflare_crawler.httpx.get")
    def test_poll_crawl_404_then_completed(self, mock_get):
        """CF may return 404 briefly after job creation — should retry."""
        not_found_response = MagicMock()
        not_found_response.status_code = 404

        poll_response = MagicMock()
        poll_response.status_code = 200
        poll_response.json.return_value = {
            "success": True,
            "result": {"status": "completed", "total": 1, "finished": 1},
        }
        poll_response.raise_for_status = MagicMock()

        records_response = MagicMock()
        records_response.status_code = 200
        records_response.json.return_value = {
            "success": True,
            "result": {"records": [{"url": "https://example.com", "markdown": "# Home"}]},
        }
        records_response.raise_for_status = MagicMock()

        mock_get.side_effect = [not_found_response, poll_response, records_response]

        result = self.crawler._poll_crawl("job_123")
        self.assertEqual(len(result), 1)
        # 3 GET calls: 404, completed poll, records fetch
        self.assertEqual(mock_get.call_count, 3)

    @patch("app.knowledge.cloudflare_crawler.httpx.get")
    def test_poll_crawl_errored(self, mock_get):
        mock_response = MagicMock()
        mock_response.json.return_value = {
            "success": True,
            "result": {"status": "errored"},
        }
        mock_response.raise_for_status = MagicMock()
        mock_get.return_value = mock_response

        with self.assertRaises(RuntimeError) as ctx:
            self.crawler._poll_crawl("job_123")
        self.assertIn("errored", str(ctx.exception))

    @patch("app.knowledge.cloudflare_crawler.httpx.get")
    def test_poll_crawl_timeout(self, mock_get):
        """If status never becomes terminal, we should time out."""
        self.crawler.crawl_timeout = 0  # Immediate timeout

        mock_response = MagicMock()
        mock_response.json.return_value = {
            "success": True,
            "result": {"status": "running", "total": 5, "finished": 1},
        }
        mock_response.raise_for_status = MagicMock()
        mock_get.return_value = mock_response

        with self.assertRaises(TimeoutError):
            self.crawler._poll_crawl("job_123")

    @patch("app.knowledge.cloudflare_crawler.httpx.get")
    def test_poll_crawl_cancelled_due_to_limits(self, mock_get):
        """cancelled_due_to_limits is a terminal status — should still return records."""
        poll_response = MagicMock()
        poll_response.json.return_value = {
            "success": True,
            "result": {"status": "cancelled_due_to_limits", "total": 100, "finished": 100},
        }
        poll_response.raise_for_status = MagicMock()

        records_response = MagicMock()
        records_response.json.return_value = {
            "success": True,
            "result": {"records": [{"url": "https://example.com", "markdown": "# Home"}]},
        }
        records_response.raise_for_status = MagicMock()

        mock_get.side_effect = [poll_response, records_response]

        result = self.crawler._poll_crawl("job_123")
        self.assertEqual(len(result), 1)

    @patch("app.knowledge.cloudflare_crawler.httpx.get")
    def test_poll_crawl_pagination(self, mock_get):
        """Paginate through records using cursor."""
        poll_response = MagicMock()
        poll_response.json.return_value = {
            "success": True,
            "result": {"status": "completed", "total": 2, "finished": 2},
        }
        poll_response.raise_for_status = MagicMock()

        page1_response = MagicMock()
        page1_response.json.return_value = {
            "success": True,
            "result": {
                "records": [{"url": "https://example.com", "markdown": "# Home"}],
                "cursor": 1,
            },
        }
        page1_response.raise_for_status = MagicMock()

        page2_response = MagicMock()
        page2_response.json.return_value = {
            "success": True,
            "result": {
                "records": [{"url": "https://example.com/about", "markdown": "# About"}],
            },
        }
        page2_response.raise_for_status = MagicMock()

        mock_get.side_effect = [poll_response, page1_response, page2_response]

        result = self.crawler._poll_crawl("job_123")
        self.assertEqual(len(result), 2)

    # ------------------------------------------------------------------
    # read (end-to-end)
    # ------------------------------------------------------------------

    @patch("app.knowledge.cloudflare_crawler.get_content_summarizer")
    @patch.object(CloudflareCrawler, "_poll_crawl")
    @patch.object(CloudflareCrawler, "_start_crawl")
    def test_read_end_to_end(self, mock_start, mock_poll, mock_summarizer):
        mock_start.return_value = "job_abc"
        mock_poll.return_value = [
            {
                "url": "https://example.com",
                "status": "completed",
                "markdown": "# Welcome to Example\n\nThis is the home page with enough content to pass the minimum length filter.",
            },
            {
                "url": "https://example.com/about",
                "status": "completed",
                "markdown": "# About Us\n\nWe are a company that does things. Here is a longer description to pass the content filter.",
            },
        ]
        summarizer_instance = MagicMock()
        summarizer_instance.summarize.side_effect = lambda content, url: content
        mock_summarizer.return_value = summarizer_instance

        documents = self.crawler.read("https://example.com")

        self.assertEqual(len(documents), 2)
        self.assertEqual(documents[0].id, "https://example.com")
        self.assertEqual(documents[0].name, "https://example.com")
        self.assertIn("Welcome to Example", documents[0].content)
        self.assertEqual(documents[0].meta_data["url"], "https://example.com")
        self.assertEqual(documents[1].id, "https://example.com/about")

    @patch("app.knowledge.cloudflare_crawler.get_content_summarizer")
    @patch.object(CloudflareCrawler, "_poll_crawl")
    @patch.object(CloudflareCrawler, "_start_crawl")
    def test_read_with_callbacks(self, mock_start, mock_poll, mock_summarizer):
        mock_start.return_value = "job_cb"
        mock_poll.return_value = [
            {
                "url": "https://example.com",
                "status": "completed",
                "markdown": "# Home\n\nContent that is long enough to pass the minimum content length filter for testing purposes.",
            },
        ]
        summarizer_instance = MagicMock()
        summarizer_instance.summarize.side_effect = lambda c, u: c
        mock_summarizer.return_value = summarizer_instance

        vector_cb = MagicMock()
        url_cb = MagicMock()

        documents = self.crawler.read(
            "https://example.com",
            vector_db_callback=vector_cb,
            url_crawled_callback=url_cb,
        )

        self.assertEqual(len(documents), 1)
        vector_cb.assert_called_once()
        url_cb.assert_called_once_with("https://example.com")

    @patch("app.knowledge.cloudflare_crawler.get_content_summarizer")
    @patch.object(CloudflareCrawler, "_poll_crawl")
    @patch.object(CloudflareCrawler, "_start_crawl")
    def test_content_filtering(self, mock_start, mock_poll, mock_summarizer):
        """Pages with content shorter than min_content_length should be skipped."""
        mock_start.return_value = "job_filter"
        mock_poll.return_value = [
            {"url": "https://example.com", "status": "completed", "markdown": "short"},  # too short
            {
                "url": "https://example.com/about",
                "status": "completed",
                "markdown": "x" * 100,  # exactly at threshold
            },
        ]
        summarizer_instance = MagicMock()
        summarizer_instance.summarize.side_effect = lambda c, u: c
        mock_summarizer.return_value = summarizer_instance

        documents = self.crawler.read("https://example.com")

        self.assertEqual(len(documents), 1)
        self.assertEqual(documents[0].id, "https://example.com/about")

    @patch("app.knowledge.cloudflare_crawler.get_content_summarizer")
    @patch.object(CloudflareCrawler, "_poll_crawl")
    @patch.object(CloudflareCrawler, "_start_crawl")
    def test_read_callback_error_does_not_break_flow(self, mock_start, mock_poll, mock_summarizer):
        """If a callback raises, the document should still be collected."""
        mock_start.return_value = "job_err"
        mock_poll.return_value = [
            {
                "url": "https://example.com",
                "status": "completed",
                "markdown": "Content long enough for the minimum content length filter to pass in this test case.",
            },
        ]
        summarizer_instance = MagicMock()
        summarizer_instance.summarize.side_effect = lambda c, u: c
        mock_summarizer.return_value = summarizer_instance

        vector_cb = MagicMock(side_effect=Exception("vector db down"))

        documents = self.crawler.read("https://example.com", vector_db_callback=vector_cb)
        self.assertEqual(len(documents), 1)

    @patch("app.knowledge.cloudflare_crawler.get_content_summarizer")
    @patch.object(CloudflareCrawler, "_poll_crawl")
    @patch.object(CloudflareCrawler, "_start_crawl")
    def test_read_skips_empty_markdown(self, mock_start, mock_poll, mock_summarizer):
        """Records with empty/missing markdown should be skipped."""
        mock_start.return_value = "job_empty"
        mock_poll.return_value = [
            {"url": "https://example.com", "status": "completed", "markdown": ""},
            {"url": "https://example.com/nomd", "status": "completed"},
        ]
        summarizer_instance = MagicMock()
        summarizer_instance.summarize.side_effect = lambda c, u: c
        mock_summarizer.return_value = summarizer_instance

        documents = self.crawler.read("https://example.com")
        self.assertEqual(len(documents), 0)


    # ------------------------------------------------------------------
    # Fallback to EnhancedWebsiteReader
    # ------------------------------------------------------------------

    @patch.object(CloudflareCrawler, "_fallback_read")
    @patch.object(CloudflareCrawler, "_start_crawl")
    def test_read_falls_back_on_429(self, mock_start, mock_fallback):
        """429 rate limit should trigger fallback to EnhancedWebsiteReader."""
        mock_response = MagicMock()
        mock_response.status_code = 429
        mock_start.side_effect = httpx.HTTPStatusError(
            "429 Too Many Requests", request=MagicMock(), response=mock_response
        )
        mock_fallback.return_value = [MagicMock()]

        documents = self.crawler.read("https://example.com")
        mock_fallback.assert_called_once()
        self.assertEqual(len(documents), 1)

    @patch.object(CloudflareCrawler, "_fallback_read")
    @patch.object(CloudflareCrawler, "_start_crawl")
    def test_read_falls_back_on_401(self, mock_start, mock_fallback):
        """Auth errors should trigger fallback."""
        mock_response = MagicMock()
        mock_response.status_code = 401
        mock_start.side_effect = httpx.HTTPStatusError(
            "401 Unauthorized", request=MagicMock(), response=mock_response
        )
        mock_fallback.return_value = []

        documents = self.crawler.read("https://example.com")
        mock_fallback.assert_called_once()
        self.assertEqual(len(documents), 0)


if __name__ == "__main__":
    unittest.main()
