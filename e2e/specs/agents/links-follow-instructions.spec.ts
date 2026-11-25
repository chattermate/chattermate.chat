import { test, expect, AI_REPLY } from '@e2e'

// The knowledge tool's "share the URLs search returns" rule used to read as an
// absolute, and it beat an agent's own "never share links".
test('the agent is told its own instructions on links win over sharing search-result URLs @agents', async ({ agent, widget, llm }) => {
  await llm.script(agent, (s) => s.otherwise().reply('We handle property disputes.'))

  await widget.embed()
  await widget.open()
  await widget.send('What services do you offer?')
  await expect(widget.lastAgentMessage()).toHaveText('We handle property disputes.', AI_REPLY)

  const system = ((await llm.requests(agent)).at(-1)?.system ?? '').replace(/\s+/g, ' ')
  expect(system).toContain("Always preserve and share URLs that are relevant to the customer's query.")
  expect(system).toContain('If your instructions above say not to share links, URLs or web addresses, they win over this')
})
