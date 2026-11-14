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

import ts from 'typescript'

/**
 * The embed loader writes its stylesheet (and a little markup) as template
 * literals, commented and indented for people. Minifying the bundle leaves template
 * text alone, so all of that ships to every page. This takes it out at build time:
 * in the text of each multi-line template literal only, found with a real parser
 * (never in code, strings, regexes or expressions), CSS comments are dropped and
 * any whitespace run that holds a line break becomes one newline. Both are
 * whitespace-equivalent in CSS and in HTML, so the page gets the same rules.
 */

/** One run of a multi-line template's text, compacted. */
export function compactTemplateText(text: string): string {
    if (!text.includes('\n')) return text
    // A comment is not whitespace in CSS (`.a/**/.b` is `.a.b`), so it goes entirely.
    return text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/[ \t]*\n\s*/g, '\n')
}

type Edit = { start: number, end: number, text: string }

/** `source` with the text of its template literals compacted; everything else as it was. */
export function compactLoaderSource(source: string, fileName = 'loader.js'): string {
    const kind = /\.ts$/.test(fileName) ? ts.ScriptKind.TS : ts.ScriptKind.JS
    const file = ts.createSourceFile(fileName, source, ts.ScriptTarget.Latest, true, kind)
    const edits: Edit[] = []
    const visit = (node: ts.Node) => {
        // A tagged template sees its raw text, so it is left exactly as written.
        if (ts.isTaggedTemplateExpression(node)) return
        const closesWithExpression = ts.isTemplateHead(node) || ts.isTemplateMiddle(node)
        if (closesWithExpression || ts.isTemplateTail(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
            // Past the opening ` or }, before the closing ` or ${.
            const start = node.getStart(file) + 1
            const end = node.getEnd() - (closesWithExpression ? 2 : 1)
            const text = source.slice(start, end)
            const compact = compactTemplateText(text)
            if (compact !== text) edits.push({ start, end, text: compact })
        }
        ts.forEachChild(node, visit)
    }
    visit(file)
    let out = source
    for (const edit of edits.sort((a, b) => b.start - a.start)) {
        out = out.slice(0, edit.start) + edit.text + out.slice(edit.end)
    }
    return out
}

/** The loader's own sources: chattermate.js and what it imports from src/webclient,
 * and the chat UI layer's loader side (scripts/widget-ext.ts). */
export const LOADER_SOURCES = /[\\/]src[\\/](?:webclient[\\/](?:loader[\\/])?|modules[\\/]enterprise[\\/]widget[\\/])[\w-]+\.(?:js|ts)$/

/** An esbuild plugin applying compactLoaderSource to the loader's own sources. */
export const compactLoaderCssPlugin = {
    name: 'compact-loader-css',
    setup(build: { onLoad: (options: { filter: RegExp }, callback: (args: { path: string }) => Promise<{ contents: string, loader: 'js' | 'ts' }>) => void }) {
        build.onLoad({ filter: LOADER_SOURCES }, async (args) => {
            const { readFile } = await import('node:fs/promises')
            const source = await readFile(args.path, 'utf8')
            return { contents: compactLoaderSource(source, args.path), loader: /\.ts$/.test(args.path) ? 'ts' : 'js' }
        })
    },
}
