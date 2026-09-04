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

import os
import json
from pydantic_settings import BaseSettings
from typing import List, NamedTuple, Optional
from dotenv import load_dotenv
from pathlib import Path
from pydantic import field_validator
from app.core.logger import get_logger

# Get the absolute path to the backend directory (parent of app directory)
BACKEND_DIR = Path(__file__).resolve().parent.parent.parent

# Load the .env file
load_dotenv(BACKEND_DIR / ".env")

DEFAULT_CORS = ["https://chattermate.chat", "http://localhost:5173", "http://localhost:8000"]

class Settings(BaseSettings):
    PROJECT_NAME: str = "ChatterMate"
    VERSION: str = "0.1.0"
    API_V1_STR: str = "/api/v1"

    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", "postgresql+psycopg://test:test@localhost:5432/chattermate")
    # Redis
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    REDIS_ENABLED: bool = os.getenv("REDIS_ENABLED", "false").lower() == "true"

    # JWT
    SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "your-secret-key")
    ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    CONVERSATION_SECRET_KEY: str = os.getenv(
        "CONVERSATION_SECRET_KEY", "your-conversation-secret-key")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # CORS Configuration
    CORS_ORIGINS: List[str] = os.getenv("CORS_ORIGINS", DEFAULT_CORS)
    

    # Firebase config
    FIREBASE_CREDENTIALS: str = os.getenv(
        "FIREBASE_CREDENTIALS", "app/config/firebase-config.json")
    
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173")
    BACKEND_URL: str = os.getenv("BACKEND_URL", "http://localhost:8000")
    VITE_WIDGET_URL: str = os.getenv("VITE_WIDGET_URL", "http://localhost:5173")

    # app.core.encryption owns the actual key loading (reads the env var directly and
    # refuses to start without it outside development). This mirror exists only so
    # check_secret_configuration can audit it, hence no default: unset is itself
    # one of the states that audit flags.
    ENCRYPTION_KEY: str = os.getenv("ENCRYPTION_KEY", "")
    # Downgrades the public-default ENCRYPTION_KEY startup error to a warning, for
    # deployments whose existing data is encrypted under that key. See
    # verify_secret_configuration.
    ALLOW_INSECURE_ENCRYPTION_KEY: bool = os.getenv(
        "ALLOW_INSECURE_ENCRYPTION_KEY", "false").lower() == "true"

    # SMTP Settings
    SMTP_SERVER: str = os.getenv("SMTP_SERVER", "smtp.gmail.com")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USERNAME: str = os.getenv("SMTP_USERNAME", "your-email@gmail.com")
    SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD", "your-password")
    FROM_EMAIL: str = os.getenv("FROM_EMAIL", "noreply@chattermate.chat")
    FROM_NAME: str = os.getenv("FROM_NAME", "ChatterMate")

    # Shopify
    SHOPIFY_API_KEY: str = os.getenv("SHOPIFY_API_KEY", "")
    SHOPIFY_API_SECRET: str = os.getenv("SHOPIFY_API_SECRET", "")
    SHOPIFY_API_VERSION: str = os.getenv("SHOPIFY_API_VERSION", "2025-10")

    # Slack. The OAuth redirect URI is derived from BACKEND_URL, not configured.
    SLACK_CLIENT_ID: str = os.getenv("SLACK_CLIENT_ID", "")
    SLACK_CLIENT_SECRET: str = os.getenv("SLACK_CLIENT_SECRET", "")
    SLACK_SIGNING_SECRET: str = os.getenv("SLACK_SIGNING_SECRET", "")

    # Jira. Unlike the others the redirect URI IS configured, because it must
    # match the callback registered on the Atlassian app exactly. Self-hosters
    # supply their own OAuth app creds.
    JIRA_CLIENT_ID: str = os.getenv("JIRA_CLIENT_ID", "")
    JIRA_CLIENT_SECRET: str = os.getenv("JIRA_CLIENT_SECRET", "")
    JIRA_REDIRECT_URI: str = os.getenv("JIRA_REDIRECT_URI", "")

    # CRM lead push (HubSpot / Pipedrive). OAuth redirect URIs are derived from
    # BACKEND_URL, not configured. Self-hosters supply their own OAuth app creds.
    HUBSPOT_CLIENT_ID: str = os.getenv("HUBSPOT_CLIENT_ID", "")
    HUBSPOT_CLIENT_SECRET: str = os.getenv("HUBSPOT_CLIENT_SECRET", "")
    PIPEDRIVE_CLIENT_ID: str = os.getenv("PIPEDRIVE_CLIENT_ID", "")
    PIPEDRIVE_CLIENT_SECRET: str = os.getenv("PIPEDRIVE_CLIENT_SECRET", "")

    # Meta (WhatsApp Cloud API, Messenger, Instagram) — one app, shared webhook.
    # Self-hosters supply their own app; the cloud supplies its approved app.
    META_APP_ID: str = os.getenv("META_APP_ID", "")
    META_APP_SECRET: str = os.getenv("META_APP_SECRET", "")
    # Our own random token echoed back during webhook GET verification
    META_WEBHOOK_VERIFY_TOKEN: str = os.getenv("META_WEBHOOK_VERIFY_TOKEN", "")
    META_GRAPH_VERSION: str = os.getenv("META_GRAPH_VERSION", "v21.0")
    # WhatsApp Embedded Signup config id (cloud onboarding convenience)
    META_CONFIG_ID: str = os.getenv("META_CONFIG_ID", "")
    # Facebook Login for Business config id, for connecting a Page (Messenger and
    # Instagram DM both ride on the Page's token). A separate configuration from
    # META_CONFIG_ID: it requests pages_messaging + pages_show_list and returns a
    # user token, not a WhatsApp signup.
    META_MESSENGER_CONFIG_ID: str = os.getenv("META_MESSENGER_CONFIG_ID", "")
    # Instagram API with Instagram Login: its own app id/secret, separate from
    # the Facebook ones above. This flow needs no Facebook Page — the business
    # signs in with Instagram and we get an Instagram user token.
    INSTAGRAM_APP_ID: str = os.getenv("INSTAGRAM_APP_ID", "")
    INSTAGRAM_APP_SECRET: str = os.getenv("INSTAGRAM_APP_SECRET", "")
    # Comma-separated emails allowed to use one-click Meta signup. Empty means
    # everyone, which is the end state — this exists so the flow can be exercised
    # in production while the Meta app is still in App Review, since until it is
    # approved the login only works for people with a role on the app anyway.
    SIGNUP_ALLOWED_EMAILS: str = os.getenv("SIGNUP_ALLOWED_EMAILS", "")

    VERIFY_SSL_CERTIFICATES: bool = os.getenv("VERIFY_SSL_CERTIFICATES", "true").lower() == "true"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    TRIAL_DAYS: int = 7  # 7-day trial period

    # S3 Configuration
    S3_FILE_STORAGE: bool = os.getenv("S3_FILE_STORAGE", "false").lower() == "true"
    S3_BUCKET: str = os.getenv("S3_BUCKET", "chattermate-uploads")
    S3_REGION: str = os.getenv("S3_REGION", "us-east-1")
    # None, not "", when unset: boto3 only falls back to its default credential
    # chain (env → shared config → IAM instance/container role) if these are
    # None. An empty string is treated as an explicit credential, so requests
    # get signed with a blank access key and fail with InvalidAccessKeyId —
    # which is what blocks EC2/ECS/EKS deployments from using an attached role.
    AWS_ACCESS_KEY_ID: Optional[str] = os.getenv("AWS_ACCESS_KEY_ID") or None
    AWS_SECRET_ACCESS_KEY: Optional[str] = os.getenv("AWS_SECRET_ACCESS_KEY") or None
    # Presigned URLs are regenerated on every response, so this only needs to
    # outlive a single page render. Hard-capped at S3_MAX_PRESIGN_SECONDS.
    S3_PRESIGN_EXPIRY_SECONDS: int = int(os.getenv("S3_PRESIGN_EXPIRY_SECONDS", "3600"))

    # Enhanced Website Knowledge Base Configuration
    KB_MAX_DEPTH: int = int(os.getenv("KB_MAX_DEPTH", "5"))
    KB_MAX_LINKS: int = int(os.getenv("KB_MAX_LINKS", "25"))
    KB_MIN_CONTENT_LENGTH: int = int(os.getenv("KB_MIN_CONTENT_LENGTH", "100"))
    KB_TIMEOUT: int = int(os.getenv("KB_TIMEOUT", "30"))
    KB_MAX_RETRIES: int = int(os.getenv("KB_MAX_RETRIES", "3"))
    KB_MAX_WORKERS: int = int(os.getenv("KB_MAX_WORKERS", "5"))
    KB_BATCH_SIZE: int = int(os.getenv("KB_BATCH_SIZE", "5"))
    KB_OPTIMIZE_ON: int = int(os.getenv("KB_OPTIMIZE_ON", "1000"))

    # Hard ceiling on a single agent run (model + tool calls). A stuck run is
    # cancelled instead of hanging the chat handler forever (issue #269).
    AGENT_RUN_TIMEOUT: int = int(os.getenv("AGENT_RUN_TIMEOUT", "90"))

    # Tool calls allowed in a single turn before the agent must answer from what
    # it already has. Reaching this is no longer fatal — the agent answers without
    # further tools rather than returning nothing (see app.utils.agno_patches) —
    # so the budget can stay tight. AGENT_RUN_TIMEOUT is the real safety net.
    AGENT_TOOL_CALL_LIMIT: int = int(os.getenv("AGENT_TOOL_CALL_LIMIT", "5"))

    # Knowledge base content summarization settings
    KNOWLEDGE_SUMMARY_ENABLED: bool = os.getenv("KNOWLEDGE_SUMMARY_ENABLED", "false").lower() == "true"
    KNOWLEDGE_SUMMARY_MODEL_TYPE: str = os.getenv("KNOWLEDGE_SUMMARY_MODEL_TYPE", "GROQ")
    KNOWLEDGE_SUMMARY_MODEL_NAME: str = os.getenv("KNOWLEDGE_SUMMARY_MODEL_NAME", "llama-3.1-8b-instant")
    KNOWLEDGE_SUMMARY_API_KEY: str = os.getenv("KNOWLEDGE_SUMMARY_API_KEY", "")
    KNOWLEDGE_SUMMARY_MAX_TOKENS: int = int(os.getenv("KNOWLEDGE_SUMMARY_MAX_TOKENS", "4000"))
    # Required when KNOWLEDGE_SUMMARY_MODEL_TYPE=OPENAI_COMPATIBLE, ignored otherwise.
    KNOWLEDGE_SUMMARY_BASE_URL: str = os.getenv("KNOWLEDGE_SUMMARY_BASE_URL", "")

    # Global chat guardrails (platform-owned; deliberately NOT tenant-configurable).
    # GUARDRAIL_POLICY_ENABLED       -> prepend the code-owned policy block to every
    #                                   chat agent system prompt.
    # GUARDRAIL_INBOUND_ACTION       -> pre-LLM injection check on visitor messages:
    #                                   "off" (never block), "template_only" (block
    #                                   only literal chat-template tokens a human
    #                                   never types), "strict" (block every strong
    #                                   injection signal). Non-blocking hits are
    #                                   always still counted.
    # GUARDRAIL_OUTPUT_CHECK_ENABLED -> scan replies for leaked policy text and
    #                                   count scope refusals.
    # GUARDRAIL_EVENTS_ENABLED       -> persist trigger events to guardrail_events.
    # GUARDRAIL_STORE_EXCERPT        -> store an encrypted 300-char excerpt of the
    #                                   offending text on each event for review.
    GUARDRAIL_POLICY_ENABLED: bool = os.getenv("GUARDRAIL_POLICY_ENABLED", "true").lower() == "true"
    GUARDRAIL_INBOUND_ACTION: str = os.getenv("GUARDRAIL_INBOUND_ACTION", "template_only")
    # Long self-contained exercise briefs with no business context. Defaults to
    # "block": prompt text demonstrably failed to hold these in production, and
    # blocking here also avoids paying for the inference. "count" or "off" to
    # relax without a deploy.
    GUARDRAIL_OFFTOPIC_ACTION: str = os.getenv("GUARDRAIL_OFFTOPIC_ACTION", "block")
    GUARDRAIL_OUTPUT_CHECK_ENABLED: bool = os.getenv("GUARDRAIL_OUTPUT_CHECK_ENABLED", "true").lower() == "true"
    GUARDRAIL_EVENTS_ENABLED: bool = os.getenv("GUARDRAIL_EVENTS_ENABLED", "true").lower() == "true"
    GUARDRAIL_STORE_EXCERPT: bool = os.getenv("GUARDRAIL_STORE_EXCERPT", "true").lower() == "true"

    # Help center (public FAQ site)
    # How the public help center URL is advertised (live_url):
    #   "path"      -> {BACKEND_URL}/help/{slug}, served same-origin as the API.
    #                  Works on localhost/self-host with no DNS/TLS/proxy. Default.
    #   "subdomain" -> https://{slug}.<HELP_CENTER_BASE_DOMAIN> (cloud). MUST be set
    #                  on cloud so subdomain help centers keep their branded URL.
    # A verified custom domain always takes precedence over both. Host-based dispatch
    # (subdomains + custom domains) stays active regardless; only path dispatch is gated
    # to "path" mode.
    HELP_CENTER_PUBLIC_MODE: str = os.getenv("HELP_CENTER_PUBLIC_MODE", "path")
    # Base domain serving {slug}.<base> help centers.
    HELP_CENTER_BASE_DOMAIN: str = os.getenv("HELP_CENTER_BASE_DOMAIN", "chattermate.help")
    # CNAME target customers point their custom help-center domain at.
    HELP_CENTER_CNAME_TARGET: str = os.getenv("HELP_CENTER_CNAME_TARGET", "cname.chattermate.chat")
    # IPs the CNAME target resolves to — accepted when a provider flattens the
    # CNAME into A/AAAA records (comma-separated).
    HELP_CENTER_TARGET_IPS: frozenset = frozenset(
        ip.strip() for ip in os.getenv("HELP_CENTER_TARGET_IPS", "").split(",") if ip.strip()
    )
    # FAQ generation cost caps (per source / per LLM call) and import fetch limits.
    FAQ_MAX_PAGES_PER_SOURCE: int = int(os.getenv("FAQ_MAX_PAGES_PER_SOURCE", "300"))
    FAQ_MAX_BATCH_CHARS: int = int(os.getenv("FAQ_MAX_BATCH_CHARS", "15000"))
    # Ceiling for context-window-derived batch sizing (see utils/model_context.py)
    # — a quality guard for very-large-context models, not a token limit.
    FAQ_MAX_BATCH_CHARS_CEILING: int = int(os.getenv("FAQ_MAX_BATCH_CHARS_CEILING", "60000"))
    # Force a context-window size (tokens) for exotic/self-hosted models; 0 = auto.
    FAQ_CONTEXT_TOKENS_OVERRIDE: int = int(os.getenv("FAQ_CONTEXT_TOKENS_OVERRIDE", "0"))
    # Meter FAQ generation credits even for orgs on their own API key
    # (default: hosted CHATTERMATE model only).
    FAQ_METER_OWN_KEY: bool = os.getenv("FAQ_METER_OWN_KEY", "false").lower() == "true"
    FAQ_IMPORT_MAX_PAGE_CHARS: int = int(os.getenv("FAQ_IMPORT_MAX_PAGE_CHARS", "100000"))
    FAQ_IMPORT_FETCH_TIMEOUT: int = int(os.getenv("FAQ_IMPORT_FETCH_TIMEOUT", "30"))
    # Article-mode import (crawl linked pages, no LLM): crawl and re-host caps.
    # High enough to pull a whole mid-size help center in one pass; a deliberate
    # one-time migration in a background worker, so slowness is acceptable.
    FAQ_ARTICLE_IMPORT_MAX_PAGES: int = int(os.getenv("FAQ_ARTICLE_IMPORT_MAX_PAGES", "200"))
    FAQ_ARTICLE_IMPORT_MAX_IMAGES: int = int(os.getenv("FAQ_ARTICLE_IMPORT_MAX_IMAGES", "10"))
    # Category/section listing pages to follow for the full per-category article
    # list (help-center homepages truncate each section to a few articles).
    FAQ_ARTICLE_IMPORT_MAX_CATEGORIES: int = int(os.getenv("FAQ_ARTICLE_IMPORT_MAX_CATEGORIES", "20"))
    # A 'processing' FAQ job whose progress hasn't advanced in this long is
    # treated as dead (worker crashed/killed): excluded from active-job polling
    # and reaped on the next enqueue. Generous — must exceed the slowest single
    # LLM batch / page fetch so a live-but-slow job is never killed.
    FAQ_JOB_STALE_SECONDS: int = int(os.getenv("FAQ_JOB_STALE_SECONDS", "600"))
    # FAQ generation/import jobs processed concurrently across ALL orgs. Default
    # 1 = strictly one business at a time (each job does LLM calls + vector-DB
    # reads); raise for more throughput on a bigger host.
    MAX_CONCURRENT_FAQ_JOBS: int = int(os.getenv("MAX_CONCURRENT_FAQ_JOBS", "1"))
    # AI ticket triage/investigation runs processed concurrently across ALL
    # orgs (each run does LLM calls; investigations later add MCP subprocesses).
    MAX_CONCURRENT_INVESTIGATIONS: int = int(os.getenv("MAX_CONCURRENT_INVESTIGATIONS", "2"))
    # Subdomain labels reserved for infrastructure — must mirror the DNS/nginx
    # records that exist on the base domain, hence env-configurable.
    HELP_CENTER_RESERVED_SLUGS: frozenset = frozenset(
        s.strip() for s in os.getenv(
            "HELP_CENTER_RESERVED_SLUGS",
            "www,api,app,help,mail,admin,staging,cname,status",
        ).split(",") if s.strip()
    )

    # Embedding Model Configuration
    EMBEDDING_MODEL_ID: str = os.getenv("EMBEDDING_MODEL_ID", "sentence-transformers/all-MiniLM-L6-v2")
    EMBEDDING_BATCH_SIZE: int = int(os.getenv("EMBEDDING_BATCH_SIZE", "32"))
    EMBEDDING_MAX_WORKERS: int = int(os.getenv("EMBEDDING_MAX_WORKERS", "4"))
    
    # FastEmbed Configuration
    FASTEMBED_MODEL: str = os.getenv("FASTEMBED_MODEL", "BAAI/bge-small-en-v1.5")
    
    # Embedding Optimization Configuration
    ENABLE_IMMEDIATE_EMBEDDING: bool = os.getenv("ENABLE_IMMEDIATE_EMBEDDING", "true").lower() == "true"
    
    # Embedding Safety Configuration (for Docker environments)
    EMBEDDING_SINGLE_THREADED: bool = os.getenv("EMBEDDING_SINGLE_THREADED", "true").lower() == "true"
    EMBEDDING_SEQUENTIAL_FALLBACK: bool = os.getenv("EMBEDDING_SEQUENTIAL_FALLBACK", "true").lower() == "true"
    
    # Explore View Configuration
    EXPLORE_SOURCE_ORG_ID: str = os.getenv("EXPLORE_SOURCE_ORG_ID", "bab82aab-d095-46f8-bf16-da638671bcf4")
    EXPLORE_AGENT_ID: str = os.getenv("EXPLORE_AGENT_ID", "b20188ee-2800-41d0-8bf1-8fc291ab0076")
    EXPLORE_USER_ID: str = os.getenv("EXPLORE_USER_ID", "154540a3-6177-4b1b-aab2-f23f0ef74ac7")
    EXPLORE_WIDGET_ID: str = os.getenv("EXPLORE_WIDGET_ID", "397046dc-0093-4499-ab45-a0afe3c3ee14")

    @field_validator("AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY", mode="after")
    @classmethod
    def _blank_credential_is_unset(cls, v: Optional[str]) -> Optional[str]:
        """Coerce a blank credential to None so boto3 uses its default chain.

        The field default already does this, but BaseSettings reads the
        environment itself and overrides it — a var that is present but empty
        (`AWS_ACCESS_KEY_ID=` in .env, or an env_file entry with no value)
        lands as "" and would be signed with as an explicit blank credential.
        """
        return v or None

    model_config = {
        "case_sensitive": True,
        "env_file": ".env",
        "extra": "allow",  # This allows extra fields from .env
    }

