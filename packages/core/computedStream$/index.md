# computedStream$

Create a computed stream that automatically updates based on dependencies.

## Signature

```typescript
function computedStream$<T, Deps extends Stream<any>[]>(
  compute: (...values: StreamValues<Deps>) => T,
  dependencies: Deps
): Stream<T>
```

## Parameters

| Parameter      | Type               | Description                |
| -------------- | ------------------ | -------------------------- |
| `compute`      | `(...values) => T` | Computation function       |
| `dependencies` | `Stream<any>[]`    | Array of dependent streams |

## Returns

Returns a `Stream<T>` that automatically recomputes when dependencies change.

## Basic Usage

### Simple Computation

```tsx
import { computedStream$ } from 'pipel-react'
import { useStream, usePipel } from 'pipel-react'

function Calculator() {
  const a$ = useStream(10)
  const b$ = useStream(20)

  const sum$ = computedStream$((a, b) => a + b, [a$, b$])

  const [sum] = usePipel(sum$)

  return <div>Sum: {sum}</div>
}
```

### Price Calculator

```tsx
import { computedStream$ } from 'pipel-react'

function PriceCalculator() {
  const price$ = useStream(100)
  const quantity$ = useStream(1)
  const tax$ = useStream(0.1)

  const total$ = computedStream$(
    (price, quantity, tax) => price * quantity * (1 + tax),
    [price$, quantity$, tax$]
  )

  const [total] = usePipel(total$)

  return (
    <div>
      <p>Total: ${total.toFixed(2)}</p>
    </div>
  )
}
```

## Advanced Usage

### Complex Computation

```tsx
import { computedStream$ } from 'pipel-react'

function Dashboard() {
  const users$ = useStream([])
  const posts$ = useStream([])

  const stats$ = computedStream$(
    (users, posts) => ({
      totalUsers: users.length,
      totalPosts: posts.length,
      avgPostsPerUser: users.length > 0 ? posts.length / users.length : 0,
    }),
    [users$, posts$]
  )

  const [stats] = usePipel(stats$)

  return (
    <div>
      <p>Users: {stats.totalUsers}</p>
      <p>Posts: {stats.totalPosts}</p>
      <p>Avg: {stats.avgPostsPerUser.toFixed(2)}</p>
    </div>
  )
}
```

### Filtered List

```tsx
import { computedStream$ } from 'pipel-react'

function FilteredList() {
  const items$ = useStream([
    { id: 1, name: 'Apple', category: 'fruit' },
    { id: 2, name: 'Carrot', category: 'vegetable' },
    { id: 3, name: 'Banana', category: 'fruit' },
  ])

  const filter$ = useStream('all')

  const filtered$ = computedStream$(
    (items, filter) => {
      if (filter === 'all') return items
      return items.filter((item) => item.category === filter)
    },
    [items$, filter$]
  )

  const [filtered] = usePipel(filtered$)

  return (
    <div>
      <select onChange={(e) => filter$.next(e.target.value)}>
        <option value="all">All</option>
        <option value="fruit">Fruits</option>
        <option value="vegetable">Vegetables</option>
      </select>
      <List items={filtered} />
    </div>
  )
}
```

## Features

- ✅ Automatic recomputation
- ✅ Multiple dependencies
- ✅ Type-safe computation
- ✅ Lazy evaluation
- ✅ Memoization
- ✅ TypeScript support

## Notes

1. Computation runs when any dependency changes
2. Result is cached until dependencies change
3. Computation function should be pure
4. Avoid side effects in computation
5. Dependencies are evaluated in order

## Related

- [usePipel](/core/usePipel/) - Stream state management
- [useStream](/core/useStream/) - Create stable stream
- [batch$](/core/batch$/) - Batch stream creation
