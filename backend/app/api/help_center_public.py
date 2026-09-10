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

The public help-center site: a standalone FastAPI app the host-dispatch layer
routes {slug}.<base-domain> and verified custom domains to. Server-rendered
Jinja2 HTML for SEO (landing list + per-article pages); the only JSON endpoint
is the rate-limited "Ask AI".
"""

from html import escape
from urllib.parse import quote

from fastapi import Depends, FastAPI, HTTPException, Request
from fastapi.responses import HTMLResponse, PlainTextResponse, RedirectResponse, Response
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.api.help_center_images import router as help_center_images_router
from app.core.config import settings
from app.core.error_handlers import ClientSafeHTTPException, install_error_handlers
from app.database import get_db
from app.models.faq import FAQ
from app.models.help_center import HelpCenterSettings
from app.repositories.faq import FAQRepository
from app.services.file_storage import resolve_public_url
from app.services.help_center_content import (
    excerpt,
    read_time_label,
    render_article_html,
    to_plain_text,
)
from app.services.help_center_public import (
    MAX_QUESTION_CHARS,
    answer_question,
    ask_available,
    category_colors,
    contrast_ink,
    get_published_article,
    get_published_article_by_path,
    normalize_host,
    published_faq_groups,
    related_articles,
    resolve_help_center,
    widget_id_for,
)
from app.services.help_center_seo import (
    absolute_asset_url,
    article_description,
    article_href,
    article_json_ld,
    article_path,
    article_title,
    article_url,
    breadcrumbs,
    index_description,
    index_json_ld,
    index_title,
    site_url,
)
from app.services.public_rate_limit import allow_request

public_app = FastAPI(title="ChatterMate Help Center", docs_url=None, redoc_url=None, openapi_url=None)
install_error_handlers(public_app)
# Serve ONLY help-center images on this app, so relative logo/article-image paths
# resolve on a subdomain/custom-domain origin (host dispatch). Scoped to the
# help_center/ subtree — the help center must never expose chat_attachments,
# knowledge, avatars, etc. (in path mode these paths are served by the main app
# instead). check_dir=False: the dir may not exist until the first upload; a
# missing file 404s. Local storage only — S3 URLs never hit this mount.
public_app.mount(
    "/api/v1/uploads/help_center",
    StaticFiles(directory="uploads/help_center", check_dir=False),
    name="help_center_uploads",
)
# Article images uploaded from this release on are baked as
# {API_V1_STR}/help-center/images/<file> instead, which resolves on either
# storage backend. The mount above stays for URLs baked before that.
public_app.include_router(
    help_center_images_router,
    prefix=f"{settings.API_V1_STR}/help-center",
)
templates = Jinja2Templates(directory="app/templates")

PAGE_CACHE_CONTROL = "public, max-age=60"
ASK_LIMIT_PER_MINUTE = 10
ASK_LIMIT_PER_DAY = 100


class AskRequest(BaseModel):
    question: str = Field(min_length=3, max_length=MAX_QUESTION_CHARS)


class FeedbackRequest(BaseModel):
    helpful: bool


def _client_ip(request: Request) -> str:
    """Rate-limit key. Our nginx APPENDS the real client IP to any
    X-Forwarded-For the client sent, so only the RIGHTMOST entry is
    trustworthy — keying on the first entry would let attackers rotate fake
    IPs and bypass the limit."""
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[-1].strip()
    return request.client.host if request.client else "unknown"


def _resolve_or_404(request: Request, db: Session):
    hc = request.scope.get("help_center")
    if hc:  # path dispatch (/help/{slug}) — org from the path slug, not Host
        row = resolve_help_center(db, slug=hc["slug"])
    else:
        row = resolve_help_center(db, host=normalize_host(request.headers.get("host")))
    if not row:
        raise HTTPException(status_code=404, detail="Help center not found")
    return row


def _base_path(request: Request) -> str:
    """URL prefix for internal links: "/help/{slug}" under path dispatch, "" otherwise."""
    return request.scope.get("help_center", {}).get("base_path", "")


async def _chrome_context(row: HelpCenterSettings, base_path: str = "") -> dict:
    """Shared header/footer/widget context used by every rendered page.

    `base_path` is the URL prefix templates prepend to internal links: "" for
    host dispatch (site at origin root) and "/help/{slug}" for path dispatch."""
    return {
        "row": row,
        "base_path": base_path,
        "brand_color": row.brand_color,
        "brand_ink": contrast_ink(row.brand_color),
        # Relative (/api/v1/uploads/...) so the logo resolves against whichever
        # origin serves the page — public_app now mounts uploads for host mode,
        # and path mode is same-origin as the API. S3 stays absolute (signed).
        "logo_url": await resolve_public_url(row.logo_url) if row.logo_url else None,
        "favicon_url": await resolve_public_url(row.favicon_url) if row.favicon_url else None,
        "header_links": row.header_links or [],
        "widget_id": widget_id_for(row),
        # The widget LOADER (chattermate.min.js) is served by the frontend, while
        # the widget APP it pulls in (/assets/widget.js) is served from
        # VITE_WIDGET_URL by the backend. In prod both resolve to the app domain.
        "widget_script_url": f"{settings.FRONTEND_URL}/webclient/chattermate.min.js",
        # This install's API root, handed to the loader as window.chattermateBaseUrl
        # (same contract as the dashboard's embed snippet). Without it the loader
        # uses its build-time default — the vendor cloud — which no self-hosted
        # deployment can talk to.
        "widget_api_url": f"{settings.BACKEND_URL.rstrip('/')}{settings.API_V1_STR}",
    }


def _social_context(row: HelpCenterSettings, site: str) -> dict:
    """Open Graph / Twitter card values shared by both page types.

    og:image must be absolute (scrapers don't resolve relative URLs), so a
    relative logo is anchored to the serving origin. Deliberately NOT signed
    like the rendered logo: social scrapers cache the URL and re-fetch it long
    after a signature would expire, so this uses the stored URL — the same
    unsigned form article images already bake in, which S3 setups serve via a
    public-read help_center/ prefix.
    """
    logo_url = absolute_asset_url(row.logo_url, site)
    return {
        "og_site_name": index_title(row),
        "og_image": logo_url,
        "seo_logo_url": logo_url,
    }


def _card_view(faq: FAQ) -> dict:
    """List-card view model: question links to the article, with a plain-text
    preview and read time computed from the Markdown answer. Search fields are
    split so the client can rank title hits above body hits, and the body is
    plain text (raw Markdown would make URLs/syntax searchable noise).

    `href` is base_path-less; the template adds the serving prefix."""
    return {
        "question": faq.question,
        "href": article_href(faq),
        "preview": excerpt(faq.answer),
        "read_time": read_time_label(faq.answer),
        "search_title": faq.question.lower(),
        "search_text": f"{to_plain_text(faq.answer)} {faq.category}".lower(),
    }


@public_app.get("/", response_class=HTMLResponse)
async def index(request: Request, q: str = "", db: Session = Depends(get_db)):
    row = _resolve_or_404(request, db)
    search = q.strip()[:200] or None
    groups = published_faq_groups(db, row, search=search)
    colors = category_colors([category for category, _faqs in groups])
    card_groups = [(category, [_card_view(faq) for faq in faqs]) for category, faqs in groups]
    site = site_url(row)
    social = _social_context(row, site)
    published = [faq for _category, faqs in groups for faq in faqs]
    context = {
        **await _chrome_context(row, _base_path(request)),
        **social,
        "request": request,
        "groups": card_groups,
        "colors": colors,
        "search": search or "",
        "title": index_title(row),
        "description": index_description(row),
        "canonical_url": f"{site}/",
        "og_type": "website",
        "json_ld": index_json_ld(row, published, site, social["seo_logo_url"]),
        "ask_enabled": ask_available(row),
    }
    response = templates.TemplateResponse(request, "help_center/index.html", context)
    response.headers["Cache-Control"] = PAGE_CACHE_CONTROL
    return response


@public_app.get("/a/{slug}", response_class=HTMLResponse)
async def article(slug: str, request: Request, db: Session = Depends(get_db)):
    row = _resolve_or_404(request, db)
    faq = get_published_article(db, row, slug)
    if not faq:
        raise HTTPException(status_code=404, detail="Article not found")
    if faq.url_path:
        # The article kept its original URL from a help-center migration, so
        # that is the canonical one and this is the alias. Cache-Control bounds
        # how long a browser pins the redirect: without it a 301 is cached
        # effectively forever, stranding return visitors if the path is cleared.
        return RedirectResponse(
            f"{_base_path(request)}{faq.url_path}",
            status_code=301,
            headers={"Cache-Control": PAGE_CACHE_CONTROL},
        )
    return await _render_article(faq, row, request, db)


async def _render_article(
    faq: FAQ, row: HelpCenterSettings, request: Request, db: Session
) -> Response:
    """Render one article page. Shared by /a/{slug} and the preserved-path
    route below, which reach the same FAQ by different URLs."""
    # All published categories (unfiltered) drive the sidebar + stable colors.
    all_groups = published_faq_groups(db, row)
    colors = category_colors([category for category, _faqs in all_groups])
    default_color = colors.get(faq.category, "#6d5bd0")
    topics = [
        {
            "category": category,
            "count": len(faqs),
            "color": colors.get(category, default_color),
            "active": category == faq.category,
        }
        for category, faqs in all_groups
    ]
    related = [
        {
            "question": rel.question,
            "href": article_href(rel),
            "read_time": read_time_label(rel.answer),
            "color": colors.get(rel.category, default_color),
        }
        for rel in related_articles(db, row, faq)
    ]
    base_path = _base_path(request)
    # Cross-article links are stored as /a/{slug}; point the ones whose target
    # kept an original URL straight at it, so a reader never takes the 301 hop.
    # Built from all_groups, which is already loaded above — no extra query.
    link_paths = {
        other.slug: quote(article_path(other), safe="/")
        for _category, faqs in all_groups
        for other in faqs
        if other.slug and other.url_path
    }
    article_view = {
        "question": faq.question,
        "category": faq.category,
        "color": default_color,
        "read_time": read_time_label(faq.answer),
        "body_html": render_article_html(faq.answer, base_path, link_paths),
        # Feedback always posts to the slug route, whatever URL the page itself
        # is served at — location.pathname would miss on a preserved path. None
        # for a slug-less legacy row reached by its preserved path: there's no
        # route to post to, so the widget is dropped rather than rendered broken.
        "feedback_url": f"{base_path}/a/{quote(faq.slug)}/feedback" if faq.slug else None,
        "related": related,
    }
    site = site_url(row)
    social = _social_context(row, site)
    crumbs = breadcrumbs(row, faq, base_path, site)
    context = {
        **await _chrome_context(row, base_path),
        **social,
        "request": request,
        "article": article_view,
        "breadcrumbs": crumbs,
        "topics": topics,
        "title": article_title(row, faq),
        "description": article_description(faq),
        "canonical_url": article_url(site, faq),
        "og_type": "article",
        "json_ld": article_json_ld(
            row, faq, site, crumbs, social["seo_logo_url"], social["og_image"]
        ),
    }
    response = templates.TemplateResponse(request, "help_center/article.html", context)
    response.headers["Cache-Control"] = PAGE_CACHE_CONTROL
    return response


@public_app.post("/ask")
async def ask(payload: AskRequest, request: Request, db: Session = Depends(get_db)):
    row = _resolve_or_404(request, db)
    if not ask_available(row):
        raise HTTPException(status_code=404, detail="AI answers are not enabled")
    ip = _client_ip(request)
    if not allow_request(f"ask:{ip}:1m", ASK_LIMIT_PER_MINUTE, 60) or not allow_request(
        f"ask:{ip}:1d", ASK_LIMIT_PER_DAY, 86400
    ):
        raise HTTPException(status_code=429, detail="Too many questions — please try again later.")
    # answer_question manages its own short sessions around the slow LLM call.
    answer = await answer_question(row.organization_id, row.agent_id, payload.question)
    if not answer:
        raise ClientSafeHTTPException(status_code=503, detail="Could not answer right now — please try again.")
    return {"answer": answer}


@public_app.post("/a/{slug}/feedback")
async def article_feedback(
    slug: str, payload: FeedbackRequest, request: Request, db: Session = Depends(get_db)
):
    """Record a 'Was this helpful?' vote. One vote per article per IP per day
    (deduped via the rate limiter; fail-open, idempotent — a repeat vote is a
    silent no-op rather than an error)."""
    row = _resolve_or_404(request, db)
    faq = get_published_article(db, row, slug)
    if not faq:
        raise HTTPException(status_code=404, detail="Article not found")
    ip = _client_ip(request)
    if allow_request(f"faqfb:{faq.id}:{ip}", 1, 86400):
        FAQRepository(db).record_feedback(faq.id, payload.helpful)
    return {"ok": True}


@public_app.get("/sitemap.xml")
async def sitemap(request: Request, db: Session = Depends(get_db)):
    row = _resolve_or_404(request, db)
    base = site_url(row)
    groups = published_faq_groups(db, row)
    urls = [f"  <url><loc>{base}/</loc></url>"]
    for _category, faqs in groups:
        for faq in faqs:
            if faq.slug or faq.url_path:
                urls.append(f"  <url><loc>{escape(article_url(base, faq))}</loc></url>")
    xml = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        + "\n".join(urls)
        + "\n</urlset>\n"
    )
    return Response(content=xml, media_type="application/xml", headers={"Cache-Control": PAGE_CACHE_CONTROL})


@public_app.get("/robots.txt", response_class=PlainTextResponse)
async def robots(request: Request, db: Session = Depends(get_db)):
    row = _resolve_or_404(request, db)
    return PlainTextResponse(f"User-agent: *\nAllow: /\nSitemap: {site_url(row)}/sitemap.xml\n")


@public_app.get("/healthz")
async def healthz():
    """Liveness for the SSL-provisioning probe; host-level only, no org data."""
    return {"status": "ok"}


# KEEP THIS LAST. Starlette serves the first route that fully matches, so every
# route above — and the uploads mount — still wins; moving this up would shadow
# all of them. It only sees URLs nothing else claimed: articles that kept their
# original path through a help-center migration, plus the trailing-slash forms
# Starlette's redirect_slashes used to handle (that fallback only fires when
# NOTHING matched, and a catch-all always matches).
@public_app.get("/{full_path:path}", response_class=HTMLResponse)
async def preserved_article(full_path: str, request: Request, db: Session = Depends(get_db)):
    # Already percent-decoded by the ASGI server, which is why url_path is
    # stored decoded too.
    raw = f"/{full_path}"
    path = raw.rstrip("/") or "/"
    row = _resolve_or_404(request, db)
    base_path = _base_path(request)

    faq = get_published_article_by_path(db, row, path) if path != "/" else None
    if faq is None and path.startswith("/a/"):
        # "/a/{slug}/" — keep the trailing-slash redirect we'd otherwise lose.
        faq = get_published_article(db, row, path[len("/a/"):])
        if faq:
            return RedirectResponse(f"{base_path}{article_path(faq)}", status_code=301)
    if faq is None:
        raise HTTPException(status_code=404, detail="Article not found")
    if raw != path:  # trailing slash on a preserved path — canonicalise it
        # article_path(faq), not `path`: identical here (the row was found BY
        # path), but the Location is then built purely from stored, validated
        # data instead of from the request — nothing user-supplied reaches it.
        return RedirectResponse(f"{base_path}{article_path(faq)}", status_code=301)
    return await _render_article(faq, row, request, db)
