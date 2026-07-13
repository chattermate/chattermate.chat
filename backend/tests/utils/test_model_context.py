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

from app.core.config import settings
from app.utils.model_context import (
    context_tokens_for,
    faq_batch_chars_for,
    output_tokens_for,
)


def test_longest_prefix_wins():
    assert context_tokens_for("OPENAI", "gpt-4o-mini") == 128_000
    assert context_tokens_for("OPENAI", "gpt-4") == 8_000  # bare gpt-4, not gpt-4o
    assert context_tokens_for("MISTRAL", "mistral-large-latest") == 128_000
    assert context_tokens_for("MISTRAL", "mistral-small") == 32_000


def test_unknown_model_falls_back_to_provider_default():
    assert context_tokens_for("ANTHROPIC", "some-future-model") == 200_000
    assert context_tokens_for("GROQ", "unknown") == 8_000
    assert context_tokens_for("", "") == 8_000  # unknown provider → global floor


def test_env_override_wins(monkeypatch):
    monkeypatch.setattr(settings, "FAQ_CONTEXT_TOKENS_OVERRIDE", 42_000)
    assert context_tokens_for("OPENAI", "gpt-4o") == 42_000


def test_small_context_model_keeps_floor_batch():
    batch_chars, max_faqs = faq_batch_chars_for("GROQ", "llama3-8b-8192")
    assert batch_chars == settings.FAQ_MAX_BATCH_CHARS
    assert max_faqs >= 15


def test_large_context_model_hits_ceiling():
    batch_chars, max_faqs = faq_batch_chars_for("ANTHROPIC", "claude-sonnet-5")
    assert batch_chars == settings.FAQ_MAX_BATCH_CHARS_CEILING
    assert batch_chars > settings.FAQ_MAX_BATCH_CHARS
    assert 15 <= max_faqs <= 40


def test_mid_context_model_lands_between_floor_and_ceiling():
    batch_chars, _ = faq_batch_chars_for("OPENAI", "gpt-3.5-turbo")
    assert settings.FAQ_MAX_BATCH_CHARS <= batch_chars <= settings.FAQ_MAX_BATCH_CHARS_CEILING


def test_output_reserve_scales_with_faq_count():
    assert output_tokens_for(40) > output_tokens_for(15) > 0
