# Pipel-React Monorepo 快速启动指南

## 🚀 快速开始

### 1. 安装依赖

```bash
cd pipel-react
pnpm install
```

### 2. 运行测试

```bash
pnpm test
```

### 3. 启动文档

```bash
pnpm docs:dev
```

访问 http://localhost:5173 查看文档

### 4. 构建项目

```bash
pnpm build
```

## 📁 项目结构

```
pipel-react/
├── packages/
│   ├── .vitepress/          # 文档配置
│   ├── core/                # 核心代码
│   │   ├── usePipel/       # usePipel Hook
│   │   ├── useFetch/       # useFetch Hook
│   │   └── index.ts        # 入口文件
│   ├── guide/               # 指南文档
│   └── public/              # 静态资源
├── dist/                    # 构建输出
│   ├── cjs/                # CommonJS
│   └── mjs/                # ES Module
└── package.json
```

## 🔧 常用命令

### 开发

```bash
# 运行测试
pnpm test

# 测试覆盖率
pnpm coverage

# 类型检查
pnpm check

# 代码检查
pnpm lint
```

### 文档

```bash
# 启动文档服务
pnpm docs:dev

# 构建文档
pnpm docs:build

# 预览文档
pnpm docs:preview
```

### 构建

```bash
# 构建库
pnpm build

# 输出：
# - dist/cjs/ (CommonJS)
# - dist/mjs/ (ES Module)
```

### 发布

```bash
# 更新版本
pnpm release-patch    # 0.1.0 -> 0.1.1
pnpm release-minor    # 0.1.0 -> 0.2.0
pnpm release-major    # 0.1.0 -> 1.0.0

# 一键发布
pnpm release-and-publish:patch
```

## 📚 文档结构

### 指南文档 (packages/guide/)

- `introduce.en.md` / `introduce.cn.md` - 介绍
- `quick.en.md` / `quick.cn.md` - 快速开始
- `try.en.md` / `try.cn.md` - 在线试用

### API 文档 (packages/core/)

- `usePipel/index.en.md` / `index.cn.md` - usePipel API
- `useFetch/index.en.md` / `index.cn.md` - useFetch API

## 🧪 测试

### 运行测试

```bash
# 运行所有测试
pnpm test

# 监听模式
pnpm test --watch

# 生成覆盖率
pnpm coverage
```

### 测试文件位置

```
packages/core/
├── usePipel/
│   └── test/
│       └── usePipel.test.tsx
└── useFetch/
    └── test/
        └── useFetch.test.tsx
```

## 🎨 代码规范

### 自动格式化

提交代码时会自动运行：

- ESLint 检查
- Prettier 格式化
- Commitlint 检查提交信息

### 提交规范

```bash
# 功能
git commit -m "feat: add new feature"

# 修复
git commit -m "fix: fix bug"

# 文档
git commit -m "docs: update docs"

# 测试
git commit -m "test: add tests"

# 重构
git commit -m "refactor: refactor code"
```

## 📦 构建输出

### 双格式支持

```javascript
// CommonJS
const { usePipel } = require('pipel-react')

// ES Module
import { usePipel } from 'pipel-react'
```

### 构建配置

- `tsconfig.cjs.json` - CommonJS 构建
- `tsconfig.mjs.json` - ES Module 构建

## 🔗 相关文档

- [项目架构](./MONOREPO_ARCHITECTURE.md) - 详细架构说明
- [迁移总结](./MONOREPO_MIGRATION.md) - 迁移过程记录
- [README](./README.md) - 项目说明
- [CHANGELOG](./CHANGELOG.md) - 变更日志

## 💡 开发工作流

### 1. 开发新功能

```bash
# 1. 在 packages/core 中开发
cd packages/core

# 2. 编写代码
# 3. 编写测试
# 4. 编写文档
```

### 2. 测试

```bash
# 运行测试
pnpm test

# 查看覆盖率
pnpm coverage
```

### 3. 文档

```bash
# 启动文档服务
pnpm docs:dev

# 在浏览器中预览
# http://localhost:5173
```

### 4. 提交

```bash
# 添加文件
git add .

# 提交（自动触发检查）
git commit -m "feat: add new feature"

# 推送
git push
```

### 5. 发布

```bash
# 更新版本
pnpm release-patch

# 构建
pnpm build

# 发布
npm publish
```

## 🎯 与 pipel-vue 对比

| 特性      | pipel-vue        | pipel-react         |
| --------- | ---------------- | ------------------- |
| 项目结构  | Monorepo         | Monorepo ✅         |
| 构建输出  | CJS+MJS          | CJS+MJS ✅          |
| 文档系统  | VitePress        | VitePress ✅        |
| 测试框架  | Vitest           | Vitest ✅           |
| 代码规范  | ESLint+Prettier  | ESLint+Prettier ✅  |
| Git Hooks | Husky            | Husky ✅            |
| 版本管理  | standard-version | standard-version ✅ |

## ❓ 常见问题

### Q: 如何添加新的 Hook？

1. 在 `packages/core` 中创建新文件
2. 在 `packages/core/index.ts` 中导出
3. 在 `packages/core/新Hook/` 中添加文档和测试

### Q: 如何更新文档？

1. 编辑 `packages/guide/` 或 `packages/core/` 中的 `.md` 文件
2. 运行 `pnpm docs:dev` 预览
3. 提交更改

### Q: 如何发布新版本？

```bash
# 1. 更新版本
pnpm release-patch

# 2. 构建
pnpm build

# 3. 发布
npm publish
```

## 🎉 开始使用

```bash
# 1. 克隆项目
git clone https://github.com/pipeljs/pipel-react.git

# 2. 安装依赖
cd pipel-react
pnpm install

# 3. 运行测试
pnpm test

# 4. 启动文档
pnpm docs:dev

# 5. 开始开发！
```

---

**Happy Coding! 🚀**
