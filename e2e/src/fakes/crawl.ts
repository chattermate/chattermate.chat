import type { ApiClient } from '../api/client'
import { addKnowledgeText } from '../api/knowledge'
import { sql, uuid } from '../support/db'

const SITE = /^https:\/\/[a-z0-9.-]+$/i

/** Guards a site address interpolated into SQL. */
function site(value: string): string {
  if (!SITE.test(value)) throw new Error(`not a plain https:// site: ${value}`)
  return value
}

/**
 * Plays the knowledge worker reading a website page by page.
 *
 * A real crawl can't run in this stack: the SSRF guard refuses the local
 * customer site, on purpose. So this does what the worker does to the queue
 * row: marks it processing, counts the stored pages and points it at the
 * source they belong to. The pages themselves are pasted text, so the agent
 * really can answer from them while the "crawl" is still going.
 */
export class FakeCrawl {
  private knowledgeId: number | null = null

  private constructor(
    private readonly api: ApiClient,
    private readonly target: { orgId: string; agentId: string; site: string },
    private readonly queueId: number,
  ) {}

  /** A site someone has just started reading (no queue row of its own yet). */
  static start(api: ApiClient, target: { orgId: string; agentId: string; site: string }): FakeCrawl {
    const id = sql(`
      INSERT INTO knowledge_queue (organization_id, agent_id, source_type, source, status, processing_stage,
        progress_percentage, total_items, processed_items, crawled_urls, priority, pages_learned, updated_at)
      VALUES ('${uuid(target.orgId)}', '${uuid(target.agentId)}', 'website', '${site(target.site)}', 'processing',
        'crawling', 10, 1, 0, '[]', 0, 0, now())
      RETURNING id`)
    return new FakeCrawl(api, target, Number(id))
  }

  /** Takes over a site already queued (e.g. by the setup assistant), as the worker picks it up. */
  static pickUp(api: ApiClient, target: { orgId: string; agentId: string; site: string }): FakeCrawl {
    const id = sql(`
      UPDATE knowledge_queue SET status = 'processing', processing_stage = 'crawling', updated_at = now()
      WHERE id = (SELECT id FROM knowledge_queue
                  WHERE agent_id = '${uuid(target.agentId)}' AND source = '${site(target.site)}'
                  ORDER BY id DESC LIMIT 1)
      RETURNING id`)
    if (!id) throw new Error(`nothing queued for ${target.site}`)
    return new FakeCrawl(api, target, Number(id))
  }

  /**
   * The site has stored `pages` pages so far. The first call makes its source,
   * as the worker does with the first stored page; `content` is what those
   * pages say.
   */
  async storePages(pages: number, content = 'We sell handmade ceramic mugs.'): Promise<void> {
    if (this.knowledgeId === null) {
      this.knowledgeId = await addKnowledgeText(this.api, {
        // Named as the worker names it, so the dashboard sees one source
        orgId: this.target.orgId, agentId: this.target.agentId, title: this.target.site, content,
      })
    }
    sql(`UPDATE knowledge_queue SET pages_learned = ${Math.trunc(pages)}, knowledge_id = ${this.knowledgeId},
         updated_at = now() WHERE id = ${this.queueId}`)
  }

  /** The crawl reached the end. */
  finish(): void {
    sql(`UPDATE knowledge_queue SET status = 'completed', processing_stage = 'completed', progress_percentage = 100,
         updated_at = now() WHERE id = ${this.queueId}`)
  }
}
