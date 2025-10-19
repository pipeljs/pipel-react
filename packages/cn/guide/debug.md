# 调试

## 调试工具

Pipel-React 提供了多种调试工具来帮助你理解和调试响应式数据流。

### debug 操作符

`debug` 操作符可以在控制台打印流的值变化：

```tsx
import { usePipel, debug } from 'pipel-react'

function Example() {
  const [count, count$] = usePipel(0)

  // 添加调试
  count$
    .pipe(
      debug('count') // 标签名称
    )
    .subscribe()

  return <button onClick={() => count$.next(count + 1)}>增加</button>
}

// 控制台输出:
// [count] 0
// [count] 1
// [count] 2
```

### 使用 then 进行调试

你可以使用 `then` 方法在数据流中执行副作用：

```tsx
import { map } from 'pipeljs'

const [data, data$] = usePipel({ count: 0 })

// 使用 then 打印值
data$.then((value) => {
  console.log('Data changed:', value)
})

// 或者在 pipe 链中使用
const doubled$ = data$.pipe(map((v) => v.count * 2))

doubled$.then((value) => {
  console.log('Doubled value:', value)
})
```

## React DevTools

### 组件名称

为组件添加有意义的名称，方便在 DevTools 中识别：

```tsx
function UserProfile() {
  const [user, user$] = usePipel({ name: 'John', age: 25 })

  return <div>{user.name}</div>
}

// 在 DevTools 中显示为 "UserProfile"
```

### 使用 displayName

```tsx
const MemoizedComponent = memo(function UserCard({ user }) {
  return <div>{user.name}</div>
})

MemoizedComponent.displayName = 'UserCard'
```

## 性能调试

### 检测不必要的渲染

```tsx
import { useEffect, useRef } from 'react'

function useRenderCount(componentName) {
  const renderCount = useRef(0)

  useEffect(() => {
    renderCount.current += 1
    console.log(`${componentName} rendered ${renderCount.current} times`)
  })

  return renderCount.current
}

function Example() {
  const renderCount = useRenderCount('Example')
  const [count, count$] = usePipel(0)

  return (
    <div>
      <p>Render count: {renderCount}</p>
      <p>Count: {count}</p>
      <button onClick={() => count$.next(count + 1)}>增加</button>
    </div>
  )
}
```

### 使用 React Profiler

```tsx
import { Profiler } from 'react'

function onRenderCallback(
  id, // 组件的 "id"
  phase, // "mount" 或 "update"
  actualDuration, // 本次更新花费的时间
  baseDuration, // 不使用 memoization 的情况下渲染整棵子树需要的时间
  startTime, // 本次更新开始渲染的时间
  commitTime, // 本次更新提交的时间
  interactions // 本次更新的 interactions 集合
) {
  console.log({
    id,
    phase,
    actualDuration,
    baseDuration,
  })
}

function App() {
  return (
    <Profiler id="App" onRender={onRenderCallback}>
      <Example />
    </Profiler>
  )
}
```

## 数据流调试

### 追踪数据变化

```tsx
import { usePipel } from 'pipel-react'
import { useEffect } from 'react'

function Example() {
  const [data, data$] = usePipel({ count: 0, name: '' })

  // 追踪所有变化
  useEffect(() => {
    const child = data$.then((value) => {
      console.log('Data changed:', value)
      console.log('Stack trace:', new Error().stack)
    })

    return () => child.unsubscribe()
  }, [data$])

  return (
    <div>
      <button onClick={() => data$.set((d) => d.count++)}>增加计数</button>
    </div>
  )
}
```

### 检测值变化

```tsx
import { change } from 'pipeljs'

const [data, data$] = usePipel({ count: 0 })

// 使用 change 操作符检测变化
const changed$ = data$.pipe(change())

changed$.then((value) => {
  console.log('Value changed:', value)
})

// 更新值
data$.next({ count: 0 }) // 触发
data$.next({ count: 1 }) // 触发
```

## 常见问题调试

### 1. 组件不更新

**问题：** 修改了数据但组件没有重新渲染

**检查清单：**

```tsx
// ❌ 错误：直接修改
const [user, user$] = usePipel({ name: 'John' })
user.name = 'Jane' // 不会触发更新

// ✅ 正确：使用 set() 或 next()
user$.set((u) => {
  u.name = 'Jane'
})
user$.next({ ...user, name: 'Jane' })
```

**调试方法：**

```tsx
function Example() {
  const [user, user$] = usePipel({ name: 'John' })

  useEffect(() => {
    console.log('Component mounted')

    const subscription = user$.subscribe((value) => {
      console.log('User changed:', value)
    })

    return () => {
      console.log('Component unmounted')
      subscription.unsubscribe()
    }
  }, [user$])

  return <div>{user.name}</div>
}
```

### 2. 内存泄漏

**问题：** 组件卸载后订阅没有清理

**检查清单：**

