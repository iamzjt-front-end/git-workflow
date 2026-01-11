import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Git Workflow',
  description: '🚀 极简的 Git 工作流 CLI 工具，让分支管理和版本发布变得轻松愉快',
  
  // 基础配置
  base: '/git-workflow/',
  lang: 'zh-CN',
  
  // 主题配置
  themeConfig: {
    // 导航栏
    nav: [
      { text: '首页', link: '/' },
      { text: '快速开始', link: '/guide/getting-started' },
      { text: '命令参考', link: '/commands/' },
      { text: '配置', link: '/config/' },
      { text: 'GitHub', link: 'https://github.com/iamzjt-front-end/git-workflow' }
    ],

    // 侧边栏
    sidebar: {
      '/guide/': [
        {
          text: '指南',
          items: [
            { text: '介绍', link: '/guide/' },
            { text: '快速开始', link: '/guide/getting-started' },
            { text: '安装', link: '/guide/installation' },
            { text: '基础用法', link: '/guide/basic-usage' },
            { text: '最佳实践', link: '/guide/best-practices' }
          ]
        },
        {
          text: '核心功能',
          items: [
            { text: 'AI 智能提交', link: '/guide/ai-commit' },
            { text: '分支管理', link: '/guide/branch-management' },
            { text: 'Tag 管理', link: '/guide/tag-management' },
            { text: 'Stash 管理', link: '/guide/stash-management' },
            { text: '版本发布', link: '/guide/release-management' }
          ]
        },
        {
          text: '高级用法',
          items: [
            { text: '团队协作', link: '/guide/team-collaboration' },
            { text: '工作流集成', link: '/guide/workflow-integration' },
            { text: '自动化脚本', link: '/guide/automation' }
          ]
        }
      ],
      '/commands/': [
        {
          text: '命令参考',
          items: [
            { text: '概览', link: '/commands/' },
            { text: '交互式菜单', link: '/commands/interactive' },
            { text: '分支命令', link: '/commands/branch' },
            { text: 'Tag 命令', link: '/commands/tag' },
            { text: '提交命令', link: '/commands/commit' },
            { text: 'Stash 命令', link: '/commands/stash' },
            { text: '版本命令', link: '/commands/release' },
            { text: '配置命令', link: '/commands/config' },
            { text: '更新命令', link: '/commands/update' },
            { text: '帮助命令', link: '/commands/help' }
          ]
        }
      ],
      '/config/': [
        {
          text: '配置',
          items: [
            { text: '配置概览', link: '/config/' },
            { text: '配置文件', link: '/config/config-file' },
            { text: 'AI 配置', link: '/config/ai-config' },
            { text: '分支配置', link: '/config/branch-config' },
            { text: '提交配置', link: '/config/commit-config' },
            { text: '配置示例', link: '/config/examples' }
          ]
        }
      ],
      '/api/': [
        {
          text: 'API 参考',
          items: [
            { text: 'CLI API', link: '/api/cli' },
            { text: '配置 API', link: '/api/config' },
            { text: '工具函数', link: '/api/utils' }
          ]
        }
      ]
    },

    // 社交链接
    socialLinks: [
      { icon: 'github', link: 'https://github.com/iamzjt-front-end/git-workflow' },
      { icon: 'npm', link: 'https://www.npmjs.com/package/@zjex/git-workflow' }
    ],

    // 页脚
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2026 zjex'
    },

    // 搜索
    search: {
      provider: 'local'
    },

    // 编辑链接
    editLink: {
      pattern: 'https://github.com/iamzjt-front-end/git-workflow/edit/main/docs/:path',
      text: '在 GitHub 上编辑此页'
    },

    // 最后更新时间
    lastUpdated: {
      text: '最后更新',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'medium'
      }
    },

    // 大纲配置
    outline: {
      level: [2, 3],
      label: '页面导航'
    },

    // 返回顶部
    returnToTopLabel: '返回顶部',

    // 深色模式切换
    darkModeSwitchLabel: '主题',
    lightModeSwitchTitle: '切换到浅色模式',
    darkModeSwitchTitle: '切换到深色模式'
  },

  // Markdown 配置
  markdown: {
    lineNumbers: true,
    theme: {
      light: 'github-light',
      dark: 'github-dark'
    }
  },

  // 头部配置
  head: [
    ['link', { rel: 'icon', href: '/git-workflow/favicon.ico' }],
    ['meta', { name: 'theme-color', content: '#646cff' }],
    ['meta', { name: 'og:type', content: 'website' }],
    ['meta', { name: 'og:locale', content: 'zh-CN' }],
    ['meta', { name: 'og:site_name', content: 'Git Workflow' }],
    ['meta', { name: 'og:image', content: '/git-workflow/og-image.png' }]
  ]
})