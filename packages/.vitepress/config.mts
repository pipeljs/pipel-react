import { defineConfig } from 'vitepress'
import { enConfig } from './config.en.mts'
import { cnConfig } from './config.cn.mts'

export default defineConfig({
  title: 'Pipel-React',
  description: 'Promise-like reactive stream programming for React',
  base: '/pipel-react/',
  lastUpdated: true,
  cleanUrls: true,
  
  head: [
    ['link', { rel: 'icon', href: '/pipel-react/favico.ico' }],
    ['meta', { name: 'theme-color', content: '#3eaf7c' }],
    ['meta', { name: 'apple-mobile-web-app-capable', content: 'yes' }],
    ['meta', { name: 'apple-mobile-web-app-status-bar-style', content: 'black' }]
  ],

  themeConfig: {
    logo: '/logo.svg',
    nav: [
      { text: 'Guide', link: '/guide/' },
      { text: 'API', link: '/core/' },
      { text: 'GitHub', link: 'https://github.com/pipeljs/pipel-react' }
    ],
    
    sidebar: {
      '/guide/': [
        {
          text: 'Introduction',
          items: [
            { text: 'What is Pipel-React?', link: '/guide/introduce' },
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
            { text: 'useFetch', link: '/core/useFetch/' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/pipeljs/pipel-react' }
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024-present PipelJS Team'
    }
  },

  locales: {
    root: {
      label: 'English',
      lang: 'en',
      ...enConfig
    },
    cn: {
      label: '简体中文',
      lang: 'zh-CN',
      ...cnConfig
    }
  }
})
