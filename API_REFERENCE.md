# Pipel-React API 参考

完整的 API 列表和快速参考。

## 📚 目录

- [核心 Hooks](#核心-hooks)
- [高级功能](#高级功能)
- [调试工具](#调试工具)
- [HTTP 功能](#http-功能)
- [操作符](#操作符)

---

## 核心 Hooks

### usePipel

创建响应式流并返回 React 状态。

```tsx
const [value, stream$] = usePipel(initialValue)
```

**示例：**
```tsx
const [count, count$] = usePipel(0)
count$.next(count + 1) // 更新值
```

### useStream

创建稳定的流实例。

```tsx
const stream$ = useStream(initialValue)
```

### useObservable

订阅流并返回当前值。

```tsx
const value = useObservable(stream$)
const value = useObservable(stream$, callback)
```

### to$

将 React State 转换为流。

```tsx
const [state, setState] = useState(0)
const stream$ = to$(state, setState)
```

### effect$

创建副作用流。

```tsx
const render = effect$(() => {
  // 副作用代码
  return <div>...</div>
})
```

### useSyncState

双向同步 State 和 Stream。

```tsx
const [state, setState] = useState(0)
const stream$ = new Stream(0)
useSyncState(state, setState, stream$)
```

### usePipelRender

流式渲染组件。

```tsx
const Component = usePipelRender(stream$, (value) => (
  <div>{value}</div>
))
```

### persistStream$

持久化流到 localStorage。

```tsx
persistStream$('key', stream$, options)
```

---

## 高级功能

### computedStream$

创建计算流。

```tsx
const result$ = computedStream$(() => a$.value + b$.value)
```

### useComputedStream$

Hook 版本的计算流。

```tsx
const result$ = useComputedStream$(
  () => a + b,
  [a, b]
)
```

### fromEvent

从 DOM 事件创建流。

```tsx
const click$ = fromEvent(element, 'click')
```

### useFromEvent

Hook 版本的事件流。

```tsx
const click$ = useFromEvent(buttonRef, 'click')
```

### useWindowEvent

Window 事件流。

```tsx
const resize$ = useWindowEvent('resize')
```

### useDocumentEvent

Document 事件流。

```tsx
const click$ = useDocumentEvent('click')
```

### asyncStream$

创建异步流。

```tsx
const { data$, loading$, error$, execute } = asyncStream$(asyncFn)
```

### useAsyncStream$

Hook 版本的异步流。

```tsx
const { data$, loading$, error$, execute } = useAsyncStream$(asyncFn)
```

### useAsyncStreamAuto$

自动执行的异步流。

```tsx
const { data$, loading$, error$ } = useAsyncStreamAuto$(asyncFn, [arg1, arg2])
```

### batch$

批量创建流。

```tsx
const streams = batch$({
  count: 0,
  name: 'John',
  isActive: true
})
```

### createStreams

类型推断版本的批量创建。

```tsx
const { count$, name$, isActive$ } = createStreams({
  count$: 0,
  name$: 'John',
  isActive$: true
})
```

### batchWithFactory

使用工厂函数批量创建。

```tsx
const streams = batchWithFactory(
  ['a', 'b', 'c'],
  (key) => initialValues[key]
)
```

### combineStreams

合并多个流。

```tsx
const combined$ = combineStreams({ count$, name$ })
```

---

## 调试工具

### debug$

添加调试日志。

```tsx
debug$(stream$, 'MyStream')
debug$(stream$, 'MyStream', { logValues: true })
```

### logStream$

记录流值。

```tsx
const unsubscribe = logStream$(stream$, 'MyStream')
```

### trace$

追踪生命周期。

```tsx
trace$(stream$, 'MyStream')
```

### inspect$

创建流检查器。

```tsx
const inspector = inspect$(stream$)
inspector.getHistory()
inspector.getSubscriberCount()
inspector.getCurrentValue()
inspector.clear()
```

### performanceMonitor$

性能监控。

```tsx
const perf = performanceMonitor$(stream$, 'MyStream')
perf.getStats()
perf.log()
perf.reset()
```

### createDebugPlugin

创建自定义调试插件。

```tsx
const plugin = createDebugPlugin({
  label: 'MyStream',
  logValues: true,
  logSubscriptions: true,
  logErrors: true,
  logger: console.log
})
stream$.use(plugin)
```

---

## HTTP 功能

### useFetch

HTTP 请求 Hook。

```tsx
const { data, loading, error, refetch } = useFetch(url, options)
```

**选项：**
```tsx
{
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  headers: {},
  body: {},
  immediate: true,
  refetchOnWindowFocus: false,
  refetchInterval: 0,
  retry: 0,
  retryDelay: 1000,
  timeout: 0,
  onSuccess: (data) => {},
  onError: (error) => {},
  beforeFetch: (ctx) => ctx,
  afterFetch: (ctx) => ctx
}
```

### createFetch

创建自定义 Fetch 实例。

```tsx
const useMyFetch = createFetch({
  baseUrl: 'https://api.example.com',
  options: {
    headers: {
      'Authorization': 'Bearer token'
    }
  }
})
```

---

## 操作符

从 `pipeljs` 重新导出的操作符。

### 转换操作符

```tsx
stream$.pipe(
  map(x => x * 2),
  filter(x => x > 10),
  distinctUntilChanged(),
  scan((acc, val) => acc + val, 0),
  reduce((acc, val) => acc + val, 0)
)
```

### 过滤操作符

```tsx
stream$.pipe(
  filter(x => x > 0),
  take(5),
  skip(2),
  distinctUntilChanged(),
  every(x => x > 0),
  some(x => x > 10),
  find(x => x === 5),
  findIndex(x => x === 5)
)
```

### 组合操作符

```tsx
stream$.pipe(
  merge(other$),
  concat(other$),
  switchMap(x => fetch(x)),
  mergeMap(x => fetch(x)),
  promiseAll(other$),
  promiseRace(other$)
)
```

### 时间操作符

```tsx
stream$.pipe(
  debounce(300),
  throttle(1000),
  delay(500),
  timeout(3000)
)
```

### 错误处理

```tsx
stream$.pipe(
  catchError(err => of(defaultValue)),
  retry(3)
)
```

### 工具操作符

```tsx
stream$.pipe(
  tap(x => console.log(x)),
  share(),
  startWith(0),
  endWith(100),
  defaultIfEmpty(0)
)
```

---

## 类型定义

### Stream

```typescript
class Stream<T> {
  value: T
  next(value: T): void
  complete(): void
  then(onFulfilled: (value: T) => void): Subscription
  pipe<R>(...operators: OperatorFunction<T, R>[]): Stream<R>
  use(plugin: Plugin): Stream<T>
  afterSetValue(callback: (value: T) => void): void
  afterUnsubscribe(callback: () => void): void
}
```

### Observable

```typescript
class Observable<T> {
  value: T | undefined
  then(onFulfilled: (value: T) => void): Subscription
  pipe<R>(...operators: OperatorFunction<T, R>[]): Observable<R>
}
```

### Subscription

```typescript
interface Subscription {
  unsubscribe(): void
}
```

### OperatorFunction

```typescript
type OperatorFunction<T, R> = (source: Observable<T>) => Observable<R>
```

---

## 快速示例

### 基础计数器

```tsx
import { usePipel } from 'pipel-react'

function Counter() {
  const [count, count$] = usePipel(0)
  
  return (
    <div>
      <div>Count: {count}</div>
      <button onClick={() => count$.next(count + 1)}>+</button>
    </div>
  )
}
```

### 搜索防抖

```tsx
import { usePipel, useObservable } from 'pipel-react'
import { debounce, map } from 'pipeljs'

function Search() {
  const [keyword, keyword$] = usePipel('')
  
  const results = useObservable(
    keyword$.pipe(
      debounce(300),
      map(k => fetchResults(k))
    )
  )
  
  return (
    <input 
      value={keyword}
      onChange={e => keyword$.next(e.target.value)}
    />
  )
}
```

### HTTP 请求

```tsx
import { useFetch } from 'pipel-react'

function UserList() {
  const { data, loading, error } = useFetch('/api/users')
  
  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>
  
  return (
    <ul>
      {data?.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  )
}
```

### 事件流

```tsx
import { useFromEvent, useObservable } from 'pipel-react'
import { useRef } from 'react'

function Button() {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const click$ = useFromEvent(buttonRef, 'click')
  
  useObservable(click$, (event) => {
    console.log('Clicked!', event)
  })
  
  return <button ref={buttonRef}>Click me</button>
}
```

### 异步流

```tsx
import { useAsyncStream$, useObservable } from 'pipel-react'

function UserProfile({ userId }: { userId: number }) {
  const { data$, loading$, execute } = useAsyncStream$(
    async (id: number) => {
      const res = await fetch(`/api/users/${id}`)
      return res.json()
    }
  )
  
  const user = useObservable(data$)
  const loading = useObservable(loading$)
  
  useEffect(() => {
    execute(userId)
  }, [userId, execute])
  
  if (loading) return <div>Loading...</div>
  if (!user) return null
  
  return <div>{user.name}</div>
}
```

---

## 更多资源

- [完整文档](./packages/guide/index.cn.md)
- [GitHub](https://github.com/pipeljs/pipel-react)
- [PipelJS 核心库](https://github.com/pipeljs/pipel)
