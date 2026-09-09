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

from unittest.mock import AsyncMock, patch

import pytest

from app.core.application import app as api
from app.main import lifespan


@pytest.mark.asyncio
async def test_lifespan_runs_every_startup_step_once():
    with (
        patch("app.main.verify_encryption_key") as verify_key,
        patch("app.main.verify_secret_configuration") as verify_secrets,
        patch("app.main.initialize_firebase") as init_firebase,
        patch("app.main.configure_socketio") as configure_socketio,
        patch("app.main.initialize_cors_listener") as cors_listener,
        patch("app.main.run_auto_closer_loop", new=AsyncMock()) as auto_closer,
    ):
        async with lifespan(api):
            task = api.state.auto_closer_task
        await task

    verify_key.assert_called_once_with()
    verify_secrets.assert_called_once_with()
    init_firebase.assert_called_once_with()
    configure_socketio.assert_called_once()
    cors_listener.assert_called_once_with()
    auto_closer.assert_awaited_once_with()


def test_startup_work_is_not_left_on_the_dead_on_event_list():
    # Starlette 1.x dropped on_event; FastAPI keeps a compatibility list that a
    # custom lifespan never runs, so anything registered there is silently dead.
    assert not api.router.on_startup
