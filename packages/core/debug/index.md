# Debug Tools

Utilities for debugging stream values, subscriptions, and performance.

## Basic Usage

### debug$

Add debug logging to a stream:

```tsx
import { debug$ } from 'pipel-react'
import { Stream } from 'pipeljs'

const count$ = new Stream(0)
debug$(count$, 'Counter')

count$.next(1) // Output: [Counter] Value: 1
count$.next(2) // Output: [Counter] Value: 2
```

### logStream$

Log stream values to console:

```tsx
import { logStream$ } from 'pipel-react'

const count$ = new Stream(0)
const unsubscribe = logStream$(count$, 'Counter')

count$.next(1) // Output: [Counter] 1
count$.next(2) // Output: [Counter] 2

unsubscribe() // Stop logging
```

### trace$

Trace stream lifecycle events:

```tsx
import { trace$ } from 'pipel-react'

const count$ = new Stream(0)
trace$(count$, 'Counter')

// Output:
// [Counter] Created
// [Counter] Subscribed
// [Counter] Value: 0
// [Counter] Unsubscribed
```

## API Reference

### debug$

```typescript
function debug$<T>(stream$: Stream<T>, label?: string, options?: DebugOptions): Stream<T>
```

**Parameters:**

| Parameter | Type           | Description             |
| --------- | -------------- | ----------------------- |
| `stream$` | `Stream<T>`    | Stream to debug         |
| `label`   | `string`       | Optional label for logs |
| `options` | `DebugOptions` | Debug options           |

**Options:**

```typescript
interface DebugOptions {
  // Log values
  logValues?: boolean

  // Log subscriptions
  logSubscriptions?: boolean

  // Log errors
  logErrors?: boolean

  // Custom logger
  logger?: (message: string) => void

  // Log level
  level?: 'log' | 'info' | 'warn' | 'error'
}
```

**Returns:** The same stream with debugging enabled

### logStream$

```typescript
function logStream$<T>(stream$: Stream<T>, label?: string): () => void
```

**Parameters:**

| Parameter | Type        | Description             |
| --------- | ----------- | ----------------------- |
| `stream$` | `Stream<T>` | Stream to log           |
| `label`   | `string`    | Optional label for logs |

**Returns:** Unsubscribe function

### trace$

```typescript
function trace$<T>(stream$: Stream<T>, label?: string, options?: TraceOptions): Stream<T>
```

**Parameters:**

| Parameter | Type           | Description               |
| --------- | -------------- | ------------------------- |
| `stream$` | `Stream<T>`    | Stream to trace           |
| `label`   | `string`       | Optional label for traces |
| `options` | `TraceOptions` | Trace options             |

**Options:**

```typescript
interface TraceOptions {
  // Trace creation
  traceCreation?: boolean

  // Trace subscriptions
  traceSubscriptions?: boolean

  // Trace values
  traceValues?: boolean

  // Trace errors
  traceErrors?: boolean

  // Trace completion
  traceCompletion?: boolean
}
```

**Returns:** The same stream with tracing enabled

## Advanced Usage

### Custom Logger

```tsx
import { debug$ } from 'pipel-react'

const count$ = new Stream(0)

debug$(count$, 'Counter', {
  logger: (message) => {
    // Send to analytics
    analytics.track('stream_debug', { message })
    console.log(message)
  },
})
```

### Conditional Debugging

```tsx
import { debug$ } from 'pipel-react'

const count$ = new Stream(0)

if (process.env.NODE_ENV === 'development') {
  debug$(count$, 'Counter', {
    logValues: true,
    logSubscriptions: true,
  })
}
```

### Performance Monitoring

```tsx
import { trace$ } from 'pipel-react'

const data$ = new Stream([])

trace$(data$, 'DataStream', {
  traceValues: true,
  traceSubscriptions: true,
})

// Monitor subscription count and value changes
```

## Best Practices

1. **Use labels** - Always provide meaningful labels for easier debugging
2. **Remove in production** - Disable debugging in production builds
3. **Use trace$ for lifecycle** - Use trace$ to understand stream lifecycle
4. **Use debug$ for values** - Use debug$ to inspect stream values
5. **Custom loggers** - Use custom loggers for advanced debugging needs

## Examples

### Debugging Async Operations

```tsx
import { debug$, asyncStream$ } from 'pipel-react'

const { data$, loading$, error$ } = asyncStream$(async () => {
  const res = await fetch('/api/data')
  return res.json()
})

debug$(data$, 'Data')
debug$(loading$, 'Loading')
debug$(error$, 'Error')
```

### Debugging State Sync

```tsx
import { debug$, useSyncState } from 'pipel-react'

function Counter() {
  const [count, setCount, count$] = useSyncState(0)

  useEffect(() => {
    debug$(count$, 'Counter', {
      logValues: true,
      logSubscriptions: true,
    })
  }, [count$])

  return <button onClick={() => setCount(count + 1)}>Count: {count}</button>
}
```

### Debugging Stream Pipeline

```tsx
import { debug$ } from 'pipel-react'
import { Stream } from 'pipeljs'

const input$ = new Stream('')
const filtered$ = input$.pipe(filter((x) => x.length > 2))
const debounced$ = filtered$.pipe(debounce(300))

debug$(input$, 'Input')
debug$(filtered$, 'Filtered')
debug$(debounced$, 'Debounced')
```

## Related

- [Guide: Debugging](/guide/debug) - Debugging guide
- [usePipel](/core/usePipel/) - Core hook for streams
- [useStream](/core/useStream/) - Create stable streams
