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

import { build, type BuildOptions } from 'esbuild'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { compactLoaderCssPlugin } from './loader-css'
import { loaderExtensionPlugin } from './widget-ext'

// How the embed loader (chattermate.min.js) is bundled, shared by the prod and dev
// builds and the e2e stack, so all three ship the same thing.

const frontendDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')

export type LoaderBuild = {
  outfile: string
  /** The baked DEFAULT base URL; getBaseUrl() still resolves the runtime config. */
  apiUrl: string
  nodeEnv: 'production' | 'development'
  minify: boolean
  sourcemap?: boolean
}

export function loaderBuildOptions({ outfile, apiUrl, nodeEnv, minify, sourcemap = false }: LoaderBuild): BuildOptions {
  return {
    entryPoints: [resolve(frontendDir, 'src/webclient/chattermate.js')],
    bundle: true,
    minify,
    sourcemap,
    outfile,
    format: 'iife',
    target: ['es2015'],
    loader: { '.svg': 'text' },
    define: {
      'process.env.NODE_ENV': JSON.stringify(nodeEnv),
      '__CHATTERMATE_API_URL__': JSON.stringify(apiUrl),
    },
    plugins: [compactLoaderCssPlugin, loaderExtensionPlugin],
    logLevel: 'warning',
  }
}

export function buildLoader(options: LoaderBuild) {
  return build(loaderBuildOptions(options))
}

// `tsx scripts/loader-build.ts <outfile> <apiUrl>`: a minified production bundle
// (the e2e stack builds its loader this way).
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [outfile, apiUrl] = process.argv.slice(2)
  if (!outfile || !apiUrl) {
    console.error('usage: tsx scripts/loader-build.ts <outfile> <apiUrl>')
    process.exit(2)
  }
  buildLoader({ outfile: resolve(outfile), apiUrl, nodeEnv: 'production', minify: true }).catch(() => process.exit(1))
}
