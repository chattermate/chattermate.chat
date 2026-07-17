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

Shared display metadata for ticket statuses / priorities / AI states.
Colors come from the design tokens so both themes work.
*/

import type { HypothesisStatus, TicketAiState, TicketPriority, TicketStatus } from '@/types/ticket'

export interface ChipMeta {
  label: string
  color: string
}

export const STATUS_META: Record<TicketStatus, ChipMeta> = {
  open: { label: 'Open', color: 'var(--c-info)' },
  triaging: { label: 'Open · AI triaging', color: 'var(--c-info)' },
  investigating: { label: 'Open · AI active', color: 'var(--c-info)' },
  awaiting_approval: { label: 'Awaiting approval', color: 'var(--c-warn)' },
  in_progress: { label: 'In progress', color: 'var(--c-teal)' },
  resolved_pending_confirmation: { label: 'Resolved · confirming', color: 'var(--c-positive)' },
  resolved: { label: 'Resolved', color: 'var(--c-positive)' },
  closed: { label: 'Closed', color: 'var(--c-neutral)' },
  reopened: { label: 'Reopened', color: 'var(--c-coral)' },
}

export const PRIORITY_META: Record<TicketPriority, ChipMeta> = {
  urgent: { label: 'Urgent', color: 'var(--c-danger)' },
  high: { label: 'High', color: 'var(--c-coral)' },
  medium: { label: 'Medium', color: 'var(--c-warn)' },
  low: { label: 'Low', color: 'var(--c-neutral)' },
}

export const AI_STATE_META: Record<TicketAiState, ChipMeta & { pulse: boolean }> = {
  investigating: { label: 'AI investigating', color: 'var(--c-info)', pulse: true },
  awaiting: { label: 'Awaiting human', color: 'var(--c-warn)', pulse: false },
  human: { label: 'Human-owned', color: 'var(--c-neutral)', pulse: false },
  resolved: { label: 'AI-resolved', color: 'var(--c-positive)', pulse: false },
}

// Human-selectable statuses for the detail dropdown, in lifecycle order.
// Triaging/investigating are AI-driven and not directly selectable.
export const SELECTABLE_STATUSES: TicketStatus[] = [
  'open',
  'in_progress',
  'awaiting_approval',
  'resolved_pending_confirmation',
  'resolved',
  'closed',
  'reopened',
]

export const PRIORITIES: TicketPriority[] = ['urgent', 'high', 'medium', 'low']

export function statusMeta(status: TicketStatus): ChipMeta {
  return STATUS_META[status] || { label: status, color: 'var(--c-neutral)' }
}

export function priorityMeta(priority: TicketPriority): ChipMeta {
  return PRIORITY_META[priority] || { label: priority, color: 'var(--c-neutral)' }
}

export function aiStateMeta(state?: TicketAiState | null) {
  return (state && AI_STATE_META[state]) || AI_STATE_META.human
}

export const HYPOTHESIS_STATUS_META: Record<HypothesisStatus, ChipMeta> = {
  pending: { label: 'Pending', color: 'var(--c-neutral)' },
  testing: { label: 'Testing', color: 'var(--c-info)' },
  validated: { label: 'Validated', color: 'var(--c-positive)' },
  invalidated: { label: 'Invalidated', color: 'var(--c-danger)' },
  inconclusive: { label: 'Inconclusive', color: 'var(--c-warn)' },
}

export function hypothesisMeta(status: HypothesisStatus): ChipMeta {
  return HYPOTHESIS_STATUS_META[status] || { label: status, color: 'var(--c-neutral)' }
}

export function ticketInitials(name?: string | null): string {
  if (!name) return 'AI'
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

export function formatSlaCountdown(slaDueAt?: string | null, resolvedAt?: string | null): ChipMeta {
  if (resolvedAt || !slaDueAt) return { label: '—', color: 'var(--faint)' }
  const remainingMs = new Date(slaDueAt).getTime() - Date.now()
  if (remainingMs <= 0) return { label: 'Breached', color: 'var(--c-danger)' }
  const minutes = Math.floor(remainingMs / 60000)
  const label =
    minutes >= 60 * 24
      ? `${Math.floor(minutes / (60 * 24))}d ${Math.floor((minutes % (60 * 24)) / 60)}h`
      : minutes >= 60
        ? `${Math.floor(minutes / 60)}h ${minutes % 60}m`
        : `${minutes}m`
  const color =
    minutes < 10 ? 'var(--c-danger)' : minutes < 30 ? 'var(--c-warn)' : 'var(--muted2)'
  return { label, color }
}
