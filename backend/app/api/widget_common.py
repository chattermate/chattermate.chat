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

What the widget routes share: the bundle and runtime config a widget page
points at, the page head, the per-client open limit, and install tracking.
"""

import json
from pathlib import Path
from typing import Optional
from urllib.parse import urlparse

from fastapi import BackgroundTasks, Request
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.logger import get_logger
from app.core.widget_assets import bundle_version
from app.models.widget import Widget
from app.services import widget_embed_policy
from app.services.public_rate_limit import allow_request
from app.utils.client_ip import forwarded_client_ip

logger = get_logger(__name__)

# The enterprise module can record where each widget is live; without it,
# nothing is recorded.
try:
    from app.enterprise.services import widget_install
except ImportError:
    widget_install = None


_ASSETS_DIR = Path(settings.WIDGET_ASSETS_DIR)


def asset_version() -> str:
    """Cache-buster for the widget bundle URLs: a hash of the build (see
    app.core.widget_assets). A new build is a new URL, and the current one may
    be cached for a year; "" when the bundle is served from somewhere else."""
    return bundle_version(_ASSETS_DIR)


# BACKEND_URL defaults to http://localhost:8000 and neither compose file sets
# it, so a self-hosted install that never overrode it used to serve every visitor
# a widget whose socket dialled the visitor's own machine (#315). Loopback can
# never be right for a browser on someone else's computer, so we fall back to the
# origin the widget HTML was actually fetched over.
_LOOPBACK_HOSTS = frozenset({"localhost", "127.0.0.1", "0.0.0.0", "::1", "[::1]"})

_warned_about_loopback_backend_url = False


def _is_loopback(url: str) -> bool:
    host = urlparse(url).hostname
    return host is not None and host.lower() in _LOOPBACK_HOSTS


def _public_origin(request: Optional[Request]) -> Optional[str]:
    """Scheme and host this request reached us on, as the browser sees them.

    Reads the forwarding headers our nginx sets rather than ``request.url``, which
    only reflects them when the ASGI server is started with proxy headers enabled.
    """
    if request is None:
        return None

    # Several proxies in a chain append to these, and the browser's own value is
    # the first entry.
    forwarded_host = request.headers.get("x-forwarded-host")
    host = (forwarded_host or request.headers.get("host") or "").split(",")[0].strip()
    if not host:
        return None

    forwarded_proto = request.headers.get("x-forwarded-proto")
    if forwarded_proto:
        scheme = forwarded_proto.split(",")[0].strip()
    elif forwarded_host:
        # A proxy that rewrites the host but not the protocol (Traefik and some
        # Caddy setups, unlike our nginx) leaves request.url.scheme reading "http"
        # for the proxy's own hop. Trusting that would hand an https page a ws://
        # socket the browser refuses as mixed content, so assume the hop was TLS.
        scheme = "https"
    else:
        scheme = request.url.scheme or "https"

    return f"{scheme}://{host}"


def widget_runtime_config(request: Optional[Request] = None) -> dict:
    """Runtime API/WS URLs to hand the widget iframe as ``window.APP_CONFIG``.

    Derived from ``BACKEND_URL`` so a self-hosted widget talks to the configured
    backend instead of the vendor cloud. On the hosted deployment BACKEND_URL is
    ``https://api.chattermate.chat``, which yields exactly the widget's baked-in
    defaults, so injecting this is a no-op there.
    """
    global _warned_about_loopback_backend_url

    api_base = settings.BACKEND_URL.rstrip("/")
    if _is_loopback(api_base):
        derived = _public_origin(request)
        if derived and not _is_loopback(derived):
            if not _warned_about_loopback_backend_url:
                _warned_about_loopback_backend_url = True
                logger.warning(
                    "BACKEND_URL is %s, which no visitor's browser can reach. "
                    "Serving widgets against %s instead, taken from the request. "
                    "Set BACKEND_URL to this install's public API URL.",
                    api_base, derived,
                )
            api_base = derived

    return runtime_config_for(api_base)


def runtime_config_for(api_base: str) -> dict:
    """`window.APP_CONFIG` for a widget talking to the backend at `api_base`."""
    if api_base.startswith("https://"):
        ws_url = "wss://" + api_base[len("https://"):]
    elif api_base.startswith("http://"):
        ws_url = "ws://" + api_base[len("http://"):]
    else:
        ws_url = api_base
    return {"API_URL": f"{api_base}/api/v1", "WS_URL": ws_url}

# Fonts every widget page links (the frame's CSP allows Google Fonts for them)
FONT_LINKS = """<link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Instrument+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">"""


def script_json(value) -> str:
    """JSON for an inline <script>: `<` escaped so no value can close the tag."""
    return json.dumps(value).replace("<", "\\u003c")


def bearer_token(authorization: Optional[str]) -> Optional[str]:
    if authorization and authorization.startswith('Bearer '):
        return authorization.split(' ')[1]
    return None


# Opening a widget mints a conversation token, so cap opens per client.
# Generous: a busy office behind one NAT loads a customer's pages a lot.
WIDGET_OPENS_PER_MINUTE = 300


def allow_widget_open(request: Request, widget_id: str) -> bool:
    """Per visitor and widget, so one busy office can't exhaust every widget.

    Local development and the e2e stack talk to the backend directly, so a
    loopback peer is exempt - but only when nothing forwarded the request: a
    proxy on the same machine (host nginx/Caddy) also connects from loopback.
    """
    peer = request.client.host if request.client else ""
    if peer in _LOOPBACK_HOSTS and not request.headers.get("x-forwarded-for"):
        return True
    return allow_request(f"widget_open:{forwarded_client_ip(request)}:{widget_id}", WIDGET_OPENS_PER_MINUTE, 60)



def frame_ancestors(db: Session, widget: Widget) -> Optional[str]:
    """The widget's frame-ancestors directive, or None when it may be embedded anywhere."""
    return widget_embed_policy.frame_ancestors(db, widget.allowed_domains, widget.organization_id)


def _claim_takes_load_kind() -> bool:
    """Whether the installed enterprise module knows load kinds (it was added
    with the framed widget). An older one is called the old way rather than
    failing on every widget open."""
    import inspect
    try:
        return "load" in inspect.signature(widget_install.claim_write).parameters
    except (TypeError, ValueError):
        return False


_claim_with_load = widget_install is not None and _claim_takes_load_kind()

# How a load reached us, for install tracking (the enterprise module's LoadKind)
PAGE_LOAD = "page_load"  # an older loader's cross-origin fetch of /data
FRAMED = "framed"        # the framed widget started on the host page
REFUSED = "refused"      # a host page the widget's allowed domains refused


def note_install(db: Session, widget: Widget, origin: Optional[str], request: Request,
                 background_tasks: BackgroundTasks, load: str = PAGE_LOAD) -> None:
    """Note the site `origin` the widget was opened on, after the response is
    sent. Never lets a tracking error break the widget itself."""
    if widget_install is None:
        return
    try:
        client_ip = forwarded_client_ip(request)
        if _claim_with_load:
            sighting = widget_install.claim_write(db, widget, origin, client_ip, load)
        elif load == PAGE_LOAD:
            sighting = widget_install.claim_write(db, widget, origin, client_ip)
        else:
            return  # an older module would misread a framed load as a page load
        if sighting:
            background_tasks.add_task(widget_install.record, widget.id, sighting)
    except Exception:
        logger.exception(f"Install tracking failed for widget {widget.id}")
