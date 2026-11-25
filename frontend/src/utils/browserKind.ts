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
 * Which browser's settings screens to describe. Browsers built on Chromium
 * that we don't name (Opera, Arc, Vivaldi) read as chrome: their site
 * settings look the same.
 * - ios-app: the app added to an iPhone Home Screen (a Safari tab can't push)
 */
export type BrowserKind = 'chrome' | 'edge' | 'brave' | 'firefox' | 'safari' | 'android' | 'ios-app' | 'other'

type NavigatorLike = Pick<Navigator, 'userAgent'> & { brave?: unknown }

export function detectBrowser(nav: NavigatorLike = navigator): BrowserKind {
  const ua = nav.userAgent
  if (/iPad|iPhone|iPod/.test(ua)) return 'ios-app'
  if (/Android/.test(ua)) return /Chrome\//.test(ua) && !/Firefox\//.test(ua) ? 'android' : 'other'
  // Brave hides itself in the user agent, not on navigator
  if (nav.brave) return 'brave'
  if (/Edg\//.test(ua)) return 'edge'
  if (/Firefox\//.test(ua)) return 'firefox'
  if (/Chrome\/|Chromium\//.test(ua)) return 'chrome'
  if (/Safari\//.test(ua)) return 'safari'
  return 'other'
}
