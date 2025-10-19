# Immutable Data

pipel uses [limu](https://tnfe.github.io/limu/) for immutable data at its core, and data can only be modified immutably through methods like `set` and `next`.

## Modifying Object Data

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

## Modifying Array Data

```typescript
import { useStream } from 'pipel-react'

function Example() {
  const stream$ = useStream([1, 2, 3])

  // Modify array data
  const updateFirst = () => {
    stream$.set((value) => {
      value[0] = 2
    })
  }

  // Complete replacement
  const replace = () => {
    stream$.next([1, 2, 3, 4])
  }

  return (
    <>
      <button onClick={updateFirst}>Modify First Item</button>
      <button onClick={replace}>Replace All</button>
    </>
  )
}
```

## Modifying Primitive Data Types

```typescript
import { usePipel } from 'pipel-react'

function Example() {
  const [count, count$] = usePipel(1)

  // Modify primitive data type
  const increment = () => {
    count$.next(count + 1)
  }

  return <button onClick={increment}>Increment: {count}</button>
}
```

## Use Cases

In React, capturing snapshots of each modification with `useState` is difficult, but pipel makes it easy:

```tsx
import { usePipel } from 'pipel-react'
import { useEffect } from 'react'

function Example() {
  const [data, data$] = usePipel({ nest: { name: 'pipeljs', age: 0 } })

  useEffect(() => {
    // Subscribe to data changes, get snapshot of each modification
    const subscription = data$.subscribe((value) => {
      console.log('pipel value:', value)
      console.log('Is new object:', value !== data)
    })

    return () => subscription.unsubscribe()
  }, [data$])

  return (
    <button onClick={() => data$.set((v) => v.nest.age++)}>Increase Age: {data.nest.age}</button>
  )
}
```

## Comparison with useState

### Using useState

```tsx
import { useState, useEffect } from 'react'

function Example() {
  const [data, setData] = useState({ nest: { name: 'pipeljs', age: 0 } })

  useEffect(() => {
    console.log('useState value:', data)
    // Problem: Cannot get before/after comparison
  }, [data])

  const updateAge = () => {
    // Must manually create new object
    setData((prev) => ({
      ...prev,
      nest: {
        ...prev.nest,
        age: prev.nest.age + 1,
      },
    }))
  }

  return <button onClick={updateAge}>Increase Age: {data.nest.age}</button>
}
```

### Using pipel

```tsx
import { usePipel } from 'pipel-react'
import { useEffect } from 'react'

function Example() {
  const [data, data$] = usePipel({ nest: { name: 'pipeljs', age: 0 } })

  useEffect(() => {
    const subscription = data$.subscribe((value) => {
      console.log('pipel value:', value)
      // Advantage: Automatically creates immutable copy, easy to compare
    })
    return () => subscription.unsubscribe()
  }, [data$])

  const updateAge = () => {
    // Concise syntax, automatically handles immutable updates
    data$.set((v) => v.nest.age++)
  }

  return <button onClick={updateAge}>Increase Age: {data.nest.age}</button>
}
```

## Advantages of Immutable Data

1. **Simplified Syntax**: No need to manually use spread operators to create new objects
2. **Performance Optimization**: Only creates necessary copies, not the entire object tree
3. **Easy Debugging**: Easily track data change history
4. **Type Safety**: Full TypeScript support

## Debugging Immutable Updates

Using pipel's debugging tools, you can clearly see each immutable update:

```tsx
import { usePipel } from 'pipel-react'
import { consoleNode } from 'pipeljs'
import { useEffect } from 'react'

function Example() {
  const [data, data$] = usePipel({ nest: { name: 'pipeljs', age: 0 } })

  useEffect(() => {
    // Add console plugin
    data$.use(consoleNode('data'))
  }, [data$])

  return (
    <div>
      <p>Age: {data.nest.age}</p>
      <button onClick={() => data$.set((v) => v.nest.age++)}>Increase Age (check console)</button>
    </div>
  )
}
```

After clicking the button, the console will clearly show:

- Value before modification
- Value after modification
- Changed path

## Best Practices

1. **Use set method**: For object and array modifications, prefer the `set` method
2. **Use next method**: For complete replacement, use the `next` method
3. **Avoid direct modification**: Don't directly modify state values returned from `usePipel`
4. **Leverage debugging tools**: Use tools like `consoleNode` to track data changes

## Summary

pipel's immutable data features:

- ✅ **Simplified Syntax**: No need to manually create object copies
- ✅ **Automatic Optimization**: Intelligently copies only changed parts
- ✅ **Easy Debugging**: Clear change tracking
- ✅ **Type Safety**: Full TypeScript support
- ✅ **Superior Performance**: High-performance implementation based on limu
