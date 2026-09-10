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

from fastapi import FastAPI, HTTPException, Request
from fastapi.exception_handlers import http_exception_handler
from starlette.exceptions import HTTPException as StarletteHTTPException
from starlette.responses import Response

from app.core.logger import get_logger

logger = get_logger(__name__)

# What a 5xx answers with instead of the server's own error text.
INTERNAL_ERROR_DETAIL = "Internal server error"


class ClientSafeHTTPException(HTTPException):
    """A 5xx whose detail is meant for the caller and holds nothing internal.

    Raise this for a message we wrote ourselves, or an upstream provider's own
    wording that the operator has to act on — "Recipient not on WhatsApp" is
    useless in a log and essential on screen. Every other 5xx is assumed to be
    carrying server internals and has its detail replaced, which is what makes
    the widespread `detail=str(e)` safe by default.
    """


async def sanitized_http_exception_handler(
    request: Request, exc: StarletteHTTPException
) -> Response:
    """Answer 5xx with a fixed message and keep the real one in the log.

    Routes across the API raise `HTTPException(500, detail=str(e))`, which hands
    the caller whatever the exception happened to carry — SQL fragments, file
    paths, connection strings. None of it is actionable for a client, and a 5xx
    means the fault is ours, so the body gets a constant and the original goes to
    the log together with the route that produced it.

    4xx detail is written for the caller ("Agent not found", "Invalid token") and
    is passed through untouched, as is any `ClientSafeHTTPException`.
    """
    if exc.status_code < 500 or isinstance(exc, ClientSafeHTTPException):
        return await http_exception_handler(request, exc)

    logger.error(
        f"{request.method} {request.url.path} -> {exc.status_code}: {exc.detail}"
    )
    return await http_exception_handler(
        request,
        StarletteHTTPException(
            status_code=exc.status_code,
            detail=INTERNAL_ERROR_DETAIL,
            headers=exc.headers,
        ),
    )


def install_error_handlers(app: FastAPI) -> None:
    """Register the sanitizer. Called for every FastAPI instance we serve."""
    app.add_exception_handler(StarletteHTTPException, sanitized_http_exception_handler)
