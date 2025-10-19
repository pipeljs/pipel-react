# 流式渲染

pipel-react 提供了强大的流式渲染能力，通过 `usePipelRender` hook 可以实现细粒度的组件渲染控制，类似于 signal 的渲染机制。

## 基本概念

传统的 React 渲染是组件级别的：当状态改变时，整个组件会重新渲染。而流式渲染可以实现更细粒度的控制，只更新需要变化的部分。

## 使用 usePipelRender

`usePipelRender` 允许你订阅流的变化并返回渲染函数：

```tsx
import { usePipel, usePipelRender } from 'pipel-react'

function Example() {
  const [count, count$] = usePipel(0)

  // 使用 usePipelRender 订阅流的变化
  const renderCount = usePipelRender(count$, (value) => <span>Count: {value}</span>)

  return (
    <div>
      <h1>流式渲染示例</h1>
      {renderCount}
      <button onClick={() => count$.next(count + 1)}>增加</button>
    </div>
  )
}
```

## 性能优化

流式渲染的主要优势在于性能优化。当你有多个独立的数据流时，每个流的变化只会触发对应部分的重新渲染：

```tsx
import { useStream, usePipelRender } from 'pipel-react'

function Dashboard() {
  const user$ = useStream({ name: 'John', age: 25 })
  const order$ = useStream({ item: 'Book', price: 29.99 })

  // 用户信息渲染
  const renderUser = usePipelRender(user$, (user) => (
    <div className="card">
      <h3>用户信息</h3>
      <p>姓名: {user.name}</p>
      <p>年龄: {user.age}</p>
      <p>渲染时间: {Date.now()}</p>
    </div>
  ))

  // 订单信息渲染
  const renderOrder = usePipelRender(order$, (order) => (
    <div className="card">
      <h3>订单信息</h3>
      <p>商品: {order.item}</p>
      <p>价格: ${order.price}</p>
      <p>渲染时间: {Date.now()}</p>
    </div>
  ))

  return (
    <div>
      <h1>仪表盘</h1>
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
          增加年龄
        </button>
        <button
          onClick={() =>
            order$.set((v) => {
              v.price += 10
            })
          }
        >
          增加价格
        </button>
      </div>
    </div>
  )
}
```

在上面的例子中：

- 点击"增加年龄"只会重新渲染用户信息卡片
- 点击"增加价格"只会重新渲染订单信息卡片
- 主组件不会重新渲染

## 对比传统渲染

### 传统 useState 方式

```tsx
import { useState } from 'react'

function TraditionalDashboard() {
  const [user, setUser] = useState({ name: 'John', age: 25 })
  const [order, setOrder] = useState({ item: 'Book', price: 29.99 })

  // 任何状态变化都会导致整个组件重新渲染
  return (
    <div>
      <h1>仪表盘</h1>
      <p>组件渲染时间: {Date.now()}</p>
      <div className="dashboard">
        <div className="card">
          <h3>用户信息</h3>
          <p>姓名: {user.name}</p>
          <p>年龄: {user.age}</p>
          <p>渲染时间: {Date.now()}</p>
        </div>
        <div className="card">
          <h3>订单信息</h3>
          <p>商品: {order.item}</p>
          <p>价格: ${order.price}</p>
          <p>渲染时间: {Date.now()}</p>
        </div>
      </div>
      <div className="controls">
        <button onClick={() => setUser((u) => ({ ...u, age: u.age + 1 }))}>增加年龄</button>
        <button onClick={() => setOrder((o) => ({ ...o, price: o.price + 10 }))}>增加价格</button>
      </div>
    </div>
  )
}
```

### pipel-react 流式渲染方式

```tsx
import { useStream, usePipelRender } from 'pipel-react'

function StreamDashboard() {
  const user$ = useStream({ name: 'John', age: 25 })
  const order$ = useStream({ item: 'Book', price: 29.99 })

  const renderUser = usePipelRender(user$, (user) => (
    <div className="card">
      <h3>用户信息</h3>
      <p>姓名: {user.name}</p>
      <p>年龄: {user.age}</p>
      <p>渲染时间: {Date.now()}</p>
    </div>
  ))

  const renderOrder = usePipelRender(order$, (order) => (
    <div className="card">
      <h3>订单信息</h3>
      <p>商品: {order.item}</p>
      <p>价格: ${order.price}</p>
      <p>渲染时间: {Date.now()}</p>
    </div>
  ))

  // 主组件只渲染一次
  return (
    <div>
      <h1>仪表盘</h1>
      <p>组件渲染时间: {Date.now()}</p>
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
          增加年龄
        </button>
        <button
          onClick={() =>
            order$.set((v) => {
              v.price += 10
            })
          }
        >
          增加价格
        </button>
      </div>
    </div>
  )
}
```

## 复杂场景

### 列表渲染

```tsx
import { useStream, usePipelRender } from 'pipel-react'

function TodoList() {
  const todos$ = useStream([
    { id: 1, text: '学习 React', done: false },
    { id: 2, text: '学习 pipel-react', done: false },
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
      <h2>待办事项</h2>
      {renderTodos}
    </div>
  )
}
```

### 条件渲染

```tsx
import { usePipel, usePipelRender } from 'pipel-react'

function ConditionalRender() {
  const [isLoggedIn, isLoggedIn$] = usePipel(false)

  const renderContent = usePipelRender(isLoggedIn$, (loggedIn) =>
    loggedIn ? (
      <div>
        <h2>欢迎回来！</h2>
        <button onClick={() => isLoggedIn$.next(false)}>登出</button>
      </div>
    ) : (
      <div>
        <h2>请登录</h2>
        <button onClick={() => isLoggedIn$.next(true)}>登录</button>
      </div>
    )
  )

  return (
    <div>
      <h1>应用</h1>
      {renderContent}
    </div>
  )
}
```

## 最佳实践

1. **适用场景**：当你有多个独立的数据流，且希望它们的变化不互相影响时使用
2. **性能考虑**：对于频繁更新的数据，使用流式渲染可以显著提升性能
3. **代码组织**：将相关的数据和渲染逻辑组织在一起，提高代码可维护性
4. **避免过度使用**：对于简单的场景，传统的 useState 可能更简单直接

## 注意事项

- 流式渲染的组件会在流的值变化时自动更新
- 组件卸载时会自动取消订阅，无需手动清理
- 渲染函数应该是纯函数，避免副作用
- 对于复杂的渲染逻辑，考虑使用 `useMemo` 优化
