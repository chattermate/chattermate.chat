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

import os
import unittest
from unittest.mock import patch, MagicMock, Mock
from bs4 import BeautifulSoup
import httpx

from app.knowledge.enhanced_website_reader import EnhancedWebsiteReader


class TestEnhancedWebsiteReader(unittest.TestCase):
    """Test cases for EnhancedWebsiteReader"""

    def setUp(self):
        """Set up test environment"""
        self.reader = EnhancedWebsiteReader(
            max_depth=2,
            max_links=5,
            min_content_length=50
        )

        # The fetch path now runs an SSRF guard (url_safety.resolves_to_blocked_host)
        # which does a DNS lookup — stub it to a fixed public IP so tests don't hit
        # the network and aren't blocked.
        dns_patcher = patch(
            'app.knowledge.url_safety.socket.getaddrinfo',
            return_value=[(2, 1, 6, "", ("93.184.216.34", 0))],
        )
        self.addCleanup(dns_patcher.stop)
        dns_patcher.start()
        
        # Create a simple HTML response for testing
        self.test_html = """
        <!DOCTYPE html>
        <html>
        <head>
            <title>Test Page</title>
            <style>
                .hidden { display: none; }
            </style>
            <script>console.log('This should be ignored');</script>
        </head>
        <body>
            <header>
                <nav>
                    <a href="/page1">Page 1</a>
                    <a href="/page2">Page 2</a>
                </nav>
            </header>
            <div class="banner">Banner content to be ignored</div>
            <main>
                <h1>Main Content</h1>
                <p>This is the main content of the page. It should be extracted properly.</p>
                <p>Additional paragraph with meaningful content.</p>
            </main>
            <div class="sidebar">
                <h2>Sidebar</h2>
                <p>Sidebar content should be ignored.</p>
            </div>
            <div class="content">
                <h2>Additional Content</h2>
                <p>More content in a div with class 'content'.</p>
            </div>
            <div id="post-content">
                <h2>Post Content</h2>
                <p>Content in a div with id 'post-content'.</p>
            </div>
            <div>
                <h2>Generic Content</h2>
                <p>Content in a generic div without special class or id.</p>
                <p>This is a good paragraph with substantial text that should be detected by density extraction.</p>
                <p>Another good paragraph that helps identify this div as having high text density.</p>
            </div>
            <footer>
                <p>Footer content to be ignored.</p>
            </footer>
            <div class="hidden">
                <p>This should be ignored because it's hidden.</p>
            </div>
        </body>
        </html>
        """
        self.soup = BeautifulSoup(self.test_html, 'html.parser')
        
    def test_extract_content_by_tags(self):
        """Test content extraction by common tags"""
        # Extract content from the main tag
        content = self.reader._extract_main_content(self.soup)
        self.assertIn("Main Content", content)
        self.assertIn("This is the main content of the page", content)
        
    def test_extract_content_by_class_names(self):
        """Test content extraction by class names"""
        # Remove the main tag to test fallback to class names
        main_tag = self.soup.find('main')
        if main_tag:
            main_tag.decompose()
            
        content = self.reader._extract_main_content(self.soup)
        self.assertIn("Additional Content", content)
        self.assertIn("More content in a div with class 'content'", content)
        
    def test_extract_content_by_id(self):
        """Test content extraction by id"""
        # Remove the main tag and content class to test fallback to id
        main_tag = self.soup.find('main')
        if main_tag:
            main_tag.decompose()
        content_div = self.soup.find(class_='content')
        if content_div:
            content_div.decompose()
            
        content = self.reader._extract_main_content(self.soup)
        self.assertIn("Post Content", content)
        self.assertIn("Content in a div with id 'post-content'", content)
        
    def test_extract_content_by_density(self):
        """Test content extraction by paragraph density"""
        # Remove all specific tags, classes and ids to test density-based extraction
        main_tag = self.soup.find('main')
        if main_tag:
            main_tag.decompose()
        content_div = self.soup.find(class_='content')
        if content_div:
            content_div.decompose()
        post_content_div = self.soup.find(id='post-content')
        if post_content_div:
            post_content_div.decompose()
            
        content = self.reader._extract_main_content(self.soup)
        self.assertIn("Generic Content", content)
        self.assertIn("good paragraph with substantial text", content)
        
    def test_clean_soup(self):
        """Test cleaning of unwanted elements from HTML"""
        # Create a copy for testing
        soup_copy = BeautifulSoup(str(self.soup), 'html.parser')
        self.reader._clean_soup(soup_copy)
        
        # Check that truly unwanted elements are removed (scripts, styles, hidden elements)
        self.assertIsNone(soup_copy.find('script'))
        self.assertIsNone(soup_copy.find('style'))
        self.assertIsNone(soup_copy.find(class_='hidden'))
        
        # Check that navigation elements are removed (they contain menu links, not main content)
        self.assertIsNone(soup_copy.find('nav'))
        
        # Check that sidebar elements are removed
        self.assertIsNone(soup_copy.find(class_='sidebar'))
        
        # Check that main content elements are kept (header and footer may contain some content)
        self.assertIsNotNone(soup_copy.find('header'))
        self.assertIsNotNone(soup_copy.find('footer'))
        self.assertIsNotNone(soup_copy.find('main'))
        
    def test_canonical_url(self):
        """Fragments/trailing slashes are stripped so page variants collapse."""
        c = self.reader._canonical_url
        self.assertEqual(c('https://x.com/'), 'https://x.com')
        self.assertEqual(c('https://x.com/#features'), 'https://x.com')
        self.assertEqual(c('https://x.com/#pricing'), 'https://x.com')
        self.assertEqual(c('https://x.com/pricing/'), 'https://x.com/pricing')
        self.assertEqual(c('https://x.com/blogs#top'), 'https://x.com/blogs')
        # The homepage and its anchored variants all canonicalize to one id.
        variants = {c(u) for u in [
            'https://x.com', 'https://x.com/', 'https://x.com/#a', 'https://x.com/#b'
        ]}
        self.assertEqual(len(variants), 1)

    def test_looks_like_bot_challenge(self):
        """Bot-check interstitials are detected so they aren't stored as content."""
        f = self.reader._looks_like_bot_challenge
        # The exact wp.com interstitial from the reported bug (strong marker).
        self.assertTrue(f(
            "Checking your browser This will only take a few seconds... "
            "Secured by wp.com (URL: https://wordpress.com)"
        ))
        # Cloudflare markers.
        self.assertTrue(f("cf-browser-verification"))
        self.assertTrue(f("Just a moment..."))  # weak, but short
        # Real content is not flagged, even if long and mentioning a weak phrase.
        long_text = ("Our pricing is simple. " * 40) + "checking your browser settings is optional."
        self.assertFalse(f(long_text))
        self.assertFalse(f("Welcome to our pricing page. Plans start at $10 per seat."))
        self.assertFalse(f(""))
        self.assertFalse(f(None))

    def test_extract_links_dedupes_page_variants(self):
        """The homepage linked via #anchors and trailing slash yields one link."""
        html = """
        <html><body>
          <a href="https://site.com/#features">Features</a>
          <a href="https://site.com/#pricing">Pricing</a>
          <a href="https://site.com/">Home</a>
          <a href="https://site.com/docs">Docs</a>
          <a href="https://site.com/docs/">Docs slash</a>
        </body></html>
        """
        soup = BeautifulSoup(html, 'html.parser')
        links = self.reader._extract_links(soup, 'https://site.com')
        # All homepage variants collapse (and equal the base, so are dropped);
        # /docs and /docs/ collapse to a single canonical link.
        self.assertEqual(links, ['https://site.com/docs'])

    def test_extract_links_rejects_other_registrable_domains(self):
        """Only same-registrable-domain links are kept — a substring match like
        'evilsite.com'.endswith('site.com') must NOT slip through (that would let
        one plan-limited source fan out across unrelated domains)."""
        html = """
        <html><body>
          <a href="https://site.com/a">same</a>
          <a href="https://blog.site.com/b">subdomain (same registrable)</a>
          <a href="https://evilsite.com/c">lookalike suffix</a>
          <a href="https://notsite.com/d">another lookalike</a>
          <a href="https://other.com/e">unrelated</a>
        </body></html>
        """
        soup = BeautifulSoup(html, 'html.parser')
        links = self.reader._extract_links(soup, 'https://site.com')
        self.assertIn('https://site.com/a', links)
        self.assertIn('https://blog.site.com/b', links)
        self.assertNotIn('https://evilsite.com/c', links)
        self.assertNotIn('https://notsite.com/d', links)
        self.assertNotIn('https://other.com/e', links)

    def test_get_primary_domain_strips_port_and_www(self):
        self.assertEqual(self.reader._get_primary_domain('https://www.site.com:8443/x'), 'site.com')
        self.assertEqual(self.reader._get_primary_domain('https://a.b.example.co.uk/x'), 'example.co.uk')

    @patch('httpx.Client')
    def test_crawl_with_successful_request(self, mock_client):
        """Test crawling with successful HTTP requests"""
        # Mock HTTP client response
        mock_response = MagicMock()
        mock_response.text = self.test_html
        mock_response.is_redirect = False
        mock_response.raise_for_status = MagicMock()

        # Setup mock client
        mock_client_instance = MagicMock()
        mock_client_instance.get.return_value = mock_response
        mock_client.return_value.__enter__.return_value = mock_client_instance

        # Test crawling
        result = self.reader.crawl('https://example.com')
        
        # Verify that httpx client was called (may be multiple times due to parallel processing)
        self.assertTrue(mock_client.called)
        self.assertTrue(mock_client_instance.get.called)
        
        # Verify result contains the expected content
        self.assertIn('https://example.com', result)
        self.assertIn("Main Content", result['https://example.com'])
        
    @patch('httpx.Client')
    @patch('time.sleep', return_value=None)  # Skip actual sleeping
    def test_crawl_with_retries(self, mock_sleep, mock_client):
        """Test crawling with retries on failed requests"""
        # Mock HTTP errors for the first two attempts, then success
        mock_response_error = MagicMock()
        mock_response_error.is_redirect = False
        mock_response_error.raise_for_status.side_effect = httpx.HTTPStatusError("Error", request=MagicMock(), response=MagicMock(status_code=500))

        mock_response_request_error = MagicMock(
            is_redirect=False,
            raise_for_status=MagicMock(side_effect=httpx.RequestError("Timeout", request=MagicMock())),
        )

        mock_response_success = MagicMock()
        mock_response_success.text = self.test_html
        mock_response_success.is_redirect = False
        mock_response_success.raise_for_status = MagicMock()

        # Setup mock client - the parallel processing may create multiple client instances
        mock_client_instance = MagicMock()
        mock_client_instance.get.side_effect = [
            mock_response_error,  # First attempt fails with HTTP error
            mock_response_request_error,  # Second attempt fails with request error
            mock_response_success  # Third attempt succeeds
        ]
        mock_client.return_value.__enter__.return_value = mock_client_instance
        
        # Test crawling with retries
        result = self.reader.crawl('https://example.com')
        
        # Verify that retries happened (at least 3 calls should have been made)
        self.assertGreaterEqual(mock_client_instance.get.call_count, 3)
        
        # Verify result contains the expected content after successful retry
        self.assertIn('https://example.com', result)
        self.assertIn("Main Content", result['https://example.com'])
        
    @patch('httpx.Client')
    def test_read_method(self, mock_client):
        """Test the read method to ensure it returns proper Document objects"""
        # Mock HTTP response
        mock_response = MagicMock()
        mock_response.text = self.test_html
        mock_response.is_redirect = False
        mock_response.raise_for_status = MagicMock()

        # Setup mock client
        mock_client_instance = MagicMock()
        mock_client_instance.get.return_value = mock_response
        mock_client.return_value.__enter__.return_value = mock_client_instance

        # Test read method
        documents = self.reader.read('https://example.com')
        
        # Verify documents are created correctly
        self.assertTrue(len(documents) > 0)
        self.assertIn("Main Content", documents[0].content)
        
        # Verify metadata format
        self.assertEqual(documents[0].meta_data['url'], 'https://example.com')
        self.assertEqual(documents[0].meta_data['chunk'], 1)
        self.assertIsInstance(documents[0].meta_data['chunk_size'], int)
        
        # Verify ID and name
        self.assertEqual(documents[0].id, 'https://example.com')
        # Verify that name is the original source URL
        self.assertEqual(documents[0].name, 'https://example.com')


if __name__ == '__main__':
    unittest.main() 