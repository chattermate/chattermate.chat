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

import asyncio
from typing import Optional, Tuple
from bs4 import BeautifulSoup
from app.core.logger import get_logger

logger = get_logger(__name__)

# Try to import crawl4ai
try:
    from crawl4ai import AsyncWebCrawler, BrowserConfig, CrawlerRunConfig, CacheMode
    CRAWL4AI_AVAILABLE = True
    logger.info("✓ Crawl4AI module loaded successfully")
except ImportError:
    CRAWL4AI_AVAILABLE = False
    logger.warning("⚠️  Crawl4AI not installed. Install with: pip install crawl4ai>=0.7.0")

# Note: We use threading for async compatibility instead of nest_asyncio
# This avoids conflicts with uvloop and other event loop implementations


class Crawl4AIFallback:
    """
    Fallback crawler using Crawl4AI with browser rendering for JavaScript-heavy websites.
    This provides an alternative when standard HTTP requests fail to extract content.
    """
    
    def __init__(self, timeout: int = 30, verify_ssl: bool = True):
        """
        Initialize the Crawl4AI fallback crawler.
        
        :param timeout: Request timeout in seconds
        :param verify_ssl: Whether to verify SSL certificates
        """
        self.timeout = timeout
        self.verify_ssl = verify_ssl
        self._is_available = CRAWL4AI_AVAILABLE
    
    @property
    def is_available(self) -> bool:
        """Check if Crawl4AI is available."""
        return self._is_available
    
    async def _async_fetch(self, url: str, take_screenshot: bool = False) -> Tuple[Optional[str], Optional[str], Optional[str]]:
        """
        Async method to fetch content using Crawl4AI.
        
        :param url: The URL to fetch
        :param take_screenshot: Whether to take a screenshot of the rendered page
        :return: Tuple of (html, markdown, screenshot_base64) or (None, None, None) if failed
        """
        screenshot_base64 = None
        html_content = None
        markdown_content = None
        
        # If screenshot is needed, use Playwright directly for better control
        if take_screenshot:
            try:
                logger.info(f"📸 Using Playwright directly for viewport screenshot of {url}")
                from playwright.async_api import async_playwright
                import base64
                
                async with async_playwright() as p:
                    browser = await p.chromium.launch(
                        headless=True,
                        args=[
                            "--disable-blink-features=AutomationControlled",
                            "--disable-dev-shm-usage",
                            "--no-sandbox",
                        ]
                    )
                    
                    context = await browser.new_context(
                        viewport={'width': 1280, 'height': 1024},
                        user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                        ignore_https_errors=not self.verify_ssl
                    )
                    
                    page = await context.new_page()
                    await page.goto(url, wait_until="domcontentloaded", timeout=self.timeout * 1000)
                    
                    # Wait for content to render
                    await page.wait_for_timeout(3000)  # 3 seconds for JS to execute
                    
                    # Take viewport-only screenshot
                    screenshot_bytes = await page.screenshot(type='png', full_page=False)
                    screenshot_base64 = base64.b64encode(screenshot_bytes).decode('utf-8')
                    
                    screenshot_size = len(screenshot_base64)
                    logger.info(f"✅ Viewport screenshot captured: {screenshot_size} chars ({screenshot_size // 1024}KB)")
                    
                    # Also get the HTML content
                    html_content = await page.content()
                    
                    await browser.close()
                    
            except Exception as screenshot_error:
                logger.error(f"❌ Error with Playwright screenshot: {str(screenshot_error)}", exc_info=True)
                screenshot_base64 = None
        
        # Use Crawl4AI for content extraction (more reliable for markdown)
        try:
            browser_config = BrowserConfig(
                headless=True,
                java_script_enabled=True,
                text_mode=False,
                verbose=False,
                ignore_https_errors=not self.verify_ssl,
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                viewport_width=1280,
                viewport_height=1024,
                extra_args=[
                    "--disable-blink-features=AutomationControlled",
                    "--disable-dev-shm-usage",
                    "--no-sandbox",
                ]
            )
            
            # Wait out short bot-check interstitials (WordPress.com / Cloudflare
            # "Checking your browser… will only take a few seconds") which
            # JS-redirect to the real page after a few seconds. Resolve as soon as
            # the page has substantial real content (>800 chars — fast for normal
            # pages), OR, on a still-short page, once the visible interstitial
            # phrases are gone. This actually waits through the redirect instead
            # of returning the challenge immediately; if it never clears it times
            # out and the reader skips the page.
            wait_for_real_content = (
                "js:() => { const t = document.body ? document.body.innerText : ''; "
                "if (t.length > 800) return true; "
                "const low = t.toLowerCase(); "
                "return t.length > 0 "
                "&& !low.includes('checking your browser') "
                "&& !low.includes('just a moment') "
                "&& !low.includes('secured by wp.com') "
                "&& !low.includes('verifying you are human'); }"
            )
            crawler_config = CrawlerRunConfig(
                cache_mode=CacheMode.BYPASS,
                wait_until="domcontentloaded",
                page_timeout=self.timeout * 1000,
                wait_for=wait_for_real_content,
                delay_before_return_html=3.0,
                screenshot=False,
                # Anti-bot: simulate a real user and hide automation flags so
                # WordPress.com / Cloudflare interstitials clear for the headless
                # browser instead of looping on "Checking your browser…".
                magic=True,
                simulate_user=True,
                override_navigator=True,
            )
            
            logger.info(f"🌐 Starting Crawl4AI for content extraction: {url}")
            
            async with AsyncWebCrawler(config=browser_config) as crawler:
                result = await crawler.arun(url=url, config=crawler_config)
                
                if result.success:
                    html_length = len(result.html) if result.html else 0
                    markdown_length = len(result.markdown.raw_markdown) if result.markdown and result.markdown.raw_markdown else 0
                    
                    logger.info(f"✓ Crawl4AI content extraction successful - HTML: {html_length} chars, Markdown: {markdown_length} chars")
                    
                    # Use Crawl4AI's HTML if we didn't get it from Playwright
                    if not html_content:
                        html_content = result.html
                    
                    markdown_content = result.markdown.raw_markdown if result.markdown else None
                    
                    return html_content, markdown_content, screenshot_base64
                else:
                    logger.error(f"❌ Crawl4AI failed: {result.error_message}")
                    # Return whatever we got from Playwright
                    return html_content, None, screenshot_base64
                    
        except Exception as e:
            logger.error(f"❌ Crawl4AI async fetch error: {str(e)}", exc_info=True)
            return None, None, None
    
    def fetch_with_browser(self, url: str, take_screenshot: bool = False) -> Tuple[Optional[str], Optional[BeautifulSoup], Optional[str]]:
        """
        Fetch content using Crawl4AI with browser rendering.
        This method handles async execution in a thread-safe manner.
        
        :param url: The URL to fetch
        :param take_screenshot: Whether to take a screenshot of the rendered page
        :return: Tuple of (content, soup, screenshot_base64) where content is the extracted text
        """
        if not self._is_available:
            logger.error(f"❌ Crawl4AI not available. Cannot fetch {url}")
            return None, None, None
        
        try:
            logger.info(f"🔄 Using Crawl4AI fallback for JavaScript-heavy page: {url}")
            
            # Handle async execution in thread-safe way
            html, markdown, screenshot = self._run_async_safely(url, take_screenshot)
            
            if not html and not markdown:
                logger.warning(f"⚠️  Crawl4AI returned no content for {url}")
                return None, None, None
            
            # Parse HTML with BeautifulSoup if available
            soup = None
            if html:
                soup = BeautifulSoup(html, 'html.parser')
                logger.debug(f"Parsed HTML into BeautifulSoup object ({len(html)} chars)")
            
            # Prefer markdown if available and substantial
            if markdown and len(markdown.strip()) > 100:
                logger.info(f"✓ Using Crawl4AI markdown output ({len(markdown)} chars)")
                return markdown.strip(), soup, screenshot
            
            # Otherwise return None for content (will trigger extraction from soup)
            return None, soup, screenshot
            
        except Exception as e:
            logger.error(f"❌ Crawl4AI fetch error for {url}: {str(e)}", exc_info=True)
            return None, None, None
    
    def _run_async_safely(self, url: str, take_screenshot: bool = False) -> Tuple[Optional[str], Optional[str], Optional[str]]:
        """
        Run async crawl in a thread-safe manner, handling various event loop scenarios.
        
        :param url: The URL to fetch
        :param take_screenshot: Whether to take a screenshot
        :return: Tuple of (html, markdown, screenshot_base64)
        """
        try:
            # Try to get the current event loop
            try:
                loop = asyncio.get_event_loop()
                loop_is_running = loop.is_running()
            except RuntimeError:
                loop_is_running = False
            
            if loop_is_running:
                # Event loop is already running (e.g., in FastAPI/uvloop context)
                # Always use a separate thread for running Crawl4AI to avoid conflicts
                logger.debug("Event loop running, creating new loop in separate thread")
                
                import concurrent.futures
                import threading
                
                result = [None, None, None]
                exception = [None]
                
                def run_in_new_loop():
                    """Run async fetch in a new event loop in a separate thread"""
                    try:
                        # Create a new event loop for this thread
                        new_loop = asyncio.new_event_loop()
                        asyncio.set_event_loop(new_loop)
                        try:
                            result[0], result[1], result[2] = new_loop.run_until_complete(self._async_fetch(url, take_screenshot))
                        finally:
                            new_loop.close()
                    except Exception as e:
                        exception[0] = e
                
                # Run in a separate thread
                thread = threading.Thread(target=run_in_new_loop)
                thread.start()
                thread.join(timeout=self.timeout + 10)
                
                if thread.is_alive():
                    logger.error(f"Thread timeout after {self.timeout + 10}s")
                    return None, None, None
                
                if exception[0]:
                    raise exception[0]
                
                return result[0], result[1], result[2]
            else:
                # No event loop running, safe to use asyncio.run
                logger.debug("No event loop running, using asyncio.run")
                return asyncio.run(self._async_fetch(url, take_screenshot))
                
        except Exception as e:
            logger.error(f"❌ Error running async fetch: {str(e)}", exc_info=True)
            return None, None, None


# Singleton instance for convenience
_crawl4ai_fallback_instance = None

def get_crawl4ai_fallback(timeout: int = 30, verify_ssl: bool = True) -> Crawl4AIFallback:
    """
    Get or create a Crawl4AI fallback instance (singleton pattern).
    
    :param timeout: Request timeout in seconds
    :param verify_ssl: Whether to verify SSL certificates
    :return: Crawl4AIFallback instance
    """
    global _crawl4ai_fallback_instance
    
    if _crawl4ai_fallback_instance is None:
        _crawl4ai_fallback_instance = Crawl4AIFallback(timeout=timeout, verify_ssl=verify_ssl)
    
    return _crawl4ai_fallback_instance

