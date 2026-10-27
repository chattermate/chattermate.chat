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

# Base URLs of the third-party APIs the channel and CRM adapters call, and of
# the single sign-on providers.
#
# Deployments never set these. The e2e suite points them at its fakes
# (e2e/services/fake-externals, e2e/services/fake-sso) so channel and sign-in
# journeys run end to end without reaching Telegram, Meta, Slack, Google, …
# Read once at import, which is also when the adapters bind them (Meta's
# helpers take the base as a default argument).

import os


def external_base(env_var: str, default: str) -> str:
    """`default`, unless `env_var` overrides it; never with a trailing slash."""
    return (os.getenv(env_var) or default).rstrip("/")
