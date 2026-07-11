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

from app.channels.sms.base import (
    SmsProvider, SmsWebhookRequest, CredentialField,
    get_provider, list_providers, register_provider,
)
# Import provider modules so they self-register
from app.channels.sms import twilio  # noqa: F401
from app.channels.sms import vonage  # noqa: F401
from app.channels.sms import messagebird  # noqa: F401
from app.channels.sms import plivo  # noqa: F401
from app.channels.sms import brevo  # noqa: F401
from app.channels.sms import sns  # noqa: F401
# The channel adapter (registers itself for channel_type 'sms')
from app.channels.sms import adapter  # noqa: F401

__all__ = [
    "SmsProvider",
    "SmsWebhookRequest",
    "CredentialField",
    "get_provider",
    "list_providers",
    "register_provider",
]
