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
 * Labels for knowledge-base citation chips, shared by the chat panel and the
 * Ask AI palette.
 */

export interface CitationSource {
    name?: string
    type?: string
}

// Some knowledge documents are stored under an opaque id/hash rather than a
// human-readable title. Showing that raw id in a chip looks broken, so fall back to
// a friendly label derived from the source type (e.g. "Knowledge base").
export const looksLikeOpaqueId = (name: string): boolean =>
    /^[0-9a-f]{16,}$/i.test(name) || /^[0-9a-f-]{32,}$/i.test(name)

export const prettyType = (type?: string): string => {
    const t = (type || '').trim().toLowerCase()
    if (!t || t === 'unknown') return 'Knowledge base'
    return t.charAt(0).toUpperCase() + t.slice(1)
}

export const citationLabel = (src: CitationSource): string => {
    let name = (src?.name || '').trim()
    if (!name) return prettyType(src?.type)
    // Knowledge docs are often stored as "<hash>_<real name>" (e.g.
    // "ce983…497_coachiq-faq"). Drop the leading hash so the chip shows the
    // readable part, then strip a common file extension for a cleaner label.
    name = name.replace(/^[0-9a-f]{16,}[_-]/i, '').replace(/\.(pdf|txt|md|html?|docx?|csv|json)$/i, '')
    if (!name || looksLikeOpaqueId(name)) return prettyType(src?.type)
    return name
}

export const citationTooltip = (src: CitationSource): string => {
    const label = citationLabel(src)
    const type = prettyType(src?.type)
    return label === type ? type : `${label} · ${type}`
}

/**
 * One chip per label. A website's pages are cited one by one (each keeps its own
 * link for the redesigned panel), but the classic views label a page by its
 * site, so its pages would show as repeated chips.
 */
export const uniqueCitations = <T extends CitationSource>(sources: T[] | undefined | null): T[] => {
    const seen = new Set<string>()
    return (sources || []).filter((src) => {
        const label = citationLabel(src)
        if (seen.has(label)) return false
        seen.add(label)
        return true
    })
}
