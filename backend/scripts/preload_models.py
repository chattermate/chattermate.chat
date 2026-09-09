#!/usr/bin/env python3
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
import sys
import logging

# Add the app directory to the Python path
sys.path.insert(0, '/app')

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def preload_agno_embedder():
    """Preload the fastembed model agno embeds with"""
    try:
        from agno.embedder.fastembed import FastEmbedEmbedder
        
        # Get model ID from environment or use default
        model_id = os.getenv("FASTEMBED_MODEL", "BAAI/bge-small-en-v1.5")
        
        logger.info(f"Preloading Agno FastEmbedEmbedder: {model_id}")
        
        # Initialize the embedder
        embedder = FastEmbedEmbedder(id=model_id)
        
        # Test embedding using the correct API method
        test_text = "Test embedding for Agno embedder initialization."
        embedding = embedder.get_embedding(test_text)
        
        logger.info(f"Successfully preloaded Agno embedder {model_id}. Embedding dimension: {len(embedding)}")
        
        # Clean up
        del embedder
        del embedding
        
        return True
        
    except Exception as e:
        logger.error(f"Failed to preload Agno embedder: {str(e)}")
        return False

def main():
    """Warm the embedding model cache so the first request does not pay for the download"""
    logger.info("Starting model preloading process...")

    if not preload_agno_embedder():
        logger.error("Model preloading failed")
        return 1

    logger.info("All models preloaded successfully!")
    return 0

if __name__ == "__main__":
    sys.exit(main()) 