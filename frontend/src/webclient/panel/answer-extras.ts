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
 * What the redesigned panel reads from an AI reply besides its text, as the server
 * sends it on a live reply (chat_response) and stores it in a restored message's
 * attributes: follow-up choices, the handover card, the receipt of the agent's
 * steps and the visitor's thumb. Every reader validates: history rows are old.
 */

import type { WidgetMessage } from '../../types/widget'

export type VisitorFeedback = 'up' | 'down'
export type HandoverState = 'connecting' | 'offline'
export type StepStatus = 'ok' | 'error' | 'skipped'

export interface TraceStep {
    kind: string
    done_label: string
    status: StepStatus
    duration_ms: number
}

export interface TraceReceipt {
    turn_id: string
    duration_ms: number
    steps: TraceStep[]
}

/** At most this many follow-up chips, as the server's limit. */
export const MAX_FOLLOW_UPS = 3
const STEP_STATUSES = new Set<StepStatus>(['ok', 'error', 'skipped'])
const HANDOVER_STATES = new Set<HandoverState>(['connecting', 'offline'])

const isObject = (value: unknown): value is Record<string, unknown> =>
    !!value && typeof value === 'object' && !Array.isArray(value)

const attributesOf = (message: WidgetMessage): Record<string, unknown> =>
    isObject(message.attributes) ? message.attributes : {}

const stepFrom = (value: unknown): TraceStep | null => {
    if (!isObject(value) || typeof value.done_label !== 'string') return null
    const status = STEP_STATUSES.has(value.status as StepStatus) ? (value.status as StepStatus) : 'ok'
    return {
        kind: typeof value.kind === 'string' ? value.kind : 'other',
        done_label: value.done_label,
        status,
        duration_ms: typeof value.duration_ms === 'number' ? value.duration_ms : 0,
    }
}

/** The receipt of the agent's steps for this reply, or null. */
export function traceOf(message: WidgetMessage): TraceReceipt | null {
    const trace = attributesOf(message).trace
    if (!isObject(trace) || !Array.isArray(trace.steps)) return null
    const steps = trace.steps.map(stepFrom).filter((s): s is TraceStep => s !== null)
    if (!steps.length) return null
    return {
        turn_id: typeof trace.turn_id === 'string' ? trace.turn_id : '',
        duration_ms: typeof trace.duration_ms === 'number' ? trace.duration_ms : 0,
        steps,
    }
}

/** The follow-up choices under this reply (deduplicated, at most three). */
export function followUpsOf(message: WidgetMessage): string[] {
    const choices = attributesOf(message).quick_replies
    if (!Array.isArray(choices)) return []
    const seen = new Set<string>()
    return choices
        .filter((c): c is string => typeof c === 'string' && !!c.trim())
        .map(c => c.trim())
        .filter(c => (seen.has(c.toLowerCase()) ? false : (seen.add(c.toLowerCase()), true)))
        .slice(0, MAX_FOLLOW_UPS)
}

/** The handover card this reply is, or null for an ordinary answer. */
export function handoverOf(message: WidgetMessage): HandoverState | null {
    const handover = attributesOf(message).handover
    const state = isObject(handover) ? handover.state : null
    return HANDOVER_STATES.has(state as HandoverState) ? (state as HandoverState) : null
}

/** The visitor's thumb on this reply, or null. */
export function feedbackOf(message: WidgetMessage): VisitorFeedback | null {
    const value = attributesOf(message).visitor_feedback
    return value === 'up' || value === 'down' ? value : null
}

/** The extras of a live reply (chat_response), to keep in its attributes like history does. */
export function replyExtras(data: Record<string, unknown>): Record<string, unknown> {
    const extras: Record<string, unknown> = {}
    for (const key of ['quick_replies', 'handover', 'trace', 'cards'] as const) {
        if (data[key] !== null && data[key] !== undefined) extras[key] = data[key]
    }
    return extras
}

