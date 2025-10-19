# Stream Rendering

## What is Stream Rendering?

Pipel-React provides powerful stream rendering capabilities. Through the `usePipelRender` hook, you can achieve fine-grained component rendering control, similar to signal-based rendering mechanisms.

## Basic Concepts

Traditional React rendering is component-level: when state changes, the entire component re-renders. Stream rendering enables more fine-grained control, updating only the parts that need to change.

## Using usePipelRender

`usePipelRender` allows you to subscribe to stream changes and return a render function:

```tsx
import { usePipel, usePipelRender } from 'pipel-react'

function Example() {
  const [count, count$] = usePipel(0)

  // Use usePipelRender to subscribe to stream changes
  const renderCount = usePipelRender(count$, (value) => <span>Count: {value}</span>)

  return (
    <div>
      <h1>Stream Rendering Example</h1>
      {renderCount}
      <button onClick={() => count$.next(count + 1)}>Increment</button>
    </div>
  )
}
```

## Performance Optimization

The main advantage of stream rendering is performance optimization. When you have multiple independent data streams, each stream's changes only trigger re-rendering of the corresponding part:

```tsx
import { useStream, usePipelRender } from 'pipel-react'

function Dashboard() {
  const user$ = useStream({ name: 'John', age: 25 })
  const order$ = useStream({ item: 'Book', price: 29.99 })

  // User info rendering
  const renderUser = usePipelRender(user$, (user) => (
    <div className="card">
      <h3>User Info</h3>
      <p>Name: {user.name}</p>
      <p>Age: {user.age}</p>
      <p>Render time: {Date.now()}</p>
    </div>
  ))

  // Order info rendering
  const renderOrder = usePipelRender(order$, (order) => (
    <div className="card">
      <h3>Order Info</h3>
      <p>Item: {order.item}</p>
      <p>Price: ${order.price}</p>
      <p>Render time: {Date.now()}</p>
    </div>
  ))

  return (
    <div>
      <h1>Dashboard</h1>
      <div className="dashboard">
        {renderUser}
        {renderOrder}
      </div>
      <div className="controls">
        <button
          onClick={() =>
            user$.set((v) => {
              v.age += 1
            })
          }
        >
          Increase Age
        </button>
        <button
          onClick={() =>
            order$.set((v) => {
              v.price += 10
            })
          }
        >
          Increase Price
        </button>
      </div>
    </div>
  )
}
```

In the above example:

- Clicking "Increase Age" only re-renders the user info card
- Clicking "Increase Price" only re-renders the order info card
- The main component doesn't re-render

## Comparison with Traditional Rendering

### Traditional useState Approach

```tsx
import { useState } from 'react'

function TraditionalDashboard() {
  const [user, setUser] = useState({ name: 'John', age: 25 })
  const [order, setOrder] = useState({ item: 'Book', price: 29.99 })

  // Any state change causes entire component to re-render
  return (
    <div>
      <h1>Dashboard</h1>
      <p>Component render time: {Date.now()}</p>
      <div className="dashboard">
        <div className="card">
          <h3>User Info</h3>
          <p>Name: {user.name}</p>
          <p>Age: {user.age}</p>
          <p>Render time: {Date.now()}</p>
        </div>
        <div className="card">
          <h3>Order Info</h3>
          <p>Item: {order.item}</p>
          <p>Price: ${order.price}</p>
          <p>Render time: {Date.now()}</p>
        </div>
      </div>
      <div className="controls">
        <button onClick={() => setUser((u) => ({ ...u, age: u.age + 1 }))}>Increase Age</button>
        <button onClick={() => setOrder((o) => ({ ...o, price: o.price + 10 }))}>
          Increase Price
        </button>
      </div>
    </div>
  )
}
```

### pipel-react Stream Rendering Approach

```tsx
import { useStream, usePipelRender } from 'pipel-react'

function StreamDashboard() {
  const user$ = useStream({ name: 'John', age: 25 })
  const order$ = useStream({ item: 'Book', price: 29.99 })

  const renderUser = usePipelRender(user$, (user) => (
    <div className="card">
      <h3>User Info</h3>
      <p>Name: {user.name}</p>
      <p>Age: {user.age}</p>
      <p>Render time: {Date.now()}</p>
    </div>
  ))

  const renderOrder = usePipelRender(order$, (order) => (
    <div className="card">
      <h3>Order Info</h3>
      <p>Item: {order.item}</p>
      <p>Price: ${order.price}</p>
      <p>Render time: {Date.now()}</p>
    </div>
  ))

  // Main component only renders once
  return (
    <div>
      <h1>Dashboard</h1>
      <p>Component render time: {Date.now()}</p>
      <div className="dashboard">
        {renderUser}
        {renderOrder}
      </div>
      <div className="controls">
        <button
          onClick={() =>
            user$.set((v) => {
              v.age += 1
            })
          }
        >
          Increase Age
        </button>
        <button
          onClick={() =>
            order$.set((v) => {
              v.price += 10
            })
          }
        >
          Increase Price
        </button>
      </div>
    </div>
  )
}
```

