# Reactive Programming

pipel-react provides powerful reactive stream programming capabilities that seamlessly integrate with React's state management:

1. Stream data automatically converts to React state, triggering component re-renders
2. pipel-react provides the [to$](/core/usePipel/index.en#to$) method to convert React state into streams
3. Streams offer rich operators for data transformation, filtering, composition, and more

::: tip Note

- pipel-react requires React 18.0+, recommended to use React 18.2.0+ for the best experience
- Stream data follows unidirectional data flow, updated via `stream$.next()` or `stream$.set()`
- Subscriptions are automatically cleaned up when components unmount

:::

## Reactive Data Rendering

Streams can be used directly in React components. Use the `usePipel` hook to convert streams into React state:

```tsx
import { usePipel } from 'pipel-react'

function Example() {
  const [name, name$] = usePipel('pipeljs')

  const updateName = () => {
    name$.next('pipel-react')
  }

  return (
    <div>
      <p>{name}</p>
      <button onClick={updateName}>Update</button>
    </div>
  )
}
```

## Reactive Data Updates

pipel provides [next](https://pipeljs.github.io/pipel-doc/en/api/stream.html#next) and [set](https://pipeljs.github.io/pipel-doc/en/api/stream.html#set) to modify stream data. See: [Immutable Data](/guide/immutable.en)

```typescript
import { useStream } from 'pipel-react'

function Example() {
  const stream$ = useStream({ obj: { name: 'pipeljs', age: 0 } })

  // No need for spread operators {...value, obj: {...value.obj, age: value.obj.age + 1}}
  const updateAge = () => {
    stream$.set((value) => (value.obj.age += 1))
  }

  return <button onClick={updateAge}>Increase Age</button>
}
```

## Reactive Data Integration

pipel streams integrate seamlessly with various React scenarios. Use `useObservable` to subscribe to stream changes and `effect$` to execute side effects:

```typescript
import { usePipel, useObservable } from 'pipel-react'
import { map, filter } from 'pipeljs'

function Example() {
  const [keyword, keyword$] = usePipel('')

  // Process stream with operators
  const filteredKeyword = useObservable(
    keyword$.pipe(
      filter(k => k.length > 2),
      map(k => k.toUpperCase())
    )
  )

  return (
    <div>
      <input
        value={keyword}
        onChange={e => keyword$.next(e.target.value)}
      />
      <p>Filtered keyword: {filteredKeyword}</p>
    </div>
  )
}
```

## Decoupling Reactivity and Data

With useState, data and reactivity are coupled - modifying data always triggers re-renders. There's no way to achieve conditional reactivity:

```typescript
// wineList is frequently modified externally
const [wineList, setWineList] = useState(['Red Wine', 'White Wine', 'Sparkling Wine', 'Rosé Wine'])
const [age, setAge] = useState(0)

// Recalculates every time wineList or age changes
const availableWineList = useMemo(() => {
  return age > 18 ? wineList : []
}, [age, wineList])
```

If you want to get the latest wineList value only when age changes, ignoring wineList modifications when age stays the same, useMemo cannot achieve this.

Using pipel stream programming allows excellent decoupling of data and reactivity:

```typescript
import { useStream, useObservable } from 'pipel-react'
import { filter } from 'pipeljs'

function Example() {
  const wineList$ = useStream(['Red Wine', 'White Wine', 'Sparkling Wine', 'Rosé Wine'])
  const age$ = useStream(0)

  // Only get latest wineList value when age > 18
  // Subsequent wineList modifications won't trigger availableWineList recalculation
  const availableWineList = useObservable(
    age$.pipe(
      filter(age => age > 18)
    ).then(() => wineList$.value)
  )

  return (
    <div>
      <p>Age: {age$.value}</p>
      <p>Available wines: {availableWineList?.join(', ')}</p>
    </div>
  )
}
```

## Async Data Streams

pipel-react provides powerful async data stream processing:

```typescript
import { usePipel, useObservable } from 'pipel-react'
import { debounce, map } from 'pipeljs'

function SearchComponent() {
  const [keyword, keyword$] = usePipel('')

  // Debounced search
  const searchResults = useObservable(
    keyword$.pipe(
      debounce(300),
      filter(k => k.length > 0),
      map(async k => {
        const res = await fetch(`/api/search?q=${k}`)
        return res.json()
      })
    )
  )

  return (
    <div>
      <input
        value={keyword}
        onChange={e => keyword$.next(e.target.value)}
        placeholder="Search..."
      />
      <ul>
        {searchResults?.map(item => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </div>
  )
}
```

## State Synchronization

Use `useSyncState` for bidirectional synchronization between React state and streams:

```typescript
import { useSyncState } from 'pipel-react'

function Example() {
  const [count, setCount, count$] = useSyncState(0)

  // Modifying state syncs to stream
  setCount(1)

  // Modifying stream syncs to state
  count$.next(2)

  // Subscribe to stream changes
  useEffect(() => {
    const child = count$.then(value => {
      console.log('count changed:', value)
    })
    return () => child.unsubscribe()
  }, [count$])

  return <div>Count: {count}</div>
}
```
