# useObservable

Subscribe to an Observable and return its current value as React state.

## Signature

```typescript
function useObservable<T>(observable$: Observable<T>, defaultValue?: T): T | undefined
```

## Parameters

| Parameter      | Type            | Description                                  |
| -------------- | --------------- | -------------------------------------------- |
| `observable$`  | `Observable<T>` | Observable to subscribe to                   |
| `defaultValue` | `T`             | Optional default value before first emission |

## Returns

Returns the current value from the Observable, or `defaultValue` if no value has been emitted yet.

## Basic Usage

### Subscribe to Observable

```tsx
import { useObservable, useStream } from 'pipel-react'

function Counter() {
  const count$ = useStream(0)
  const count = useObservable(count$, 0)

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => count$.next(count + 1)}>Increment</button>
    </div>
  )
}
```

### With Default Value

```tsx
import { useObservable } from 'pipel-react'

function UserName({ user$ }) {
  const user = useObservable(user$, { name: 'Guest' })

  return <div>Hello, {user.name}!</div>
}
```

## Advanced Usage

### With Stream Operators

```tsx
import { useObservable, useStream } from 'pipel-react'
import { map, filter, debounce } from 'pipeljs'

function SearchBox() {
  const keyword$ = useStream('')

  const results = useObservable(
    keyword$.pipe(
      debounce(300),
      filter((k) => k.length > 2),
      map((k) => fetchResults(k))
    ),
    []
  )

  return (
    <div>
      <input onChange={(e) => keyword$.next(e.target.value)} />
      <Results data={results} />
    </div>
  )
}
```

### Multiple Observables

```tsx
import { useObservable, useStream } from 'pipel-react'

function Dashboard() {
  const users$ = useStream([])
  const posts$ = useStream([])

  const users = useObservable(users$, [])
  const posts = useObservable(posts$, [])

  return (
    <div>
      <UserList users={users} />
      <PostList posts={posts} />
    </div>
  )
}
```

### Computed Values

```tsx
import { useObservable, useStream } from 'pipel-react'
import { map } from 'pipeljs'

function PriceCalculator() {
  const price$ = useStream(100)
  const quantity$ = useStream(1)

  const total = useObservable(price$.pipe(map((price) => price * quantity$.value)), 0)

  return (
    <div>
      <p>Total: ${total}</p>
      <input type="number" onChange={(e) => quantity$.next(Number(e.target.value))} />
    </div>
  )
}
```

## Features

- ✅ Automatic subscription management
- ✅ Cleanup on component unmount
- ✅ Support for default values
- ✅ Works with all Observable types
- ✅ Immediate value access
- ✅ TypeScript type inference

## Notes

1. Subscription is automatically created and cleaned up
2. Component re-renders when Observable emits new value
3. If Observable has a current value, it's used immediately
4. Default value is used only before first emission
5. Subscription is cleaned up when component unmounts

## Comparison with usePipel

| Feature        | useObservable                    | usePipel                        |
| -------------- | -------------------------------- | ------------------------------- |
| Returns        | Value only                       | [value, stream$] tuple          |
| Creates Stream | No                               | Yes (if initial value provided) |
| Subscription   | Automatic                        | Automatic                       |
| Use Case       | Subscribe to existing Observable | Create and manage Stream        |

## Related

- [usePipel](/core/usePipel/) - Create Stream with state sync
- [useStream](/core/useStream/) - Create stable Stream
- [effect$](/core/effect$/) - Execute side effects
