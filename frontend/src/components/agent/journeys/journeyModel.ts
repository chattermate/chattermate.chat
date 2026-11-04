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

/** Building, describing and checking journeys in the editor. The server
 * validates again; these checks just say what's wrong before saving. */

import type {
  Condition, ConditionKind, JourneyDefinition, JourneyInput, JourneyStep,
} from '@/types/journeys'

export const KEY_PATTERN = /^[a-z][a-z0-9_]{0,63}$/
export const FIELD_PATTERN = /^[a-z][a-z0-9_]{0,39}$/
/** Past this many steps the editor suggests splitting: shorter journeys finish more often. */
export const LONG_JOURNEY_STEPS = 5
export const MAX_CHIPS = 4

export const CONDITION_KINDS: { value: ConditionKind; label: string }[] = [
  { value: 'url', label: 'Page URL matches' },
  { value: 'event', label: 'App event' },
  { value: 'ctx', label: 'Page field' },
  { value: 'user', label: 'User field' },
  { value: 'action', label: 'Action succeeds' },
]

/**
 * Where a condition's value comes from, so the editor can tell the business
 * what its page or server has to send. Page fields are the page's word for
 * it; user fields come from the identity token the business's server signs.
 */
export function conditionSource(kind: ConditionKind, value: string): { text: string; code?: string } {
  const name = value.trim()
  switch (kind) {
    case 'url': return { text: 'The widget reads the page address by itself.' }
    case 'event': return { text: 'Your page reports it:', code: `ChatterMate.notify('${name || 'invoice_sent'}')` }
    case 'ctx': return { text: 'Your page sends it (not verified):', code: `ChatterMate.setContext({ ${name || 'plan'}: … })` }
    case 'user': return { text: 'From the identity token your server signs: name, first_name, email, or a custom_data key.' }
    case 'action': return { text: 'When this action runs and succeeds, from a chip or the agent.' }
  }
}

export const OPERATORS = [
  { value: 'exists', label: 'is set' },
  { value: 'eq', label: 'is' },
  { value: 'neq', label: 'is not' },
  { value: 'gte', label: 'at least' },
  { value: 'lte', label: 'at most' },
  { value: 'gt', label: 'more than' },
  { value: 'lt', label: 'less than' },
] as const

export function newStepId(): string {
  return `step-${Math.random().toString(36).slice(2, 10)}`
}

export function blankStep(): JourneyStep {
  return {
    id: newStepId(),
    title: 'New step',
    skippable: true,
    triggers: [],
    message: '',
    chips: [],
    allowed_actions: [],
    done_when: [{ kind: 'event', value: 'step_done' }],
    then: { kind: 'next', value: null },
    nudge: null,
  }
}

export function blankDefinition(): JourneyDefinition {
  return {
    audience: { kind: 'everyone', rules: [] },
    start: { kind: 'url', value: '/' },
    steps: [blankStep()],
    finish: { message: '' },
    variable_fallbacks: {},
  }
}

export function blankJourney(): JourneyInput {
  return {
    key: 'new_journey',
    name: 'New journey',
    status: 'draft',
    priority: 0,
    auto_open: false,
    goal_event: null,
    template_key: null,
    definition: blankDefinition(),
  }
}

export function conditionSummary(condition: Condition): string {
  switch (condition.kind) {
    case 'url': return `page ${condition.value}`
    case 'event': return `event ${condition.value}`
    case 'action': return `${condition.value} succeeds`
    default: {
      const prefix = condition.kind === 'ctx' ? 'ctx' : 'user'
      const op = OPERATORS.find((o) => o.value === (condition.op ?? 'exists'))?.label ?? 'is set'
      return condition.op && condition.op !== 'exists'
        ? `${prefix}.${condition.value} ${op} ${condition.operand}`
        : `${prefix}.${condition.value} ${op}`
    }
  }
}

export function audienceSummary(definition: JourneyDefinition): string {
  const { audience } = definition
  const base = audience.kind === 'everyone' ? 'Everyone' : audience.kind === 'new_users' ? 'New users' : 'Rule'
  const rules = audience.rules.map(conditionSummary).join(' and ')
  return rules ? `${base} · ${rules}` : base
}

