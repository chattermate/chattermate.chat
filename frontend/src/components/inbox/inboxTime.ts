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

/** A wait longer than this is late: its chip and banner say so. */
export const WAITING_LATE_MINUTES = 8

const MINUTE = 60_000

/** Whole minutes from `from` to `now`, never negative. */
export function minutesSince(from: string | Date, now: Date = new Date()): number {
  const start = typeof from === 'string' ? new Date(from) : from
  if (Number.isNaN(start.getTime())) return 0
  return Math.max(0, Math.floor((now.getTime() - start.getTime()) / MINUTE))
}

/** "now", "6m", "3h", "2d", then a short date: the list's time column. */
export function elapsedLabel(from: string | Date, now: Date = new Date()): string {
  const minutes = minutesSince(from, now)
  if (minutes < 1) return 'now'
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d`
  const start = typeof from === 'string' ? new Date(from) : from
  return start.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })
}

/** "6 minutes", "1 hour", "2 hours 5 minutes": the waiting banner's sentence. */
export function waitDuration(minutes: number): string {
  const plural = (n: number, unit: string) => `${n} ${unit}${n === 1 ? '' : 's'}`
  if (minutes < 60) return plural(Math.max(minutes, 1), 'minute')
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return rest ? `${plural(hours, 'hour')} ${plural(rest, 'minute')}` : plural(hours, 'hour')
}
