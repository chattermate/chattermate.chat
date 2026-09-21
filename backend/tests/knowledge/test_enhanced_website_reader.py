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
import socket
import unittest
from unittest.mock import patch, MagicMock, Mock
from bs4 import BeautifulSoup
import httpx

from app.knowledge.crawl_scope import DEFAULT_CRAWL_SCOPE, CrawlScope
from app.knowledge.enhanced_website_reader import (
    EnhancedWebsiteReader,
    FAILURE_ADVICE,
    FailureCause,
)


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
        
    def test_extracts_every_content_block_on_the_page(self):
        """All of a page's content blocks are kept, not just the first one.

        The old walk returned the first container clearing min_content_length,
        so a page like this one yielded only <main> and silently dropped the
        three sibling blocks below it.
        """
        content = self.reader._extract_main_content(self.soup)
        self.assertIn("This is the main content of the page", content)
        self.assertIn("More content in a div with class 'content'", content)
        self.assertIn("Content in a div with id 'post-content'", content)
        self.assertIn("Content in a generic div", content)

    def test_a_banner_before_the_content_does_not_win(self):
        """A short block that merely clears the floor must not beat the page.

        This is eazzyliving.co.uk: its first <article> was a 108-character
        search widget, and returning it discarded ~4,500 characters of page.
        The customer retried four times and left.
        """
        html = """
        <html><body>
            <article>Search properties. Search by city, university, or
            neighbourhood to find verified student rooms and studios.</article>
            <div class="listings">
                <h1>Student accommodation in Leeds</h1>
                <p>%s</p>
            </div>
        </body></html>
        """ % ("Verified rooms close to campus with bills included. " * 40)

        content = self.reader._extract_main_content(BeautifulSoup(html, 'html.parser'))

        self.assertIn("Student accommodation in Leeds", content)
        self.assertIn("Verified rooms close to campus", content)
        self.assertGreater(len(content), 1000)

    def test_the_page_title_survives_when_it_sits_in_a_page_header(self):
        """Docs themes put the <h1> in a <header>, which selection treats as chrome.

        docs.chattermate.chat lost "Quickstart: Launch Your AI Support Agent in
        5 Minutes" that way. A page's title is its strongest retrieval signal,
        so losing it makes the page harder for an agent to find, not just
        shorter.
        """
        body = "Run the stack on your own infrastructure with the CLI. " * 20
        html = f"""
        <html><body>
            <header><h1>Quickstart: Launch in 5 Minutes</h1></header>
            <div class="prose"><p>{body}</p></div>
            <footer>GitHub Discord</footer>
        </body></html>
        """
        content = self.reader._extract_main_content(BeautifulSoup(html, 'html.parser'))

        self.assertIn("Quickstart: Launch in 5 Minutes", content)
        self.assertIn("own infrastructure", content)
        self.assertNotIn("Discord", content, "footer chrome should stay out")

    def test_a_page_with_no_h1_falls_back_to_the_document_title(self):
        """<title> lives in <head>, which _clean_soup strips.

        Reading it after the clean would always find nothing, so a page with no
        <h1> would silently have no title at all.
        """
        body = "Refund terms and conditions apply to all orders. " * 20
        html = f"""
        <html><head><title>Refund Policy</title></head>
        <body><div class="c"><p>{body}</p></div></body></html>
        """
        content = self.reader._extract_main_content(BeautifulSoup(html, 'html.parser'))
        self.assertIn("Refund Policy", content)

    def test_the_title_is_not_duplicated_when_already_in_the_content(self):
        """The usual case: the <h1> is inside the content container already."""
        body = "Every plan we offer, billed monthly or yearly. " * 20
        html = f"""
        <html><body>
            <main><h1>Plans and pricing</h1><p>{body}</p></main>
        </body></html>
        """
        content = self.reader._extract_main_content(BeautifulSoup(html, 'html.parser'))

        self.assertIn("Plans and pricing", content)
        self.assertEqual(content.count("Plans and pricing"), 1,
                         "the heading must not be prepended on top of itself")

    def test_a_page_of_only_boilerplate_stays_below_the_floor(self):
        """Nav chrome must not pass as content.

        www.solcontrol.ca renders its catalogue with JavaScript; all the served
        HTML holds is a phone number and a login link. That cleared the
        100-character floor, so it was stored as the page's content *and* it
        suppressed the browser fallback that reads the site properly. Staying
        under the floor is what routes the page to Crawl4AI in _process_url.
        """
        html = """
        <html><body>
            <header><a href="/login">Welcome, Guest - Login</a>
                    <a href="tel:905-230-8468">905-230-8468</a></header>
            <nav><a href="/a">Products</a><a href="/b">About</a></nav>
            <footer><a href="mailto:info@solcontrol.ca">info@solcontrol.ca</a></footer>
        </body></html>
        """
        content = self.reader._extract_main_content(BeautifulSoup(html, 'html.parser'))
        self.assertLess(len(content), self.reader.min_content_length)

    def test_extract_content_by_density(self):
        """Density extraction still runs when no container holds the page."""
        html = """
        <html><body>
            <span>x</span>
            <div><p>%s</p><p>%s</p></div>
        </body></html>
        """ % ("A good paragraph with substantial text. " * 5,
               "Another good paragraph that carries the page. " * 5)
        content = self.reader._extract_main_content(BeautifulSoup(html, 'html.parser'))
        self.assertIn("A good paragraph with substantial text", content)

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

    def test_extract_links_stays_on_the_seed_host_by_default(self):
        """Default scope is the seed's own host: a help-center crawl must not
        wander onto the marketing site, and a lookalike domain never matches."""
        html = """
        <html><body>
          <a href="https://site.com/a">same</a>
          <a href="https://www.site.com/b">www of the same host</a>
          <a href="https://blog.site.com/c">subdomain (same registrable)</a>
          <a href="https://evilsite.com/d">lookalike suffix</a>
          <a href="https://other.com/e">unrelated</a>
        </body></html>
        """
        soup = BeautifulSoup(html, 'html.parser')
        links = self.reader._extract_links(soup, 'https://site.com')
        self.assertIn('https://site.com/a', links)
        # In scope, and stored under the seed's spelling of the host.
        self.assertIn('https://site.com/b', links)
        self.assertNotIn('https://www.site.com/b', links)
        self.assertNotIn('https://blog.site.com/c', links)
        self.assertNotIn('https://evilsite.com/d', links)
        self.assertNotIn('https://other.com/e', links)

    def test_extract_links_domain_scope_spans_subdomains(self):
        """The opt-in 'domain' scope keeps the previous reach across subdomains,
        still by registrable-domain equality (never a suffix match)."""
        reader = EnhancedWebsiteReader(crawl_scope='domain')
        html = """
        <html><body>
          <a href="https://blog.site.com/b">subdomain</a>
          <a href="https://evilsite.com/c">lookalike suffix</a>
        </body></html>
        """
        soup = BeautifulSoup(html, 'html.parser')
        links = reader._extract_links(soup, 'https://site.com')
        self.assertIn('https://blog.site.com/b', links)
        self.assertNotIn('https://evilsite.com/c', links)

    def test_extract_links_collapses_www_variants_onto_the_seed_host(self):
        """A site that links both spellings stored the page twice — 4 of the 50
        pages in a real paywithatoa.co.uk crawl were www/bare duplicates."""
        html = """
        <html><body>
          <a href="https://www.site.com/terms">terms via www</a>
          <a href="https://site.com/terms">terms bare</a>
          <a href="https://www.site.com/privacy">privacy via www</a>
        </body></html>
        """
        soup = BeautifulSoup(html, 'html.parser')
        links = self.reader._extract_links(soup, 'https://site.com/')
        self.assertEqual(links, ['https://site.com/terms', 'https://site.com/privacy'])

        # Seeded at the www spelling, the crawl keeps that one instead.
        reader = EnhancedWebsiteReader()
        links = reader._extract_links(soup, 'https://www.site.com/')
        self.assertEqual(links, ['https://www.site.com/terms', 'https://www.site.com/privacy'])

    def test_extract_links_skips_non_http_schemes(self):
        """mailto:/tel: hrefs are contact actions, not pages. urljoin leaves them
        untouched, and 'https://' + 'mailto:a@site.com' parses as host site.com
        with 'mailto:a' as userinfo — so they used to be crawled as pages."""
        html = """
        <html><body>
          <a href="mailto:hello@site.com">Email us</a>
          <a href="tel:+441234567890">Call us</a>
          <a href="javascript:void(0)">Menu</a>
          <a href="/pricing">Pricing</a>
        </body></html>
        """
        soup = BeautifulSoup(html, 'html.parser')
        links = self.reader._extract_links(soup, 'https://site.com/help')
        self.assertEqual(links, ['https://site.com/pricing'])

    def test_normalize_url_leaves_non_http_schemes_alone(self):
        """Prefixing 'mailto:a@site.com' with https:// produced a fetchable
        'https://mailto:a@site.com' — the source of the mangled stored pages."""
        self.assertEqual(self.reader._normalize_url('mailto:a@site.com'), 'mailto:a@site.com')
        self.assertEqual(self.reader._normalize_url('site.com/x'), 'https://site.com/x')
        self.assertEqual(self.reader._normalize_url('http://site.com'), 'http://site.com')

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


