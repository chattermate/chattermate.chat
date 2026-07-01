/*
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
*/

export enum WorkflowStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived'
}

export enum ExitCondition {
  SINGLE_EXECUTION = 'single_execution',
  CONTINUOUS_EXECUTION = 'continuous_execution'
}

export interface WorkflowCreate {
  name: string
  description?: string
  agent_id: string
}

export interface WorkflowResponse {
  id: string
  name: string
  description?: string
  agent_id: string
  organization_id: string
  status: WorkflowStatus
  created_at: string
  updated_at: string
}

export interface WorkflowNode {
  id: string
  workflow_id: string
  node_type: string
  name: string
  description?: string
  position_x: number
  position_y: number
  config: Record<string, any>
  created_at: string
  updated_at: string
}

export interface WorkflowConnection {
  id: string
  workflow_id: string
  source_node_id: string
  target_node_id: string
  source_handle?: string
  target_handle?: string
  label?: string
  condition?: string
  priority: number
  connection_metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface WorkflowNodesResponse {
  nodes: WorkflowNode[]
  connections: WorkflowConnection[]
} 