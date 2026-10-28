import type { ApiClient } from './client'

/**
 * Pasted-text knowledge is indexed synchronously, so it is searchable as soon as
 * this returns. Returns the source's id.
 *
 * Without `agentId` it is an organization source: linked to no agent while the
 * org has several, but the backend gives it to the org's only agent.
 */
export async function addKnowledgeText(
  api: ApiClient,
  source: { orgId: string; agentId?: string; title: string; content: string },
): Promise<number> {
  const body = await api.post<{ knowledge: { id: number } }>('/knowledge/add/text', {
    data: { org_id: source.orgId, agent_id: source.agentId, title: source.title, content: source.content },
  })
  return body.knowledge.id
}

/** Uploads a PDF to the knowledge base. It is queued; the knowledge worker indexes it. */
export async function uploadKnowledgePdf(
  api: ApiClient,
  source: { orgId: string; agentId: string; filename: string; pdf: Buffer },
): Promise<void> {
  await api.post('/knowledge/upload/pdf', {
    multipart: {
      org_id: source.orgId,
      agent_id: source.agentId,
      files: { name: source.filename, mimeType: 'application/pdf', buffer: source.pdf },
    },
  })
}

/**
 * The agent's sources the knowledge worker has not finished: pending or still
 * processing, and any that failed (with why). Empty once everything is indexed.
 */
export async function unfinishedKnowledge(
  api: ApiClient,
  agentId: string,
): Promise<{ source: string; status: string; error: string | null }[]> {
  const body = await api.get<{ queue_items: { source: string; status: string; error: string | null }[] }>(
    `/knowledge/queue/agent/${agentId}`,
  )
  return body.queue_items.map(({ source, status, error }) => ({ source, status, error }))
}

export async function deleteKnowledge(api: ApiClient, knowledgeId: number): Promise<void> {
  await api.delete(`/knowledge/${knowledgeId}`)
}
