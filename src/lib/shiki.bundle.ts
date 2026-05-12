import {
  createBundledHighlighter,
  createSingletonShorthands,
} from '@shikijs/core'
import { createJavaScriptRegexEngine } from '@shikijs/engine-javascript'
/* Generate by @shikijs/codegen */
import type {
  DynamicImportLanguageRegistration,
  DynamicImportThemeRegistration,
  HighlighterGeneric,
} from '@shikijs/types'

type BundledLanguage =
  | 'angular-html'
  | 'angular-ts'
  | 'astro'
  | 'c'
  | 'cpp'
  | 'c++'
  | 'csharp'
  | 'c#'
  | 'cs'
  | 'css'
  | 'csv'
  | 'dart'
  | 'docker'
  | 'dockerfile'
  | 'dotenv'
  | 'git-commit'
  | 'git-rebase'
  | 'go'
  | 'graphql'
  | 'gql'
  | 'html'
  | 'hxml'
  | 'java'
  | 'javascript'
  | 'js'
  | 'cjs'
  | 'mjs'
  | 'json'
  | 'json5'
  | 'jsonc'
  | 'jsonl'
  | 'jsx'
  | 'kotlin'
  | 'kt'
  | 'kts'
  | 'latex'
  | 'lua'
  | 'luau'
  | 'markdown'
  | 'md'
  | 'mdc'
  | 'mdx'
  | 'mermaid'
  | 'mmd'
  | 'nginx'
  | 'php'
  | 'plsql'
  | 'postcss'
  | 'postcss'
  | 'prisma'
  | 'python'
  | 'py'
  | 'ruby'
  | 'rb'
  | 'rust'
  | 'rs'
  | 'sass'
  | 'scss'
  | 'shellscript'
  | 'bash'
  | 'sh'
  | 'shell'
  | 'zsh'
  | 'sql'
  | 'svelte'
  | 'swift'
  | 'toml'
  | 'tsv'
  | 'tsx'
  | 'typescript'
  | 'ts'
  | 'cts'
  | 'mts'
  | 'vue-html'
  | 'xml'
  | 'yaml'
  | 'yml'
  | 'zig'
type BundledTheme = 'one-dark-pro' | 'one-light'
type Highlighter = HighlighterGeneric<BundledLanguage, BundledTheme>

