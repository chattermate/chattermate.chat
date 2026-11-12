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

import { afterEach, describe, expect, it } from 'vitest'
import { takePrefetchedWidgetData } from '@/webclient/prefetched-widget-data'

const TOKEN = 'header.payload.sig'

function boot(widgetData?: unknown, initialToken = TOKEN) {
  ;(window as any).__INITIAL_DATA__ = { widgetId: 'w', agentName: 'A', customization: {}, customerId: '', customer: {}, initialToken, widgetData }
}

describe('takePrefetchedWidgetData', () => {
  afterEach(() => { delete (window as any).__INITIAL_DATA__ })

  it('answers the first request with what /bootstrap sent', async () => {
    boot({ status: 200, data: { id: 'w', token: 'bound' } })
    const response = takePrefetchedWidgetData(TOKEN, null)!
    expect(response.ok).toBe(true)
    expect(await response.json()).toEqual({ id: 'w', token: 'bound' })
  })

  it('is used once', () => {
    boot({ status: 200, data: {} })
    expect(takePrefetchedWidgetData(TOKEN, null)).not.toBeNull()
    expect(takePrefetchedWidgetData(TOKEN, null)).toBeNull()
  })

  it('passes a refusal on as the same status and detail', async () => {
    boot({ status: 401, detail: 'Unauthorized' })
    const response = takePrefetchedWidgetData(TOKEN, null)!
    expect(response.status).toBe(401)
    expect(await response.json()).toEqual({ detail: 'Unauthorized' })
  })

  it('is not used for another token, and is dropped', () => {
    boot({ status: 200, data: {} })
    expect(takePrefetchedWidgetData('rotated.token.sig', null)).toBeNull()
    expect(takePrefetchedWidgetData(TOKEN, null)).toBeNull()
  })

  it('is not used once the visitor gave an email', () => {
    boot({ status: 200, data: {} })
    expect(takePrefetchedWidgetData(TOKEN, 'me@example.com')).toBeNull()
  })

  it('is nothing on a page /bootstrap did not start', () => {
    boot(undefined)
    expect(takePrefetchedWidgetData(TOKEN, null)).toBeNull()
    delete (window as any).__INITIAL_DATA__
    expect(takePrefetchedWidgetData(TOKEN, null)).toBeNull()
  })
})
