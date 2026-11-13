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

/** A snooze preset: until when, and how to say it. */
export interface SnoozeChoice {
  label: string
  until: Date
}

/** Where "tomorrow" and "next week" start */
const MORNING_HOUR = 9

function morning(from: Date, addDays: number): Date {
  const day = new Date(from)
  day.setDate(day.getDate() + addDays)
  day.setHours(MORNING_HOUR, 0, 0, 0)
  return day
}

/** 1 hour, 3 hours, tomorrow morning, next Monday morning, from `now` in the viewer's time. */
export function snoozeChoices(now: Date = new Date()): SnoozeChoice[] {
  const hours = (n: number) => new Date(now.getTime() + n * 3_600_000)
  const daysToMonday = ((8 - now.getDay()) % 7) || 7
  return [
    { label: '1 hour', until: hours(1) },
    { label: '3 hours', until: hours(3) },
    { label: 'tomorrow 9:00', until: morning(now, 1) },
    { label: 'next Monday 9:00', until: morning(now, daysToMonday) },
  ]
}