## Complex Scenarios

### List Rendering

```tsx
import { useStream, usePipelRender } from 'pipel-react'

function TodoList() {
  const todos$ = useStream([
    { id: 1, text: 'Learn React', done: false },
    { id: 2, text: 'Learn pipel-react', done: false },
  ])

  const renderTodos = usePipelRender(todos$, (todos) => (
    <ul>
      {todos.map((todo) => (
        <li key={todo.id}>
          <input
            type="checkbox"
            checked={todo.done}
            onChange={() => {
              todos$.set((list) => {
                const item = list.find((t) => t.id === todo.id)
                if (item) item.done = !item.done
              })
            }}
          />
          <span style={{ textDecoration: todo.done ? 'line-through' : 'none' }}>{todo.text}</span>
        </li>
      ))}
    </ul>
  ))

  return (
    <div>
      <h2>Todo List</h2>
      {renderTodos}
    </div>
  )
}
```

### Conditional Rendering

```tsx
import { usePipel, usePipelRender } from 'pipel-react'

function ConditionalRender() {
  const [isLoggedIn, isLoggedIn$] = usePipel(false)

  const renderContent = usePipelRender(isLoggedIn$, (loggedIn) =>
    loggedIn ? (
      <div>
        <h2>Welcome back!</h2>
        <button onClick={() => isLoggedIn$.next(false)}>Logout</button>
      </div>
    ) : (
      <div>
        <h2>Please login</h2>
        <button onClick={() => isLoggedIn$.next(true)}>Login</button>
      </div>
    )
  )

  return (
    <div>
      <h1>App</h1>
      {renderContent}
    </div>
  )
}
```

### Filtered List Rendering

```tsx
import { useStream, usePipelRender } from 'pipel-react'
import { combine, map } from 'pipeljs'

function FilteredList() {
  const items$ = useStream([
    { id: 1, name: 'Apple', category: 'fruit' },
    { id: 2, name: 'Carrot', category: 'vegetable' },
    { id: 3, name: 'Banana', category: 'fruit' },
  ])

  const filter$ = useStream('all')

  const filteredItems$ = items$.pipe(
    combine(filter$),
    map(([items, filter]) =>
      filter === 'all' ? items : items.filter((item) => item.category === filter)
    )
  )

  const renderList = usePipelRender(filteredItems$, (items) => (
    <ul>
      {items.map((item) => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  ))

  const renderFilter = usePipelRender(filter$, (filter) => (
    <select value={filter} onChange={(e) => filter$.next(e.target.value)}>
      <option value="all">All</option>
      <option value="fruit">Fruits</option>
      <option value="vegetable">Vegetables</option>
    </select>
  ))

  return (
    <div>
      {renderFilter}
      {renderList}
    </div>
  )
}
```

## Async Rendering

### Rendering Async Data

```tsx
import { usePipel } from 'pipel-react'

function AsyncData() {
  const [data, data$] = usePipel(fetch('/api/data').then((r) => r.json()))

  if (!data) return <div>Loading...</div>

  return <div>{data.message}</div>
}
```

### Using useFetch for Async Data

```tsx
import { useFetch } from 'pipel-react'

function UserProfile({ userId }) {
  const { data, loading, error } = useFetch(`/api/users/${userId}`, { immediate: true })

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>
  if (!data) return <div>No data</div>

  return (
    <div>
      <h1>{data.name}</h1>
      <p>{data.email}</p>
    </div>
  )
}
```

### Rendering Multiple Async Data Sources

```tsx
import { useStream, usePipel } from 'pipel-react'

function MultipleAsyncData() {
  const user$ = useStream(fetch('/api/user').then((r) => r.json()))
  const posts$ = useStream(fetch('/api/posts').then((r) => r.json()))

  const [user] = usePipel(user$)
  const [posts] = usePipel(posts$)

  if (!user || !posts) return <div>Loading...</div>

  return (
    <div>
      <h1>{user.name}</h1>
      <PostList posts={posts} />
    </div>
  )
}
```

## Real-time Rendering

### WebSocket Real-time Data Rendering

