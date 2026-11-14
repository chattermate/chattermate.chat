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
 * What a knowledge source is called on screen. Most sources are named by
 * their URL or file; a source read through an app's API is named
 * `<app>:<id>` (the backend's key for it), which reads as an address.
 */
const APP_SOURCES: Record<string, (id: string) => string> = {
  shopify: (domain) => `Your Shopify store (${domain})`,
}

export const sourceLabel = (name: string): string => {
  const separator = name.indexOf(':')
  if (separator <= 0) return name
  const describe = APP_SOURCES[name.slice(0, separator)]
  return describe ? describe(name.slice(separator + 1)) : name
}
