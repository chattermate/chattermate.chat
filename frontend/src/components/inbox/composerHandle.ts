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

import type { InjectionKey, Ref } from 'vue'

/**
 * What a tool in the composer's tool row (the #tools slot: the enterprise
 * module's saved replies, Improve) may do with the reply being written.
 * ThreadComposer provides it; a tool injects it.
 */
export interface ComposerHandle {
  /** The reply's text (writing it replaces the draft) */
  text: Ref<string>
  /** The reply box, for the caret and focus */
  input: Readonly<Ref<HTMLTextAreaElement | null>>
  /**
   * Sees each key pressed in the reply box before the composer does; returning
   * true means the tool handled it (a picker's arrows, Enter, Escape).
   * Returns the function that removes it.
   */
  onKeydown: (handler: (event: KeyboardEvent) => boolean) => () => void
}

export const COMPOSER_HANDLE: InjectionKey<ComposerHandle> = Symbol('composerHandle')
