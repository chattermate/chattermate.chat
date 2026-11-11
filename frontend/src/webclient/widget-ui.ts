/*
 * Copyright 2024-2026 ChatterMate
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Which widget design an agent's visitors get, from customization_metadata.widget_ui
 * (validated on save; the server serves the classic widget when the redesign is
 * switched off). Anything unexpected means the classic widget.
 */

import type { WidgetUiVersion } from '../types/agent'

interface WithMetadata {
    customization_metadata?: { widget_ui?: { version?: unknown } | null } | null
}

export const widgetUiVersion = (customization?: WithMetadata | null): WidgetUiVersion =>
    customization?.customization_metadata?.widget_ui?.version === 2 ? 2 : 1
