"""
ChatterMate - Test Content Summarizer
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

import pytest
from unittest.mock import patch, MagicMock
from app.knowledge.content_summarizer import ContentSummarizer, get_content_summarizer


class TestContentSummarizer:
    """Test suite for ContentSummarizer class"""

    def test_init_disabled(self):
        """Test initialization when summarization is disabled"""
        with patch('app.knowledge.content_summarizer.settings') as mock_settings:
            mock_settings.KNOWLEDGE_SUMMARY_ENABLED = False
            mock_settings.KNOWLEDGE_SUMMARY_MODEL_TYPE = "GROQ"
            mock_settings.KNOWLEDGE_SUMMARY_MODEL_NAME = "llama-3.1-8b-instant"
            mock_settings.KNOWLEDGE_SUMMARY_API_KEY = ""
            mock_settings.KNOWLEDGE_SUMMARY_MAX_TOKENS = 4000

            summarizer = ContentSummarizer()

            assert not summarizer.enabled
            assert summarizer._agent is None

    def test_init_enabled_no_api_key(self):
        """Test initialization when enabled but no API key"""
        with patch('app.knowledge.content_summarizer.settings') as mock_settings:
            mock_settings.KNOWLEDGE_SUMMARY_ENABLED = True
            mock_settings.KNOWLEDGE_SUMMARY_MODEL_TYPE = "GROQ"
            mock_settings.KNOWLEDGE_SUMMARY_MODEL_NAME = "llama-3.1-8b-instant"
            mock_settings.KNOWLEDGE_SUMMARY_API_KEY = ""
            mock_settings.KNOWLEDGE_SUMMARY_MAX_TOKENS = 4000

            summarizer = ContentSummarizer()

            assert not summarizer.enabled

    def test_init_enabled_with_api_key(self):
        """Test initialization when enabled with API key"""
        with patch('app.knowledge.content_summarizer.settings') as mock_settings:
            mock_settings.KNOWLEDGE_SUMMARY_ENABLED = True
            mock_settings.KNOWLEDGE_SUMMARY_MODEL_TYPE = "GROQ"
            mock_settings.KNOWLEDGE_SUMMARY_MODEL_NAME = "llama-3.1-8b-instant"
            mock_settings.KNOWLEDGE_SUMMARY_API_KEY = "test_api_key"
            mock_settings.KNOWLEDGE_SUMMARY_MAX_TOKENS = 4000

            summarizer = ContentSummarizer()

            assert summarizer.enabled
            assert summarizer.api_key == "test_api_key"

    def test_summarize_disabled(self):
        """Test that original content is returned when summarization is disabled"""
        with patch('app.knowledge.content_summarizer.settings') as mock_settings:
            mock_settings.KNOWLEDGE_SUMMARY_ENABLED = False
            mock_settings.KNOWLEDGE_SUMMARY_MODEL_TYPE = "GROQ"
            mock_settings.KNOWLEDGE_SUMMARY_MODEL_NAME = "llama-3.1-8b-instant"
            mock_settings.KNOWLEDGE_SUMMARY_API_KEY = ""
            mock_settings.KNOWLEDGE_SUMMARY_MAX_TOKENS = 4000

            summarizer = ContentSummarizer()

            content = "This is test content with a URL: https://example.com/product/123"
            result = summarizer.summarize(content, "https://example.com")

            assert result == content

    def test_summarize_short_content(self):
        """Test that short content is not summarized"""
        with patch('app.knowledge.content_summarizer.settings') as mock_settings:
            mock_settings.KNOWLEDGE_SUMMARY_ENABLED = True
            mock_settings.KNOWLEDGE_SUMMARY_MODEL_TYPE = "GROQ"
            mock_settings.KNOWLEDGE_SUMMARY_MODEL_NAME = "llama-3.1-8b-instant"
            mock_settings.KNOWLEDGE_SUMMARY_API_KEY = "test_api_key"
            mock_settings.KNOWLEDGE_SUMMARY_MAX_TOKENS = 4000

            summarizer = ContentSummarizer()

            # Content under 1000 chars
            content = "Short content with URL: https://example.com/product/123"
            result = summarizer.summarize(content, "https://example.com")

            assert result == content

    def test_summarize_preserves_urls(self):
        """Test that URLs are preserved in summarization"""
        with patch('app.knowledge.content_summarizer.settings') as mock_settings, \
             patch('app.knowledge.content_summarizer.create_model') as mock_create_model:
            mock_settings.KNOWLEDGE_SUMMARY_ENABLED = True
            mock_settings.KNOWLEDGE_SUMMARY_MODEL_TYPE = "GROQ"
            mock_settings.KNOWLEDGE_SUMMARY_MODEL_NAME = "llama-3.1-8b-instant"
            mock_settings.KNOWLEDGE_SUMMARY_API_KEY = "test_api_key"
            mock_settings.KNOWLEDGE_SUMMARY_MAX_TOKENS = 4000
            mock_settings.ENVIRONMENT = "development"

            # Mock the model
            mock_model = MagicMock()
            mock_create_model.return_value = mock_model

            # Create mock response with URLs preserved
            mock_response = MagicMock()
            mock_response.content = "Summary of the product. Check out the product at https://example.com/product/123 and related items at https://example.com/category/products"

            # Mock the agent and its run method
            mock_agent = MagicMock()
            mock_agent.run.return_value = mock_response

            summarizer = ContentSummarizer()

            # Override the agent with our mock
            with patch('app.knowledge.content_summarizer.Agent', return_value=mock_agent):
                # Get the agent to initialize it
                summarizer._get_agent()

                # Long content with multiple URLs
                content = """
                This is a long piece of content about our products.
                We have many great products available at https://example.com/product/123
                and you can find more information at https://example.com/category/products.
                Our documentation is available at https://docs.example.com/guide
                and images can be found at https://cdn.example.com/images/product.jpg.
                """ * 50  # Make it long enough to trigger summarization

                result = summarizer.summarize(content, "https://example.com")

                # Verify URLs are in the result
                assert "https://example.com/product/123" in result
                assert "https://example.com/category/products" in result

    def test_summarize_adds_source_url(self):
        """Test that source URL is added if not present"""
        with patch('app.knowledge.content_summarizer.settings') as mock_settings, \
             patch('app.knowledge.content_summarizer.create_model') as mock_create_model:
            mock_settings.KNOWLEDGE_SUMMARY_ENABLED = True
            mock_settings.KNOWLEDGE_SUMMARY_MODEL_TYPE = "GROQ"
            mock_settings.KNOWLEDGE_SUMMARY_MODEL_NAME = "llama-3.1-8b-instant"
            mock_settings.KNOWLEDGE_SUMMARY_API_KEY = "test_api_key"
            mock_settings.KNOWLEDGE_SUMMARY_MAX_TOKENS = 4000
            mock_settings.ENVIRONMENT = "development"

            # Mock the model
            mock_model = MagicMock()
            mock_create_model.return_value = mock_model

            # Create mock response without source URL
            mock_response = MagicMock()
            mock_response.content = "Summary of the product without source URL"

            # Mock the agent and its run method
            mock_agent = MagicMock()
            mock_agent.run.return_value = mock_response

            summarizer = ContentSummarizer()

            # Override the agent with our mock
            with patch('app.knowledge.content_summarizer.Agent', return_value=mock_agent):
                # Get the agent to initialize it
                summarizer._get_agent()

                # Long content
                content = "This is a long piece of content about our products. " * 100

                result = summarizer.summarize(content, "https://example.com/products")

                # Verify source URL is added
                assert "Source: https://example.com/products" in result

    def test_summarize_error_handling(self):
        """Test that errors are handled gracefully and original content is returned"""
        with patch('app.knowledge.content_summarizer.settings') as mock_settings, \
             patch('app.knowledge.content_summarizer.create_model') as mock_create_model:
            mock_settings.KNOWLEDGE_SUMMARY_ENABLED = True
            mock_settings.KNOWLEDGE_SUMMARY_MODEL_TYPE = "GROQ"
            mock_settings.KNOWLEDGE_SUMMARY_MODEL_NAME = "llama-3.1-8b-instant"
            mock_settings.KNOWLEDGE_SUMMARY_API_KEY = "test_api_key"
            mock_settings.KNOWLEDGE_SUMMARY_MAX_TOKENS = 4000
            mock_settings.ENVIRONMENT = "development"

            # Mock the model to raise an error
            mock_create_model.side_effect = Exception("API Error")

            summarizer = ContentSummarizer()

            # Long content
            content = "This is a long piece of content with URL: https://example.com/product/123 " * 100

            result = summarizer.summarize(content, "https://example.com")

            # Verify original content is returned on error
            assert result == content

    def test_get_content_summarizer_singleton(self):
        """Test that get_content_summarizer returns a singleton instance"""
        with patch('app.knowledge.content_summarizer.settings') as mock_settings:
            mock_settings.KNOWLEDGE_SUMMARY_ENABLED = True
            mock_settings.KNOWLEDGE_SUMMARY_MODEL_TYPE = "GROQ"
            mock_settings.KNOWLEDGE_SUMMARY_MODEL_NAME = "llama-3.1-8b-instant"
            mock_settings.KNOWLEDGE_SUMMARY_API_KEY = "test_api_key"
            mock_settings.KNOWLEDGE_SUMMARY_MAX_TOKENS = 4000

            # Reset the global instance
            import app.knowledge.content_summarizer
            app.knowledge.content_summarizer._summarizer = None

            # Get the instance twice
            instance1 = get_content_summarizer()
            instance2 = get_content_summarizer()

            # Verify it's the same instance
            assert instance1 is instance2

    def test_summarizer_instructions_include_url_preservation(self):
        """Test that the summarizer instructions emphasize URL preservation"""
        with patch('app.knowledge.content_summarizer.settings') as mock_settings, \
             patch('app.knowledge.content_summarizer.create_model') as mock_create_model, \
             patch('app.knowledge.content_summarizer.Agent') as mock_agent_class:
            mock_settings.KNOWLEDGE_SUMMARY_ENABLED = True
            mock_settings.KNOWLEDGE_SUMMARY_MODEL_TYPE = "GROQ"
            mock_settings.KNOWLEDGE_SUMMARY_MODEL_NAME = "llama-3.1-8b-instant"
            mock_settings.KNOWLEDGE_SUMMARY_API_KEY = "test_api_key"
            mock_settings.KNOWLEDGE_SUMMARY_MAX_TOKENS = 4000
            mock_settings.ENVIRONMENT = "development"

            # Mock the model
            mock_model = MagicMock()
            mock_create_model.return_value = mock_model

            # Mock the agent
            mock_agent_instance = MagicMock()
            mock_agent_class.return_value = mock_agent_instance

            summarizer = ContentSummarizer()
            summarizer._get_agent()

            # Verify Agent was called with instructions containing URL preservation
            assert mock_agent_class.called
            call_kwargs = mock_agent_class.call_args.kwargs
            instructions = call_kwargs['instructions']

            # Check that instructions emphasize URL preservation
            assert 'PRESERVING ALL URLs' in instructions
            assert 'Product URLs' in instructions
            assert 'DO NOT remove, shorten, or modify ANY URLs' in instructions


class TestChatAgentURLInstructions:
    """Test suite for verifying chat agent includes URL instructions"""

    def test_chat_agent_includes_url_instructions(self):
        """Test that chat agent instructions include URL preservation"""
        from app.agents.chat_agent import ChatAgent
        from uuid import uuid4

        # Mock all database and external dependencies
        with patch('app.agents.chat_agent.SessionLocal') as mock_session_local, \
             patch('app.tools.knowledge_search_byagent.SessionLocal') as mock_knowledge_session_local, \
             patch('app.agents.chat_agent.JiraRepository') as mock_jira_repo, \
             patch('app.agents.chat_agent.AgentShopifyConfigRepository') as mock_shopify_repo, \
             patch('app.agents.chat_agent.PostgresAgentStorage') as mock_storage, \
             patch('app.agents.chat_agent.create_model') as mock_create_model, \
             patch('app.agents.chat_agent.Agent') as mock_agent_class, \
             patch('app.tools.knowledge_search_byagent.AIConfigRepository') as mock_ai_config_repo:

            # Mock database session
            mock_db = MagicMock()
            mock_session_local.return_value.__enter__.return_value = mock_db
            mock_session_local.return_value.__exit__.return_value = None

            # Mock knowledge search database session
            mock_knowledge_session_local.return_value.__enter__.return_value = mock_db
            mock_knowledge_session_local.return_value.__exit__.return_value = None

            # Mock AI config repository
            mock_ai_config_repo.return_value.get_active_config.return_value = None

            # Mock Jira repository
            from app.models.schemas.jira import AgentWithJiraConfig
            from app.models.agent import AgentType

            mock_agent_data = AgentWithJiraConfig(
                id=uuid4(),
                name="Test Agent",
                display_name="Test Agent",
                description="Test",
                instructions=["You are a helpful assistant"],
                tools=[],
                agent_type=AgentType.CUSTOMER_SUPPORT,
                is_default=False,
                is_active=True,
                organization_id=uuid4(),
                transfer_to_human=False,
                ask_for_rating=False,
                knowledge=[],
                jira_enabled=False,
                jira_project_key=None,
                jira_issue_type_id=None,
                groups=[],
                organization=None
            )

            mock_jira_repo.return_value.get_agent_with_jira_config.return_value = mock_agent_data
            mock_shopify_repo.return_value.get_agent_shopify_config.return_value = None

            # Mock storage and model
            mock_storage.return_value = MagicMock()
            mock_create_model.return_value = MagicMock()
            mock_agent_instance = MagicMock()
            mock_agent_class.return_value = mock_agent_instance

            # Create chat agent
            chat_agent = ChatAgent(
                api_key="test_key",
                model_name="gpt-4",
                model_type="OPENAI",
                org_id=str(uuid4()),
                agent_id=str(mock_agent_data.id),
                session_id=str(uuid4())
            )

            # Verify Agent was called with instructions containing URL guidance
            assert mock_agent_class.called
            call_kwargs = mock_agent_class.call_args.kwargs
            instructions = call_kwargs['instructions']

            # Check that instructions include URL preservation guidance
            assert 'Include URLs in Responses' in instructions or 'MUST include these URLs' in instructions
            assert 'URLs' in instructions
