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

The API origin's crawler policy. Search Console reported dozens of
/api/v1/... endpoints as "Not found (404)" because this host answered
robots.txt with a 404 of its own, so these run against the real wired app
rather than a stand-in — the wiring is the part that was missing.
"""

from pathlib import Path

import pytest
from fastapi.testclient import TestClient

import app.main  # noqa: F401 — the robots route and middleware are wired on import
from app.core.application import app
from app.core.config import settings
from app.core.crawler_policy import api_robots_txt


@pytest.fixture(scope="module")
def client():
    return TestClient(app)


class TestApiRobotsTxt:
    def test_served_as_plain_text_not_json(self, client):
        response = client.get("/robots.txt")

        assert response.status_code == 200
        assert response.headers["content-type"].startswith("text/plain")

    def test_disallows_everything(self, client):
        lines = client.get("/robots.txt").text.splitlines()

        assert "User-agent: *" in lines
        assert "Disallow: /" in lines

    def test_path_mode_keeps_the_self_hosted_help_center_crawlable(self, monkeypatch):
        """Path dispatch serves public help-center pages from this same origin,
        and those are meant to be indexed."""
        monkeypatch.setattr(settings, "HELP_CENTER_PUBLIC_MODE", "path")

        assert "Allow: /help/" in api_robots_txt().splitlines()

    def test_subdomain_mode_has_nothing_to_carve_out(self, monkeypatch):
        monkeypatch.setattr(settings, "HELP_CENTER_PUBLIC_MODE", "subdomain")
        lines = api_robots_txt().splitlines()

        assert "Disallow: /" in lines
        assert not any(line.startswith("Allow:") for line in lines)


class TestNoIndexHeader:
    """robots.txt stops the fetch; this stops a URL discovered elsewhere from
    being indexed regardless."""

    def test_api_success_response_is_noindex(self, client):
        probe = Path("uploads") / "crawler-policy-probe.txt"
        probe.write_text("probe")
        try:
            response = client.get("/api/v1/uploads/crawler-policy-probe.txt")
        finally:
            probe.unlink(missing_ok=True)

        assert response.status_code == 200
        assert response.headers["x-robots-tag"] == "noindex"

    def test_api_404_is_noindex(self, client):
        """The 404s are exactly what Search Console indexed, so they need it most."""
        response = client.get("/api/v1/widgets/YOUR_WIDGET_ID/data")

        assert response.status_code == 404
        assert response.headers["x-robots-tag"] == "noindex"

    def test_non_api_paths_are_left_alone(self, client):
        response = client.get("/health")

        assert response.status_code == 200
        assert "x-robots-tag" not in response.headers
