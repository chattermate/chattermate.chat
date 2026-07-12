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

from typing import Dict, Optional

from app.channels.base import ChannelAdapter

_adapters: Dict[str, ChannelAdapter] = {}


def register_adapter(adapter: ChannelAdapter) -> ChannelAdapter:
    """Register a stateless adapter singleton for its channel_type."""
    _adapters[adapter.channel_type] = adapter
    return adapter


def get_adapter(channel_type: str) -> Optional[ChannelAdapter]:
    """Adapter for a channel, or None for channels without one ('web')."""
    _ensure_loaded()
    return _adapters.get(channel_type)


_loaded = False


def _ensure_loaded() -> None:
    """Import adapter modules on first use (each registers itself).
    Lazy so importing app.channels never pulls every adapter's deps."""
    global _loaded
    if _loaded:
        return
    _loaded = True
    from app.channels import telegram  # noqa: F401
    from app.channels import whatsapp  # noqa: F401
    from app.channels import messenger  # noqa: F401
    from app.channels import instagram  # noqa: F401
    from app.channels import slack  # noqa: F401
    from app.channels import email  # noqa: F401
    from app.channels import sms  # noqa: F401
    from app.channels import line  # noqa: F401
    from app.channels import teams  # noqa: F401
