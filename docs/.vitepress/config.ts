import { defineConfig } from "vitepress";

export default defineConfig({
  title: "Git Workflow",
  description:
    "🚀 极简的 Git 工作流 CLI 工具，让分支管理和版本发布变得轻松愉快",

  // 基础配置
  base: "/git-workflow/",
  lang: "zh-CN",

  // 主题配置
  themeConfig: {
    // Logo
    logo: "/logo.svg",

    // 导航栏
    nav: [
      { text: "首页", link: "/" },
      { text: "快速开始", link: "/guide/getting-started" },
      { text: "命令参考", link: "/commands/" },
      { text: "配置", link: "/config/" },
    ],

    // 侧边栏
    sidebar: {
      "/guide/": [
        {
          text: "指南",
          items: [
            { text: "介绍", link: "/guide/" },
            { text: "快速开始", link: "/guide/getting-started" },
            { text: "安装", link: "/guide/installation" },
            { text: "基础用法", link: "/guide/basic-usage" },
            { text: "最佳实践", link: "/guide/best-practices" },
          ],
        },
        {
          text: "核心功能",
          items: [
            { text: "AI 智能提交", link: "/guide/ai-commit" },
            { text: "AI 代码审查", link: "/guide/ai-review" },
            { text: "分支管理", link: "/guide/branch-management" },
            { text: "Tag 管理", link: "/guide/tag-management" },
            { text: "Stash 管理", link: "/guide/stash-management" },
            { text: "版本发布", link: "/guide/release-management" },
          ],
        },
        {
          text: "团队协作",
          items: [{ text: "团队协作指南", link: "/guide/team-collaboration" }],
        },
        {
          text: "开发与贡献",
          items: [
            { text: "开发指南", link: "/guide/development" },
            { text: "测试指南", link: "/guide/testing" },
            { text: "Debug 模式", link: "/guide/debug-mode" },
            { text: "命令引号处理", link: "/guide/command-quotes-handling" },
            { text: "API 文档", link: "/guide/api" },
            { text: "贡献指南", link: "/guide/contributing" },
          ],
        },
      ],
      "/commands/": [
        {
          text: "命令参考",
          items: [
            { text: "概览", link: "/commands/" },
            { text: "交互式菜单", link: "/commands/interactive" },
            { text: "分支命令", link: "/commands/branch" },
            { text: "提交命令", link: "/commands/commit" },
            { text: "AI 代码审查", link: "/commands/review" },
            { text: "日志命令", link: "/commands/log" },
            { text: "修改提交信息", link: "/commands/amend" },
            { text: "修改提交时间", link: "/commands/amend-date" },
            { text: "Tag 命令", link: "/commands/tag" },
            { text: "Stash 命令", link: "/commands/stash" },
            { text: "版本命令", link: "/commands/release" },
            { text: "配置命令", link: "/commands/config" },
            { text: "更新命令", link: "/commands/update" },
            { text: "帮助命令", link: "/commands/help" },
          ],
        },
      ],
      "/config/": [
        {
          text: "配置",
          items: [
            { text: "配置概览", link: "/config/" },
            { text: "配置文件", link: "/config/config-file" },
            { text: "AI 配置", link: "/config/ai-config" },
            { text: "分支配置", link: "/config/branch-config" },
            { text: "提交配置", link: "/config/commit-config" },
            { text: "配置示例", link: "/config/examples" },
          ],
        },
      ],
    },

    // 社交链接
    socialLinks: [
      {
        icon: "github",
        link: "https://github.com/iamzjt-front-end/git-workflow",
      },
      { icon: "npm", link: "https://www.npmjs.com/package/@zjex/git-workflow" },
    ],

    // 页脚
    footer: {
      message: "Released under the MIT License.",
      copyright: "Copyright © 2026 zjex",
    },

    // 搜索
    search: {
      provider: "local",
    },

    // 编辑链接
    editLink: {
      pattern:
        "https://github.com/iamzjt-front-end/git-workflow/edit/main/docs/:path",
      text: "在 GitHub 上编辑此页",
    },

    // 最后更新时间
    lastUpdated: {
      text: "最后更新",
      formatOptions: {
        dateStyle: "short",
        timeStyle: "medium",
      },
    },

    // 大纲配置
    outline: {
      level: [2, 3],
      label: "页面导航",
    },

    // 返回顶部
    returnToTopLabel: "返回顶部",

    // 深色模式切换
    darkModeSwitchLabel: "主题",
    lightModeSwitchTitle: "切换到浅色模式",
    darkModeSwitchTitle: "切换到深色模式",
  },

  // Markdown 配置
  markdown: {
    lineNumbers: true,
    theme: {
      light: "github-light",
      dark: "github-dark",
    },
  },

  // 头部配置
  head: [
    [
      "link",
      { rel: "icon", type: "image/svg+xml", href: "/git-workflow/favicon.svg" },
    ],
    ["link", { rel: "apple-touch-icon", href: "/git-workflow/logo.svg" }],
    ["meta", { name: "theme-color", content: "#646cff" }],
    ["meta", { name: "og:type", content: "website" }],
    ["meta", { name: "og:locale", content: "zh-CN" }],
    ["meta", { name: "og:site_name", content: "Git Workflow" }],
    ["meta", { name: "og:image", content: "/git-workflow/logo.svg" }],
    [
      "meta",
      {
        name: "og:title",
        content: "Git Workflow - 极简的 Git 工作流 CLI 工具",
      },
    ],
    [
      "meta",
      { name: "og:description", content: "让分支管理和版本发布变得轻松愉快" },
    ],
  ],
});
