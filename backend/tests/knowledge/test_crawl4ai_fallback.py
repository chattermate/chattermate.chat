"""
ChatterMate - Test Crawl4AI Fallback
Copyright (C) 2024 ChatterMate

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>
"""

import pytest
from unittest.mock import MagicMock, patch, AsyncMock
from bs4 import BeautifulSoup
import asyncio

from app.knowledge.crawl4ai_fallback import (
    Crawl4AIFallback,
    get_crawl4ai_fallback,
    CRAWL4AI_AVAILABLE
)


class TestCrawl4AIFallback:
    """Test suite for Crawl4AIFallback class"""
    
    def test_init_default_params(self):
        """Test initialization with default parameters"""
        fallback = Crawl4AIFallback()
        
        assert fallback.timeout == 30
        assert fallback.verify_ssl is True
        assert fallback._is_available == CRAWL4AI_AVAILABLE
    
    def test_init_custom_params(self):
        """Test initialization with custom parameters"""
        fallback = Crawl4AIFallback(timeout=60, verify_ssl=False)
        
        assert fallback.timeout == 60
        assert fallback.verify_ssl is False
    
    def test_is_available_property(self):
        """Test is_available property"""
        fallback = Crawl4AIFallback()
        
        assert fallback.is_available == CRAWL4AI_AVAILABLE
    
    @pytest.mark.asyncio
    @patch('app.knowledge.crawl4ai_fallback.CRAWL4AI_AVAILABLE', True)
    @patch('app.knowledge.crawl4ai_fallback.AsyncWebCrawler')
    async def test_async_fetch_success(self, mock_crawler_class):
        """Test successful async fetch without screenshot"""
        # Arrange
        url = "https://example.com"
        mock_result = MagicMock()
        mock_result.success = True
        mock_result.html = "<html><body>Test content</body></html>"
        mock_result.markdown = MagicMock()
        mock_result.markdown.raw_markdown = "# Test content"
        mock_result.error_message = None
        
        mock_crawler_instance = AsyncMock()
        mock_crawler_instance.arun.return_value = mock_result
        mock_crawler_instance.__aenter__.return_value = mock_crawler_instance
        mock_crawler_instance.__aexit__.return_value = None
        mock_crawler_class.return_value = mock_crawler_instance
        
        fallback = Crawl4AIFallback()
        fallback._is_available = True
        
        # Act
        html, markdown, screenshot = await fallback._async_fetch(url, take_screenshot=False)
        
        # Assert
        assert html == "<html><body>Test content</body></html>"
        assert markdown == "# Test content"
        assert screenshot is None
        mock_crawler_instance.arun.assert_called_once()
    
    @pytest.mark.asyncio
    @patch('app.knowledge.crawl4ai_fallback.CRAWL4AI_AVAILABLE', True)
    @patch('app.knowledge.crawl4ai_fallback.AsyncWebCrawler')
    async def test_async_fetch_failure(self, mock_crawler_class):
        """Test failed async fetch"""
        # Arrange
        url = "https://example.com"
        mock_result = MagicMock()
        mock_result.success = False
        mock_result.error_message = "Connection timeout"
        
        mock_crawler_instance = AsyncMock()
        mock_crawler_instance.arun.return_value = mock_result
        mock_crawler_instance.__aenter__.return_value = mock_crawler_instance
        mock_crawler_instance.__aexit__.return_value = None
        mock_crawler_class.return_value = mock_crawler_instance
        
        fallback = Crawl4AIFallback()
        fallback._is_available = True
        
        # Act
        html, markdown, screenshot = await fallback._async_fetch(url, take_screenshot=False)
        
        # Assert
        assert html is None
        assert markdown is None
        assert screenshot is None
    
    @pytest.mark.asyncio
    @patch('app.knowledge.crawl4ai_fallback.CRAWL4AI_AVAILABLE', True)
    @patch('playwright.async_api.async_playwright')
    @patch('app.knowledge.crawl4ai_fallback.AsyncWebCrawler')
    async def test_async_fetch_with_screenshot(self, mock_crawler_class, mock_playwright):
        """Test async fetch with screenshot enabled"""
        # Arrange
        url = "https://example.com"
        
        # Mock Playwright screenshot
        mock_page = AsyncMock()
        mock_page.goto = AsyncMock()
        mock_page.wait_for_timeout = AsyncMock()
        mock_page.screenshot.return_value = b'fake_screenshot_bytes'
        mock_page.content.return_value = "<html><body>Playwright content</body></html>"
        
        mock_context = AsyncMock()
        mock_context.new_page.return_value = mock_page
        
        mock_browser = AsyncMock()
        mock_browser.new_context.return_value = mock_context
        mock_browser.close = AsyncMock()
        
        mock_playwright_instance = AsyncMock()
        mock_playwright_instance.chromium.launch.return_value = mock_browser
        mock_playwright_instance.__aenter__.return_value = mock_playwright_instance
        mock_playwright_instance.__aexit__.return_value = None
        mock_playwright.return_value = mock_playwright_instance
        
        # Mock Crawl4AI
        mock_result = MagicMock()
        mock_result.success = True
        mock_result.html = "<html><body>Crawl4AI content</body></html>"
        mock_result.markdown = MagicMock()
        mock_result.markdown.raw_markdown = "# Crawl4AI content"
        
        mock_crawler_instance = AsyncMock()
        mock_crawler_instance.arun.return_value = mock_result
        mock_crawler_instance.__aenter__.return_value = mock_crawler_instance
        mock_crawler_instance.__aexit__.return_value = None
        mock_crawler_class.return_value = mock_crawler_instance
        
        fallback = Crawl4AIFallback()
        fallback._is_available = True
        
        # Act
        html, markdown, screenshot = await fallback._async_fetch(url, take_screenshot=True)
        
        # Assert
        assert html == "<html><body>Playwright content</body></html>"  # Playwright HTML is used
        assert markdown == "# Crawl4AI content"
        assert screenshot is not None
        assert isinstance(screenshot, str)  # Base64 encoded
        mock_page.screenshot.assert_called_once()
    
    @pytest.mark.asyncio
    @patch('app.knowledge.crawl4ai_fallback.CRAWL4AI_AVAILABLE', True)
    @patch('app.knowledge.crawl4ai_fallback.AsyncWebCrawler')
    async def test_async_fetch_exception(self, mock_crawler_class):
        """Test async fetch with exception"""
        # Arrange
        url = "https://example.com"
        mock_crawler_class.side_effect = Exception("Network error")
        
        fallback = Crawl4AIFallback()
        fallback._is_available = True
        
        # Act
        html, markdown, screenshot = await fallback._async_fetch(url, take_screenshot=False)
        
        # Assert
        assert html is None
        assert markdown is None
        assert screenshot is None
    
    @patch('app.knowledge.crawl4ai_fallback.CRAWL4AI_AVAILABLE', False)
    def test_fetch_with_browser_not_available(self):
        """Test fetch_with_browser when Crawl4AI is not available"""
        fallback = Crawl4AIFallback()
        fallback._is_available = False
        
        content, soup, screenshot = fallback.fetch_with_browser("https://example.com")
        
        assert content is None
        assert soup is None
        assert screenshot is None
    
    @patch('app.knowledge.crawl4ai_fallback.CRAWL4AI_AVAILABLE', True)
    def test_fetch_with_browser_with_markdown(self):
        """Test fetch_with_browser returns markdown when available"""
        fallback = Crawl4AIFallback()
        fallback._is_available = True
        
        # Mock _run_async_safely to return markdown
        html_content = "<html><body>Test</body></html>"
        markdown_content = "# Test Markdown\n\nThis is a long markdown content with more than 100 characters to ensure it's substantial enough."
        
        with patch.object(fallback, '_run_async_safely', return_value=(html_content, markdown_content, None)):
            content, soup, screenshot = fallback.fetch_with_browser("https://example.com")
            
            assert content == markdown_content.strip()
            assert isinstance(soup, BeautifulSoup)
            assert screenshot is None
    
    @patch('app.knowledge.crawl4ai_fallback.CRAWL4AI_AVAILABLE', True)
    def test_fetch_with_browser_without_markdown(self):
        """Test fetch_with_browser when markdown is not substantial"""
        fallback = Crawl4AIFallback()
        fallback._is_available = True
        
        # Mock _run_async_safely to return short markdown
        html_content = "<html><body>Test</body></html>"
        markdown_content = "Short"  # Less than 100 chars
        
        with patch.object(fallback, '_run_async_safely', return_value=(html_content, markdown_content, None)):
            content, soup, screenshot = fallback.fetch_with_browser("https://example.com")
            
            assert content is None  # Should return None for extraction from soup
            assert isinstance(soup, BeautifulSoup)
            assert screenshot is None
    
    @patch('app.knowledge.crawl4ai_fallback.CRAWL4AI_AVAILABLE', True)
    def test_fetch_with_browser_no_content(self):
        """Test fetch_with_browser when no content is returned"""
        fallback = Crawl4AIFallback()
        fallback._is_available = True
        
        with patch.object(fallback, '_run_async_safely', return_value=(None, None, None)):
            content, soup, screenshot = fallback.fetch_with_browser("https://example.com")
            
            assert content is None
            assert soup is None
            assert screenshot is None
    
    @patch('app.knowledge.crawl4ai_fallback.CRAWL4AI_AVAILABLE', True)
    def test_fetch_with_browser_exception(self):
        """Test fetch_with_browser handles exceptions gracefully"""
        fallback = Crawl4AIFallback()
        fallback._is_available = True
        
        with patch.object(fallback, '_run_async_safely', side_effect=Exception("Test error")):
            content, soup, screenshot = fallback.fetch_with_browser("https://example.com")
            
            assert content is None
            assert soup is None
            assert screenshot is None
    
    @patch('app.knowledge.crawl4ai_fallback.CRAWL4AI_AVAILABLE', True)
    @patch('asyncio.get_event_loop')
    @patch('asyncio.run')
    def test_run_async_safely_no_running_loop(self, mock_asyncio_run, mock_get_loop):
        """Test _run_async_safely when no event loop is running"""
        # Arrange
        mock_loop = MagicMock()
        mock_loop.is_running.return_value = False
        mock_get_loop.return_value = mock_loop
        
        mock_asyncio_run.return_value = ("<html>Test</html>", "# Test", None)
        
        fallback = Crawl4AIFallback()
        fallback._is_available = True
        
        # Act
        html, markdown, screenshot = fallback._run_async_safely("https://example.com", False)
        
        # Assert
        assert html == "<html>Test</html>"
        assert markdown == "# Test"
        assert screenshot is None
        mock_asyncio_run.assert_called_once()
    
    @patch('app.knowledge.crawl4ai_fallback.CRAWL4AI_AVAILABLE', True)
    @patch('asyncio.get_event_loop')
    @patch('threading.Thread')
    def test_run_async_safely_with_running_loop(self, mock_thread_class, mock_get_loop):
        """Test _run_async_safely when event loop is already running"""
        # Arrange
        mock_loop = MagicMock()
        mock_loop.is_running.return_value = True
        mock_get_loop.return_value = mock_loop
        
        # Mock thread execution
        mock_thread = MagicMock()
        mock_thread.is_alive.return_value = False
        mock_thread_class.return_value = mock_thread
        
        fallback = Crawl4AIFallback()
        fallback._is_available = True
        
        # Mock the async fetch to set result
        def mock_thread_target(*args, **kwargs):
            # Simulate successful execution
            pass
        
        with patch.object(fallback, '_async_fetch', return_value=("<html>Test</html>", "# Test", None)):
            # Act
            html, markdown, screenshot = fallback._run_async_safely("https://example.com", False)
            
            # Assert
            mock_thread_class.assert_called_once()
            mock_thread.start.assert_called_once()
            mock_thread.join.assert_called_once()
    
    @patch('app.knowledge.crawl4ai_fallback.CRAWL4AI_AVAILABLE', True)
    @patch('asyncio.get_event_loop')
    @patch('asyncio.run')
    def test_run_async_safely_exception(self, mock_asyncio_run, mock_get_loop):
        """Test _run_async_safely handles exceptions"""
        # Arrange
        mock_loop = MagicMock()
        mock_loop.is_running.return_value = False
        mock_get_loop.return_value = mock_loop
        
        # Simulate exception in asyncio.run
        mock_asyncio_run.side_effect = RuntimeError("Async execution failed")
        
        fallback = Crawl4AIFallback()
        fallback._is_available = True
        
        # Act
        html, markdown, screenshot = fallback._run_async_safely("https://example.com", False)
        
        # Assert - should handle exception gracefully and return None
        assert html is None
        assert markdown is None
        assert screenshot is None


