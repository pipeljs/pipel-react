# Pipel-React Monorepo 架构文档

## 📁 项目结构

```
pipel-react/
├── .github/                    # GitHub 配置
│   └── workflows/             # CI/CD 工作流
├── .husky/                     # Git Hooks
│   ├── pre-commit             # 提交前检查
│   └── commit-msg             # 提交信息检查
├── packages/                   # Monorepo 包目录
│   ├── .vitepress/            # VitePress 文档配置
│   │   ├── config.mts         # 主配置
│   │   ├── config.en.mts      # 英文配置
│   │   └── config.cn.mts      # 中文配置
│   ├── core/                  # 核心代码包
│   │   ├── usePipel.ts        # 核心 Hook
│   │   ├── useStream.ts       # Stream Hook
│   │   ├── useObservable.ts   # Observable Hook
│   │   ├── to$.ts             # State 转 Stream
│   │   ├── effect$.ts         # 副作用流
│   │   ├── useSyncState.ts    # 双向同步
│   │   ├── usePipelRender.ts  # 流式渲染
│   │   ├── persistStream$.ts  # 持久化流
│   │   ├── fetch/             # HTTP 功能
│   │   │   ├── useFetch.ts
│   │   │   ├── createFetch.ts
│   │   │   └── types.ts
│   │   ├── utils/             # 工具函数
│   │   │   └── helpers.ts
│   │   ├── usePipel/          # usePipel 文档和测试
│   │   │   ├── index.en.md
│   │   │   ├── index.cn.md
│   │   │   └── test/
│   │   ├── useFetch/          # useFetch 文档和测试
│   │   │   ├── index.en.md
│   │   │   ├── index.cn.md
│   │   │   └── test/
│   │   └── index.ts           # 核心包入口
│   ├── guide/                 # 指南文档
│   │   ├── index.en.md
│   │   ├── index.cn.md
│   │   ├── introduce.en.md
│   │   ├── introduce.cn.md
│   │   ├── quick.en.md
│   │   ├── quick.cn.md
│   │   ├── reactive.en.md
│   │   ├── reactive.cn.md
│   │   ├── render.en.md
│   │   ├── render.cn.md
│   │   ├── immutable.en.md
│   │   ├── immutable.cn.md
│   │   ├── debug.en.md
│   │   └── debug.cn.md
│   └── public/                # 静态资源
│       ├── logo.svg
│       ├── favico.ico
│       └── index.html
├── dist/                       # 构建输出
│   ├── cjs/                   # CommonJS 格式
│   └── mjs/                   # ES Module 格式
├── examples/                   # 示例（可选保留）
├── scripts/                    # 构建脚本
├── .commitlintrc.mjs          # Commitlint 配置
├── .eslintrc.config.mjs       # ESLint 配置
├── .gitignore                 # Git 忽略
├── .lintstagedrc.cjs          # Lint-staged 配置
├── .npmignore                 # npm 忽略
├── .npmrc                     # npm 配置
├── .prettierrc.json           # Prettier 配置
├── CHANGELOG.md               # 变更日志
├── LICENSE                    # 许可证
├── package.json               # 项目配置
├── README.md                  # 项目说明
├── tsconfig.json              # TypeScript 基础配置
├── tsconfig.cjs.json          # CommonJS 构建配置
├── tsconfig.mjs.json          # ES Module 构建配置
└── vitest.config.mjs          # Vitest 测试配置
```

## 🎯 架构设计原则

### 1. 与 pipel-vue 保持一致

```
pipel-vue/                    pipel-react/
├── packages/                 ├── packages/
│   ├── core/                │   ├── core/
│   │   ├── usePipel/        │   │   ├── usePipel/
│   │   └── useFetch/        │   │   └── useFetch/
│   └── guide/               │   └── guide/
├── dist/                     ├── dist/
│   ├── cjs/                 │   ├── cjs/
│   └── mjs/                 │   └── mjs/
└── package.json             └── package.json
```

### 2. 模块化组织

- **packages/core**: 核心功能代码
- **packages/guide**: 文档指南
- **packages/public**: 静态资源
- **packages/.vitepress**: 文档站点配置

### 3. 文档即代码

每个核心功能都包含：

- 源代码实现
- API 文档（中英文）
- 单元测试
- 使用示例

## 📦 包管理

### 依赖结构

```json
{
  "dependencies": {
    "lodash-es": "^4.17.21",
    "pipeljs": "^0.3.37"
  },
  "peerDependencies": {
    "react": "^18.0.0"
  },
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

### 构建输出

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
  }
}
```

## 🔧 构建系统

### TypeScript 配置

#### tsconfig.json (基础配置)

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "strict": true,
    "moduleResolution": "bundler",
    "skipLibCheck": true
  },
  "include": ["packages/core"]
}
```

#### tsconfig.cjs.json (CommonJS)

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "module": "CommonJS",
    "outDir": "./dist/cjs",
    "declaration": true
  }
}
```

