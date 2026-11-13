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

import { onBeforeUnmount, watchEffect, type Ref } from 'vue'
import { useRoute } from 'vue-router'
import { APP_NAME, documentTitle, routePageTitle } from '@/router/pageTitles'

/** The page whose tab title carries the waiting count. */
const COUNTED_PATH = '/conversations'

/**
 * Keeps the browser tab title on the current dashboard page:
 * "Analytics · ChatterMate", and "(3) Inbox · ChatterMate" while 3 chats wait
 * for a human. Back to the plain app name when the dashboard unmounts, so the
 * login page never inherits the last page's title.
 */
export function useDocumentTitle(waitingCount?: Ref<number | null>) {
  const route = useRoute()

  watchEffect(() => {
    const count = route.path === COUNTED_PATH ? waitingCount?.value : null
    document.title = documentTitle(routePageTitle(route), count)
  })

  onBeforeUnmount(() => {
    document.title = APP_NAME
  })
}
