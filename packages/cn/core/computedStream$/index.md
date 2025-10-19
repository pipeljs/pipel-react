# computedStream$ / useComputedStream$

计算流 - 从多个流或状态自动计算派生值。

## 基础用法

### computedStream$

创建一个计算流，自动追踪依赖并更新：

```tsx
import { computedStream$, useObservable } from 'pipel-react'
import { Stream } from 'pipeljs'

const price$ = new Stream(100)
const quantity$ = new Stream(2)

function Cart() {
  const total$ = computedStream$(() => {
    return price$.value * quantity$.value
  })

  const total = useObservable(total$)

  return (
    <div>
      <div>价格: ${price$.value}</div>
      <div>数量: {quantity$.value}</div>
      <div>总计: ${total}</div>
    </div>
  )
}
```

### useComputedStream$

Hook 版本，与 React 生命周期集成：

```tsx
import { useComputedStream$, useObservable } from 'pipel-react'
import { useState } from 'react'

function Cart() {
  const [price, setPrice] = useState(100)
  const [quantity, setQuantity] = useState(2)

  const total$ = useComputedStream$(() => price * quantity, [price, quantity])

  const total = useObservable(total$)

  return (
    <div>
      <input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} />
      <input type="number" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
      <div>总计: ${total}</div>
    </div>
  )
}
```

## 高级用法

### 多个依赖

```tsx
const firstName$ = new Stream('John')
const lastName$ = new Stream('Doe')
const age$ = new Stream(30)

const profile$ = computedStream$(() => ({
  fullName: `${firstName$.value} ${lastName$.value}`,
  age: age$.value,
  isAdult: age$.value >= 18,
}))
```

### 复杂计算

```tsx
const items$ = new Stream([
  { name: 'Apple', price: 1.5, quantity: 3 },
  { name: 'Banana', price: 0.8, quantity: 5 },
])

const discount$ = new Stream(0.1) // 10% 折扣

const summary$ = computedStream$(() => {
  const items = items$.value
  const discount = discount$.value

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const discountAmount = subtotal * discount
  const total = subtotal - discountAmount

  return {
    subtotal,
    discount: discountAmount,
    total,
    itemCount: items.length,
  }
})
```

## API

### computedStream$

```typescript
function computedStream$<T>(getter: () => T): Stream<T>
```

**参数：**

- `getter`: 计算函数，返回计算值

**返回：**

- 计算流

### useComputedStream$

```typescript
function useComputedStream$<T>(getter: () => T, deps: React.DependencyList): Stream<T>
```

**参数：**

- `getter`: 计算函数
- `deps`: 依赖数组（类似 useEffect）

**返回：**

- 计算流

## 注意事项

1. **性能考虑**：计算函数应该是纯函数，避免副作用
2. **依赖追踪**：`useComputedStream$` 需要手动指定依赖
3. **自动清理**：使用 Hook 版本会自动清理资源

## 最佳实践

### ✅ 推荐

```tsx
// 使用 Hook 版本
const total$ = useComputedStream$(() => price * quantity, [price, quantity])

// 纯函数计算
const result$ = computedStream$(() => {
  return data$.value.map((item) => item.value * 2)
})
```

### ❌ 避免

```tsx
// 不要在计算函数中执行副作用
const bad$ = computedStream$(() => {
  console.log('Computing...') // ❌ 副作用
  fetch('/api/data') // ❌ 异步操作
  return value$.value
})

// 不要忘记依赖
const bad$ = useComputedStream$(
  () => price * quantity,
  [] // ❌ 缺少依赖
)
```
