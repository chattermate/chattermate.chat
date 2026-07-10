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

import pytest
import sys
from unittest.mock import patch, MagicMock, AsyncMock
from agno.agent import Agent
from app.utils import agno_utils
from fastapi import HTTPException
import importlib


class TestCreateModel:
    """Test cases for the create_model function"""

    def test_create_model_openai_with_response_format(self):
        """Test creating OpenAI model with response format"""
        with patch("app.utils.agno_utils.OpenAIChat") as mock_openai:
            mock_model = MagicMock()
            mock_openai.return_value = mock_model
            
            result = agno_utils.create_model(
                model_type="OPENAI",
                api_key="test-api-key",
                model_name="gpt-4",
                max_tokens=2000,
                response_format={"type": "json_object"}
            )
            
            mock_openai.assert_called_once_with(
                api_key="test-api-key", 
                id="gpt-4", 
                max_tokens=2000,
                response_format={"type": "json_object"}
            )
            assert result == mock_model

    def test_create_model_openai_without_response_format(self):
        """Test creating OpenAI model without response format"""
        with patch("app.utils.agno_utils.OpenAIChat") as mock_openai:
            mock_model = MagicMock()
            mock_openai.return_value = mock_model
            
            result = agno_utils.create_model(
                model_type="OPENAI",
                api_key="test-api-key",
                model_name="gpt-3.5-turbo"
            )
            
            mock_openai.assert_called_once_with(
                api_key="test-api-key", 
                id="gpt-3.5-turbo", 
                max_tokens=1000
            )
            assert result == mock_model

    def test_create_model_chattermate(self):
        """Test creating CHATTERMATE model (should use OpenAI)"""
        with patch("app.utils.agno_utils.OpenAIChat") as mock_openai:
            mock_model = MagicMock()
            mock_openai.return_value = mock_model
            
            result = agno_utils.create_model(
                model_type="CHATTERMATE",
                api_key="test-api-key",
                model_name="chattermate-model"
            )
            
            mock_openai.assert_called_once_with(
                api_key="test-api-key", 
                id="chattermate-model", 
                max_tokens=1000
            )
            assert result == mock_model

    def test_create_model_anthropic(self):
        """Test creating Anthropic model"""
        # Mock the import statement inside the function
        mock_claude_class = MagicMock()
        mock_model = MagicMock()
        mock_claude_class.return_value = mock_model
        
        with patch.dict('sys.modules', {'agno.models.anthropic': MagicMock(Claude=mock_claude_class)}):
            result = agno_utils.create_model(
                model_type="ANTHROPIC",
                api_key="test-api-key",
                model_name="claude-3-opus",
                max_tokens=1500
            )
            
            mock_claude_class.assert_called_once_with(
                api_key="test-api-key", 
                id="claude-3-opus", 
                max_tokens=1500
            )
            assert result == mock_model

    def test_create_model_deepseek(self):
        """Test creating DeepSeek model"""
        with patch("agno.models.deepseek.DeepSeek") as mock_deepseek:
            mock_model = MagicMock()
            mock_deepseek.return_value = mock_model
            
            result = agno_utils.create_model(
                model_type="DEEPSEEK",
                api_key="test-api-key",
                model_name="deepseek-chat"
            )
            
            mock_deepseek.assert_called_once_with(
                api_key="test-api-key", 
                id="deepseek-chat", 
                max_tokens=1000
            )
            assert result == mock_model

    def test_create_model_google(self):
        """Test creating Google Gemini model"""
        with patch("agno.models.google.Gemini") as mock_gemini:
            mock_model = MagicMock()
            mock_gemini.return_value = mock_model
            
            result = agno_utils.create_model(
                model_type="GOOGLE",
                api_key="test-api-key",
                model_name="gemini-pro"
            )
            
            mock_gemini.assert_called_once_with(
                api_key="test-api-key",
                id="gemini-pro",
                max_output_tokens=1000  # Gemini's agno model uses max_output_tokens
            )
            assert result == mock_model

    def test_create_model_googlevertex(self):
        """Test creating Google Vertex AI model (should trigger import error)"""
        with pytest.raises(HTTPException) as excinfo:
            agno_utils.create_model(
                model_type="GOOGLEVERTEX",
                api_key="test-api-key",
                model_name="gemini-pro-vertex"
            )
        
        assert excinfo.value.status_code == 400
        assert "is not available in this installation" in excinfo.value.detail

    def test_create_model_groq_with_response_format(self):
        """Test creating Groq model with response format (uses PatchedGroq)"""
        result = agno_utils.create_model(
            model_type="GROQ",
            api_key="test-api-key",
            model_name="mixtral-8x7b",
            response_format={"type": "json_object"}
        )
        
        # Should return a PatchedGroq instance
        assert result.__class__.__name__ == "PatchedGroq"
        assert result.api_key == "test-api-key"
        assert result.id == "mixtral-8x7b"
        assert result.max_tokens == 1000

    def test_create_model_groq_without_response_format(self):
        """Test creating Groq model without response format (uses PatchedGroq)"""
        result = agno_utils.create_model(
            model_type="GROQ",
            api_key="test-api-key",
            model_name="llama2-70b"
        )
        
        # Should return a PatchedGroq instance
        assert result.__class__.__name__ == "PatchedGroq"
        assert result.api_key == "test-api-key"
        assert result.id == "llama2-70b"
        assert result.max_tokens == 1000

    def test_patched_groq_response_format_tools_conflict(self):
        """Test that PatchedGroq handles response_format + tools conflict correctly"""
        result = agno_utils.create_model(
            model_type="GROQ",
            api_key="test-api-key",
            model_name="llama-3.3-70b-versatile"
        )
        
        # Test with tools - should NOT include response_format
        params_with_tools = result.get_request_params(
            response_format={"type": "json_object"},
            tools=[{"type": "function", "function": {"name": "test_tool"}}]
        )
        assert "tools" in params_with_tools
        assert "response_format" not in params_with_tools
        
        # Test without tools - should include response_format
        params_without_tools = result.get_request_params(
            response_format={"type": "json_object"}
        )
        assert "response_format" in params_without_tools
        assert "tools" not in params_without_tools

    def test_create_model_mistral(self):
        """Test creating Mistral model (mistralai is now a dependency)"""
        with patch("agno.models.mistral.MistralChat") as mock_mistral:
            mock_model = MagicMock()
            mock_mistral.return_value = mock_model

            result = agno_utils.create_model(
                model_type="MISTRAL",
                api_key="test-api-key",
                model_name="mistral-large-latest"
            )

            mock_mistral.assert_called_once_with(
                api_key="test-api-key",
                id="mistral-large-latest",
                max_tokens=1000
            )
            assert result == mock_model

    def test_create_model_huggingface(self):
        """Test creating HuggingFace model"""
        with patch("agno.models.huggingface.HuggingFace") as mock_hf:
            mock_model = MagicMock()
            mock_hf.return_value = mock_model
            
            result = agno_utils.create_model(
                model_type="HUGGINGFACE",
                api_key="test-api-key",
                model_name="microsoft/DialoGPT-medium"
            )
            
            mock_hf.assert_called_once_with(
                api_key="test-api-key", 
                id="microsoft/DialoGPT-medium", 
                max_tokens=1000
            )
            assert result == mock_model

    def test_create_model_ollama(self):
        """Test creating Ollama model (no API key needed)"""
        with patch("agno.models.ollama.Ollama") as mock_ollama:
            mock_model = MagicMock()
            mock_ollama.return_value = mock_model
            
            result = agno_utils.create_model(
                model_type="OLLAMA",
                api_key="not-needed",
                model_name="llama2"
            )
            
            mock_ollama.assert_called_once_with(id="llama2")
            assert result == mock_model

    def test_create_model_xai(self):
        """Test creating xAI model"""
        with patch("agno.models.xai.xAI") as mock_xai:
            mock_model = MagicMock()
            mock_xai.return_value = mock_model
            
            result = agno_utils.create_model(
                model_type="XAI",
                api_key="test-api-key",
                model_name="grok-1"
            )
            
            mock_xai.assert_called_once_with(
                api_key="test-api-key", 
                id="grok-1", 
                max_tokens=1000
            )
            assert result == mock_model

    def test_create_model_case_insensitive(self):
        """Test that model type is case insensitive"""
        with patch("app.utils.agno_utils.OpenAIChat") as mock_openai:
            mock_model = MagicMock()
            mock_openai.return_value = mock_model
            
            # Test lowercase
            result = agno_utils.create_model(
                model_type="openai",
                api_key="test-api-key",
                model_name="gpt-4"
            )
            assert result == mock_model
            
            # Test mixed case
            mock_openai.reset_mock()
            result = agno_utils.create_model(
                model_type="OpenAI",
                api_key="test-api-key",
                model_name="gpt-4"
            )
            assert result == mock_model

    def test_create_model_unsupported_type(self):
        """Test creating an unsupported model type"""
        with pytest.raises(HTTPException) as excinfo:
            agno_utils.create_model(
                model_type="UNSUPPORTED_MODEL",
                api_key="test-api-key",
                model_name="test-model"
            )
        
        assert excinfo.value.status_code == 500
        assert "Failed to initialize model" in excinfo.value.detail

    def test_create_model_import_error(self):
        """Test handling import errors"""
        # Mock the module to raise ImportError when Claude is accessed
        mock_module = MagicMock()
        mock_module.Claude.side_effect = ImportError("Module not found")
        
        with patch.dict('sys.modules', {'agno.models.anthropic': mock_module}):
            with pytest.raises(HTTPException) as excinfo:
                agno_utils.create_model(
                    model_type="ANTHROPIC",
                    api_key="test-api-key",
                    model_name="claude-3"
                )
            
            assert excinfo.value.status_code == 400
            assert "is not available in this installation" in excinfo.value.detail

    def test_create_model_general_exception(self):
        """Test handling general exceptions during model creation"""
        with patch("app.utils.agno_utils.OpenAIChat", side_effect=ValueError("Invalid configuration")):
            with pytest.raises(HTTPException) as excinfo:
                agno_utils.create_model(
                    model_type="OPENAI",
                    api_key="test-api-key",
                    model_name="gpt-4"
                )
            
            assert excinfo.value.status_code == 500
            assert "Failed to initialize model" in excinfo.value.detail


