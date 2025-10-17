# Pipel-React Core 目录结构

## 概述

`packages/core` 已重构为模块化的目录结构，每个功能模块都有自己的目录，包含 `index.ts` 主文件、文档和测试。

## 目录结构

```
packages/core/
├── index.ts                    # 主导出文件
├── setup.ts                    # 设置文件
│
├── usePipel/                   # 核心 Hook：Stream 转 React 状态
│   ├── index.ts
│   ├── index.cn.md
│   ├── index.en.md
│   └── test/
│
├── useStream/                  # Stream 创建 Hook
│   └── index.ts
│
├── useObservable/              # Observable 订阅 Hook
│   └── index.ts
│
├── to$/                        # React 状态转 Stream
│   └── index.ts
│
├── effect$/                    # 副作用 Stream
│   └── index.ts
│
├── useSyncState/               # 同步状态 Hook
│   └── index.ts
│
├── usePipelRender/             # Pipel 渲染 Hook
│   └── index.ts
│
├── persistStream$/             # 持久化 Stream
│   └── index.ts
│
├── computedStream$/            # 计算 Stream
│   ├── index.ts
│   ├── index.cn.md
│   └── test/
│
├── fromEvent/                  # 事件转 Stream
│   └── index.ts
│
├── asyncStream$/               # 异步 Stream
│   └── index.ts
│
├── batch$/                     # 批量 Stream 操作
│   └── index.ts
│
├── debug/                      # 调试工具
│   ├── index.ts
│   ├── index.cn.md
│   └── test/
│
├── fetch/                      # HTTP 请求模块
│   ├── index.ts
│   ├── types.ts
│   ├── utils.ts
│   ├── useFetch.ts
│   └── createFetch.ts
│
├── useFetch/                   # useFetch 文档
│   ├── index.cn.md
│   ├── index.en.md
│   └── test/
│
└── utils/                      # 工具函数
    └── helpers.ts
```

## 模块说明

### 核心 Hooks

- **usePipel**: 将 Stream 转换为 React 状态的核心 Hook
- **useStream**: 创建和管理 Stream 的 Hook
- **useObservable**: 订阅 Observable 的 Hook
- **to$**: 将 React 状态转换为 Stream
- **effect$**: 创建副作用 Stream
- **useSyncState**: 同步状态管理
- **usePipelRender**: Pipel 渲染优化
- **persistStream$**: 持久化 Stream 数据

### 高级功能

- **computedStream$**: 计算派生的 Stream
- **fromEvent**: 将 DOM 事件转换为 Stream
- **asyncStream$**: 处理异步操作的 Stream
- **batch$**: 批量处理多个 Stream

### 工具模块

- **debug**: 调试和性能监控工具
- **fetch**: HTTP 请求和数据获取
- **utils**: 通用工具函数

## 导入方式

所有模块都可以从主入口导入：

```typescript
import { 
  usePipel, 
  useStream, 
  useFetch,
  computedStream$,
  debug$
} from '@pipel/react'
```

或者直接从子模块导入：

```typescript
import { usePipel } from '@pipel/react/usePipel'
import { useFetch } from '@pipel/react/fetch'
```

## 优势

1. **模块化**: 每个功能独立成模块，便于维护和理解
2. **可扩展**: 新功能可以轻松添加为新目录
3. **文档齐全**: 每个模块都有自己的文档和测试
4. **清晰的职责**: 每个目录只负责一个功能领域
5. **Tree-shaking 友好**: 打包工具可以更好地优化未使用的代码

## 与 pipel-vue 的一致性

此结构与 `pipel-vue` 保持一致，使得：
- 跨项目理解更容易
- 文档和示例可以共享
- 维护模式统一
