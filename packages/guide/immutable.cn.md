# 不可变数据

pipel 底层采用 [limu](https://tnfe.github.io/limu/) 不可变数据，并且只有通过 `set`、`next` 等方法才能以不可变的方式修改数据。

## 修改对象数据

```typescript
import { useStream } from 'pipel-react'

function Example() {
  const stream$ = useStream({ obj: { name: 'pipeljs', age: 0 } })

  // 无需使用扩展符 {...value, obj: {...value.obj, age: value.obj.age + 1}}
  const updateAge = () => {
    stream$.set((value) => (value.obj.age += 1))
  }

  return <button onClick={updateAge}>增加年龄</button>
}
```

## 修改数组数据

```typescript
import { useStream } from 'pipel-react'

function Example() {
  const stream$ = useStream([1, 2, 3])

  // 修改数组数据
  const updateFirst = () => {
    stream$.set((value) => {
      value[0] = 2
    })
  }

  // 整体替换
  const replace = () => {
    stream$.next([1, 2, 3, 4])
  }

  return (
    <>
      <button onClick={updateFirst}>修改第一项</button>
      <button onClick={replace}>整体替换</button>
    </>
  )
}
```

## 修改基本数据类型

```typescript
import { usePipel } from 'pipel-react'

function Example() {
  const [count, count$] = usePipel(1)

  // 修改基本数据类型
  const increment = () => {
    count$.next(count + 1)
  }

  return <button onClick={increment}>增加: {count}</button>
}
```

## 应用场景

在 React 中，使用 `useState` 获取每次修改的快照比较困难，但是 pipel 可以轻松实现：

```tsx
import { usePipel } from 'pipel-react'
import { useEffect } from 'react'

function Example() {
  const [data, data$] = usePipel({ nest: { name: 'pipeljs', age: 0 } })

  useEffect(() => {
    // 订阅数据变化，获取每次修改的快照
    const subscription = data$.subscribe((value) => {
      console.log('pipel value:', value)
      console.log('是否是新对象:', value !== data)
    })

    return () => subscription.unsubscribe()
  }, [data$])

  return <button onClick={() => data$.set((v) => v.nest.age++)}>增加年龄: {data.nest.age}</button>
}
```

## 对比 useState

### 使用 useState

```tsx
import { useState, useEffect } from 'react'

function Example() {
  const [data, setData] = useState({ nest: { name: 'pipeljs', age: 0 } })

  useEffect(() => {
    console.log('useState value:', data)
    // 问题：无法获取修改前后的对比
  }, [data])

  const updateAge = () => {
    // 需要手动创建新对象
    setData((prev) => ({
      ...prev,
      nest: {
        ...prev.nest,
        age: prev.nest.age + 1,
      },
    }))
  }

  return <button onClick={updateAge}>增加年龄: {data.nest.age}</button>
}
```

### 使用 pipel

```tsx
import { usePipel } from 'pipel-react'
import { useEffect } from 'react'

function Example() {
  const [data, data$] = usePipel({ nest: { name: 'pipeljs', age: 0 } })

  useEffect(() => {
    const subscription = data$.subscribe((value) => {
      console.log('pipel value:', value)
      // 优势：自动创建不可变副本，可以轻松对比
    })
    return () => subscription.unsubscribe()
  }, [data$])

  const updateAge = () => {
    // 简洁的语法，自动处理不可变更新
    data$.set((v) => v.nest.age++)
  }

  return <button onClick={updateAge}>增加年龄: {data.nest.age}</button>
}
```

## 不可变数据的优势

1. **简化语法**：无需手动使用扩展运算符创建新对象
2. **性能优化**：只创建必要的副本，而不是整个对象树
3. **易于调试**：可以轻松追踪数据变化历史
4. **类型安全**：TypeScript 完整支持

## 调试不可变更新

使用 pipel 的调试工具可以清晰地看到每次不可变更新：

```tsx
import { usePipel } from 'pipel-react'
import { consoleNode } from 'pipeljs'
import { useEffect } from 'react'

function Example() {
  const [data, data$] = usePipel({ nest: { name: 'pipeljs', age: 0 } })

  useEffect(() => {
    // 添加打印插件
    data$.use(consoleNode('data'))
  }, [data$])

  return (
    <div>
      <p>年龄: {data.nest.age}</p>
      <button onClick={() => data$.set((v) => v.nest.age++)}>增加年龄（查看控制台）</button>
    </div>
  )
}
```

点击按钮后，控制台会清晰地显示：

- 修改前的值
- 修改后的值
- 变化的路径

## 最佳实践

1. **使用 set 方法**：对于对象和数组的修改，优先使用 `set` 方法
2. **使用 next 方法**：对于整体替换，使用 `next` 方法
3. **避免直接修改**：不要直接修改从 `usePipel` 返回的状态值
4. **利用调试工具**：使用 `consoleNode` 等工具追踪数据变化

## 总结

pipel 的不可变数据特性：

- ✅ **简化语法**：无需手动创建对象副本
- ✅ **自动优化**：智能地只复制变化的部分
- ✅ **易于调试**：清晰的变化追踪
- ✅ **类型安全**：完整的 TypeScript 支持
- ✅ **性能优越**：基于 limu 的高性能实现
