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
 * Agent-answer markdown → safe HTML, shared by every widget surface that renders a
 * reply (the chat panel and the Ask AI palette) so they can't drift apart on either
 * formatting or sanitisation.
 *
 * Output always goes through `sanitizeHtml`, which strips iframes/scripts/handlers —
 * answers contain model output and knowledge-base content, so it is never trusted.
 */

import { marked } from 'marked'
import { sanitizeHtml } from '../utils/sanitize'

marked.setOptions({
    renderer: new marked.Renderer(),
    gfm: true,
    breaks: true,
})

// Links open in a new tab (the widget lives in an iframe, so a same-tab navigation
// would replace the chat rather than the page). sanitizeHtml already forces
// target="_blank" + rel on every surviving anchor, so nothing is needed here.
export const renderMarkdown = (text?: string | null): string => sanitizeHtml(marked(text || '') as string)
