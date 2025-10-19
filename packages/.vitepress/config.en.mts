import { defineConfig } from 'vitepress'

export const enConfig = defineConfig({
  lang: 'en-US',
  description: 'Promise-like reactive stream programming for React',

  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide/introduce' },
      { text: 'API', link: '/core/' },
      { text: 'GitHub', link: 'https://github.com/pipeljs/pipel-react' }
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'Introduction', link: '/guide/introduce' },
            { text: 'Quick Start', link: '/guide/quick' },
            { text: 'Try it Online', link: '/guide/try' }
          ]
        },
        {
          text: 'Core Concepts',
          items: [
            { text: 'Reactive Programming', link: '/guide/reactive' },
            { text: 'Stream Rendering', link: '/guide/render' },
            { text: 'Immutable Updates', link: '/guide/immutable' }
          ]
        },
        {
          text: 'Advanced',
          items: [
            { text: 'Debugging', link: '/guide/debug' }
          ]
        }
      ],
      '/core/': [
        {
          text: 'Core Hooks',
          items: [
            { text: 'usePipel', link: '/core/usePipel/' },
            { text: 'useStream', link: '/core/useStream/' },
            { text: 'useObservable', link: '/core/useObservable/' },
            { text: 'useSyncState', link: '/core/useSyncState/' },
            { text: 'usePipelRender', link: '/core/usePipelRender/' },
            { text: 'useFetch', link: '/core/useFetch/' }
          ]
        },
        {
          text: 'Stream Utilities',
          items: [
            { text: 'to$', link: '/core/to$/' },
            { text: 'effect$', link: '/core/effect$/' },
            { text: 'asyncStream$', link: '/core/asyncStream$/' },
            { text: 'persistStream$', link: '/core/persistStream$/' },
            { text: 'batch$', link: '/core/batch$/' },
            { text: 'fromEvent', link: '/core/fromEvent/' },
            { text: 'computedStream$', link: '/core/computedStream$/' }
          ]
        },
        {
          text: 'Other Utilities',
          items: [
            { text: 'createFetch', link: '/core/createFetch/' }
          ]
        },
        {
          text: 'Debugging',
          items: [
            { text: 'debug', link: '/core/debug/' }
          ]
        }
      ]
    }
  }
})
