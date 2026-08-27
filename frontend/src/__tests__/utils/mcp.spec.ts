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
import {
  DEFAULT_MCP_TIMEOUT,
  MAX_MCP_TIMEOUT,
  MIN_MCP_TIMEOUT,
  clampMCPTimeout,
} from '@/utils/mcp'

describe('clampMCPTimeout', () => {
  it('keeps a value the API accepts', () => {
    expect(clampMCPTimeout(120)).toBe(120)
  })

  it('pulls an over-range value down to the maximum', () => {
    // A number input's max doesn't block submission, and the 422 that would
    // come back carries a validation payload rather than a readable message.
    expect(clampMCPTimeout(900)).toBe(MAX_MCP_TIMEOUT)
  })

  it('rounds a fractional value to whole seconds', () => {
    expect(clampMCPTimeout(45.6)).toBe(46)
    expect(clampMCPTimeout(0.4)).toBe(MIN_MCP_TIMEOUT)
  })

  it('falls back to the default when the field is empty or nonsense', () => {
    expect(clampMCPTimeout(undefined)).toBe(DEFAULT_MCP_TIMEOUT)
    expect(clampMCPTimeout(null)).toBe(DEFAULT_MCP_TIMEOUT)
    expect(clampMCPTimeout(NaN)).toBe(DEFAULT_MCP_TIMEOUT)
    expect(clampMCPTimeout(0)).toBe(DEFAULT_MCP_TIMEOUT)
    expect(clampMCPTimeout(-5)).toBe(DEFAULT_MCP_TIMEOUT)
  })
})
