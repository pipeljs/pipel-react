# createFetch

Create a reusable fetch configuration instance for unified API request management.

## Signature

```typescript
function createFetch(config?: FetchConfig): UseFetchFunction
```

## Parameters

| Parameter | Type          | Description                   |
| --------- | ------------- | ----------------------------- |
| `config`  | `FetchConfig` | Optional global configuration |

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

## Returns

Returns a configured `useFetch` function that can be used in components.

## Basic Usage

### Create Global Fetch Instance

```tsx
import { createFetch } from 'pipel-react'

// Create global configuration
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

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return <div>User: {data?.name}</div>
}
```

### Configure Request Interceptor

```tsx
import { createFetch } from 'pipel-react'

const useFetch = createFetch({
  baseURL: 'https://api.example.com',
  onRequest: async (config) => {
    // Add auth token
    const token = await getAuthToken()
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    }
    return config
  },
})
```

### Configure Response Interceptor

```tsx
import { createFetch } from 'pipel-react'

const useFetch = createFetch({
  baseURL: 'https://api.example.com',
  onResponse: async (response) => {
    // Unified response handling
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    return response
  },
  onError: (error) => {
    // Unified error handling
    console.error('Request failed:', error)
    // Show global error notification
  },
})
```

## Advanced Usage

### Multiple API Instances

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
      <h2>V1 Users</h2>
      <UserList data={dataV1} />

      <h2>V2 Users</h2>
      <UserList data={dataV2} />
    </div>
  )
}
```

### Request Timeout

```tsx
import { createFetch } from 'pipel-react'

const useFetch = createFetch({
  baseURL: 'https://api.example.com',
  timeout: 5000, // 5 second timeout
  onRequest: (config) => {
    // Add timeout control for each request
    const controller = new AbortController()
    setTimeout(() => controller.abort(), config.timeout || 5000)

    return {
      ...config,
      signal: controller.signal,
    }
  },
})
```

## Features

- ✅ Global configuration management
- ✅ Request/response interceptors
- ✅ Multiple instance support
- ✅ Timeout control
- ✅ Error handling
- ✅ TypeScript type safety

## Notes

1. `createFetch` should be called outside components to create global instances
2. Interceptors execute in configuration order
3. `onError` does not prevent error propagation to components
4. Each instance's configuration is independent
5. Interceptors can be async functions

## Related

- [useFetch](/core/useFetch/) - Use fetch hook
- [asyncStream$](/core/asyncStream$/) - Async data streams