class TestGetCrawl4AIFallback:
    """Test suite for get_crawl4ai_fallback singleton function"""
    
    def test_get_crawl4ai_fallback_creates_instance(self):
        """Test that get_crawl4ai_fallback creates an instance"""
        # Reset singleton
        import app.knowledge.crawl4ai_fallback as module
        module._crawl4ai_fallback_instance = None
        
        instance = get_crawl4ai_fallback()
        
        assert isinstance(instance, Crawl4AIFallback)
        assert instance.timeout == 30
        assert instance.verify_ssl is True
    
    def test_get_crawl4ai_fallback_returns_same_instance(self):
        """Test that get_crawl4ai_fallback returns the same instance (singleton)"""
        # Reset singleton
        import app.knowledge.crawl4ai_fallback as module
        module._crawl4ai_fallback_instance = None
        
        instance1 = get_crawl4ai_fallback()
        instance2 = get_crawl4ai_fallback()
        
        assert instance1 is instance2
    
    def test_get_crawl4ai_fallback_custom_params(self):
        """Test get_crawl4ai_fallback with custom parameters"""
        # Reset singleton
        import app.knowledge.crawl4ai_fallback as module
        module._crawl4ai_fallback_instance = None
        
        instance = get_crawl4ai_fallback(timeout=60, verify_ssl=False)
        
        assert instance.timeout == 60
        assert instance.verify_ssl is False


