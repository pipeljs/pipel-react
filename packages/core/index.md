# API Reference

Pipel-React provides a comprehensive set of React Hooks and utilities for reactive stream programming.

## Core Hooks

### State Management

- [usePipel](/core/usePipel/) - Convert Stream/Observable to React state
- [useStream](/core/useStream/) - Create a stable Stream instance
- [useObservable](/core/useObservable/) - Subscribe to Observable and get current value
- [useSyncState](/core/useSyncState/) - Bidirectional sync between state and Stream

### Side Effects

- [effect$](/core/effect$/) - Execute side effects when Stream emits
- [to$](/core/to$/) - Convert state setter to Stream

### Rendering

- [usePipelRender](/core/usePipelRender/) - Render component when Stream emits

## Stream Factories

- [asyncStream$](/core/asyncStream$/) - Create async Stream with loading/error states
- [persistStream$](/core/persistStream$/) - Create Stream with localStorage persistence
- [computedStream$](/core/computedStream$/) - Create computed Stream from dependencies
- [batch$](/core/batch$/) - Batch multiple Streams into one
- [fromEvent](/core/fromEvent/) - Create Stream from DOM events

## HTTP Utilities

- [useFetch](/core/useFetch/) - Declarative data fetching with automatic state management
- [createFetch](/core/createFetch/) - Create reusable fetch configurations

## Debugging

- [debug](/core/debug/) - Debug utilities for Stream inspection

## Quick Examples

### Basic State Management

```tsx
import { usePipel } from 'pipel-react'

function Counter() {
  const [count, count$] = usePipel(0)

  return <button onClick={() => count$.next(count + 1)}>Count: {count}</button>
}
```

### Data Fetching

```tsx
import { useFetch } from 'pipel-react'

function UserProfile({ userId }) {
  const { data, loading, error } = useFetch(`/api/users/${userId}`, {
    immediate: true,
  })

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return <div>Hello, {data.name}!</div>
}
```

### Stream Composition

```tsx
import { usePipel, useObservable } from 'pipel-react'

function SearchBox() {
  const [keyword, keyword$] = usePipel('')

  const results = useObservable(
    keyword$.pipe(
      debounce(300),
      filter((k) => k.length > 2),
      map((k) => fetchResults(k))
    )
  )

  return (
    <div>
      <input value={keyword} onChange={(e) => keyword$.next(e.target.value)} />
      <Results data={results} />
    </div>
  )
}
```

## Type Definitions

All APIs are fully typed with TypeScript. Import types from the main package:

```typescript
import type { Stream, Observable, FetchOptions, FetchResult } from 'pipel-react'
```
