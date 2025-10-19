# API 参考

Pipel-React 提供了一套完整的 React Hooks 和工具函数，用于响应式流编程。

## 核心 Hooks

### 状态管理

- [usePipel](/cn/core/usePipel/index.cn) - 将 Stream/Observable 转换为 React 状态
- [useStream](/cn/core/useStream/index.cn) - 创建稳定的 Stream 实例
- [useObservable](/cn/core/useObservable/index.cn) - 订阅 Observable 并获取当前值
- [useSyncState](/cn/core/useSyncState/index.cn) - 状态与 Stream 的双向同步

### 副作用

- [effect$](/cn/core/effect$/index.cn) - Stream 发出值时执行副作用
- [to$](/cn/core/to$/index.cn) - 将状态设置函数转换为 Stream

### 渲染

- [usePipelRender](/cn/core/usePipelRender/index.cn) - Stream 发出值时渲染组件

## Stream 工厂函数

- [asyncStream$](/cn/core/asyncStream$/index.cn) - 创建带加载/错误状态的异步 Stream
- [persistStream$](/cn/core/persistStream$/index.cn) - 创建持久化到 localStorage 的 Stream
- [computedStream$](/cn/core/computedStream$/index.cn) - 从依赖创建计算 Stream
- [batch$](/cn/core/batch$/index.cn) - 批量创建多个 Stream
- [fromEvent](/cn/core/fromEvent/index.cn) - 从 DOM 事件创建 Stream

## HTTP 工具

- [useFetch](/cn/core/useFetch/index.cn) - 声明式数据获取，自动状态管理
- [createFetch](/cn/core/createFetch/index.cn) - 创建可复用的 fetch 配置

## 调试工具

- [debug](/cn/core/debug/index.cn) - Stream 检查调试工具

## 快速示例

### 基础状态管理

```tsx
import { usePipel } from 'pipel-react'

function Counter() {
  const [count, count$] = usePipel(0)

  return <button onClick={() => count$.next(count + 1)}>计数: {count}</button>
}
```

### 数据获取

```tsx
import { useFetch } from 'pipel-react'

function UserProfile({ userId }) {
  const { data, loading, error } = useFetch(`/api/users/${userId}`, {
    immediate: true,
  })

  if (loading) return <div>加载中...</div>
  if (error) return <div>错误: {error.message}</div>

  return <div>你好，{data.name}！</div>
}
```

### Stream 组合

```tsx
import { usePipel, useObservable } from 'pipel-react'

function SearchBox() {
  const [keyword, keyword$] = usePipel('')

  const results = useObservable(
    keyword$.pipe(
      debounce(300),
      filter((k) => k.length > 2),
      map((k) => fetchResults(k))
    )
  )

  return (
    <div>
      <input value={keyword} onChange={(e) => keyword$.next(e.target.value)} />
      <Results data={results} />
    </div>
  )
}
```

### 持久化状态

```tsx
import { persistStream$ } from 'pipel-react'

// 在组件外部创建
const theme$ = persistStream$('app-theme', 'light')

function ThemeToggle() {
  const [theme] = usePipel(theme$)

  return (
    <button onClick={() => theme$.next(theme === 'light' ? 'dark' : 'light')}>
      当前主题: {theme}
    </button>
  )
}
```

### 异步操作

```tsx
import { asyncStream$ } from 'pipel-react'

function UserList() {
  const fetchUsers = async () => {
    const res = await fetch('/api/users')
    return res.json()
  }

  const { data$, loading$, error$, execute } = asyncStream$(fetchUsers)

  const [users] = usePipel(data$)
  const [loading] = usePipel(loading$)
  const [error] = usePipel(error$)

  useEffect(() => {
    execute()
  }, [])

  if (loading) return <Loading />
  if (error) return <Error error={error} />

  return <UserList users={users} />
}
```

### 事件处理

```tsx
import { useWindowEvent } from 'pipel-react'

function ScrollIndicator() {
  const scroll$ = useWindowEvent('scroll')
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const child = scroll$.then(() => {
      setScrollY(window.scrollY)
    })
    return () => child.unsubscribe()
  }, [scroll$])

  const progress = (scrollY / (document.body.scrollHeight - window.innerHeight)) * 100

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        width: `${progress}%`,
        height: '4px',
        background: 'blue',
      }}
    />
  )
}
```

