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

The widget as a framed page on our own origin.

The embed loader points an iframe at `/widgets/{id}/frame`. That page carries no
token and no org data; once it loads, the host page hands it the visitor's token
by postMessage and the frame calls `/widgets/{id}/bootstrap` for everything
else. Running on our origin means a customer's site never has to be in CORS,
and `frame-ancestors` (the widget's allowed domains) decides where it may load.
"""

import html
import secrets
from typing import Optional
from urllib.parse import urlencode, urlparse

from fastapi import APIRouter, BackgroundTasks, Depends, Header, HTTPException, Request, status
from fastapi.responses import HTMLResponse, JSONResponse, RedirectResponse
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.api.widget import prefetched_widget_data
from app.api.widget_common import (
    FONT_LINKS,
    FRAMED,
    REFUSED,
    allow_widget_open,
    asset_version,
    bearer_token,
    frame_ancestors,
    note_install,
    runtime_config_for,
    script_json,
    widget_runtime_config,
)
from app.core.auth import require_permissions
from app.core.config import settings
from app.core.logger import get_logger
from app.database import get_db
from app.models.schemas.widget import WidgetEmbedSettings, WidgetEmbedSettingsResponse
from app.models.user import User
from app.repositories.widget import WidgetRepository
from app.services import conversation_token, launcher, widget_bootstrap, widget_embed_policy

router = APIRouter()
logger = get_logger(__name__)

_NO_STORE = {"Cache-Control": "no-store"}
# Set on the redirect to the frame host: a request that still doesn't arrive
# there (a proxy forwarding an internal Host) is served rather than bounced again.
_HOP_PARAM = "cm_hop"
# The hop to the frame host is the same for every visitor: let the browser keep
# it rather than pay a round trip on each page view
_REDIRECT_CACHE = {"Cache-Control": "public, max-age=3600"}

_warned_about_shared_origin = False


class BootstrapRequest(BaseModel):
    # The embedding page's origin, as the frame saw it on the host's first message
    host_origin: Optional[str] = Field(None, max_length=300)
    source: Optional[str] = Field(None, max_length=100)


def _frame_config(request: Request) -> dict:
    """API/WS URLs for the frame: its own host, so every call is same-origin."""
    if settings.WIDGET_FRAME_URL:
        return runtime_config_for(settings.WIDGET_FRAME_URL)
    return widget_runtime_config(request)


def _frame_host_redirect(request: Request) -> Optional[RedirectResponse]:
    """Send a frame request that arrived anywhere but the frame host over to it.

    Every other host can carry the dashboard's cookies (the API host, a dashboard
    host proxying /api/), which a page running in the frame must never get.
    """
    host = request.headers.get("host", "")
    if not settings.WIDGET_FRAME_URL or _names_host_of(host, settings.WIDGET_FRAME_URL):
        return None
    if request.query_params.get(_HOP_PARAM):
        if any(_names_host_of(host, url) for url in (settings.BACKEND_URL, settings.FRONTEND_URL)):
            # Never serve it where the dashboard's cookies live, hop or not
            return HTMLResponse("This chat can't load here.", status_code=status.HTTP_421_MISDIRECTED_REQUEST)
        logger.warning(
            "Widget frame redirected to %s but arrived on Host %s; serving it here. "
            "The frame host's proxy must pass the Host header through.",
            urlparse(settings.WIDGET_FRAME_URL).netloc, host,
        )
        return None
    query = urlencode([*request.query_params.multi_items(), (_HOP_PARAM, "1")])
    return RedirectResponse(f"{settings.WIDGET_FRAME_URL}{request.url.path}?{query}",
                            status_code=status.HTTP_302_FOUND, headers=_REDIRECT_CACHE)


def _names_host_of(host_header: str, url: str) -> bool:
    """Whether a Host header names the host of `url`, a default port written or not."""
    target = urlparse(url)
    default = 443 if target.scheme == "https" else 80
    try:
        given = urlparse(f"//{host_header}")
        return bool(target.hostname) and given.hostname == target.hostname.lower() \
            and (given.port or default) == (target.port or default)
    except ValueError:
        return False


def _warn_if_frame_shares_the_api_origin() -> None:
    global _warned_about_shared_origin
    if settings.WIDGET_FRAME_URL or _warned_about_shared_origin:
        return
    _warned_about_shared_origin = True
    logger.warning(
        "WIDGET_FRAME_URL is not set, so the chat widget is framed on the API's own "
        "origin, where dashboard sign-in cookies live. Point a separate host at this "
        "backend and set WIDGET_FRAME_URL to it."
    )


def _origin(url: str) -> str:
    parsed = urlparse(url)
    return f"{parsed.scheme}://{parsed.netloc}"


def _note_refused_embedder(db: Session, widget, ancestors: Optional[str], request: Request,
                           background_tasks: BackgroundTasks) -> None:
    """A site the widget's allowed domains refuse framing it: the browser only
    shows a blank frame, so tell the org where it was tried."""
    if not widget.allowed_domains or request.headers.get("sec-fetch-dest") != "iframe":
        return
    embedder = widget_embed_policy.origin_of(request.headers.get("referer") or "")
    if embedder and not widget_embed_policy.directive_allows(ancestors, embedder):
        note_install(db, widget, embedder, request, background_tasks, REFUSED)


@router.get("/{widget_id}/frame", response_class=HTMLResponse)
async def get_widget_frame(widget_id: str, request: Request, background_tasks: BackgroundTasks,
                           db: Session = Depends(get_db)):
    redirect = _frame_host_redirect(request)
    if redirect:
        return redirect
    _warn_if_frame_shares_the_api_origin()

    widget = widget_bootstrap.find_widget(db, widget_id)
    ancestors = frame_ancestors(db, widget)
    _note_refused_embedder(db, widget, ancestors, request, background_tasks)

    config = _frame_config(request)
    # The bundle sits beside the API, under the same base (a path prefix included)
    base = config["API_URL"].rsplit(settings.API_V1_STR, 1)[0]
    assets_base = html.escape(base, quote=True)
    nonce = secrets.token_urlsafe(16)
    version = asset_version()
    asset_query = f"?v={version}" if version else ""

    csp = widget_embed_policy.frame_document_csp(
        nonce,
        [_origin(config["API_URL"]), _origin(config["WS_URL"])],
        ancestors,
        assets_url=f"{base}/assets/",
    )

    page = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chat Widget</title>
    {FONT_LINKS}
    <script nonce="{nonce}">
        window.APP_CONFIG = {script_json(config)};
        window.__CM_FRAME__ = {script_json({"widgetId": widget.id})};
    </script>
    <script type="module" src="{assets_base}/assets/widget.js{asset_query}"></script>
    <link rel="stylesheet" href="{assets_base}/assets/widget.css{asset_query}">
</head>
<body>
    <div id="app"></div>
</body>
</html>
"""
    return HTMLResponse(page, headers={**_NO_STORE, "Content-Security-Policy": csp})


