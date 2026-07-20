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

// Shared inline stroke icon set (stroke="currentColor" so glyphs inherit the
// surrounding color — muted by default, lime when active). One source of truth
// for the sidebar, bottom nav, More sheet, and prompts.
export const NAV_ICONS: Record<string, string> = {
    agents: '<rect x="5" y="8" width="14" height="11" rx="3"/><line x1="12" y1="4" x2="12" y2="8"/><circle cx="9" cy="13" r="1" fill="currentColor"/><circle cx="15" cy="13" r="1" fill="currentColor"/>',
    humans: '<circle cx="9" cy="8" r="3"/><path d="M3.5 19a5.5 5 0 0 1 11 0"/><circle cx="16.5" cy="9" r="2.3"/><path d="M15 19a4.5 4 0 0 1 5.5-3.6"/>',
    inbox: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M3 13h5l1.5 2.5h4L19 13h2"/>',
    people: '<circle cx="9" cy="8" r="2.6"/><path d="M4 18a5 4.5 0 0 1 10 0"/><path d="M15.5 6.2a2.6 2.6 0 0 1 0 4.6"/><path d="M16 13.6A5 4.5 0 0 1 20 18"/>',
    analytics: '<line x1="5" y1="17" x2="5" y2="13"/><line x1="10" y1="17" x2="10" y2="9"/><line x1="15" y1="17" x2="15" y2="6"/><line x1="20" y1="17" x2="20" y2="11"/>',
    knowledge: '<path d="M4 5.5A2 2 0 0 1 6 4h5v16H6a2 2 0 0 0-2 1.5z"/><path d="M20 5.5A2 2 0 0 0 18 4h-5v16h5a2 2 0 0 1 2 1.5z"/>',
    faq: '<circle cx="12" cy="12" r="9"/><path d="M9.3 9.3a2.7 2.7 0 0 1 5.2 1c0 1.8-2.5 2-2.5 3.3"/><circle cx="12" cy="17" r=".6" fill="currentColor"/>',
    tickets: '<path d="M4 9a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2 2 2 0 0 0 0 4 2 2 0 0 1-2 2H6a2 2 0 0 1-2-2 2 2 0 0 0 0-4z"/><line x1="14" y1="8" x2="14" y2="16" stroke-dasharray="2 2.4"/>',
    ticketing: '<circle cx="12" cy="12" r="3"/><path d="M12 4v2M12 18v2M4 12h2M18 12h2M6 6l1.5 1.5M16.5 16.5 18 18M18 6l-1.5 1.5M7.5 16.5 6 18"/>',
    org: '<rect x="4" y="4" width="14" height="16" rx="2"/><line x1="20" y1="20" x2="20" y2="11"/><line x1="18" y1="11" x2="22" y2="11"/><circle cx="8" cy="9" r=".6" fill="currentColor"/><circle cx="12" cy="9" r=".6" fill="currentColor"/><circle cx="8" cy="13" r=".6" fill="currentColor"/><circle cx="12" cy="13" r=".6" fill="currentColor"/>',
    subscription: '<rect x="3" y="6" width="18" height="12" rx="2.5"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="7" y1="14" x2="11" y2="14"/>',
    integrations: '<line x1="12" y1="12" x2="6" y2="6"/><line x1="12" y1="12" x2="18" y2="6"/><line x1="12" y1="12" x2="12" y2="19"/><circle cx="12" cy="12" r="2.2" fill="currentColor"/><circle cx="6" cy="6" r="2"/><circle cx="18" cy="6" r="2"/><circle cx="12" cy="19" r="2"/>',
    widgets: '<rect x="4" y="4" width="7" height="7" rx="2"/><rect x="13" y="4" width="7" height="7" rx="2"/><rect x="4" y="13" width="7" height="7" rx="2"/><circle cx="16.5" cy="16.5" r="3.5"/>',
    aiconfig: '<line x1="4" y1="8" x2="20" y2="8"/><line x1="4" y1="16" x2="20" y2="16"/><circle cx="9" cy="8" r="2.4"/><circle cx="15" cy="16" r="2.4"/>',
    usersettings: '<circle cx="12" cy="8" r="3.4"/><path d="M5.5 19a6.5 5.5 0 0 1 13 0"/>',
    more: '<circle cx="5" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1.4" fill="currentColor" stroke="none"/>',
    bell: '<path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9z"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/>',
    logout: '<path d="M15 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2v-2"/><path d="M10 12h11m0 0-3-3m3 3-3 3"/>',
    chevronRight: '<path d="M9 6l6 6-6 6"/>',
    moon: '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>',
    sun: '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>',
    monitor: '<rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>',
}

// Icons are static — cache built strings so hot paths (bottom nav re-renders
// on every route change) don't rebuild them.
const svgCache = new Map<string, string>()

export const navIconSvg = (name?: string, size = 19) => {
    const key = `${name}:${size}`
    let svg = svgCache.get(key)
    if (!svg) {
        svg = `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="${name === 'analytics' ? 2 : 1.7}" stroke-linecap="round" stroke-linejoin="round">${name ? (NAV_ICONS[name] || '') : ''}</svg>`
        svgCache.set(key, svg)
    }
    return svg
}