export function startSummary(definition: JourneyDefinition): string {
  const { start } = definition
  if (start.kind === 'manual') return 'From your code'
  return start.kind === 'url' ? `Page ${start.value}` : `Event ${start.value}`
}

const VARIABLE = /\{\{\s*(user|ctx)\.([a-z][a-z0-9_]{0,39})\s*\}\}/g

/** Same filling rules as the server, for the editor's preview. */
export function renderPreview(template: string, sample: { user: Record<string, unknown>; ctx: Record<string, unknown> },
  fallbacks: Record<string, string>): string {
  return template.replace(VARIABLE, (_match, source: 'user' | 'ctx', name: string) => {
    const value = sample[source][name]
    if (value === undefined || value === null || value === '') return fallbacks[`${source}.${name}`] ?? fallbacks[name] ?? ''
    return String(value)
  }).replace(/\s{2,}/g, ' ').trim()
}

/** The {{source.name}} variables a step's text uses. */
export function variablesIn(text: string): string[] {
  return [...text.matchAll(VARIABLE)].map((m) => `${m[1]}.${m[2]}`)
}

/** What's wrong with a step, in plain words. Blocks saving when not empty. */
export function stepProblems(step: JourneyStep): string[] {
  const problems: string[] = []
  if (!step.title.trim()) problems.push('Give the step a title.')
  if (!step.done_when.length) problems.push('Say what counts as done.')
  for (const chip of step.chips) {
    if (chip.kind === 'action' && !step.allowed_actions.includes(chip.value)) {
      problems.push(`${chip.value} isn't allowed on this step.`)
    }
  }
  for (const condition of [...step.triggers, ...step.done_when]) {
    if (!condition.value.trim()) problems.push('Fill in every condition.')
    else if ((condition.kind === 'ctx' || condition.kind === 'user') && !FIELD_PATTERN.test(condition.value)) {
      problems.push(`${condition.value} isn't a field name.`)
    }
  }
  if (step.then.kind !== 'next' && !step.then.value) problems.push('Fill in what happens next.')
  return [...new Set(problems)]
}

/** Variables used that no page has sent and that have no fallback: users would see a blank. */
export function unknownVariables(step: JourneyStep, known: Set<string>, fallbacks: Record<string, string>): string[] {
  const used = variablesIn([step.message, ...step.chips.map((c) => c.label)].join(' '))
  return [...new Set(used)].filter((ref) => {
    const [source, name] = ref.split('.')
    const sentByPage = source === 'ctx' ? known.has(name) : ['name', 'first_name', 'email'].includes(name) || known.has(name)
    return !sentByPage && !(ref in fallbacks) && !(name in fallbacks)
  })
}

export function journeyProblems(journey: JourneyInput): string[] {
  const problems: string[] = []
  if (!KEY_PATTERN.test(journey.key)) problems.push('The key uses lowercase letters, digits and underscores.')
  if (!journey.name.trim()) problems.push('Give the journey a name.')
  if (journey.goal_event && !KEY_PATTERN.test(journey.goal_event)) problems.push('The goal is an event name, like first_invoice_sent.')
  if (journey.definition.start.kind !== 'manual' && !journey.definition.start.value) problems.push('Say which page or event starts it.')
  return problems
}

const UNITS: [number, string][] = [[86400, 'd'], [3600, 'h'], [60, 'm'], [1, 's']]

/** A time span in its two largest units ("1d 3h", "4m 20s"); "—" when there is none. */
export function formatDuration(seconds: number | null): string {
  if (seconds === null) return '—'
  const total = Math.round(seconds)
  if (total < 60) return `${total}s`
  const i = UNITS.findIndex(([size]) => total >= size)
  const [big, bigUnit] = UNITS[i]
  const [small, smallUnit] = UNITS[i + 1]
  const whole = `${Math.floor(total / big)}${bigUnit}`
  const rest = Math.floor((total % big) / small)
  return rest ? `${whole} ${rest}${smallUnit}` : whole
}
