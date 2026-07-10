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

"""Central catalog of BYO-key AI model providers and their suggested models.

Single source of truth consumed by:
  - the ``GET /ai/providers`` endpoint (which populates the frontend selectors), and
  - ``validate_model_selection`` in ``app.api.ai_setup``.

The listed models are *suggestions*, not a hard allowlist: every provider here has
``custom_allowed=True``, so an organization may type any model ID the provider
supports. Validation only checks that the provider is known and the model name is
non-empty — the live API-key test is what actually rejects a bad model ID.

Provider model IDs churn and several have near-term shutdowns (see notes). Verify
against each provider's live ``GET /v1/models`` before relying on an ID long-term.

Every provider key MUST match a value in ``app.models.ai_config.AIModelType`` and a
branch in ``app.utils.agno_utils.create_model``.
"""

from typing import Dict, List, TypedDict


class CatalogModel(TypedDict):
    value: str  # exact model ID passed to the provider API
    label: str  # human-readable display name


class CatalogProvider(TypedDict):
    label: str
    requires_api_key: bool
    custom_allowed: bool
    # Console URL where the user creates/copies their API key for this provider.
    api_key_url: str
    models: List[CatalogModel]


def _m(value: str, label: str) -> CatalogModel:
    return {"value": value, "label": label}


# Keyed by AIModelType value. CHATTERMATE (managed) is intentionally excluded — it
# is handled as a special case in the setup flow and is not user-selectable here.
MODEL_CATALOG: Dict[str, CatalogProvider] = {
    "OPENAI": {
        "label": "OpenAI",
        "requires_api_key": True,
        "custom_allowed": True,
        "api_key_url": "https://platform.openai.com/api-keys",
        "models": [
            _m("gpt-4.1", "GPT-4.1"),
            _m("gpt-4o", "GPT-4o"),
            _m("gpt-4.1-mini", "GPT-4.1 Mini"),
            _m("gpt-4o-mini", "GPT-4o Mini"),
            _m("o4-mini", "o4-mini"),
        ],
    },
    "ANTHROPIC": {
        "label": "Anthropic (Claude)",
        "requires_api_key": True,
        "custom_allowed": True,
        "api_key_url": "https://console.anthropic.com/settings/keys",
        # Current-gen Claude IDs are complete stable strings — do NOT append a date.
        "models": [
            _m("claude-opus-4-8", "Claude Opus 4.8"),
            _m("claude-sonnet-5", "Claude Sonnet 5"),
            _m("claude-sonnet-4-6", "Claude Sonnet 4.6"),
            _m("claude-haiku-4-5", "Claude Haiku 4.5"),
        ],
    },
    "GOOGLE": {
        "label": "Google Gemini",
        "requires_api_key": True,
        "custom_allowed": True,
        "api_key_url": "https://aistudio.google.com/app/apikey",
        # gemini-2.0-flash is shut down; use bare 2.5 IDs (avoid -latest/-preview).
        "models": [
            _m("gemini-2.5-pro", "Gemini 2.5 Pro"),
            _m("gemini-2.5-flash", "Gemini 2.5 Flash"),
            _m("gemini-2.5-flash-lite", "Gemini 2.5 Flash-Lite"),
            _m("gemini-3.5-flash", "Gemini 3.5 Flash"),
        ],
    },
    "MISTRAL": {
        "label": "Mistral",
        "requires_api_key": True,
        "custom_allowed": True,
        "api_key_url": "https://console.mistral.ai/api-keys",
        # -latest aliases auto-advance to the current dated snapshot.
        "models": [
            _m("mistral-large-latest", "Mistral Large"),
            _m("mistral-medium-latest", "Mistral Medium"),
            _m("mistral-small-latest", "Mistral Small"),
        ],
    },
    "XAI": {
        "label": "xAI (Grok)",
        "requires_api_key": True,
        "custom_allowed": True,
        # The Grok inference API uses a single xai-... key from console.x.ai — NOT the
        # X/Twitter OAuth app credentials (consumer key / access token / bearer token).
        "api_key_url": "https://console.x.ai",
        "models": [
            _m("grok-4", "Grok 4"),
            _m("grok-4-fast-reasoning", "Grok 4 Fast (Reasoning)"),
            _m("grok-4-fast-non-reasoning", "Grok 4 Fast (Non-Reasoning)"),
            _m("grok-3", "Grok 3"),
        ],
    },
    "DEEPSEEK": {
        "label": "DeepSeek",
        "requires_api_key": True,
        "custom_allowed": True,
        "api_key_url": "https://platform.deepseek.com/api_keys",
        # deepseek-chat/reasoner scheduled for EOL 2026-07-24; successors are
        # deepseek-v4-flash / deepseek-v4-pro — add here once live.
        "models": [
            _m("deepseek-chat", "DeepSeek Chat (V3)"),
            _m("deepseek-reasoner", "DeepSeek Reasoner"),
        ],
    },
    "GROQ": {
        "label": "Groq",
        "requires_api_key": True,
        "custom_allowed": True,
        "api_key_url": "https://console.groq.com/keys",
        # gpt-oss-120b is the durable pick. gpt-oss-20b is intentionally NOT listed: the
        # smaller model leaks OpenAI "harmony" formatting (calls the response tool as
        # `functions/json`), which Groq rejects, making structured output unreliable.
        # llama-3.3-70b-versatile is kept for continuity but is deprecated (EOL
        # 2026-08-16). Org-prefixed IDs must be passed exactly.
        "models": [
            _m("openai/gpt-oss-120b", "GPT-OSS 120B"),
            _m("llama-3.3-70b-versatile", "Llama 3.3 70B Versatile"),
        ],
    },
}


def is_known_provider(provider: str) -> bool:
    """Return True if the provider is a selectable BYO-key provider in the catalog."""
    return bool(provider) and provider.upper() in MODEL_CATALOG


def list_providers() -> List[dict]:
    """Return the catalog as a serializable list for the /ai/providers endpoint."""
    return [
        {
            "value": provider_value,
            "label": entry["label"],
            "requires_api_key": entry["requires_api_key"],
            "custom_allowed": entry["custom_allowed"],
            "api_key_url": entry["api_key_url"],
            "models": entry["models"],
        }
        for provider_value, entry in MODEL_CATALOG.items()
    ]