class TestCrawl4AIIntegration:
    """Integration tests for Crawl4AI (only run if Crawl4AI is available)"""
    
    @pytest.mark.skipif(not CRAWL4AI_AVAILABLE, reason="Crawl4AI not installed")
    @pytest.mark.asyncio
    async def test_real_async_fetch_simple_page(self):
        """Test real async fetch with a simple page (requires Crawl4AI)"""
        fallback = Crawl4AIFallback(timeout=10)
        
        # Use a simple, reliable test URL
        url = "https://example.com"
        
        try:
            html, markdown, screenshot = await fallback._async_fetch(url, take_screenshot=False)
            
            # Basic assertions
            assert html is not None or markdown is not None
            if html:
                assert len(html) > 0
                assert "example" in html.lower()
        except Exception as e:
            pytest.skip(f"Network or Crawl4AI issue: {str(e)}")
    
    @pytest.mark.skipif(not CRAWL4AI_AVAILABLE, reason="Crawl4AI not installed")
    def test_real_fetch_with_browser(self):
        """Test real fetch_with_browser (requires Crawl4AI)"""
        fallback = Crawl4AIFallback(timeout=10)
        
        if not fallback.is_available:
            pytest.skip("Crawl4AI not available")
        
        url = "https://example.com"
        
        try:
            content, soup, screenshot = fallback.fetch_with_browser(url, take_screenshot=False)
            
            # Basic assertions
            assert content is not None or soup is not None
            if soup:
                assert isinstance(soup, BeautifulSoup)
        except Exception as e:
            pytest.skip(f"Network or Crawl4AI issue: {str(e)}")

