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

from bs4 import BeautifulSoup

from app.knowledge.main_content import content_chars, select_main_node

PROSE = "Verified rooms close to campus with bills included. " * 40


def soup_of(html: str) -> BeautifulSoup:
    return BeautifulSoup(html, "html.parser")


def test_a_short_leading_block_does_not_win():
    """The eazzyliving.co.uk shape, shared by the crawler and the importer.

    Its first <article> was a 108-character search widget. Returning the first
    candidate over the length floor meant that widget became the whole page and
    4,500 characters went unindexed.
    """
    node = select_main_node(soup_of(f"""
        <html><body>
            <article>Search properties. Search by city, university, or
            neighbourhood to find verified student rooms and studios.</article>
            <div class="listings"><h1>Rooms in Leeds</h1><p>{PROSE}</p></div>
        </body></html>
    """))

    assert node is not None
    text = node.get_text(" ", strip=True)
    assert "Rooms in Leeds" in text
    assert "Verified rooms close to campus" in text


def test_prefers_the_specific_container_over_body():
    """When one container holds the page, index it rather than the whole body.

    Otherwise every page carries the header and footer into the vector store.
    """
    node = select_main_node(soup_of(f"""
        <html><body>
            <header>Site name. Login. Contact us.</header>
            <main><h1>Pricing</h1><p>{PROSE}</p></main>
            <footer>Copyright 2026. Terms. Privacy.</footer>
        </body></html>
    """))

    assert node is not None and node.name == "main"
    assert "Login" not in node.get_text(" ", strip=True)


def test_falls_back_to_body_when_no_container_holds_the_page():
    """Content split across sibling divs belongs to the body, not to one div."""
    half = "Half of the page's content lives here. " * 20
    node = select_main_node(soup_of(f"""
        <html><body>
            <div class="left"><p>{half}</p></div>
            <div class="right"><p>{half}</p></div>
        </body></html>
    """))

    assert node is not None and node.name == "body"


def test_a_page_of_only_chrome_is_reported_as_empty():
    """www.solcontrol.ca: a phone number and a login link, nothing else.

    Returning None lets the crawler route the page to the browser fallback
    instead of storing navigation as though it were content.
    """
    node = select_main_node(soup_of("""
        <html><body>
            <header><a href="/login">Welcome, Guest - Login</a>
                    <a href="tel:905-230-8468">905-230-8468</a></header>
            <nav><a href="/products">Products</a><a href="/about">About</a></nav>
            <footer><a href="mailto:info@solcontrol.ca">info@solcontrol.ca</a></footer>
        </body></html>
    """))

    assert node is None


def test_scripts_and_styles_never_count_as_content():
    node = select_main_node(soup_of("""
        <html><body>
            <script>var a = 'x'.repeat(5000);</script>
            <style>.a{color:red}</style>
            <nav><a href="/x">Home</a></nav>
        </body></html>
    """))
    assert node is None


def test_content_chars_ignores_navigation_chrome():
    body = soup_of("""
        <html><body>
            <nav>Products About Contact Careers Support Blog</nav>
            <p>Real content.</p>
        </body></html>
    """).find("body")

    assert content_chars(body) == len("Real content.")


def test_nested_chrome_is_only_subtracted_once():
    """A <nav> inside a <header> must not be discounted twice.

    Double-subtracting understates the page and can push a real page below the
    threshold, where it would be reported as having no content at all.
    """
    body = soup_of("""
        <html><body>
            <header>Site<nav>Home About</nav></header>
            <p>Real content.</p>
        </body></html>
    """).find("body")

    assert content_chars(body) == len("Real content.")
