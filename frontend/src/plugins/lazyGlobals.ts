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

import { defineAsyncComponent, type App } from 'vue'

/**
 * The icon sets: every Font Awesome icon (solid, regular, brands) is about a
 * megabyte of script. Loaded with the first icon a page shows, not with the
 * app, so a page without icons (the embedded Shopify app's Home) never pays
 * for them. Icons are named by strings all over the app, so the whole sets
 * stay registered.
 */
export async function loadFontAwesomeIcon() {
  const [{ library }, { FontAwesomeIcon }, { fas }, { far }, { fab }] = await Promise.all([
    import('@fortawesome/fontawesome-svg-core'),
    import('@fortawesome/vue-fontawesome'),
    import('@fortawesome/free-solid-svg-icons'),
    import('@fortawesome/free-regular-svg-icons'),
    import('@fortawesome/free-brands-svg-icons'),
  ])
  library.add(fas, far, fab)
  return FontAwesomeIcon
}

/** Charts are on analytics pages only. */
export async function loadApexChart() {
  return (await import('vue3-apexcharts')).default
}

/** Registers the app-wide components whose code loads on first use. */
export function registerLazyGlobals(app: App): void {
  app.component('font-awesome-icon', defineAsyncComponent(loadFontAwesomeIcon))
  app.component('apexchart', defineAsyncComponent(loadApexChart))
}
