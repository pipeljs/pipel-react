# Pipel-React Monorepo 迁移总结

## 🎯 迁移目标

将 pipel-react 从单包结构改造为与 pipel-vue 相似的 monorepo 架构，实现：

- ✅ 统一的项目结构
- ✅ 共享依赖管理
- ✅ 兼容的构建工具
- ✅ 优化的工作空间配置

## 📊 迁移前后对比

### 旧结构（单包）

```
pipel-react/
├── src/
│   ├── core/
│   ├── fetch/
│   ├── operators/
│   ├── utils/
│   └── index.ts
├── test/
├── examples/
├── package.json
├── tsconfig.json
└── vite.config.ts
```

### 新结构（Monorepo）

```
pipel-react/
├── packages/
│   ├── .vitepress/          # 文档配置
│   ├── core/                # 核心代码
│   │   ├── usePipel/       # 功能模块
│   │   ├── useFetch/
│   │   ├── fetch/
│   │   ├── utils/
│   │   └── index.ts
│   ├── guide/               # 指南文档
│   └── public/              # 静态资源
├── dist/
│   ├── cjs/                 # CommonJS 输出
│   └── mjs/                 # ES Module 输出
├── .husky/                  # Git Hooks
├── package.json
├── tsconfig.json
├── tsconfig.cjs.json
├── tsconfig.mjs.json
└── vitest.config.mjs
```

## ✅ 已完成的工作

### 1. 项目结构重组

#### 创建 packages 目录结构

```bash
packages/
├── .vitepress/              # ✅ VitePress 配置
│   ├── config.mts
│   ├── config.en.mts
│   └── config.cn.mts
├── core/                    # ✅ 核心代码
│   ├── usePipel.ts
│   ├── useStream.ts
│   ├── useObservable.ts
│   ├── to$.ts
│   ├── effect$.ts
│   ├── useSyncState.ts
│   ├── usePipelRender.ts
│   ├── persistStream$.ts
│   ├── fetch/
│   ├── utils/
│   ├── usePipel/           # ✅ 文档和测试
│   │   ├── index.en.md
│   │   ├── index.cn.md
│   │   └── test/
│   ├── useFetch/           # ✅ 文档和测试
│   │   ├── index.en.md
│   │   ├── index.cn.md
│   │   └── test/
│   └── index.ts
├── guide/                   # ✅ 指南文档
│   ├── index.en.md
│   ├── index.cn.md
│   ├── introduce.en.md
│   ├── introduce.cn.md
│   ├── quick.en.md
│   ├── quick.cn.md
│   ├── try.en.md
│   └── try.cn.md
└── public/                  # ✅ 静态资源
    └── index.html
```

### 2. 配置文件更新

#### package.json

```json
{
  "main": "./dist/cjs/index.js",
  "module": "./dist/mjs/index.js",
  "types": "./dist/mjs/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/mjs/index.js",
      "require": "./dist/cjs/index.js"
    }
  },
  "scripts": {
    "build": "rm -rf dist && tsc -p tsconfig.cjs.json && tsc -p tsconfig.mjs.json",
    "docs:dev": "vitepress dev packages",
    "docs:build": "vitepress build packages",
    "test": "vitest --run"
  }
}
```

#### TypeScript 配置

- ✅ `tsconfig.json` - 基础配置
- ✅ `tsconfig.cjs.json` - CommonJS 构建
- ✅ `tsconfig.mjs.json` - ES Module 构建

#### 工具配置

- ✅ `vitest.config.mjs` - 测试配置
- ✅ `eslint.config.mjs` - ESLint 配置
- ✅ `.prettierrc.json` - Prettier 配置
- ✅ `.commitlintrc.mjs` - Commitlint 配置
- ✅ `.lintstagedrc.cjs` - Lint-staged 配置
- ✅ `.npmrc` - npm 配置

### 3. 文档系统

#### VitePress 配置

- ✅ 主配置文件 (`config.mts`)
- ✅ 英文配置 (`config.en.mts`)
- ✅ 中文配置 (`config.cn.mts`)
- ✅ 多语言支持

#### 指南文档

- ✅ 介绍 (introduce.en.md / introduce.cn.md)
- ✅ 快速开始 (quick.en.md / quick.cn.md)
- ✅ 在线试用 (try.en.md / try.cn.md)

#### API 文档