/** "2.4s", or "<1s" for a quick turn. */
export function formatDuration(ms: number): string {
    if (ms < 1000) return '<1s'
    const seconds = ms / 1000
    return seconds < 10 ? `${seconds.toFixed(1)}s` : `${Math.round(seconds)}s`
}

// ===== Status cards (plan 4.1; app/models/schemas/cards.py) =====

export type CardTone = 'neutral' | 'info' | 'progress' | 'success' | 'warning' | 'danger'
export type CardStepState = 'done' | 'current' | 'upcoming' | 'failed'

export interface CardMoney { value: string; currency: string }
export interface CardAction { id: string; label: string; kind: 'link' | 'reply'; value: string; style: 'primary' | 'secondary' }

export interface StatusCard {
    id: string
    kind: string
    title: string
    subtitle?: string
    status?: { key: string; label: string; tone: CardTone }
    steps: Array<{ label: string; state: CardStepState }>
    rows: Array<{ label: string; value: string }>
    items: Array<{ title: string; meta?: string; image?: string; quantity?: number; amount?: CardMoney }>
    total?: { label: string; amount: CardMoney }
    actions: CardAction[]
}

const TONES = new Set<CardTone>(['neutral', 'info', 'progress', 'success', 'warning', 'danger'])
const STEP_STATES = new Set<CardStepState>(['done', 'current', 'upcoming', 'failed'])
const str = (value: unknown): string => (typeof value === 'string' ? value : '')
const list = (value: unknown): Record<string, unknown>[] =>
    Array.isArray(value) ? value.filter(isObject) : []
const money = (value: unknown): CardMoney | undefined =>
    isObject(value) && str(value.value) ? { value: str(value.value), currency: str(value.currency) } : undefined
const isWebUrl = (value: string) => /^https?:\/\//i.test(value)

function actionFrom(value: Record<string, unknown>): CardAction | null {
    const kind = value.kind
    const target = str(value.value)
    if (!str(value.label) || !target) return null
    if (kind === 'link' && !isWebUrl(target)) return null
    if (kind !== 'link' && kind !== 'reply') return null
    return { id: str(value.id), label: str(value.label), kind, value: target, style: value.style === 'primary' ? 'primary' : 'secondary' }
}

function cardFrom(value: Record<string, unknown>): StatusCard | null {
    if (!str(value.id) || !str(value.title)) return null
    const status = isObject(value.status) && str(value.status.label)
        ? { key: str(value.status.key), label: str(value.status.label),
            tone: TONES.has(value.status.tone as CardTone) ? (value.status.tone as CardTone) : 'neutral' }
        : undefined
    const total = isObject(value.total) && money(value.total.amount)
        ? { label: str(value.total.label) || 'Total', amount: money(value.total.amount)! } : undefined
    return {
        id: str(value.id),
        kind: str(value.kind) || 'generic',
        title: str(value.title),
        subtitle: str(value.subtitle) || undefined,
        status,
        steps: list(value.steps).filter(s => str(s.label) && STEP_STATES.has(s.state as CardStepState))
            .map(s => ({ label: str(s.label), state: s.state as CardStepState })),
        rows: list(value.rows).filter(r => str(r.label) && str(r.value)).map(r => ({ label: str(r.label), value: str(r.value) })),
        items: list(value.items).filter(i => str(i.title)).map(i => ({
            title: str(i.title),
            meta: str(i.meta) || undefined,
            image: isWebUrl(str(i.image)) ? str(i.image) : undefined,
            quantity: typeof i.quantity === 'number' ? i.quantity : undefined,
            amount: money(i.amount),
        })),
        total,
        actions: list(value.actions).map(actionFrom).filter((a): a is CardAction => a !== null),
    }
}

/** The status cards a reply carries (order, ticket), validated. */
export function cardsOf(message: WidgetMessage): StatusCard[] {
    return list(attributesOf(message).cards).map(cardFrom).filter((c): c is StatusCard => c !== null)
}
