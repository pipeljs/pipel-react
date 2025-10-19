# 📚 Pipel-React 文档组织结构

> 最后更新: 2024-10-19

## 📁 文档目录结构

```
pipel-react/
├── README.md                          # 项目主文档
├── CHANGELOG.md                       # 版本更新记录
│
├── docs/                              # 用户文档目录
│   ├── README.md                      # 文档索引首页
│   ├── DOCUMENTATION_INDEX.md         # 完整文档地图
│   ├── DOCUMENTATION_ORGANIZATION.md  # 本文件 - 文档组织说明
│   │
│   ├── GETTING_STARTED.md            # 快速开始指南
│   ├── PROJECT_OVERVIEW.md           # 项目概览
│   ├── API_REFERENCE.md              # API 参考手册
│   ├── QUICK_REFERENCE.md            # 快速参考手册
│   │
│   └── internal/                      # 内部开发文档
│       ├── API_COVERAGE_ANALYSIS.md   # API 覆盖率分析
│       ├── DOCS_CHECKLIST.md          # 文档完整清单
│       ├── DOCS_COMPLETION_SUMMARY.md # 文档补充总结
│       ├── DOCS_FIX_SUMMARY.md        # 文档修复总结
│       ├── DOCS_ORGANIZATION_SUMMARY.md # 文档组织总结
│       ├── DOCUMENTATION_COMPLETE.md  # 文档完成报告
│       ├── DOCUMENTATION_SUMMARY.md   # 文档总结
│       ├── FINAL_DOCS_REPORT.md       # 最终文档报告
│       ├── FIXES_APPLIED.md           # 代码修复记录
│       ├── GITHUB_WORKFLOWS_SETUP.md  # CI/CD 配置说明
│       ├── IMPLEMENTATION_SUMMARY.md  # 实现总结
│       ├── MONOREPO_ARCHITECTURE.md   # Monorepo 架构
│       ├── MONOREPO_MIGRATION.md      # Monorepo 迁移指南
│       ├── MONOREPO_UPDATE.md         # Monorepo 更新记录
│       ├── TEST_PROGRESS.md           # 测试进度
│       ├── TEST_SUMMARY.md            # 测试总结
│       └── verify-implementation.md   # 实现验证
│
└── packages/                          # VitePress 交互式文档
    ├── .vitepress/                    # VitePress 配置
    │   ├── config.mts                 # 主配置
    │   ├── config.cn.mts              # 中文配置
    │   └── config.en.mts              # 英文配置
    │
    ├── guide/                         # 英文指南
    │   ├── index.md                   # 指南首页
    │   ├── introduce.md               # 介绍
    │   ├── quick.md                   # 快速开始
    │   ├── try.md                     # 在线试用
    │   ├── reactive.md                # 响应式编程
    │   ├── render.md                  # 流式渲染
    │   ├── immutable.md               # 不可变更新
    │   └── debug.md                   # 调试指南
    │
    ├── cn/                            # 中文文档
    │   ├── guide/                     # 中文指南
    │   │   ├── index.md
    │   │   ├── introduce.md
    │   │   ├── quick.md
    │   │   ├── try.md
    │   │   ├── reactive.md
    │   │   ├── render.md
    │   │   ├── immutable.md
    │   │   └── debug.md
    │   │
    │   └── core/                      # 中文 API 文档
    │       ├── usePipel/
    │       ├── useStream/
    │       ├── useObservable/
    │       ├── useSyncState/
    │       ├── usePipelRender/
    │       ├── useFetch/
    │       ├── to$/
    │       ├── effect$/
    │       ├── asyncStream$/
    │       ├── persistStream$/
    │       ├── batch$/
    │       ├── fromEvent/
    │       ├── computedStream$/
    │       ├── createFetch/
    │       └── debug/
    │
    └── core/                          # 英文 API 文档
        ├── usePipel/
        ├── useStream/
        ├── useObservable/
        ├── useSyncState/
        ├── usePipelRender/
        ├── useFetch/
        ├── to$/
        ├── effect$/
        ├── asyncStream$/
        ├── persistStream$/
        ├── batch$/
        ├── fromEvent/
        ├── computedStream$/
        ├── createFetch/
        └── debug/
```