class TestModelApiKey:
    """Test cases for the test_model_api_key function"""

    @pytest.mark.asyncio
    async def test_test_model_api_key_success(self):
        """Test successful API key validation"""
        with patch("app.utils.agno_utils.create_model") as mock_create_model, \
             patch("app.utils.agno_utils.Agent") as mock_agent_class:
            # Setup mocks
            mock_model = MagicMock()
            mock_create_model.return_value = mock_model

            # Create an async mock for arun method
            mock_agent = MagicMock()
            mock_agent.arun = AsyncMock(return_value="Test successful.")
            mock_agent_class.return_value = mock_agent

            # Call the function
            result = await agno_utils.test_model_api_key("test-api-key", "OPENAI", "gpt-4")

            # Assert the function was called with correct parameters
            mock_create_model.assert_called_once_with("OPENAI", "test-api-key", "gpt-4")
            mock_agent_class.assert_called_once_with(
                name="Test Agent",
                model=mock_model,
                instructions="You are a test agent. Just respond with 'Test successful.'",
                debug_mode=False
            )
            mock_agent.arun.assert_called_once_with(message="This is a test message.")
            assert result is True

    @pytest.mark.asyncio
    async def test_test_model_api_key_create_model_failure(self):
        """Test API key validation when model creation fails"""
        with patch("app.utils.agno_utils.create_model", side_effect=Exception("Invalid API key")):
            result = await agno_utils.test_model_api_key("invalid-api-key", "OPENAI", "gpt-4")
            assert result is False

    @pytest.mark.asyncio
    async def test_test_model_api_key_agent_creation_failure(self):
        """Test API key validation when agent creation fails"""
        with patch("app.utils.agno_utils.create_model") as mock_create_model, \
             patch("app.utils.agno_utils.Agent", side_effect=Exception("Agent creation failed")):
            mock_model = MagicMock()
            mock_create_model.return_value = mock_model

            result = await agno_utils.test_model_api_key("test-api-key", "OPENAI", "gpt-4")
            assert result is False

    @pytest.mark.asyncio
    async def test_test_model_api_key_agent_run_failure(self):
        """Test API key validation when agent run fails"""
        with patch("app.utils.agno_utils.create_model") as mock_create_model, \
             patch("app.utils.agno_utils.Agent") as mock_agent_class:
            # Setup mocks
            mock_model = MagicMock()
            mock_create_model.return_value = mock_model

            # Create an async mock that raises an exception
            mock_agent = MagicMock()
            mock_agent.arun = AsyncMock(side_effect=Exception("API request failed"))
            mock_agent_class.return_value = mock_agent

            # Call the function
            result = await agno_utils.test_model_api_key("invalid-api-key", "OPENAI", "gpt-4")

            # Assert result
            assert result is False

    @pytest.mark.asyncio
    async def test_test_model_api_key_different_model_types(self):
        """Test API key validation with different model types"""
        test_cases = [
            ("ANTHROPIC", "claude-3"),
            ("GROQ", "mixtral-8x7b"),
            ("GOOGLE", "gemini-pro"),
            ("DEEPSEEK", "deepseek-chat")
        ]
        
        for model_type, model_name in test_cases:
            with patch("app.utils.agno_utils.create_model") as mock_create_model, \
                 patch("app.utils.agno_utils.Agent") as mock_agent_class:
                # Setup mocks
                mock_model = MagicMock()
                mock_create_model.return_value = mock_model

                mock_agent = MagicMock()
                mock_agent.arun = AsyncMock(return_value="Test successful.")
                mock_agent_class.return_value = mock_agent

                # Call the function
                result = await agno_utils.test_model_api_key("test-api-key", model_type, model_name)

                # Assert
                mock_create_model.assert_called_once_with(model_type, "test-api-key", model_name)
                assert result is True


