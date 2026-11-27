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

import { knowledgeService } from '@/services/knowledge'
import { organizationService } from '@/services/organization'
import { signupSiteUrl } from '@/utils/website'

/** The wizard waits this long before moving on without an answer. */
export const SIGNUP_SITE_TIMEOUT_MS = 10000

const send = async (organizationId: string, agentId: string): Promise<boolean> => {
  const organization = await organizationService.getOrganization(organizationId)
  const url = signupSiteUrl(organization?.domain)
  if (!url) return false
  const response = await knowledgeService.addUrls(organizationId, [url], agentId)
  return !response?.error
}

/**
 * Starts reading the website given at signup, so a new agent has something to
 * answer from even if its owner never gets past Create. True when the server
 * took it. Never throws: when it can't be sent (no room on the plan, say), the
 * Teach step still suggests it.
 */
export async function learnSignupSite(organizationId: string, agentId: string): Promise<boolean> {
  let timer: ReturnType<typeof setTimeout> | undefined
  const gaveUp = new Promise<boolean>((resolve) => {
    timer = setTimeout(() => resolve(false), SIGNUP_SITE_TIMEOUT_MS)
  })
  try {
    return await Promise.race([send(organizationId, agentId), gaveUp])
  } catch (err) {
    console.error('Failed to start reading the signup website:', err)
    return false
  } finally {
    clearTimeout(timer)
  }
}
