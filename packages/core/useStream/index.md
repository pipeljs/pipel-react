# useStream

Create a stable Stream instance that persists across re-renders.

## Signature

```typescript
function useStream<T>(initialValue: T): Stream<T>
function useStream<T>(initialValue: PromiseLike<T>): Stream<T>
```

## Parameters

| Parameter      | Type                  | Description                                             |
| -------------- | --------------------- | ------------------------------------------------------- |
| `initialValue` | `T \| PromiseLike<T>` | Initial value or Promise that resolves to initial value |

## Returns

Returns a stable `Stream<T>` instance that persists across component re-renders.

## Basic Usage

### Create Stream with Initial Value

```tsx
import { useStream } from 'pipel-react'

function Counter() {
  const count$ = useStream(0)
  const [count, setCount] = useState(0)

  useEffect(() => {
    const child = count$.then((value) => setCount(value))
    return () => child.unsubscribe()
  }, [count$])

  return <button onClick={() => count$.next(count + 1)}>Count: {count}</button>
}
```

### Create Stream with Promise

```tsx
import { useStream } from 'pipel-react'

function AsyncData() {
  const data$ = useStream(fetch('/api/data').then((res) => res.json()))

  const [data, setData] = useState(null)

  useEffect(() => {
    const child = data$.then((value) => setData(value))
    return () => child.unsubscribe()
  }, [data$])

  return <div>{data?.name}</div>
}
```

## Advanced Usage

### Share Stream Between Components

```tsx
// Create stream outside component
const globalCount$ = new Stream(0)

function ComponentA() {
  const count$ = useStream(globalCount$)
  const [count, setCount] = useState(0)

  useEffect(() => {
    const child = count$.then(setCount)
    return () => child.unsubscribe()
  }, [count$])

  return <div>Count in A: {count}</div>
}

function ComponentB() {
  const count$ = useStream(globalCount$)

  return <button onClick={() => count$.next(count$.value + 1)}>Increment</button>
}
```

### Combine with Operators

```tsx
import { useStream } from 'pipel-react'
import { map, filter } from 'pipeljs'

function Example() {
  const value$ = useStream(0)

  const doubled$ = value$.pipe(
    filter((x) => x > 0),
    map((x) => x * 2)
  )

  return (
    <div>
      <button onClick={() => value$.next(value$.value + 1)}>Increment</button>
    </div>
  )
}
```

## Features

- ✅ Stable reference across re-renders
- ✅ Supports Promise as initial value
- ✅ Can be shared between components
- ✅ Works with all Stream operators
- ✅ Automatic cleanup on unmount

## Notes

1. The Stream instance reference remains stable across re-renders
2. When using Promise as initial value, the Stream will emit the resolved value
3. The Stream is not automatically cleaned up - you need to manage subscriptions
4. For automatic subscription management, use [usePipel](/core/usePipel/) instead

## Related

- [usePipel](/core/usePipel/) - Stream with automatic state sync
- [useObservable](/core/useObservable/) - Subscribe to Observable
- [useSyncState](/core/useSyncState/) - Bidirectional state sync
