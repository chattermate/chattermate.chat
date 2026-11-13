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

import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { FEATURE_GATES, type GateKey } from '@/components/agent/featureGates'
import { useFeatureLock } from '@/composables/useFeatureLock'
import { inboxAssist, type ImproveStyle } from '@/services/inboxAssist'

export interface FaqDraft {
  question: string
  answer: string
}

/** The help center editor with a question and its answer filled in. */
export function faqEditorLink(draft: FaqDraft): string {
  return `/faq?${new URLSearchParams({ question: draft.question, answer: draft.answer }).toString()}`
}

const detail = (err: any, fallback: string): string => err?.response?.data?.detail || fallback

/**
 * The inbox's paid tools for one open conversation: what the plan locks, and
 * the AI's help (improve a reply, refresh the summary, draft a help article).
 */
export function useInboxAssist(sessionId: () => string) {
  const router = useRouter()
  const { isLocked } = useFeatureLock()
  // Read once: the plan doesn't change while the inbox is open
  const aiLocked = isLocked('inbox-ai')
  const snoozeLocked = isLocked('inbox-snooze')
  const savedRepliesLocked = isLocked('saved-replies')

  function showUpgrade(gate: GateKey): void {
    toast(FEATURE_GATES[gate].description, {
      action: { label: 'See plans', onClick: () => void router.push('/settings/subscription') },
    })
  }

  /** The draft rewritten; throws (after saying so) when the AI can't. */
  async function improve(text: string, style: ImproveStyle): Promise<string> {
    try {
      return await inboxAssist.improve(sessionId(), text, style)
    } catch (err) {
      toast.error(detail(err, "The AI couldn't improve it. Try again."))
      throw err
    }
  }

  // ---- The summary, as of now ----
  const summary = ref<string | null>(null)
  const refreshingSummary = ref(false)
  async function refreshSummary(): Promise<void> {
    if (refreshingSummary.value) return
    refreshingSummary.value = true
    const id = sessionId()
    try {
      const text = await inboxAssist.summary(id)
      if (id === sessionId()) summary.value = text
    } catch (err) {
      toast.error(detail(err, "The summary couldn't be refreshed. Try again."))
    } finally {
      refreshingSummary.value = false
    }
  }
  watch(sessionId, () => { summary.value = null })

  // ---- The team's answer, for the next customer ----
  const addingKnowledge = ref(false)
  /**
   * The AI checks the conversation holds a complete answer worth keeping and
   * drafts it without this customer's details; only then does the editor open.
   * Without AI on the plan, or when it can't answer, the editor opens with the
   * conversation's own words (`plain`) to edit by hand.
   */
  async function addToKnowledge(plain: FaqDraft): Promise<void> {
    if (aiLocked) {
      void router.push(faqEditorLink(plain))
      return
    }
    if (addingKnowledge.value) return
    addingKnowledge.value = true
    try {
      const draft = await inboxAssist.knowledge(sessionId())
      if (draft.ready) void router.push(faqEditorLink(draft))
      else toast.info(`Not ready for the help center yet. ${draft.reason}`)
    } catch {
      void router.push(faqEditorLink(plain))
    } finally {
      addingKnowledge.value = false
    }
  }

  return {
    aiLocked, snoozeLocked, savedRepliesLocked, showUpgrade,
    improve,
    summary, refreshingSummary, refreshSummary,
    addingKnowledge, addToKnowledge,
  }
}
