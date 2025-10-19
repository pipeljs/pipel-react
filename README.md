# Pipel-React

React integration for [PipelJS](https://github.com/pipeljs/pipel) - Promise-like reactive stream programming.

## ✨ Features

- 🎯 **Simple API** - Promise-like syntax, zero learning curve
- 🔄 **Reactive** - Automatic state updates from streams
- ⚡ **Async Control** - Built-in debounce, throttle, retry, etc.
- 🛠️ **Rich Operators** - 20+ operators for stream manipulation
- 🎣 **React Hooks** - Complete Hooks API for React 18+
- 💾 **Persistence** - Easy localStorage integration
- 🎯 **TypeScript** - Full type inference support
- 🧪 **Well Tested** - Comprehensive test coverage

## 📦 Installation

```bash
npm install pipel-react pipeljs
# or
yarn add pipel-react pipeljs
# or
pnpm add pipel-react pipeljs
```

## 🚀 Quick Start

### Basic Counter

```tsx
import { usePipel } from 'pipel-react'

function Counter() {
  const [count, count$] = usePipel(0)

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => count$.next(count + 1)}>Increment</button>
    </div>
  )
}
```

### Search with Debounce

```tsx
import { usePipel, useObservable, debounce, filter } from 'pipel-react'

function SearchBox() {
  const [keyword, keyword$] = usePipel('')

  const debouncedKeyword = useObservable(
    keyword$.pipe(
      debounce(300),
      filter((k) => k.length > 2)
    )
  )

  return <input value={keyword} onChange={(e) => keyword$.next(e.target.value)} />
}
```

### HTTP Requests

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

## 📚 Core APIs

### Hooks

| Hook             | Description                                 |
| ---------------- | ------------------------------------------- |
| `usePipel`       | Convert Stream/Observable to React state    |
| `useStream`      | Create a stable Stream instance             |
| `useObservable`  | Subscribe to Observable and return value    |
| `to$`            | Convert React state to Stream               |
| `effect$`        | Create side effect stream                   |
| `useSyncState`   | Bidirectional sync between state and stream |
| `usePipelRender` | Stream-based component rendering            |
| `persistStream$` | Create persistent stream with localStorage  |

### HTTP

| API           | Description                                  |
| ------------- | -------------------------------------------- |
| `useFetch`    | HTTP request hook with auto state management |
| `createFetch` | Create custom fetch hook with config         |

### Operators

All operators from PipelJS are re-exported:

- **Transform**: `map`, `scan`, `reduce`
- **Filter**: `filter`, `distinctUntilChanged`, `take`, `skip`
- **Combine**: `merge`, `concat`, `promiseAll`, `promiseRace`
- **Time**: `debounce`, `throttle`, `delay`, `timeout`
- **Error**: `catchError`, `retry`
- **Utility**: `tap`, `share`, `startWith`, `endWith`

## 📖 Documentation

### Getting Started

- [Getting Started Guide](./docs/GETTING_STARTED.md) - Quick setup and installation
- [Project Overview](./docs/PROJECT_OVERVIEW.md) - Project structure and architecture

### API Documentation

- [API Reference](./docs/API_REFERENCE.md) - Complete API documentation
- [Quick Reference](./docs/QUICK_REFERENCE.md) - Cheat sheet for common patterns

### VitePress Docs

- Run `pnpm docs:dev` to start the interactive documentation
- Visit [Online Documentation](https://pipeljs.github.io/pipel-react/) for the full guide

## 📖 Examples

Check out the [examples](./examples) directory for more use cases:

- **Basic**
  - [Counter](./examples/basic/Counter.tsx)
  - [SearchBox](./examples/basic/SearchBox.tsx)
  - [TodoList](./examples/basic/TodoList.tsx)

- **Fetch**
  - [UserList](./examples/fetch/UserList.tsx)

- **Advanced**
  - [PersistCounter](./examples/advanced/PersistCounter.tsx)
  - [SyncStateExample](./examples/advanced/SyncStateExample.tsx)

## 🔧 API Reference

### usePipel

Convert Stream/Observable to React state with automatic subscription management.

```tsx
function usePipel<T>(initialValue: T): [T, Stream<T>]
function usePipel<T>(stream$: Stream<T>): [T | undefined, Stream<T>]
function usePipel<T>(observable$: Observable<T>): [T | undefined, Observable<T>]
```

**Example:**

```tsx
// Create new stream
const [count, count$] = usePipel(0)

// Use existing stream
const stream$ = new Stream(0)
const [value] = usePipel(stream$)
```

### useStream

Create a stable Stream instance that persists across re-renders.

```tsx
function useStream<T>(initialValue: T | PromiseLike<T>): Stream<T>
```

**Example:**

```tsx
const count$ = useStream(0)
const [count] = usePipel(count$)
```

### useObservable

Subscribe to Observable and return current value.

```tsx
function useObservable<T>(observable$: Observable<T>): T | undefined
function useObservable<T>(observable$: Observable<T>, defaultValue: T): T
```

**Example:**

```tsx
const doubled = useObservable(count$.pipe(map((x) => x * 2)))
```

### to$

Convert React state to Stream.

```tsx
function to$<T>(value: T): Stream<T>
```

**Example:**

```tsx
const [keyword, setKeyword] = useState('')
const keyword$ = to$(keyword)

const results = useObservable(
  keyword$.pipe(
    debounce(300),
    map((k) => fetchResults(k))
  )
)
```

### effect$

Create side effect stream.

```tsx
function effect$<T>(observable$: Observable<T>, callback: (value: T) => void | (() => void)): void
```

**Example:**

```tsx
effect$(count$, (value) => {
  console.log('Count changed:', value)
  localStorage.setItem('count', String(value))
})
```

### useSyncState

Bidirectional sync between React state and Stream.

```tsx
function useSyncState<T>(initialValue: T): [T, Dispatch<SetStateAction<T>>, Stream<T>]
```

**Example:**

```tsx
const [value, setValue, value$] = useSyncState(0)

// Both work and sync with each other
setValue(10)
value$.next(20)
```

### persistStream$

Create persistent stream with localStorage.

```tsx
function persistStream$<T>(initialValue: T, options: PersistOptions<T>): Stream<T>

interface PersistOptions<T> {
  key: string
  storage?: Storage
  serializer?: (value: T) => string
  deserializer?: (value: string) => T
}
```

**Example:**

```tsx
const theme$ = persistStream$('dark', {
  key: 'app-theme',
})
```

### useFetch

HTTP request hook with automatic state management.

```tsx
function useFetch<T>(url: string, options?: UseFetchOptions): UseFetchReturn<T>

interface UseFetchOptions extends RequestInit {
  immediate?: boolean
  timeout?: number
  retry?: number
  retryDelay?: number
  onSuccess?: (data: any) => void
  onError?: (error: Error) => void
}

interface UseFetchReturn<T> {
  data: T | null
  error: Error | null
  loading: boolean
  execute: (config?: RequestInit) => Promise<T>
  abort: () => void
  refetch: () => Promise<T>
}
```

**Example:**

```tsx
const { data, loading, error, refetch } = useFetch('/api/users', {
  immediate: true,
  retry: 3,
  timeout: 5000,
})
```

### createFetch

Create custom fetch hook with shared configuration.

```tsx
function createFetch(config?: CreateFetchOptions): typeof useFetch

interface CreateFetchOptions {
  baseURL?: string
  timeout?: number
  headers?: HeadersInit
  interceptors?: {
    request?: (config: RequestInit) => RequestInit | Promise<RequestInit>
    response?: (response: Response) => Response | Promise<Response>
    error?: (error: Error) => Error | Promise<Error>
  }
}
```

**Example:**

```tsx
const useAPI = createFetch({
  baseURL: 'https://api.example.com',
  headers: {
    Authorization: 'Bearer token',
  },
})

function App() {
  const { data } = useAPI('/users')
  return <div>{data}</div>
}
```

## 🆚 Comparison

### vs RxJS

| Feature            | Pipel-React | RxJS            |
| ------------------ | ----------- | --------------- |
| Learning Curve     | ⭐⭐ Low    | ⭐⭐⭐⭐⭐ High |
| Promise Compatible | ✅ Yes      | ❌ No           |
| React Integration  | ✅ Built-in | ⚠️ Manual       |
| Bundle Size        | 📦 Small    | 📦 Large        |

### vs VueUse

| Feature            | Pipel-React | VueUse  |
| ------------------ | ----------- | ------- |
| Framework          | React       | Vue     |
| Stream Programming | ✅ Yes      | ❌ No   |
| Composability      | ✅ High     | ✅ High |

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](../CONTRIBUTING.md) for details.

## 📄 License

MIT © PipelJS Team

## 🔗 Links

- [PipelJS Core](https://github.com/pipeljs/pipel)
- [Online Documentation](https://pipeljs.github.io/pipel-react/)
- [API Reference](./docs/API_REFERENCE.md)
- [Examples](./examples)
- [Changelog](./CHANGELOG.md)
