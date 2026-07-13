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

from app.knowledge.domains import domain_of_url, registrable_domain


def test_registrable_domain_basics():
    assert registrable_domain("www.site.com") == "site.com"
    assert registrable_domain("blog.site.com") == "site.com"
    assert registrable_domain("SITE.com") == "site.com"
    assert registrable_domain("") == ""
    assert registrable_domain("localhost") == "localhost"


def test_registrable_domain_cctld_aware():
    # ccTLDs keep three labels so distinct *.co.uk are NOT collapsed to 'co.uk'.
    assert registrable_domain("a.b.example.co.uk") == "example.co.uk"
    assert registrable_domain("mycompany.co.uk") == "mycompany.co.uk"
    assert registrable_domain("competitor.co.uk") == "competitor.co.uk"
    assert registrable_domain("shop.example.com.au") == "example.com.au"


def test_domain_of_url_normalizes_and_strips_port():
    assert domain_of_url("https://www.site.com:8443/x") == "site.com"
    # Scheme-less values still resolve their host (can't slip past as a path).
    assert domain_of_url("evil.com/page") == "evil.com"
    assert domain_of_url("site.com") == "site.com"
    assert domain_of_url("") == ""


def test_domain_of_url_distinguishes_cctld_domains():
    # The add-subpage guard relies on these being DIFFERENT.
    assert domain_of_url("https://mycompany.co.uk") != domain_of_url("https://competitor.co.uk")
    assert domain_of_url("https://mycompany.co.uk/a") == domain_of_url("blog.mycompany.co.uk/b")
