import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitepress'

import { transformDocsHead } from './seo.js'
import { sidebar } from './sidebar.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const publicDir = resolve(__dirname, 'public')

function docsChunkByPackage(id: string): string | undefined {
  if (!id.includes('node_modules')) return undefined
  if (id.includes('/@shikijs/langs/')) {
    const lang = id.match(/@shikijs\/langs\/([^/.]+)/)?.[1]
    return lang ? `vendor-shiki-lang-${lang}` : 'vendor-shiki-langs'
  }
  const match = id.match(/node_modules\/(?:\.pnpm\/[^/]+\/node_modules\/)?(@[^/]+\/[^/]+|[^/]+)/)
  const pkg = match?.[1]
  if (!pkg) return undefined
  if (pkg === 'motion' || pkg === 'shiki') return undefined
  if (pkg === 'vue' || pkg === '@vue/runtime-core' || pkg === '@vue/runtime-dom') return 'vendor-vue'
  if (pkg === 'vitepress') return 'vendor-vitepress'
  return `vendor-${pkg.replace('@', '').replace('/', '-')}`
}

export default defineConfig({
  title: 'expgov',
  description:
    'Export governance for TypeScript SDK barrels — inventory, diff, validate, trend, timeline, and graph.',
  lang: 'en-US',
  appearance: true,
  srcDir: 'content',
  cleanUrls: true,
  ignoreDeadLinks: true,
  site: 'https://expgov.pages.dev',
  transformHead: transformDocsHead,
  vite: {
    publicDir,
    build: {
      rollupOptions: {
        output: {
          manualChunks: docsChunkByPackage,
        },
      },
    },
  },
  head: [
    ['link', { rel: 'icon', href: '/expgov.svg', type: 'image/svg+xml' }],
    ['link', { rel: 'icon', href: '/expgov.svg', sizes: 'any' }],
    ['link', { rel: 'manifest', href: '/site.webmanifest' }],
    ['meta', { name: 'theme-color', content: '#0c1220' }],
  ],
  themeConfig: {
    logo: '/expgov.svg',
    nav: [
      { text: 'Workflows', link: '/guides/workflows' },
      { text: 'Commands', link: '/commands/' },
      { text: 'SDK', link: '/sdk/' },
      {
        text: 'CLI',
        items: [
          { text: 'Overview', link: '/cli/' },
          { text: 'Flags', link: '/cli/flags' },
          { text: 'JSON output', link: '/cli/json' },
        ],
      },
      { text: 'Governance', link: '/governance' },
    ],
    sidebar,
    search: {
      provider: 'local',
    },
    socialLinks: [{ icon: 'github', link: 'https://github.com/zamdevio/expgov' }],
  },
})
