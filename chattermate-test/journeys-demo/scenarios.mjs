// What the Ledgerly demo declares on its agent. journeys-demo.html registers
// the code for every action here; seed.mjs saves them and the journeys.

export const AGENT = {
  name: 'Ledgerly guide',
  displayName: 'Ledgerly guide',
  instructions: [
    'You are the in-app guide for Ledgerly, a small-business invoicing app.',
    'Help the signed-in user get set up and send invoices. Keep answers to two or three sentences.',
    'Use the app actions when they do what the user asked; never claim something was done unless an action said so.',
    'Ledgerly plans: Free (5 invoices a month) and Pro ($12 a month, unlimited invoices, reminders, reports).',
    'Refunds: Pro is refundable within 14 days of payment, from Settings → Billing.',
  ],
}

const object = (properties, required = []) => ({ type: 'object', properties, required })

export const ACTIONS = [
  {
    name: 'open_page', label: 'Open a page', confirm: 'never',
    description: 'Opens a page of Ledgerly for the user: /app/dashboard, /app/clients, /app/invoices, /app/invoices/new or /app/settings.',
    parameters: object({ path: { type: 'string', enum: ['/app/dashboard', '/app/clients', '/app/invoices', '/app/invoices/new', '/app/settings'] } }, ['path']),
  },
  {
    name: 'set_currency', label: 'Set default currency', confirm: 'when_overwriting',
    description: "Sets the account's default currency, a 3-letter code such as GBP or EUR. Defaults to GBP.",
    parameters: object({ code: { type: 'string', minLength: 3, maxLength: 3 } }),
  },
  {
    name: 'create_client', label: 'Add a client', confirm: 'never',
    description: 'Adds a client the user can invoice. Defaults to a sample client, Acme Ltd.',
    parameters: object({ name: { type: 'string' }, email: { type: 'string' } }),
  },
  {
    name: 'create_invoice_draft', label: 'Draft an invoice', confirm: 'never',
    description: "Drafts an invoice for one of the user's clients (by name) for an amount in the default currency. Defaults to the latest client and 100.",
    parameters: object({ client: { type: 'string' }, amount: { type: 'number', minimum: 1 } }),
  },
  {
    name: 'send_invoice', label: 'Send an invoice', confirm: 'always',
    description: "Emails the user's latest draft invoice to its client.",
    parameters: object({}),
  },
  {
    name: 'start_checkout', label: 'Open checkout', confirm: 'always',
    description: 'Opens the checkout to upgrade to Pro. The user pays there; this never charges anything itself.',
    parameters: object({ plan: { type: 'string', enum: ['pro'] } }),
  },
  {
    name: 'export_data', label: 'Export all data', confirm: 'never',
    description: "Exports the user's clients and invoices as a CSV file.",
    parameters: object({}),
  },
]

const url = (value) => ({ kind: 'url', value })
const event = (value) => ({ kind: 'event', value })
const action = (value) => ({ kind: 'action', value })
const actionChip = (label, value) => ({ label, kind: 'action', value })
const textChip = (label, value = label) => ({ label, kind: 'text', value })

export const JOURNEYS = [
  {
    key: 'first_invoice', name: 'First invoice', status: 'live', priority: 10, auto_open: true,
    goal_event: 'invoice_sent',
    definition: {
      audience: { kind: 'everyone', rules: [] },
      start: url('/app/dashboard*'),
      finish: { message: "That's your first invoice out, {{user.first_name}}. Nice work!" },
      variable_fallbacks: { 'user.first_name': 'there' },
      steps: [
        {
          id: 'currency', title: 'Pick your currency', skippable: true,
          message: "Hi {{user.first_name}}, let's get your first invoice out. Your invoices are in {{ctx.currency}} right now. Is that the currency you bill in?",
          chips: [actionChip('Switch to GBP', 'set_currency'), textChip('I bill in euros', 'I bill in euros, please switch me to EUR')],
          allowed_actions: ['set_currency'],
          done_when: [action('set_currency'), event('currency_set')],
        },
        {
          id: 'client', title: 'Add your first client', skippable: true,
          message: "Who's your first client? Give me a name and email, or I can add a sample one to try things out.",
          chips: [actionChip('Add a sample client', 'create_client')],
          allowed_actions: ['create_client'],
          done_when: [event('client_created'), { kind: 'ctx', value: 'clients_count', op: 'gte', operand: 1 }],
        },
        {
          id: 'invoice', title: 'Send your first invoice', skippable: false,
          triggers: [url('/app/invoices*')],
          message: 'What is the first invoice for? Tell me the amount, or I can draft one for 100 to start.',
          chips: [actionChip('Draft one for me', 'create_invoice_draft'), actionChip('Send my latest draft', 'send_invoice')],
          allowed_actions: ['create_invoice_draft', 'send_invoice'],
          done_when: [event('invoice_sent')],
          nudge: { after_min: 1, message: 'Still there? Tell me the amount and I can draft and send it for you.' },
        },
      ],
    },
  },
  {
    key: 'trial_to_paid', name: 'Trial to paid', status: 'live', priority: 5, auto_open: true,
    goal_event: 'subscription_started',
    definition: {
      // Only free users, by what your server signed into their token.
      audience: { kind: 'rules', rules: [{ kind: 'user', value: 'plan', op: 'eq', operand: 'free' }] },
      start: { kind: 'manual' },
      finish: { message: 'Welcome to Pro!' },
      variable_fallbacks: {},
      steps: [
        {
          id: 'value', title: 'See what Pro adds', skippable: true,
          message: 'Your trial ends soon. You have sent {{ctx.invoices_count}} invoices. Pro keeps them unlimited and adds reminders.',
          chips: [actionChip('Upgrade me to Pro', 'start_checkout'), textChip('What does Pro cost?')],
          allowed_actions: ['start_checkout'],
          done_when: [event('subscription_started')],
        },
      ],
    },
  },
  {
    key: 'reports_tip', name: 'Reports tip', status: 'live', priority: 1, auto_open: false,
    goal_event: null,
    definition: {
      audience: { kind: 'rules', rules: [{ kind: 'user', value: 'plan', op: 'eq', operand: 'pro' }] },
      start: event('reports_opened'),
      finish: { message: '' },
      variable_fallbacks: {},
      steps: [
        {
          id: 'export', title: 'Export your numbers', skippable: true,
          message: 'You can export every client and invoice as a CSV. Want one now?',
          chips: [actionChip('Export my data', 'export_data')],
          allowed_actions: ['export_data'],
          done_when: [action('export_data'), event('export_done')],
        },
      ],
    },
  },
]
