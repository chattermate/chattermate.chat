"""
ChatterMate - Content Summarizer
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

from typing import Optional
from agno.agent import Agent
from app.utils.agno_utils import create_model
from app.core.logger import get_logger
from app.core.config import settings

logger = get_logger(__name__)


class ContentSummarizer:
    """
    Service for summarizing web content using LLM to reduce token usage.
    Preserves important information and URLs for reference.
    """

    def __init__(self):
        """Initialize the content summarizer with configured model"""
        self.enabled = settings.KNOWLEDGE_SUMMARY_ENABLED
        self.model_type = settings.KNOWLEDGE_SUMMARY_MODEL_TYPE
        self.model_name = settings.KNOWLEDGE_SUMMARY_MODEL_NAME
        self.api_key = settings.KNOWLEDGE_SUMMARY_API_KEY
        self.max_tokens = settings.KNOWLEDGE_SUMMARY_MAX_TOKENS
        self._agent = None

        if self.enabled and not self.api_key:
            logger.warning("Content summarization is enabled but KNOWLEDGE_SUMMARY_API_KEY is not set. Summarization will be disabled.")
            self.enabled = False

    def _get_agent(self) -> Optional[Agent]:
        """Lazy initialization of the summarization agent"""
        if not self.enabled:
            return None

        if self._agent is None:
            try:
                model = create_model(
                    model_type=self.model_type,
                    api_key=self.api_key,
                    model_name=self.model_name,
                    max_tokens=self.max_tokens
                )

                self._agent = Agent(
                    name="Content Summarizer",
                    model=model,
                    instructions="""You are an expert content summarizer for a knowledge base system.

Your task is to summarize web page content while:
1. **PRESERVING ALL URLs** - This is CRITICAL. Every single URL mentioned in the content MUST be kept in the summary:
   - Product URLs
   - Reference URLs
   - Image URLs
   - Documentation URLs
   - Any links mentioned in the text
   DO NOT remove, shorten, or modify ANY URLs. Keep them exactly as they appear.

2. Preserving ALL important information needed to answer user questions:
   - Product names, descriptions, and details
   - Pricing and availability information
   - Technical specifications and features
   - Contact information and addresses
   - Instructions and procedures
   - Important facts and data points

3. Reducing only redundant and verbose text:
   - Remove excessive marketing language
   - Eliminate repetitive phrases
   - Condense wordy explanations
   - Remove filler content

4. Maintaining the original context and structure so users can:
   - Find specific products or information
   - Access the original URLs for more details
   - Get accurate answers to their questions

REMEMBER: URLs are the most critical element to preserve. Users need these links to access products and resources. Never remove or modify URLs under any circumstances.

Format your response as a concise summary that maintains all URLs and critical information.""",
                    markdown=False,
                    debug_mode=True
                )
                logger.info(f"Initialized content summarizer with model: {self.model_type}/{self.model_name}")
            except Exception as e:
                logger.error(f"Failed to initialize content summarizer: {str(e)}")
                self.enabled = False
                return None

        return self._agent

    def summarize(self, content: str, url: str) -> str:
        """
        Summarize content while preserving important information and URLs.

        Args:
            content: The original content to summarize
            url: The source URL for reference

        Returns:
            Summarized content or original content if summarization fails/disabled
        """
        # If summarization is disabled, return original content
        if not self.enabled:
            return content

        # If content is already short, don't summarize
        if len(content) < 1000:
            logger.debug(f"Content too short to summarize ({len(content)} chars), keeping original")
            return content

        try:
            agent = self._get_agent()
            if not agent:
                logger.warning("Summarization agent not available, using original content")
                return content

            # Create the summarization prompt
            prompt = f"""Summarize the following web page content from {url}:

Content:
{content}

CRITICAL REQUIREMENTS:
- **KEEP EVERY SINGLE URL EXACTLY AS IT APPEARS** - Do not remove, shorten, or modify any URLs
- Preserve all product URLs, reference links, and resource URLs
- Keep all important facts, product details, pricing, and specifications
- Maintain context for answering user questions
- Only reduce redundant/verbose text, never remove URLs or important information"""

            logger.info(f"Summarizing content from {url} ({len(content)} chars)")

            # Run the agent synchronously
            response = agent.run(message=prompt)

            # Extract the summary from response
            if hasattr(response, 'content') and response.content:
                summary = response.content
            elif isinstance(response, dict) and 'content' in response:
                summary = response['content']
            elif isinstance(response, str):
                summary = response
            else:
                logger.error(f"Unexpected response format from summarizer: {type(response)}")
                return content

            # Add source URL reference at the end if not already present
            if url not in summary:
                summary = f"{summary}\n\nSource: {url}"

            logger.info(f"Summarized content: {len(content)} -> {len(summary)} chars ({100*len(summary)/len(content):.1f}%)")

            return summary

        except Exception as e:
            logger.error(f"Error summarizing content from {url}: {str(e)}")
            logger.info("Falling back to original content")
            return content


# Global instance
_summarizer = None

def get_content_summarizer() -> ContentSummarizer:
    """Get or create the global content summarizer instance"""
    global _summarizer
    if _summarizer is None:
        _summarizer = ContentSummarizer()
    return _summarizer
