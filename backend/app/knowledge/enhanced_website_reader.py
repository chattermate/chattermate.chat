"""
ChatterMate - Enhanced Website Reader
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

import random
import re
import time
from datetime import datetime
from dataclasses import dataclass, field
from typing import Dict, List, Set, Tuple, Optional, Callable
from urllib.parse import urljoin, urlparse
import concurrent.futures
from concurrent.futures import ThreadPoolExecutor, as_completed

from bs4 import BeautifulSoup, Tag
import httpx

from agno.document.base import Document
from agno.document.reader.website_reader import WebsiteReader
from app.core.logger import get_logger
from app.knowledge.crawl4ai_fallback import get_crawl4ai_fallback

# Initialize logger for this module
logger = get_logger(__name__)


@dataclass
class EnhancedWebsiteReader(WebsiteReader):
    """Enhanced Reader for Websites with more robust content extraction"""
    debug_on = True
    # Additional configuration options
    min_content_length: int = 100  # Minimum length of text to be considered meaningful content
    # Only blacklist truly problematic tags - keep structural elements that may have useful content
    blacklist_tags: List[str] = field(default_factory=lambda: [
        'script', 'style', 'noscript', 'iframe', 'head'
    ])
    common_content_tags: List[str] = field(default_factory=lambda: [
        'article', 'main', 'section', 'div', 'p', 'content', 'body'
    ])
    common_content_classes: List[str] = field(default_factory=lambda: [
        'post-content', 'article-content', 'entry-content', 'page-content', 'main-content',
        'blog-content', 'content', 'main', 'article', 'post', 'entry', 'text', 'body'
    ])
    common_content_ids: List[str] = field(default_factory=lambda: [
        'content', 'main-content', 'post-content', 'article-content', 'entry-content', 'page-content',
        'blog-content', 'main', 'article', 'post', 'entry', 'text', 'body'
    ])
    user_agent: str = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    headers: Dict[str, str] = field(default_factory=lambda: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'DNT': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Cache-Control': 'max-age=0'
    })
    timeout: int = 30  # Request timeout in seconds
    max_retries: int = 3  # Maximum number of retries for failed requests
    respect_robots_txt: bool = True  # Whether to respect robots.txt
    max_workers: int = 10  # Maximum number of parallel workers for crawling
    verify_ssl: bool = True  # Whether to verify SSL certificates (set to False for self-signed certs)
    
    # Track crawling statistics
    _crawled_pages_count: int = 0
    _successful_crawls: int = 0
    _failed_crawls: int = 0
    _current_url: str = None  # Track current URL being processed for link resolution
    
    def _normalize_url(self, url: str) -> str:
        """
        Normalize URL by ensuring it has a proper protocol (http:// or https://).
        If no protocol is present, https:// is added by default.
        
        :param url: The URL to normalize.
        :return: The normalized URL with protocol.
        """
        if not url:
            return url
        
        url = url.strip()
        
        # Check if URL already has a protocol
        if url.startswith(('http://', 'https://')):
            return url
        
        # Add https:// by default if no protocol is present
        logger.debug(f"URL '{url}' is missing protocol, adding 'https://'")
        return f"https://{url}"
    
    def _get_primary_domain(self, url: str) -> str:
        """
        Extract primary domain from the given URL.
        Overrides the parent method to handle domains more effectively.

        :param url: The URL to extract the primary domain from.
        :return: The primary domain.
        """
        # Normalize URL first to ensure it has a protocol
        url = self._normalize_url(url)
        
        # Parse the URL to get the netloc
        parsed_url = urlparse(url)
        netloc = parsed_url.netloc
        
        # Strip 'www.' prefix if present
        if netloc.startswith('www.'):
            netloc = netloc[4:]
        
        # Get the relevant domain part (last two components for common domains)
        parts = netloc.split('.')
        
        # Special case for country code TLDs with subdomains (e.g., co.uk, com.au)
        if len(parts) > 2 and parts[-2] in ['co', 'com', 'org', 'net', 'edu', 'gov', 'ac'] and len(parts[-1]) == 2:
            domain = '.'.join(parts[-3:])  # Include subdomains like example.co.uk
        else:
            domain = '.'.join(parts[-2:] if len(parts) > 1 else parts)  # domain.com or just domain
        

        return domain
    
    def _extract_main_content(self, soup: BeautifulSoup) -> str:
        """
        Extracts the main content from a BeautifulSoup object using multiple strategies.
        
        Strategies:
        1. Look for elements with role="main" attribute (semantic HTML)
        2. Look for main content containers (article, main, etc.)
        3. Look for content by class names
        4. Look for content by ID
        5. Density-based content extraction (paragraph density)
        6. Collect all meaningful text with smart filtering
        7. Fallback to cleaned body content
        
        :param soup: The BeautifulSoup object to extract the main content from.
        :return: The main content as a string.
        """
        # Remove undesirable elements first
        self._clean_soup(soup)
        
        # Strategy 1: Try to find main content by role="main" attribute (semantic HTML)
        logger.debug(f"Trying Strategy 1: role='main' attribute")
        main_role_element = soup.find(attrs={'role': 'main'})
        if main_role_element:
            logger.debug(f"  Found element with role='main'")
            content = self._get_clean_text(main_role_element, include_links=True, base_url=self._current_url)
            if len(content) >= self.min_content_length:
                logger.info(f"✓ Content extracted using role='main' strategy ({len(content)} chars)")
                return content
            else:
                logger.debug(f"  role='main' element too short: {len(content)} chars")
        
        # Strategy 2: Try to find main content by common content tags
        logger.debug(f"Trying Strategy 2: Common content tags")
        for tag in self.common_content_tags:
            elements = soup.find_all(tag)
            logger.debug(f"  Found {len(elements)} '{tag}' elements")
            for element in elements:
                content = self._get_clean_text(element, include_links=True, base_url=self._current_url)
                if len(content) >= self.min_content_length:
                    logger.info(f"✓ Content extracted using tag strategy: {tag} ({len(content)} chars)")
                    return content
                elif content:
                    logger.debug(f"  '{tag}' element too short: {len(content)} chars (min: {self.min_content_length})")
                    
        # Strategy 3: Try to find main content by common class names
        logger.debug(f"Trying Strategy 3: Common class names")
        for class_name in self.common_content_classes:
            elements = soup.find_all(class_=re.compile(class_name, re.IGNORECASE))
            if elements:
                logger.debug(f"  Found {len(elements)} elements with class matching '{class_name}'")
            for element in elements:
                content = self._get_clean_text(element, include_links=True, base_url=self._current_url)
                if len(content) >= self.min_content_length:
                    logger.info(f"✓ Content extracted using class strategy: {class_name} ({len(content)} chars)")
                    return content
        
        # Strategy 4: Try to find main content by common IDs
        logger.debug(f"Trying Strategy 4: Common IDs")
        for id_name in self.common_content_ids:
            element = soup.find(id=re.compile(id_name, re.IGNORECASE))
            if element:
                logger.debug(f"  Found element with ID matching '{id_name}'")
                content = self._get_clean_text(element, include_links=True, base_url=self._current_url)
                if len(content) >= self.min_content_length:
                    logger.info(f"✓ Content extracted using ID strategy: {id_name} ({len(content)} chars)")
                    return content
        
        # Strategy 5: Density-based content extraction
        logger.debug(f"Trying Strategy 5: Text density")
        density_content = self._extract_by_text_density(soup)
        if density_content and len(density_content) >= self.min_content_length:
            logger.info(f"✓ Content extracted using density strategy ({len(density_content)} chars)")
            return density_content
        
        # Strategy 6: Collect all meaningful text elements (headings, paragraphs, lists, etc.)
        logger.debug(f"Trying Strategy 6: All meaningful content (tables, headings, paragraphs, lists)")
        meaningful_content = self._extract_all_meaningful_content(soup)
        if meaningful_content and len(meaningful_content) >= self.min_content_length:
            logger.debug(f"✓ Content extracted using meaningful content strategy ({len(meaningful_content)} chars)")
            return meaningful_content
        else:
            logger.debug(f"  Meaningful content too short: {len(meaningful_content) if meaningful_content else 0} chars")
            
        # Strategy 7: Fallback to entire body content with minimal cleaning
        logger.debug(f"Trying Strategy 7: Body fallback")
        body = soup.find('body')
        if body:
            content = self._get_clean_text(body, include_links=True, base_url=self._current_url)
            if content:
                logger.info(f"✓ Content extracted using body fallback strategy (length: {len(content)})")
                return content
            else:
                logger.warning(f"Body element found but no text extracted")
        else:
            logger.warning(f"No body element found in HTML")
            
        # Last resort: just get all text from the document
        logger.debug(f"Trying Last Resort: All text from document")
        content = soup.get_text(strip=True, separator=" ")
        if content:
            logger.info(f"✓ Content extracted using last resort strategy (length: {len(content)})")
        else:
            logger.error(f"Failed to extract any text from HTML document")
        return content
        
    def _clean_soup(self, soup: BeautifulSoup) -> None:
        """
        Removes undesirable elements from the soup.
        IMPORTANT: Only remove elements that are truly undesirable (scripts, styles, etc.)
        Keep structural elements like nav, footer, header, aside as they may contain useful content.
        
        :param soup: The BeautifulSoup object to clean.
        """
        removed_count = 0
        
        # Remove comments
        for comment in soup.find_all(string=lambda text: isinstance(text, str) and text.strip().startswith('<!--')):
            comment.extract()
            removed_count += 1
            
        # Only remove truly problematic tags (scripts, styles, iframes)
        # DO NOT remove structural tags like nav, footer, header, aside
        minimal_blacklist = ['script', 'style', 'noscript', 'iframe', 'head']
        for tag in minimal_blacklist:
            elements = soup.find_all(tag)
            removed_count += len(elements)
            for element in elements:
                element.extract()
                
        # Remove hidden elements with style attribute (but be careful)
        hidden_elements = soup.find_all(style=re.compile(r'display:\s*none|visibility:\s*hidden'))
        removed_count += len(hidden_elements)
        for element in hidden_elements:
            element.extract()
            
        # Remove elements with hidden or screen-reader-text class
        for class_name in ['hidden', 'screen-reader-text']:
            hidden_class_elements = soup.find_all(class_=class_name)
            removed_count += len(hidden_class_elements)
            for element in hidden_class_elements:
                element.extract()
            
        # Only remove obvious ad/tracking elements
        for class_name in ['ads', 'advertisement', 'cookie']:
            elements = soup.find_all(class_=re.compile(class_name, re.IGNORECASE))
            removed_count += len(elements)
            for element in elements:
                element.extract()
        
        # Remove comment sections - these often contain user comments that aren't main content
        # Look for common comment container patterns
        comment_selectors = [
            {'id': re.compile(r'comment', re.IGNORECASE)},
            {'class_': re.compile(r'comment', re.IGNORECASE)},
            {'id': 'respond'},
            {'class_': 'comment-respond'},
            {'class_': 'comment-form'},
            {'class_': 'comment-list'},
            {'class_': 'comment-body'},
            {'class_': 'comments-area'},
        ]
        
        for selector in comment_selectors:
            comment_elements = soup.find_all(**selector)
            if comment_elements:
                logger.debug(f"  Removing {len(comment_elements)} comment elements matching {selector}")
                removed_count += len(comment_elements)
                for element in comment_elements:
                    element.extract()
        
        # Remove navigation menus - these are not main content
        nav_selectors = [
            'nav',
            {'role': 'navigation'},
            {'class_': re.compile(r'navigation|menu|nav-', re.IGNORECASE)},
            {'id': re.compile(r'navigation|menu|nav-', re.IGNORECASE)},
        ]
        
        for selector in nav_selectors:
            if isinstance(selector, str):
                nav_elements = soup.find_all(selector)
            else:
                nav_elements = soup.find_all(**selector)
            if nav_elements:
                logger.debug(f"  Removing {len(nav_elements)} navigation elements matching {selector}")
                removed_count += len(nav_elements)
                for element in nav_elements:
                    element.extract()
        
        # Remove sidebars and widgets - often contain non-essential content
        sidebar_selectors = [
            {'id': re.compile(r'sidebar|widget', re.IGNORECASE)},
            {'class_': re.compile(r'sidebar|widget', re.IGNORECASE)},
        ]
        
        for selector in sidebar_selectors:
            sidebar_elements = soup.find_all(**selector)
            if sidebar_elements:
                logger.debug(f"  Removing {len(sidebar_elements)} sidebar/widget elements matching {selector}")
                removed_count += len(sidebar_elements)
                for element in sidebar_elements:
                    element.extract()
        
        logger.debug(f"Cleaned soup: removed {removed_count} elements (minimal cleaning mode)")

    def _get_clean_text(self, element: Tag, include_links: bool = True, base_url: str = None) -> str:
        """
        Gets clean text from a BeautifulSoup element, optionally including URLs.
        
        :param element: The BeautifulSoup element to get text from.
        :param include_links: If True, appends URLs after link text in format [text](url)
        :param base_url: Base URL for converting relative URLs to absolute URLs
        :return: The clean text.
        """
        if not element:
            return ""
        
        if include_links:
            # Create a deep copy to avoid modifying the original
            from copy import deepcopy
            element_copy = deepcopy(element)
            
            # Find all links and append their URLs to the text
            for link in element_copy.find_all('a', href=True):
                href = link.get('href', '')
                # Skip anchor links and javascript links
                if href and not href.startswith('#') and not href.startswith('javascript:'):
                    # Convert relative URLs to absolute URLs if base_url is provided
                    if base_url and not href.startswith(('http://', 'https://', 'mailto:')):
                        href = urljoin(base_url, href)
                    
                    # Get the link text
                    link_text = link.get_text(strip=True)
                    if link_text:  # Only add URL if there's text
                        # Create a new text node with the URL appended
                        # Format: "text (URL: https://...)"
                        new_text = f"{link_text} (URL: {href})"
                        link.string = new_text
            
            # Get text with preserved whitespace
            text = element_copy.get_text(separator=" ", strip=True)
        else:
            # Get text with preserved whitespace
            text = element.get_text(separator=" ", strip=True)
        
        # Normalize whitespace
        text = re.sub(r'\s+', ' ', text)
        
        # Remove excessive newlines
        text = re.sub(r'\n{2,}', '\n', text)
        
        return text.strip()
        
    def _extract_all_meaningful_content(self, soup: BeautifulSoup) -> str:
        """
        Extracts all meaningful content from the page (headings, paragraphs, lists, tables, etc.).
        This is useful for pages that don't have clear content containers.
        
        :param soup: The BeautifulSoup object to extract content from.
        :return: The extracted meaningful content.
        """
        # Focus on block-level content elements to avoid duplication from nested inline elements
        meaningful_tags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'li', 'td', 'th', 'blockquote', 'pre']
        content_parts = []
        tag_counts = {}
        
        for tag in meaningful_tags:
            elements = soup.find_all(tag)
            count = 0
            for element in elements:
                text = element.get_text(strip=True)
                # Only include text that's substantial (more than 10 characters)
                if len(text) > 10:
                    content_parts.append(text)
                    count += 1
            if count > 0:
                tag_counts[tag] = count
        
        logger.debug(f"  Meaningful elements found: {tag_counts}")
        logger.debug(f"  Total text parts collected: {len(content_parts)}")
        
        if not content_parts:
            return ""
        
        # Join all parts with space and clean up
        full_content = " ".join(content_parts)
        full_content = re.sub(r'\s+', ' ', full_content)
        
        return full_content.strip()
    
    def _extract_by_text_density(self, soup: BeautifulSoup) -> str:
        """
        Extracts content based on text density (paragraphs with substantial text).
        
        :param soup: The BeautifulSoup object to extract content from.
        :return: The extracted content.
        """
        paragraphs = soup.find_all('p')
        if not paragraphs:
            return ""
            
        # Find paragraphs with substantial text
        good_paragraphs = []
        for p in paragraphs:
            text = p.get_text(strip=True)
            # Consider paragraphs with more than 20 characters
            if len(text) > 20:
                good_paragraphs.append(p)
                
        if not good_paragraphs:
            return ""
            
        # Find the most common parent that contains a good number of paragraphs
        parent_counts = {}
        for p in good_paragraphs:
            for parent in p.parents:
                if parent.name not in ['html', 'body']:
                    parent_counts[parent] = parent_counts.get(parent, 0) + 1
                    
        # Get the parent with the most children
        if parent_counts:
            best_parent = max(parent_counts.items(), key=lambda x: x[1])[0]
            return self._get_clean_text(best_parent, include_links=True, base_url=self._current_url)
            
        # If no good parent found, just concatenate the good paragraphs
        return " ".join([self._get_clean_text(p, include_links=True, base_url=self._current_url) for p in good_paragraphs])

    def _process_url(self, url_info: Tuple[str, int], primary_domain: str) -> Optional[Tuple[str, str, List[str]]]:
        """
        Process a single URL - fetch content and extract links.
        This is used for parallel processing of URLs.
        
        :param url_info: Tuple of (URL, depth)
        :param primary_domain: Primary domain to filter links
        :return: Tuple of (URL, content, new_links) or None if failed
        """
        current_url, current_depth = url_info
        
        # Normalize URL to ensure it has a protocol
        current_url = self._normalize_url(current_url)
        
        # Skip if URL meets any skip conditions
        if current_url in self._visited:
            return None
            
        if not urlparse(current_url).netloc.endswith(primary_domain):
            return None
            
        if current_depth > self.max_depth:
            return None
        
        # Mark as visited before processing
        self._visited.add(current_url)
        
        self.delay()
        
        # Increment crawled pages counter
        self._crawled_pages_count += 1
        page_start_time = time.time()
        logger.info(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Crawling page {self._crawled_pages_count}: {current_url} (depth: {current_depth})")

        # Try to get content from URL with retries
        content = None
        new_links = []
        retry_count = 0
        last_error = None
        is_javascript_heavy = False
        soup = None
        
        while retry_count < self.max_retries and content is None:
            try:
                logger.info(f"Attempt {retry_count + 1}/{self.max_retries} to fetch {current_url}")
                
                # Warn if SSL verification is disabled
                if not self.verify_ssl and retry_count == 0:
                    logger.warning(f"⚠️  SSL verification is disabled for {current_url} - This may pose security risks")
                
                # Make the request
                with httpx.Client(
                    timeout=self.timeout, 
                    follow_redirects=True, 
                    headers=self.headers,
                    verify=self.verify_ssl
                ) as client:
                    logger.debug(f"Making HTTP GET request to {current_url}")
                    response = client.get(current_url)
                    logger.info(f"Received response: status={response.status_code}, url={response.url}")
                    response.raise_for_status()
                    
                # Parse HTML with BeautifulSoup
                soup = BeautifulSoup(response.text, 'html.parser')
                
                # Log HTML response info for debugging
                logger.info(f"Response status: {response.status_code}, Content-Type: {response.headers.get('content-type', 'unknown')}")
                logger.info(f"HTML length: {len(response.text)} characters")
                
                # Check if the page is JavaScript-heavy
                # Modern sites use many external scripts, so count both inline and external
                script_tags = soup.find_all('script')
                inline_script_length = sum(len(str(script)) for script in script_tags)
                external_scripts = [script for script in script_tags if script.get('src')]

                logger.info(f"Found {len(script_tags)} script tags ({len(external_scripts)} external, {len(script_tags) - len(external_scripts)} inline), inline content: {inline_script_length} characters")

                # Log page structure for debugging
                body = soup.find('body')
                if body:
                    body_children = list(body.children)
                    logger.info(f"Body found with {len(body_children)} direct children")
                    # Log child element types
                    child_types = {}
                    for child in body_children:
                        if hasattr(child, 'name') and child.name:
                            child_types[child.name] = child_types.get(child.name, 0) + 1
                    logger.info(f"Body children types: {child_types}")
                else:
                    logger.warning(f"No body tag found in HTML for {current_url}")

                # Detect JavaScript-heavy pages using multiple criteria:
                # 1. High ratio of inline script content (>30% of HTML)
                # 2. Many external script files (>15 scripts typically indicates a JS framework)
                # 3. High script tag density (>10 scripts per 10KB of HTML)
                script_content_ratio = inline_script_length / len(response.text) if response.text else 0
                html_size_kb = len(response.text) / 10000  # Convert to 10KB units
                script_density = len(script_tags) / max(html_size_kb, 1)  # Scripts per 10KB

                is_javascript_heavy = (
                    script_content_ratio > 0.3 or  # >30% inline scripts
                    len(external_scripts) >= 15 or  # Many external scripts (React/Vue apps)
                    script_density > 10  # High density of scripts
                )

                if is_javascript_heavy:
                    detection_reason = []
                    if script_content_ratio > 0.3:
                        detection_reason.append(f"high inline script ratio ({script_content_ratio*100:.1f}%)")
                    if len(external_scripts) >= 15:
                        detection_reason.append(f"many external scripts ({len(external_scripts)})")
                    if script_density > 10:
                        detection_reason.append(f"high script density ({script_density:.1f} per 10KB)")
                    logger.warning(f"⚠️  JavaScript-heavy website detected: {', '.join(detection_reason)}")
                
                # Set current URL for link resolution
                self._current_url = current_url
                content = self._extract_main_content(soup)

                # Log extracted content length for debugging
                logger.info(f"Extracted content length: {len(content) if content else 0} characters from {current_url}")

                # For JavaScript-heavy sites, always try Crawl4AI for better content
                # Even if we extracted some content, it might just be static elements
                if is_javascript_heavy:
                    logger.info(f"🔄 JavaScript-heavy site detected - attempting Crawl4AI for better content extraction")
                    crawl4ai = get_crawl4ai_fallback(timeout=self.timeout, verify_ssl=self.verify_ssl)

                    if crawl4ai.is_available:
                        logger.info(f"🔄 Using Crawl4AI for JavaScript rendering: {current_url}")
                        # Note: fetch_with_browser returns (content, soup, screenshot)
                        crawl4ai_content, crawl4ai_soup, _ = crawl4ai.fetch_with_browser(current_url, take_screenshot=False)

                        if crawl4ai_content and len(crawl4ai_content) >= self.min_content_length:
                            logger.info(f"✓ Crawl4AI extracted {len(crawl4ai_content)} chars (vs {len(content) if content else 0} from BeautifulSoup)")
                            content = crawl4ai_content
                            soup = crawl4ai_soup if crawl4ai_soup else soup
                        elif crawl4ai_soup:
                            # Try to extract from crawl4ai soup
                            self._current_url = current_url
                            crawl4ai_extracted = self._extract_main_content(crawl4ai_soup)
                            if crawl4ai_extracted and len(crawl4ai_extracted) >= self.min_content_length:
                                logger.info(f"✓ Extracted {len(crawl4ai_extracted)} chars from Crawl4AI HTML")
                                content = crawl4ai_extracted
                                soup = crawl4ai_soup
                            else:
                                logger.warning(f"Crawl4AI didn't improve content extraction, keeping BeautifulSoup result")
                        else:
                            logger.warning(f"Crawl4AI extraction failed, keeping BeautifulSoup result")
                    else:
                        logger.warning(f"⚠️  Crawl4AI not available for JS-heavy site. Install with: pip install crawl4ai>=0.7.0")
                        logger.warning(f"   Falling back to BeautifulSoup (may have incomplete content)")

                # Check content quality
                if not content or len(content) < self.min_content_length:
                    logger.warning(f"Content too short or empty ({len(content) if content else 0} chars) for {current_url}. Min required: {self.min_content_length}")
                    if content:
                        logger.warning(f"Content preview: {content[:200]}...")
                    else:
                        logger.warning(f"Content is None or empty. HTML preview: {response.text[:500]}...")
                    
                    # Try to extract any text as last resort
                    fallback_content = soup.get_text(strip=True, separator=" ")
                    if fallback_content and len(fallback_content) >= self.min_content_length:
                        logger.info(f"Using fallback extraction: {len(fallback_content)} characters")
                        content = fallback_content
                    else:
                        logger.warning(f"Standard extraction failed. Fallback content: {len(fallback_content) if fallback_content else 0} chars")
                        
                        # Try Crawl4AI fallback whenever content extraction fails
                        # (regardless of whether page is JavaScript-heavy or not)
                        crawl4ai = get_crawl4ai_fallback(timeout=self.timeout, verify_ssl=self.verify_ssl)
                        
                        if crawl4ai.is_available:
                            # Log reason for using Crawl4AI
                            if is_javascript_heavy:
                                logger.info(f"🔄 Attempting Crawl4AI fallback - JavaScript-heavy page detected: {current_url}")
                            else:
                                logger.info(f"🔄 Attempting Crawl4AI fallback - Standard extraction failed: {current_url}")
                            
                            # Note: fetch_with_browser returns (content, soup, screenshot)
                            # We don't need screenshot for backend crawling, so ignore it
                            crawl4ai_content, crawl4ai_soup, _ = crawl4ai.fetch_with_browser(current_url, take_screenshot=False)
                            
                            if crawl4ai_content and len(crawl4ai_content) >= self.min_content_length:
                                logger.info(f"✓ Crawl4AI successfully extracted {len(crawl4ai_content)} chars")
                                content = crawl4ai_content
                                soup = crawl4ai_soup if crawl4ai_soup else soup
                            elif crawl4ai_soup:
                                # Try to extract from crawl4ai soup
                                self._current_url = current_url
                                content = self._extract_main_content(crawl4ai_soup)
                                if content and len(content) >= self.min_content_length:
                                    logger.info(f"✓ Extracted {len(content)} chars from Crawl4AI HTML")
                                    soup = crawl4ai_soup
                                else:
                                    logger.error(f"Crawl4AI extraction also failed for {current_url}")
                            else:
                                logger.error(f"Crawl4AI fallback failed for {current_url}")
                        else:
                            logger.warning(f"⚠️  Crawl4AI not available. Install with: pip install crawl4ai>=0.7.0")
                        
                        # Final check
                        if not content or len(content) < self.min_content_length:
                            logger.error(f"All extraction strategies failed for {current_url}. Final content: {len(content) if content else 0} chars")
                            self._failed_crawls += 1
                            return None
                
                self._successful_crawls += 1
                logger.info(f"✓ Successfully extracted {len(content)} chars from {current_url}")
                
                # Extract new links if not at max depth
                if current_depth < self.max_depth:
                    links = self._extract_links(soup, current_url)
                    
                    next_depth = current_depth + 1
                    new_links = [(link, next_depth) for link in links 
                                if link not in self._visited]
                    
            except httpx.HTTPStatusError as e:
                retry_count += 1
                status_code = e.response.status_code
                last_error = f"HTTP {status_code}: {e.response.reason_phrase}"
                logger.warning(f"HTTP error on attempt {retry_count}/{self.max_retries} for {current_url}: {last_error}")
                
                # Special handling for 403 Forbidden (bot detection)
                if status_code == 403:
                    logger.warning(f"⚠️  403 Forbidden - Server may be blocking bot requests")
                    # Don't retry httpx for 403, go straight to Crawl4AI fallback
                    retry_count = self.max_retries
                elif retry_count < self.max_retries:
                    # Exponential backoff for other errors
                    sleep_time = 2 ** retry_count
                    logger.info(f"Retrying in {sleep_time} seconds...")
                    time.sleep(sleep_time)
            except httpx.TimeoutException as e:
                retry_count += 1
                last_error = f"Request timeout after {self.timeout}s"
                logger.warning(f"Timeout on attempt {retry_count}/{self.max_retries} for {current_url}")
                if retry_count < self.max_retries:
                    sleep_time = 2 ** retry_count
                    logger.info(f"Retrying in {sleep_time} seconds...")
                    time.sleep(sleep_time)
            except Exception as e:
                retry_count += 1
                last_error = f"{type(e).__name__}: {str(e)}"
                logger.error(f"Error on attempt {retry_count}/{self.max_retries} for {current_url}: {last_error}", exc_info=True)
                # Exponential backoff
                if retry_count < self.max_retries:
                    sleep_time = 2 ** retry_count
                    logger.info(f"Retrying in {sleep_time} seconds...")
                    time.sleep(sleep_time)
        
        # If all retries failed, try Crawl4AI fallback as last resort
        if content is None and last_error:
            logger.warning(f"⚠️  All extraction attempts failed. Last error: {last_error}")
            
            # Try Crawl4AI fallback for HTTP errors (403, 429, etc.) and other failures
            crawl4ai = get_crawl4ai_fallback(timeout=self.timeout, verify_ssl=self.verify_ssl)
            
            if crawl4ai.is_available:
                logger.info(f"🔄 Attempting Crawl4AI fallback after HTTP/extraction failure: {current_url}")
                logger.info(f"   Reason: {last_error}")
                
                try:
                    # Note: fetch_with_browser returns (content, soup, screenshot)
                    # We don't need screenshot for backend crawling, so ignore it
                    crawl4ai_content, crawl4ai_soup, _ = crawl4ai.fetch_with_browser(current_url, take_screenshot=False)
                    
                    if crawl4ai_content and len(crawl4ai_content) >= self.min_content_length:
                        logger.info(f"✓ Crawl4AI successfully bypassed error and extracted {len(crawl4ai_content)} chars")
                        content = crawl4ai_content
                        soup = crawl4ai_soup if crawl4ai_soup else soup
                        
                        # Extract links if we got content
                        if current_depth < self.max_depth and soup:
                            links = self._extract_links(soup, current_url)
                            next_depth = current_depth + 1
                            new_links = [(link, next_depth) for link in links 
                                        if link not in self._visited]
                        
                        self._successful_crawls += 1
                        page_end_time = time.time()
                        page_duration = page_end_time - page_start_time
                        logger.info(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Completed crawling page {self._crawled_pages_count} with Crawl4AI (Time taken: {page_duration:.2f}s)")
                        return (current_url, content, new_links)
                    elif crawl4ai_soup:
                        # Try to extract from crawl4ai soup
                        self._current_url = current_url
                        content = self._extract_main_content(crawl4ai_soup)
                        if content and len(content) >= self.min_content_length:
                            logger.info(f"✓ Extracted {len(content)} chars from Crawl4AI HTML")
                            soup = crawl4ai_soup
                            
                            # Extract links
                            if current_depth < self.max_depth:
                                links = self._extract_links(soup, current_url)
                                next_depth = current_depth + 1
                                new_links = [(link, next_depth) for link in links 
                                            if link not in self._visited]
                            
                            self._successful_crawls += 1
                            page_end_time = time.time()
                            page_duration = page_end_time - page_start_time
                            logger.info(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Completed crawling page {self._crawled_pages_count} with Crawl4AI (Time taken: {page_duration:.2f}s)")
                            return (current_url, content, new_links)
                    
                    logger.error(f"Crawl4AI also failed to extract content from {current_url}")
                except Exception as crawl_error:
                    logger.error(f"Crawl4AI fallback error: {str(crawl_error)}", exc_info=True)
            else:
                logger.warning(f"⚠️  Crawl4AI not available to retry failed request. Install with: pip install crawl4ai>=0.7.0")
            
            # Final failure
            self._failed_crawls += 1
            logger.error(f"❌ Failed to extract content from {current_url} after all attempts. Last error: {last_error}")
            return None
        
        page_end_time = time.time()
        page_duration = page_end_time - page_start_time
        logger.info(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Completed crawling page {self._crawled_pages_count} (Time taken: {page_duration:.2f}s)")
        
        return (current_url, content, new_links)

    def crawl(self, url: str, starting_depth: int = 1, on_document_callback: Optional[Callable[[str, str], None]] = None, on_url_crawled_callback: Optional[Callable[[str], None]] = None) -> Dict[str, str]:
        """
        Enhanced crawl method with parallel processing and immediate vector DB insertion.
        
        :param url: The URL to crawl.
        :param starting_depth: The starting depth level for the crawl.
        :param on_document_callback: Callback function that receives (url, content) for immediate processing
        :param on_url_crawled_callback: Callback function that receives (url) when a page is successfully crawled
        :return: Dictionary of URLs and their corresponding content.
        """
        # Normalize URL to ensure it has a protocol
        url = self._normalize_url(url)
        
        # Reset visited and urls_to_crawl for fresh crawl
        self._visited = set()
        self._urls_to_crawl = []
        
        # Reset crawling statistics
        self._crawled_pages_count = 0
        self._successful_crawls = 0
        self._failed_crawls = 0
        
        crawl_start_time = time.time()
        logger.info(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Starting parallel crawl of {url} with max_depth={self.max_depth}, max_links={self.max_links}, and max_workers={self.max_workers}")
        
        crawler_result: Dict[str, str] = {}
        primary_domain = self._get_primary_domain(url)
        
        # Add starting URL with its depth to the queue
        urls_to_process = [(url, starting_depth)]
        logger.info(f"Added starting URL to crawl queue: {url} (depth: {starting_depth})")
        
        # Use ThreadPoolExecutor for parallel processing
        with ThreadPoolExecutor(max_workers=self.max_workers) as executor:
            # Process URLs in batches until no more URLs or max_links reached
            while urls_to_process and len(crawler_result) < self.max_links:
                # Take a batch of URLs to process
                batch_size = min(self.max_workers, len(urls_to_process))
                current_batch = urls_to_process[:batch_size]
                urls_to_process = urls_to_process[batch_size:]
                

                
                # Submit all URLs in the current batch for parallel processing
                future_to_url = {
                    executor.submit(self._process_url, url_info, primary_domain): url_info[0]
                    for url_info in current_batch
                }
                
                # Process completed futures as they finish
                for future in as_completed(future_to_url):
                    url = future_to_url[future]
                    try:
                        result = future.result()
                        if result:
                            processed_url, content, new_links = result
                            
                            # Add the content to our results
                            crawler_result[processed_url] = content
                            
                            # Call the URL crawled callback first (for progress tracking)
                            if on_url_crawled_callback:
                                logger.debug(f"📞 Calling URL crawled callback for: {processed_url}")
                                on_url_crawled_callback(processed_url)
                            
                            # Call the callback for immediate processing if provided
                            if on_document_callback:
                                on_document_callback(processed_url, content)
                            
                            # Add new links to the processing queue
                            for new_link, depth in new_links:
                                if new_link not in self._visited and (new_link, depth) not in urls_to_process:
                                    urls_to_process.append((new_link, depth))
                            
                            # If we've reached max_links, break early
                            if len(crawler_result) >= self.max_links:
                                logger.info(f"Reached maximum number of links ({self.max_links}), stopping further crawling")
                                break
                                
                    except Exception as exc:
                        logger.error(f"URL {url} generated an exception: {exc}")
                        self._failed_crawls += 1

        # Log crawling summary
        crawl_end_time = time.time()
        crawl_duration = crawl_end_time - crawl_start_time
        logger.info(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Parallel crawl completed: {len(crawler_result)} pages crawled successfully")
        logger.info(f"Crawling statistics: Total: {self._crawled_pages_count}, Successful: {self._successful_crawls}, Failed: {self._failed_crawls}")
        logger.info(f"Total crawling time: {crawl_duration:.2f}s, Average time per page: {crawl_duration/max(1, self._crawled_pages_count):.2f}s")
        
        return crawler_result

    def _extract_links(self, soup: BeautifulSoup, base_url: str) -> List[str]:
        """
        Extract links from a BeautifulSoup object.
        
        :param soup: The BeautifulSoup object.
        :param base_url: The base URL to resolve relative URLs.
        :return: A list of absolute URLs.
        """
        links = []
        primary_domain = self._get_primary_domain(base_url)
        
        all_links = soup.find_all("a", href=True)
        
        for link in all_links:
            if not isinstance(link, Tag):
                continue
            
            href_str = str(link["href"])
            full_url = urljoin(base_url, href_str)
            
            if not isinstance(full_url, str):
                continue
                
            # Filter out unwanted URLs
            parsed_url = urlparse(full_url)
            
            # Ignore self-links
            if full_url == base_url:
                continue
                
            # Check if it's in the same domain
            link_domain = parsed_url.netloc
            is_same_domain = link_domain.endswith(primary_domain)
            
            if (
                is_same_domain
                and not any(parsed_url.path.endswith(ext) for ext in [
                    ".pdf", ".jpg", ".png", ".gif", ".zip", ".mp3", ".mp4", ".exe", ".dll"
                ])
                and not parsed_url.path.startswith("#")  # Skip anchors
                and "?" not in full_url  # Skip query parameters for simplicity
            ):
                links.append(full_url)
                
        logger.info(f"Extracted {len(links)} valid links from {base_url}")
        return links

    def _create_document_from_content(self, page_url: str, content: str, source_url: str, index: int) -> Document:
        """
        Create a Document object from page content with proper metadata.
        
        :param page_url: The URL of the page
        :param content: The page content
        :param source_url: Original source URL 
        :param index: The document index
        :return: Document object
        """
        # Extract page identifier without protocol and domain for ID
        parsed_url = urlparse(page_url)
        path = parsed_url.path
        
        # Handle fragment identifiers (#section)
        fragment = parsed_url.fragment
        if fragment:
            path = f"{path}#{fragment}"
        
        # Clean up path for ID generation
        if not path or path == "/":
            path = "index"
        else:
            # Remove leading/trailing slashes and replace special chars
            path = path.strip("/")
            path = re.sub(r'[^\w\-]', '_', path)
        
        # Create metadata with relevant information
        metadata = {
            "url": page_url,
            "chunk": index,
            "chunk_size": len(content)
        }
        
        # Create document with content and metadata
        document = Document(
            content=content,
            meta_data=metadata
        )
        
        # Set document ID and name
        document.id = page_url
        # Set name to full page URL for matching with knowledge_queue
        document.name = source_url
        

        
        return document

    def read(self, url: str, vector_db_callback: Optional[Callable[[Document], None]] = None, url_crawled_callback: Optional[Callable[[str], None]] = None) -> List[Document]:
        """
        Read content from a URL, crawl related pages, and convert the content into Documents.
        Optionally sends documents to vector DB as they are created.
        
        :param url: The URL to read from.
        :param vector_db_callback: Optional callback to send documents to vector DB as they're created
        :param url_crawled_callback: Optional callback called when each URL is successfully crawled
        :return: A list of Document objects.
        """
        # Normalize URL to ensure it has a protocol
        url = self._normalize_url(url)
        
        # Get timestamp for tracking
        start_time = time.time()
        logger.info(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Starting to read from {url} with parallel processing")
        
        documents = []
        
        # Create a callback for immediate document processing
        def on_document_created(page_url: str, content: str):
            index = len(documents) + 1
            document = self._create_document_from_content(page_url, content, url, index)
            documents.append(document)
            
            # Call vector DB callback if provided
            if vector_db_callback:
                try:
                    vector_db_callback(document)
                    logger.info(f"✓ Document {document.id} successfully sent to vector DB")
                except Exception as e:
                    logger.error(f"Error sending document {document.id} to vector DB: {str(e)}")
        
        # Crawl website with the callback for immediate document processing
        self.crawl(url, on_document_callback=on_document_created, on_url_crawled_callback=url_crawled_callback)
        
        end_time = time.time()
        duration = end_time - start_time
        logger.info(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Completed reading from {url} - Created {len(documents)} documents (Total time: {duration:.2f}s)")
        
        return documents 