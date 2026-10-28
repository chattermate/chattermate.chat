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
 * The login page's single sign-on half: which providers to offer and in what
 * order, sending the browser to one, and finishing the sign-in when it comes
 * back with `?sso=ok` (or `?sso_error=`). See services/sso.ts for the flow.
 */
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ssoService, type SsoProvider } from '@/services/sso'

// The return leg's markers: read once, then dropped so a reload neither
// repeats the sign-in nor shows a stale error.
const RETURN_PARAMS = ['sso', 'sso_error']

export interface SsoSignInOptions {
  /** A session now exists: carry on where the login page would. */
  onSignedIn?: () => void
  /** Something to tell the person; `code` is the backend's `sso_error`, if any. */
  onError: (message: string, code: string | null) => void
  /** 'signup' from the signup page: an account that doesn't exist yet is
   * signed up rather than refused (where the backend offers signup). */
  intent?: 'signup'
}

export function useSsoSignIn({ onSignedIn, onError, intent }: SsoSignInOptions) {
  const router = useRouter()

  // Configured providers; none means no buttons.
  const providers = ref<SsoProvider[]>([])
  // Whether the page leads with the e-mail/password form. An operator can make
  // it lead with SSO; the form then stays one click away for people not linked yet.
  const passwordLogin = ref(true)
  // Until the config arrives the page doesn't know which way it leads.
  const configLoaded = ref(false)
  // The providers refuse to load in a frame, and in the old Shopify popup the
  // round trip would cut the page off from the window that opened it.
  const embeddedOrFramed = router.currentRoute.value.query.embedded === 'true' || window.self !== window.top
  const available = computed(() => providers.value.length > 0 && !embeddedOrFramed)
  // The providers lead the page (above the form) instead of following it.
  const leads = computed(() => available.value && !passwordLogin.value)

  const redirecting = ref('')   // provider key the browser is being sent to
  const completing = ref(false) // back from the provider, fetching the session

  const loadConfig = async () => {
    const config = await ssoService.getConfig()
    providers.value = config.providers
    passwordLogin.value = config.passwordLogin
    configLoaded.value = true
  }

  const start = (provider: SsoProvider) => {
    redirecting.value = provider.key
    // The backend carries the login page's own parameters (?redirect=, the
    // Shopify flows) through the provider and hands them back with ?sso=ok.
    const query = intent ? { ...router.currentRoute.value.query, intent } : router.currentRoute.value.query
    window.location.href = ssoService.startUrl(provider.key, query)
  }

  const dropReturnParams = async () => {
    const query = { ...router.currentRoute.value.query }
    for (const name of RETURN_PARAMS) delete query[name]
    await router.replace({ query })
  }

  const finish = async () => {
    const { sso, sso_error: ssoError } = router.currentRoute.value.query
    if (typeof ssoError !== 'string' && sso !== 'ok') return
    await dropReturnParams()
    if (typeof ssoError === 'string') {
      onError(ssoService.errorMessage(ssoError), ssoError)
      return
    }
    try {
      completing.value = true
      await ssoService.completeSignIn()
      onSignedIn?.()
    } catch (err) {
      console.error('SSO completion error:', err)
      onError(ssoService.errorMessage(null), null)
    } finally {
      completing.value = false
    }
  }

  // Back from the provider's page, the browser may restore this one from its
  // back-forward cache with the buttons still saying "Redirecting…".
  const onPageShow = (event: PageTransitionEvent) => {
    if (event.persisted) redirecting.value = ''
  }

  // Independent: finishing a sign-in needn't wait for the provider list.
  onMounted(() => {
    window.addEventListener('pageshow', onPageShow)
    return Promise.all([loadConfig(), finish()])
  })
  onBeforeUnmount(() => window.removeEventListener('pageshow', onPageShow))

  return { providers, passwordLogin, configLoaded, available, leads, redirecting, completing, start }
}