```tsx
// ❌ 错误：忘记清理订阅
useEffect(() => {
  stream$.subscribe((value) => {
    console.log(value)
  })
  // 缺少清理函数
}, [])

// ✅ 正确：清理订阅
useEffect(() => {
  const subscription = stream$.subscribe((value) => {
    console.log(value)
  })

  return () => subscription.unsubscribe()
}, [stream$])
```

**调试方法：**

```tsx
// 追踪订阅数量
function useSubscriptionCount(stream$) {
  useEffect(() => {
    console.log('Subscriptions:', stream$.observers?.length || 0)
  })
}
```

### 3. 闭包陷阱

**问题：** 在回调中使用了过时的值

```tsx
// ❌ 问题：使用闭包中的旧值
const [count, count$] = usePipel(0)

setTimeout(() => {
  count$.next(count + 1) // count 可能已经过时
}, 1000)

// ✅ 解决：使用函数式更新
setTimeout(() => {
  count$.set((c) => c + 1) // 总是使用最新值
}, 1000)
```

**调试方法：**

```tsx
function Example() {
  const [count, count$] = usePipel(0)

  const handleClick = () => {
    console.log('Current count in closure:', count)
    console.log('Current count in stream:', count$.value)

    setTimeout(() => {
      console.log('Count after 1s (closure):', count)
      console.log('Count after 1s (stream):', count$.value)
    }, 1000)
  }

  return <button onClick={handleClick}>Check</button>
}
```

### 4. 异步竞态条件

**问题：** 多个异步请求的响应顺序不确定

```tsx
// ❌ 问题：可能显示旧的搜索结果
const [query, query$] = usePipel('')
const [results, results$] = usePipel([])

query$.pipe(debounce(300)).subscribe(async (q) => {
  const data = await fetch(`/api/search?q=${q}`)
  results$.next(data) // 可能是旧请求的结果
})

// ✅ 解决：使用 switchMap
import { switchMap } from 'pipeljs'

const results = useObservable(
  query$.pipe(
    debounce(300),
    switchMap((q) => fetch(`/api/search?q=${q}`).then((r) => r.json()))
  )
)
```

## 调试技巧

### 1. 使用 console.trace()

```tsx
data$
  .pipe(
    tap(() => {
      console.trace('Data updated from:')
    })
  )
  .subscribe()
```

### 2. 条件断点

```tsx
data$
  .pipe(
    tap((value) => {
      if (value.count > 10) {
        debugger // 只在 count > 10 时暂停
      }
    })
  )
  .subscribe()
```

### 3. 性能标记

```tsx
import { map } from 'pipeljs'

const startTime = Date.now()

const mapped$ = data$.pipe(
  map((value) => {
    const duration = Date.now() - startTime
    console.log('Update took:', duration, 'ms')
    return value
  })
)

mapped$.then((value) => {
  console.log('Final value:', value)
})
```

### 4. 自定义调试 Hook

```tsx
function useDebugValue(value, label = 'Value') {
  useEffect(() => {
    console.log(`[${label}] changed:`, value)
  }, [value, label])

  return value
}

function Example() {
  const [count, count$] = usePipel(0)
  useDebugValue(count, 'Count')

  return <div>{count}</div>
}
```

## 生产环境调试

### 1. 条件调试

```tsx
const DEBUG = process.env.NODE_ENV === 'development'

if (DEBUG) {
  stream$.pipe(debug('stream')).subscribe()
}
```

### 2. 错误边界

```tsx
import { Component } from 'react'

class ErrorBoundary extends Component {
  state = { hasError: false, error: null }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught:', error, errorInfo)
    // 发送到错误追踪服务
  }

  render() {
    if (this.state.hasError) {
      return <div>Something went wrong</div>
    }

    return this.props.children
  }
}

function App() {
  return (
    <ErrorBoundary>
      <Example />
    </ErrorBoundary>
  )
}
```

### 3. 日志收集

```tsx
const logger = {
  log: (message, data) => {
    console.log(message, data)
    // 发送到日志服务
    if (process.env.NODE_ENV === 'production') {
      // sendToLogService(message, data)
    }
  },
}

stream$.then((value) => {
  logger.log('Stream updated', value)
})
```

## 最佳实践

1. **开发时启用调试** - 使用 `then` 方法追踪数据流
2. **使用 React DevTools** - 检查组件树和 props
3. **添加有意义的标签** - 为 Stream 和组件添加描述性名称
4. **记录关键操作** - 使用 `then` 记录重要的数据变化
5. **性能分析** - 使用 Profiler 找出性能瓶颈
6. **错误处理** - 使用 ErrorBoundary 捕获错误
7. **条件调试** - 只在开发环境启用详细日志

## 下一步

- [响应式编程](/guide/reactive) - 理解数据流
- [流式渲染](/guide/render) - 优化渲染性能
- [API 参考](/core/debug/) - 查看调试 API