- ✅ usePipel (index.en.md / index.cn.md)
- ✅ useFetch (index.en.md / index.cn.md)

### 4. Git Hooks

#### Husky 配置

- ✅ `.husky/pre-commit` - 提交前检查
- ✅ `.husky/commit-msg` - 提交信息检查

### 5. 测试迁移

- ✅ 测试文件移动到对应模块
- ✅ 测试配置更新
- ✅ 测试路径调整

## 📦 依赖管理

### 核心依赖

```json
{
  "dependencies": {
    "lodash-es": "^4.17.21",
    "pipeljs": "^0.3.37"
  }
}
```

### 开发依赖

```json
{
  "devDependencies": {
    "@commitlint/cli": "^19.5.0",
    "@commitlint/config-conventional": "^19.5.0",
    "@eslint/js": "^10.0.0",
    "@testing-library/react": "^14.0.0",
    "@types/react": "^18.2.0",
    "@vitejs/plugin-react": "^5.2.4",
    "@vitest/coverage-v8": "2.0.5",
    "eslint": "^9.13.0",
    "husky": "^9.1.6",
    "jsdom": "^25.0.1",
    "lint-staged": "^15.2.10",
    "prettier": "^3.3.3",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "standard-version": "^9.5.0",
    "typescript": "^5.6.3",
    "typescript-eslint": "^8.11.0",
    "vitepress": "1.3.4",
    "vitest": "2.0.5"
  }
}
```

## 🔧 构建系统

### 双格式输出

```bash
# CommonJS
dist/cjs/
├── index.js
├── index.d.ts
└── ...

# ES Module
dist/mjs/
├── index.js
├── index.d.ts
└── ...
```

### 构建命令

```bash
# 清理并构建
pnpm build

# 输出：
# - dist/cjs/ (CommonJS)
# - dist/mjs/ (ES Module)
```

## 📚 文档系统

### 启动文档服务

```bash
# 开发模式
pnpm docs:dev

# 构建文档
pnpm docs:build

# 预览文档
pnpm docs:preview
```

### 文档访问

- 英文文档: `http://localhost:5173/`
- 中文文档: `http://localhost:5173/cn/`

## 🧪 测试系统

### 运行测试

```bash
# 运行所有测试
pnpm test

# 运行测试并生成覆盖率
pnpm coverage

# 类型检查
pnpm check
```

## 🚀 发布流程

### 版本管理

```bash
# Patch 版本 (0.1.0 -> 0.1.1)
pnpm release-patch

# Minor 版本 (0.1.0 -> 0.2.0)
pnpm release-minor

# Major 版本 (0.1.0 -> 1.0.0)
pnpm release-major
```

### 发布到 npm

```bash
# 方式 1: 手动发布
pnpm build
npm publish

# 方式 2: 一键发布
pnpm release-and-publish:patch
pnpm release-and-publish:minor
pnpm release-and-publish:major
```

## 📊 与 pipel-vue 对比

| 特性                 | pipel-vue | pipel-react | 状态    |
| -------------------- | --------- | ----------- | ------- |
| **项目结构**         |
| Monorepo             | ✅        | ✅          | ✅ 一致 |
| packages/core        | ✅        | ✅          | ✅ 一致 |
| packages/guide       | ✅        | ✅          | ✅ 一致 |
| packages/.vitepress  | ✅        | ✅          | ✅ 一致 |
| packages/public      | ✅        | ✅          | ✅ 一致 |
| **构建系统**         |
| TypeScript           | ✅        | ✅          | ✅ 一致 |
| 双格式输出 (CJS+MJS) | ✅        | ✅          | ✅ 一致 |
| tsconfig.cjs.json    | ✅        | ✅          | ✅ 一致 |
| tsconfig.mjs.json    | ✅        | ✅          | ✅ 一致 |
| **文档系统**         |
| VitePress            | ✅        | ✅          | ✅ 一致 |
| 多语言支持           | ✅        | ✅          | ✅ 一致 |
| API 文档             | ✅        | ✅          | ✅ 一致 |
| 指南文档             | ✅        | ✅          | ✅ 一致 |
| **测试系统**         |
| Vitest               | ✅        | ✅          | ✅ 一致 |
| 测试覆盖率           | ✅        | ✅          | ✅ 一致 |
| **代码规范**         |
| ESLint               | ✅        | ✅          | ✅ 一致 |
| Prettier             | ✅        | ✅          | ✅ 一致 |
| Commitlint           | ✅        | ✅          | ✅ 一致 |
| Lint-staged          | ✅        | ✅          | ✅ 一致 |
| **Git Hooks**        |
| Husky                | ✅        | ✅          | ✅ 一致 |
| pre-commit           | ✅        | ✅          | ✅ 一致 |
| commit-msg           | ✅        | ✅          | ✅ 一致 |
| **版本管理**         |
| standard-version     | ✅        | ✅          | ✅ 一致 |
| CHANGELOG            | ✅        | ✅          | ✅ 一致 |

