import { defineConfig } from 'vitepress'

export const cnConfig = defineConfig({
  lang: 'zh-CN',
  description: 'React 的 Promise-like 响应式流编程库',

  themeConfig: {
    nav: [
      { text: '指南', link: '/cn/guide/introduce' },
      { text: 'API', link: '/cn/core/' },
      { text: 'GitHub', link: 'https://github.com/pipeljs/pipel-react' }
    ],

    sidebar: {
      '/cn/guide/': [
        {
          text: '开始',
          items: [
            { text: '介绍', link: '/cn/guide/introduce' },
            { text: '快速开始', link: '/cn/guide/quick' },
            { text: '在线试用', link: '/cn/guide/try' }
          ]
        },
        {
          text: '核心概念',
          items: [
            { text: '响应式编程', link: '/cn/guide/reactive' },
            { text: '流式渲染', link: '/cn/guide/render' },
            { text: '不可变更新', link: '/cn/guide/immutable' }
          ]
        },
        {
          text: '进阶',
          items: [
            { text: '调试', link: '/cn/guide/debug' }
          ]
        }
      ],
      '/cn/core/': [
        {
          text: '核心 Hooks',
          items: [
            { text: 'usePipel', link: '/cn/core/usePipel/' },
            { text: 'useStream', link: '/cn/core/useStream/' },
            { text: 'useObservable', link: '/cn/core/useObservable/' },
            { text: 'useSyncState', link: '/cn/core/useSyncState/' },
            { text: 'usePipelRender', link: '/cn/core/usePipelRender/' },
            { text: 'useFetch', link: '/cn/core/useFetch/' }
          ]
        },
        {
          text: '流工具',
          items: [
            { text: 'to$', link: '/cn/core/to$/' },
            { text: 'effect$', link: '/cn/core/effect$/' },
            { text: 'asyncStream$', link: '/cn/core/asyncStream$/' },
            { text: 'persistStream$', link: '/cn/core/persistStream$/' },
            { text: 'batch$', link: '/cn/core/batch$/' },
            { text: 'fromEvent', link: '/cn/core/fromEvent/' },
            { text: 'computedStream$', link: '/cn/core/computedStream$/' }
          ]
        },
        {
          text: '其他工具',
          items: [
            { text: 'createFetch', link: '/cn/core/createFetch/' }
          ]
        },
        {
          text: '调试',
          items: [
            { text: 'debug', link: '/cn/core/debug/' }
          ]
        }
      ]
    },

    outline: {
      label: '页面导航'
    },

    lastUpdated: {
      text: '最后更新于',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'medium'
      }
    },

    docFooter: {
      prev: '上一页',
      next: '下一页'
    },

    darkModeSwitchLabel: '主题',
    sidebarMenuLabel: '菜单',
    returnToTopLabel: '回到顶部'
  }
})
