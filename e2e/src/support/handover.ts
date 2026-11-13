import type { ChatWidget } from '../components/chat-widget'
import type { FakeLlm } from '../fakes/llm'
import type { TestAgent } from '../fixtures'

/** A named customer (the contact form follows a handover) waiting for the team */
export async function askForAPerson(agent: TestAgent, widget: ChatWidget, llm: FakeLlm): Promise<void> {
  await llm.script(agent, (s) => s
    .when(/human|person/i).handOver('Connecting you with a teammate.')
    .otherwise().reply('Happy to help!'))
  await widget.embed()
  await widget.open()
  await widget.send('I want to talk to a person')
  await widget.shareContactDetails()
}
