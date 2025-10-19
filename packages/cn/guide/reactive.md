# 响应式编程

## 什么是响应式编程？

响应式编程是一种**以数据流为中心**的编程范式。在响应式编程中，数据的变化会自动传播到所有依赖它的地方。

### 传统编程 vs 响应式编程

**传统编程（命令式）：**

```tsx
let a = 1
let b = 2
let c = a + b // c = 3

a = 10
// c 仍然是 3，不会自动更新
```

**响应式编程（声明式）：**

```tsx
import { usePipel, useObservable } from 'pipel-react'
import { combine, map } from 'pipeljs'

const [a, a$] = usePipel(1)
const [b, b$] = usePipel(2)

const c = useObservable(
  a$.pipe(
    combine(b$),
    map(([a, b]) => a + b)
  )
)

a$.next(10)
// c 自动更新为 12
```

## Stream（流）

Stream 是 Pipel-React 的核心概念，它代表**随时间变化的值序列**。

### Stream 的特点

1. **持续性** - 可以发出多个值
2. **可订阅** - 可以监听值的变化
3. **可组合** - 可以通过操作符组合和转换

### 创建 Stream

```tsx
import { usePipel, useStream } from 'pipel-react'

// 方式 1：通过 usePipel 创建
const [count, count$] = usePipel(0)

// 方式 2：通过 useStream 创建
const count$ = useStream(0)

// 方式 3：从 Promise 创建
const data$ = useStream(fetch('/api/data'))
```

### 订阅 Stream

```tsx
const [count, count$] = usePipel(0)

// 订阅变化
count$.then((value) => {
  console.log('Count changed:', value)
})

// 更新值
count$.next(1) // 输出: Count changed: 1
count$.next(2) // 输出: Count changed: 2
```

## 操作符（Operators）

操作符用于转换和组合 Stream。

### 转换操作符

#### map - 映射值

```tsx
const [count, count$] = usePipel(1)

const doubled = useObservable(count$.pipe(map((x) => x * 2)))

count$.next(5) // doubled = 10
```

#### filter - 过滤值

```tsx
const [value, value$] = usePipel(0)

const positiveOnly = useObservable(value$.pipe(filter((x) => x > 0)))

value$.next(-1) // positiveOnly 不变
value$.next(5) // positiveOnly = 5
```

### 时间操作符

#### debounce - 防抖

```tsx
const [keyword, keyword$] = usePipel('')

const debouncedKeyword = useObservable(
  keyword$.pipe(
    debounce(300) // 300ms 防抖
  )
)

// 用户快速输入 "hello"
keyword$.next('h')
keyword$.next('he')
keyword$.next('hel')
keyword$.next('hell')
keyword$.next('hello')
// 只有最后一个值在 300ms 后发出
```

#### throttle - 节流

```tsx
const [clicks, clicks$] = usePipel(0)

const throttledClicks = useObservable(
  clicks$.pipe(
    throttle(1000) // 每秒最多一次
  )
)
```

### 组合操作符

#### combine - 组合最新值

```tsx
import { combine, map } from 'pipeljs'

const [firstName, firstName$] = usePipel('John')
const [lastName, lastName$] = usePipel('Doe')

const fullName = useObservable(
  firstName$.pipe(
    combine(lastName$),
    map(([first, last]) => `${first} ${last}`)
  )
)

firstName$.next('Jane') // fullName = "Jane Doe"
lastName$.next('Smith') // fullName = "Jane Smith"
```

#### merge - 合并多个流

```tsx
const [stream1$] = usePipel(1)
const [stream2$] = usePipel(2)

const merged = useObservable(stream1$.pipe(merge(stream2$)))

stream1$.next(10) // merged = 10
stream2$.next(20) // merged = 20
```

## 数据流模式

### 单向数据流

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

### 派生状态

```tsx
function ShoppingCart() {
  const [items, items$] = usePipel([])

  // 派生：总价
  const total = useObservable(
    items$.pipe(map((items) => items.reduce((sum, item) => sum + item.price, 0)))
  )

  // 派生：商品数量
  const count = useObservable(items$.pipe(map((items) => items.length)))

  return (
    <div>
      <p>商品数量: {count}</p>
      <p>总价: ${total}</p>
    </div>
  )
}
```

### 异步数据流

```tsx
import { debounce, filter } from 'pipeljs'

function UserSearch() {
  const [query, query$] = usePipel('')

  // 使用 useFetch 处理异步请求
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
      <input value={query} onChange={(e) => query$.next(e.target.value)} />
      {loading && <div>搜索中...</div>}
      <SearchResults results={results} />
    </div>
  )
}
```

## 最佳实践

### 1. 保持 Stream 稳定

```tsx
// ✅ 好：在组件外部创建
const globalCounter$ = new Stream(0)

function Component() {
  const [count] = usePipel(globalCounter$)
  return <div>{count}</div>
}

// ❌ 避免：每次渲染都创建新 Stream
function Component() {
  const stream$ = new Stream(0) // 不好！
  const [count] = usePipel(stream$)
  return <div>{count}</div>
}
```

### 2. 使用 useCallback 稳定回调

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

### 3. 避免过度订阅

```tsx
// ✅ 好：使用 useObservable
const doubled = useObservable(count$.pipe(map((x) => x * 2)))

// ❌ 避免：手动订阅
useEffect(() => {
  const subscription = count$.then((value) => {
    setDoubled(value * 2)
  })
  return () => subscription.unsubscribe()
}, [count$])
```

### 4. 合理使用操作符

```tsx
// ✅ 好：链式调用
const result = useObservable(
  stream$.pipe(
    debounce(300),
    filter((x) => x > 0),
    map((x) => x * 2)
  )
)

// ❌ 避免：嵌套订阅
const result1 = useObservable(stream$.pipe(debounce(300)))
const result2 = useObservable(result1$.pipe(filter((x) => x > 0)))
const result3 = useObservable(result2$.pipe(map((x) => x * 2)))
```

## 常见模式

### 表单处理

```tsx
import { combine, map } from 'pipeljs'

function LoginForm() {
  const [username, username$] = usePipel('')
  const [password, password$] = usePipel('')

  const isValid = useObservable(
    username$.pipe(
      combine(password$),
      map(([u, p]) => u.length > 0 && p.length >= 6)
    )
  )

  const handleSubmit = () => {
    if (isValid) {
      // 提交表单
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input value={username} onChange={(e) => username$.next(e.target.value)} />
      <input type="password" value={password} onChange={(e) => password$.next(e.target.value)} />
      <button disabled={!isValid}>登录</button>
    </form>
  )
}
```

### 实时搜索

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
      <input value={query} onChange={(e) => query$.next(e.target.value)} placeholder="搜索..." />
      {loading && <Spinner />}
      <ResultList results={results} />
    </div>
  )
}
```

### 无限滚动

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
      <button onClick={loadMore}>加载更多</button>
    </div>
  )
}
```

## 下一步

- [流式渲染](/guide/render) - 了解渲染优化
- [不可变更新](/guide/immutable) - 学习状态更新最佳实践
- [调试](/guide/debug) - 调试响应式应用
