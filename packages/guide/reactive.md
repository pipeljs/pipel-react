# Reactive Programming

## What is Reactive Programming?

Reactive programming is a programming paradigm **centered around data flows**. In reactive programming, data changes automatically propagate to all dependent parts.

### Traditional vs Reactive Programming

**Traditional Programming (Imperative):**

```tsx
let a = 1
let b = 2
let c = a + b // c = 3

a = 10
// c is still 3, doesn't auto-update
```

**Reactive Programming (Declarative):**

```tsx
const [a, a$] = usePipel(1)
const [b, b$] = usePipel(2)

const c = useObservable(
  a$.pipe(
    combineLatest(b$),
    map(([a, b]) => a + b)
  )
)

a$.next(10)
// c automatically updates to 12
```

## Stream

Stream is the core concept of Pipel-React, representing **a sequence of values over time**.

### Stream Characteristics

1. **Continuous** - Can emit multiple values
2. **Observable** - Can listen to value changes
3. **Composable** - Can be combined and transformed via operators

### Creating Streams

```tsx
import { usePipel, useStream } from 'pipel-react'

// Method 1: Create via usePipel
const [count, count$] = usePipel(0)

// Method 2: Create via useStream
const count$ = useStream(0)

// Method 3: Create from Promise
const data$ = useStream(fetch('/api/data'))
```

### Subscribing to Streams

```tsx
const [count, count$] = usePipel(0)

// Subscribe to changes
count$.then((value) => {
  console.log('Count changed:', value)
})

// Update value
count$.next(1) // Output: Count changed: 1
count$.next(2) // Output: Count changed: 2
```

## Operators

Operators are used to transform and combine streams.

### Transformation Operators

#### map - Map Values

```tsx
const [count, count$] = usePipel(1)

const doubled = useObservable(count$.pipe(map((x) => x * 2)))

count$.next(5) // doubled = 10
```

#### filter - Filter Values

```tsx
const [value, value$] = usePipel(0)

const positiveOnly = useObservable(value$.pipe(filter((x) => x > 0)))

value$.next(-1) // positiveOnly unchanged
value$.next(5) // positiveOnly = 5
```

### Time-based Operators

#### debounce - Debounce

```tsx
const [keyword, keyword$] = usePipel('')

const debouncedKeyword = useObservable(
  keyword$.pipe(
    debounce(300) // 300ms debounce
  )
)

// User quickly types "hello"
keyword$.next('h')
keyword$.next('he')
keyword$.next('hel')
keyword$.next('hell')
keyword$.next('hello')
// Only the last value emits after 300ms
```

#### throttle - Throttle

```tsx
const [clicks, clicks$] = usePipel(0)

const throttledClicks = useObservable(
  clicks$.pipe(
    throttle(1000) // Max once per second
  )
)
```

### Combination Operators

#### combineLatest - Combine Latest Values

```tsx
const [firstName, firstName$] = usePipel('John')
const [lastName, lastName$] = usePipel('Doe')

const fullName = useObservable(
  firstName$.pipe(
    combineLatest(lastName$),
    map(([first, last]) => `${first} ${last}`)
  )
)

firstName$.next('Jane') // fullName = "Jane Doe"
lastName$.next('Smith') // fullName = "Jane Smith"
```

#### merge - Merge Multiple Streams

```tsx
const [stream1$] = usePipel(1)
const [stream2$] = usePipel(2)

const merged = useObservable(stream1$.pipe(merge(stream2$)))

stream1$.next(10) // merged = 10
stream2$.next(20) // merged = 20
```

## Data Flow Patterns

### Unidirectional Data Flow

```tsx
function TodoApp() {
  const [todos, todos$] = usePipel([])

  const addTodo = (text) => {
    todos$.next([...todos, { id: Date.now(), text }])
  }

  const removeTodo = (id) => {
    todos$.next(todos.filter((t) => t.id !== id))
  }

  return (
    <div>
      <TodoList todos={todos} onRemove={removeTodo} />
      <AddTodo onAdd={addTodo} />
    </div>
  )
}
```

### Derived State

