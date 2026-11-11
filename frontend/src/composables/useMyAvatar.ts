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


import { computed, ref, watch } from 'vue'
import { myAvatarUrl } from '@/config/api'
import { refreshSession } from '@/services/api'

/**
 * The signed-in user's own avatar, for an <img> (bind onError to @error).
 *
 * /users/me/avatar authenticates by the access cookie, which lasts 30 minutes.
 * API calls renew it on their 401 — an <img> can't, so a page opened after the
 * cookie lapsed showed a broken picture for good. On a failed load this asks
 * the endpoint why (an <img> can't see the status): only a 401 renews the
 * session and tries once more. Anything else — no picture on the server, S3
 * refusing — or a second failure turns `failed` true for the caller's stand-in.
 *
 * The cache-buster changes only when the picture does (or on that retry), not
 * on every render, so the browser isn't re-fetching it on unrelated updates.
 */
/** Did the avatar fail because the access cookie lapsed? Redirect not followed:
 * we only want our own status, not the picture. */
async function sessionLapsed(): Promise<boolean> {
  try {
    const response = await fetch(myAvatarUrl(), { credentials: 'include', redirect: 'manual' })
    return response.status === 401
  } catch {
    return false
  }
}

export function useMyAvatar(profilePic: () => string | null | undefined) {
  const version = ref(Date.now())
  const failed = ref(false)
  let retried = false

  watch(profilePic, () => {
    version.value = Date.now()
    failed.value = false
    retried = false
  })

  const src = computed(() => (profilePic() ? myAvatarUrl(version.value) : null))

  const onError = async () => {
    if (retried || !(await sessionLapsed())) {
      failed.value = true
      return
    }
    retried = true
    try {
      await refreshSession()
    } catch {
      failed.value = true
      return
    }
    version.value = Date.now()
  }

  return { src, failed, onError }
}
