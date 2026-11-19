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

import type { AgentRemovalImpact } from '@/services/agent'

export interface RemovalConsequence {
  /** Font Awesome icon for the row */
  icon: string
  text: string
}

/** What deleting an agent takes with it, one row per kind it has. */
export const removalConsequences = (impact: AgentRemovalImpact): RemovalConsequence[] => {
  const rows: RemovalConsequence[] = []
  if (impact.widgets === 1) {
    rows.push({ icon: 'fa-solid fa-code', text: "Its chat widget stops working on any site where it's installed." })
  } else if (impact.widgets > 1) {
    rows.push({ icon: 'fa-solid fa-code', text: `Its ${impact.widgets} chat widgets stop working on any site where they're installed.` })
  }
  if (impact.channels === 1) {
    rows.push({ icon: 'fa-solid fa-comment-dots', text: '1 channel it answers is left without an agent.' })
  } else if (impact.channels > 1) {
    rows.push({ icon: 'fa-solid fa-comment-dots', text: `${impact.channels} channels it answers are left without an agent.` })
  }
  if (impact.workflows === 1) {
    rows.push({ icon: 'fa-solid fa-diagram-project', text: 'Its workflow is deleted.' })
  } else if (impact.workflows > 1) {
    rows.push({ icon: 'fa-solid fa-diagram-project', text: `Its ${impact.workflows} workflows are deleted.` })
  }
  return rows
}