## 📊 文档分类说明

### 1. 项目根目录文档

| 文档           | 用途                             | 受众     |
| -------------- | -------------------------------- | -------- |
| `README.md`    | 项目介绍、快速开始、核心功能展示 | 所有用户 |
| `CHANGELOG.md` | 版本更新历史、Breaking Changes   | 所有用户 |

### 2. 用户文档 (`docs/`)

面向最终用户的文档，提供快速上手和参考：

| 文档                     | 用途               | 受众     |
| ------------------------ | ------------------ | -------- |
| `README.md`              | 文档索引首页       | 所有用户 |
| `DOCUMENTATION_INDEX.md` | 完整文档地图       | 所有用户 |
| `GETTING_STARTED.md`     | 5分钟快速开始      | 新用户   |
| `PROJECT_OVERVIEW.md`    | 项目架构和设计理念 | 所有用户 |
| `API_REFERENCE.md`       | API 速查手册       | 开发者   |
| `QUICK_REFERENCE.md`     | 常用代码片段       | 开发者   |

### 3. 内部文档 (`docs/internal/`)

面向项目维护者和贡献者的技术文档：

#### 文档相关

- `DOCS_CHECKLIST.md` - 文档完整性检查清单
- `DOCS_COMPLETION_SUMMARY.md` - 文档补充工作总结
- `DOCS_FIX_SUMMARY.md` - 文档问题修复记录
- `DOCS_ORGANIZATION_SUMMARY.md` - 文档组织工作总结
- `DOCUMENTATION_COMPLETE.md` - 文档完成报告
- `DOCUMENTATION_SUMMARY.md` - 文档工作总结
- `FINAL_DOCS_REPORT.md` - 最终文档报告

#### 代码相关

- `API_COVERAGE_ANALYSIS.md` - API 测试覆盖率分析
- `FIXES_APPLIED.md` - 代码修复和重构记录
- `IMPLEMENTATION_SUMMARY.md` - 功能实现总结
- `TEST_PROGRESS.md` - 测试进度跟踪
- `TEST_SUMMARY.md` - 测试工作总结
- `verify-implementation.md` - 实现验证清单

#### 架构相关

- `MONOREPO_ARCHITECTURE.md` - Monorepo 架构设计
- `MONOREPO_MIGRATION.md` - Monorepo 迁移指南
- `MONOREPO_UPDATE.md` - Monorepo 更新记录
- `GITHUB_WORKFLOWS_SETUP.md` - CI/CD 工作流配置

### 4. VitePress 文档 (`packages/`)

交互式在线文档，支持中英文双语：

#### 指南文档 (Guide)

- **介绍** - 什么是 Pipel-React
- **快速开始** - 安装和基础使用
- **在线试用** - 在线编辑器
- **响应式编程** - 核心概念
- **流式渲染** - 渲染优化
- **不可变更新** - 数据管理
- **调试指南** - 调试工具和技巧

#### API 文档 (Core)

**核心 Hooks (6个)**

1. `usePipel` - 核心 Hook，Stream 转 React 状态
2. `useStream` - 创建稳定的 Stream 实例
3. `useObservable` - 订阅 Observable
4. `useSyncState` - 双向状态-Stream 同步
5. `usePipelRender` - 条件渲染优化
6. `useFetch` - HTTP 请求管理

**流工具 (7个)**

1. `to$` - 状态转 Stream
2. `effect$` - 副作用管理
3. `asyncStream$` - 异步流状态
4. `persistStream$` - 持久化 Stream
5. `batch$` - 批量流管理
6. `fromEvent` - DOM 事件转 Stream
7. `computedStream$` - 计算流

**其他工具 (2个)**

1. `createFetch` - 创建 fetch 配置
2. `debug` - 调试工具

## 🎯 文档使用指南

### 新用户入门路径

1. **了解项目** → `README.md`
2. **快速开始** → `docs/GETTING_STARTED.md`
3. **深入学习** → VitePress 文档 (`pnpm docs:dev`)
4. **API 查询** → `docs/API_REFERENCE.md`

