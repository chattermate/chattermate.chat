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

/** Whether this page is the widget's own frame (not the dashboard preview). */
export const isWidgetFrame = (win: Window = window): boolean => {
    try {
        return win.parent !== win
    } catch {
        return true
    }
}

/**
 * The frame page keeps the browser's default 8px body margin. The panel
 * fills the frame edge to edge (and, for Glass, the frame is transparent over the
 * loader's frosted backdrop), so the margin would show as a ring around the panel.
 * Only inside the frame: the dashboard preview owns its page. Called by the
 * widget root only (never by PanelWidget, which the dashboard preview also mounts,
 * and the dashboard can itself be framed, e.g. in the Shopify admin).
 */
export function fitFrameDocument(doc: Document = document, win: Window = window): void {
    if (!isWidgetFrame(win) || !doc.body) return
    doc.body.style.margin = '0'
}
