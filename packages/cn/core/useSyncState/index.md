# useSyncState

创建一个与 Stream 双向同步的 React 状态。

## 签名

```typescript
function useSyncState<T>(initialValue: T): [T, Dispatch<SetStateAction<T>>, Stream<T>]

function useSyncState<T>(stream$: Stream<T>): [T, Dispatch<SetStateAction<T>>, Stream<T>]
```

## 参数

| 参数           | 类型        | 说明               |
| -------------- | ----------- | ------------------ |
| `initialValue` | `T`         | 初始值             |
| `stream$`      | `Stream<T>` | 现有的 Stream 实例 |

## 返回值

返回一个元组 `[state, setState, stream$]`：

| 索引 | 类型                          | 说明               |
| ---- | ----------------------------- | ------------------ |
| `0`  | `T`                           | 当前状态值         |
| `1`  | `Dispatch<SetStateAction<T>>` | 状态设置函数       |
| `2`  | `Stream<T>`                   | 同步的 Stream 实例 |

## 基础用法

### 创建同步状态

```tsx
import { useSyncState } from 'pipel-react'

function Counter() {
  const [count, setCount, count$] = useSyncState(0)

  // 通过 setState 更新会同步到 stream
  const increment = () => setCount(count + 1)

  // 通过 stream 更新会同步到 state
  const decrement = () => count$.next(count - 1)

  return (
    <div>
      <p>计数: {count}</p>
      <button onClick={increment}>增加</button>
      <button onClick={decrement}>减少</button>
    </div>
  )
}
```

### 使用现有 Stream

```tsx
import { useSyncState, useStream } from 'pipel-react'

function App() {
  const count$ = useStream(0)
  const [count, setCount] = useSyncState(count$)

  return (
    <div>
      <p>计数: {count}</p>
      <button onClick={() => setCount(count + 1)}>增加</button>
    </div>
  )
}
```

## 高级用法

### 在组件间共享状态

```tsx
import { useSyncState } from 'pipel-react'

// 在组件外部创建 stream
const sharedCount$ = new Stream(0)

function ComponentA() {
  const [count, setCount] = useSyncState(sharedCount$)

  return (
    <div>
      <p>组件 A: {count}</p>
      <button onClick={() => setCount(count + 1)}>增加</button>
    </div>
  )
}

function ComponentB() {
  const [count, setCount] = useSyncState(sharedCount$)

  return (
    <div>
      <p>组件 B: {count}</p>
      <button onClick={() => setCount(count - 1)}>减少</button>
    </div>
  )
}
```

### 配合操作符使用

```tsx
import { useSyncState } from 'pipel-react'
import { map, filter } from 'pipeljs'
import { useEffect } from 'react'

function Example() {
  const [value, setValue, value$] = useSyncState(0)
  const [doubled, setDoubled] = useState(0)

  useEffect(() => {
    const child = value$
      .pipe(
        filter((x) => x > 0),
        map((x) => x * 2)
      )
      .then(setDoubled)

    return () => child.unsubscribe()
  }, [value$])

  return (
    <div>
      <p>值: {value}</p>
      <p>双倍: {doubled}</p>
      <button onClick={() => setValue(value + 1)}>增加</button>
    </div>
  )
}
```

### 表单状态管理

```tsx
import { useSyncState } from 'pipel-react'

function Form() {
  const [formData, setFormData, formData$] = useSyncState({
    name: '',
    email: '',
    age: 0,
  })

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  useEffect(() => {
    // 监听表单数据变化
    const child = formData$.then((data) => {
      console.log('表单数据已更新:', data)
    })
    return () => child.unsubscribe()
  }, [formData$])

  return (
    <form>
      <input value={formData.name} onChange={(e) => updateField('name', e.target.value)} />
      <input value={formData.email} onChange={(e) => updateField('email', e.target.value)} />
      <input
        type="number"
        value={formData.age}
        onChange={(e) => updateField('age', Number(e.target.value))}
      />
    </form>
  )
}
```

## 特性

- ✅ 双向自动同步
- ✅ 支持函数式更新
- ✅ 可在组件间共享
- ✅ 支持所有 Stream 操作符
- ✅ TypeScript 类型安全
- ✅ 自动清理订阅

## 注意事项

1. `setState` 和 `stream$.next()` 都会触发同步
2. 避免在同一个更新周期内同时使用两种方式更新
3. Stream 引用在重新渲染时保持稳定
4. 组件卸载时自动清理订阅
5. 支持函数式更新：`setState(prev => prev + 1)`

## 与其他 Hook 的对比

| 特性          | useSyncState               | usePipel         | to$             |
| ------------- | -------------------------- | ---------------- | --------------- |
| 返回值        | [state, setState, stream$] | [state, stream$] | stream$         |
| 双向同步      | ✅                         | ❌               | ❌              |
| 创建 Stream   | ✅                         | ✅               | ❌              |
| setState 支持 | ✅                         | ❌               | ✅              |
| 使用场景      | 需要 setState 的双向同步   | 简单的状态管理   | 连接外部 stream |

## 相关链接

- [usePipel](/cn/core/usePipel/index.cn) - 创建带状态的 Stream
- [to$](/cn/core/to$/index.cn) - 将 setState 转换为 Stream
- [useStream](/cn/core/useStream/index.cn) - 创建稳定的 Stream