```tsx
import { fromEvent, usePipel, usePipelRender } from 'pipel-react'
import { useEffect } from 'react'

function LiveChat() {
  const [messages, messages$] = usePipel([])

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8080')

    const message$ = fromEvent(ws, 'message')

    const subscription = message$.then((event) => {
      const newMessage = JSON.parse(event.data)
      messages$.next([...messages, newMessage])
    })

    return () => {
      subscription.unsubscribe()
      ws.close()
    }
  }, [])

  const renderMessages = usePipelRender(messages$, (msgs) => (
    <div className="messages">
      {msgs.map((msg, i) => (
        <div key={i} className="message">
          {msg.text}
        </div>
      ))}
    </div>
  ))

  return (
    <div>
      <h2>Live Chat</h2>
      {renderMessages}
    </div>
  )
}
```

### Polling Data Rendering

```tsx
import { useEffect } from 'react'
import { usePipel, usePipelRender } from 'pipel-react'

function LiveData() {
  const [data, data$] = usePipel(null)

  useEffect(() => {
    // Fetch data immediately
    fetch('/api/data')
      .then((r) => r.json())
      .then((newData) => data$.next(newData))

    // Use setInterval for polling
    const intervalId = setInterval(async () => {
      const newData = await fetch('/api/data').then((r) => r.json())
      data$.next(newData)
    }, 5000)

    return () => clearInterval(intervalId)
  }, [data$])

  const renderData = usePipelRender(data$, (d) =>
    d ? <div>Latest data: {d.value}</div> : <div>Loading...</div>
  )

  return (
    <div>
      <h2>Live Data</h2>
      {renderData}
    </div>
  )
}
```

## Performance Best Practices

### 1. Use Stable Keys for List Rendering

```tsx
// ✅ Good: Use stable keys
{
  items.map((item) => <Item key={item.id} data={item} />)
}

// ❌ Avoid: Use index as key
{
  items.map((item, index) => <Item key={index} data={item} />)
}
```

### 2. Split Large Components

```tsx
// ✅ Good: Split into smaller components, each subscribes to its own stream
function TodoApp() {
  const todos$ = useStream([])

  return (
    <div>
      <TodoList todos$={todos$} />
      <TodoStats todos$={todos$} />
      <TodoFilters />
    </div>
  )
}

function TodoList({ todos$ }) {
  const renderList = usePipelRender(todos$, (todos) => (
    <ul>
      {todos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </ul>
  ))

  return renderList
}

// ❌ Avoid: All logic in one component
function TodoApp() {
  const [todos, setTodos] = useState([])
  // Lots of state and logic...
  return <div>{/* Lots of JSX... */}</div>
}
```

### 3. Use change Operator to Avoid Duplicate Renders

```tsx
import { debounce, filter, change } from 'pipeljs'
import { usePipel, useObservable } from 'pipel-react'

function SearchResults() {
  const [query, query$] = usePipel('')

  // Only search when query actually changes
  const searchQuery$ = query$.pipe(
    debounce(300),
    change(), // Avoid triggering search with same value
    filter((q) => q.length > 2)
  )

  const { data: results, loading } = useFetch(searchQuery$.pipe(map((q) => `/api/search?q=${q}`)), {
    immediate: false,
  })

  return (
    <div>
      <input value={query} onChange={(e) => query$.next(e.target.value)} />
      {loading && <div>Searching...</div>}
      <ResultList results={results} />
    </div>
  )
}
```

### 4. Use useMemo for Expensive Calculations

```tsx
import { useMemo } from 'react'
import { usePipel } from 'pipel-react'

function ExpensiveComponent() {
  const [data, data$] = usePipel(largeDataSet)

  const processedData = useMemo(() => {
    return data.map((item) => expensiveOperation(item))
  }, [data])

  return <DataView data={processedData} />
}
```

### 5. Lazy Render Non-critical Content

```tsx
import { lazy, Suspense } from 'react'

const HeavyComponent = lazy(() => import('./HeavyComponent'))

function App() {
  return (
    <div>
      <Header />
      <MainContent />
      <Suspense fallback={<div>Loading...</div>}>
        <HeavyComponent />
      </Suspense>
    </div>
  )
}
```

## Best Practices

1. **Use Cases**: Use stream rendering when you have multiple independent data streams and want their changes to not affect each other
2. **Performance**: For frequently updated data, stream rendering can significantly improve performance
3. **Code Organization**: Organize related data and rendering logic together for better maintainability
4. **Avoid Overuse**: For simple scenarios, traditional useState might be simpler and more straightforward

## Notes

- Stream-rendered components automatically update when stream values change
- Subscriptions are automatically cleaned up when components unmount, no manual cleanup needed
- Render functions should be pure functions, avoid side effects
- For complex rendering logic, consider using `useMemo` for optimization
- `usePipelRender` returns React elements that can be used directly in JSX

## Next Steps

- [Immutable Updates](/guide/immutable) - Learn how to update state correctly
- [Debugging](/guide/debug) - Debug rendering issues
- [API Reference](/core/usePipelRender/) - Learn about rendering APIs