class TestUnreachableHostsFailFast(unittest.TestCase):
    """A host we never reached fails the same way every attempt.

    The old ladder — three tries with exponential backoff, then a headless
    browser — spent 130 seconds on mateusoliveira.com (which drops the SYN on
    80 and 443) and ~10 seconds on each domain with no A record, holding one of
    only two queue slots for the whole time.
    """

    def setUp(self):
        self.reader = EnhancedWebsiteReader(max_depth=1, max_links=1, min_content_length=50)
        dns_patcher = patch(
            'app.knowledge.url_safety.socket.getaddrinfo',
            return_value=[(2, 1, 6, "", ("93.184.216.34", 0))],
        )
        self.addCleanup(dns_patcher.stop)
        dns_patcher.start()

    def _crawl_with(self, error):
        """Run one page through the fetch path with `error` raised every time."""
        scope = CrawlScope.for_seed("https://example.com", DEFAULT_CRAWL_SCOPE)
        with patch('app.knowledge.enhanced_website_reader.httpx.Client') as client, \
             patch('app.knowledge.enhanced_website_reader.get_crawl4ai_fallback') as browser, \
             patch('app.knowledge.enhanced_website_reader.time.sleep') as sleep:
            client.return_value.__enter__.return_value.get.side_effect = error
            browser.return_value.is_available = True
            browser.return_value.fetch_with_browser.return_value = (None, None, None)
            result = self.reader._process_url(("https://example.com", 1), scope)
        return result, client.return_value.__enter__.return_value.get, browser, sleep


    def test_a_domain_that_does_not_resolve_is_tried_once(self):
        error = httpx.ConnectError("[Errno 8] nodename nor servname provided, or not known")
        result, get, browser, _ = self._crawl_with(error)

        self.assertIsNone(result)
        self.assertEqual(get.call_count, 1, "no point retrying a name that does not resolve")
        browser.return_value.fetch_with_browser.assert_not_called()
        self.assertEqual(self.reader._failure_causes, {FailureCause.DNS: 1})

    def test_a_dropped_connection_attempt_is_tried_once(self):
        result, get, browser, _ = self._crawl_with(httpx.ConnectTimeout("timed out"))

        self.assertIsNone(result)
        self.assertEqual(get.call_count, 1)
        browser.return_value.fetch_with_browser.assert_not_called()
        self.assertEqual(self.reader._failure_causes, {FailureCause.TIMEOUT: 1})

    def test_a_refused_connection_still_gets_the_browser(self):
        """Could be a TLS quirk rather than a dead host, so give Chromium a turn."""
        result, get, browser, _ = self._crawl_with(httpx.ConnectError("Connection refused"))

        self.assertIsNone(result)
        self.assertEqual(get.call_count, 1, "a refusal will not change in two seconds")
        browser.return_value.fetch_with_browser.assert_called_once()
        self.assertEqual(self.reader._failure_causes, {FailureCause.CONNECTION: 1})

    def test_a_slow_page_is_still_retried(self):
        """Read timeouts are the transient case retries exist for."""
        result, get, browser, _ = self._crawl_with(httpx.ReadTimeout("too slow"))

        self.assertIsNone(result)
        self.assertEqual(get.call_count, self.reader.max_retries)
        browser.return_value.fetch_with_browser.assert_called_once()

    def test_our_own_bugs_are_not_blamed_on_the_customers_site(self):
        """A crash in our parsing must not be reported as the site being down.

        Everything inside the fetch block — BeautifulSoup, link extraction,
        content selection — can raise. Classifying those as a connection
        failure told the customer "your site refused the connection" when what
        actually happened was our own AttributeError.
        """
        reader = EnhancedWebsiteReader()
        for error in (AttributeError("'NoneType' has no attribute 'find'"),
                      KeyError("href"),
                      ValueError("bad parse")):
            cause, _, _ = reader._classify_transport_error(error)
            self.assertEqual(cause, FailureCause.UNKNOWN)
            self.assertNotIn(cause, FAILURE_ADVICE,
                             "UNKNOWN must fall back to the generic message")

    def test_our_own_pool_exhaustion_is_not_blamed_on_the_site(self):
        """PoolTimeout means we never sent the request, so the site is not slow."""
        reader = EnhancedWebsiteReader()
        cause, retry, _ = reader._classify_transport_error(httpx.PoolTimeout("pool full"))
        self.assertEqual(cause, FailureCause.UNKNOWN)
        self.assertTrue(retry, "a saturated pool does free up")

    def test_name_resolution_is_detected_from_the_socket_error(self):
        """Not from the message text, which other errors can imitate."""
        reader = EnhancedWebsiteReader()

        gai = httpx.ConnectError("connection failed")
        gai.__cause__ = socket.gaierror(8, "nodename nor servname provided")
        self.assertEqual(reader._classify_transport_error(gai)[0], FailureCause.DNS)

        # A refusal that merely mentions a name must not be read as DNS, or we
        # would skip the browser fallback for a host that is actually up.
        refused = httpx.ConnectError("Connection refused by name-based vhost")
        cause, _, browser = reader._classify_transport_error(refused)
        self.assertEqual(cause, FailureCause.CONNECTION)
        self.assertTrue(browser)
