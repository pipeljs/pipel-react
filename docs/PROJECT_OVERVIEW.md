# Pipel-React 项目概览

## 📁 项目结构

```
pipel-react/
├── src/                          # 源代码
│   ├── core/                     # 核心 Hooks
│   │   ├── usePipel.ts          # ⭐ 核心 Hook - Stream 转 State
│   │   ├── useStream.ts         # 创建稳定的 Stream
│   │   ├── useObservable.ts     # 订阅 Observable
│   │   ├── to$.ts               # State 转 Stream
│   │   ├── effect$.ts           # 副作用流
│   │   ├── useSyncState.ts      # 双向同步
│   │   ├── usePipelRender.ts    # 流式渲染
│   │   └── persistStream$.ts    # 持久化流
│   ├── fetch/                    # HTTP 请求
│   │   ├── useFetch.ts          # ⭐ HTTP Hook
│   │   ├── createFetch.ts       # 自定义 Fetch
│   │   └── types.ts             # 类型定义
│   ├── operators/                # 操作符
│   │   └── index.ts             # 重导出 pipeljs 操作符
│   ├── utils/                    # 工具函数
│   │   └── helpers.ts           # 辅助函数
│   └── index.ts                  # ⭐ 主入口
│
├── test/                         # 测试
│   ├── setup.ts                 # 测试配置
│   ├── usePipel.test.tsx        # usePipel 测试
│   └── useFetch.test.tsx        # useFetch 测试
│
├── examples/                     # 示例应用
│   ├── basic/                   # 基础示例
│   │   ├── Counter.tsx          # 计数器
│   │   ├── SearchBox.tsx        # 搜索防抖
│   │   └── TodoList.tsx         # 待办列表
│   ├── fetch/                   # HTTP 示例
│   │   └── UserList.tsx         # 用户列表
│   ├── advanced/                # 高级示例
│   │   ├── PersistCounter.tsx   # 持久化
│   │   └── SyncStateExample.tsx # 双向同步
│   ├── App.tsx                  # 示例入口
│   ├── main.tsx                 # React 入口
│   └── index.html               # HTML 模板
│
├── scripts/                      # 脚本
│   └── setup.sh                 # 安装脚本
│
├── docs/                         # 文档目录
│
├── package.json                  # 项目配置
├── tsconfig.json                 # TypeScript 配置
├── vite.config.ts                # Vite 配置
├── README.md                     # 使用文档
├── CHANGELOG.md                  # 变更日志
├── PROJECT_OVERVIEW.md           # 本文件
├── .gitignore                    # Git 忽略
└── .npmignore                    # npm 忽略
```

## 🎯 核心 API 一览

### Hooks (8个)

| Hook             | 功能            | 使用场景        |
| ---------------- | --------------- | --------------- |
| `usePipel`       | Stream → State  | 基础响应式状态  |
| `useStream`      | 创建 Stream     | 需要稳定引用    |
| `useObservable`  | 订阅 Observable | 订阅派生流      |
| `to$`            | State → Stream  | 转换现有状态    |
| `effect$`        | 副作用          | 日志、持久化    |
| `useSyncState`   | 双向同步        | State ↔ Stream |
| `usePipelRender` | 流式渲染        | 动态组件        |
| `persistStream$` | 持久化          | localStorage    |

### HTTP (2个)

| API           | 功能         | 使用场景 |
| ------------- | ------------ | -------- |
| `useFetch`    | HTTP 请求    | 数据获取 |
| `createFetch` | 自定义 Fetch | 统一配置 |

### 操作符 (30+)

从 `pipeljs` 重导出所有操作符：

- **转换**: map, scan, reduce
- **过滤**: filter, distinctUntilChanged, take, skip
- **组合**: merge, concat, promiseAll, promiseRace
- **时间**: debounce, throttle, delay, timeout
- **错误**: catchError, retry
- **工具**: tap, share, startWith, endWith

## 🔄 数据流图

```
┌─────────────┐
│   React     │
│   State     │
└──────┬──────┘
       │ to$()
       ▼
┌─────────────┐     pipe()      ┌─────────────┐
│   Stream    │ ───────────────▶│  Operators  │
│             │                 │  (map, etc) │
└──────┬──────┘                 └──────┬──────┘
       │                               │
       │ usePipel()                    │
       ▼                               ▼
┌─────────────┐                ┌─────────────┐
│   React     │                │  Observable │
│   State     │                └──────┬──────┘
└─────────────┘                       │
                                      │ useObservable()
                                      ▼
                               ┌─────────────┐
                               │   React     │
                               │   State     │
                               └─────────────┘
```

