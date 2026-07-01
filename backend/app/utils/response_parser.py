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
    
    try:
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
    except Exception as e:
        logger.error(f"Error in parse_response_content: {e}")
        return create_basic_chat_response(str(response) if response else "Error processing response")
    
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
    
    # Method 1: Handle simple JSON format first
    if cleaned_text.startswith('{') and '}' in cleaned_text:
        try:
            # Try to find a valid JSON substring
            end_idx = cleaned_text.find('}') + 1
            json_str = cleaned_text[:end_idx]
            content_dict = json.loads(json_str)
            logger.debug(f"Extracted complete JSON: {content_dict}")
        except json.JSONDecodeError:
            # If fails, try to handle trailing characters
            try:
                # Find all closing braces
                all_brace_positions = [pos for pos, char in enumerate(cleaned_text) if char == '}']
                
                # Try each closing brace position until we find a valid JSON
                for end_pos in all_brace_positions:
                    try:
                        json_str = cleaned_text[:end_pos + 1]
                        content_dict = json.loads(json_str)
                        logger.debug(f"Extracted JSON with truncation at position {end_pos}: {content_dict}")
                        break
                    except json.JSONDecodeError:
                        continue
            except Exception as e:
                logger.debug(f"Failed to extract JSON with truncation: {e}")
    
    # Method 2: Handle function call format (e.g., function=search_knowledge_base>{"query": "the dal"} </function>)
    if not content_dict:
        function_pattern = r'function=(\w+)>({.*?})\s*</function>'
        function_match = re.search(function_pattern, cleaned_text, re.DOTALL)
        if function_match:
            try:
                function_name = function_match.group(1)
                function_params = json.loads(function_match.group(2))
                logger.debug(f"Found function call: {function_name} with params: {function_params}")
                # If this is a knowledge base search, we'll create a basic response
                if function_name == 'search_knowledge_base':
                    # The rest of the response after the function call should be the actual content
                    rest_of_text = cleaned_text.split('</function>', 1)
                    if len(rest_of_text) > 1 and rest_of_text[1].strip():
                        content = rest_of_text[1].strip()
                        try:
                            # Try to parse the content as JSON
                            content_dict = json.loads(content)
                            logger.debug(f"Parsed content after function call as JSON: {content_dict}")
                        except json.JSONDecodeError:
                            # If it's not valid JSON, use it as a plain message
                            logger.debug(f"Content after function call is not valid JSON, using as message")
                            content_dict = {"message": content}
                    else:
                        # If there's no content after the function call, use the query as a message
                        content_dict = {"message": f"Query: {function_params.get('query', 'No query specified')}"}
            except json.JSONDecodeError:
                logger.debug("Failed to extract function parameters as JSON")
    
    # Method 3: Use regex to find JSON-like structure
    if not content_dict:
        json_pattern = r'({.*?})'
        match = re.search(json_pattern, cleaned_text, re.DOTALL)
        if match:
            try:
                json_str = match.group(1)
                content_dict = json.loads(json_str)
                logger.debug(f"Extracted JSON using regex: {content_dict}")
            except json.JSONDecodeError:
                logger.debug("Failed to extract JSON using regex")
    
    # Method 4: Find JSON by braces (if previous methods didn't work)
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
        try:
            return ChatResponse(**content_dict)
        except Exception as e:
            logger.error(f"Failed to create ChatResponse from dictionary: {e}")
            # In case of error, use the content dict's message or the original text
            message = content_dict.get('message', cleaned_text)
            return create_basic_chat_response(message)
    
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
    original_text = text
    
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
    
    # Fix malformed image objects in shopify_output
    # Pattern 1: "src":"url"}," followed by whitespace/newlines and then ,"alt" 
    # Should be: "src":"url","alt"
    before_fix = text
    # This handles: }," \n\n                ,"alt"
    text = re.sub(r'(\"src\":\"[^\"]+\")\}[,\s\n]*,[,\s\n]*\"alt\"', r'\1,"alt"', text, flags=re.MULTILINE)
    if text != before_fix:
        logger.warning("Fixed malformed image object: },' with newlines before 'alt' pattern")
    
    # Pattern 2: }," followed by whitespace/newlines and comma before next field
    before_fix = text
    text = re.sub(r'\}[,\s\n]+,[,\s\n]*\"', ',"', text, flags=re.MULTILINE)
    if text != before_fix:
        logger.warning("Fixed malformed JSON: },' with newlines pattern")
    
    # Pattern 3: Fix pattern where closing brace appears after URL before comma
    # "image":{"src":"url"}," should be "image":{"src":"url",
    before_fix = text
    text = re.sub(r'(\"image\":\{\"src\":\"[^\"]+\")\},[,\s\n]*\"', r'\1,"', text, flags=re.MULTILINE)
    if text != before_fix:
        logger.warning("Fixed malformed image closing brace pattern")
    
    if text != original_text:
        logger.debug(f"Cleaned JSON from: {original_text[:200]}... to: {text[:200]}...")
    
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