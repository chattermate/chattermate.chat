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
import { looksSecret } from '@/utils/secretGuard'

describe('looksSecret', () => {
  it.each([
    'my key is sk-proj-abcdefghijklmnopqrstuvwxyz123456',
    'token cmat_abcdefghijklmnop1234',
    'AKIAABCDEFGHIJKLMNOP',
    'card 4242 4242 4242 4242',
    'password: hunter2',
    'my api key = abc',
  ])('catches %s', (text) => {
    expect(looksSecret(text)).toBe(true)
  })

  it.each([
    'Order 1234567890123 arrived late',
    'I forgot my password, can you help?',
    'Call +44 7700 900123',
    '',
  ])('lets %s through', (text) => {
    expect(looksSecret(text)).toBe(false)
  })
})
