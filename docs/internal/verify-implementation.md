# Pipel-React 实现验证清单

## ✅ 已完成的实现

### 1. usePipel Hook

- ✅ 文件: `packages/core/usePipel.ts`
- ✅ 功能: 将 Stream/Observable 转换为 React 状态
- ✅ 导出 `$` 工厂函数
- ✅ 自动订阅和清理
- ✅ 支持创建新 Stream 或使用现有 Stream
- ✅ 测试文件: `packages/core/usePipel/test/usePipel.test.tsx`

### 2. useFetch Hook

- ✅ 文件: `packages/core/fetch/useFetch.ts`
- ✅ 完整的 HTTP 请求管理
- ✅ 支持所有 HTTP 方法
- ✅ 支持多种响应类型
- ✅ 请求取消、重试、缓存
- ✅ 防抖和节流
- ✅ SSE/NDJSON 流式响应
- ✅ 生命周期钩子
- ✅ Promise 接口
- ✅ Stream 集成
- ✅ 测试文件: `packages/core/useFetch/test/useFetch.test.tsx`

### 3. createFetch 工厂函数

- ✅ 文件: `packages/core/fetch/createFetch.ts`
- ✅ 创建带默认配置的 fetch 实例
- ✅ 支持 baseUrl 和默认 headers
- ✅ 支持钩子组合

### 4. 类型定义

- ✅ 文件: `packages/core/fetch/types.ts`
- ✅ 完整的 TypeScript 类型定义
- ✅ 与 pipel-vue 保持一致的 API

### 5. 工具函数

- ✅ 文件: `packages/core/fetch/utils.ts`
- ✅ URL 处理
- ✅ 参数处理
- ✅ 回调组合
- ✅ 事件钩子

### 6. 导出配置

- ✅ 文件: `packages/core/fetch/index.ts`
- ✅ 统一导出所有 fetch 相关功能

## 📝 实现对比

### pipel-vue vs pipel-react

| 功能             | pipel-vue      | pipel-react    | 状态 |
| ---------------- | -------------- | -------------- | ---- |
| 基础 Stream 转换 | ✅ usePipel    | ✅ usePipel    | ✅   |
| HTTP 请求        | ✅ useFetch    | ✅ useFetch    | ✅   |
| 工厂函数         | ✅ createFetch | ✅ createFetch | ✅   |
| 请求取消         | ✅             | ✅             | ✅   |
| 请求重试         | ✅             | ✅             | ✅   |
| 请求缓存         | ✅             | ✅             | ✅   |
| 防抖节流         | ✅             | ✅             | ✅   |
| 流式响应         | ✅ SSE/NDJSON  | ✅ SSE/NDJSON  | ✅   |
| 生命周期钩子     | ✅             | ✅             | ✅   |
| Promise 接口     | ✅             | ✅             | ✅   |
| Stream 集成      | ✅ promise$    | ✅ promise$    | ✅   |
| 类型安全         | ✅             | ✅             | ✅   |

## 🔍 核心差异

### 响应式系统

- **Vue**: `ref`, `computed`, `watch`
- **React**: `useState`, `useMemo`, `useEffect`

### 生命周期

- **Vue**: `onScopeDispose`
- **React**: `useEffect` cleanup function

### 值获取

- **Vue**: `toValue()`, `isRef()`
- **React**: 直接值或函数调用

## 📦 依赖

```json
{
  "dependencies": {
    "lodash-es": "^4.17.21",
    "pipeljs": "^0.3.37"
  },
  "peerDependencies": {
    "react": "^18.0.0"
  }
}
```

## 🧪 测试

### 运行测试

```bash
npm test
```

### 测试覆盖

- usePipel 基础功能
- useFetch GET/POST 请求
- 错误处理
- 手动执行
- 取消请求

## 📚 使用示例

### 基础用法

```typescript
import { usePipel, useFetch } from 'pipel-react'

// usePipel
function Counter() {
  const [count, count$] = usePipel(0)

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => count$.next(count + 1)}>+</button>
    </div>
  )
}

// useFetch
function UserList() {
  const { data, loading, error } = useFetch<User[]>('/api/users', {
    immediate: true
  })

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <ul>
      {data?.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  )
}
```

### 高级用法

```typescript
import { usePipel, useFetch, $, debounce, map } from 'pipel-react'

function SearchUsers() {
  const [query, query$] = usePipel('')

  // 使用 Stream 操作符
  const searchUrl$ = query$.pipe(
    debounce(300),
    map(q => `/api/users?q=${q}`)
  )

  const { data, loading } = useFetch<User[]>(searchUrl$, {
    refetch: true
  })

  return (
    <div>
      <input
        value={query}
        onChange={e => query$.next(e.target.value)}
      />
      {loading && <div>Searching...</div>}
      {data?.map(user => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  )
}
```

### 工厂函数

```typescript
import { createFetch } from 'pipel-react'

const useAPI = createFetch({
  baseUrl: 'https://api.example.com',
  options: {
    headers: {
      'Authorization': 'Bearer token'
    },
    beforeFetch: async (ctx) => {
      console.log('Request:', ctx.url)
      return ctx
    },
    afterFetch: async (ctx) => {
      console.log('Response:', ctx.data)
      return ctx
    }
  }
})

function App() {
  const { data } = useAPI('/users')
  return <div>{JSON.stringify(data)}</div>
}
```

## ✅ 验证步骤

1. ✅ 实现 usePipel 核心功能
2. ✅ 实现 useFetch 完整功能
3. ✅ 实现 createFetch 工厂函数
4. ✅ 创建类型定义
5. ✅ 创建工具函数
6. ✅ 编写测试用例
7. ⏳ 运行测试验证
8. ⏳ 在 demo 中实际使用
9. ⏳ 文档更新

## 🎯 下一步

1. 完成依赖安装
2. 运行测试套件
3. 在 pipel-react-demo 中测试实际使用
4. 根据测试结果优化实现
5. 更新 API 文档

## 📄 相关文件

- `IMPLEMENTATION_SUMMARY.md` - 详细实现总结
- `packages/core/usePipel.ts` - usePipel 实现
- `packages/core/fetch/useFetch.ts` - useFetch 实现
- `packages/core/fetch/createFetch.ts` - createFetch 实现
- `packages/core/fetch/types.ts` - 类型定义
- `packages/core/fetch/utils.ts` - 工具函数
- `packages/core/index.ts` - 统一导出
