# 调试

pipel 提供了一系列强大的开发工具供开发者使用，让使用者可以轻松地对流式数据进行调试。

## 打印插件

pipel 提供打印插件，可以打印数据修改过程。

### 单节点打印

```typescript
import { useStream } from 'pipel-react'
import { consoleNode } from 'pipeljs'
import { useEffect } from 'react'

function Example() {
  const data$ = useStream(0)

  useEffect(() => {
    data$.use(consoleNode())
  }, [data$])

  const update = () => {
    data$.next(1) // 打印 resolve 1
    data$.next(2) // 打印 resolve 2
    data$.next(3) // 打印 resolve 3

    data$.next(Promise.reject(4)) // 打印 reject 4
  }

  return <button onClick={update}>更新数据</button>
}
```

### 整条流打印

```typescript
import { useStream } from 'pipel-react'
import { consoleAll, debounce } from 'pipeljs'
import { useEffect } from 'react'

function Example() {
  const data$ = useStream(0)

  useEffect(() => {
    data$.use(consoleAll())

    data$
      .pipe(debounce(300))
      .then((value) => {
        throw new Error(value + 1)
      })
      .then(undefined, (error) => ({ current: error.message }))
  }, [data$])

  return (
    <div>
      <button onClick={() => data$.next(Date.now())}>
        更新数据（查看控制台）
      </button>
    </div>
  )
}
```

::: info 注意
`consoleAll` 会打印整条流指的是 Stream 节点以及其 Observable 子节点。
:::

## 调试插件

:::warning 注意
浏览器可能会过滤 node_modules 中的 debugger 语句，导致调试器断点不生效。需要手动在浏览器开发者工具 -> Settings -> Ignore List 中启用 node_modules 的调试。
:::

pipel 提供调试插件，可以调试流式数据。

### 基础调试

```typescript
import { useStream } from 'pipel-react'
import { debugNode } from 'pipeljs'
import { useEffect } from 'react'

function Example() {
  const stream$ = useStream(0)

  useEffect(() => {
    stream$
      .then((value) => value + 1)
      .use(debugNode())
  }, [stream$])

  const trigger = () => {
    stream$.next(1)
    // 触发调试器断点
  }

  return <button onClick={trigger}>触发调试</button>
}
```

### 条件调试

```typescript
import { useStream } from 'pipel-react'
import { debugNode } from 'pipeljs'
import { useEffect } from 'react'

function Example() {
  const stream$ = useStream<string | number>(0)

  useEffect(() => {
    // 只对字符串类型触发调试器
    const conditionFn = (value: any) => typeof value === 'string'
    stream$.use(debugNode(conditionFn))
  }, [stream$])

  const triggerString = () => {
    stream$.next('hello') // 触发调试器
  }

  const triggerNumber = () => {
    stream$.next(42) // 不触发调试器
  }

  return (
    <>
      <button onClick={triggerString}>触发字符串（会调试）</button>
      <button onClick={triggerNumber}>触发数字（不会调试）</button>
    </>
  )
}
```

### 整条流调试

```typescript
import { useStream } from 'pipel-react'
import { debugAll } from 'pipeljs'
import { useEffect } from 'react'

function Example() {
  const data$ = useStream(0)

  useEffect(() => {
    data$.use(debugAll())

    data$
      .then((value) => value + 1)
      .then((value) => value + 1)
  }, [data$])

  const updateData = () => {
    data$.next(data$.value + 1)
    // 在浏览器开发者工具中会在每个节点触发调试器断点
    // 当前有三个节点，所以会触发三次断点
  }

  return <button onClick={updateData}>更新数据（触发调试）</button>
}
```

## 在 React DevTools 中调试

结合 React DevTools，可以更好地调试 pipel-react 应用：

```tsx
import { usePipel } from 'pipel-react'
import { useEffect } from 'react'

function Example() {
  const [data, data$] = usePipel({ count: 0, name: 'test' })

  useEffect(() => {
    // 在 React DevTools 的 Profiler 中可以看到组件更新
    console.log('Component updated with:', data)
  }, [data])

  return (
    <div>
      <p>Count: {data.count}</p>
      <p>Name: {data.name}</p>
      <button onClick={() => data$.set((v) => v.count++)}>增加计数</button>
    </div>
  )
}
```

