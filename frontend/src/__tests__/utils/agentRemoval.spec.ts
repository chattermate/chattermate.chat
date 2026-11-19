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

import { describe, it, expect } from 'vitest'
import { removalConsequences } from '@/utils/agentRemoval'

describe('removalConsequences', () => {
  it('says nothing for an agent with nothing attached', () => {
    expect(removalConsequences({ widgets: 0, channels: 0, workflows: 0 })).toEqual([])
  })

  it('names each kind once, singular', () => {
    expect(removalConsequences({ widgets: 1, channels: 1, workflows: 1 })).toEqual([
      "Its chat widget stops working on any site where it's installed.",
      '1 channel it answers is left without an agent.',
      'Its workflow is deleted.',
    ])
  })

  it('counts several', () => {
    expect(removalConsequences({ widgets: 2, channels: 3, workflows: 4 })).toEqual([
      "Its 2 chat widgets stop working on any site where they're installed.",
      '3 channels it answers are left without an agent.',
      'Its 4 workflows are deleted.',
    ])
  })
})
