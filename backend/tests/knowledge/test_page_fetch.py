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

A crawl reads pages, not the downloads they link to. Seen in production:
ian-vpn.site linked its Linux installers, each one read as text became
~30,000 chunks, and the worker hit its memory limit three hours later.
"""

from unittest.mock import patch

import httpx
import pytest

from app.knowledge.page_fetch import MAX_PAGE_BYTES, NotAPage, fetch_page

URL = "https://ian-vpn.site/downloads/linux/amd64/installer/ian-vpn.tar.gz"


@pytest.fixture(autouse=True)
def public_dns():
    with patch("app.knowledge.url_safety.socket.getaddrinfo",
               return_value=[(2, 1, 6, "", ("93.184.216.34", 0))]):
        yield


class Unread(httpx.SyncByteStream):
    """A body that must never be downloaded."""

    def __iter__(self):
        raise AssertionError("the body of a download was read")


class Counted(httpx.SyncByteStream):
    """`total` bytes in 64 KB chunks, counting what was read."""

    def __init__(self, total: int, first: bytes = b""):
        self.total, self.first, self.read = total, first, 0

    def __iter__(self):
        chunk = 64 * 1024
        while self.read < self.total:
            piece = (self.first if self.read == 0 and self.first else b"a" * chunk)[:self.total - self.read]
            self.read += len(piece)
            yield piece


def fetch(response: httpx.Response, **kwargs) -> str:
    with httpx.Client(transport=httpx.MockTransport(lambda request: response)) as client:
        return fetch_page(client, URL, **kwargs).text


def test_a_page_is_read():
    assert "Hello" in fetch(httpx.Response(200, html="<p>Hello</p>"))


def test_plain_text_is_a_page_too():
    assert fetch(httpx.Response(200, text="Plain notes")) == "Plain notes"


@pytest.mark.parametrize("kind", [
    "application/gzip", "application/x-tar", "application/octet-stream",
    "application/vnd.debian.binary-package", "application/x-rpm",
    "application/zip", "application/pdf", "image/png", "video/mp4",
])
def test_a_download_is_skipped_without_reading_it(kind):
    with pytest.raises(NotAPage, match="download"):
        fetch(httpx.Response(200, headers={"content-type": kind}, stream=Unread()))


def test_a_download_sent_without_a_type_is_recognised_by_its_bytes():
    binary = Counted(10 * 1024 * 1024, first=b"\x1f\x8b\x08\x00" + b"\x00" * 100)
    with pytest.raises(NotAPage, match="binary"):
        fetch(httpx.Response(200, stream=binary))
    assert binary.read < 1024 * 1024  # stopped at the first chunk


def test_a_page_sent_without_a_type_is_still_read():
    assert fetch(httpx.Response(200, content=b"<p>Untyped page</p>")) == "<p>Untyped page</p>"


def test_a_declared_oversized_body_is_skipped_without_reading_it():
    big = httpx.Response(200, headers={"content-type": "text/html",
                                       "content-length": str(MAX_PAGE_BYTES + 1)}, stream=Unread())
    with pytest.raises(NotAPage, match="larger"):
        fetch(big)


def test_reading_stops_at_the_cap_when_the_size_is_not_declared():
    endless = Counted(50 * 1024 * 1024)
    with pytest.raises(NotAPage, match="larger"):
        fetch(httpx.Response(200, headers={"content-type": "text/html"}, stream=endless), max_bytes=1024 * 1024)
    assert endless.read <= 1024 * 1024 + 64 * 1024


def test_the_declared_charset_is_used():
    body = "<p>Café</p>".encode("latin-1")
    assert fetch(httpx.Response(200, headers={"content-type": "text/html; charset=iso-8859-1"},
                                content=body)) == "<p>Café</p>"


def test_an_error_answer_is_still_an_error():
    with pytest.raises(httpx.HTTPStatusError):
        fetch(httpx.Response(404, html="<p>Not found</p>"))


def test_a_utf16_page_is_read_not_taken_for_a_binary():
    page = "<p>Hello from a UTF-16 page</p>"
    assert fetch(httpx.Response(200, headers={"content-type": "text/html; charset=utf-16"},
                                content=page.encode("utf-16"))) == page


@pytest.mark.parametrize("kind", ["application/xml", "text/xml"])
def test_xhtml_served_as_xml_is_a_page(kind):
    assert "Docs" in fetch(httpx.Response(200, headers={"content-type": kind},
                                          content=b"<html><body><p>Docs</p></body></html>"))


def test_only_a_download_is_called_one():
    with pytest.raises(NotAPage) as download:
        fetch(httpx.Response(200, headers={"content-type": "application/pdf"}, stream=Unread()))
    big = httpx.Response(200, headers={"content-type": "text/html", "content-length": str(MAX_PAGE_BYTES + 1)},
                         stream=Unread())
    with pytest.raises(NotAPage) as too_big:
        fetch(big)
    assert (download.value.download, too_big.value.download) == (True, False)


def test_it_says_where_the_page_was_served_from():
    """A directory redirects to its slash form; links on it resolve from there."""
    def site(request):
        if request.url.path == "/docs":
            return httpx.Response(301, headers={"location": "/docs/"})
        return httpx.Response(200, html="<p>Docs</p>")

    with httpx.Client(transport=httpx.MockTransport(site)) as client:
        page = fetch_page(client, "https://example.com/docs")
    assert (page.url, page.text) == ("https://example.com/docs/", "<p>Docs</p>")
