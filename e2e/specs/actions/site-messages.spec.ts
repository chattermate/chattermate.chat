import { test, expect, AI_REPLY } from '@e2e'

test.describe('What the site tells the widget', () => {
  test('a message the site shows is answered with a chip, and the agent knows what it answers @actions', async ({ agent, widget, llm }) => {
    await llm.script(agent, (s) => s.otherwise().reply('Great, let us start with billing.'))

    await widget.embed({ prompt: { message: 'Want help setting up billing?', suggestions: ['Yes please'], open: true } })
    await expect(widget.agentMessages.last()).toHaveText('Want help setting up billing?')
    await widget.replyChip('Yes please').click()

    await expect(widget.lastAgentMessage()).toHaveText('Great, let us start with billing.', AI_REPLY)
    const sent = (await llm.requests(agent)).at(-1)!
    expect(sent.system).toContain('UNTRUSTED APP MESSAGE')
    expect(sent.system).toContain('Want help setting up billing?')
  })

  test('page context reaches the agent as data @actions', async ({ agent, widget, llm }) => {
    await llm.script(agent, (s) => s.otherwise().reply('You are on the free plan.'))

    await widget.embed({ context: { plan: 'free', step: 'billing' } })
    await widget.open()
    await widget.send('Which plan am I on?')

    await expect(widget.lastAgentMessage()).toHaveText('You are on the free plan.', AI_REPLY)
    const system = (await llm.requests(agent)).at(-1)!.system
    expect(system).toContain('UNTRUSTED APP CONTEXT')
    expect(system).toContain('"plan": "free"')
  })

  test('a pasted password is held back @actions @security', async ({ widget }) => {
    await widget.embed()
    await widget.open()
    await widget.typeOnly('my password: hunter2')

    await expect(widget.secretWarning).toBeVisible()
    await expect(widget.sendButton).toBeDisabled()
  })
})
