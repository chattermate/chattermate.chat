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

import type { InjectionKey } from 'vue'

/**
 * Opens the navigation drawer (tablet widths, where the sidebar is off-canvas
 * and the header's menu button opens it). DashboardLayout provides it so a page
 * without the header (the inbox) can offer its own menu button.
 */
export const OPEN_NAV_KEY: InjectionKey<() => void> = Symbol('openNav')
