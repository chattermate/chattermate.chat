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

import { toRaw, watch, type Ref } from 'vue'

/**
 * Tells a message that just arrived (one sent or received while the visitor
 * watches: it animates in) from one that came with others at once (history, a
 * restored chat: it simply appears). Keyed by the message itself, not its place.
 */
export function useMessageArrivals(messages: Readonly<Ref<readonly object[]>>) {
    const known = new WeakSet<object>()
    const fresh = new WeakSet<object>()
    // What is already there when the list first shows was not watched arriving.
    let shown = false

    watch(() => [...messages.value], (list) => {
        const added = list.map(message => toRaw(message)).filter(message => !known.has(message))
        added.forEach(message => known.add(message))
        // One at a time is a live message; a batch is history being loaded.
        if (shown && added.length === 1) fresh.add(added[0])
        shown = true
    }, { immediate: true })

    /** Whether this message arrived on its own after the list was first shown. */
    const isFresh = (message: object): boolean => fresh.has(toRaw(message))

    return { isFresh }
}
