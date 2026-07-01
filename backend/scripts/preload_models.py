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
from pathlib import Path

# Add the app directory to the Python path
sys.path.insert(0, '/app')

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def preload_sentence_transformer():
    """Preload the sentence transformer model to avoid runtime issues"""
    try:
        from sentence_transformers import SentenceTransformer
        
        # Get model ID from environment or use default
        model_id = os.getenv("EMBEDDING_MODEL_ID", "sentence-transformers/all-MiniLM-L6-v2")
        
        logger.info(f"Preloading SentenceTransformer model: {model_id}")
        
        # Load the model (this will download it if not cached)
        model = SentenceTransformer(model_id)
        
        # Test the model with a simple embedding to ensure it's working
        test_text = "This is a test sentence to verify the model is working correctly."
        embedding = model.encode(test_text)
        
        logger.info(f"Successfully preloaded model {model_id}. Embedding dimension: {len(embedding)}")
        
        # Clean up to free memory
        del model
        del embedding
        
        return True
        
    except Exception as e:
        logger.error(f"Failed to preload SentenceTransformer model: {str(e)}")
        return False

def preload_agno_embedder():
    """Preload the Agno embedder to ensure it's working"""
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
    """Main function to preload all models"""
    logger.info("Starting model preloading process...")
    
    success = True
    
    # Preload SentenceTransformer model
    if not preload_sentence_transformer():
        success = False
    
    # Preload Agno embedder
    if not preload_agno_embedder():
        success = False
    
    if success:
        logger.info("All models preloaded successfully!")
        return 0
    else:
        logger.error("Some models failed to preload")
        return 1

if __name__ == "__main__":
    sys.exit(main()) 