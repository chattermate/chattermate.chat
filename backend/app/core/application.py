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

from fastapi import FastAPI
from app.core.logger import get_logger

logger = get_logger(__name__)

# Create FastAPI app instance
app = FastAPI(
    title="ChatterMate API",
    description="AI-Powered Customer Support Platform",
    version="1.0.0"
)

def initialize_cors_listener():
    """
    Initialize the CORS listener for multi-worker environments
    This function is called during application startup
    """
    try:
        from app.core.cors import start_cors_listener
        start_cors_listener(app)
        logger.info("CORS listener initialized")
    except Exception as e:
        logger.error(f"Failed to initialize CORS listener: {str(e)}") 