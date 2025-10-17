# usePipel

将 Stream/Observable 转换为 React 状态，并自动管理订阅。

## 签名

```typescript
function usePipel<T>(initialValue: T): [T, Stream<T>]
function usePipel<T>(stream$: Stream<T>): [T | undefined, Stream<T>]
function usePipel<T>(observable$: Observable<T>): [T | undefined, Observable<T>]
```

## 基础用法

### 创建新的 Stream

```tsx
import { usePipel } from 'pipel-react'

function Counter() {
  const [count, count$] = usePipel(0)
  
  return (
    <div>
      <p>计数: {count}</p>
      <button onClick={() => count$.next(count + 1)}>
        增加
      </button>
    </div>
  )
}
```

### 使用现有 Stream

```tsx
import { usePipel, useStream } from 'pipel-react'

function App() {
  const count$ = useStream(0)
  const [count] = usePipel(count$)
  
  return <div>计数: {count}</div>
}
```

## 配合操作符使用

```tsx
import { usePipel, useObservable, map, filter } from 'pipel-react'

function Example() {
  const [value, value$] = usePipel(0)
  
  const doubled = useObservable(
    value$.pipe(
      filter(x => x > 0),
      map(x => x * 2)
    )
  )
  
  return (
    <div>
      <p>值: {value}</p>
      <p>双倍: {doubled}</p>
      <button onClick={() => value$.next(value + 1)}>
        增加
      </button>
    </div>
  )
}
```

## Promise 初始值

```tsx
function AsyncExample() {
  const [data, data$] = usePipel(
    fetch('/api/data').then(res => res.json())
  )
  
  if (!data) return <div>加载中...</div>
  
  return <div>{data.name}</div>
}
```

## 参数

| 参数 | 类型 | 说明 |
|------|------|------|
| `initialValue` | `T \| PromiseLike<T>` | 初始值或 Promise |
| `stream$` | `Stream<T>` | 现有的 Stream 实例 |
| `observable$` | `Observable<T>` | 现有的 Observable 实例 |

## 返回值

返回一个元组 `[value, stream$]`：

| 索引 | 类型 | 说明 |
|------|------|------|
| `0` | `T \| undefined` | 当前值（React 状态） |
| `1` | `Stream<T> \| Observable<T>` | Stream/Observable 实例 |

## 特性

- ✅ 自动订阅管理
- ✅ 组件卸载时自动清理
- ✅ 完整的 TypeScript 支持
- ✅ 支持 Promise
- ✅ 可配合操作符使用

## 注意事项

1. Stream 实例在重新渲染时保持稳定
2. 订阅在组件卸载时自动清理
3. 使用 Promise 作为初始值时，第一个值将是 `undefined`
4. 返回的 Stream 可以在组件间共享

## 相关链接

- [useStream](/cn/core/useStream/index.cn) - 创建稳定的 Stream
- [useObservable](/cn/core/useObservable/index.cn) - 订阅 Observable
- [to$](/cn/core/to$/index.cn) - 将状态转换为 Stream
