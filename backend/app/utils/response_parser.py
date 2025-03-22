"""
ChatterMate - Response Parser Utility
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

import json
import re
from typing import Any, Dict, Optional, Union
from app.core.logger import get_logger
from app.models.schemas.chat import ChatResponse

logger = get_logger(__name__)

def parse_response_content(response: Any) -> ChatResponse:
    """
    Parse the response content from the LLM into a ChatResponse object.
    Handles various response formats including dictionaries and strings.
    
    Args:
        response: The response from the LLM, which can be in various formats
        
    Returns:
        ChatResponse: A properly formatted ChatResponse object
    """
    response_content = None
    
    # Handle response with content attribute (common in Agno responses)
    if hasattr(response, 'content'):
        # If content is a dictionary, directly convert to ChatResponse
        if isinstance(response.content, dict):
            response_content = ChatResponse(**response.content)
        # If content is a string, attempt to extract and parse JSON
        elif isinstance(response.content, str):
            try:
                logger.info(f"Response content is string: {response.content}")
                response_content = extract_json_from_text(response.content)
            except Exception as e:
                logger.error(f"Failed to parse response content: {e}")
                response_content = create_basic_chat_response(response.content)
        # Use content directly if not dict or string
        else:
            response_content = response.content
    # Handle direct response (not wrapped in content attribute)
    else:
        # If response is a dictionary, directly convert to ChatResponse
        if isinstance(response, dict):
            response_content = ChatResponse(**response)
        # If response is a string, attempt to extract and parse JSON
        elif isinstance(response, str):
            try:
                response_content = extract_json_from_text(response)
            except Exception as e:
                logger.error(f"Failed to parse response: {e}")
                response_content = create_basic_chat_response(response)
        # Use response directly if not dict or string
        else:
            response_content = response
    
    # If we still don't have a proper response_content, create a basic one
    if not isinstance(response_content, ChatResponse):
        text_content = str(response_content) if response_content else "No response generated"
        response_content = create_basic_chat_response(text_content)
    
    return response_content

def extract_json_from_text(text: str) -> ChatResponse:
    """
    Extract JSON from a string and convert it to a ChatResponse object.
    
    Args:
        text: The text containing JSON
        
    Returns:
        ChatResponse: A properly formatted ChatResponse object
    """
    # Clean up the text by removing true/false values outside JSON structure
    cleaned_text = clean_malformed_output(text)
    
    # Try to extract JSON in multiple ways
    content_dict = None
    
    # Method 1: Use regex to find JSON-like structure
    json_pattern = r'({.*})'
    match = re.search(json_pattern, cleaned_text, re.DOTALL)
    if match:
        try:
            json_str = match.group(1)
            content_dict = json.loads(json_str)
            logger.debug(f"Extracted JSON using regex: {content_dict}")
        except json.JSONDecodeError:
            logger.debug("Failed to extract JSON using regex")
    
    # Method 2: Find JSON by braces (if regex didn't work)
    if not content_dict:
        start_idx = cleaned_text.find('{')
        end_idx = cleaned_text.rfind('}') + 1
        if start_idx != -1 and end_idx != -1:
            try:
                json_str = cleaned_text[start_idx:end_idx]
                content_dict = json.loads(json_str)
                logger.debug(f"Extracted JSON using braces: {content_dict}")
            except json.JSONDecodeError:
                logger.debug("Failed to extract JSON using braces")
    
    # If we failed to extract valid JSON, try to parse potential field values from the text
    if not content_dict:
        content_dict = extract_fields_from_text(cleaned_text)
    
    # If we successfully extracted a dictionary
    if content_dict:
        return ChatResponse(**content_dict)
    
    # If no JSON structure found, create a basic response
    return create_basic_chat_response(cleaned_text)

def clean_malformed_output(text: str) -> str:
    """
    Clean up malformed output with true/false values outside JSON structure.
    
    Args:
        text: The text to clean
        
    Returns:
        str: Cleaned text
    """
    # Replace patterns like "truefalse" with proper JSON values
    # This regex finds patterns like "truefalseXXX" and removes them
    text = re.sub(r'(true|false)(true|false)', ' ', text)
    
    # Replace literal "true" and "false" that appear outside of quotes
    def replace_literals(match):
        value = match.group(0)
        if value == "true":
            return "true"
        elif value == "false":
            return "false"
        return value
    
    # This is a simplified approach - a more robust solution would need to
    # identify whether true/false is inside quotes or not
    text = re.sub(r'\b(true|false)\b', replace_literals, text)
    
    return text

def extract_fields_from_text(text: str) -> Dict[str, Any]:
    """
    Extract field values from text when JSON parsing fails.
    
    Args:
        text: The text to extract field values from
        
    Returns:
        Dict[str, Any]: Dictionary of extracted fields
    """
    fields = {}
    
    # Extract message content - everything before any markers
    message_match = re.search(r'^(.*?)(?:true|false|<|$)', text, re.DOTALL)
    if message_match:
        fields['message'] = message_match.group(1).strip()
    
    # Extract transfer_to_human
    if 'TRANSFER_REQUEST' in text or 'DIRECT_REQUEST' in text:
        fields['transfer_to_human'] = True
    
    # Extract transfer reason if present
    reason_match = re.search(r'<transfer_reason>(.*?)</transfer_reason>', text)
    if reason_match:
        fields['transfer_reason'] = reason_match.group(1)
    elif 'DIRECT_REQUEST' in text:
        fields['transfer_reason'] = 'DIRECT_REQUEST'
    
    # Extract transfer description if present
    desc_match = re.search(r'<transfer_description>(.*?)</transfer_description>', text)
    if desc_match:
        fields['transfer_description'] = desc_match.group(1)
    
    # Extract end_chat flags
    if 'end_chat_reason' in text:
        fields['end_chat'] = True
    
    return fields

def create_basic_chat_response(message: str) -> ChatResponse:
    """
    Create a basic ChatResponse with default values.
    
    Args:
        message: The message content
        
    Returns:
        ChatResponse: A ChatResponse object with the message and default values
    """
    # Extract possible flags from the message
    transfer_to_human = False
    if "TRANSFER_REQUEST" in message or "DIRECT_REQUEST" in message:
        transfer_to_human = True
        
    return ChatResponse(
        message=message,
        transfer_to_human=transfer_to_human,
        end_chat=False,
        transfer_reason=None,
        transfer_description=None,
        request_rating=False,
        create_ticket=False
    ) 