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

from typing import Any, Dict, List, TypedDict


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
    # Whether this provider needs a user-supplied base URL (e.g. a self-hosted or
    # third-party OpenAI-compatible endpoint). Defaults to False when absent.
    requires_base_url: bool


def _m(value: str, label: str) -> CatalogModel:
    return {"value": value, "label": label}


# Model behind the managed "ChatterMate" option when CHATTERMATE_MODEL_NAME is
# unset. OpenAI's named successor to gpt-4o-mini, and cheaper per token.
DEFAULT_CHATTERMATE_MODEL = "gpt-6-luna"

# Extra agno model kwargs, by provider then lowercase model ID. Most current
# models think by default, and agno 1.7.6 can't carry that thinking through a
# tool loop — it drops OpenAI-style reasoning_content and keeps only one Claude
# thinking block — and thinking also eats the small max_tokens budgets the
# agents run on. So thinking is switched off wherever the model allows it.
#
# A key matches that exact ID or a dated snapshot of it, never a later model
# that shares the prefix: each new model's thinking switch has to be checked,
# not assumed (Sonnet 5.5 rejects the "disabled" that Sonnet 5 takes). A key
# ending in "*" matches every ID starting with the rest. Models absent here get
# no extra kwargs: older models reject these parameters outright.
MODEL_REQUEST_OVERRIDES: Dict[str, Dict[str, Dict[str, Any]]] = {
    "OPENAI": {
        # Chat Completions only calls tools at reasoning_effort "none".
        "gpt-6-luna": {"reasoning_effort": "none"},
        "gpt-6-sol": {"reasoning_effort": "none"},
        "gpt-5.6-luna": {"reasoning_effort": "none"},
    },
    "ANTHROPIC": {
        "claude-sonnet-5": {"thinking": {"type": "disabled"}},
        # Sonnet 5.5 400s on "disabled"; between_tools is its off switch.
        "claude-sonnet-5-5": {"thinking": {"type": "between_tools"}},
        # Accepted at effort high or below; Haiku 5.5 defaults to medium.
        "claude-haiku-5-5": {"thinking": {"type": "disabled"}},
    },
    "DEEPSEEK": {
        # With thinking on (the default), any request carrying tools is a 400
        # unless every earlier turn's reasoning_content is sent back.
        "deepseek*": {"request_params": {"extra_body": {"thinking": {"type": "disabled"}}}},
    },
}

# Providers that speak another provider's API and so share its overrides: the
# managed model is OpenAI, and gateways pass OpenAI's parameters through.
OVERRIDE_PROVIDER_ALIASES: Dict[str, str] = {
    "CHATTERMATE": "OPENAI",
    "OPENAI_COMPATIBLE": "OPENAI",
}


