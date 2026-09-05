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

/**
 * What the API sends instead of a stored environment/header value. Sending it
 * back unchanged keeps the stored credential, so editing an unrelated field
 * never forces the operator to mint a new one — providers typically show an
 * API key exactly once. Must match SECRET_MASK in the backend schema.
 */
export const SECRET_MASK = '********'

/** Record -> "KEY=value" lines, for the textarea editors. */
export function recordToLines(record: Record<string, string> | undefined | null): string {
  return Object.entries(record || {})
    .map(([key, value]) => `${key}=${value}`)
    .join('\n')
}

/** "KEY=value" lines -> record. Lines without '=' are ignored. */
export function linesToRecord(lines: string): Record<string, string> {
  const result: Record<string, string> = {}
  for (const line of lines.split('\n')) {
    const idx = line.indexOf('=')
    if (idx > 0) result[line.slice(0, idx).trim()] = line.slice(idx + 1).trim()
  }
  return result
}