## 💡 使用模式

### 模式 1: 基础响应式

```tsx
const [value, value$] = usePipel(0)
// value: React State
// value$: Stream (可以 .next() 更新)
```

### 模式 2: 操作符链

```tsx
const [input, input$] = usePipel('')

const result = useObservable(input$.pipe(debounce(300), map(transform), filter(validate)))
```

### 模式 3: HTTP 请求

```tsx
const { data, loading, error } = useFetch('/api/data', {
  immediate: true,
})
```

### 模式 4: 持久化

```tsx
const theme$ = persistStream$('dark', { key: 'theme' })
const [theme] = usePipel(theme$)
```

### 模式 5: 双向同步

```tsx
const [value, setValue, value$] = useSyncState(0)
// setValue(10) 和 value$.next(10) 都会同步
```

## 🧪 测试策略

### 单元测试

- ✅ usePipel - 创建、更新、清理
- ✅ useFetch - 请求、错误、重试

### 集成测试

- ⏳ 多个 Hook 组合使用
- ⏳ 复杂操作符链
- ⏳ 错误边界

### E2E 测试

- ⏳ 完整应用流程
- ⏳ 性能测试

## 📊 性能考虑

### 优化点

1. **引用稳定**: 使用 `useRef` 保持 Stream 引用
2. **避免重渲染**: 只在值变化时更新
3. **自动清理**: 组件卸载时取消订阅
4. **批量更新**: React 18 自动批处理

### 性能指标

- 初始化: < 1ms
- 更新延迟: < 5ms
- 内存占用: 最小化

## 🔧 开发工作流

### 1. 开发

```bash
pnpm dev          # 运行示例
pnpm test         # 运行测试
pnpm test:ui      # 测试 UI
```

### 2. 构建

```bash
pnpm build        # 构建库
pnpm lint         # 代码检查
```

### 3. 发布

```bash
pnpm version patch/minor/major
pnpm publish
```

## 📚 学习路径

### 初学者

1. 阅读 README.md
2. 运行 Counter 示例
3. 尝试 SearchBox 示例
4. 理解 usePipel 原理

### 进阶

1. 学习操作符组合
2. 使用 useFetch
3. 实现自定义 Hook
4. 性能优化

### 高级

1. 源码阅读
2. 贡献代码
3. 扩展功能
4. 生态建设

## 🎨 设计原则

### 1. 简单优先

- API 设计简洁
- 学习曲线平缓
- 默认行为合理

### 2. 类型安全

- 完整的 TypeScript 支持
- 类型推导准确
- 编译时错误检查

### 3. 性能优先

- 最小化重渲染
- 自动清理资源
- 内存占用低

### 4. 可扩展性

- 支持自定义操作符
- 支持插件系统
- 易于集成

## 🔗 相关资源

- [PipelJS 核心库](../pipel)
- [Pipel-Vue](../pipel-vue)
- [设计文档](./pipel-react设计方案.md)
- [实施总结](./pipel-react实施总结.md)

## 🤝 贡献指南

### 提交 PR

1. Fork 项目
2. 创建分支
3. 编写代码和测试
4. 提交 PR

### 代码规范

- 使用 TypeScript
- 添加 JSDoc 注释
- 编写单元测试
- 遵循 ESLint 规则

### 提交信息

```
feat: 添加新功能
fix: 修复 bug
docs: 更新文档
test: 添加测试
refactor: 重构代码
```

## 📝 待办事项

### 短期 (v0.1.x)

- [x] 核心 Hooks 实现
- [x] useFetch 实现
- [x] 基础测试
- [x] 示例应用
- [ ] 完善测试覆盖
- [ ] 性能优化

### 中期 (v0.2.x)

- [ ] React 18 特性集成
- [ ] DevTools 插件
- [ ] 更多示例
- [ ] 性能监控

### 长期 (v1.0.x)

- [ ] Next.js 集成
- [ ] React Native 支持
- [ ] SSR 优化
- [ ] 生态建设

## 🎉 快速开始

```bash
# 1. 安装依赖
cd pipel-react
pnpm install

# 2. 运行示例
pnpm dev

# 3. 运行测试
pnpm test

# 4. 构建
pnpm build
```

---

**Happy Coding! 🚀**
