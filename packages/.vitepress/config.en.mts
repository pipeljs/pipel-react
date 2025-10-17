import { defineConfig } from 'vitepress'

export const enConfig = defineConfig({
  lang: 'en-US',
  description: 'Promise-like reactive stream programming for React',

  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide/introduce' },
      { text: 'API', link: '/core/usePipel/' },
      { text: 'GitHub', link: 'https://github.com/pipeljs/pipel-react' }
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'Introduction', link: '/guide/introduce.en' },
            { text: 'Quick Start', link: '/guide/quick.en' },
            { text: 'Try it Online', link: '/guide/try.en' }
          ]
        },
        {
          text: 'Core Concepts',
          items: [
            { text: 'Reactive Programming', link: '/guide/reactive.en' },
            { text: 'Stream Rendering', link: '/guide/render.en' },
            { text: 'Immutable Updates', link: '/guide/immutable.en' }
          ]
        },
        {
          text: 'Advanced',
          items: [
            { text: 'Debugging', link: '/guide/debug.en' }
          ]
        }
      ],
      '/core/': [
        {
          text: 'Core Hooks',
          items: [
            { text: 'usePipel', link: '/core/usePipel/index.en' },
            { text: 'useFetch', link: '/core/useFetch/index.en' }
          ]
        }
      ]
    }
  }
})