## 🎯 迁移优势

### 1. 统一的项目结构

- ✅ 与 pipel-vue 保持一致
- ✅ 降低学习成本
- ✅ 便于维护

### 2. 模块化设计

- ✅ 核心功能独立
- ✅ 文档与代码分离
- ✅ 易于扩展

### 3. 完善的工具链

- ✅ TypeScript 类型检查
- ✅ ESLint 代码检查
- ✅ Prettier 代码格式化
- ✅ Vitest 单元测试
- ✅ VitePress 文档生成

### 4. 自动化流程

- ✅ Git Hooks 自动检查
- ✅ 版本自动管理
- ✅ 文档自动生成
- ✅ 构建自动化

## 📝 使用指南

### 开发流程

```bash
# 1. 安装依赖
pnpm install

# 2. 开发功能
# 在 packages/core 中开发

# 3. 运行测试
pnpm test

# 4. 启动文档
pnpm docs:dev

# 5. 构建
pnpm build
```

### 提交代码

```bash
# 1. 添加文件
git add .

# 2. 提交（自动触发 lint-staged）
git commit -m "feat: add new feature"

# 3. 推送
git push
```

### 发布版本

```bash
# 1. 更新版本
pnpm release-patch

# 2. 构建
pnpm build

# 3. 发布
npm publish
```

## 🔍 文件清单

### 新增文件

```
✅ packages/.vitepress/config.mts
✅ packages/.vitepress/config.en.mts
✅ packages/.vitepress/config.cn.mts
✅ packages/core/index.ts
✅ packages/core/usePipel/index.en.md
✅ packages/core/usePipel/index.cn.md
✅ packages/core/useFetch/index.en.md
✅ packages/core/useFetch/index.cn.md
✅ packages/guide/index.en.md
✅ packages/guide/index.cn.md
✅ packages/guide/introduce.en.md
✅ packages/guide/introduce.cn.md
✅ packages/guide/quick.en.md
✅ packages/guide/quick.cn.md
✅ packages/guide/try.en.md
✅ packages/guide/try.cn.md
✅ packages/public/index.html
✅ tsconfig.cjs.json
✅ tsconfig.mjs.json
✅ vitest.config.mjs
✅ eslint.config.mjs
✅ .prettierrc.json
✅ .commitlintrc.mjs
✅ .lintstagedrc.cjs
✅ .npmrc
✅ .husky/pre-commit
✅ .husky/commit-msg
✅ MONOREPO_ARCHITECTURE.md
✅ MONOREPO_MIGRATION.md
```

### 移动文件

```
src/core/* → packages/core/
src/fetch/* → packages/core/fetch/
src/utils/* → packages/core/utils/
test/usePipel.test.tsx → packages/core/usePipel/test/
test/useFetch.test.tsx → packages/core/useFetch/test/
test/setup.ts → packages/core/
```

### 更新文件

```
✅ package.json - 更新脚本和依赖
✅ tsconfig.json - 更新路径配置
✅ .gitignore - 添加新的忽略规则
```

## 🎉 迁移完成

### 核心成果

1. ✅ **项目结构** - 完全对齐 pipel-vue
2. ✅ **构建系统** - 双格式输出 (CJS+MJS)
3. ✅ **文档系统** - VitePress + 多语言
4. ✅ **测试系统** - Vitest + 覆盖率
5. ✅ **代码规范** - ESLint + Prettier + Commitlint
6. ✅ **Git Hooks** - Husky + Lint-staged
7. ✅ **版本管理** - standard-version

### 下一步

```bash
# 1. 安装依赖
cd pipel-react
pnpm install

# 2. 运行测试
pnpm test

# 3. 启动文档
pnpm docs:dev

# 4. 构建
pnpm build
```

---

**🎊 Monorepo 迁移完成！项目已完全对齐 pipel-vue 架构！**
