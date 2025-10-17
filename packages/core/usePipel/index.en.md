# usePipel

Convert Stream/Observable to React state with automatic subscription management.

## Signature

```typescript
function usePipel<T>(initialValue: T): [T, Stream<T>]
function usePipel<T>(stream$: Stream<T>): [T | undefined, Stream<T>]
function usePipel<T>(observable$: Observable<T>): [T | undefined, Observable<T>]
```

## Basic Usage

### Create New Stream

```tsx
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

### Use Existing Stream

```tsx
import { usePipel, useStream } from 'pipel-react'

function App() {
  const count$ = useStream(0)
  const [count] = usePipel(count$)
  
  return <div>Count: {count}</div>
}
```

## With Operators

```tsx
import { usePipel, useObservable, map, filter } from 'pipel-react'

function Example() {
  const [value, value$] = usePipel(0)
  
  const doubled = useObservable(
    value$.pipe(
      filter(x => x > 0),
      map(x => x * 2)
    )
  )
  
  return (
    <div>
      <p>Value: {value}</p>
      <p>Doubled: {doubled}</p>
      <button onClick={() => value$.next(value + 1)}>
        Increment
      </button>
    </div>
  )
}
```

## Promise Initial Value

```tsx
function AsyncExample() {
  const [data, data$] = usePipel(
    fetch('/api/data').then(res => res.json())
  )
  
  if (!data) return <div>Loading...</div>
  
  return <div>{data.name}</div>
}
```

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `initialValue` | `T \| PromiseLike<T>` | Initial value or Promise |
| `stream$` | `Stream<T>` | Existing Stream instance |
| `observable$` | `Observable<T>` | Existing Observable instance |

## Returns

Returns a tuple `[value, stream$]`:

| Index | Type | Description |
|-------|------|-------------|
| `0` | `T \| undefined` | Current value (React state) |
| `1` | `Stream<T> \| Observable<T>` | Stream/Observable instance |

## Features

- ✅ Automatic subscription management
- ✅ Auto cleanup on unmount
- ✅ Full TypeScript support
- ✅ Promise support
- ✅ Works with operators

## Notes

1. The Stream instance is stable across re-renders
2. Subscriptions are automatically cleaned up on unmount
3. When using Promise as initial value, the first value will be `undefined`
4. The returned Stream can be shared across components

## See Also

- [useStream](/core/useStream/index.en) - Create stable Stream
- [useObservable](/core/useObservable/index.en) - Subscribe to Observable
- [to$](/core/to$/index.en) - Convert state to Stream
