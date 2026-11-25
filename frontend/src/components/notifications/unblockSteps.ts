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

import type { BrowserKind } from '@/utils/browserKind'

/** One drawn picture of a browser screen, with the thing to tap ringed. */
export type StepPicture =
  /** Toolbar with the site icon left of the address ringed */
  | { kind: 'site-icon'; icon: string; mobile?: boolean }
  /** The site popover, with its notifications control ringed */
  | { kind: 'site-setting'; control: 'toggle' | 'select' | 'clear'; icon?: string; mobile?: boolean }
  /** Toolbar with the reload button ringed */
  | { kind: 'reload'; icon?: string; mobile?: boolean }
  /** macOS menu bar: Safari > Settings… */
  | { kind: 'safari-menu' }
  /** Safari Settings > Websites > Notifications, this site set to Allow */
  | { kind: 'safari-websites' }
  /** iPhone Settings, the ChatterMate row, then the Allow Notifications switch */
  | { kind: 'ios-settings'; screen: 'apps' | 'toggle' }

export interface UnblockStep {
  text: string
  picture: StepPicture
}

export interface UnblockGuide {
  /** Shown as "In <browser>" above the steps */
  browser: string
  /** One sentence for the banner and drawer */
  summary: string
  steps: UnblockStep[]
}

const RELOAD = "Reload this page if they don't turn on by themselves."

const chromium = (browser: string, icon: string, control: 'toggle' | 'select'): UnblockGuide => ({
  browser,
  summary: 'Click the icon left of the address bar and allow notifications.',
  steps: [
    { text: 'Click the icon left of the address bar.', picture: { kind: 'site-icon', icon } },
    {
      text: control === 'toggle' ? 'Turn on Notifications.' : 'Next to Notifications, choose Allow.',
      picture: { kind: 'site-setting', control, icon },
    },
    { text: RELOAD, picture: { kind: 'reload', icon } },
  ],
})

export const UNBLOCK_GUIDES: Record<BrowserKind, UnblockGuide> = {
  chrome: chromium('Chrome', 'fa-solid fa-sliders', 'toggle'),
  brave: chromium('Brave', 'fa-solid fa-sliders', 'toggle'),
  edge: chromium('Edge', 'fa-solid fa-lock', 'select'),
  firefox: {
    browser: 'Firefox',
    summary: 'Click the crossed-out bell in the address bar to unblock them.',
    steps: [
      { text: 'Click the crossed-out bell in the address bar.', picture: { kind: 'site-icon', icon: 'fa-solid fa-bell-slash' } },
      { text: 'Click × next to Send notifications: Blocked.', picture: { kind: 'site-setting', control: 'clear', icon: 'fa-solid fa-bell-slash' } },
      { text: 'Reload this page, then click Turn on.', picture: { kind: 'reload', icon: 'fa-solid fa-bell-slash' } },
    ],
  },
  safari: {
    browser: 'Safari',
    summary: 'Allow them for this site in Safari → Settings → Websites.',
    steps: [
      { text: 'In the menu bar, choose Safari → Settings.', picture: { kind: 'safari-menu' } },
      { text: 'Open Websites → Notifications and set this site to Allow.', picture: { kind: 'safari-websites' } },
      { text: 'Reload this page.', picture: { kind: 'reload' } },
    ],
  },
  android: {
    browser: 'Chrome',
    summary: 'Tap the icon left of the address and allow notifications.',
    steps: [
      { text: 'Tap the icon left of the address.', picture: { kind: 'site-icon', icon: 'fa-solid fa-sliders', mobile: true } },
      { text: 'Tap Permissions and turn on Notifications.', picture: { kind: 'site-setting', control: 'toggle', icon: 'fa-solid fa-sliders', mobile: true } },
      { text: RELOAD, picture: { kind: 'reload', icon: 'fa-solid fa-sliders', mobile: true } },
    ],
  },
  'ios-app': {
    browser: 'the iPhone app',
    summary: 'Turn them on in iPhone Settings → Apps → ChatterMate.',
    steps: [
      { text: 'Open Settings, tap Apps, then ChatterMate.', picture: { kind: 'ios-settings', screen: 'apps' } },
      { text: 'Tap Notifications, turn on Allow Notifications, then come back.', picture: { kind: 'ios-settings', screen: 'toggle' } },
    ],
  },
  other: {
    browser: 'your browser',
    summary: "Allow notifications for this site in your browser's settings.",
    steps: [
      { text: "Open this site's settings, usually from the icon left of the address bar.", picture: { kind: 'site-icon', icon: 'fa-solid fa-lock' } },
      { text: 'Allow notifications.', picture: { kind: 'site-setting', control: 'select' } },
      { text: 'Reload this page.', picture: { kind: 'reload' } },
    ],
  },
}
