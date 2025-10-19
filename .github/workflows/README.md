# GitHub Actions Workflows

本目录包含 pipel-react 项目的 GitHub Actions 工作流配置。

## 工作流列表

### 1. Check (`check.yml`)

**触发条件：**

- 推送到 `master` 或 `main` 分支
- Pull Request
- 手动触发

**功能：**

- 运行类型检查 (`pnpm run check`)
- 运行测试套件 (`pnpm run test`)

**用途：** 确保代码质量和测试通过

---

### 2. Coverage (`coverage.yml`)

**触发条件：**

- 推送版本标签（如 `v1.0.0`、`v2.1.5` 等）

**功能：**

- 运行测试覆盖率分析 (`pnpm run coverage`)
- 上传覆盖率报告到 Codecov

**用途：** 跟踪代码测试覆盖率

**配置要求：**

- 需要在 GitHub Secrets 中配置 `CODECOV_TOKEN`
- Codecov slug: `pipeljs/pipel-react`

---

### 3. Docs (`docs.yml`)

**触发条件：**

- 推送到 `master` 或 `main` 分支
- 手动触发

**功能：**

- 构建 VitePress 文档 (`pnpm run docs:build`)
- 部署到 GitHub Pages

**用途：** 自动部署文档网站

**配置要求：**

- 需要在 GitHub Secrets 中配置 `PAGES_PAT`（Personal Access Token）
- 需要在仓库设置中启用 GitHub Pages
- Pages 源设置为 GitHub Actions

**访问地址：** https://pipeljs.github.io/pipel-react/

---

### 4. Release and Publish (`release-publish.yml`)

**触发条件：**

- 推送版本标签（如 `v1.0.0`、`v2.1.5` 等）

**功能：**

- 运行类型检查
- 构建项目
- 发布到 npm
- 创建 GitHub Release

**用途：** 自动化版本发布流程

**配置要求：**

- 需要在 GitHub Secrets 中配置 `NPM_TOKEN`
- npm 包名：`pipel-react`

---

## 配置 Secrets

在 GitHub 仓库设置中添加以下 Secrets：

1. **CODECOV_TOKEN**
   - 用于上传测试覆盖率报告
   - 从 https://codecov.io/ 获取

2. **PAGES_PAT**
   - 用于部署 GitHub Pages
   - 创建 Personal Access Token，权限：`repo`, `workflow`

3. **NPM_TOKEN**
   - 用于发布到 npm
   - 从 https://www.npmjs.com/ 账户设置中生成

---

## 发布流程

### 发布新版本

1. **更新版本号：**

   ```bash
   pnpm run release-patch  # 补丁版本 (0.1.1 -> 0.1.2)
   pnpm run release-minor  # 次版本 (0.1.1 -> 0.2.0)
   pnpm run release-major  # 主版本 (0.1.1 -> 1.0.0)
   ```

2. **推送标签：**

   ```bash
   git push --follow-tags origin master
   ```

3. **自动触发：**
   - `coverage.yml` - 生成覆盖率报告
   - `release-publish.yml` - 发布到 npm 和创建 GitHub Release

---

## 本地测试

在推送前，可以本地运行相同的检查：

```bash
# 类型检查
pnpm run check

# 运行测试
pnpm run test

# 测试覆盖率
pnpm run coverage

# 构建文档
pnpm run docs:build

# 预览文档
pnpm run docs:preview

# 构建项目
pnpm run build
```

---

## 工作流状态徽章

可以在 README.md 中添加以下徽章：

```markdown
![Check](https://github.com/pipeljs/pipel-react/actions/workflows/check.yml/badge.svg)
![Coverage](https://codecov.io/gh/pipeljs/pipel-react/branch/master/graph/badge.svg)
```

---

## 参考

- 参考自 [pipel-vue](https://github.com/pipeljs/pipel-vue) 的工作流配置
- GitHub Actions 文档: https://docs.github.com/en/actions
- VitePress 部署文档: https://vitepress.dev/guide/deploy
