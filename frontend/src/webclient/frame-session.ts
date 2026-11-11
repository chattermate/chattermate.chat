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
 * The widget framed on our own origin (`/widgets/{id}/frame`).
 *
 * That page carries no token. The embed loader marks the frames it creates with
 * `?host=1`; such a frame announces itself (FRAME_READY), takes the visitor's token
 * and page URL from the host's first HOST_INIT, then asks /bootstrap for everything
 * else. A frame embedded without the loader (raw <iframe>, previews) has no host to
 * wait for and bootstraps straight away, keeping its token in its own storage.
 *
 * Pages served by /data bake everything in instead (older loaders, raw /data
 * embeds); none of this runs for them.
 */

import { ref } from 'vue'
import { sanitizeToken, localTokenStore, memoryTokenStore, TOKEN_STORAGE_KEY, type TokenStore } from '../composables/useConversationToken'
import { postToHost, setHostOrigin } from './host-bridge'
import { widgetEnv } from './widget-env'

interface FrameBoot {
  widgetId: string
}

interface HostInit {
  origin: string
  token: string | null
  pageUrl: string | null
  pageTitle: string | null
}

// @ts-ignore - set by the /frame page before this bundle loads
const boot: FrameBoot | undefined = window.__CM_FRAME__

/** Origins a browser reports for a sandboxed or file: document: postMessage can't address them. */
const OPAQUE_ORIGIN = 'null'

let hosted = false
let opaqueHost = false
let hostPageUrl: string | null = null

/** True when this document is the /frame page (rather than a baked /data page). */
export const isFramed = (): boolean => !!boot

/** The embed loader is driving this frame: the host page owns the token. */
export const isHosted = (): boolean => hosted

/**
 * Whether the parent page may hand the widget a visitor's identity, and be told
 * about it. Yes for a /data page (as always) and for a frame the loader drives on
 * an addressable page; never for a frame embedded without the loader or under a
 * sandboxed page - any page could be its parent, so tokens stay out of messages.
 */
export const hostSharesIdentity = (): boolean => !boot || (hosted && !opaqueHost)

/** The embedding page's own URL, as its loader reported it. */
export const reportedPageUrl = (): string | null => hostPageUrl

/** The host page as the loader last reported it, for what reacts to page changes. */
export const hostPage = ref<{ url: string | null; title: string | null }>({ url: null, title: null })

export const setHostPageUrl = (url: unknown, title?: unknown): void => {
  if (typeof url === 'string' && url) {
    hostPageUrl = url
    hostPage.value = { url, title: typeof title === 'string' ? title : hostPage.value.title }
  }
}

/** Where the widget keeps its token in this mode. */
export const tokenStoreFor = (widgetId: string): TokenStore => {
  if (!boot) return localTokenStore()
  if (hosted) return memoryTokenStore()
  // Raw frame embed: its own storage is ours (and partitioned per embedding
  // site). Keyed by widget so a page with two widgets keeps two visitors.
  return localTokenStore(`${TOKEN_STORAGE_KEY}:${widgetId}`)
}

const waitForHostInit = (): Promise<HostInit> =>
  new Promise((resolve) => {
    const onMessage = (event: MessageEvent) => {
      if (event.source !== window.parent || event.data?.type !== 'HOST_INIT') return
      window.removeEventListener('message', onMessage)
      const opaque = event.origin === OPAQUE_ORIGIN
      resolve({
        origin: event.origin,
        // An opaque host can't be addressed, so nothing it hands over can be
        // answered safely: such a frame runs as an anonymous visitor.
        token: opaque ? null : sanitizeToken(event.data.token),
        pageUrl: typeof event.data.pageUrl === 'string' ? event.data.pageUrl : null,
        pageTitle: typeof event.data.pageTitle === 'string' ? event.data.pageTitle : null,
      })
    }
    window.addEventListener('message', onMessage)
    // Nothing secret in it, and the host's origin isn't known yet.
    window.parent.postMessage({ type: 'FRAME_READY' }, '*')
  })

/** Error code from a refused /bootstrap, as the loader understands it. */
const refusalCode = async (response: Response): Promise<string> => {
  try {
    const body = await response.json()
    return body?.detail?.code || 'unavailable'
  } catch {
    return 'unavailable'
  }
}

const showUnavailable = () => {
  const app = document.getElementById('app')
  if (app) app.textContent = 'Chat is unavailable right now.'
}

/**
 * Hand-shake with the host (if any) and fetch the widget's start-up data into
 * `window.__INITIAL_DATA__`, where the rest of the widget reads it. Resolves false
 * when the widget can't start; the host has been told why.
 */
export async function startFramedWidget(): Promise<boolean> {
  if (!boot) return true

  const params = new URL(window.location.href).searchParams
  hosted = params.get('host') === '1' && window.parent !== window

  let token: string | null
  let hostOrigin: string | null = null
  if (hosted) {
    const init = await waitForHostInit()
    if (init.origin !== OPAQUE_ORIGIN) {
      setHostOrigin(init.origin)
      hostOrigin = init.origin
    } else {
      // An opaque host (sandboxed, file:) can only be reached with '*': it gets
      // readiness and layout messages, never a token (hostSharesIdentity).
      opaqueHost = true
      setHostOrigin('*')
    }
    setHostPageUrl(init.pageUrl, init.pageTitle)
    token = init.token
  } else {
    token = tokenStoreFor(boot.widgetId).read()
  }

  let response: Response
  try {
    response = await fetch(`${widgetEnv.API_URL}/widgets/${encodeURIComponent(boot.widgetId)}/bootstrap`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ host_origin: hostOrigin, source: params.get('source') }),
    })
  } catch {
    if (hosted) postToHost({ type: 'WIDGET_ERROR', code: 'unavailable' })
    else showUnavailable()
    return false
  }

  if (!response.ok) {
    const code = await refusalCode(response)
    if (hosted) postToHost({ type: 'WIDGET_ERROR', code })
    else showUnavailable()
    return false
  }

  const data = await response.json()
  // @ts-ignore - the same shape /data bakes into the page
  window.__INITIAL_DATA__ = data
  // A token minted here (a new anonymous visitor) only exists in this frame:
  // the host keeps the visitor's token, so hand it over.
  const issued = sanitizeToken(data.initialToken)
  if (hostSharesIdentity() && issued && issued !== token) postToHost({ type: 'TOKEN_UPDATE', token: issued })
  return true
}

/** Tell the host the widget is mounted and listening. */
export const announceReady = (): void => {
  if (hosted) postToHost({ type: 'WIDGET_READY' })
}