#### tsconfig.mjs.json (ES Module)

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "module": "ESNext",
    "outDir": "./dist/mjs",
    "declaration": true
  }
}
```

### 构建脚本

```json
{
  "scripts": {
    "build": "rm -rf dist && tsc -p tsconfig.cjs.json && tsc -p tsconfig.mjs.json",
    "test": "vitest --run",
    "check": "tsc --noEmit",
    "coverage": "vitest run --coverage",
    "docs:dev": "vitepress dev packages",
    "docs:build": "vitepress build packages",
    "docs:preview": "vitepress preview packages"
  }
}
```

## 📚 文档系统

### VitePress 配置

#### 多语言支持

```typescript
// packages/.vitepress/config.mts
export default defineConfig({
  locales: {
    root: {
      label: 'English',
      lang: 'en',
      ...enConfig,
    },
    cn: {
      label: '简体中文',
      lang: 'zh-CN',
      ...cnConfig,
    },
  },
})
```

#### 文档结构

```
packages/
├── guide/                    # 指南
│   ├── introduce.en.md      # 介绍（英文）
│   ├── introduce.cn.md      # 介绍（中文）
│   ├── quick.en.md          # 快速开始
│   └── ...
└── core/                     # API 文档
    ├── usePipel/
    │   ├── index.en.md      # API 文档（英文）
    │   └── index.cn.md      # API 文档（中文）
    └── useFetch/
        ├── index.en.md
        └── index.cn.md
```

## 🧪 测试策略

### 测试组织

```
packages/core/
├── usePipel/
│   ├── index.ts             # 实现
│   ├── index.en.md          # 文档
│   └── test/                # 测试
│       └── usePipel.test.tsx
└── useFetch/
    ├── useFetch.ts
    ├── index.en.md
    └── test/
        └── useFetch.test.tsx
```

### Vitest 配置

```typescript
// vitest.config.mjs
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./packages/core/setup.ts'],
  },
})
```

## 🔄 工作流

### 开发流程

1. **开发功能**

   ```bash
   # 在 packages/core 中开发
   cd packages/core
   ```

2. **编写测试**

   ```bash
   # 运行测试
   pnpm test
   ```

3. **编写文档**

   ```bash
   # 启动文档服务
   pnpm docs:dev
   ```

4. **构建**
   ```bash
   # 构建库
   pnpm build
   ```

### Git 工作流

```bash
# 1. 提交代码（自动触发 lint-staged）
git add .
git commit -m "feat: add new feature"

# 2. 发布版本
pnpm release-patch  # 0.1.0 -> 0.1.1
pnpm release-minor  # 0.1.0 -> 0.2.0
pnpm release-major  # 0.1.0 -> 1.0.0

# 3. 构建并发布
pnpm build
npm publish
```

## 🎨 代码规范

### ESLint 配置

```javascript
// eslint.config.mjs
export default tseslint.config(js.configs.recommended, ...tseslint.configs.recommended, {
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        argsIgnorePattern: '^_',
      },
    ],
  },
})
```

### Prettier 配置

```json
{
  "semi": false,
  "singleQuote": true,
  "trailingComma": "es5",
  "printWidth": 100
}
```

### Commitlint 配置

```javascript
// .commitlintrc.mjs
export default {
  extends: ['@commitlint/config-conventional'],
}
```

## 🚀 发布流程

### 版本管理

使用 `standard-version` 自动管理版本：

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
# 1. 构建
pnpm build

# 2. 发布
npm publish

# 或一键发布
pnpm release-and-publish:patch
```

## 📊 与 pipel-vue 对比

| 特性           | pipel-vue        | pipel-react      | 说明    |
| -------------- | ---------------- | ---------------- | ------- |
| 项目结构       | Monorepo         | Monorepo         | ✅ 一致 |
| packages/core  | ✅               | ✅               | ✅ 一致 |
| packages/guide | ✅               | ✅               | ✅ 一致 |
| VitePress 文档 | ✅               | ✅               | ✅ 一致 |
| 双语支持       | ✅               | ✅               | ✅ 一致 |
| TypeScript     | ✅               | ✅               | ✅ 一致 |
| 测试框架       | Vitest           | Vitest           | ✅ 一致 |
| 代码规范       | ESLint+Prettier  | ESLint+Prettier  | ✅ 一致 |
| Git Hooks      | Husky            | Husky            | ✅ 一致 |
| 版本管理       | standard-version | standard-version | ✅ 一致 |
| 构建输出       | CJS+MJS          | CJS+MJS          | ✅ 一致 |

## 🎯 优势

### 1. 统一的项目结构

- 与 pipel-vue 保持一致的目录组织
- 便于维护和理解
- 降低学习成本

### 2. 模块化设计

- 核心功能独立
- 文档与代码分离
- 易于扩展

### 3. 完善的工具链

- TypeScript 类型检查
- ESLint 代码检查
- Prettier 代码格式化
- Vitest 单元测试
- VitePress 文档生成

### 4. 自动化流程

- Git Hooks 自动检查
- 版本自动管理
- 文档自动生成
- 构建自动化

## 📝 最佳实践

### 1. 代码组织

- 每个功能一个目录
- 包含实现、文档、测试
- 保持目录结构扁平

### 2. 文档编写

- 中英文双语
- 包含示例代码
- 保持文档更新

### 3. 测试覆盖

- 核心功能必须测试
- 边界情况测试
- 集成测试

### 4. 版本发布

- 遵循语义化版本
- 更新 CHANGELOG
- 标记 Git Tag

## 🔗 相关资源

- [pipel-vue 源码](https://github.com/pipeljs/pipel-vue)
- [VitePress 文档](https://vitepress.dev)
- [Vitest 文档](https://vitest.dev)
- [TypeScript 文档](https://www.typescriptlang.org)

---

**Monorepo 架构已完成！** 🎉
