# effect$

Execute side effects in response to Observable changes with automatic cleanup.

## Signature

```typescript
function effect$<T>(observable$: Observable<T>, callback: (value: T) => void | (() => void)): void
```

## Parameters

| Parameter     | Type                                 | Description                                          |
| ------------- | ------------------------------------ | ---------------------------------------------------- |
| `observable$` | `Observable<T>`                      | Observable to subscribe to                           |
| `callback`    | `(value: T) => void \| (() => void)` | Effect function, optionally returns cleanup function |

## Returns

Returns `void`. The effect is automatically managed within the component lifecycle.

## Basic Usage

### Simple Side Effect

```tsx
import { effect$ } from 'pipel-react'
import { usePipel } from 'pipel-react'

function Logger() {
  const [count, count$] = usePipel(0)

  effect$(count$, (value) => {
    console.log('Count changed:', value)
  })

  return <button onClick={() => count$.next(count + 1)}>Count: {count}</button>
}
```

### With Cleanup

```tsx
import { effect$ } from 'pipel-react'

function Timer() {
  const [isActive, isActive$] = usePipel(false)

  effect$(isActive$, (active) => {
    if (!active) return

    const timer = setInterval(() => {
      console.log('Tick')
    }, 1000)

    // Cleanup function
    return () => {
      clearInterval(timer)
      console.log('Timer stopped')
    }
  })

  return (
    <button onClick={() => isActive$.next(!isActive)}>{isActive ? 'Stop' : 'Start'} Timer</button>
  )
}
```

## Advanced Usage

### DOM Manipulation

```tsx
import { effect$ } from 'pipel-react'
import { useRef } from 'react'

function ScrollToTop() {
  const [page, page$] = usePipel(1)
  const containerRef = useRef<HTMLDivElement>(null)

  effect$(page$, () => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0
    }
  })

  return (
    <div ref={containerRef}>
      <Content page={page} />
      <button onClick={() => page$.next(page + 1)}>Next Page</button>
    </div>
  )
}
```

### Event Listeners

```tsx
import { effect$ } from 'pipel-react'

function KeyboardListener() {
  const [enabled, enabled$] = usePipel(true)

  effect$(enabled$, (isEnabled) => {
    if (!isEnabled) return

    const handleKeyPress = (e: KeyboardEvent) => {
      console.log('Key pressed:', e.key)
    }

    window.addEventListener('keypress', handleKeyPress)

    return () => {
      window.removeEventListener('keypress', handleKeyPress)
    }
  })

  return (
    <button onClick={() => enabled$.next(!enabled)}>
      {enabled ? 'Disable' : 'Enable'} Keyboard Listener
    </button>
  )
}
```

### API Calls

```tsx
import { effect$ } from 'pipel-react'

function UserProfile() {
  const [userId, userId$] = usePipel<string | null>(null)
  const [user, setUser] = useState(null)

  effect$(userId$, (id) => {
    if (!id) return

    let cancelled = false

    fetch(`/api/users/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setUser(data)
      })

    return () => {
      cancelled = true
    }
  })

  return (
    <div>
      <UserSelector onSelect={(id) => userId$.next(id)} />
      {user && <UserCard user={user} />}
    </div>
  )
}
```

### Local Storage Sync

```tsx
import { effect$ } from 'pipel-react'

function Settings() {
  const [theme, theme$] = usePipel('light')

  effect$(theme$, (value) => {
    localStorage.setItem('theme', value)
    document.body.className = value
  })

  return (
    <button onClick={() => theme$.next(theme === 'light' ? 'dark' : 'light')}>
      Toggle Theme: {theme}
    </button>
  )
}
```

### Multiple Effects

```tsx
import { effect$ } from 'pipel-react'

function Analytics() {
  const [page, page$] = usePipel('home')
  const [user, user$] = usePipel(null)

  // Track page views
  effect$(page$, (pageName) => {
    analytics.track('page_view', { page: pageName })
  })

  // Track user changes
  effect$(user$, (userData) => {
    if (userData) {
      analytics.identify(userData.id)
    }
  })

  return <App />
}
```

## Features

- ✅ Automatic subscription management
- ✅ Cleanup function support
- ✅ Component lifecycle integration
- ✅ Type-safe with TypeScript
- ✅ Works with any Observable
- ✅ No manual unsubscribe needed

## Notes

1. The effect runs whenever the Observable emits a new value
2. Cleanup function from previous effect is called before running the new effect
3. Final cleanup is called when component unmounts
4. The callback and Observable are dependencies - changes trigger re-subscription
5. Use `useCallback` for the callback if it has dependencies

## Comparison with useEffect

| Feature      | effect$                | useEffect            |
| ------------ | ---------------------- | -------------------- |
| Trigger      | Observable changes     | Dependency changes   |
| Cleanup      | Per emission + unmount | Per effect + unmount |
| Subscription | Automatic              | Manual               |
| Type Safety  | Full                   | Partial              |

## Best Practices

### Stable Callback Reference

```tsx
import { effect$ } from 'pipel-react'
import { useCallback } from 'react'

function Component() {
  const [value, value$] = usePipel(0)
  const [multiplier, setMultiplier] = useState(2)

  const handleChange = useCallback(
    (val: number) => {
      console.log('Value * multiplier:', val * multiplier)
    },
    [multiplier]
  )

  effect$(value$, handleChange)

  return <div>...</div>
}
```

### Conditional Effects

```tsx
import { effect$ } from 'pipel-react'

function Component() {
  const [enabled, enabled$] = usePipel(false)

  effect$(enabled$, (isEnabled) => {
    if (!isEnabled) {
      // Return early, no cleanup needed
      return
    }

    // Effect logic
    const subscription = subscribe()

    // Cleanup
    return () => subscription.unsubscribe()
  })

  return <div>...</div>
}
```

## Related

- [useObservable](/core/useObservable/) - Subscribe to Observable and get value
- [usePipel](/core/usePipel/) - Create Stream with state
- [to$](/core/to$/) - Convert state setter to Stream
