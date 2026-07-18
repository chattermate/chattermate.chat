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
 * Avatar initials from a display name or email ("John Doe" → "JD",
 * "john.doe@x.com" → "JD"). Single source of truth — UserList and GroupList
 * still carry older local variants that should migrate here.
 *
 * Names split on whitespace only, so "Jean-Luc Picard" stays "JP" rather than
 * losing the surname to the hyphen. The ./_/- separators apply to emails,
 * where they're the only word boundaries available.
 */
export function getInitials(name?: string | null, fallback = '?'): string {
  const value = (name || '').trim()
  if (!value) return fallback

  const isEmail = value.includes('@') && !/\s/.test(value)
  const words = isEmail ? value.split('@')[0].split(/[._-]+/) : value.split(/\s+/)

  return (
    words
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0]?.toUpperCase() || '')
      .join('') || fallback
  )
}
