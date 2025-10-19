# useSyncState

Create bidirectional synchronization between React state and a Stream. Changes to either the state or the Stream automatically sync to the other.

## Signature

```typescript
function useSyncState<T>(initialValue: T): [T, Dispatch<SetStateAction<T>>, Stream<T>]

function useSyncState<T>(
  stream$: Stream<T>
): [T | undefined, Dispatch<SetStateAction<T>>, Stream<T>]
```

## Parameters

| Parameter      | Type        | Description                            |
| -------------- | ----------- | -------------------------------------- |
| `initialValue` | `T`         | Initial value for the state and Stream |
| `stream$`      | `Stream<T>` | Existing Stream to sync with           |

## Returns

Returns a tuple `[state, setState, stream$]`:

| Index | Type                          | Description                  |
| ----- | ----------------------------- | ---------------------------- |
| `0`   | `T \| undefined`              | Current state value          |
| `1`   | `Dispatch<SetStateAction<T>>` | State setter function        |
| `2`   | `Stream<T>`                   | Synchronized Stream instance |

## Basic Usage

### Create Synced State

```tsx
import { useSyncState } from 'pipel-react'

function Counter() {
  const [count, setCount, count$] = useSyncState(0)

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment via setState</button>
      <button onClick={() => count$.next(count + 1)}>Increment via Stream</button>
    </div>
  )
}
```

### Sync with Existing Stream

```tsx
import { useSyncState, useStream } from 'pipel-react'

const globalCount$ = new Stream(0)

function ComponentA() {
  const [count, setCount] = useSyncState(globalCount$)

  return <button onClick={() => setCount(count + 1)}>Count: {count}</button>
}

function ComponentB() {
  const [count] = useSyncState(globalCount$)

  return <div>Count in B: {count}</div>
}
```

## Advanced Usage

### Form State Management

```tsx
import { useSyncState } from 'pipel-react'
import { debounce } from 'pipeljs'

function SearchForm() {
  const [keyword, setKeyword, keyword$] = useSyncState('')
  const [results, setResults] = useState([])

  useEffect(() => {
    const child = keyword$
      .pipe(
        debounce(300),
        filter((k) => k.length > 2),
        map((k) => fetchResults(k))
      )
      .then((data) => setResults(data))

    return () => child.unsubscribe()
  }, [keyword$])

  return (
    <div>
      <input value={keyword} onChange={(e) => setKeyword(e.target.value)} />
      <Results data={results} />
    </div>
  )
}
```

### Cross-Component Communication

```tsx
import { useSyncState } from 'pipel-react'

// Shared stream
const theme$ = new Stream('light')

function ThemeToggle() {
  const [theme, setTheme] = useSyncState(theme$)

  return (
    <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>Toggle Theme</button>
  )
}

function ThemedComponent() {
  const [theme] = useSyncState(theme$)

  return <div className={`theme-${theme}`}>Current theme: {theme}</div>
}
```

### With Stream Operators

```tsx
import { useSyncState } from 'pipel-react'
import { map, filter } from 'pipeljs'

function PriceCalculator() {
  const [price, setPrice, price$] = useSyncState(100)
  const [quantity, setQuantity, quantity$] = useSyncState(1)

  const total = useObservable(price$.pipe(map((p) => p * quantity$.value)), 0)

  return (
    <div>
      <input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} />
      <input type="number" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
      <p>Total: ${total}</p>
    </div>
  )
}
```

### Persistent State

```tsx
import { useSyncState } from 'pipel-react'

function Settings() {
  const [settings, setSettings, settings$] = useSyncState({
    theme: 'light',
    language: 'en',
  })

  // Persist to localStorage
  useEffect(() => {
    const child = settings$.then((value) => {
      localStorage.setItem('settings', JSON.stringify(value))
    })
    return () => child.unsubscribe()
  }, [settings$])

  return (
    <div>
      <select
        value={settings.theme}
        onChange={(e) => setSettings({ ...settings, theme: e.target.value })}
      >
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </div>
  )
}
```

## Features

- ✅ Bidirectional synchronization
- ✅ Works with existing Streams
- ✅ Supports functional updates
- ✅ Automatic cleanup
- ✅ Type-safe with TypeScript
- ✅ No circular update issues
- ✅ Stable Stream reference

## Notes

1. Changes via `setState` automatically update the Stream
2. Changes via `stream$.next()` automatically update the state
3. Prevents circular updates internally
4. The Stream reference is stable across re-renders
5. Cleanup is automatic on component unmount
6. Supports both direct values and functional updates

## Comparison with Other Hooks

| Feature          | useSyncState | usePipel                 | to$                      |
| ---------------- | ------------ | ------------------------ | ------------------------ |
| Bidirectional    | ✅ Yes       | ❌ No                    | ❌ No                    |
| Returns Stream   | ✅ Yes       | ✅ Yes                   | ✅ Yes                   |
| Returns setState | ✅ Yes       | ❌ No                    | ❌ No                    |
| Use Case         | Two-way sync | One-way (Stream → State) | One-way (Stream → State) |

## Related

- [usePipel](/core/usePipel/) - Stream to state (one-way)
- [to$](/core/to$/) - State setter to Stream
- [useStream](/core/useStream/) - Create stable Stream
- [persistStream$](/core/persistStream$/) - Persistent Stream
