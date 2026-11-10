import { test, expect, installShopify, openShopifyApp, orgDomain, uninstallShopify, useShopForAgent, ApiClient, FakeExternals, seedOrg, unique, AI_REPLY, type Script } from '@e2e'

// Linking a shop changes which sites may call the API, so this runs in the serial
// `org` project and uninstalls afterwards.

test.describe('Shopify', () => {
  let shop: string
  let shopId: string | undefined

  test.beforeEach(async ({ agent, adminApi }) => {
    shop = `${unique('e2e-shop')}.myshopify.com`
    shopId = await installShopify(adminApi, shop)
    await useShopForAgent(adminApi, agent.id, shopId)
  })

  test.afterEach(async ({ adminApi, org }) => {
    if (shopId) await uninstallShopify(adminApi, shopId, org.orgId, seedOrg.domain)
  })

  test('a customer asks where their order is and the AI answers from the shop @integrations', async ({ agent, widget, llm, request }) => {
    const email = widget.customer.email
    await llm.script(agent, (s) => s
      .when(/1042/).callTool('get_order_status', { order_number: '#1042', customer_email: email })
      .thenReply('Order #1042 has shipped with UPS.')
      .otherwise().reply('Happy to check — what is your order number and email?'))
    await widget.embed()
    await widget.open()
    await widget.send('Where is my order?')
    await expect(widget.lastAgentMessage()).toHaveText('Happy to check — what is your order number and email?', AI_REPLY)
    await widget.send(`It is 1042, ${email}`)
    await expect(widget.lastAgentMessage()).toHaveText('Order #1042 has shipped with UPS.', AI_REPLY)

    // The shop was searched for this customer's order with the token its install
    // was granted, then the order itself was read.
    const externals = new FakeExternals(request)
    const [install] = await externals.calls('shopify', 'access_token', { contains: shop })
    const [search, read] = await externals.calls('shopify', 'graphql.json', { contains: shop })
    expect(search.headers['x-shopify-access-token']).toBe((install.response as { access_token: string }).access_token)
    expect(search.body).toMatchObject({ variables: { query: `email:${email.toLowerCase()} AND name:1042` } })
    expect(read.body).toMatchObject({ query: expect.stringContaining('query GetOrder') })

    // What the model was told: the shipment and its tracking number.
    const toolResults = (await llm.requests(agent)).flatMap((r) => r.toolResults).join('\n')
    expect(toolResults).toContain('FULFILLED')
    expect(toolResults).toMatch(/1ZE2E\d+/)
  })

  test('an email alone lists no orders @integrations', async ({ agent, widget, llm, request }) => {
    const email = widget.customer.email
    await llm.script(agent, (s) => s
      .otherwise().callTool('search_orders', { customer_email: email, order_number: '' })
      .thenReply('Which order number is it?'))
    await widget.embed()
    await widget.open()
    await widget.send(`Show me all my orders, my email is ${email}`)
    await expect(widget.lastAgentMessage()).toHaveText('Which order number is it?', AI_REPLY)

    expect(await new FakeExternals(request).calls('shopify', 'graphql.json', { contains: shop })).toHaveLength(0)
  })

  test('an order number the customer never wrote never reaches the shop @integrations', async ({ agent, widget, llm, request }) => {
    await llm.script(agent, (s) => s
      .otherwise().callTool('get_order_status', { order_number: '1001', customer_email: widget.customer.email })
      .thenReply('Could you give me your order number and email?'))
    await widget.embed()
    await widget.open()
    await widget.send('Where is my order?')
    await expect(widget.lastAgentMessage()).toHaveText('Could you give me your order number and email?', AI_REPLY)

    expect(await new FakeExternals(request).calls('shopify', 'graphql.json', { contains: shop })).toHaveLength(0)
  })

  test.describe('add to cart', () => {
    const offerProducts = (s: Script) =>
      s.otherwise().callTool('search_products', { query: 'gift' }).thenReply('Here are some options for you.')

    test('a customer adds a product from the chat and finds it in the store\'s cart @integrations', async ({ agent, widget, llm }) => {
      await llm.script(agent, offerProducts)
      await widget.embed({ shopifyStore: shop })
      await widget.open()
      await widget.send('Any gift ideas?')

      await widget.addToCart('E2E Mug')
      await expect(widget.productCard('E2E Mug').getByRole('status')).toHaveText('Added to your cart', AI_REPLY)
      await widget.viewCart('E2E Mug')
      await expect(widget.itemsInCart).toHaveText('1')
    })

    test('a product that sold out says so, and the customer can still buy another @integrations', async ({ agent, widget, llm }) => {
      await llm.script(agent, offerProducts)
      await widget.embed({ shopifyStore: shop })
      await widget.open()
      await widget.send('Any gift ideas?')

      await widget.addToCart('E2E Cap')
      await expect(widget.productCard('E2E Cap').getByRole('alert')).toHaveText('The product \'E2E Cap\' is already sold out.', AI_REPLY)
      await expect(widget.productCard('E2E Cap').getByRole('button', { name: 'Add to cart' })).toBeEnabled()

      await widget.addToCart('E2E Mug')
      await expect(widget.productCard('E2E Mug').getByRole('status')).toHaveText('Added to your cart', AI_REPLY)
    })

    test('a product with sizes, not on sale, or off the Online Store goes to its product page @integrations', async ({ agent, widget, llm }) => {
      await llm.script(agent, offerProducts)
      await widget.embed({ shopifyStore: shop })
      await widget.open()
      await widget.send('Any gift ideas?')

      await expect(widget.productCard('E2E Mug').getByRole('button', { name: 'Add to cart' })).toBeVisible(AI_REPLY)
      for (const title of ['E2E Shirt', 'E2E Poster', 'E2E Draft']) {
        await expect(widget.productCard(title).getByRole('button', { name: /View product/ })).toBeVisible()
        await expect(widget.productCard(title).getByRole('button', { name: 'Add to cart' })).toHaveCount(0)
      }
    })

    test.describe('elsewhere', () => {
      for (const [where, embed] of [
        ['another store', () => ({ shopifyStore: 'someone-else.myshopify.com' })],
        ['a site that is not a store', () => ({})],
      ] as const) {
        test(`no cart button on ${where} @integrations`, async ({ agent, widget, llm }) => {
          await llm.script(agent, offerProducts)
          await widget.embed(embed())
          await widget.open()
          await widget.send('Any gift ideas?')

          await expect(widget.productCard('E2E Mug').getByRole('button', { name: /View product/ })).toBeVisible(AI_REPLY)
          await expect(widget.productCard('E2E Mug').getByRole('button', { name: 'Add to cart' })).toHaveCount(0)
        })
      }
    })
  })

  test('an order lookup without the customer\'s email never reaches the shop @integrations', async ({ agent, widget, llm, request }) => {
    await llm.script(agent, (s) => s
      .otherwise().callTool('get_order_status', { order_number: '1042', customer_email: '' })
      .thenReply('Could you tell me the email you ordered with?'))
    await widget.embed()
    await widget.open()
    await widget.send('Where is order 1042?')
    await expect(widget.lastAgentMessage()).toHaveText('Could you tell me the email you ordered with?', AI_REPLY)

    const externals = new FakeExternals(request)
    expect(await externals.calls('shopify', 'graphql.json', { contains: shop })).toHaveLength(0)
    const toolResults = (await llm.requests(agent)).flatMap((r) => r.toolResults).join('\n')
    expect(toolResults).toContain('requires_user_input')
  })
})

