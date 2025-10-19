# Pipel-React 文档索引

本文档提供了 Pipel-React 项目所有文档的完整索引和导航。

## 📁 文档结构

```
pipel-react/
├── README.md                    # 项目主页（包含文档入口）
├── CHANGELOG.md                 # 版本变更日志
│
├── docs/                        # 📚 用户文档目录
│   ├── README.md               # 文档索引首页
│   ├── GETTING_STARTED.md      # 快速开始指南
│   ├── PROJECT_OVERVIEW.md     # 项目概览
│   ├── API_REFERENCE.md        # API 参考手册
│   ├── QUICK_REFERENCE.md      # 快速参考手册
│   │
│   └── internal/               # 🔧 内部文档（开发者）
│       ├── API_COVERAGE_ANALYSIS.md
│       ├── DOCS_COMPLETION_SUMMARY.md
│       ├── DOCUMENTATION_COMPLETE.md
│       ├── FIXES_APPLIED.md
│       ├── GITHUB_WORKFLOWS_SETUP.md
│       ├── IMPLEMENTATION_SUMMARY.md
│       ├── MONOREPO_ARCHITECTURE.md
│       ├── MONOREPO_MIGRATION.md
│       ├── MONOREPO_UPDATE.md
│       ├── TEST_PROGRESS.md
│       ├── TEST_SUMMARY.md
│       └── verify-implementation.md
│
└── packages/                    # 📦 VitePress 文档源码
    ├── guide/                  # 指南文档
    │   ├── introduce.cn.md
    │   ├── introduce.en.md
    │   ├── quick.cn.md
    │   ├── quick.en.md
    │   ├── reactive.cn.md
    │   ├── reactive.en.md
    │   ├── render.cn.md
    │   ├── render.en.md
    │   ├── immutable.cn.md
    │   ├── immutable.en.md
    │   ├── debug.cn.md
    │   └── debug.en.md
    │
    └── core/                   # API 文档
        ├── usePipel/
        │   ├── index.cn.md
        │   └── index.en.md
        ├── useFetch/
        │   ├── index.cn.md
        │   └── index.en.md
        ├── computedStream$/
        │   └── index.cn.md
        └── debug/
            └── index.cn.md
```

## 📖 用户文档

### 入门文档

| 文档                                         | 描述                             | 适合人群 |
| -------------------------------------------- | -------------------------------- | -------- |
| [README.md](../README.md)                    | 项目主页，包含快速开始和核心 API | 所有用户 |
| [GETTING_STARTED.md](./GETTING_STARTED.md)   | 详细的安装和配置指南             | 新用户   |
| [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md) | 项目结构和架构说明               | 开发者   |

### API 文档

| 文档                                       | 描述                | 适合人群   |
| ------------------------------------------ | ------------------- | ---------- |
| [API_REFERENCE.md](./API_REFERENCE.md)     | 完整的 API 参考手册 | 所有用户   |
| [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) | 常用模式速查表      | 有经验用户 |

### 在线文档

**VitePress 交互式文档** - 最佳阅读体验

```bash
# 启动开发服务器
pnpm docs:dev

# 构建文档
pnpm docs:build

# 预览构建结果
pnpm docs:preview
```

访问地址：

- 本地: http://localhost:5173
- 在线: https://pipeljs.github.io/pipel-react/

## 🔧 内部文档

> 这些文档主要面向项目维护者和贡献者

### 架构与设计

| 文档                                                            | 描述              |
| --------------------------------------------------------------- | ----------------- |
| [MONOREPO_ARCHITECTURE.md](./internal/MONOREPO_ARCHITECTURE.md) | Monorepo 架构设计 |
| [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md)                    | 项目结构概览      |

### 实现与迁移

| 文档                                                              | 描述              |
| ----------------------------------------------------------------- | ----------------- |
| [IMPLEMENTATION_SUMMARY.md](./internal/IMPLEMENTATION_SUMMARY.md) | 实现总结          |
| [MONOREPO_MIGRATION.md](./internal/MONOREPO_MIGRATION.md)         | Monorepo 迁移指南 |
| [MONOREPO_UPDATE.md](./internal/MONOREPO_UPDATE.md)               | Monorepo 更新记录 |

### 测试与质量

| 文档                                                            | 描述           |
| --------------------------------------------------------------- | -------------- |
| [TEST_PROGRESS.md](./internal/TEST_PROGRESS.md)                 | 测试进度跟踪   |
| [TEST_SUMMARY.md](./internal/TEST_SUMMARY.md)                   | 测试总结报告   |
| [API_COVERAGE_ANALYSIS.md](./internal/API_COVERAGE_ANALYSIS.md) | API 覆盖率分析 |
| [verify-implementation.md](./internal/verify-implementation.md) | 实现验证清单   |

### 文档与修复

| 文档                                                                | 描述         |
| ------------------------------------------------------------------- | ------------ |
| [DOCUMENTATION_COMPLETE.md](./internal/DOCUMENTATION_COMPLETE.md)   | 文档完成报告 |
| [DOCS_COMPLETION_SUMMARY.md](./internal/DOCS_COMPLETION_SUMMARY.md) | 文档补充总结 |
| [FIXES_APPLIED.md](./internal/FIXES_APPLIED.md)                     | 修复记录     |

### CI/CD

| 文档                                                              | 描述                |
| ----------------------------------------------------------------- | ------------------- |
| [GITHUB_WORKFLOWS_SETUP.md](./internal/GITHUB_WORKFLOWS_SETUP.md) | GitHub Actions 配置 |

## 🎯 快速导航

### 我想...

**学习如何使用 Pipel-React**
→ 从 [README.md](../README.md) 开始，然后查看 [GETTING_STARTED.md](./GETTING_STARTED.md)

**查找特定 API 的用法**
→ 查看 [API_REFERENCE.md](./API_REFERENCE.md) 或使用 VitePress 文档搜索

**了解常用模式**
→ 查看 [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)

**了解项目结构**
→ 查看 [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md)

**贡献代码**
→ 查看 [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md) 和 `internal/` 目录下的文档

**查看测试覆盖率**
→ 查看 [TEST_PROGRESS.md](./internal/TEST_PROGRESS.md)

**了解架构设计**
→ 查看 [MONOREPO_ARCHITECTURE.md](./internal/MONOREPO_ARCHITECTURE.md)

## 📝 文档维护

### 文档分类原则

1. **用户文档** (`docs/` 根目录)
   - 面向最终用户
   - 包含使用指南、API 参考
   - 保持简洁、易读

2. **内部文档** (`docs/internal/`)
   - 面向开发者和维护者
   - 包含实现细节、架构设计
   - 可以更技术化

3. **VitePress 文档** (`packages/`)
   - 交互式在线文档
   - 支持中英文
   - 最佳阅读体验

### 更新文档

当添加新功能或修改 API 时，请确保更新：

1. ✅ `README.md` - 如果是核心功能
2. ✅ `docs/API_REFERENCE.md` - 添加 API 文档
3. ✅ `packages/core/*/index.cn.md` - VitePress 中文文档
4. ✅ `packages/core/*/index.en.md` - VitePress 英文文档
5. ✅ `CHANGELOG.md` - 记录变更

## 🔗 相关链接

- [GitHub Repository](https://github.com/pipeljs/pipel-react)
- [PipelJS Core](https://github.com/pipeljs/pipel)
- [Online Documentation](https://pipeljs.github.io/pipel-react/)
- [NPM Package](https://www.npmjs.com/package/pipel-react)

## 📄 License

MIT © PipelJS Team
