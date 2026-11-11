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
 * What stands for the agent in the redesigned panel. The two-dot mark by default;
 * the agent's photo when one is set; the generated orb only when it was chosen
 * explicitly (avatar_style 'orb'). Unlike the classic widget, Aurora no longer
 * falls back to the orb on its own (plan Q3).
 */

import type { AgentCustomization } from '../../types/agent'

export type AgentFace = 'mark' | 'photo' | 'orb'

export function agentFace(customization: Partial<AgentCustomization>, photoUrl: string): AgentFace {
    if (customization.customization_metadata?.avatar_style === 'orb') return 'orb'
    return photoUrl ? 'photo' : 'mark'
}

/** Up to two initials for a person without a photo ("Priya Rao" → "PR"). */
export function initialsOf(name: string): string {
    const words = (name || '').trim().split(/\s+/).filter(Boolean)
    const letters = words.length > 1 ? [words[0][0], words[words.length - 1][0]] : [words[0]?.[0] ?? '']
    return letters.join('').toUpperCase()
}
