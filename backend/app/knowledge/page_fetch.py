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

Reading a crawled link, but only when it is a page.

A site's links include its downloads. Read as text, one Linux installer
became ~30,000 chunks to embed: ten links on ian-vpn.site made 149,500, and
the worker ran for three hours before it hit its memory limit. The headers
say what a link is, so a download is skipped before its body is fetched.
"""

from typing import NamedTuple

from app.knowledge.url_safety import safe_stream

# What a crawl reads. Anything else (archives, installers, images, PDFs -
# those have their own source type) is a download, not a page. XML is in
# because some sites serve their XHTML pages as plain XML.
PAGE_TYPES = frozenset({
    "text/html", "application/xhtml+xml", "text/plain", "application/xml", "text/xml",
})

# Far beyond any real page; reading stops here so a mislabelled file cannot
# fill memory. Counted after decompression, so a small gzip bomb stops too.
MAX_PAGE_BYTES = 5 * 1024 * 1024

# A server that sends no type still gives a binary file away in its first
# bytes. Only then: a declared page may be UTF-16, which is full of NULs.
_SNIFF_BYTES = 1024


class NotAPage(Exception):
    """The link is a download or too large to be a page. The crawl skips it;
    it is not a failure of the site."""

    def __init__(self, message: str, download: bool = True):
        super().__init__(message)
        self.download = download


def media_type(content_type: str) -> str:
    """'text/html; charset=utf-8' -> 'text/html'."""
    return content_type.split(";", 1)[0].strip().lower()


class FetchedPage(NamedTuple):
    # Where the page was served from, after redirects. Its relative links
    # resolve against this, not the address asked for: /docs redirects to
    # /docs/, and "guide.html" on it means /docs/guide.html.
    url: str
    text: str


def fetch_page(client, url: str, max_bytes: int = MAX_PAGE_BYTES) -> FetchedPage:
    """The page at `url`. Raises NotAPage for a download or an oversized
    body, httpx.HTTPStatusError for a non-2xx answer, and BlockedHostError
    for a redirect to an address we may not fetch."""
    with safe_stream(client, url) as response:
        response.raise_for_status()

        kind = media_type(response.headers.get("content-type", ""))
        if kind and kind not in PAGE_TYPES:
            raise NotAPage(f"{url} is a download ({kind}), not a page")

        declared = response.headers.get("content-length", "")
        if declared.isdigit() and int(declared) > max_bytes:
            raise NotAPage(f"{url} is larger than {max_bytes} bytes", download=False)

        body = bytearray()
        for chunk in response.iter_bytes():
            if not kind and not body and b"\x00" in chunk[:_SNIFF_BYTES]:
                raise NotAPage(f"{url} is a binary file, not a page")
            body.extend(chunk)
            if len(body) > max_bytes:
                raise NotAPage(f"{url} is larger than {max_bytes} bytes", download=False)

        return FetchedPage(
            url=str(response.url),
            text=body.decode(response.encoding or "utf-8", errors="replace"),
        )
