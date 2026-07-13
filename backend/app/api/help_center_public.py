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
Jinja2 HTML for SEO; the only JSON endpoint is the rate-limited "Ask AI".
"""

from fastapi import Depends, FastAPI, HTTPException, Request
from fastapi.responses import HTMLResponse, PlainTextResponse, Response
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.core.config import settings
from app.database import get_db
from app.services.file_storage import resolve_public_url
from app.services.help_center_public import (
    MAX_QUESTION_CHARS,
    answer_question,
    ask_available,
    contrast_ink,
    normalize_host,
    published_faq_groups,
    resolve_help_center,
    widget_id_for,
)
from app.services.help_center_settings import live_url
from app.services.public_rate_limit import allow_request

public_app = FastAPI(title="ChatterMate Help Center", docs_url=None, redoc_url=None, openapi_url=None)
templates = Jinja2Templates(directory="app/templates")

PAGE_CACHE_CONTROL = "public, max-age=60"
ASK_LIMIT_PER_MINUTE = 10
ASK_LIMIT_PER_DAY = 100


class AskRequest(BaseModel):
    question: str = Field(min_length=3, max_length=MAX_QUESTION_CHARS)


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
    host = normalize_host(request.headers.get("host"))
    row = resolve_help_center(db, host)
    if not row:
        raise HTTPException(status_code=404, detail="Help center not found")
    return row


def _faq_json_ld(groups) -> dict:
    """schema.org FAQPage structured data (Google FAQ rich results)."""
    return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": faq.question,
                "acceptedAnswer": {"@type": "Answer", "text": faq.answer},
            }
            for _category, faqs in groups
            for faq in faqs
        ],
    }


@public_app.get("/", response_class=HTMLResponse)
async def index(request: Request, q: str = "", db: Session = Depends(get_db)):
    row = _resolve_or_404(request, db)
    search = q.strip()[:200] or None
    groups = published_faq_groups(db, row, search=search)
    context = {
        "faq_json_ld": _faq_json_ld(groups),
        "request": request,
        "row": row,
        "groups": groups,
        "search": search or "",
        "brand_color": row.brand_color,
        "brand_ink": contrast_ink(row.brand_color),
        "logo_url": await resolve_public_url(row.logo_url) if row.logo_url else None,
        "title": row.title or f"{row.organization.name} Help Center",
        "description": row.description or f"Answers to common questions about {row.organization.name}.",
        "canonical_url": live_url(row),
        "header_links": row.header_links or [],
        "ask_enabled": ask_available(row),
        "widget_id": widget_id_for(row),
        # The widget LOADER (chattermate.min.js) is served by the frontend, while
        # the widget APP it pulls in (/assets/widget.js) is served from
        # VITE_WIDGET_URL by the backend. In prod both resolve to the app domain.
        "widget_script_url": f"{settings.FRONTEND_URL}/webclient/chattermate.min.js",
    }
    response = templates.TemplateResponse(request, "help_center/index.html", context)
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
        raise HTTPException(status_code=503, detail="Could not answer right now — please try again.")
    return {"answer": answer}


@public_app.get("/sitemap.xml")
async def sitemap(request: Request, db: Session = Depends(get_db)):
    row = _resolve_or_404(request, db)
    xml = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        f"  <url><loc>{live_url(row)}/</loc></url>\n"
        "</urlset>\n"
    )
    return Response(content=xml, media_type="application/xml", headers={"Cache-Control": PAGE_CACHE_CONTROL})


@public_app.get("/robots.txt", response_class=PlainTextResponse)
async def robots(request: Request, db: Session = Depends(get_db)):
    row = _resolve_or_404(request, db)
    return PlainTextResponse(f"User-agent: *\nAllow: /\nSitemap: {live_url(row)}/sitemap.xml\n")


@public_app.get("/healthz")
async def healthz():
    """Liveness for the SSL-provisioning probe; host-level only, no org data."""
    return {"status": "ok"}
