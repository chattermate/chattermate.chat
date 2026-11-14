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

import { existsSync } from 'fs'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import type { Plugin as EsbuildPlugin } from 'esbuild'
import type { Plugin as VitePlugin } from 'vite'

// Which chat UI layer a build bundles: the enterprise module's when it is checked
// out (and NO_ENTERPRISE is not set), else none. One bundle either way, so the
// layer shares the widget's Vue instead of loading its own.

const frontendDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')

const EXTENSIONS = {
  /** The widget panel's layer (src/webclient/ui-layer). */
  'virtual:cm-widget-ext': {
    enterprise: 'src/modules/enterprise/widget/index.ts',
    none: 'src/webclient/ui-layer/no-layer.ts',
  },
  /** The embed loader's side of it (src/webclient/chattermate.js). */
  'virtual:cm-loader-ext': {
    enterprise: 'src/modules/enterprise/widget/loader.js',
    none: 'src/webclient/loader/no-extension.js',
  },
} as const

export type ExtensionId = keyof typeof EXTENSIONS

const enterpriseAllowed = () => process.env.NO_ENTERPRISE !== '1'

/** The file a virtual extension id resolves to in this build. */
export function extensionFile(id: ExtensionId): string {
  const { enterprise, none } = EXTENSIONS[id]
  const own = resolve(frontendDir, enterprise)
  return enterpriseAllowed() && existsSync(own) ? own : resolve(frontendDir, none)
}

const isExtension = (id: string): id is ExtensionId => id in EXTENSIONS

/** For Vite and Vitest configs. */
export function widgetExtensionPlugin(): VitePlugin {
  return {
    name: 'chattermate-widget-extensions',
    enforce: 'pre',
    resolveId(id) {
      return isExtension(id) ? extensionFile(id) : null
    },
  }
}

/** For the esbuild loader build (scripts/loader-build.ts). */
export const loaderExtensionPlugin: EsbuildPlugin = {
  name: 'chattermate-loader-extensions',
  setup(build) {
    build.onResolve({ filter: /^virtual:cm-(widget|loader)-ext$/ }, args => ({
      path: extensionFile(args.path as ExtensionId),
    }))
  },
}
