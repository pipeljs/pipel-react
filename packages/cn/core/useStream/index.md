# useStream

创建一个在重新渲染时保持稳定的 Stream 实例。

## 签名

```typescript
function useStream<T>(initialValue: T): Stream<T>
function useStream<T>(initialValue: PromiseLike<T>): Stream<T>
```

## 参数

| 参数           | 类型                  | 说明                           |
| -------------- | --------------------- | ------------------------------ |
| `initialValue` | `T \| PromiseLike<T>` | 初始值或解析为初始值的 Promise |

## 返回值

返回一个稳定的 `Stream<T>` 实例，在组件重新渲染时保持不变。

## 基础用法

### 使用初始值创建 Stream

```tsx
import { useStream } from 'pipel-react'

function Counter() {
  const count$ = useStream(0)
  const [count, setCount] = useState(0)

  useEffect(() => {
    const child = count$.then((value) => setCount(value))
    return () => child.unsubscribe()
  }, [count$])

  return <button onClick={() => count$.next(count + 1)}>计数: {count}</button>
}
```

### 使用 Promise 创建 Stream

```tsx
import { useStream } from 'pipel-react'

function AsyncData() {
  const data$ = useStream(fetch('/api/data').then((res) => res.json()))

  const [data, setData] = useState(null)

  useEffect(() => {
    const child = data$.then((value) => setData(value))
    return () => child.unsubscribe()
  }, [data$])

  return <div>{data?.name}</div>
}
```

## 高级用法

### 在组件间共享 Stream

```tsx
// 在组件外部创建 stream
const globalCount$ = new Stream(0)

function ComponentA() {
  const count$ = useStream(globalCount$)
  const [count, setCount] = useState(0)

  useEffect(() => {
    const child = count$.then(setCount)
    return () => child.unsubscribe()
  }, [count$])

  return <div>组件 A 中的计数: {count}</div>
}

function ComponentB() {
  const count$ = useStream(globalCount$)

  return <button onClick={() => count$.next(count$.value + 1)}>增加</button>
}
```

### 配合操作符使用

```tsx
import { useStream } from 'pipel-react'
import { map, filter } from 'pipeljs'

function Example() {
  const value$ = useStream(0)

  const doubled$ = value$.pipe(
    filter((x) => x > 0),
    map((x) => x * 2)
  )

  return (
    <div>
      <button onClick={() => value$.next(value$.value + 1)}>增加</button>
    </div>
  )
}
```

## 特性

- ✅ 在重新渲染时保持稳定的引用
- ✅ 支持 Promise 作为初始值
- ✅ 可在组件间共享
- ✅ 支持所有 Stream 操作符
- ✅ 组件卸载时自动清理

## 注意事项

1. Stream 实例引用在重新渲染时保持稳定
2. 使用 Promise 作为初始值时，Stream 会发出解析后的值
3. Stream 不会自动清理 - 你需要管理订阅
4. 如需自动订阅管理，请使用 [usePipel](/cn/core/usePipel/index.cn) 代替

## 相关链接

- [usePipel](/cn/core/usePipel/index.cn) - 带自动状态同步的 Stream
- [useObservable](/cn/core/useObservable/index.cn) - 订阅 Observable
- [useSyncState](/cn/core/useSyncState/index.cn) - 双向状态同步
