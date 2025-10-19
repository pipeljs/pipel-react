# Quick Start

## Installation

::: code-group

```bash [npm]
npm install pipel-react pipeljs
```

```bash [yarn]
yarn add pipel-react pipeljs
```

```bash [pnpm]
pnpm add pipel-react pipeljs
```

:::

## Basic Usage

### 1. Counter Example

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

### 2. Search with Debounce

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

  return (
    <input
      value={keyword}
      onChange={(e) => keyword$.next(e.target.value)}
      placeholder="Type to search..."
    />
  )
}
```

### 3. HTTP Requests

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

## Core Concepts

### Stream and State

`usePipel` returns a tuple:

- First element: current value (React state)
- Second element: Stream object (for updates)

```tsx
const [value, stream$] = usePipel(initialValue)

// Update via stream
stream$.next(newValue)

// Subscribe to changes
stream$.then((value) => console.log(value))
```

### Operators

Transform streams using operators:

```tsx
import { map, filter, debounce } from 'pipel-react'

const transformed = useObservable(
  stream$.pipe(
    debounce(300),
    filter((x) => x > 0),
    map((x) => x * 2)
  )
)
```

### Auto Cleanup

All subscriptions are automatically cleaned up on component unmount:

```tsx
function Component() {
  const [value] = usePipel(stream$)
  // No need to manually unsubscribe!
}
```

## Next Steps

- [Reactive Programming](/guide/reactive) - Learn core concepts
- [API Reference](/core/usePipel/) - Explore all APIs
- [Examples](https://github.com/pipeljs/pipel-react/tree/main/examples) - See more examples
