# GitHub Workflows 配置完成

## 📋 概述

已成功为 pipel-react 项目添加完整的 GitHub Actions 工作流配置，参考自 pipel-vue 项目。

## ✅ 已创建的工作流

### 1. **Check Workflow** (`.github/workflows/check.yml`)

**功能：** 代码质量检查和测试

**触发条件：**

- 推送到 `master` 或 `main` 分支
- Pull Request
- 手动触发

**执行步骤：**

```bash
pnpm install
pnpm run check    # TypeScript 类型检查
pnpm run test     # 运行测试套件
```

**用途：** 确保每次代码变更都通过类型检查和测试

---

### 2. **Coverage Workflow** (`.github/workflows/coverage.yml`)

**功能：** 测试覆盖率分析和报告

**触发条件：**

- 推送版本标签（如 `v1.0.0`）

**执行步骤：**

```bash
pnpm install
pnpm run coverage                    # 生成覆盖率报告
# 上传到 Codecov
```

**配置要求：**

- ⚠️ 需要配置 GitHub Secret: `CODECOV_TOKEN`
- Codecov slug: `pipeljs/pipel-react`

---

### 3. **Docs Workflow** (`.github/workflows/docs.yml`)

**功能：** 自动构建和部署文档到 GitHub Pages

**触发条件：**

- 推送到 `master` 或 `main` 分支
- 手动触发

**执行步骤：**

```bash
pnpm install
pnpm run docs:build                  # 构建 VitePress 文档
# 部署到 GitHub Pages
```

**配置要求：**

- ⚠️ 需要配置 GitHub Secret: `PAGES_PAT`
- ⚠️ 需要在仓库设置中启用 GitHub Pages
- Pages 源设置为 "GitHub Actions"

**部署地址：** https://pipeljs.github.io/pipel-react/

---

### 4. **Release and Publish Workflow** (`.github/workflows/release-publish.yml`)

**功能：** 自动化版本发布流程

**触发条件：**

- 推送版本标签（如 `v1.0.0`）

**执行步骤：**

```bash
pnpm install --frozen-lockfile
pnpm run check                       # 类型检查
pnpm run build                       # 构建项目
pnpm publish --no-git-checks         # 发布到 npm
# 创建 GitHub Release
```

**配置要求：**

- ⚠️ 需要配置 GitHub Secret: `NPM_TOKEN`

---

## 🔧 必需的 GitHub Secrets 配置

在 GitHub 仓库设置 → Secrets and variables → Actions 中添加：

### 1. CODECOV_TOKEN

```
用途：上传测试覆盖率报告到 Codecov
获取方式：
1. 访问 https://codecov.io/
2. 使用 GitHub 账号登录
3. 添加 pipeljs/pipel-react 仓库
4. 复制生成的 token
```

### 2. PAGES_PAT

```
用途：部署文档到 GitHub Pages
获取方式：
1. GitHub Settings → Developer settings → Personal access tokens
2. Generate new token (classic)
3. 权限选择：repo, workflow
4. 复制生成的 token
```

### 3. NPM_TOKEN

```
用途：发布包到 npm
获取方式：
1. 访问 https://www.npmjs.com/
2. Account Settings → Access Tokens
3. Generate New Token → Automation
4. 复制生成的 token
```

---

## 🚀 使用指南

### 发布新版本

1. **更新版本号并生成 CHANGELOG：**

   ```bash
   # 补丁版本 (0.1.1 -> 0.1.2)
   pnpm run release-patch

   # 次版本 (0.1.1 -> 0.2.0)
   pnpm run release-minor

   # 主版本 (0.1.1 -> 1.0.0)
   pnpm run release-major
   ```

2. **推送标签到 GitHub：**

   ```bash
   git push --follow-tags origin master
   ```

3. **自动触发的工作流：**
   - ✅ Coverage - 生成并上传覆盖率报告
   - ✅ Release and Publish - 发布到 npm 并创建 GitHub Release

### 部署文档

文档会在每次推送到 `master` 或 `main` 分支时自动部署。

手动触发：

1. 访问 GitHub Actions 页面
2. 选择 "Deploy static content to Pages" 工作流
3. 点击 "Run workflow"

### 运行检查

每次推送或创建 Pull Request 时，Check 工作流会自动运行。

---

## 📊 工作流对比

| 工作流            | pipel-vue | pipel-react | 状态                    |
| ----------------- | --------- | ----------- | ----------------------- |
| Check             | ✅        | ✅          | 完全一致                |
| Coverage          | ✅        | ✅          | 完全一致（仅修改 slug） |
| Docs              | ✅        | ✅          | 完全一致                |
| Release & Publish | ✅        | ✅          | 完全一致                |

---

## 🎯 下一步操作

### 1. 配置 GitHub Secrets（必需）

在推送代码前，需要配置以下 Secrets：

- [ ] `CODECOV_TOKEN` - 用于覆盖率报告
- [ ] `PAGES_PAT` - 用于文档部署
- [ ] `NPM_TOKEN` - 用于 npm 发布

### 2. 启用 GitHub Pages（必需）

1. 访问仓库 Settings → Pages
2. Source 选择 "GitHub Actions"
3. 保存设置

### 3. 测试工作流

```bash
# 本地测试所有检查
pnpm run check
pnpm run test
pnpm run coverage
pnpm run docs:build
pnpm run build

# 推送代码触发 Check 工作流
git push origin master

# 创建标签触发 Coverage 和 Release 工作流
git tag v0.1.2
git push --tags
```

### 4. 添加状态徽章（可选）

在 `README.md` 中添加：

```markdown
[![Check](https://github.com/pipeljs/pipel-react/actions/workflows/check.yml/badge.svg)](https://github.com/pipeljs/pipel-react/actions/workflows/check.yml)
[![codecov](https://codecov.io/gh/pipeljs/pipel-react/branch/master/graph/badge.svg)](https://codecov.io/gh/pipeljs/pipel-react)
[![npm version](https://badge.fury.io/js/pipel-react.svg)](https://www.npmjs.com/package/pipel-react)
```

---

## 📁 文件结构

```
.github/
└── workflows/
    ├── README.md              # 工作流说明文档
    ├── check.yml              # 代码检查和测试
    ├── coverage.yml           # 测试覆盖率
    ├── docs.yml               # 文档部署
    └── release-publish.yml    # 版本发布
```

---

## 🔗 相关链接

- **pipel-vue workflows**: https://github.com/pipeljs/pipel-vue/tree/master/.github/workflows
- **GitHub Actions 文档**: https://docs.github.com/en/actions
- **VitePress 部署指南**: https://vitepress.dev/guide/deploy
- **npm 发布指南**: https://docs.npmjs.com/cli/v8/commands/npm-publish

---

## ✨ 总结

✅ 已成功添加 4 个 GitHub Actions 工作流
✅ 完全参考 pipel-vue 的配置
✅ 支持自动化测试、覆盖率、文档部署和版本发布
✅ 创建了详细的配置文档

**注意：** 在推送代码前，请先配置必需的 GitHub Secrets！
