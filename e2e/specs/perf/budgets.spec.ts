import { test, expect, env, AI_REPLY } from '@e2e'

// Size and speed budgets for what every customer's visitor downloads and waits
// for. About 15% headroom over today; raise a budget on purpose, in review, never
// to make a red run green.

const KB = 1024
const BUDGETS = [
  // Raised from 60 KB for the launcher's sizes, icons, logo and animations (~3 KB gzipped).
  { file: 'embed loader (chattermate.min.js)', url: `${env.frontendUrl}/webclient/chattermate.min.js`, maxBytes: 82 * KB },
  { file: 'widget script (widget.js)', url: `${env.backendUrl}/assets/widget.js`, maxBytes: 500 * KB },
  { file: 'widget styles (widget.css)', url: `${env.backendUrl}/assets/widget.css`, maxBytes: 135 * KB },
]

test.describe('performance budgets', () => {
  for (const { file, url, maxBytes } of BUDGETS) {
    test(`${file} stays under ${maxBytes / KB} KB @perf`, async ({ request }) => {
      const body = await (await request.get(url, { headers: { 'Accept-Encoding': 'identity' } })).body()
      expect(body.length, `${file} is ${Math.round(body.length / KB)} KB`).toBeLessThanOrEqual(maxBytes)
    })
  }

  test('the widget is ready and answers within budget, with an instant model @perf @widget', async ({ agent, llm, widget }) => {
    await llm.script(agent, (s) => s.otherwise().reply('Happy to help!'))

    const loadStart = Date.now()
    await widget.embed()
    await widget.open()
    const readyMs = Date.now() - loadStart

    // The fake model answers at once, so this is the platform's own overhead.
    const sendStart = Date.now()
    await widget.send('Hello')
    await expect(widget.lastAgentMessage()).toHaveText('Happy to help!', AI_REPLY)
    const replyMs = Date.now() - sendStart

    test.info().annotations.push({ type: 'timing', description: `ready ${readyMs} ms, reply ${replyMs} ms` })
    expect(readyMs, 'embed → chat ready').toBeLessThan(8_000)
    expect(replyMs, 'send → reply').toBeLessThan(5_000)
  })
})
