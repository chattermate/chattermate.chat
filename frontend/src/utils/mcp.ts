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

/**
 * Ceiling on a connector's usage guidance. Must match MAX_USAGE_GUIDANCE_CHARS
 * in the backend schema — if it drifts, the operator hits a bare 422 toast
 * instead of the textarea stopping them.
 */
export const MAX_GUIDANCE_CHARS = 2000

/**
 * Copy for the connector guidance field. Lives here because the field appears
 * in two structurally unrelated forms — the investigation connector list and
 * the agent MCP tools modal — and the wording must not drift between them.
 */
export const CONNECTOR_GUIDANCE_LABEL = 'How to query this source'

export const CONNECTOR_GUIDANCE_HINT =
  'Given to the AI whenever it uses this connector. Name the indices, projects or ' +
  'tables it should reach for, and the fields that identify a customer or an order. ' +
  'Optional — leave it blank and the AI explores blind.'

/**
 * The third line is the point of the example: a query against a field that
 * does not exist returns zero hits rather than an error, so the AI reads a
 * clean "no results" and concludes the record is absent. Operators need to
 * know that is worth warning about.
 */
export const CONNECTOR_GUIDANCE_EXAMPLE = `Indices: app-logs-* (one doc per request), payment-logs-* (Stripe webhooks).
Order id is fields.order_ref on app-logs-*, metadata.order on payment-logs-*.
There is no order_id field — matching on it returns zero hits, not an error.
Timestamps are @timestamp, UTC, 30-day retention.
Query with the ES|QL tool; the search tool is not enabled on this cluster.`
