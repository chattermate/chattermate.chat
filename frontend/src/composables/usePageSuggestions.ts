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

import { ref, watch, type Ref } from 'vue'
import { hostPage } from '../webclient/frame-session'
import { SUGGESTION_ICONS, type SuggestionIcon } from '../webclient/quick-actions'

/**
 * "Suggested for this page": asked for the host page while the start state shows,
 * and again when the page changes (page_suggestions -> suggestions). Until an
 * answer comes, the start state shows the agent's every-page quick actions.
 */

export interface PageSuggestion {
    label: string
    icon: SuggestionIcon
}

export interface PageSuggestions {
    /** The answer is for the current page. */
    loaded: boolean
    heading: 'page' | 'popular'
    pill: string | null
    items: PageSuggestion[]
}

const empty = (): PageSuggestions => ({ loaded: false, heading: 'popular', pill: null, items: [] })

export function usePageSuggestions(options: {
    on: (event: string, listener: (...args: any[]) => void) => void
    emit: (event: string, data?: unknown) => void
    /** The start state is up and the socket can answer. */
    active: Ref<boolean>
}) {
    const pageSuggestions = ref<PageSuggestions>(empty())
    let asked: string | null = null

    options.on('suggestions', (data: Record<string, any>) => {
        if (!data || data.url !== hostPage.value.url) return
        const items = (Array.isArray(data.items) ? data.items : [])
            .filter((i: any) => i && typeof i.label === 'string' && i.label.trim())
            .slice(0, 3)
            .map((i: any) => ({ label: i.label.trim(), icon: SUGGESTION_ICONS.includes(i.icon) ? i.icon : 'question' }))
        pageSuggestions.value = {
            loaded: true,
            heading: data.heading === 'page' ? 'page' : 'popular',
            pill: typeof data.pill === 'string' && data.pill ? data.pill : null,
            items,
        }
    })

    // Asked again for a new page or title, and after the socket came back (an
    // answer lost with a dropped connection would otherwise never come).
    watch([options.active, () => hostPage.value.url, () => hostPage.value.title], ([active, url, title]) => {
        if (!active) {
            asked = null
            return
        }
        const key = `${url}\n${title ?? ''}`
        if (!url || key === asked) return
        const samePage = asked?.startsWith(`${url}\n`)
        asked = key
        if (!samePage) pageSuggestions.value = empty()
        options.emit('page_suggestions', { url, title })
    }, { immediate: true })

    return { pageSuggestions }
}
