# Debugging

## Debugging Tools

Pipel-React provides various debugging tools to help you understand and debug reactive data flows.

### debug Operator

The `debug` operator prints stream value changes to the console:

```tsx
import { usePipel, debug } from 'pipel-react'

function Example() {
  const [count, count$] = usePipel(0)

  // Add debugging
  count$
    .pipe(
      debug('count') // Label name
    )
    .subscribe()

  return <button onClick={() => count$.next(count + 1)}>Increment</button>
}

// Console output:
// [count] 0
// [count] 1
// [count] 2
```

### tap Operator

The `tap` operator allows you to perform side effects without affecting the data flow:

```tsx
import { tap } from 'pipeljs'

const [data, data$] = usePipel({ count: 0 })

data$
  .pipe(
    tap((value) => {
      console.log('Before:', value)
    }),
    map((v) => v.count * 2),
    tap((value) => {
      console.log('After:', value)
    })
  )
  .subscribe()
```

## React DevTools

### Component Names

Add meaningful names to components for easy identification in DevTools:

```tsx
function UserProfile() {
  const [user, user$] = usePipel({ name: 'John', age: 25 })

  return <div>{user.name}</div>
}

// Shows as "UserProfile" in DevTools
```

### Using displayName

```tsx
const MemoizedComponent = memo(function UserCard({ user }) {
  return <div>{user.name}</div>
})

MemoizedComponent.displayName = 'UserCard'
```

## Performance Debugging

### Detecting Unnecessary Renders

```tsx
import { useEffect, useRef } from 'react'

function useRenderCount(componentName) {
  const renderCount = useRef(0)

  useEffect(() => {
    renderCount.current += 1
    console.log(`${componentName} rendered ${renderCount.current} times`)
  })

  return renderCount.current
}

function Example() {
  const renderCount = useRenderCount('Example')
  const [count, count$] = usePipel(0)

  return (
    <div>
      <p>Render count: {renderCount}</p>
      <p>Count: {count}</p>
      <button onClick={() => count$.next(count + 1)}>Increment</button>
    </div>
  )
}
```

## Common Issues

### 1. Component Not Updating

**Problem:** Data changed but component didn't re-render

**Checklist:**

```tsx
// ❌ Wrong: Direct modification
const [user, user$] = usePipel({ name: 'John' })
user.name = 'Jane' // Won't trigger update

// ✅ Correct: Use set() or next()
user$.set((u) => {
  u.name = 'Jane'
})
user$.next({ ...user, name: 'Jane' })
```

### 2. Memory Leaks

**Problem:** Subscriptions not cleaned up after component unmount

**Checklist:**

```tsx
// ❌ Wrong: Forgot to cleanup
useEffect(() => {
  stream$.subscribe((value) => {
    console.log(value)
  })
  // Missing cleanup
}, [])

// ✅ Correct: Cleanup subscription
useEffect(() => {
  const subscription = stream$.subscribe((value) => {
    console.log(value)
  })

  return () => subscription.unsubscribe()
}, [stream$])
```

### 3. Closure Trap

**Problem:** Using stale values in callbacks

```tsx
// ❌ Problem: Using stale value from closure
const [count, count$] = usePipel(0)

setTimeout(() => {
  count$.next(count + 1) // count might be outdated
}, 1000)

// ✅ Solution: Use functional update
setTimeout(() => {
  count$.set((c) => c + 1) // Always uses latest value
}, 1000)
```

### 4. Async Race Conditions

**Problem:** Uncertain order of async request responses

```tsx
// ❌ Problem: May show old search results
const [query, query$] = usePipel('')
const [results, results$] = usePipel([])

query$.pipe(debounce(300)).subscribe(async (q) => {
  const data = await fetch(`/api/search?q=${q}`)
  results$.next(data) // Might be from old request
})

// ✅ Solution: Use switchMap
import { switchMap } from 'pipeljs'

const results = useObservable(
  query$.pipe(
    debounce(300),
    switchMap((q) => fetch(`/api/search?q=${q}`).then((r) => r.json()))
  )
)
```

## Debugging Techniques

### 1. Use console.trace()

```tsx
data$
  .pipe(
    tap(() => {
      console.trace('Data updated from:')
    })
  )
  .subscribe()
```

### 2. Conditional Breakpoints

```tsx
data$
  .pipe(
    tap((value) => {
      if (value.count > 10) {
        debugger // Only pause when count > 10
      }
    })
  )
  .subscribe()
```

### 3. Custom Debug Hook

```tsx
function useDebugValue(value, label = 'Value') {
  useEffect(() => {
    console.log(`[${label}] changed:`, value)
  }, [value, label])

  return value
}

function Example() {
  const [count, count$] = usePipel(0)
  useDebugValue(count, 'Count')

  return <div>{count}</div>
}
```

## Production Debugging

### 1. Conditional Debugging

```tsx
const DEBUG = process.env.NODE_ENV === 'development'

if (DEBUG) {
  stream$.pipe(debug('stream')).subscribe()
}
```

### 2. Error Boundaries

```tsx
import { Component } from 'react'

class ErrorBoundary extends Component {
  state = { hasError: false, error: null }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught:', error, errorInfo)
    // Send to error tracking service
  }

  render() {
    if (this.state.hasError) {
      return <div>Something went wrong</div>
    }

    return this.props.children
  }
}
```

## Best Practices

1. **Enable debugging in development** - Use `debug` operator to track data flow
2. **Use React DevTools** - Inspect component tree and props
3. **Add meaningful labels** - Give descriptive names to Streams and components
4. **Log key operations** - Use `tap` to record important data changes
5. **Performance profiling** - Use Profiler to find bottlenecks
6. **Error handling** - Use ErrorBoundary to catch errors
7. **Conditional debugging** - Only enable detailed logs in development

## Next Steps

- [Reactive Programming](/guide/reactive) - Understand data flow
- [Stream Rendering](/guide/render) - Optimize rendering performance
- [API Reference](/core/debug/) - View debugging APIs
