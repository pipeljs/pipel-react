# useFetch

HTTP request Hook with automatic state management.

## Signature

```typescript
function useFetch<T>(url: string, options?: UseFetchOptions): UseFetchReturn<T>
```

## Basic Usage

```tsx
import { useFetch } from 'pipel-react'

function UserProfile({ userId }) {
  const { data, loading, error, refetch } = useFetch(`/api/users/${userId}`, { immediate: true })

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div>
      <h1>{data.name}</h1>
      <button onClick={refetch}>Refresh</button>
    </div>
  )
}
```

## Manual Execution

```tsx
function CreateUser() {
  const { data, loading, execute } = useFetch('/api/users', {
    method: 'POST',
    immediate: false,
  })

  const handleSubmit = async (userData) => {
    try {
      await execute({
        body: JSON.stringify(userData),
      })
      alert('User created!')
    } catch (error) {
      alert('Failed to create user')
    }
  }

  return <form onSubmit={handleSubmit}>...</form>
}
```

## With Retry

```tsx
function DataFetcher() {
  const { data, loading, error } = useFetch('/api/data', {
    immediate: true,
    retry: 3,
    retryDelay: 1000,
  })

  return <div>{data}</div>
}
```

## Options

```typescript
interface UseFetchOptions extends RequestInit {
  immediate?: boolean // Auto execute on mount
  timeout?: number // Request timeout (ms)
  retry?: number // Retry count
  retryDelay?: number // Retry delay (ms)
  onSuccess?: (data: any) => void
  onError?: (error: Error) => void
}
```

## Return Value

```typescript
interface UseFetchReturn<T> {
  data: T | null // Response data
  error: Error | null // Error object
  loading: boolean // Loading state
  execute: (config?: RequestInit) => Promise<T>
  abort: () => void // Abort request
  refetch: () => Promise<T> // Refetch
}
```

## Advanced Usage

### Custom Fetch Instance

```tsx
import { createFetch } from 'pipel-react'

const useAPI = createFetch({
  baseURL: 'https://api.example.com',
  headers: {
    Authorization: 'Bearer token',
  },
})

function App() {
  const { data } = useAPI('/users', { immediate: true })
  return <div>{data}</div>
}
```

### With Callbacks

```tsx
function DataLoader() {
  const { data } = useFetch('/api/data', {
    immediate: true,
    onSuccess: (data) => {
      console.log('Success:', data)
    },
    onError: (error) => {
      console.error('Error:', error)
    },
  })

  return <div>{data}</div>
}
```

## Features

- ✅ Automatic state management
- ✅ Request cancellation
- ✅ Retry mechanism
- ✅ Timeout control
- ✅ Success/Error callbacks
- ✅ TypeScript support

## See Also

- [createFetch](/core/createFetch/index.en) - Create custom fetch
- [usePipel](/core/usePipel/index.en) - Core Hook
