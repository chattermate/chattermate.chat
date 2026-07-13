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

Curated context-window lookup for the org-configurable chat models, used to
size FAQ-generation batches to the selected model instead of a fixed constant.
Deliberately a small hand-maintained table (kept conservative) rather than a
dependency on litellm's model map; unknown models fall back to a per-provider
floor, and FAQ_CONTEXT_TOKENS_OVERRIDE forces a value for anything exotic.
"""

from app.core.config import settings

# Conservative floors when the model name is unrecognised. Keys match
# AIModelType values, uppercased.
_PROVIDER_DEFAULT_TOKENS = {
    "OPENAI": 16_000,
    "CHATTERMATE": 128_000,
    "ANTHROPIC": 200_000,
    "DEEPSEEK": 64_000,
    "GOOGLE": 32_000,
    "GOOGLEVERTEX": 32_000,
    "GROQ": 8_000,
    "MISTRAL": 32_000,
    "HUGGINGFACE": 8_000,
    "OLLAMA": 8_000,
    "XAI": 128_000,
}
_FALLBACK_TOKENS = 8_000

# Lowercase model-name prefixes; the longest matching prefix wins so
# "gpt-4o" beats "gpt-4" and "mistral-large" beats "mistral".
_MODEL_PREFIX_TOKENS = {
    "gpt-5": 400_000,
    "gpt-4.1": 1_000_000,
    "gpt-4o": 128_000,
    "gpt-4-turbo": 128_000,
    "gpt-4": 8_000,
    "gpt-3.5": 16_000,
    "o1": 200_000,
    "o3": 200_000,
    "o4": 200_000,
    "claude": 200_000,
    "gemini": 1_000_000,
    "deepseek": 64_000,
    "llama-3.1": 128_000,
    "llama-3.2": 128_000,
    "llama-3.3": 128_000,
    "llama-4": 128_000,
    "mixtral": 32_000,
    "mistral-large": 128_000,
    "mistral": 32_000,
    "grok": 128_000,
    "qwen": 32_000,
    "kimi": 128_000,
}

# Batch-size math. CHARS_PER_TOKEN is conservative for English prose (~4);
# SAFETY absorbs tokenizer variance and the packed-batch separators.
_PROMPT_OVERHEAD_TOKENS = 2_500  # instructions + existing-questions block
_OUTPUT_TOKENS_PER_FAQ = 120
_OUTPUT_TOKENS_BASE = 500
_CHARS_PER_TOKEN = 3.5
_SAFETY = 0.8
_MIN_FAQS_PER_BATCH = 15
_MAX_FAQS_PER_BATCH = 40
_CHARS_PER_FAQ = 3_000  # scale FAQ yield with batch size so density stays flat


def context_tokens_for(model_type: str, model_name: str) -> int:
    """Best-known context window (tokens) for the configured model."""
    if settings.FAQ_CONTEXT_TOKENS_OVERRIDE > 0:
        return settings.FAQ_CONTEXT_TOKENS_OVERRIDE
    name = (model_name or "").casefold()
    best = None
    for prefix, tokens in _MODEL_PREFIX_TOKENS.items():
        if name.startswith(prefix) and (best is None or len(prefix) > best[0]):
            best = (len(prefix), tokens)
    if best:
        return best[1]
    return _PROVIDER_DEFAULT_TOKENS.get((model_type or "").upper(), _FALLBACK_TOKENS)


def output_tokens_for(max_faqs: int) -> int:
    """Output reserve for a structured batch of up to max_faqs FAQs."""
    return max_faqs * _OUTPUT_TOKENS_PER_FAQ + _OUTPUT_TOKENS_BASE


def faq_batch_chars_for(model_type: str, model_name: str) -> tuple[int, int]:
    """(batch_chars, max_faqs) for FAQ extraction with this model.

    batch_chars is floored at FAQ_MAX_BATCH_CHARS (today's behaviour for
    small-context models) and ceilinged at FAQ_MAX_BATCH_CHARS_CEILING — a
    quality guard, not a token limit: grounded extraction degrades on very
    long contexts. max_faqs scales with the batch so bigger batches don't
    reduce total FAQ yield.
    """
    context = context_tokens_for(model_type, model_name)
    usable = context - _PROMPT_OVERHEAD_TOKENS - output_tokens_for(_MAX_FAQS_PER_BATCH)
    raw_chars = int(usable * _CHARS_PER_TOKEN * _SAFETY)
    batch_chars = max(settings.FAQ_MAX_BATCH_CHARS, min(raw_chars, settings.FAQ_MAX_BATCH_CHARS_CEILING))
    max_faqs = max(_MIN_FAQS_PER_BATCH, min(batch_chars // _CHARS_PER_FAQ, _MAX_FAQS_PER_BATCH))
    return batch_chars, max_faqs
