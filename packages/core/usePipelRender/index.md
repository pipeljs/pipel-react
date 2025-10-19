# usePipelRender

Optimize rendering by controlling when components re-render based on Stream changes.

## Signature

```typescript
function usePipelRender<T>(
  stream$: Stream<T>,
  shouldRender?: (prev: T, next: T) => boolean
): T | undefined
```

## Parameters

| Parameter      | Type                            | Description                                                  |
| -------------- | ------------------------------- | ------------------------------------------------------------ |
| `stream$`      | `Stream<T>`                     | Stream to subscribe to                                       |
| `shouldRender` | `(prev: T, next: T) => boolean` | Optional function to determine if component should re-render |

## Returns

Returns the current value of the Stream, or `undefined` if no value has been emitted yet.

## Basic Usage

### Simple Rendering Control

```tsx
import { usePipelRender } from 'pipel-react'
import { useStream } from 'pipel-react'

function Counter() {
  const count$ = useStream(0)
  const count = usePipelRender(count$)

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => count$.next(count + 1)}>Increment</button>
    </div>
  )
}
```

### Conditional Rendering

```tsx
import { usePipelRender } from 'pipel-react'

function EvenCounter() {
  const count$ = useStream(0)

  // Only re-render when count is even
  const count = usePipelRender(count$, (prev, next) => next % 2 === 0)

  return (
    <div>
      <p>Even Count: {count}</p>
      <button onClick={() => count$.next(count + 1)}>Increment</button>
    </div>
  )
}
```

## Advanced Usage

### Shallow Comparison

```tsx
import { usePipelRender } from 'pipel-react'

interface User {
  id: string
  name: string
  email: string
}

function UserProfile() {
  const user$ = useStream<User>({
    id: '1',
    name: 'John',
    email: 'john@example.com',
  })

  // Only re-render if name or email changes (ignore id)
  const user = usePipelRender(
    user$,
    (prev, next) => prev.name !== next.name || prev.email !== next.email
  )

  return (
    <div>
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </div>
  )
}
```

### Threshold-Based Rendering

```tsx
import { usePipelRender } from 'pipel-react'

function ProgressBar() {
  const progress$ = useStream(0)

  // Only re-render when progress changes by at least 5%
  const progress = usePipelRender(progress$, (prev, next) => Math.abs(next - prev) >= 5)

  return (
    <div>
      <div
        style={{
          width: `${progress}%`,
          height: 20,
          background: 'blue',
        }}
      />
      <button onClick={() => progress$.next(progress + 1)}>+1%</button>
    </div>
  )
}
```

### Deep Comparison

```tsx
import { usePipelRender } from 'pipel-react'
import { isEqual } from 'lodash-es'

function ComplexState() {
  const state$ = useStream({
    user: { name: 'John', settings: { theme: 'light' } },
    data: [1, 2, 3],
  })

  // Deep equality check
  const state = usePipelRender(state$, (prev, next) => !isEqual(prev, next))

  return <div>{JSON.stringify(state)}</div>
}
```

### Performance Optimization

```tsx
import { usePipelRender } from 'pipel-react'

interface ListItem {
  id: string
  value: number
}

function ExpensiveList() {
  const items$ = useStream<ListItem[]>([])

  // Only re-render if list length changes or any value changes
  const items = usePipelRender(items$, (prev, next) => {
    if (prev.length !== next.length) return true

    return prev.some((item, i) => item.value !== next[i].value)
  })

  return (
    <ul>
      {items.map((item) => (
        <ExpensiveListItem key={item.id} item={item} />
      ))}
    </ul>
  )
}
```

### Debounced Rendering

```tsx
import { usePipelRender } from 'pipel-react'
import { useRef } from 'react'

function DebouncedInput() {
  const value$ = useStream('')
  const lastRenderTime = useRef(Date.now())

  // Only re-render if 300ms have passed since last render
  const value = usePipelRender(value$, (prev, next) => {
    const now = Date.now()
    if (now - lastRenderTime.current > 300) {
      lastRenderTime.current = now
      return true
    }
    return false
  })

  return (
    <div>
      <input onChange={(e) => value$.next(e.target.value)} />
      <p>Rendered value: {value}</p>
    </div>
  )
}
```

### Selective Field Updates

```tsx
import { usePipelRender } from 'pipel-react'

interface FormData {
  name: string
  email: string
  phone: string
  address: string
}

function FormPreview() {
  const form$ = useStream<FormData>({
    name: '',
    email: '',
    phone: '',
    address: '',
  })

  // Only re-render when name or email changes
  const form = usePipelRender(
    form$,
    (prev, next) => prev.name !== next.name || prev.email !== next.email
  )

  return (
    <div>
      <h3>Preview (Name & Email only)</h3>
      <p>Name: {form.name}</p>
      <p>Email: {form.email}</p>
    </div>
  )
}
```

## Features

- ✅ Fine-grained rendering control
- ✅ Custom comparison logic
- ✅ Performance optimization
- ✅ Type-safe with TypeScript
- ✅ Automatic subscription management
- ✅ Works with any Stream
- ✅ No additional dependencies

## Comparison with usePipel

| Feature           | usePipelRender           | usePipel    |
| ----------------- | ------------------------ | ----------- |
| Rendering Control | Custom                   | Always      |
| Use Case          | Performance optimization | General use |
| Complexity        | Higher                   | Lower       |
| Flexibility       | High                     | Standard    |

## Notes

1. The `shouldRender` function receives the previous and next values
2. Return `true` to trigger a re-render, `false` to skip
3. If `shouldRender` is not provided, behaves like `usePipel`
4. The component still subscribes to the Stream even when not rendering
5. Use for performance-critical components with frequent updates

## Best Practices

### Memoize Comparison Function

```tsx
import { useCallback } from 'react'

function Component() {
  const shouldRender = useCallback((prev: Data, next: Data) => prev.id !== next.id, [])

  const data = usePipelRender(data$, shouldRender)

  return <div>...</div>
}
```

### Use for Expensive Renders

```tsx
// ✅ Good - expensive component
function ExpensiveChart() {
  const data = usePipelRender(data$, (prev, next) => prev.length !== next.length)

  return <ComplexChart data={data} />
}

// ❌ Bad - simple component
function SimpleText() {
  const text = usePipelRender(text$, (prev, next) => prev !== next)

  return <p>{text}</p>
}
```

### Combine with React.memo

```tsx
import { memo } from 'react'

const OptimizedComponent = memo(function Component() {
  const data = usePipelRender(data$, (prev, next) => prev.id !== next.id)

  return <ExpensiveRender data={data} />
})
```

## Performance Tips

1. **Use for high-frequency updates**: Best for Streams that emit frequently
2. **Keep comparison simple**: Complex comparisons can negate performance gains
3. **Profile first**: Measure before optimizing
4. **Consider alternatives**: Sometimes `React.memo` or `useMemo` is better

## Related

- [usePipel](/core/usePipel/) - Standard Stream to state hook
- [useObservable](/core/useObservable/) - Subscribe to Observable
- [React.memo](https://react.dev/reference/react/memo) - Component memoization