const bundledLanguages = {
  'angular-html': () => import('@shikijs/langs-precompiled/angular-html'),
  'angular-ts': () => import('@shikijs/langs-precompiled/angular-ts'),
  astro: () => import('@shikijs/langs-precompiled/astro'),
  c: () => import('@shikijs/langs-precompiled/c'),
  cpp: () => import('@shikijs/langs-precompiled/cpp'),
  'c++': () => import('@shikijs/langs-precompiled/cpp'),
  csharp: () => import('@shikijs/langs-precompiled/csharp'),
  'c#': () => import('@shikijs/langs-precompiled/csharp'),
  cs: () => import('@shikijs/langs-precompiled/csharp'),
  css: () => import('@shikijs/langs-precompiled/css'),
  csv: () => import('@shikijs/langs-precompiled/csv'),
  dart: () => import('@shikijs/langs-precompiled/dart'),
  docker: () => import('@shikijs/langs-precompiled/docker'),
  dockerfile: () => import('@shikijs/langs-precompiled/docker'),
  dotenv: () => import('@shikijs/langs-precompiled/dotenv'),
  'git-commit': () => import('@shikijs/langs-precompiled/git-commit'),
  'git-rebase': () => import('@shikijs/langs-precompiled/git-rebase'),
  go: () => import('@shikijs/langs-precompiled/go'),
  graphql: () => import('@shikijs/langs-precompiled/graphql'),
  gql: () => import('@shikijs/langs-precompiled/graphql'),
  html: () => import('@shikijs/langs-precompiled/html'),
  hxml: () => import('@shikijs/langs-precompiled/hxml'),
  java: () => import('@shikijs/langs-precompiled/java'),
  javascript: () => import('@shikijs/langs-precompiled/javascript'),
  js: () => import('@shikijs/langs-precompiled/javascript'),
  cjs: () => import('@shikijs/langs-precompiled/javascript'),
  mjs: () => import('@shikijs/langs-precompiled/javascript'),
  json: () => import('@shikijs/langs-precompiled/json'),
  json5: () => import('@shikijs/langs-precompiled/json5'),
  jsonc: () => import('@shikijs/langs-precompiled/jsonc'),
  jsonl: () => import('@shikijs/langs-precompiled/jsonl'),
  jsx: () => import('@shikijs/langs-precompiled/jsx'),
  kotlin: () => import('@shikijs/langs-precompiled/kotlin'),
  kt: () => import('@shikijs/langs-precompiled/kotlin'),
  kts: () => import('@shikijs/langs-precompiled/kotlin'),
  latex: () => import('@shikijs/langs-precompiled/latex'),
  lua: () => import('@shikijs/langs-precompiled/lua'),
  luau: () => import('@shikijs/langs-precompiled/luau'),
  markdown: () => import('@shikijs/langs-precompiled/markdown'),
  md: () => import('@shikijs/langs-precompiled/markdown'),
  mdc: () => import('@shikijs/langs-precompiled/mdc'),
  mdx: () => import('@shikijs/langs-precompiled/mdx'),
  mermaid: () => import('@shikijs/langs-precompiled/mermaid'),
  mmd: () => import('@shikijs/langs-precompiled/mermaid'),
  nginx: () => import('@shikijs/langs-precompiled/nginx'),
  php: () => import('@shikijs/langs-precompiled/php'),
  plsql: () => import('@shikijs/langs-precompiled/plsql'),
  postcss: () => import('@shikijs/langs-precompiled/postcss'),
  prisma: () => import('@shikijs/langs-precompiled/prisma'),
  python: () => import('@shikijs/langs-precompiled/python'),
  py: () => import('@shikijs/langs-precompiled/python'),
  ruby: () => import('@shikijs/langs-precompiled/ruby'),
  rb: () => import('@shikijs/langs-precompiled/ruby'),
  rust: () => import('@shikijs/langs-precompiled/rust'),
  rs: () => import('@shikijs/langs-precompiled/rust'),
  sass: () => import('@shikijs/langs-precompiled/sass'),
  scss: () => import('@shikijs/langs-precompiled/scss'),
  shellscript: () => import('@shikijs/langs-precompiled/shellscript'),
  bash: () => import('@shikijs/langs-precompiled/shellscript'),
  sh: () => import('@shikijs/langs-precompiled/shellscript'),
  shell: () => import('@shikijs/langs-precompiled/shellscript'),
  zsh: () => import('@shikijs/langs-precompiled/shellscript'),
  sql: () => import('@shikijs/langs-precompiled/sql'),
  svelte: () => import('@shikijs/langs-precompiled/svelte'),
  swift: () => import('@shikijs/langs-precompiled/swift'),
  toml: () => import('@shikijs/langs-precompiled/toml'),
  tsv: () => import('@shikijs/langs-precompiled/tsv'),
  tsx: () => import('@shikijs/langs-precompiled/tsx'),
  typescript: () => import('@shikijs/langs-precompiled/typescript'),
  ts: () => import('@shikijs/langs-precompiled/typescript'),
  cts: () => import('@shikijs/langs-precompiled/typescript'),
  mts: () => import('@shikijs/langs-precompiled/typescript'),
  'vue-html': () => import('@shikijs/langs-precompiled/vue-html'),
  xml: () => import('@shikijs/langs-precompiled/xml'),
  yaml: () => import('@shikijs/langs-precompiled/yaml'),
  yml: () => import('@shikijs/langs-precompiled/yaml'),
  zig: () => import('@shikijs/langs-precompiled/zig'),
} as Record<BundledLanguage, DynamicImportLanguageRegistration>

const bundledThemes = {
  'one-dark-pro': () => import('@shikijs/themes/one-dark-pro'),
  'one-light': () => import('@shikijs/themes/one-light'),
  'github-light': () => import('@shikijs/themes/github-light-default'),
  'github-dark': () => import('@shikijs/themes/github-dark-default'),
} as Record<BundledTheme, DynamicImportThemeRegistration>

const createHighlighter = /* @__PURE__ */ createBundledHighlighter<
  BundledLanguage,
  BundledTheme
>({
  langs: bundledLanguages,
  themes: bundledThemes,
  engine: () => createJavaScriptRegexEngine(),
})

const {
  codeToHtml,
  codeToHast,
  codeToTokensBase,
  codeToTokens,
  codeToTokensWithThemes,
  getSingletonHighlighter,
  getLastGrammarState,
} = /* @__PURE__ */ createSingletonShorthands<BundledLanguage, BundledTheme>(
  createHighlighter
)

export {
  bundledLanguages,
  bundledThemes,
  codeToHast,
  codeToHtml,
  codeToTokens,
  codeToTokensBase,
  codeToTokensWithThemes,
  createHighlighter,
  getLastGrammarState,
  getSingletonHighlighter,
}
export type { BundledLanguage, BundledTheme, Highlighter }