class TestEdgeCases:
    """Test edge cases and boundary conditions"""

    def test_create_model_empty_strings(self):
        """Test create_model with empty strings"""
        with patch("app.utils.agno_utils.OpenAIChat") as mock_openai:
            mock_model = MagicMock()
            mock_openai.return_value = mock_model
            
            result = agno_utils.create_model(
                model_type="OPENAI",
                api_key="",
                model_name=""
            )
            
            mock_openai.assert_called_once_with(
                api_key="", 
                id="", 
                max_tokens=1000
            )
            assert result == mock_model

    def test_create_model_custom_max_tokens(self):
        """Test create_model with custom max_tokens"""
        with patch("app.utils.agno_utils.OpenAIChat") as mock_openai:
            mock_model = MagicMock()
            mock_openai.return_value = mock_model
            
            result = agno_utils.create_model(
                model_type="OPENAI",
                api_key="test-key",
                model_name="gpt-4",
                max_tokens=4000
            )
            
            mock_openai.assert_called_once_with(
                api_key="test-key", 
                id="gpt-4", 
                max_tokens=4000
            )
            assert result == mock_model

    def test_create_model_zero_max_tokens(self):
        """Test create_model with zero max_tokens"""
        with patch("app.utils.agno_utils.OpenAIChat") as mock_openai:
            mock_model = MagicMock()
            mock_openai.return_value = mock_model
            
            result = agno_utils.create_model(
                model_type="OPENAI",
                api_key="test-key",
                model_name="gpt-4",
                max_tokens=0
            )
            
            mock_openai.assert_called_once_with(
                api_key="test-key", 
                id="gpt-4", 
                max_tokens=0
            )
            assert result == mock_model

    @pytest.mark.asyncio
    async def test_test_model_api_key_empty_strings(self):
        """Test test_model_api_key with empty strings"""
        with patch("app.utils.agno_utils.create_model") as mock_create_model, \
             patch("app.utils.agno_utils.Agent") as mock_agent_class:
            mock_model = MagicMock()
            mock_create_model.return_value = mock_model

            mock_agent = MagicMock()
            mock_agent.arun = AsyncMock(return_value="Test successful.")
            mock_agent_class.return_value = mock_agent

            result = await agno_utils.test_model_api_key("", "", "")

            mock_create_model.assert_called_once_with("", "", "")
            assert result is True 