settings = Settings()

logger = get_logger(__name__)


# Environments where the public defaults are acceptable, because nothing durable or
# reachable is protected by them. Anything else is treated as a real deployment.
_THROWAWAY_ENVIRONMENTS = frozenset({"development", "test", "testing"})

# Shell one-liners producing a real value for each kind of secret, quoted back in
# the startup error so the fix does not require going and finding the docs.
# ENCRYPTION_KEY_HINT is public because app.core.encryption reports the same fix
# when the key is missing at load time, and the two must not drift apart.
ENCRYPTION_KEY_HINT = (
    'python -c "import base64;from cryptography.fernet import Fernet;'
    'print(base64.b64encode(Fernet.generate_key()).decode())"'
)
_HEX_SECRET_HINT = "openssl rand -hex 32"


class _ManagedSecret(NamedTuple):
    """A secret the app refuses to serve traffic without.

    One record per secret rather than parallel dicts keyed by setting name: adding
    a secret should be one line, and a half-filled entry should not surface as a
    KeyError while building the very error meant to explain the problem.
    """

    # What the operator sets, which is not always the setting name.
    env_var: str
    # Value once shipped in this repo (config default / .env.example). Public, so
    # it stays listed after being removed as a default — deployments copied it.
    public_default: str
    # Shell one-liner producing a real replacement.
    generate: str