### 开发者路径

1. **项目架构** → `docs/PROJECT_OVERVIEW.md`
2. **API 参考** → `docs/API_REFERENCE.md`
3. **快速参考** → `docs/QUICK_REFERENCE.md`
4. **在线文档** → VitePress 文档

### 贡献者路径

1. **架构设计** → `docs/internal/MONOREPO_ARCHITECTURE.md`
2. **测试指南** → `docs/internal/TEST_SUMMARY.md`
3. **API 覆盖** → `docs/internal/API_COVERAGE_ANALYSIS.md`
4. **CI/CD** → `docs/internal/GITHUB_WORKFLOWS_SETUP.md`

## 📝 文档维护规范

### 添加新文档

1. **确定文档类型**
   - 用户文档 → `docs/`
   - 内部文档 → `docs/internal/`
   - API 文档 → `packages/core/*/`
   - 指南文档 → `packages/guide/`

2. **更新索引**
   - 在 `docs/README.md` 中添加链接
   - 在 `docs/DOCUMENTATION_INDEX.md` 中更新目录
   - 如果是核心功能，在主 `README.md` 中添加

3. **保持一致性**
   - 使用统一的 Markdown 格式
   - 添加适当的 emoji 图标
   - 包含代码示例和最佳实践

### 文档命名规范

- **用户文档**: 使用大写字母和下划线，如 `GETTING_STARTED.md`
- **内部文档**: 使用大写字母和下划线，如 `API_COVERAGE_ANALYSIS.md`
- **VitePress 文档**: 使用小写字母，如 `introduce.md`
- **中文文档**: 添加 `.cn` 后缀，如 `introduce.cn.md`（仅在同目录下）
- **英文文档**: 不添加后缀，如 `introduce.md`

### 多语言文档规范

VitePress 文档采用目录分离的方式：

```
packages/
├── guide/           # 英文指南（默认）
│   └── introduce.md
└── cn/              # 中文文档
    └── guide/
        └── introduce.md
```

**不要使用**：

```
guide/
├── introduce.md
├── introduce.cn.md  # ❌ 不推荐
└── introduce.en.md  # ❌ 不推荐
```

## 📊 文档统计

### 总体统计

| 类型           | 数量   | 说明                |
| -------------- | ------ | ------------------- |
| 项目根文档     | 2      | README + CHANGELOG  |
| 用户文档       | 6      | docs/ 目录          |
| 内部文档       | 17     | docs/internal/ 目录 |
| VitePress 指南 | 16     | 8个页面 × 2语言     |
| VitePress API  | 30     | 15个API × 2语言     |
| **总计**       | **71** | **完整文档体系**    |

### 代码量统计

| 类型           | 行数        | 说明                |
| -------------- | ----------- | ------------------- |
| 用户文档       | ~8,000      | Markdown            |
| 内部文档       | ~25,000     | Markdown            |
| VitePress 文档 | ~15,000     | Markdown + 示例代码 |
| **总计**       | **~48,000** | **约 48K 行**       |

## 🚀 访问文档

### 本地访问

```bash
# 查看 Markdown 文档
cat docs/README.md

# 启动 VitePress 文档服务器
pnpm docs:dev

# 构建文档
pnpm docs:build

# 预览构建结果
pnpm docs:preview
```

### 在线访问

- **GitHub Pages**: https://pipeljs.github.io/pipel-react/
- **GitHub 仓库**: https://github.com/pipeljs/pipel-react

## ✅ 文档完整性检查

- ✅ 所有 API 都有对应的文档
- ✅ 所有文档都有中英文版本
- ✅ 所有示例代码都经过测试
- ✅ 文档结构清晰，易于导航
- ✅ 内部文档和用户文档分离
- ✅ 文档索引完整

## 📅 更新历史

- **2024-10-19**: 完成文档整理，移动临时文档到 internal 目录
- **2024-10-19**: 创建完整的 VitePress 文档体系
- **2024-10-19**: 添加用户文档和快速参考
- **2024-10-19**: 建立文档组织规范

---

**维护者**: PipelJS Team  
**最后更新**: 2024-10-19
