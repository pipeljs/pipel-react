# to$

Convert a state setter function to a Stream, enabling reactive updates from external sources.

## Signature

```typescript
function to$<T>(setState: Dispatch<SetStateAction<T>>): Stream<T>
```

## Parameters

| Parameter  | Type                          | Description                               |
| ---------- | ----------------------------- | ----------------------------------------- |
| `setState` | `Dispatch<SetStateAction<T>>` | React state setter function from useState |

## Returns

Returns a `Stream<T>` that updates the state when it emits values.

## Basic Usage

### Convert State Setter to Stream

```tsx
import { to$ } from 'pipel-react'
import { useState } from 'react'

function Counter() {
  const [count, setCount] = useState(0)
  const count$ = to$(setCount)

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => count$.next(count + 1)}>Increment</button>
    </div>
  )
}
```

### Connect External Stream to State

```tsx
import { to$ } from 'pipel-react'
import { useState, useEffect } from 'react'

// External stream
const globalEvents$ = new Stream()

function EventListener() {
  const [events, setEvents] = useState([])
  const events$ = to$(setEvents)

  useEffect(() => {
    const child = globalEvents$.then((event) => {
      events$.next([...events, event])
    })
    return () => child.unsubscribe()
  }, [])

  return <EventList events={events} />
}
```

## Advanced Usage

### With Stream Operators

```tsx
import { to$ } from 'pipel-react'
import { useState } from 'react'
import { debounce, filter } from 'pipeljs'

function SearchBox() {
  const [keyword, setKeyword] = useState('')
  const [results, setResults] = useState([])

  const keyword$ = to$(setKeyword)
  const results$ = to$(setResults)

  useEffect(() => {
    const child = keyword$
      .pipe(
        debounce(300),
        filter((k) => k.length > 2),
        map((k) => fetchResults(k))
      )
      .then((data) => results$.next(data))

    return () => child.unsubscribe()
  }, [])

  return (
    <div>
      <input onChange={(e) => keyword$.next(e.target.value)} />
      <Results data={results} />
    </div>
  )
}
```

### Bidirectional Sync

```tsx
import { to$ } from 'pipel-react'
import { useState, useEffect } from 'react'

function SyncedInput({ value$: externalValue$ }) {
  const [value, setValue] = useState('')
  const value$ = to$(setValue)

  // Sync external stream to local state
  useEffect(() => {
    const child = externalValue$.then((v) => value$.next(v))
    return () => child.unsubscribe()
  }, [])

  // Sync local changes to external stream
  const handleChange = (e) => {
    const newValue = e.target.value
    value$.next(newValue)
    externalValue$.next(newValue)
  }

  return <input value={value} onChange={handleChange} />
}
```

### Multiple State Updates

```tsx
import { to$ } from 'pipel-react'
import { useState } from 'react'

function Form() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  const name$ = to$(setName)
  const email$ = to$(setEmail)

  const handleSubmit = () => {
    // Both streams can be used independently
    console.log('Name:', name$.value)
    console.log('Email:', email$.value)
  }

  return (
    <form onSubmit={handleSubmit}>
      <input onChange={(e) => name$.next(e.target.value)} />
      <input onChange={(e) => email$.next(e.target.value)} />
      <button type="submit">Submit</button>
    </form>
  )
}
```

## Features

- ✅ Convert state setter to Stream
- ✅ Enable reactive state updates
- ✅ Works with all Stream operators
- ✅ Supports functional updates
- ✅ Type-safe with TypeScript
- ✅ No additional re-renders

## Notes

1. The returned Stream calls `setState` when it emits values
2. Supports both direct values and functional updates
3. Does not create additional re-renders beyond normal `setState`
4. The Stream reference is stable across re-renders
5. Useful for connecting external streams to React state

## Comparison with useSyncState

| Feature       | to$          | useSyncState               |
| ------------- | ------------ | -------------------------- |
| Returns       | Stream only  | [state, setState, stream$] |
| Bidirectional | Manual       | Automatic                  |
| Use Case      | One-way sync | Two-way sync               |
| Complexity    | Simple       | More features              |

## Related

- [useSyncState](/core/useSyncState/) - Bidirectional state-stream sync
- [usePipel](/core/usePipel/) - Create Stream with state
- [useStream](/core/useStream/) - Create stable Stream
