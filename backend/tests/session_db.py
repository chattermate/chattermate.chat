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

from contextlib import asynccontextmanager
from unittest.mock import AsyncMock

from app import database
from app.api import widget_chat


def serve_session_off_loop(monkeypatch, module, db) -> None:
    """Give the code in module that opens its own session_off_loop() the test's session."""
    monkeypatch.setattr(module, "session_off_loop", AsyncMock(return_value=db))


def serve_socket_db(monkeypatch, db) -> None:
    """Give widget_chat's socket handlers the test's session."""
    serve_session_off_loop(monkeypatch, widget_chat, db)


@asynccontextmanager
async def session_slots_taken(count: int):
    """Take count of the slots session_off_loop shares between requests, as
    in-flight requests would, and give them back on exit. Yields the slots.
    database._slots() is the same per-loop semaphore session_off_loop waits on;
    if that changes, change this with it."""
    slots = database._slots()
    for _ in range(count):
        await slots.acquire()
    try:
        yield slots
    finally:
        for _ in range(count):
            slots.release()
