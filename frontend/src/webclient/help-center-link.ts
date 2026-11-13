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
 * The help center link from the widget's startup data, only when it is a plain
 * http(s) URL (it becomes an href in the frame; anything else is dropped).
 */
export function helpCenterLink(raw: unknown): string | null {
    if (typeof raw !== 'string' || !raw) return null
    try {
        const url = new URL(raw)
        return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : null
    } catch {
        return null
    }
}
