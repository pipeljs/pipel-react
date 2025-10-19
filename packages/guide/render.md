# Stream Rendering

pipel-react provides powerful stream rendering capabilities. Through the `usePipelRender` hook, you can achieve fine-grained component rendering control, similar to signal-based rendering mechanisms.

## Basic Concept

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

In the example above:

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

  // Any state change causes the entire component to re-render
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

  // Main component renders only once
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
      <h1>Application</h1>
      {renderContent}
    </div>
  )
}
```

## Best Practices

1. **Use Cases**: Use when you have multiple independent data streams and want their changes to not affect each other
2. **Performance**: For frequently updated data, stream rendering can significantly improve performance
3. **Code Organization**: Organize related data and rendering logic together for better maintainability
4. **Avoid Overuse**: For simple scenarios, traditional useState might be simpler and more straightforward

## Notes

- Stream-rendered components automatically update when stream values change
- Subscriptions are automatically cleaned up when components unmount
- Render functions should be pure functions, avoiding side effects
- For complex rendering logic, consider using `useMemo` for optimization
