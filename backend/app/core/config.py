"""
ChatterMate - Config
Copyright (C) 2024 ChatterMate

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>
"""

import os
import json
from pydantic_settings import BaseSettings
from typing import List
from dotenv import load_dotenv
from pathlib import Path
from pydantic import field_validator

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
    APP_BASE_URL: str = os.getenv("APP_BASE_URL", "http://localhost:8000")

    ENCRYPTION_KEY: str = os.getenv("ENCRYPTION_KEY", "RFQ4SzhyRTVYdGtsLUxsc25SaDB0QlZpbTdQRmlVRlpsZUlCaFRlU2Vxbz0=")

    # SMTP Settings
    SMTP_SERVER: str = os.getenv("SMTP_SERVER", "smtp.gmail.com")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USERNAME: str = os.getenv("SMTP_USERNAME", "your-email@gmail.com")
    SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD", "your-password")
    FROM_EMAIL: str = os.getenv("FROM_EMAIL", "noreply@chattermate.chat")
    FROM_NAME: str = os.getenv("FROM_NAME", "ChatterMate")

    # PayPal
    PAYPAL_CLIENT_ID: str = os.getenv("PAYPAL_CLIENT_ID", "test")
    PAYPAL_CLIENT_SECRET: str = os.getenv("PAYPAL_CLIENT_SECRET", "test")
    PAYPAL_SANDBOX_MODE: bool = os.getenv("PAYPAL_SANDBOX_MODE", "true").lower() == "true"
    PAYPAL_WEBHOOK_ID: str = os.getenv("PAYPAL_WEBHOOK_ID", "test")
    
    # Shopify
    SHOPIFY_API_KEY: str = os.getenv("SHOPIFY_API_KEY", "")
    SHOPIFY_API_SECRET: str = os.getenv("SHOPIFY_API_SECRET", "")
    SHOPIFY_API_VERSION: str = os.getenv("SHOPIFY_API_VERSION", "2025-10")
    VERIFY_SSL_CERTIFICATES: bool = os.getenv("VERIFY_SSL_CERTIFICATES", "true").lower() == "true"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    TRIAL_DAYS: int = 7  # 7-day trial period

    # S3 Configuration
    S3_FILE_STORAGE: bool = os.getenv("S3_FILE_STORAGE", "false").lower() == "true"
    S3_BUCKET: str = os.getenv("S3_BUCKET", "chattermate-uploads")
    S3_REGION: str = os.getenv("S3_REGION", "us-east-1")
    AWS_ACCESS_KEY_ID: str = os.getenv("AWS_ACCESS_KEY_ID", "")
    AWS_SECRET_ACCESS_KEY: str = os.getenv("AWS_SECRET_ACCESS_KEY", "")

    # Enhanced Website Knowledge Base Configuration
    KB_MAX_DEPTH: int = int(os.getenv("KB_MAX_DEPTH", "5"))
    KB_MAX_LINKS: int = int(os.getenv("KB_MAX_LINKS", "25"))
    KB_MIN_CONTENT_LENGTH: int = int(os.getenv("KB_MIN_CONTENT_LENGTH", "100"))
    KB_TIMEOUT: int = int(os.getenv("KB_TIMEOUT", "30"))
    KB_MAX_RETRIES: int = int(os.getenv("KB_MAX_RETRIES", "3"))
    KB_MAX_WORKERS: int = int(os.getenv("KB_MAX_WORKERS", "5"))
    KB_BATCH_SIZE: int = int(os.getenv("KB_BATCH_SIZE", "5"))
    KB_OPTIMIZE_ON: int = int(os.getenv("KB_OPTIMIZE_ON", "1000"))

    # Knowledge base content summarization settings
    KNOWLEDGE_SUMMARY_ENABLED: bool = os.getenv("KNOWLEDGE_SUMMARY_ENABLED", "false").lower() == "true"
    KNOWLEDGE_SUMMARY_MODEL_TYPE: str = os.getenv("KNOWLEDGE_SUMMARY_MODEL_TYPE", "GROQ")
    KNOWLEDGE_SUMMARY_MODEL_NAME: str = os.getenv("KNOWLEDGE_SUMMARY_MODEL_NAME", "llama-3.1-8b-instant")
    KNOWLEDGE_SUMMARY_API_KEY: str = os.getenv("KNOWLEDGE_SUMMARY_API_KEY", "")
    KNOWLEDGE_SUMMARY_MAX_TOKENS: int = int(os.getenv("KNOWLEDGE_SUMMARY_MAX_TOKENS", "4000"))

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

    model_config = {
        "case_sensitive": True,
        "env_file": ".env",
        "extra": "allow",  # This allows extra fields from .env
    }

settings = Settings()
