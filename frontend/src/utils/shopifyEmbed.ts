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


/** Where the embedded Shopify app's pages live. index.html checks the same
 *  prefix before the bundle loads; keep the two in step. */
export const SHOPIFY_APP_PATH_PREFIX = '/shopify/'

/**
 * Whether this page is the app embedded in Shopify admin. Shopify opens it
 * with ?shop=&host=, but pages the app moves to may not keep them, so a page
 * framed on one of the app's routes counts too (the dashboard is never framed).
 */
export function isEmbeddedShopify(): boolean {
    const params = new URLSearchParams(window.location.search)
    if (params.has('shop') || params.has('host')) return true
    return window.top !== window && window.location.pathname.startsWith(SHOPIFY_APP_PATH_PREFIX)
}
