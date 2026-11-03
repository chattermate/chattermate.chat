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

import { ref, watch, type Ref } from 'vue'
import type { ActionOutcome } from '../webclient/actions/hostActionsClient'
import { describeOutcome, type ActionReceipt } from '../webclient/actions/receipts'

/**
 * The chat's lines about in-app actions. They live beside the messages rather
 * than in them (they're the widget's, never sent or stored), each pinned after
 * the message it followed so it stays in place as the conversation grows.
 */
export function useActionReceipts(messages: Ref<unknown[]>) {
  const receipts = ref<Array<{ after: number; receipt: ActionReceipt }>>([])

  function add(outcome: ActionOutcome) {
    receipts.value.push({ after: messages.value.length, receipt: describeOutcome(outcome) })
  }

  /** The lines that follow the first `count` messages and come before the next one. */
  function after(count: number): ActionReceipt[] {
    return receipts.value.filter((r) => r.after === count).map((r) => r.receipt)
  }

  // A new conversation (or a shorter reload of this one) leaves nothing to pin to.
  watch(() => messages.value.length, (length) => {
    if (length === 0) receipts.value = []
    else if (receipts.value.some((r) => r.after > length)) {
      receipts.value = receipts.value.filter((r) => r.after <= length)
    }
  })

  return { receipts, addReceipt: add, receiptsAfter: after }
}
