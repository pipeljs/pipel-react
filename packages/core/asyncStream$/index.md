# asyncStream$

Create an async stream with automatic loading, error, and data state management.

## Signature

```typescript
function asyncStream$<T, Args extends any[] = []>(
  fetcher: (...args: Args) => Promise<T>
): {
  data$: Stream<T | undefined>
  loading$: Stream<boolean>
  error$: Stream<Error | undefined>
  execute: (...args: Args) => Promise<void>
}
```

## Parameters

| Parameter | Type                            | Description                           |
| --------- | ------------------------------- | ------------------------------------- |
| `fetcher` | `(...args: Args) => Promise<T>` | Async function that returns a Promise |

## Returns

Returns an object with four properties:

| Property   | Type                               | Description                        |
| ---------- | ---------------------------------- | ---------------------------------- |
| `data$`    | `Stream<T \| undefined>`           | Stream containing the fetched data |
| `loading$` | `Stream<boolean>`                  | Stream indicating loading state    |
| `error$`   | `Stream<Error \| undefined>`       | Stream containing any errors       |
| `execute`  | `(...args: Args) => Promise<void>` | Function to trigger the fetch      |

## Basic Usage

### Simple Async Operation

```tsx
import { asyncStream$ } from 'pipel-react'
import { usePipel } from 'pipel-react'

function UserProfile({ userId }) {
  const fetchUser = async (id: string) => {
    const res = await fetch(`/api/users/${id}`)
    return res.json()
  }

  const { data$, loading$, error$, execute } = asyncStream$(fetchUser)

  const [user] = usePipel(data$)
  const [loading] = usePipel(loading$)
  const [error] = usePipel(error$)

  useEffect(() => {
    execute(userId)
  }, [userId])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>
  if (!user) return null

  return <div>{user.name}</div>
}
```

### Manual Trigger

```tsx
import { asyncStream$ } from 'pipel-react'

function SearchBox() {
  const searchAPI = async (keyword: string) => {
    const res = await fetch(`/api/search?q=${keyword}`)
    return res.json()
  }

  const { data$, loading$, execute } = asyncStream$(searchAPI)

  const [results] = usePipel(data$)
  const [loading] = usePipel(loading$)

  const handleSearch = (keyword: string) => {
    if (keyword.length > 2) {
      execute(keyword)
    }
  }

  return (
    <div>
      <input onChange={(e) => handleSearch(e.target.value)} />
      {loading && <Spinner />}
      <Results data={results} />
    </div>
  )
}
```

## Advanced Usage

### With Debounce

```tsx
import { asyncStream$ } from 'pipel-react'
import { debounce } from 'pipeljs'

function LiveSearch() {
  const search = async (q: string) => {
    const res = await fetch(`/api/search?q=${q}`)
    return res.json()
  }

  const { data$, loading$, execute } = asyncStream$(search)
  const [keyword, keyword$] = usePipel('')

  useEffect(() => {
    const child = keyword$.pipe(debounce(300)).then((q) => {
      if (q.length > 2) execute(q)
    })

    return () => child.unsubscribe()
  }, [])

  const [results] = usePipel(data$)
  const [loading] = usePipel(loading$)

  return (
    <div>
      <input onChange={(e) => keyword$.next(e.target.value)} />
      {loading && <Spinner />}
      <Results data={results} />
    </div>
  )
}
```

### Error Handling

```tsx
import { asyncStream$ } from 'pipel-react'

function DataFetcher() {
  const fetchData = async () => {
    const res = await fetch('/api/data')
    if (!res.ok) throw new Error('Failed to fetch')
    return res.json()
  }

  const { data$, loading$, error$, execute } = asyncStream$(fetchData)

  const [data] = usePipel(data$)
  const [loading] = usePipel(loading$)
  const [error] = usePipel(error$)

  useEffect(() => {
    execute()
  }, [])

  if (error) {
    return (
      <div>
        <p>Error: {error.message}</p>
        <button onClick={() => execute()}>Retry</button>
      </div>
    )
  }

  if (loading) return <Spinner />

  return <DataDisplay data={data} />
}
```

### Multiple Parameters

```tsx
import { asyncStream$ } from 'pipel-react'

function UserPosts() {
  const fetchPosts = async (userId: string, page: number) => {
    const res = await fetch(`/api/users/${userId}/posts?page=${page}`)
    return res.json()
  }

  const { data$, loading$, execute } = asyncStream$(fetchPosts)

  const [posts] = usePipel(data$)
  const [loading] = usePipel(loading$)
  const [page, setPage] = useState(1)

  useEffect(() => {
    execute('user-123', page)
  }, [page])

  return (
    <div>
      {loading && <Spinner />}
      <PostList posts={posts} />
      <button onClick={() => setPage((p) => p + 1)}>Load More</button>
    </div>
  )
}
```

## Hooks Integration

### useAsyncStream$

For easier integration with React components:

```tsx
import { useAsyncStream$ } from 'pipel-react'

function Component() {
  const { data, loading, error, execute } = useAsyncStream$(async () => {
    const res = await fetch('/api/data')
    return res.json()
  })

  useEffect(() => {
    execute()
  }, [])

  if (loading) return <Spinner />
  if (error) return <Error error={error} />

  return <Data data={data} />
}
```

### useAsyncStreamAuto$

Auto-execute on mount:

```tsx
import { useAsyncStreamAuto$ } from 'pipel-react'

function Component() {
  const { data, loading, error } = useAsyncStreamAuto$(async () => {
    const res = await fetch('/api/data')
    return res.json()
  })

  if (loading) return <Spinner />
  if (error) return <Error error={error} />

  return <Data data={data} />
}
```

## Features

- ✅ Automatic loading state management
- ✅ Automatic error handling
- ✅ Type-safe with TypeScript
- ✅ Supports multiple parameters
- ✅ Manual or auto execution
- ✅ Works with Stream operators
- ✅ Cancellation support

## Notes

1. The `execute` function can be called multiple times
2. Each execution updates the loading, data, and error streams
3. Previous data is preserved until new data arrives
4. Errors are caught automatically and stored in `error$`
5. All streams are reactive and can be subscribed to independently

## Related

- [useFetch](/core/useFetch/) - Higher-level HTTP fetching hook
- [useAsyncStream$](/core/asyncStream/#useasyncstream) - Hook version
- [useAsyncStreamAuto$](/core/asyncStream/#useasyncstreamauto) - Auto-execute version