### 表单验证

```tsx
import { batch$ } from 'pipel-react'
import { debounce, map } from 'pipeljs'

function SignupForm() {
  const fields = batch$({
    username: '',
    email: '',
    password: '',
  })

  const errors = batch$({
    username: '',
    email: '',
    password: '',
  })

  // 用户名验证
  useEffect(() => {
    const child = fields.username
      .pipe(
        debounce(300),
        map((value) => {
          if (value.length < 3) return '用户名至少3个字符'
          return ''
        })
      )
      .then((error) => errors.username.next(error))

    return () => child.unsubscribe()
  }, [])

  const [username] = usePipel(fields.username)
  const [usernameError] = usePipel(errors.username)

  return (
    <div>
      <input value={username} onChange={(e) => fields.username.next(e.target.value)} />
      {usernameError && <span className="error">{usernameError}</span>}
    </div>
  )
}
```

## 类型定义

所有 API 都完全支持 TypeScript 类型。从主包导入类型：

```typescript
import type { Stream, Observable, FetchOptions, FetchResult } from 'pipel-react'
```

## 学习路径

### 1. 新手入门

1. 阅读 [介绍](/cn/guide/introduce.cn) 了解基本概念
2. 跟随 [快速开始](/cn/guide/quick.cn) 创建第一个应用
3. 学习 [usePipel](/cn/core/usePipel/index.cn) 进行基础状态管理

### 2. 进阶使用

1. 理解 [响应式编程](/cn/guide/reactive.cn) 的核心思想
2. 学习 [Stream 操作符](https://pipeljs.github.io/pipeljs/) 进行数据转换
3. 掌握 [asyncStream$](/cn/core/asyncStream$/index.cn) 处理异步操作

### 3. 高级技巧

1. 使用 [persistStream$](/cn/core/persistStream$/index.cn) 实现数据持久化
2. 使用 [batch$](/cn/core/batch$/index.cn) 管理复杂状态
3. 使用 [fromEvent](/cn/core/fromEvent/index.cn) 处理 DOM 事件
4. 阅读 [调试](/cn/guide/debug.cn) 学习调试技巧

## 最佳实践

### 1. 组件外部创建 Stream

```tsx
// ✅ 好：在组件外部创建
const globalCount$ = new Stream(0)

function Counter() {
  const [count] = usePipel(globalCount$)
  return <div>{count}</div>
}
```

### 2. 使用 TypeScript

```tsx
// ✅ 好：明确类型
interface User {
  id: number
  name: string
}

const users$ = useStream<User[]>([])
```

### 3. 清理订阅

```tsx
// ✅ 好：使用 useEffect 清理
useEffect(() => {
  const child = stream$.then(handleValue)
  return () => child.unsubscribe()
}, [stream$])
```

### 4. 使用操作符

```tsx
// ✅ 好：使用操作符处理数据
const filtered$ = items$.pipe(
  filter((item) => item.active),
  map((item) => item.name)
)
```

## 常见问题

### 如何在组件间共享状态？

在组件外部创建 Stream，然后在多个组件中使用：

```tsx
// shared.ts
export const count$ = new Stream(0)

// ComponentA.tsx
function ComponentA() {
  const [count] = usePipel(count$)
  return <div>{count}</div>
}

// ComponentB.tsx
function ComponentB() {
  return <button onClick={() => count$.next(count$.value + 1)}>增加</button>
}
```

### 如何处理异步数据？

使用 `asyncStream$` 或 `useFetch`：

```tsx
// 方式 1: asyncStream$
const { data$, loading$, execute } = asyncStream$(fetchData)

// 方式 2: useFetch
const { data, loading, error } = useFetch('/api/data')
```

### 如何持久化数据？

使用 `persistStream$`：

```tsx
const settings$ = persistStream$('app-settings', {
  theme: 'light',
  language: 'zh-CN',
})
```

### 如何调试 Stream？

使用调试工具：

```tsx
import { consoleNode } from 'pipeljs'

stream$.use(consoleNode('my-stream'))
```

## 相关资源

- [PipelJS 文档](https://pipeljs.github.io/pipeljs/) - 核心库文档
- [GitHub 仓库](https://github.com/pipeljs/pipel-react) - 源代码和问题追踪
- [示例项目](https://github.com/pipeljs/pipel-react/tree/main/examples) - 完整示例