## 性能调试

使用 React Profiler 和 pipel 的调试工具可以分析性能：

```tsx
import { usePipel, useObservable } from 'pipel-react'
import { Profiler } from 'react'
import { consoleNode } from 'pipeljs'
import { useEffect } from 'react'

function Example() {
  const [data, data$] = usePipel({ count: 0 })

  useEffect(() => {
    // 打印每次数据变化
    data$.use(consoleNode('data'))
  }, [data$])

  const onRender = (id: string, phase: 'mount' | 'update', actualDuration: number) => {
    console.log(`${id} ${phase} took ${actualDuration}ms`)
  }

  return (
    <Profiler id="Example" onRender={onRender}>
      <div>
        <p>Count: {data.count}</p>
        <button onClick={() => data$.set((v) => v.count++)}>增加计数</button>
      </div>
    </Profiler>
  )
}
```

## 调试最佳实践

### 1. 使用命名流

给流添加名称，便于在控制台中识别：

```typescript
import { useStream } from 'pipel-react'
import { consoleNode } from 'pipeljs'
import { useEffect } from 'react'

function Example() {
  const userStream$ = useStream({ name: 'John', age: 25 })
  const orderStream$ = useStream({ id: 1, total: 100 })

  useEffect(() => {
    userStream$.use(consoleNode('userStream'))
    orderStream$.use(consoleNode('orderStream'))
  }, [userStream$, orderStream$])

  // 控制台会清晰显示是哪个流的数据变化
}
```

### 2. 分阶段调试

在复杂的流处理链中，可以在不同阶段添加调试：

```typescript
import { useStream } from 'pipel-react'
import { consoleNode, map, filter } from 'pipeljs'
import { useEffect } from 'react'

function Example() {
  const data$ = useStream(0)

  useEffect(() => {
    data$
      .use(consoleNode('原始数据'))
      .pipe(map((x) => x * 2))
      .use(consoleNode('乘以2后'))
      .pipe(filter((x) => x > 10))
      .use(consoleNode('过滤后'))
  }, [data$])
}
```

### 3. 条件性启用调试

在开发环境启用调试，生产环境禁用：

```typescript
import { useStream } from 'pipel-react'
import { consoleNode, debugNode } from 'pipeljs'
import { useEffect } from 'react'

function Example() {
  const data$ = useStream(0)

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      data$.use(consoleNode('data'))
      data$.use(debugNode())
    }
  }, [data$])
}
```

## 常见调试场景

### 调试异步数据流

```typescript
import { useStream } from 'pipel-react'
import { consoleNode } from 'pipeljs'
import { useEffect } from 'react'

function Example() {
  const data$ = useStream<Promise<any>>(Promise.resolve(null))

  useEffect(() => {
    data$.use(consoleNode('async data'))

    data$.then(
      (value) => console.log('Success:', value),
      (error) => console.error('Error:', error)
    )
  }, [data$])

  const fetchData = async () => {
    data$.next(
      fetch('/api/data').then(res => res.json())
    )
  }

  return <button onClick={fetchData}>获取数据</button>
}
```

### 调试订阅问题

```typescript
import { useStream } from 'pipel-react'
import { useEffect } from 'react'

function Example() {
  const data$ = useStream(0)

  useEffect(() => {
    console.log('Setting up subscription')

    const subscription = data$.subscribe((value) => {
      console.log('Received value:', value)
    })

    return () => {
      console.log('Cleaning up subscription')
      subscription.unsubscribe()
    }
  }, [data$])

  return <button onClick={() => data$.next(Date.now())}>更新</button>
}
```

## 总结

pipel 提供的调试工具：

- ✅ **consoleNode**: 打印单个节点的数据变化
- ✅ **consoleAll**: 打印整条流的数据变化
- ✅ **debugNode**: 在单个节点触发调试器断点
- ✅ **debugAll**: 在整条流触发调试器断点
- ✅ **条件调试**: 支持条件性触发调试
- ✅ **React DevTools**: 与 React 开发工具完美集成

这些工具可以帮助你：

- 追踪数据流动
- 定位问题所在
- 分析性能瓶颈
- 理解复杂的流处理逻辑
