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

Keep crawlers out of the API origin.

The API host had no robots.txt at all, so search engines were free to crawl
(and then report as 404s) endpoints that were never pages: /api/v1/... routes
and the YOUR_WIDGET_ID placeholder our docs use in examples.

Two halves, because they do different jobs. robots.txt stops the fetch;
X-Robots-Tag stops a URL discovered elsewhere from being indexed anyway.
"""

from fastapi import FastAPI
from fastapi.responses import PlainTextResponse

from app.core.config import settings

NOINDEX_HEADER = (b"x-robots-tag", b"noindex")


def api_robots_txt() -> str:
    """The API origin's robots.txt body.

    Disallows everything — except, under path dispatch, the help center. That
    mode (the self-host default) serves public help-center pages from
    {BACKEND_URL}/help/{slug} on this very origin, and those are meant to be
    indexed; a bare "Disallow: /" would quietly de-index every self-hosted
    help center. Cloud runs subdomain mode, where nothing on this origin is a
    page and the carve-out is absent.
    """
    lines = ["User-agent: *", "Disallow: /"]
    if settings.HELP_CENTER_PUBLIC_MODE == "path":
        lines.append("Allow: /help/")
    return "\n".join(lines) + "\n"


class NoIndexHeaderMiddleware:
    """Stamp ``X-Robots-Tag: noindex`` on every response under ``prefix``.

    Pure ASGI rather than BaseHTTPMiddleware: this fronts every API request,
    and BaseHTTPMiddleware would pull streaming responses through a queue for
    the sake of one header.
    """

    def __init__(self, app, prefix: str):
        self.app = app
        self.prefix = prefix

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http" or not scope.get("path", "").startswith(self.prefix):
            await self.app(scope, receive, send)
            return

        async def send_with_noindex(message):
            if message["type"] == "http.response.start":
                message["headers"] = [*(message.get("headers") or []), NOINDEX_HEADER]
            await send(message)

        await self.app(scope, receive, send_with_noindex)


def install_crawler_policy(app: FastAPI) -> None:
    """Register the robots.txt route and the noindex header middleware."""

    @app.get("/robots.txt", response_class=PlainTextResponse, include_in_schema=False)
    async def robots_txt():
        return PlainTextResponse(api_robots_txt())

    app.add_middleware(NoIndexHeaderMiddleware, prefix=settings.API_V1_STR)
