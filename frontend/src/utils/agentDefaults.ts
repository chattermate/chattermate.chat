/*
Copyright 2024-2026 ChatterMate

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

/** Starter instructions per agent type, prefilled so setup is quick. */
export const AGENT_TYPE_DEFAULTS: Record<string, string> = {
  customer_support: 'Be concise, friendly, and empathetic. Answer questions using the knowledge base. Escalate billing or account issues to a human agent.',
  sales: 'Be enthusiastic and helpful. Highlight product benefits, answer pricing questions, and guide visitors toward booking a demo or starting a trial. Capture lead details when it feels natural.',
  tech_support: 'Be clear and patient. Help users troubleshoot step by step using the documentation. Ask for error messages or screenshots when needed, and escalate unresolved issues to a human.',
  general: 'Be helpful, concise, and friendly. Answer questions accurately using the knowledge base, and hand off to a human when a request needs personal attention.',
}
