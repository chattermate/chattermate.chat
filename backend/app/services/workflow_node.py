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

from typing import List, Dict, Any, Optional
from uuid import UUID
import uuid
import re
from sqlalchemy.orm import Session
from app.repositories.workflow_node import WorkflowNodeRepository
from app.repositories.workflow import WorkflowRepository

from app.core.logger import get_logger

logger = get_logger(__name__)


def sanitize_utf8_text(text: str) -> str:
    """
    Sanitize text to remove invalid UTF-8 characters and surrogates
    """
    if not text:
        return text
    
    # Remove surrogate characters (like \udcac, \udd16)
    text = re.sub(r'[\ud800-\udfff]', '', text)
    
    # Encode to UTF-8 and decode to handle any remaining issues
    try:
        text = text.encode('utf-8', errors='ignore').decode('utf-8')
    except UnicodeError:
        # If still failing, remove all non-ASCII characters
        text = re.sub(r'[^\x00-\x7F]', '', text)
    
    return text.strip()


class WorkflowNodeService:
    def __init__(self, db: Session):
        self.db = db
        self.node_repo = WorkflowNodeRepository(db)
        self.workflow_repo = WorkflowRepository(db)
    
    def _generate_unique_node_name(self, workflow_id: UUID, base_name: str, exclude_node_id: UUID = None) -> str:
        """
        Generate a unique node name by appending _001, _002, etc. if needed
        
        Args:
            workflow_id: The workflow ID to check within
            base_name: The base name to make unique
            exclude_node_id: Node ID to exclude from uniqueness check (for updates)
            
        Returns:
            Unique node name
        """
        try:
            # Get all existing nodes in the workflow
            workflow = self.workflow_repo.get_by_id(workflow_id)
            if not workflow:
                return base_name
            
            existing_names = set()
            for node in workflow.nodes:
                if exclude_node_id and node.id == exclude_node_id:
                    continue  # Skip the node being updated
                if node.name:
                    existing_names.add(node.name.lower())
            
            # Check if base name is already unique
            if base_name.lower() not in existing_names:
                return base_name
            
            # Generate unique name with suffix
            counter = 1
            while True:
                candidate_name = f"{base_name}_{counter:03d}"
                if candidate_name.lower() not in existing_names:
                    return candidate_name
                counter += 1
                
                # Safety check to prevent infinite loop
                if counter > 999:
                    # Fallback to UUID suffix
                    return f"{base_name}_{str(uuid.uuid4())[:8]}"
                    
        except Exception as e:
            logger.error(f"Error generating unique node name: {str(e)}")
            # Fallback to original name with UUID suffix
            return f"{base_name}_{str(uuid.uuid4())[:8]}"
    
    def _validate_node_name_uniqueness(self, workflow_id: UUID, node_name: str, exclude_node_id: UUID = None) -> bool:
        """
        Validate that a node name is unique within the workflow
        
        Args:
            workflow_id: The workflow ID to check within
            node_name: The name to validate
            exclude_node_id: Node ID to exclude from uniqueness check (for updates)
            
        Returns:
            True if name is unique, False otherwise
        """
        try:
            workflow = self.workflow_repo.get_by_id(workflow_id)
            if not workflow:
                return True
            
            for node in workflow.nodes:
                if exclude_node_id and node.id == exclude_node_id:
                    continue  # Skip the node being updated
                if node.name and node.name.lower() == node_name.lower():
                    return False
            
            return True
            
        except Exception as e:
            logger.error(f"Error validating node name uniqueness: {str(e)}")
            return False

    def _ensure_unicode_support_in_config(self, config: dict) -> dict:
        """
        Ensure Unicode characters are properly preserved in config data
        by applying JSON serialization with ensure_ascii=False
        """
        import json
        import copy
        
        if not config:
            return config
            
        try:
            # Create a deep copy to avoid modifying the original
            config_copy = copy.deepcopy(config)
            
            # Convert to JSON with ensure_ascii=False to preserve Unicode characters
            # Then parse it back to ensure it's properly formatted for database storage
            json_str = json.dumps(config_copy, ensure_ascii=False, separators=(',', ':'))
            unicode_safe_config = json.loads(json_str)
            
            logger.debug(f"Applied Unicode-safe processing to config: {len(str(config_copy))} chars -> {len(str(unicode_safe_config))} chars")
            return unicode_safe_config
            
        except Exception as e:
            logger.error(f"Error applying Unicode-safe processing to config: {str(e)}")
            return config

    def replace_workflow_nodes_and_connections(
        self, 
        workflow_id: UUID, 
        nodes_data: List[Dict[str, Any]], 
        connections_data: List[Dict[str, Any]], 
        organization_id: UUID
    ) -> Dict[str, List]:
        """Replace all workflow nodes and connections with cached data (delete existing, create new)"""
        
        # Validate workflow exists and belongs to organization
        workflow = self.workflow_repo.get_by_id(workflow_id)
        if not workflow:
            raise ValueError("Workflow not found")
        
        if workflow.organization_id != organization_id:
            raise ValueError("Workflow does not belong to your organization")
        
        try:
            # Delete all existing connections first (due to foreign key constraints)
            existing_connections = self.node_repo.get_connections_by_workflow(workflow_id)
            for connection in existing_connections:
                self.db.delete(connection)
            
            # Delete all existing nodes
            existing_nodes = self.node_repo.get_nodes_by_workflow(workflow_id)
            for node in existing_nodes:
                self.db.delete(node)
            
            # Commit deletions
            self.db.commit()
            
            logger.info(f"Deleted {len(existing_nodes)} existing nodes and {len(existing_connections)} existing connections for workflow {workflow_id}")
            
            # Create ID mapping for text IDs to UUIDs
            id_mapping = {}
            
            def is_text_id(node_id: str) -> bool:
                """Check if ID is a text ID (like message-1, llm-2) instead of UUID"""
                try:
                    UUID(node_id)
                    return False
                except ValueError:
                    return True
            
            # First pass: Create ID mappings for text IDs
            for node_data in nodes_data:
                node_id = str(node_data.get('id', ''))
                if node_id and is_text_id(node_id):
                    if node_id not in id_mapping:
                        id_mapping[node_id] = str(uuid.uuid4())
                        logger.info(f"Mapped text ID '{node_id}' to UUID '{id_mapping[node_id]}'")
            
            # Also create mappings for connection IDs if they are text IDs
            for conn_data in connections_data:
                conn_id = str(conn_data.get('id', ''))
                if conn_id and is_text_id(conn_id):
                    if conn_id not in id_mapping:
                        id_mapping[conn_id] = str(uuid.uuid4())
                        logger.info(f"Mapped connection text ID '{conn_id}' to UUID '{id_mapping[conn_id]}'")
            
            # Create all new nodes
            created_nodes = []
            for node_data in nodes_data:
                node_data_copy = node_data.copy()
                node_data_copy['workflow_id'] = workflow_id
                
                # Convert workflow_id to UUID if it's a string
                if isinstance(node_data_copy['workflow_id'], str):
                    node_data_copy['workflow_id'] = UUID(node_data_copy['workflow_id'])
                
                # Extract and clean node-specific fields into config
                config_fields = [
                    'message_text', 'system_prompt', 'temperature', 'model_id',
                    'condition_expression', 'action_type', 'action_url', 'action_config',
                    'transfer_department', 'transfer_message', 'transfer_rules',
                    'wait_duration', 'wait_unit', 'wait_until_condition',
                    'final_message', 'form_fields', 'form_title', 'form_description', 
                    'submit_button_text', 'form_full_screen',
                    'landing_page_heading', 'landing_page_content',
                    'enabled_guardrails', 'pii_action', 'jailbreak_sensitivity', 
                    'text_source', 'block_message'
                ]
                
                # Initialize config if not present
                if 'config' not in node_data_copy:
                    node_data_copy['config'] = {}
                
                # Move config fields from root to config object and filter out blank values
                for field in config_fields:
                    if field in node_data_copy:
                        value = node_data_copy[field]
                        # Only add non-blank values to config
                        if value is not None and value != "" and value != []:
                            node_data_copy['config'][field] = value
                        # Remove from root level
                        del node_data_copy[field]
                
                # Apply Unicode-safe processing to the entire config to handle multi-language content
                node_data_copy['config'] = self._ensure_unicode_support_in_config(node_data_copy['config'])
                
                # Sanitize text fields to prevent UTF-8 encoding errors
                base_text_fields = ['name', 'description']
                for field in base_text_fields:
                    if field in node_data_copy and isinstance(node_data_copy[field], str):
                        node_data_copy[field] = sanitize_utf8_text(node_data_copy[field])
                
                # Sanitize config text fields
                config_text_fields = ['message_text', 'system_prompt', 'condition_expression', 
                                     'action_type', 'action_url', 'transfer_department', 'transfer_message',
                                     'final_message', 'form_title', 'form_description', 'submit_button_text',
                                     'landing_page_heading', 'landing_page_content', 'text_source', 'block_message']
                for field in config_text_fields:
                    if field in node_data_copy['config'] and isinstance(node_data_copy['config'][field], str):
                        node_data_copy['config'][field] = sanitize_utf8_text(node_data_copy['config'][field])
                
                # Replace text ID with UUID if mapped
                original_id = str(node_data_copy.get('id', ''))
                if original_id in id_mapping:
                    node_data_copy['id'] = id_mapping[original_id]
                elif 'id' not in node_data_copy or not node_data_copy['id']:
                    # Generate new ID if not provided
                    node_data_copy['id'] = uuid.uuid4()
                else:
                    # Convert string ID to UUID
                    node_data_copy['id'] = UUID(str(node_data_copy['id']))
                
                # Filter out any remaining None or empty values from base fields
                filtered_data = {}
                for key, value in node_data_copy.items():
                    if value is not None and value != "":
                        filtered_data[key] = value
                
                new_node = self.node_repo.create_node(**filtered_data)
                created_nodes.append(new_node)
            
            # Commit node creations before processing connections
            self.db.commit()
            
            # Create all new connections
            created_connections = []
            for conn_data in connections_data:
                conn_data_copy = conn_data.copy()
                conn_data_copy['workflow_id'] = workflow_id
                
                # Convert workflow_id to UUID if it's a string
                if isinstance(conn_data_copy['workflow_id'], str):
                    conn_data_copy['workflow_id'] = UUID(conn_data_copy['workflow_id'])
                
                # Sanitize text fields to prevent UTF-8 encoding errors
                text_fields = ['label', 'condition']
                for field in text_fields:
                    if field in conn_data_copy and isinstance(conn_data_copy[field], str):
                        conn_data_copy[field] = sanitize_utf8_text(conn_data_copy[field])
                
                # Replace text ID with UUID if mapped
                original_id = str(conn_data_copy.get('id', ''))
                if original_id in id_mapping:
                    conn_data_copy['id'] = id_mapping[original_id]
                elif 'id' not in conn_data_copy or not conn_data_copy['id']:
                    # Generate new ID if not provided
                    conn_data_copy['id'] = uuid.uuid4()
                else:
                    # Convert string ID to UUID
                    conn_data_copy['id'] = UUID(str(conn_data_copy['id']))
                
                # Map source and target node IDs if they are text IDs
                source_node_id = str(conn_data_copy.get('source_node_id', ''))
                if source_node_id in id_mapping:
                    conn_data_copy['source_node_id'] = id_mapping[source_node_id]
                
                target_node_id = str(conn_data_copy.get('target_node_id', ''))
                if target_node_id in id_mapping:
                    conn_data_copy['target_node_id'] = id_mapping[target_node_id]
                
                # Convert source and target node IDs to UUIDs
                if 'source_node_id' in conn_data_copy:
                    conn_data_copy['source_node_id'] = UUID(str(conn_data_copy['source_node_id']))
                if 'target_node_id' in conn_data_copy:
                    conn_data_copy['target_node_id'] = UUID(str(conn_data_copy['target_node_id']))
                
                new_conn = self.node_repo.create_connection(**conn_data_copy)
                created_connections.append(new_conn)
            
            # Final commit for connections
            self.db.commit()
            
            logger.info(f"Created {len(created_nodes)} new nodes and {len(created_connections)} new connections for workflow {workflow_id}")
            
            # Return all current nodes and connections
            final_nodes = self.node_repo.get_nodes_by_workflow(workflow_id)
            final_connections = self.node_repo.get_connections_by_workflow(workflow_id)
            
            return {
                "nodes": final_nodes,
                "connections": final_connections
            }
            
        except Exception as e:
            logger.error(f"Error replacing workflow nodes and connections: {str(e)}")
            self.db.rollback()
            raise

    def get_workflow_nodes_and_connections(self, workflow_id: UUID, organization_id: UUID) -> Dict[str, List]:
        """Get all nodes and connections for a workflow"""
        
        # Validate workflow exists and belongs to organization
        workflow = self.workflow_repo.get_by_id(workflow_id)
        if not workflow:
            raise ValueError("Workflow not found")
        
        if workflow.organization_id != organization_id:
            raise ValueError("Workflow does not belong to your organization")
        
        nodes = self.node_repo.get_nodes_by_workflow(workflow_id)
        connections = self.node_repo.get_connections_by_workflow(workflow_id)
        
        return {
            "nodes": nodes,
            "connections": connections
        }

    def update_single_node(
        self, 
        workflow_id: UUID, 
        node_id: UUID, 
        node_data: Dict[str, Any], 
        organization_id: UUID = None
    ) -> Dict[str, Any]:
        """Update a single workflow node with its properties"""
        
        # Validate workflow exists and belongs to organization
        workflow = self.workflow_repo.get_by_id(workflow_id)
        if not workflow:
            raise ValueError("Workflow not found")
        
        if organization_id and workflow.organization_id != organization_id:
            raise ValueError("Workflow does not belong to your organization")
        
        # Validate node exists and belongs to workflow
        node = self.node_repo.get_node_by_id(node_id)
        if not node:
            raise ValueError("Node not found")
        
        if node.workflow_id != workflow_id:
            raise ValueError("Node does not belong to this workflow")
        
        try:
            logger.debug(f"Node data: {node_data}")
            # Sanitize text fields to prevent UTF-8 encoding errors
            node_data_copy = node_data.copy()
            text_fields = ['name', 'description', 'message_text', 'system_prompt', 
                          'condition_expression', 'action_type']
            for field in text_fields:
                if field in node_data_copy and isinstance(node_data_copy[field], str):
                    node_data_copy[field] = sanitize_utf8_text(node_data_copy[field])
            
            # Validate and ensure unique node name
            if 'name' in node_data_copy and node_data_copy['name']:
                if not self._validate_node_name_uniqueness(workflow_id, node_data_copy['name'], node_id):
                    # Generate unique name if not unique
                    node_data_copy['name'] = self._generate_unique_node_name(workflow_id, node_data_copy['name'], node_id)
                    logger.info(f"Generated unique node name: {node_data_copy['name']}")
            
            # Apply Unicode-safe processing to config if present
            if 'config' in node_data_copy and isinstance(node_data_copy['config'], dict):
                node_data_copy['config'] = self._ensure_unicode_support_in_config(node_data_copy['config'])
            
            logger.debug(f"Node data copy: {node_data_copy}")
            # Update node properties
            updated_node = self.node_repo.update_node(node_id, **node_data_copy)
            if not updated_node:
                raise ValueError("Failed to update node")
            
            # Commit changes
            self.db.commit()
            
            logger.info(f"Updated node {node_id}")
            
            return updated_node
            
        except Exception as e:
            logger.error(f"Error updating node {node_id}: {str(e)}")
            self.db.rollback()
            raise

    def get_single_node(self, workflow_id: UUID, node_id: UUID, organization_id: UUID = None):
        """Get a single node"""
        
        # Validate workflow exists and belongs to organization
        workflow = self.workflow_repo.get_by_id(workflow_id)
        if not workflow:
            raise ValueError("Workflow not found")
        
        if organization_id and workflow.organization_id != organization_id:
            raise ValueError("Workflow does not belong to your organization")
        
        # Validate node exists and belongs to workflow
        node = self.node_repo.get_node_by_id(node_id)
        if not node:
            raise ValueError("Node not found")
        
        if node.workflow_id != workflow_id:
            raise ValueError("Node does not belong to this workflow")
        
        return node 