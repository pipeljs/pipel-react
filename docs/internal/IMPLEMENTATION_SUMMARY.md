# Pipel-React usePipel 和 useFetch 实现总结

## 概述

基于 pipel-vue 的实现,为 pipel-react 完成了 `usePipel` 和 `useFetch` 的完整实现。

## 实现的功能

### 1. usePipel Hook

**文件**: `packages/core/usePipel.ts`

**核心功能**:

- 将 Stream/Observable 转换为 React 状态
- 支持创建新的 Stream 或使用现有的 Stream/Observable
- 自动订阅和取消订阅
- 使用 React Hooks (useState, useEffect, useMemo) 实现
- 导出 `$` 工厂函数用于创建 Stream

**API**:

```typescript
// 创建新的 Stream
const [count, count$] = usePipel(0)

// 使用现有的 Stream
const stream$ = new Stream(0)
const [value] = usePipel(stream$)

// 使用 $ 工厂函数
const stream$ = $(initialValue)
```

### 2. useFetch Hook

**文件**: `packages/core/fetch/useFetch.ts`

**核心功能**:

- 完整的 HTTP 请求管理
- 支持所有 HTTP 方法 (GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS)
- 支持多种响应类型 (json, text, blob, arrayBuffer, formData)
- 自动状态管理 (loading, error, data, isFinished)
- 请求取消 (AbortController)
- 请求重试
- 请求缓存
- 防抖和节流
- 自动刷新
- SSE 和 NDJSON 流式响应支持
- 生命周期钩子 (beforeFetch, afterFetch, onFetchError)
- 事件钩子 (onFetchResponse, onFetchError, onFetchFinally)
- Promise 接口支持
- Stream 集成 (promise$)

**API**:

```typescript
// 基础用法
const { data, loading, error, execute } = useFetch<User>('/api/user')

// 链式调用
const { data } = useFetch('/api/user').get({ id: 1 }).json<User>()

// POST 请求
const { data } = useFetch('/api/user').post({ name: 'John' }).json<User>()

// 配置选项
const { data } = useFetch('/api/user', {
  immediate: true,
  refetch: true,
  retry: 3,
  timeout: 5000,
  debounce: 300,
  cacheSetting: {
    expiration: 60000,
    cacheResolve: ({ url }) => url,
  },
})
```

### 3. createFetch 工厂函数

**文件**: `packages/core/fetch/createFetch.ts`

**核心功能**:

- 创建带有默认配置的 useFetch 实例
- 支持 baseUrl 配置
- 支持默认 headers
- 支持生命周期钩子组合 (chain/overwrite)

**API**:

```typescript
const useMyFetch = createFetch({
  baseUrl: 'https://api.example.com',
  options: {
    headers: {
      Authorization: 'Bearer token',
    },
  },
})

// 使用
const { data } = useMyFetch('/users')
```

### 4. 类型定义

**文件**: `packages/core/fetch/types.ts`

完整的 TypeScript 类型定义,包括:

- `UseFetchOptions` - 请求配置选项
- `UseFetchReturn` - 返回值类型
- `CreateFetchOptions` - 工厂函数配置
- `BeforeFetchContext` - 请求前上下文
- `AfterFetchContext` - 请求后上下文
- `OnFetchErrorContext` - 错误上下文
- `InternalConfig` - 内部配置
- `DataType` - 响应数据类型
- `HttpMethod` - HTTP 方法
- `Combination` - 钩子组合方式

### 5. 工具函数

**文件**: `packages/core/fetch/utils.ts`

实用工具函数:

- `joinPaths` - 路径拼接
- `addQueryParams` - 添加查询参数
- `isAbsoluteURL` - 判断绝对 URL
- `getValue` - 获取值 (支持 Stream/Observable/函数)
- `headersToObject` - Headers 转对象
- `combineCallbacks` - 组合回调函数
- `createEventHook` - 创建事件钩子

## 与 pipel-vue 的对应关系

| pipel-vue          | pipel-react           | 说明       |
| ------------------ | --------------------- | ---------- |
| `ref`, `computed`  | `useState`, `useMemo` | 响应式状态 |
| `watch`            | `useEffect`           | 副作用监听 |
| `onScopeDispose`   | `useEffect` cleanup   | 清理函数   |
| `toValue`, `isRef` | 直接值/函数调用       | 值获取     |
| `MaybeRefOrGetter` | 直接值/函数           | 类型简化   |
| Vue 插件系统       | React Hooks           | 集成方式   |

## 主要差异

1. **响应式系统**: Vue 使用 ref/reactive,React 使用 useState
2. **生命周期**: Vue 使用 onScopeDispose,React 使用 useEffect cleanup
3. **计算属性**: Vue 使用 computed,React 使用 useMemo
4. **监听器**: Vue 使用 watch,React 使用 useEffect
5. **类型系统**: React 版本简化了类型,移除了 Vue 特定的类型

## 测试

创建了基础测试文件:

- `packages/core/usePipel/test/usePipel.test.tsx`
- `packages/core/useFetch/test/useFetch.test.tsx`

## 使用示例

### usePipel 示例

```typescript
import { usePipel } from 'pipel-react'

function Counter() {
  const [count, count$] = usePipel(0)

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => count$.next(count + 1)}>
        Increment
      </button>
    </div>
  )
}
```

### useFetch 示例

```typescript
import { useFetch } from 'pipel-react'

function UserProfile({ userId }) {
  const { data, loading, error } = useFetch<User>(
    `/api/users/${userId}`,
    { immediate: true }
  )

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>
      <h1>{data?.name}</h1>
      <p>{data?.email}</p>
    </div>
  )
}
```

### 高级用法

```typescript
import { useFetch, $ } from 'pipel-react'

function SearchUsers() {
  const [query, query$] = usePipel('')

  const { data, loading } = useFetch<User[]>(
    query$.pipe(
      debounce(300),
      map(q => `/api/users?q=${q}`)
    ),
    {
      refetch: true,
      immediate: false
    }
  )

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

## 下一步

1. 运行测试验证实现
2. 更新文档
3. 在 demo 应用中测试实际使用
4. 根据测试结果进行优化

## 依赖

- `react`: ^18.0.0
- `pipeljs`: ^0.3.37
- `lodash-es`: ^4.17.21

## 文件清单

新增/修改的文件:

- ✅ `packages/core/usePipel.ts` - 增强实现
- ✅ `packages/core/fetch/types.ts` - 完整类型定义
- ✅ `packages/core/fetch/utils.ts` - 工具函数
- ✅ `packages/core/fetch/useFetch.ts` - 完整实现
- ✅ `packages/core/fetch/createFetch.ts` - 工厂函数
- ✅ `packages/core/fetch/index.ts` - 导出文件
- ✅ `packages/core/usePipel/test/usePipel.test.tsx` - 测试
- ✅ `packages/core/useFetch/test/useFetch.test.tsx` - 测试
- ✅ `IMPLEMENTATION_SUMMARY.md` - 本文档
