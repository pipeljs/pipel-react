# 快速开始

## 安装

::: code-group

```bash [npm]
npm install pipel-react pipeljs
```

```bash [yarn]
yarn add pipel-react pipeljs
```

```bash [pnpm]
pnpm add pipel-react pipeljs
```

:::

## 基础用法

### 1. 计数器示例

```tsx
import { usePipel } from 'pipel-react'

function Counter() {
  const [count, count$] = usePipel(0)

  return (
    <div>
      <p>计数: {count}</p>
      <button onClick={() => count$.next(count + 1)}>增加</button>
    </div>
  )
}
```

### 2. 搜索防抖

```tsx
import { usePipel, useObservable, debounce, filter } from 'pipel-react'

function SearchBox() {
  const [keyword, keyword$] = usePipel('')

  const debouncedKeyword = useObservable(
    keyword$.pipe(
      debounce(300),
      filter((k) => k.length > 2)
    )
  )

  return (
    <input
      value={keyword}
      onChange={(e) => keyword$.next(e.target.value)}
      placeholder="输入搜索..."
    />
  )
}
```

### 3. HTTP 请求

```tsx
import { useFetch } from 'pipel-react'

function UserProfile({ userId }) {
  const { data, loading, error, refetch } = useFetch(`/api/users/${userId}`, { immediate: true })

  if (loading) return <div>加载中...</div>
  if (error) return <div>错误: {error.message}</div>

  return (
    <div>
      <h1>{data.name}</h1>
      <button onClick={refetch}>刷新</button>
    </div>
  )
}
```

## 核心概念

### Stream 和 State

`usePipel` 返回一个元组：

- 第一个元素：当前值（React 状态）
- 第二个元素：Stream 对象（用于更新）

```tsx
const [value, stream$] = usePipel(initialValue)

// 通过 stream 更新
stream$.next(newValue)

// 订阅变化
stream$.then((value) => console.log(value))
```

### 操作符

使用操作符转换流：

```tsx
import { map, filter, debounce } from 'pipel-react'

const transformed = useObservable(
  stream$.pipe(
    debounce(300),
    filter((x) => x > 0),
    map((x) => x * 2)
  )
)
```

### 自动清理

所有订阅在组件卸载时自动清理：

```tsx
function Component() {
  const [value] = usePipel(stream$)
  // 无需手动取消订阅！
}
```

## 下一步

- [响应式编程](/cn/guide/reactive.cn) - 学习核心概念
- [API 参考](/cn/core/usePipel/index.cn) - 探索所有 API
- [示例](https://github.com/pipeljs/pipel-react/tree/main/examples) - 查看更多示例