# Keyed by AIModelType value. CHATTERMATE (managed) is intentionally excluded — it
# is handled as a special case in the setup flow and is not user-selectable here.
MODEL_CATALOG: Dict[str, CatalogProvider] = {
    "OPENAI": {
        "label": "OpenAI",
        "requires_api_key": True,
        "custom_allowed": True,
        "api_key_url": "https://platform.openai.com/api-keys",
        # GPT-4o / 4o-mini / 4.1 / 4.1-mini shut down 2027-01-14; o4-mini and
        # gpt-4.1-nano already did (2026-10-23). Only models that can call tools
        # over Chat Completions (with reasoning_effort "none") are listed — the
        # 6.1 series and gpt-6-astra need the Responses API, which agno 1.7.6's
        # OpenAIChat does not speak.
        "models": [
            _m("gpt-6-luna", "GPT-6 Luna"),
            _m("gpt-6-sol", "GPT-6 Sol"),
            _m("gpt-5.6-luna", "GPT-5.6 Luna"),
        ],
    },
    "ANTHROPIC": {
        "label": "Anthropic (Claude)",
        "requires_api_key": True,
        "custom_allowed": True,
        "api_key_url": "https://console.anthropic.com/settings/keys",
        # Current-gen Claude IDs are complete stable strings — do NOT append a date.
        # Opus 5.5 and Fable 5.1 are not listed: their thinking can't be switched
        # off and agno 1.7.6 drops the extra thinking blocks they return between
        # tool calls. Sonnet 5.5 has an off switch (see MODEL_REQUEST_OVERRIDES)
        # but is unlisted until tried live. Sonnet 4.6 retires 2027-02-17;
        # Haiku 4.5 is past its retirement floor.
        "models": [
            _m("claude-sonnet-5", "Claude Sonnet 5"),
            _m("claude-opus-4-8", "Claude Opus 4.8"),
            _m("claude-haiku-5-5", "Claude Haiku 5.5"),
        ],
    },
    "GOOGLE": {
        "label": "Google Gemini",
        "requires_api_key": True,
        "custom_allowed": True,
        "api_key_url": "https://aistudio.google.com/app/apikey",
        # Gemini 3 and later 400 on the second tool call of a turn: agno 1.7.6
        # drops the thought_signature they require on replayed function calls.
        # Until that is patched only 2.5 works — and Google now limits 2.5 to keys
        # that have used it before. gemini-3.5-flash is gone (routes to 3.6).
        "models": [
            _m("gemini-2.5-pro", "Gemini 2.5 Pro"),
            _m("gemini-2.5-flash", "Gemini 2.5 Flash"),
            _m("gemini-2.5-flash-lite", "Gemini 2.5 Flash-Lite"),
        ],
    },
    "MISTRAL": {
        "label": "Mistral",
        "requires_api_key": True,
        "custom_allowed": True,
        "api_key_url": "https://console.mistral.ai/api-keys",
        # -latest aliases auto-advance to the current dated snapshot. Medium 3.5
        # was deprecated 2026-10-31 (retires 2027-04-30) with no successor.
        "models": [
            _m("mistral-large-latest", "Mistral Large"),
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
        # grok-4, grok-4-fast-* and grok-3 retired 2026-05-15 (they redirect to
        # grok-4.3). grok-4.7 is not listed: its reasoning can't be turned off.
        "models": [
            _m("grok-4.3", "Grok 4.3"),
            _m("grok-4.20-0309-non-reasoning", "Grok 4.20 (Non-Reasoning)"),
        ],
    },
    "DEEPSEEK": {
        "label": "DeepSeek",
        "requires_api_key": True,
        "custom_allowed": True,
        "api_key_url": "https://platform.deepseek.com/api_keys",
        # deepseek-chat/reasoner were discontinued 2026-07-24. deepseek-flash
        # tracks the latest Flash (deepseek-v4-flash is retired, only rerouted).
        "models": [
            _m("deepseek-v4-pro", "DeepSeek V4 Pro"),
            _m("deepseek-flash", "DeepSeek Flash"),
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
        # llama-3.3-70b-versatile shut down 2026-08-16 outside enterprise plans, and
        # nothing else on Groq is both GA and tool-capable. Org-prefixed IDs must be
        # passed exactly.
        "models": [
            _m("openai/gpt-oss-120b", "GPT-OSS 120B"),
        ],
    },
    "OPENAI_COMPATIBLE": {
        # Names the wire protocol, not the field: the endpoint must speak the
        # OpenAI chat-completions API (OpenRouter, vLLM, llama.cpp, Ollama, LiteLLM
        # and friends all do). The parenthetical is what self-hosters recognise.
        "label": "OpenAI-compatible (self-hosted, OpenRouter, Ollama…)",
        "requires_api_key": True,
        "custom_allowed": True,
        "requires_base_url": True,
        # No hosted console — points at the provider's own docs for getting a key.
        "api_key_url": "",
        # No suggested models: the endpoint and model catalog are whatever the
        # user's server exposes, so the model name must always be typed in.
        "models": [],
    },
}


def is_known_provider(provider: str) -> bool:
    """Return True if the provider is a selectable BYO-key provider in the catalog."""
    return bool(provider) and provider.upper() in MODEL_CATALOG


def requires_base_url(provider: str) -> bool:
    """Return True if the provider needs a user-supplied base URL.

    The catalog is the single source of truth for this, so a new self-hosted or
    gateway provider only has to set ``requires_base_url`` on its entry — callers
    must not string-compare against a specific provider name.
    """
    if not is_known_provider(provider):
        return False
    return MODEL_CATALOG[provider.upper()].get("requires_base_url", False)


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
            "requires_base_url": entry.get("requires_base_url", False),
        }
        for provider_value, entry in MODEL_CATALOG.items()
    ]