_MANAGED_SECRETS = {
    "SECRET_KEY": _ManagedSecret(
        "JWT_SECRET_KEY", "your-secret-key", _HEX_SECRET_HINT),
    "CONVERSATION_SECRET_KEY": _ManagedSecret(
        "CONVERSATION_SECRET_KEY", "your-conversation-secret-key", _HEX_SECRET_HINT),
    "ENCRYPTION_KEY": _ManagedSecret(
        "ENCRYPTION_KEY",
        "RFQ4SzhyRTVYdGtsLUxsc25SaDB0QlZpbTdQRmlVRlpsZUlCaFRlU2Vxbz0=",
        ENCRYPTION_KEY_HINT),
}

# .env.example placeholders - not secret either, and they mean "never configured"
_PLACEHOLDER_VALUES = {
    "your_jwt_secret_key_here",
    "your_conversation_secret_key_here",
    "your_fernet_encryption_key_here",
}


def is_throwaway_environment(config: Settings = settings) -> bool:
    """True for local development and test runs, where the public defaults are
    harmless. Defined here so every check of "is this a real deployment" agrees;
    app.core.encryption asks the same question before generating a throwaway key.
    """
    return config.ENVIRONMENT.lower() in _THROWAWAY_ENVIRONMENTS


def check_secret_configuration(config: Settings = settings) -> list[str]:
    """Names of the auth/encryption secrets that are missing or still at a public
    default/placeholder. Empty in development, which runs on the defaults on purpose.

    Pure audit: verify_secret_configuration decides what to do about the result.
    """
    if is_throwaway_environment(config):
        return []

    return [
        name for name, secret in _MANAGED_SECRETS.items()
        if not getattr(config, name, None)
        or getattr(config, name) == secret.public_default
        or getattr(config, name) in _PLACEHOLDER_VALUES
    ]


