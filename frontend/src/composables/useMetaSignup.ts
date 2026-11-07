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
 * One-click connect for the Meta channels.
 *
 * Three different logins hide behind one button: WhatsApp uses Meta's Embedded
 * Signup SDK, Messenger uses Facebook Login for Business and then picks a Page,
 * and Instagram uses Instagram Login, which involves no Facebook Page at all.
 * Kept out of the connect modal so that component stays presentation plus the
 * manual credentials form.
 */

import { onBeforeUnmount, onMounted, ref } from 'vue'
import { toast } from 'vue-sonner'
import { apiErrorMessage } from '@/utils/apiError'
import channelsService, {
  type ChannelAccount,
  type MessengerSignupPage,
} from '@/services/channels'
import {
  loadMetaSdk,
  parseSignupMessage,
  runBusinessLogin,
  runInstagramLogin,
  signupLoginOptions,
  META_OAUTH_CALLBACK_PATH,
  type SignupChannel,
  type SignupSession,
} from '@/utils/metaSdk'

/** Copy for the one-click pane, per channel. */
const SIGNUP_COPY: Record<SignupChannel, { intro: string; cta: string }> = {
  whatsapp: {
    intro: 'Sign in with Facebook to connect your WhatsApp Business number.',
    cta: 'Continue with Facebook',
  },
  messenger: {
    intro: 'Sign in with Facebook to connect your Page.',
    cta: 'Continue with Facebook',
  },
  instagram: {
    intro: 'Sign in with Instagram to connect your professional account.',
    cta: 'Continue with Instagram',
  },
}

export interface MetaSignupOptions {
  channel: SignupChannel
  /** Manage mode: an already-connected account has nothing to sign up for. */
  existingAccount?: ChannelAccount | null
  /** Called with the account once a login completes. */
  onConnected: (account: ChannelAccount) => void
}

