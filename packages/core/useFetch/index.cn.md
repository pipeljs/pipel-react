# useFetch

HTTP 请求 Hook，提供自动状态管理。

## 签名

```typescript
function useFetch<T>(
  url: string,
  options?: UseFetchOptions
): UseFetchReturn<T>
```

## 基础用法

```tsx
import { useFetch } from 'pipel-react'

function UserProfile({ userId }) {
  const { data, loading, error, refetch } = useFetch(
    `/api/users/${userId}`,
    { immediate: true }
  )
  
  if (loading) return <div>加载中...</div>
  if (error) return <div>错误: {error.message}</div>
  
  return (
    <div>
      <h1>{data.name}</h1>
      <button onClick={refetch}>刷新</button>
    </div>
  )
}
```

## 手动执行

```tsx
function CreateUser() {
  const { data, loading, execute } = useFetch('/api/users', {
    method: 'POST',
    immediate: false
  })
  
  const handleSubmit = async (userData) => {
    try {
      await execute({
        body: JSON.stringify(userData)
      })
      alert('用户创建成功！')
    } catch (error) {
      alert('创建用户失败')
    }
  }
  
  return <form onSubmit={handleSubmit}>...</form>
}
```

## 重试机制

```tsx
function DataFetcher() {
  const { data, loading, error } = useFetch('/api/data', {
    immediate: true,
    retry: 3,
    retryDelay: 1000
  })
  
  return <div>{data}</div>
}
```

## 选项

```typescript
interface UseFetchOptions extends RequestInit {
  immediate?: boolean      // 挂载时自动执行
  timeout?: number         // 请求超时（毫秒）
  retry?: number          // 重试次数
  retryDelay?: number     // 重试延迟（毫秒）
  onSuccess?: (data: any) => void
  onError?: (error: Error) => void
}
```

## 返回值

```typescript
interface UseFetchReturn<T> {
  data: T | null           // 响应数据
  error: Error | null      // 错误对象
  loading: boolean         // 加载状态
  execute: (config?: RequestInit) => Promise<T>
  abort: () => void        // 取消请求
  refetch: () => Promise<T> // 重新获取
}
```

## 高级用法

### 自定义 Fetch 实例

```tsx
import { createFetch } from 'pipel-react'

const useAPI = createFetch({
  baseURL: 'https://api.example.com',
  headers: {
    'Authorization': 'Bearer token'
  }
})

function App() {
  const { data } = useAPI('/users', { immediate: true })
  return <div>{data}</div>
}
```

### 使用回调

```tsx
function DataLoader() {
  const { data } = useFetch('/api/data', {
    immediate: true,
    onSuccess: (data) => {
      console.log('成功:', data)
    },
    onError: (error) => {
      console.error('错误:', error)
    }
  })
  
  return <div>{data}</div>
}
```

## 特性

- ✅ 自动状态管理
- ✅ 请求取消
- ✅ 重试机制
- ✅ 超时控制
- ✅ 成功/失败回调
- ✅ TypeScript 支持

## 相关链接

- [createFetch](/cn/core/createFetch/index.cn) - 创建自定义 fetch
- [usePipel](/cn/core/usePipel/index.cn) - 核心 Hook
