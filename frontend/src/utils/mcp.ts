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

/**
 * Connector timeout, in seconds. Bounds the MCP startup handshake and each
 * later tool call. Cold `npx` launches resolve and download the package
 * first, so the default is generous.
 */
export const DEFAULT_MCP_TIMEOUT = 30
export const MIN_MCP_TIMEOUT = 1
export const MAX_MCP_TIMEOUT = 300

/**
 * Keep the timeout inside the range the API accepts. A number input's
 * min/max don't block submission, and the resulting 422 carries a validation
 * payload rather than a message a toast can show.
 */
export function clampMCPTimeout(value: number | undefined | null): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
    return DEFAULT_MCP_TIMEOUT
  }
  return Math.min(Math.max(Math.round(value), MIN_MCP_TIMEOUT), MAX_MCP_TIMEOUT)
}