def verify_secret_configuration(config: Settings = settings) -> None:
    """Refuse to start on secrets anyone can look up in this repo.

    Every value in _MANAGED_SECRETS and _PLACEHOLDER_VALUES is public, so a
    deployment using one has no auth boundary at all — tokens can be forged and
    stored credentials decrypted by anyone. A warning was not enough: it scrolls
    past in the boot log and the deployment stays exposed indefinitely.

    ENCRYPTION_KEY alone gets an escape hatch. An instance predating the required
    key has real data encrypted under the public one, and refusing to boot would
    lock it out of that data — worse than the exposure it already lives with.
    Rotating a JWT secret only ends sessions, so those get no exemption.
    """
    insecure = check_secret_configuration(config)

    if "ENCRYPTION_KEY" in insecure and config.ALLOW_INSECURE_ENCRYPTION_KEY:
        logger.warning(
            "ENCRYPTION_KEY is the public default and ALLOW_INSECURE_ENCRYPTION_KEY "
            "is set, so startup continues. Conversations and stored credentials in "
            "this database can be decrypted by anyone who has a copy of it. Generate "
            "a real key (%s), re-encrypt what the old key wrote, then unset this.",
            ENCRYPTION_KEY_HINT,
        )
        insecure = [name for name in insecure if name != "ENCRYPTION_KEY"]

    if not insecure:
        return

    names = ", ".join(insecure)
    verb = "is" if len(insecure) == 1 else "are"
    fixes = "\n".join(
        f"  {_MANAGED_SECRETS[name].env_var}=$({_MANAGED_SECRETS[name].generate})"
        for name in insecure
    )
    raise RuntimeError(
        f"Refusing to start: {names} {verb} unset or still set to a value published "
        "in this repository, so anyone can forge tokens or decrypt stored data. "
        f"Set real values and restart:\n{fixes}"
    )
