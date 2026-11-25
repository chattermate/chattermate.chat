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

import type { PushOffReason } from '@/composables/usePushStatus'

export interface PushOffCopy {
  /** Panel line and banner heading */
  title: string
  /** Panel line body */
  body: string
  /** Landing banner body, where it differs from the panel's */
  bannerBody?: string
  /** One-line version for the inbox strip */
  short: string
  /** Button label; none where the fix is outside the app */
  action?: string
  icon: string
}

export const PUSH_OFF_COPY: Record<PushOffReason, PushOffCopy> = {
  off: {
    title: 'Notifications are off on this device',
    body: "You won't hear about new chats until you turn them on.",
    bannerBody: "You won't hear about chats waiting for your team.",
    short: 'Notifications are off',
    action: 'Turn on',
    icon: 'fa-solid fa-bell-slash',
  },
  blocked: {
    title: 'Notifications are blocked in this browser',
    body: 'Click the icon left of the address bar, allow notifications, then reload.',
    short: 'Notifications are blocked',
    icon: 'fa-solid fa-bell-slash',
  },
  install: {
    title: 'Add ChatterMate to your Home Screen',
    body: 'iPhone only sends notifications to installed apps. Tap Share, then Add to Home Screen.',
    short: 'Add to Home Screen for notifications',
    icon: 'fa-solid fa-mobile-screen',
  },
  failed: {
    title: "Couldn't set up notifications",
    body: "This device isn't receiving them yet.",
    short: "Notifications aren't working",
    action: 'Try again',
    icon: 'fa-solid fa-triangle-exclamation',
  },
}
