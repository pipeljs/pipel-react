import { defineConfig } from 'vitepress'

export const cnConfig = defineConfig({
  lang: 'zh-CN',
  description: 'React 的 Promise-like 响应式流编程库',

  themeConfig: {
    nav: [
      { text: '指南', link: '/cn/guide/introduce' },
      { text: 'API', link: '/cn/core/usePipel/' },
      { text: 'GitHub', link: 'https://github.com/pipeljs/pipel-react' }
    ],

    sidebar: {
      '/cn/guide/': [
        {
          text: '开始',
          items: [
            { text: '介绍', link: '/cn/guide/introduce.cn' },
            { text: '快速开始', link: '/cn/guide/quick.cn' },
            { text: '在线试用', link: '/cn/guide/try.cn' }
          ]
        },
        {
          text: '核心概念',
          items: [
            { text: '响应式编程', link: '/cn/guide/reactive.cn' },
            { text: '流式渲染', link: '/cn/guide/render.cn' },
            { text: '不可变更新', link: '/cn/guide/immutable.cn' }
          ]
        },
        {
          text: '进阶',
          items: [
            { text: '调试', link: '/cn/guide/debug.cn' }
          ]
        }
      ],
      '/cn/core/': [
        {
          text: '核心 Hooks',
          items: [
            { text: 'usePipel', link: '/cn/core/usePipel/index.cn' },
            { text: 'useFetch', link: '/cn/core/useFetch/index.cn' }
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
