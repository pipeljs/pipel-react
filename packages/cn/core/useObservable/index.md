# useObservable

订阅 Observable 并将其当前值作为 React 状态返回。

## 签名

```typescript
function useObservable<T>(observable$: Observable<T>, defaultValue?: T): T | undefined
```

## 参数

| 参数           | 类型            | 说明                                 |
| -------------- | --------------- | ------------------------------------ |
| `observable$`  | `Observable<T>` | 要订阅的 Observable                  |
| `defaultValue` | `T`             | 可选的默认值，在第一次发出值之前使用 |

## 返回值

返回 Observable 的当前值，如果还没有发出值则返回 `defaultValue`。

## 基础用法

### 订阅 Observable

```tsx
import { useObservable, useStream } from 'pipel-react'

function Counter() {
  const count$ = useStream(0)
  const count = useObservable(count$, 0)

  return (
    <div>
      <p>计数: {count}</p>
      <button onClick={() => count$.next(count + 1)}>增加</button>
    </div>
  )
}
```

### 使用默认值

```tsx
import { useObservable } from 'pipel-react'

function UserName({ user$ }) {
  const user = useObservable(user$, { name: '访客' })

  return <div>你好，{user.name}！</div>
}
```

## 高级用法

### 配合 Stream 操作符

```tsx
import { useObservable, useStream } from 'pipel-react'
import { map, filter, debounce } from 'pipeljs'

function SearchBox() {
  const keyword$ = useStream('')

  const results = useObservable(
    keyword$.pipe(
      debounce(300),
      filter((k) => k.length > 2),
      map((k) => fetchResults(k))
    ),
    []
  )

  return (
    <div>
      <input onChange={(e) => keyword$.next(e.target.value)} />
      <Results data={results} />
    </div>
  )
}
```

### 多个 Observable

```tsx
import { useObservable, useStream } from 'pipel-react'

function Dashboard() {
  const users$ = useStream([])
  const posts$ = useStream([])

  const users = useObservable(users$, [])
  const posts = useObservable(posts$, [])

  return (
    <div>
      <UserList users={users} />
      <PostList posts={posts} />
    </div>
  )
}
```

### 计算值

```tsx
import { useObservable, useStream } from 'pipel-react'
import { map } from 'pipeljs'

function PriceCalculator() {
  const price$ = useStream(100)
  const quantity$ = useStream(1)

  const total = useObservable(price$.pipe(map((price) => price * quantity$.value)), 0)

  return (
    <div>
      <p>总计: ¥{total}</p>
      <input type="number" onChange={(e) => quantity$.next(Number(e.target.value))} />
    </div>
  )
}
```

## 特性

- ✅ 自动订阅管理
- ✅ 组件卸载时自动清理
- ✅ 支持默认值
- ✅ 支持所有 Observable 类型
- ✅ 立即访问值
- ✅ TypeScript 类型推导

## 注意事项

1. 订阅会自动创建和清理
2. Observable 发出新值时组件会重新渲染
3. 如果 Observable 有当前值，会立即使用
4. 默认值仅在第一次发出值之前使用
5. 组件卸载时订阅会被清理

## 与 usePipel 的对比

| 特性        | useObservable       | usePipel              |
| ----------- | ------------------- | --------------------- |
| 返回值      | 仅值                | [value, stream$] 元组 |
| 创建 Stream | 否                  | 是（如果提供初始值）  |
| 订阅        | 自动                | 自动                  |
| 使用场景    | 订阅现有 Observable | 创建和管理 Stream     |

## 相关链接

- [usePipel](/cn/core/usePipel/index.cn) - 创建带状态同步的 Stream
- [useStream](/cn/core/useStream/index.cn) - 创建稳定的 Stream
- [effect$](/cn/core/effect$/index.cn) - 执行副作用
