# Debugging

pipel provides a series of powerful development tools for developers to easily debug stream data.

## Console Plugin

pipel provides console plugins to print data modification processes.

### Single Node Console

```typescript
import { useStream } from 'pipel-react'
import { consoleNode } from 'pipeljs'
import { useEffect } from 'react'

function Example() {
  const data$ = useStream(0)

  useEffect(() => {
    data$.use(consoleNode())
  }, [data$])

  const update = () => {
    data$.next(1) // prints resolve 1
    data$.next(2) // prints resolve 2
    data$.next(3) // prints resolve 3

    data$.next(Promise.reject(4)) // prints reject 4
  }

  return <button onClick={update}>Update Data</button>
}
```

### Entire Stream Console

```typescript
import { useStream } from 'pipel-react'
import { consoleAll, debounce } from 'pipeljs'
import { useEffect } from 'react'

function Example() {
  const data$ = useStream(0)

  useEffect(() => {
    data$.use(consoleAll())

    data$
      .pipe(debounce(300))
      .then((value) => {
        throw new Error(value + 1)
      })
      .then(undefined, (error) => ({ current: error.message }))
  }, [data$])

  return (
    <div>
      <button onClick={() => data$.next(Date.now())}>
        Update Data (check console)
      </button>
    </div>
  )
}
```

::: info Note
`consoleAll` prints the entire stream, meaning the Stream node and its Observable child nodes.
:::

## Debug Plugin

:::warning Note
Browsers may filter debugger statements in node_modules, preventing debugger breakpoints from working. You need to manually enable node_modules debugging in Browser DevTools -> Settings -> Ignore List.
:::

pipel provides debug plugins to debug stream data.

### Basic Debugging

```typescript
import { useStream } from 'pipel-react'
import { debugNode } from 'pipeljs'
import { useEffect } from 'react'

function Example() {
  const stream$ = useStream(0)

  useEffect(() => {
    stream$
      .then((value) => value + 1)
      .use(debugNode())
  }, [stream$])

  const trigger = () => {
    stream$.next(1)
    // Triggers debugger breakpoint
  }

  return <button onClick={trigger}>Trigger Debug</button>
}
```

### Conditional Debugging

```typescript
import { useStream } from 'pipel-react'
import { debugNode } from 'pipeljs'
import { useEffect } from 'react'

function Example() {
  const stream$ = useStream<string | number>(0)

  useEffect(() => {
    // Only trigger debugger for string types
    const conditionFn = (value: any) => typeof value === 'string'
    stream$.use(debugNode(conditionFn))
  }, [stream$])

  const triggerString = () => {
    stream$.next('hello') // Triggers debugger
  }

  const triggerNumber = () => {
    stream$.next(42) // Does not trigger debugger
  }

  return (
    <>
      <button onClick={triggerString}>Trigger String (will debug)</button>
      <button onClick={triggerNumber}>Trigger Number (won't debug)</button>
    </>
  )
}
```

### Entire Stream Debugging

```typescript
import { useStream } from 'pipel-react'
import { debugAll } from 'pipeljs'
import { useEffect } from 'react'

function Example() {
  const data$ = useStream(0)

  useEffect(() => {
    data$.use(debugAll())

    data$
      .then((value) => value + 1)
      .then((value) => value + 1)
  }, [data$])

  const updateData = () => {
    data$.next(data$.value + 1)
    // Will trigger debugger breakpoints at each node in browser DevTools
    // Currently has three nodes, so will trigger three breakpoints
  }

  return <button onClick={updateData}>Update Data (trigger debug)</button>
}
```

## Debugging with React DevTools

Combined with React DevTools, you can better debug pipel-react applications:

```tsx
import { usePipel } from 'pipel-react'
import { useEffect } from 'react'

function Example() {
  const [data, data$] = usePipel({ count: 0, name: 'test' })

  useEffect(() => {
    // Can see component updates in React DevTools Profiler
    console.log('Component updated with:', data)
  }, [data])

  return (
    <div>
      <p>Count: {data.count}</p>
      <p>Name: {data.name}</p>
      <button onClick={() => data$.set((v) => v.count++)}>Increment Count</button>
    </div>
  )
}
```

