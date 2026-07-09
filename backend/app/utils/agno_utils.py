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

from agno.agent import Agent
from agno.models.openai import OpenAIChat
from app.core.logger import get_logger
from app.core.config import settings
from typing import Dict, Any, Optional, List
from fastapi import HTTPException

logger = get_logger(__name__)

def create_model(model_type: str, api_key: str, model_name: str, max_tokens: int = 1000, response_format: Optional[Dict[str, Any]] = None) -> Any:
    """
    Create and return the specified model based on model_type.
    
    Args:
        model_type: The type of model (OPENAI, GROQ, etc.)
        api_key: The API key
        model_name: The name/ID of the model
        max_tokens: Maximum tokens for model output
        response_format: Optional response format specification
        
    Returns:
        The initialized model object
        
    Raises:
        HTTPException: If the model type is not supported
    """
    model_type = model_type.upper()
    
    try:
        if model_type == 'OPENAI' or model_type == 'CHATTERMATE': # own model for enterprise customers
            if response_format:
                return OpenAIChat(api_key=api_key, id=model_name, max_tokens=max_tokens, response_format=response_format)
            else:
                return OpenAIChat(api_key=api_key, id=model_name, max_tokens=max_tokens)
        elif model_type == 'ANTHROPIC':
            from agno.models.anthropic import Claude
            return Claude(api_key=api_key, id=model_name, max_tokens=max_tokens)
        elif model_type == 'DEEPSEEK':
            from agno.models.deepseek import DeepSeek
            return DeepSeek(api_key=api_key, id=model_name, max_tokens=max_tokens)
        elif model_type == 'GOOGLE':
            from agno.models.google import Gemini
            # Gemini's agno model exposes max_output_tokens, not max_tokens.
            return Gemini(api_key=api_key, id=model_name, max_output_tokens=max_tokens)
        elif model_type == 'GOOGLEVERTEX':
            from agno.models.vertexai import Gemini
            return Gemini(api_key=api_key, id=model_name, max_tokens=max_tokens)
        elif model_type == 'GROQ':
            from agno.models.groq import Groq
            
            # Create a patched Groq model that handles the response_format + tools conflict
            class PatchedGroq(Groq):
                def __post_init__(self):
                    """Set supports_native_structured_outputs after initialization"""
                    super().__post_init__() if hasattr(super(), '__post_init__') else None
                    # Override to indicate Groq supports structured outputs via response_format
                    object.__setattr__(self, 'supports_native_structured_outputs', True)
                
                def get_request_params(self, response_format=None, tools=None, tool_choice=None):
                    """
                    Override get_request_params to handle the conflict between response_format and tools.
                    Groq API doesn't allow JSON response_format when tools are present.
                    """
                    # Get the base parameters from parent class
                    base_params = {
                        "frequency_penalty": self.frequency_penalty,
                        "logit_bias": self.logit_bias,
                        "logprobs": self.logprobs,
                        "max_tokens": self.max_tokens,
                        "presence_penalty": self.presence_penalty,
                        "seed": self.seed,
                        "stop": self.stop,
                        "temperature": self.temperature,
                        "top_logprobs": self.top_logprobs,
                        "top_p": self.top_p,
                        "user": self.user,
                        "extra_headers": self.extra_headers,
                        "extra_query": self.extra_query,
                    }
                    
                    # Filter out None values
                    request_params = {k: v for k, v in base_params.items() if v is not None}
                    
                    # Add tools first
                    if tools is not None:
                        request_params["tools"] = tools
                        if tool_choice is not None:
                            request_params["tool_choice"] = tool_choice
                        # Don't add response_format when tools are present to avoid conflict
                        logger.debug("Groq: Skipping response_format due to tools being present")
                    else:
                        # Only add response_format if no tools are present
                        if response_format is not None:
                            request_params["response_format"] = response_format
                    
                    # Add additional request params if provided
                    if self.request_params:
                        request_params.update(self.request_params)
                    
                    return request_params
            
            # Groq model doesn't support response_format parameter in constructor
            return PatchedGroq(api_key=api_key, id=model_name, max_tokens=max_tokens)
        elif model_type == 'MISTRAL':
            from agno.models.mistral import MistralChat
            return MistralChat(api_key=api_key, id=model_name, max_tokens=max_tokens)
        elif model_type == 'HUGGINGFACE':
            from agno.models.huggingface import HuggingFace
            return HuggingFace(api_key=api_key, id=model_name, max_tokens=max_tokens)
        elif model_type == 'OLLAMA':
            from agno.models.ollama import Ollama
            return Ollama(id=model_name)
        elif model_type == 'XAI':
            from agno.models.xai import xAI
            return xAI(api_key=api_key, id=model_name, max_tokens=max_tokens)
        else:
            raise ValueError(f"Unsupported model type: {model_type}")
    except ImportError as e:
        logger.error(f"Import error when creating model type {model_type}: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Model type {model_type} is not available in this installation")
    except Exception as e:
        logger.error(f"Error creating model type {model_type}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to initialize model: {str(e)}")

async def test_model_api_key(api_key: str, model_type: str, model_name: str) -> bool:
    """
    Test if the API key is valid for the given model type.
    
    Args:
        api_key: The API key to test
        model_type: The type of model
        model_name: The name of the model
        
    Returns:
        bool: True if the API key is valid, False otherwise
    """
    try:
        # Create a simple model and agent for testing
        model = create_model(model_type, api_key, model_name)
        test_agent = Agent(
            name="Test Agent",
            model=model,
            instructions="You are a test agent. Just respond with 'Test successful.'",
            debug_mode=False
        )
        
        # Run a simple test query
        await test_agent.arun(message="This is a test message.")
        return True
    except Exception as e:
        logger.error(f"API key test failed: {str(e)}")
        return False 