```tsx
function ShoppingCart() {
  const [items, items$] = usePipel([])

  // Derived: total price
  const total = useObservable(
    items$.pipe(map((items) => items.reduce((sum, item) => sum + item.price, 0)))
  )

  // Derived: item count
  const count = useObservable(items$.pipe(map((items) => items.length)))

  return (
    <div>
      <p>Items: {count}</p>
      <p>Total: ${total}</p>
    </div>
  )
}
```

### Async Data Flow

```tsx
function UserSearch() {
  const [query, query$] = usePipel('')

  const results = useObservable(
    query$.pipe(
      debounce(300),
      filter((q) => q.length > 2),
      switchMap((q) => fetch(`/api/search?q=${q}`).then((r) => r.json()))
    )
  )

  return (
    <div>
      <input value={query} onChange={(e) => query$.next(e.target.value)} />
      <SearchResults results={results} />
    </div>
  )
}
```

## Best Practices

### 1. Keep Streams Stable

```tsx
// ✅ Good: Create outside component
const globalCounter$ = new Stream(0)

function Component() {
  const [count] = usePipel(globalCounter$)
  return <div>{count}</div>
}

// ❌ Avoid: Create new stream on every render
function Component() {
  const stream$ = new Stream(0) // Bad!
  const [count] = usePipel(stream$)
  return <div>{count}</div>
}
```

### 2. Use useCallback for Stable Callbacks

```tsx
function Component() {
  const [value, value$] = usePipel(0)

  const handleChange = useCallback(
    (newValue) => {
      value$.next(newValue)
    },
    [value$]
  )

  return <Child onChange={handleChange} />
}
```

### 3. Avoid Over-subscribing

```tsx
// ✅ Good: Use useObservable
const doubled = useObservable(count$.pipe(map((x) => x * 2)))

// ❌ Avoid: Manual subscription
useEffect(() => {
  const subscription = count$.then((value) => {
    setDoubled(value * 2)
  })
  return () => subscription.unsubscribe()
}, [count$])
```

### 4. Use Operators Wisely

```tsx
// ✅ Good: Chain operators
const result = useObservable(
  stream$.pipe(
    debounce(300),
    filter((x) => x > 0),
    map((x) => x * 2)
  )
)

// ❌ Avoid: Nested subscriptions
const result1 = useObservable(stream$.pipe(debounce(300)))
const result2 = useObservable(result1$.pipe(filter((x) => x > 0)))
const result3 = useObservable(result2$.pipe(map((x) => x * 2)))
```

## Common Patterns

### Form Handling

```tsx
function LoginForm() {
  const [username, username$] = usePipel('')
  const [password, password$] = usePipel('')

  const isValid = useObservable(
    username$.pipe(
      combineLatest(password$),
      map(([u, p]) => u.length > 0 && p.length >= 6)
    )
  )

  const handleSubmit = () => {
    if (isValid) {
      // Submit form
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input value={username} onChange={(e) => username$.next(e.target.value)} />
      <input type="password" value={password} onChange={(e) => password$.next(e.target.value)} />
      <button disabled={!isValid}>Login</button>
    </form>
  )
}
```

### Live Search

```tsx
function LiveSearch() {
  const [query, query$] = usePipel('')

  const { data: results, loading } = useFetch(
    query$.pipe(
      debounce(300),
      filter((q) => q.length > 2),
      map((q) => `/api/search?q=${q}`)
    ),
    { immediate: false }
  )

  return (
    <div>
      <input value={query} onChange={(e) => query$.next(e.target.value)} placeholder="Search..." />
      {loading && <Spinner />}
      <ResultList results={results} />
    </div>
  )
}
```

### Infinite Scroll

```tsx
function InfiniteList() {
  const [page, page$] = usePipel(1)

  const { data, loading } = useFetch(page$.pipe(map((p) => `/api/items?page=${p}`)), {
    immediate: true,
  })

  const loadMore = () => {
    page$.next(page + 1)
  }

  return (
    <div>
      <ItemList items={data?.items || []} />
      {loading && <Spinner />}
      <button onClick={loadMore}>Load More</button>
    </div>
  )
}
```

## Next Steps

- [Stream Rendering](/guide/render) - Learn about rendering optimization
- [Immutable Updates](/guide/immutable) - Best practices for state updates
- [Debugging](/guide/debug) - Debug reactive applications
