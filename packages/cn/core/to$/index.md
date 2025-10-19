# to$

将状态设置函数转换为 Stream，实现从外部源的响应式更新。

## 签名

```typescript
function to$<T>(setState: Dispatch<SetStateAction<T>>): Stream<T>
```

## 参数

| 参数       | 类型                          | 说明                                |
| ---------- | ----------------------------- | ----------------------------------- |
| `setState` | `Dispatch<SetStateAction<T>>` | 来自 useState 的 React 状态设置函数 |

## 返回值

返回一个 `Stream<T>`，当它发出值时会更新状态。

## 基础用法

### 将状态设置器转换为 Stream

```tsx
import { to$ } from 'pipel-react'
import { useState } from 'react'

function Counter() {
  const [count, setCount] = useState(0)
  const count$ = to$(setCount)

  return (
    <div>
      <p>计数: {count}</p>
      <button onClick={() => count$.next(count + 1)}>增加</button>
    </div>
  )
}
```

### 连接外部 Stream 到状态

```tsx
import { to$ } from 'pipel-react'
import { useState, useEffect } from 'react'

// 外部 stream
const globalEvents$ = new Stream()

function EventListener() {
  const [events, setEvents] = useState([])
  const events$ = to$(setEvents)

  useEffect(() => {
    const child = globalEvents$.then((event) => {
      events$.next([...events, event])
    })
    return () => child.unsubscribe()
  }, [])

  return <EventList events={events} />
}
```

## 高级用法

### 配合 Stream 操作符

```tsx
import { to$ } from 'pipel-react'
import { useState } from 'react'
import { debounce, filter } from 'pipeljs'

function SearchBox() {
  const [keyword, setKeyword] = useState('')
  const [results, setResults] = useState([])

  const keyword$ = to$(setKeyword)
  const results$ = to$(setResults)

  useEffect(() => {
    const child = keyword$
      .pipe(
        debounce(300),
        filter((k) => k.length > 2),
        map((k) => fetchResults(k))
      )
      .then((data) => results$.next(data))

    return () => child.unsubscribe()
  }, [])

  return (
    <div>
      <input onChange={(e) => keyword$.next(e.target.value)} />
      <Results data={results} />
    </div>
  )
}
```

### 双向同步

```tsx
import { to$ } from 'pipel-react'
import { useState, useEffect } from 'react'

function SyncedInput({ value$: externalValue$ }) {
  const [value, setValue] = useState('')
  const value$ = to$(setValue)

  // 将外部 stream 同步到本地状态
  useEffect(() => {
    const child = externalValue$.then((v) => value$.next(v))
    return () => child.unsubscribe()
  }, [])

  // 将本地更改同步到外部 stream
  const handleChange = (e) => {
    const newValue = e.target.value
    value$.next(newValue)
    externalValue$.next(newValue)
  }

  return <input value={value} onChange={handleChange} />
}
```

### 多个状态更新

```tsx
import { to$ } from 'pipel-react'
import { useState } from 'react'

function Form() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  const name$ = to$(setName)
  const email$ = to$(setEmail)

  const handleSubmit = () => {
    // 两个 stream 可以独立使用
    console.log('姓名:', name$.value)
    console.log('邮箱:', email$.value)
  }

  return (
    <form onSubmit={handleSubmit}>
      <input onChange={(e) => name$.next(e.target.value)} />
      <input onChange={(e) => email$.next(e.target.value)} />
      <button type="submit">提交</button>
    </form>
  )
}
```

## 特性

- ✅ 将状态设置器转换为 Stream
- ✅ 启用响应式状态更新
- ✅ 支持所有 Stream 操作符
- ✅ 支持函数式更新
- ✅ TypeScript 类型安全
- ✅ 不会产生额外的重新渲染

## 注意事项

1. 返回的 Stream 在发出值时会调用 `setState`
2. 支持直接值和函数式更新
3. 不会产生超出正常 `setState` 的额外重新渲染
4. Stream 引用在重新渲染时保持稳定
5. 适用于将外部 stream 连接到 React 状态

## 与 useSyncState 的对比

| 特性     | to$       | useSyncState               |
| -------- | --------- | -------------------------- |
| 返回值   | 仅 Stream | [state, setState, stream$] |
| 双向同步 | 手动      | 自动                       |
| 使用场景 | 单向同步  | 双向同步                   |
| 复杂度   | 简单      | 更多功能                   |

## 相关链接

- [useSyncState](/cn/core/useSyncState/index.cn) - 双向状态-stream 同步
- [usePipel](/cn/core/usePipel/index.cn) - 创建带状态的 Stream
- [useStream](/cn/core/useStream/index.cn) - 创建稳定的 Stream
