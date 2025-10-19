# createFetch

创建一个可复用的 fetch 配置实例，用于统一管理 API 请求配置。

## 签名

```typescript
function createFetch(config?: FetchConfig): UseFetchFunction
```

## 参数

| 参数     | 类型          | 说明           |
| -------- | ------------- | -------------- |
| `config` | `FetchConfig` | 可选的全局配置 |

### FetchConfig

```typescript
interface FetchConfig {
  baseURL?: string
  headers?: Record<string, string>
  timeout?: number
  onRequest?: (config: RequestConfig) => RequestConfig | Promise<RequestConfig>
  onResponse?: (response: Response) => Response | Promise<Response>
  onError?: (error: Error) => void
}
```

## 返回值

返回一个配置好的 `useFetch` 函数，可以在组件中使用。

## 基础用法

### 创建全局 fetch 实例

```tsx
import { createFetch } from 'pipel-react'

// 创建全局配置
const useFetch = createFetch({
  baseURL: 'https://api.example.com',
  headers: {
    'Content-Type': 'application/json',
  },
})

function UserProfile() {
  const { data, loading, error } = useFetch('/user/profile', {
    immediate: true,
  })

  if (loading) return <div>加载中...</div>
  if (error) return <div>错误: {error.message}</div>

  return <div>用户: {data?.name}</div>
}
```

### 配置请求拦截器

```tsx
import { createFetch } from 'pipel-react'

const useFetch = createFetch({
  baseURL: 'https://api.example.com',
  onRequest: async (config) => {
    // 添加认证 token
    const token = await getAuthToken()
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    }
    return config
  },
})
```

### 配置响应拦截器

```tsx
import { createFetch } from 'pipel-react'

const useFetch = createFetch({
  baseURL: 'https://api.example.com',
  onResponse: async (response) => {
    // 统一处理响应
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    return response
  },
  onError: (error) => {
    // 统一错误处理
    console.error('请求失败:', error)
    // 可以在这里显示全局错误提示
  },
})
```

## 高级用法

### 多个 API 实例

```tsx
import { createFetch } from 'pipel-react'

// API v1
export const useFetchV1 = createFetch({
  baseURL: 'https://api.example.com/v1',
  headers: {
    'API-Version': '1.0',
  },
})

// API v2
export const useFetchV2 = createFetch({
  baseURL: 'https://api.example.com/v2',
  headers: {
    'API-Version': '2.0',
  },
})

function App() {
  const { data: dataV1 } = useFetchV1('/users')
  const { data: dataV2 } = useFetchV2('/users')

  return (
    <div>
      <h2>V1 用户</h2>
      <UserList data={dataV1} />

      <h2>V2 用户</h2>
      <UserList data={dataV2} />
    </div>
  )
}
```

### 请求超时配置

```tsx
import { createFetch } from 'pipel-react'

const useFetch = createFetch({
  baseURL: 'https://api.example.com',
  timeout: 5000, // 5秒超时
  onRequest: (config) => {
    // 为每个请求添加超时控制
    const controller = new AbortController()
    setTimeout(() => controller.abort(), config.timeout || 5000)

    return {
      ...config,
      signal: controller.signal,
    }
  },
})
```

### 请求重试

```tsx
import { createFetch } from 'pipel-react'

const useFetch = createFetch({
  baseURL: 'https://api.example.com',
  onError: async (error, retry) => {
    // 网络错误时自动重试
    if (error.message.includes('network')) {
      console.log('网络错误，3秒后重试...')
      await new Promise((resolve) => setTimeout(resolve, 3000))
      retry?.()
    }
  },
})
```

### 请求/响应日志

```tsx
import { createFetch } from 'pipel-react'

const useFetch = createFetch({
  baseURL: 'https://api.example.com',
  onRequest: (config) => {
    console.log('📤 请求:', config.url, config)
    return config
  },
  onResponse: (response) => {
    console.log('📥 响应:', response.url, response.status)
    return response
  },
})
```

## 特性

- ✅ 全局配置管理
- ✅ 请求/响应拦截器
- ✅ 多实例支持
- ✅ 超时控制
- ✅ 错误处理
- ✅ TypeScript 类型安全

## 注意事项

1. `createFetch` 应该在组件外部调用，创建全局实例
2. 拦截器按照配置顺序执行
3. `onError` 不会阻止错误传播到组件
4. 每个实例的配置是独立的
5. 拦截器可以是异步函数

## 最佳实践

### 统一的 API 配置

```tsx
// api/config.ts
import { createFetch } from 'pipel-react'

export const useFetch = createFetch({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  onRequest: async (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      }
    }
    return config
  },
  onResponse: async (response) => {
    if (response.status === 401) {
      // 未授权，跳转到登录页
      window.location.href = '/login'
    }
    return response
  },
  onError: (error) => {
    // 显示错误提示
    toast.error(error.message)
  },
})
```

### 使用配置好的实例

```tsx
// components/UserList.tsx
import { useFetch } from '@/api/config'

function UserList() {
  const { data, loading, error, refetch } = useFetch('/users', {
    immediate: true,
  })

  if (loading) return <Loading />
  if (error) return <Error error={error} />

  return (
    <div>
      <button onClick={refetch}>刷新</button>
      <List data={data} />
    </div>
  )
}
```

## 相关链接

- [useFetch](/cn/core/useFetch/index.cn) - 使用 fetch hook
- [asyncStream$](/cn/core/asyncStream$/index.cn) - 异步数据流