export function useMetaSignup({ channel, existingAccount, onConnected }: MetaSignupOptions) {
  // Offered only when the server says this deployment has a Meta app to onboard
  // under. Everyone else keeps the manual credentials form.
  const signupEnabled = ref(false)
  // Whether the server has answered: until then neither form is shown, or the
  // manual one would flash before one-click replaced it. Manage mode asks only
  // once the customer chooses to reconnect.
  const signupChecked = ref(false)
  const signingUp = ref(false)
  const showManualForm = ref(false)

  const configId = ref('')
  const appId = ref('')
  const graphVersion = ref('')

  /** WhatsApp only: its two halves arrive separately and are joined once both land. */
  const signupSession = ref<SignupSession | null>(null)

  // Facebook Login for Business can grant several Pages; the customer picks one.
  const signupPages = ref<MessengerSignupPage[]>([])
  const signupToken = ref('')
  const connectingPage = ref(false)

  const copy = SIGNUP_COPY[channel]

  // Manage mode: a login here reconnects this account, so it must bring the
  // same number or Page back rather than connect another one beside it
  const reconnecting = existingAccount ?? null
  const reconnectName = () => reconnecting?.display_name || reconnecting?.external_account_id || 'this account'

  const handleSignupMessage = (event: MessageEvent) => {
    const session = parseSignupMessage(event)
    if (session) signupSession.value = session
  }

  /** Ask whether one-click is offered here. Idempotent: the modal asks on
   *  open, and a manage-mode modal again when the customer reconnects. */
  let checking: Promise<void> | null = null
  const checkSignup = (): Promise<void> => {
    checking ??= (async () => {
      try {
        const config = await channelsService.getEmbeddedSignupConfig(channel)
        // The Facebook logins are driven by a Login-for-Business configuration;
        // Instagram Login has none, so requiring one here would hide its button.
        if (config.enabled && config.app_id && (channel === 'instagram' || config.config_id)) {
          // Empty for Instagram Login, which authorizes with the app id alone.
          configId.value = config.config_id ?? ''
          appId.value = config.app_id
          graphVersion.value = config.graph_version
          signupEnabled.value = true
        }
      } catch (error) {
        // Falling back to the manual form is a working path, not an error worth
        // interrupting the user for.
        console.error('One-click signup unavailable:', error)
      }
      // Answered: the button can show while the SDK below loads behind it
      signupChecked.value = true
      // WhatsApp uses the JS SDK (Embedded Signup, which also reports its
      // result out of band via postMessage). The other two drive their own
      // OAuth popup, so they need neither the SDK nor the message listener.
      if (signupEnabled.value && channel === 'whatsapp') {
        try {
          await loadMetaSdk(appId.value, graphVersion.value)
          window.addEventListener('message', handleSignupMessage)
        } catch (error) {
          console.error('Meta SDK failed to load:', error)
        }
      }
    })()
    return checking
  }

  onMounted(() => {
    if (!existingAccount) void checkSignup()
  })

  onBeforeUnmount(() => window.removeEventListener('message', handleSignupMessage))

  const finishWhatsAppSignup = async (code: string) => {
    const session = signupSession.value
    if (!session) {
      // Signed in, but Meta never reported which number was set up, so there
      // is nothing to connect. Say so rather than appearing to do nothing.
      toast.error('WhatsApp signup did not complete', {
        description: 'No number was set up. Try again, or enter credentials manually.',
      })
      return
    }
    // Reconnecting: only the same number puts that account back to work
    if (reconnecting && session.phone_number_id !== reconnecting.external_account_id) {
      toast.error(`That's a different number, not ${reconnectName()}`, {
        description: 'Sign in again and choose the same number to reconnect it.',
      })
      return
    }
    const account = await channelsService.connectWhatsAppEmbeddedSignup({
      code,
      waba_id: session.waba_id,
      phone_number_id: session.phone_number_id,
    })
    onConnected(account)
    toast.success(`Connected ${account.display_name || 'WhatsApp'}`)
  }

  const connectPickedPage = async (pageId: string) => {
    const account = await channelsService.connectMessengerSignup({
      signup_token: signupToken.value,
      page_id: pageId,
    })
    onConnected(account)
    toast.success(`Connected ${account.display_name || 'Messenger'}`)
  }

  const finishMessengerSignup = async (code: string, redirectUri: string) => {
    const { pages, signup_token } = await channelsService.listMessengerSignupPages(code, redirectUri)
    signupToken.value = signup_token
    // Reconnecting: only the same Page puts that account back to work, so no picker
    if (reconnecting) {
      if (!pages.some((page) => page.id === reconnecting.external_account_id)) {
        toast.error(`That login didn't include ${reconnectName()}`, {
          description: 'Sign in again and select that Page to reconnect it.',
        })
        return
      }
      await connectPickedPage(reconnecting.external_account_id)
      return
    }
    // One Page needs no picker — connect it and go straight to agent assignment.
    if (pages.length === 1) {
      await connectPickedPage(pages[0].id)
    } else {
      signupPages.value = pages
    }
  }

  /** The picker's choice — its own loading state, since the login popup is long gone. */
  const onPageSelected = async (pageId: string) => {
    try {
      connectingPage.value = true
      await connectPickedPage(pageId)
    } catch (error: any) {
      toast.error(apiErrorMessage(error, 'Could not connect that account'))
    } finally {
      connectingPage.value = false
    }
  }

  // WhatsApp: the JS SDK's login callback.
  const completeWhatsAppSignup = async (response: { authResponse?: { code?: string } }) => {
    const code = response.authResponse?.code
    if (!code) {
      // The popup was dismissed — not an error worth a toast.
      signingUp.value = false
      return
    }
    try {
      await finishWhatsAppSignup(code)
    } catch (error: any) {
      toast.error(apiErrorMessage(error, 'Could not finish connecting'))
    } finally {
      signingUp.value = false
    }
  }

  /** Shared shape of the two popup logins: run it, connect, surface failures. */
  const runPopupConnect = async (connect: (redirectUri: string) => Promise<void>) => {
    signingUp.value = true
    const redirectUri = window.location.origin + META_OAUTH_CALLBACK_PATH
    try {
      await connect(redirectUri)
    } catch (error: any) {
      // The user closing the popup is not an error worth a toast.
      if (error?.message !== 'cancelled') {
        toast.error(apiErrorMessage(error, error?.message || 'Could not finish connecting'))
      }
    } finally {
      signingUp.value = false
    }
  }

  // Messenger: Facebook Login for Business, then pick a Page.
  const startMessengerLogin = () => runPopupConnect(async (redirectUri) => {
    const code = await runBusinessLogin({
      appId: appId.value,
      configId: configId.value,
      graphVersion: graphVersion.value,
      redirectUri,
    })
    await finishMessengerSignup(code, redirectUri)
  })

  // Instagram: Instagram Login — one account, so it connects in a single step.
  const startInstagramLogin = () => runPopupConnect(async (redirectUri) => {
    const code = await runInstagramLogin({ appId: appId.value, redirectUri })
    const account = await channelsService.connectInstagramLogin(code, redirectUri)
    onConnected(account)
    // Instagram Login names its account only once it's connected: say so if it
    // isn't the one being reconnected, which still needs it
    if (reconnecting && account.external_account_id !== reconnecting.external_account_id) {
      toast.warning(`Connected ${account.display_name || 'another account'}, not ${reconnectName()}`, {
        description: `${reconnectName()} still needs reconnecting: sign in to that account.`,
      })
      return
    }
    toast.success(`Connected ${account.display_name || 'Instagram'}`)
  })

  const startSignup = () => {
    if (signingUp.value) return

    // Both popups must open synchronously in the click handler or the browser
    // blocks them.
    if (channel === 'messenger') { void startMessengerLogin(); return }
    if (channel === 'instagram') { void startInstagramLogin(); return }

    if (!window.FB) return
    signupSession.value = null
    signingUp.value = true
    // The SDK type-checks its callback and rejects an AsyncFunction outright
    // ("Expression is of type asyncfunction, not function"), so hand the async
    // work off from a plain function rather than passing `async` here.
    window.FB.login(
      (response) => { void completeWhatsAppSignup(response) },
      signupLoginOptions(configId.value, channel),
    )
  }

  return {
    checkSignup,
    signupChecked,
    signupEnabled,
    signingUp,
    showManualForm,
    signupPages,
    connectingPage,
    copy,
    startSignup,
    onPageSelected,
  }
}
