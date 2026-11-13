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
 * Cache-busting version for the app icons in frontend/public: favicons, the
 * apple-touch icon, the PWA icons and the notification badge.
 *
 * nginx serves those files with a 30-day cache, and browsers keep favicons even
 * longer, so replacing a file is not enough: returning visitors keep the old
 * logo. Bump this whenever an icon file changes. index.html gets it through the
 * __ICON_VERSION__ placeholder (vite.config.ts), the manifest and the service
 * worker through versionedIcon().
 */
export const ICON_VERSION = '2'

/** A public icon path with the current cache-busting version appended. */
export const versionedIcon = (path: string): string => `${path}?v=${ICON_VERSION}`