## Performance Debugging

Use React Profiler and pipel's debugging tools to analyze performance:

```tsx
import { usePipel, useObservable } from 'pipel-react'
import { Profiler } from 'react'
import { consoleNode } from 'pipeljs'
import { useEffect } from 'react'

function Example() {
  const [data, data$] = usePipel({ count: 0 })

  useEffect(() => {
    // Print each data change
    data$.use(consoleNode('data'))
  }, [data$])

  const onRender = (id: string, phase: 'mount' | 'update', actualDuration: number) => {
    console.log(`${id} ${phase} took ${actualDuration}ms`)
  }

  return (
    <Profiler id="Example" onRender={onRender}>
      <div>
        <p>Count: {data.count}</p>
        <button onClick={() => data$.set((v) => v.count++)}>Increment Count</button>
      </div>
    </Profiler>
  )
}
```

## Debugging Best Practices

### 1. Use Named Streams

Add names to streams for easy identification in console:

```typescript
import { useStream } from 'pipel-react'
import { consoleNode } from 'pipeljs'
import { useEffect } from 'react'

function Example() {
  const userStream$ = useStream({ name: 'John', age: 25 })
  const orderStream$ = useStream({ id: 1, total: 100 })

  useEffect(() => {
    userStream$.use(consoleNode('userStream'))
    orderStream$.use(consoleNode('orderStream'))
  }, [userStream$, orderStream$])

  // Console will clearly show which stream's data changed
}
```

### 2. Stage-by-Stage Debugging

In complex stream processing chains, add debugging at different stages:

```typescript
import { useStream } from 'pipel-react'
import { consoleNode, map, filter } from 'pipeljs'
import { useEffect } from 'react'

function Example() {
  const data$ = useStream(0)

  useEffect(() => {
    data$
      .use(consoleNode('raw data'))
      .pipe(map((x) => x * 2))
      .use(consoleNode('after multiply by 2'))
      .pipe(filter((x) => x > 10))
      .use(consoleNode('after filter'))
  }, [data$])
}
```

### 3. Conditional Debugging

Enable debugging in development, disable in production:

```typescript
import { useStream } from 'pipel-react'
import { consoleNode, debugNode } from 'pipeljs'
import { useEffect } from 'react'

function Example() {
  const data$ = useStream(0)

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      data$.use(consoleNode('data'))
      data$.use(debugNode())
    }
  }, [data$])
}
```

## Common Debugging Scenarios

### Debugging Async Data Streams

```typescript
import { useStream } from 'pipel-react'
import { consoleNode } from 'pipeljs'
import { useEffect } from 'react'

function Example() {
  const data$ = useStream<Promise<any>>(Promise.resolve(null))

  useEffect(() => {
    data$.use(consoleNode('async data'))

    data$.then(
      (value) => console.log('Success:', value),
      (error) => console.error('Error:', error)
    )
  }, [data$])

  const fetchData = async () => {
    data$.next(
      fetch('/api/data').then(res => res.json())
    )
  }

  return <button onClick={fetchData}>Fetch Data</button>
}
```

### Debugging Subscription Issues

```typescript
import { useStream } from 'pipel-react'
import { useEffect } from 'react'

function Example() {
  const data$ = useStream(0)

  useEffect(() => {
    console.log('Setting up subscription')

    const subscription = data$.subscribe((value) => {
      console.log('Received value:', value)
    })

    return () => {
      console.log('Cleaning up subscription')
      subscription.unsubscribe()
    }
  }, [data$])

  return <button onClick={() => data$.next(Date.now())}>Update</button>
}
```

## Summary

pipel's debugging tools:

- ✅ **consoleNode**: Print data changes for a single node
- ✅ **consoleAll**: Print data changes for the entire stream
- ✅ **debugNode**: Trigger debugger breakpoint at a single node
- ✅ **debugAll**: Trigger debugger breakpoints for the entire stream
- ✅ **Conditional Debugging**: Support conditional debugging triggers
- ✅ **React DevTools**: Perfect integration with React development tools

These tools help you:

- Track data flow
- Locate issues
- Analyze performance bottlenecks
- Understand complex stream processing logic
