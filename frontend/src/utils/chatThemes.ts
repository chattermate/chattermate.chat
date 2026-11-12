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

import { DEFAULT_LAUNCHER_COLOR } from '@/webclient/launcher-style'

export interface ThemePalette {
    chat_background_color: string
    chat_text_color: string
    chat_bubble_color: string
    accent_color: string
    font_family: string
}

/**
 * Default palette per design (chat_style). Choosing a design seeds these colour
 * fields so the look matches the marketing presets; they can still be recoloured
 * afterwards. Per-theme text colours come from the design comp.
 */
export const THEME_PRESETS: Record<string, ThemePalette> = {
    CHATBOT: { chat_background_color: '#FFFFFF', chat_text_color: '#212529', chat_bubble_color: '#C9F24E', accent_color: '#C9F24E', font_family: 'Inter, system-ui, sans-serif' },
    ASK_ANYTHING: { chat_background_color: '#F8F9FA', chat_text_color: '#2A2A33', chat_bubble_color: DEFAULT_LAUNCHER_COLOR, accent_color: '#C9F24E', font_family: 'Inter, system-ui, sans-serif' },
    GLASS: { chat_background_color: '#17151F', chat_text_color: '#ECEAFA', chat_bubble_color: '#9D8CFF', accent_color: '#9D8CFF', font_family: 'Instrument Sans, sans-serif' },
    TERMINAL: { chat_background_color: '#070907', chat_text_color: '#D7F7C8', chat_bubble_color: '#C9F24E', accent_color: '#C9F24E', font_family: 'JetBrains Mono, monospace' },
    PLAYFUL: { chat_background_color: '#FFFFFF', chat_text_color: '#2A2730', chat_bubble_color: '#FF7A6B', accent_color: '#FF7A6B', font_family: 'Instrument Sans, sans-serif' },
    CALM_MINT: { chat_background_color: '#0E1A1A', chat_text_color: '#DDF7F3', chat_bubble_color: '#5FE3D6', accent_color: '#5FE3D6', font_family: 'Instrument Sans, sans-serif' },
    AURORA: { chat_background_color: '#14111C', chat_text_color: '#F2F3F8', chat_bubble_color: '#9D8CFF', accent_color: '#9D8CFF', font_family: 'Instrument Sans, sans-serif' },
    SUNRISE: { chat_background_color: '#FFFFFF', chat_text_color: '#2A2A33', chat_bubble_color: '#FF8A73', accent_color: '#FF8A73', font_family: 'Instrument Sans, sans-serif' },
}

export const themePreset = (value: string): ThemePalette => THEME_PRESETS[value] || THEME_PRESETS.CHATBOT
