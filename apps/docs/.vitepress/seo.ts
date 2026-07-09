import type { HeadConfig } from 'vitepress'

const DOCS_URL = 'https://expgov.pages.dev'

type DocsPageData = {
  title?: string
  description?: string
  relativePath: string
}

function docsPageUrl(relativePath: string): string {
  const slug = relativePath
    .replace(/(^|\/)index\.md$/, '$1')
    .replace(/\.md$/, '')
    .replace(/\/+$/, '')
  const path = slug.length > 0 ? `/${slug}/` : '/'
  return `${DOCS_URL}${path === '//' ? '/' : path}`
}

/** Per-page Open Graph tags for VitePress. */
export function transformDocsHead(ctx: { pageData: DocsPageData }): HeadConfig[] {
  const { pageData } = ctx
  const headline = pageData.title ? `${pageData.title} | expgov` : 'expgov docs'
  const description =
    pageData.description ??
    'Export governance for TypeScript SDK barrels — inventory, diff, validate, trend, timeline, and graph.'
  const url = docsPageUrl(pageData.relativePath)

  return [
    ['link', { rel: 'canonical', href: url }],
    ['meta', { property: 'og:title', content: headline }],
    ['meta', { property: 'og:description', content: description }],
    ['meta', { property: 'og:url', content: url }],
    ['meta', { property: 'og:type', content: 'article' }],
    ['meta', { property: 'og:site_name', content: 'expgov Docs' }],
    ['meta', { name: 'twitter:card', content: 'summary' }],
    ['meta', { name: 'twitter:title', content: headline }],
    ['meta', { name: 'twitter:description', content: description }],
  ]
}
