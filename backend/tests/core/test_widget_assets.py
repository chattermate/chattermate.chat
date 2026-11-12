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

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.core.widget_assets import UNVERSIONED_CACHE, VERSIONED_CACHE, WidgetAssets, bundle_version


@pytest.fixture
def bundle(tmp_path):
    (tmp_path / "widget.js").write_text("console.log('one')")
    (tmp_path / "widget.css").write_text("body{}")
    return tmp_path


@pytest.fixture
def client(bundle):
    app = FastAPI()
    app.mount("/assets", WidgetAssets(str(bundle)), name="assets")
    return TestClient(app)


def _touch_later(path, text):
    """Rewrite a file and make sure its mtime moves, as a deploy's would."""
    before = path.stat().st_mtime_ns
    path.write_text(text)
    os.utime(path, ns=(before + 10**9, before + 10**9))


class TestBundleVersion:
    def test_is_stable_for_one_build(self, bundle):
        assert bundle_version(bundle) == bundle_version(bundle)
        assert len(bundle_version(bundle)) == 16

    def test_changes_when_only_the_stylesheet_changes(self, bundle):
        before = bundle_version(bundle)
        _touch_later(bundle / "widget.css", "body{color:red}")
        assert bundle_version(bundle) != before

    def test_changes_with_the_script(self, bundle):
        before = bundle_version(bundle)
        _touch_later(bundle / "widget.js", "console.log('two')")
        assert bundle_version(bundle) != before

    def test_is_empty_without_a_bundle(self, tmp_path):
        assert bundle_version(tmp_path) == ""


class TestCaching:
    def test_the_current_version_is_cached_for_a_year(self, client, bundle):
        version = bundle_version(bundle)
        for name in ("widget.js", "widget.css"):
            response = client.get(f"/assets/{name}?v={version}")
            assert response.status_code == 200
            assert response.headers["cache-control"] == VERSIONED_CACHE

    def test_no_version_is_checked_every_load(self, client):
        assert client.get("/assets/widget.js").headers["cache-control"] == UNVERSIONED_CACHE

    def test_an_old_version_is_not_pinned_to_todays_file(self, client, bundle):
        old = bundle_version(bundle)
        _touch_later(bundle / "widget.js", "console.log('two')")
        response = client.get(f"/assets/widget.js?v={old}")
        assert response.text == "console.log('two')"
        assert response.headers["cache-control"] == UNVERSIONED_CACHE

    def test_a_revalidation_keeps_the_rule(self, client, bundle):
        version = bundle_version(bundle)
        first = client.get(f"/assets/widget.js?v={version}")
        again = client.get(f"/assets/widget.js?v={version}", headers={"If-None-Match": first.headers["etag"]})
        assert again.status_code == 304
        assert again.headers["cache-control"] == VERSIONED_CACHE

    def test_a_missing_file_is_still_a_404(self, client):
        response = client.get("/assets/nope.js?v=x")
        assert response.status_code == 404
        assert "cache-control" not in response.headers
