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
 * Whether a message looks like it holds a password, API key or card number.
 * The widget's composer refuses to send such a message. The server hides the
 * same patterns (backend/app/utils/secret_redaction.py) as a backstop: keep
 * the two lists in step.
 */

export const SECRET_WARNING = "Please don't paste passwords or keys here."

const KEY_PATTERNS = [
  /\bsk-(?:proj-|ant-)?[A-Za-z0-9_-]{20,}/,
  /\bcmat_[A-Za-z0-9_-]{16,}/,
  /\bAKIA[0-9A-Z]{16}\b/,
  /\bgh[pousr]_[A-Za-z0-9]{30,}/,
  /\bxox[abposr]-[A-Za-z0-9-]{10,}/,
]
const LABELLED = /\b(password|passwd|pwd|passcode|api[ _-]?key|secret)\s*(?:is|:|=)\s*\S+/i
const CARD = /\b(?:\d[ -]?){12,18}\d\b/g

function luhnValid(digits: string): boolean {
  let total = 0
  for (let i = 0; i < digits.length; i++) {
    let value = Number(digits[digits.length - 1 - i])
    if (i % 2 === 1) {
      value *= 2
      if (value > 9) value -= 9
    }
    total += value
  }
  return total % 10 === 0
}

export function looksSecret(text: string): boolean {
  if (!text) return false
  if (KEY_PATTERNS.some((pattern) => pattern.test(text))) return true
  if (LABELLED.test(text)) return true
  return (text.match(CARD) || []).some((match) => {
    const digits = match.replace(/\D/g, '')
    return digits.length >= 13 && digits.length <= 19 && luhnValid(digits)
  })
}
