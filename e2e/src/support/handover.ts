import type { ChatWidget } from '../components/chat-widget'
import type { FakeLlm, Script } from '../fakes/llm'
import type { TestAgent } from '../fixtures'

/**
 * A named customer (the contact form follows a handover) waiting for the team.
 * `first` adds rules ahead of the handover's, e.g. for the inbox's AI help.
 */
export async function askForAPerson(
  agent: TestAgent, widget: ChatWidget, llm: FakeLlm, first: (script: Script) => Script = (s) => s,
): Promise<void> {
  await llm.script(agent, (s) => first(s)
    .when(/human|person/i).handOver('Connecting you with a teammate.')
    .otherwise().reply('Happy to help!'))
  await widget.embed()
  await widget.open()
  await widget.send('I want to talk to a person')
  await widget.shareContactDetails()
}
