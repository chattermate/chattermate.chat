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

import pytest

from app.core.socketio import needs_elasticache_tls


class TestNeedsElasticacheTls:
    """Whether a plaintext Redis URL points at ElastiCache, so it must be upgraded.

    The old check asked whether ".cache.amazonaws.com" appeared anywhere in the
    URL, so a host that merely mentioned it in a query string or password passed.
    """

    @pytest.mark.parametrize("url", [
        "redis://my-cluster.abc123.ng.0001.euw1.cache.amazonaws.com:6379/0",
        "redis://cache.amazonaws.com.cache.amazonaws.com:6379",
    ])
    def test_real_elasticache_hosts_are_upgraded(self, url):
        assert needs_elasticache_tls(url) is True

    @pytest.mark.parametrize("url", [
        # The host is the attacker's; the suffix only appears in the query.
        "redis://evil.example/?x=.cache.amazonaws.com",
        # ...or in the password.
        "redis://user:.cache.amazonaws.com@evil.example:6379/0",
        # ...or as a path segment.
        "redis://evil.example:6379/.cache.amazonaws.com",
        # A lookalike host that merely ends in a similar string.
        "redis://notcache.amazonaws.com.evil.example:6379",
    ])
    def test_a_suffix_elsewhere_in_the_url_does_not_count(self, url):
        assert needs_elasticache_tls(url) is False

    def test_a_plain_local_redis_is_left_alone(self):
        assert needs_elasticache_tls("redis://localhost:6379/0") is False

    def test_an_already_tls_url_is_not_upgraded_again(self):
        assert needs_elasticache_tls(
            "rediss://my-cluster.euw1.cache.amazonaws.com:6379"
        ) is False

    @pytest.mark.parametrize("url", [None, "", "not a url"])
    def test_missing_or_junk_urls_are_handled(self, url):
        assert needs_elasticache_tls(url) is False
