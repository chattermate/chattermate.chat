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
 * Dashboard single sign-on (Google, Microsoft).
 *
 * The flow is a top-level redirect: the login page sends the browser to
 * `/sso/<provider>/start`, the backend takes it through the provider and
 * brings it back to `/login?sso=ok` with the session cookies already set.
 * A redirect carries no response body, so the user object password login
 * returns is fetched afterwards from `/users/me`.
 */
import type { LocationQuery } from 'vue-router'
import api from './api'
import { getApiUrl } from '@/config/api'
import { userService } from './user'
import type { User } from '../types/user'

export interface SsoProvider {
  key: string
  label: string
}

export interface SsoConfig {
  providers: SsoProvider[]
  /** False once an operator made SSO the way in: the page leads with SSO and
   * keeps the password form behind a link, for people not linked yet. */
  passwordLogin: boolean
}

/** What the login page says for each `sso_error` the backend redirects with. */
export const SSO_ERROR_MESSAGES: Record<string, string> = {
  no_account: 'No team account matches that e-mail address. Ask an administrator for an invite.',
  email_unverified: 'The provider has not verified that account\'s e-mail address, so it cannot be linked to a team member.',
  ambiguous_account: 'More than one team account uses that e-mail address. Ask an administrator to fix it.',
  already_linked: 'Your team account is linked to a different account from this provider. Ask an administrator to unlink it.',
  wrong_domain: 'This workspace only accepts accounts from its own Google domain.',
  sign_in_refused: 'Your organization does not allow this sign-in. Ask an administrator.',
  invalid_state: 'The sign-in took too long or was already used. Please try again.',
  invalid_token: 'The sign-in could not be verified. Please try again.',
  provider_error: 'The sign-in was cancelled or the provider refused it. Please try again.',
}

export const ssoService = {
  /** Providers the operator configured (empty means no SSO buttons) and
   * whether password sign-in is still offered. */
  async getConfig(): Promise<SsoConfig> {
    try {
      const { data } = await api.get<{ providers?: SsoProvider[]; password_login?: boolean }>('/sso/config')
      const providers = Array.isArray(data?.providers) ? data.providers : []
      // Never hide the form when there is nothing else to sign in with.
      return { providers, passwordLogin: data?.password_login !== false || providers.length === 0 }
    } catch {
      return { providers: [], passwordLogin: true }
    }
  },

  /** Where the browser goes to sign in with `provider`. `loginQuery` is the
   * login page's query; the backend keeps the parameters it knows
   * (?redirect=, the Shopify flows) and returns them with `?sso=ok`. */
  startUrl(provider: string, loginQuery: LocationQuery = {}): string {
    const params = new URLSearchParams()
    for (const [name, value] of Object.entries(loginQuery)) {
      for (const item of Array.isArray(value) ? value : [value]) {
        if (typeof item === 'string') params.append(name, item)
      }
    }
    const query = params.toString()
    return `${getApiUrl().replace(/\/+$/, '')}/sso/${encodeURIComponent(provider)}/start${query ? `?${query}` : ''}`
  },

  /** After the redirect back: pick up the user the cookies now identify. */
  async completeSignIn(): Promise<User> {
    const response = await api.get<User>('/users/me')
    userService.setCurrentUser(response.data)
    return response.data
  },

  errorMessage(code: string | null | undefined): string {
    return (code && SSO_ERROR_MESSAGES[code]) || 'Single sign-on failed. Please try again.'
  },
}
