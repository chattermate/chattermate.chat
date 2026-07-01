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
from unittest.mock import MagicMock
from app.utils.response_parser import (
    parse_response_content,
    extract_json_from_text,
    clean_malformed_output,
    extract_fields_from_text,
    create_basic_chat_response
)
from app.models.schemas.chat import ChatResponse

# Test Data
VALID_JSON_RESPONSE = {
    "message": "Hello, how can I help?",
    "transfer_to_human": False,
    "end_chat": False,
    "transfer_reason": None,
    "transfer_description": None,
    "request_rating": False,
    "create_ticket": False
}

VALID_JSON_STRING = '''
{
    "message": "Hello, how can I help?",
    "transfer_to_human": false,
    "end_chat": false,
    "transfer_reason": null,
    "transfer_description": null,
    "request_rating": false,
    "create_ticket": false
}
'''

MALFORMED_JSON_STRING = '''
truefalse{
    "message": "Hello, how can I help?",
    "transfer_to_human": true,
    "end_chat": false,
    "transfer_reason": null,
    "transfer_description": null,
    "request_rating": false,
    "create_ticket": false
}truefalse
'''

TRANSFER_TEXT = '''
I need to transfer this chat to a human agent.
<transfer_reason>Technical Issue</transfer_reason>
<transfer_description>User needs help with advanced configuration.</transfer_description>
TRANSFER_REQUEST
'''

class TestParseResponseContent:
    def test_with_dict_content_attribute(self):
        """Test parsing response with content attribute containing a dictionary"""
        mock_response = MagicMock()
        mock_response.content = VALID_JSON_RESPONSE
        result = parse_response_content(mock_response)
        
        assert isinstance(result, ChatResponse)
        assert result.message == "Hello, how can I help?"
        assert result.transfer_to_human is False
        assert result.end_chat is False
    
    def test_with_string_content_attribute(self):
        """Test parsing response with content attribute containing a string"""
        mock_response = MagicMock()
        mock_response.content = VALID_JSON_STRING
        result = parse_response_content(mock_response)
        
        assert isinstance(result, ChatResponse)
        assert result.message == "Hello, how can I help?"
        assert result.transfer_to_human is False
    
    def test_with_direct_dict(self):
        """Test parsing direct dictionary response"""
        result = parse_response_content(VALID_JSON_RESPONSE)
        
        assert isinstance(result, ChatResponse)
        assert result.message == "Hello, how can I help?"
        assert result.transfer_to_human is False
    
    def test_with_direct_string(self):
        """Test parsing direct string response"""
        result = parse_response_content(VALID_JSON_STRING)
        
        assert isinstance(result, ChatResponse)
        assert result.message == "Hello, how can I help?"
        assert result.transfer_to_human is False
    
    def test_with_invalid_input(self):
        """Test parsing invalid input"""
        result = parse_response_content(None)
        
        assert isinstance(result, ChatResponse)
        assert result.message == "No response generated"
        assert result.transfer_to_human is False

class TestExtractJsonFromText:
    def test_valid_json_extraction(self):
        """Test extracting valid JSON from text"""
        result = extract_json_from_text(VALID_JSON_STRING)
        
        assert isinstance(result, ChatResponse)
        assert result.message == "Hello, how can I help?"
        assert result.transfer_to_human is False
    
    def test_malformed_json_extraction(self):
        """Test extracting JSON from malformed text"""
        result = extract_json_from_text(MALFORMED_JSON_STRING)
        
        assert isinstance(result, ChatResponse)
        assert result.message == "Hello, how can I help?"
        assert result.transfer_to_human is True
    
    def test_no_json_extraction(self):
        """Test handling text without JSON"""
        text = "Simple text without JSON"
        result = extract_json_from_text(text)
        
        assert isinstance(result, ChatResponse)
        assert result.message == text
        assert result.transfer_to_human is False
    
    def test_partial_json_extraction(self):
        """Test extracting partial JSON from text"""
        text = "Some text before { 'message': 'Hello' } and after"
        result = extract_json_from_text(text)
        
        assert isinstance(result, ChatResponse)
        assert "Hello" in result.message

class TestCleanMalformedOutput:
    def test_clean_truefalse_patterns(self):
        """Test cleaning truefalse patterns"""
        text = "truefalseHello worldtruefalse"
        result = clean_malformed_output(text)
        
        assert "truefalseHello" not in result
        assert "worldtruefalse" not in result
        assert "Hello world" in result
    
    def test_preserve_valid_true_false(self):
        """Test preserving valid true/false values"""
        text = '{"key": true, "other": false}'
        result = clean_malformed_output(text)
        
        assert '"key": true' in result
        assert '"other": false' in result

class TestExtractFieldsFromText:
    def test_extract_transfer_fields(self):
        """Test extracting transfer-related fields"""
        result = extract_fields_from_text(TRANSFER_TEXT)
        
        assert result["transfer_to_human"] is True
        assert result["transfer_reason"] == "Technical Issue"
        assert result["transfer_description"] == "User needs help with advanced configuration."
        assert "message" in result
    
    def test_extract_direct_request(self):
        """Test extracting direct request transfer"""
        text = "Please help me. DIRECT_REQUEST"
        result = extract_fields_from_text(text)
        
        assert result["transfer_to_human"] is True
        assert result["transfer_reason"] == "DIRECT_REQUEST"
        assert "message" in result
    
    def test_extract_end_chat(self):
        """Test extracting end chat flag"""
        text = "Goodbye! end_chat_reason: session ended"
        result = extract_fields_from_text(text)
        
        assert result["end_chat"] is True
        assert "message" in result

class TestCreateBasicChatResponse:
    def test_basic_response(self):
        """Test creating basic chat response"""
        message = "Hello, how can I help?"
        result = create_basic_chat_response(message)
        
        assert isinstance(result, ChatResponse)
        assert result.message == message
        assert result.transfer_to_human is False
        assert result.end_chat is False
        assert result.transfer_reason is None
        assert result.transfer_description is None
        assert result.request_rating is False
        assert result.create_ticket is False
    
    def test_transfer_response(self):
        """Test creating response with transfer flag"""
        message = "Need help! TRANSFER_REQUEST"
        result = create_basic_chat_response(message)
        
        assert isinstance(result, ChatResponse)
        assert result.message == message
        assert result.transfer_to_human is True
        assert result.end_chat is False
    
    def test_direct_request_response(self):
        """Test creating response with direct request"""
        message = "Connect to agent DIRECT_REQUEST"
        result = create_basic_chat_response(message)
        
        assert isinstance(result, ChatResponse)
        assert result.message == message
        assert result.transfer_to_human is True
        assert result.end_chat is False 