@router.post("/{widget_id}/bootstrap")
async def bootstrap_widget(
    widget_id: str,
    body: BootstrapRequest,
    request: Request,
    background_tasks: BackgroundTasks,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db),
):
    """Everything the framed widget starts from, for the visitor in `authorization`.

    401 `identity_expired`: the signed-in visitor's identity lapsed (the host
    re-identifies and retries). 401 `token_required`: the agent only talks to
    identified visitors.
    """
    if not allow_widget_open(request, widget_id):
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                            detail={"code": "rate_limited", "message": "Too many requests. Try again shortly."})

    widget = widget_bootstrap.find_widget(db, widget_id)
    host_origin = widget_embed_policy.origin_of(body.host_origin or "")
    # Self-reported, so only a site the widget's list lets through counts as live
    if host_origin and widget_embed_policy.allows_embedder(db, widget.allowed_domains, widget.organization_id, host_origin):
        note_install(db, widget, host_origin, request, background_tasks, FRAMED)

    try:
        session = widget_bootstrap.open_session(db, widget, bearer_token(authorization), body.source)
    except widget_bootstrap.WidgetAccessDenied as denied:
        message = (
            widget_bootstrap.IDENTITY_EXPIRED_MESSAGE
            if denied.code == conversation_token.IDENTITY_EXPIRED_CODE
            else "This widget only talks to identified visitors."
        )
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail={"code": denied.code, "message": message})

    data = await widget_bootstrap.initial_data(db, session)
    # What the widget asks next (GET /widgets/{id}) for this same token, answered
    # now: one round trip less before the chat is ready.
    data["widgetData"] = await prefetched_widget_data(db, widget.id, session.token, body.source)
    return JSONResponse(data, headers=_NO_STORE)


def _own_widget(db: Session, widget_id: str, user: User):
    widget = WidgetRepository(db).get_widget(widget_id)
    if not widget or widget.organization_id != user.organization_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Widget not found")
    return widget


@router.get("/{widget_id}/embed-settings", response_model=WidgetEmbedSettingsResponse)
async def get_embed_settings(
    widget_id: str,
    current_user: User = Depends(require_permissions("manage_agents")),
    db: Session = Depends(get_db),
):
    widget = _own_widget(db, widget_id, current_user)
    return WidgetEmbedSettingsResponse(allowed_domains=widget.allowed_domains or [],
                                       frame_host=widget_embed_policy.origin_of(settings.WIDGET_FRAME_URL))


@router.put("/{widget_id}/embed-settings", response_model=WidgetEmbedSettings)
async def update_embed_settings(
    widget_id: str,
    body: WidgetEmbedSettings,
    current_user: User = Depends(require_permissions("manage_agents")),
    db: Session = Depends(get_db),
):
    """Replace the widget's allowed domains. An empty list allows any site."""
    widget = _own_widget(db, widget_id, current_user)
    try:
        domains = widget_embed_policy.normalize_allowed_domains(body.allowed_domains)
    except widget_embed_policy.InvalidAllowedDomain as invalid:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(invalid))
    widget = WidgetRepository(db).set_allowed_domains(widget, domains)
    return WidgetEmbedSettings(allowed_domains=widget.allowed_domains or [])


@router.get("/{widget_id}/launcher-logo")
def launcher_logo(widget_id: str, db: Session = Depends(get_db)):
    """The launcher logo for the embed loader's image: a redirect to the current file.

    The loader builds this address itself, so the page never puts a URL it was sent
    in a message into an image, and an expired signature is never its problem.
    Served only while the plan covers the logo, like everything else visitors get.
    """
    widgets = WidgetRepository(db)
    widget = widgets.get_widget(widget_id)
    agent = widgets.get_widget_agent(widget) if widget else None
    logo_url = launcher.for_visitors(db, agent)[1] if agent and agent.customization else None
    if not logo_url:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No launcher logo")
    return RedirectResponse(
        logo_url,
        status_code=status.HTTP_302_FOUND,
        headers={"Cache-Control": f"public, max-age={launcher.LOGO_REDIRECT_MAX_AGE}"},
    )
