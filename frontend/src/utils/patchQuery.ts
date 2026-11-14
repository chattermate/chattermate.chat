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

import type { LocationQueryRaw, Router } from 'vue-router'

// The last change in line: the next starts from the URL it leaves
let queue: Promise<unknown> = Promise.resolve()

/**
 * Changes part of the URL's query (undefined removes a key). Changes made in
 * the same moment run one after another, each from the URL the last one left:
 * read from the current route instead, the second would drop the first's key
 * (the inbox's ?view= and ?session= did, so a reload lost the view).
 */
export function patchQuery(router: Router, patch: LocationQueryRaw, mode: 'replace' | 'push' = 'replace'): Promise<unknown> {
  queue = queue
    .catch(() => undefined)
    .then(() => {
      const query = { ...router.currentRoute.value.query, ...patch }
      return mode === 'push' ? router.push({ query }) : router.replace({ query })
    })
  return queue
}
