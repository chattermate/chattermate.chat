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
 * Browser/PWA chrome colors — MUST mirror --bg per theme in
 * src/assets/styles/design-tokens.css (CSS variables can't be referenced from
 * the manifest or <meta name="theme-color">). Consumed by useTheme.ts and the
 * PWA manifest in vite.config.ts; index.html's static meta carries the dark
 * value as the pre-JS default.
 */
export const THEME_COLORS = {
  dark: '#0B0C10',
  light: '#EEF0F4',
} as const
