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

/**
 * What the org's plan lets the widget show (the server's widget_plan.py, served as
 * planFeatures). The server refuses the same things; this only keeps the panel
 * from offering them.
 */

/** The visitor's own past chats; shopping in the chat (options, Add to cart, cart bar). */
export type WidgetPlanFeature = 'conversation_history' | 'shop_in_chat'

/** Whether the plan allows `feature`. Allowed unless the server says no: the
 * dashboard preview and an older backend send no flags. */
export function planAllows(feature: WidgetPlanFeature): boolean {
    return window.__INITIAL_DATA__?.planFeatures?.[feature] !== false
}