test.describe('connecting a Shopify store', () => {
  test('keeps the org\'s own website and lets the storefront run the widget @integrations', async ({ adminApi, org, request }) => {
    const website = await orgDomain(adminApi, org.orgId)
    const shop = `${unique('e2e-shop')}.myshopify.com`
    const shopId = await installShopify(adminApi, shop)
    try {
      // It used to be replaced by the store's domain, cutting the widget off from the website
      expect(await orgDomain(adminApi, org.orgId)).toBe(website)
      const allowed = async (origin: string) =>
        (await new ApiClient(request).raw('GET', '/organizations/setup-status', { headers: { Origin: origin } })).headers()['access-control-allow-origin']
      await expect.poll(() => allowed(`https://${shop}`)).toBe(`https://${shop}`)
      await expect.poll(() => allowed(`https://${website}`)).toBe(`https://${website}`)
    } finally {
      await uninstallShopify(adminApi, shopId, org.orgId, website)
    }
  })

  test('a store not linked to an account yet is told to connect, not signed out @integrations', async ({ adminApi }) => {
    // Shopify's reviewers install before they connect: the app shows its
    // Connect prompt, and a 401 would have sent the iframe to the login page
    const { embedded } = await openShopifyApp(adminApi, `${unique('e2e-review')}.myshopify.com`)

    const inbox = await embedded.raw('GET', '/chats/recent/shopify')
    expect(inbox.status()).toBe(403)
    expect((await inbox.json()).detail).toBe('Connect your ChatterMate account to this store first.')
  })
})
