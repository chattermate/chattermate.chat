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

/// <reference path="./virtual-modules.d.ts" />

/**
 * The panel's chat UI layer. The build decides which (scripts/widget-ext.ts
 * resolves `virtual:cm-widget-ext`); until a build supplies one, the cards and
 * commerce the panel has today stand in (builtin.ts).
 */

import installed from 'virtual:cm-widget-ext'
import { BUILTIN_LAYER } from './builtin'
import type { WidgetUiLayer } from './types'
import type { WidgetMessage } from '../../types/widget'

export type { WidgetUiLayer } from './types'

export const uiLayer: WidgetUiLayer = installed ?? BUILTIN_LAYER

/** The layer's component for a message it draws whole, or undefined. */
export function layerComponentFor(message: WidgetMessage) {
    const kind = uiLayer.messageKind?.(message)
    return kind ? uiLayer.messageComponents?.[kind] : undefined
}

/** Hands a message from the embedding page to the layer. Whether it took it. */
export function layerHostMessage(data: Record<string, unknown>): boolean {
    return uiLayer.hostMessage?.(data) === true
}
