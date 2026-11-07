import { test, expect, channels, createGroup, connectEmail, listChannelAccounts, unique, AI_REPLY } from '@e2e'

// What an Agent-role teammate may do, checked at the API — the UI hiding a link
// proves nothing about who the server lets through.

/** Admin-only operations, each with a body the endpoint would accept from an admin. */
const ADMIN_ONLY: Array<{ method: string; path: string; data?: Record<string, unknown> }> = [
  { method: 'GET', path: '/ai/config' },
  { method: 'POST', path: '/ai/setup', data: { model_type: 'OPENAI', model_name: 'gpt-6-luna', api_key: 'sk-test' } },
  { method: 'GET', path: '/users' },
  { method: 'POST', path: '/users', data: { email: 'blocked@e2e.example.com', full_name: 'Blocked', password: 'E2e-Blocked-Passw0rd!', role_id: 1 } },
  { method: 'GET', path: '/roles' },
  { method: 'GET', path: '/groups' },
  { method: 'POST', path: '/groups', data: { name: 'Blocked group' } },
  { method: 'GET', path: '/agent/list' },
  { method: 'POST', path: '/agent', data: { name: 'Blocked agent', instructions: ['x'] } },
  { method: 'GET', path: '/widget-apps' },
  { method: 'GET', path: '/tickets/settings' },
  { method: 'PUT', path: '/tickets/settings', data: {} },
  { method: 'POST', path: '/channels/telegram', data: { bot_token: '1:blocked' } },
  { method: 'GET', path: '/mcp-tools' },
]

test.describe('Agent role', () => {
  test('is refused every admin operation by the API @team', async ({ makeMember }) => {
    const agent = await makeMember({ role: 'Agent' })

    const refused = await Promise.all(ADMIN_ONLY.map(async ({ method, path, data }) =>
      `${method} ${path} → ${(await agent.api.raw(method, path, { data })).status()}`))

    expect(refused).toEqual(ADMIN_ONLY.map(({ method, path }) => `${method} ${path} → 403`))
    // The same token works where an agent belongs.
    expect((await agent.api.raw('GET', '/chats/recent')).status()).toBe(200)
  })

  test('sees the connected channels for the inbox, but never their webhook secrets @team', async ({ adminApi, makeMember }) => {
    const inbox = await connectEmail(adminApi, `${unique('support')}@e2e.example.com`)
    expect(inbox.webhook_url).toContain('token=')

    const agent = await makeMember({ role: 'Agent' })
    const seen = (await listChannelAccounts(agent.api)).find((a) => a.id === inbox.id)

    expect(seen).toBeDefined()
    expect(seen?.webhook_url ?? null).toBeNull()
  })

  test('with "assigned only" sees their own group\'s handed-over chats and not another group\'s @team @handover', async ({ adminApi, makeMember, makeAgent, llm, request }) => {
    // Two teams, each with an AI agent that hands over to it.
    const groupA = await createGroup(adminApi, unique('Team A'), [])
    const groupB = await createGroup(adminApi, unique('Team B'), [])
    const alice = await makeMember({ role: 'Agent', groupIds: [groupA], seeAllAiChats: false })
    await makeMember({ role: 'Agent', groupIds: [groupB] }) // someone online in B, so B's handover happens
    const agentA = await makeAgent({ transferToHuman: true }, [groupA])
    const agentB = await makeAgent({ transferToHuman: true }, [groupB])
    for (const agent of [agentA, agentB]) {
      await llm.script(agent, (s) => s.otherwise().handOver('Let me connect you with a teammate.'))
    }

    const forA = (await channels.WhatsApp({ api: adminApi, request, agentId: agentA.id })).chatWith(unique('Ana'))
    const forB = (await channels.WhatsApp({ api: adminApi, request, agentId: agentB.id })).chatWith(unique('Ben'))
    await forA.send('I need a person')
    await forB.send('I need a person')
    await expect.poll(() => forA.replies(), AI_REPLY).toHaveLength(1)
    await expect.poll(() => forB.replies(), AI_REPLY).toHaveLength(1)

    const visibleTo = async () => (await alice.api.get<Array<{ agent: { id: string }; session_id: string }>>('/chats/recent', { params: { limit: 100 } }))
    const agentsAliceSees = (await visibleTo()).map((c) => String(c.agent.id))
    expect(agentsAliceSees).toContain(agentA.id)
    expect(agentsAliceSees).not.toContain(agentB.id)

    // Opening B's chat directly is refused too, not just hidden from the list.
    const allChats = await adminApi.get<Array<{ agent: { id: string }; session_id: string }>>('/chats/recent', { params: { limit: 100, agent_id: agentB.id } })
    const bSession = allChats.find((c) => String(c.agent.id) === agentB.id)!.session_id
    expect([403, 404]).toContain((await alice.api.raw('GET', `/chats/${bSession}`)).status())
  })
})
