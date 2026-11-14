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

import type { Component } from 'vue'
import type { WidgetMessage } from '../../types/widget'

/**
 * A chat UI layer: what the panel draws beyond a reply's text (cards, commerce,
 * the email check). The build supplies at most one (ui-layer/index.ts); without
 * one, every reply is its text and nothing is lost.
 *
 * Components get the panel's controller by inject(WIDGET_CTX), like the panel's own.
 */
export interface WidgetUiLayer {
    /** The layer's own kind for a message it draws whole (a reply of products), or undefined. */
    messageKind?(message: WidgetMessage): string | undefined
    /** The components for those kinds. Each gets `message` and `index` like the panel's own. */
    messageComponents?: Record<string, Component>
    /** Drawn under an AI answer's text, in order. Each gets `message` and `index`. */
    answerParts?: Component[]
    /** Drawn above the message box while the composer shows. */
    composerTop?: Component[]
    /** Drawn over the whole panel (sheets, dialogs). */
    overlays?: Component[]
    /** The history screen's way to find the visitor's chats from other browsers. */
    historyOthers?: Component
    /** A message from the embedding page the layer handles. Whether it was handled. */
    hostMessage?(data: Record<string, unknown>): boolean
}

/** What the build's layer module exports: a layer, or null when the build has none. */
export type WidgetUiLayerModule = WidgetUiLayer | null

/**
 * The embed loader's side of a layer (the store's cart on the host page). Created
 * once per loader; told when the widget frame is ready and handed the frame's messages.
 */
export interface LoaderExtension {
    /** The widget frame is listening: say what the page offers. */
    announce(): void
    /** A message from the widget frame. Whether it was handled. */
    handleFrameMessage(data: Record<string, unknown>): boolean
    /** The widget is going away. */
    destroy(): void
}
