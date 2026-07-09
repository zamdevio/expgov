/**
 * Manual VitePress sidebar (srcDir: content, cleanUrls: true).
 * Update when adding, renaming, or removing pages under docs/.
 */
import type { DefaultTheme } from 'vitepress'

export const sidebar: DefaultTheme.Config['sidebar'] = {
  '/': [
    {
      text: 'Start here',
      items: [
        { text: 'Documentation home', link: '/' },
        { text: 'Workflows', link: '/guides/workflows' },
        { text: 'Governance model', link: '/governance' },
        { text: 'Install', link: '/install' },
        { text: 'Configuration', link: '/config' },
      ],
    },
    {
      text: 'SDK',
      collapsed: false,
      items: [{ text: 'SDK overview', link: '/sdk/' }],
    },
    {
      text: 'CLI',
      collapsed: false,
      items: [
        { text: 'CLI overview', link: '/cli/' },
        { text: 'Flags', link: '/cli/flags' },
        { text: 'JSON output (--json)', link: '/cli/json' },
      ],
    },
    {
      text: 'Commands',
      collapsed: false,
      items: [
        { text: 'Commands overview', link: '/commands/' },
        { text: 'init', link: '/commands/init' },
        { text: 'inventory', link: '/commands/inventory' },
        { text: 'diff', link: '/commands/diff' },
        { text: 'validate', link: '/commands/validate' },
        { text: 'doctor', link: '/commands/doctor' },
        { text: 'suggest', link: '/commands/suggest' },
        { text: 'trend', link: '/commands/trend' },
        { text: 'timeline', link: '/commands/timeline' },
        { text: 'graph', link: '/commands/graph' },
      ],
    },
  ],
}
