# Debug 调试工具

用于调试流的值、订阅和性能的工具集。

## 基础用法

### debug$

为流添加调试日志：

```tsx
import { debug$ } from 'pipel-react'
import { Stream } from 'pipeljs'

const count$ = new Stream(0)
debug$(count$, 'Counter')

count$.next(1) // 输出: [Counter] Value: 1
count$.next(2) // 输出: [Counter] Value: 2
```

### logStream$

记录流的值到控制台：

```tsx
import { logStream$ } from 'pipel-react'

const count$ = new Stream(0)
const unsubscribe = logStream$(count$, 'Counter')

count$.next(1) // 输出: [Counter] 1
count$.next(2) // 输出: [Counter] 2

unsubscribe() // 停止记录
```

### trace$

追踪流的生命周期事件：

```tsx
import { trace$ } from 'pipel-react'

const count$ = new Stream(0)
trace$(count$, 'Counter')

// 输出:
// [Counter] Created
// [Counter] Subscribed
// [Counter] Value: 1
// [Counter] Unsubscribed
// [Counter] Completed
```

## 高级用法

### createDebugPlugin

创建自定义调试插件：

```tsx
import { createDebugPlugin } from 'pipel-react'

const debugPlugin = createDebugPlugin({
  label: 'MyStream',
  logValues: true,
  logSubscriptions: true,
  logErrors: true,
  logger: (message, ...args) => {
    // 自定义日志逻辑
    console.log(`[DEBUG] ${message}`, ...args)
  }
})

const stream$ = new Stream(0)
stream$.use(debugPlugin)
```

### inspect$

创建流检查器：

```tsx
import { inspect$ } from 'pipel-react'

const count$ = new Stream(0)
const inspector = inspect$(count$)

count$.next(1)
count$.next(2)
count$.next(3)

console.log(inspector.getHistory()) // [0, 1, 2, 3]
console.log(inspector.getSubscriberCount()) // 1
console.log(inspector.getCurrentValue()) // 3

inspector.clear() // 清空历史记录
```

### performanceMonitor$

监控流的性能：

```tsx
import { performanceMonitor$ } from 'pipel-react'

const count$ = new Stream(0)
const perf = performanceMonitor$(count$, 'Counter')

count$.next(1)
count$.next(2)

const stats = perf.getStats()
console.log(stats)
// {
//   updateCount: 2,
//   averageUpdateTime: 0.5,
//   totalTime: 1.0,
//   updateTimes: [0.4, 0.6]
// }

perf.log() // 输出性能统计
perf.reset() // 重置统计
```

## 实际应用

### 调试复杂流

```tsx
import { debug$, trace$, inspect$ } from 'pipel-react'
import { map, filter, debounce } from 'pipeljs'

const input$ = new Stream('')
debug$(input$, 'Input')

const search$ = input$.pipe(
  debounce(300),
  filter(v => v.length > 2),
  map(v => v.toLowerCase())
)
trace$(search$, 'Search')

const inspector = inspect$(search$)

// 使用后查看历史
console.log(inspector.getHistory())
```

### 性能分析

```tsx
import { performanceMonitor$ } from 'pipel-react'

const data$ = new Stream([])
const perf = performanceMonitor$(data$, 'DataStream')

// 执行大量更新
for (let i = 0; i < 1000; i++) {
  data$.next([...data$.value, i])
}

// 查看性能统计
perf.log()
// [DataStream] Performance: {
//   updateCount: 1000,
//   averageUpdateTime: 0.15,
//   totalTime: 150
// }
```

### 条件调试

```tsx
import { createDebugPlugin } from 'pipel-react'

const isDev = process.env.NODE_ENV === 'development'

const stream$ = new Stream(0)

if (isDev) {
  stream$.use(createDebugPlugin({
    label: 'DevStream',
    logValues: true,
    logSubscriptions: true
  }))
}
```

## API

### debug$

```typescript
function debug$<T>(
  stream$: Stream<T>,
  label?: string,
  options?: Omit<DebugOptions, 'label'>
): Stream<T>
```

### logStream$

```typescript
function logStream$<T>(
  stream$: Stream<T> | Observable<T>,
  label?: string
): () => void
```

### trace$

```typescript
function trace$<T>(
  stream$: Stream<T>,
  label?: string
): Stream<T>
```

### inspect$

```typescript
function inspect$<T>(stream$: Stream<T>): {
  getHistory: () => T[]
  getSubscriberCount: () => number
  getCurrentValue: () => T
  clear: () => void
}
```

### performanceMonitor$

```typescript
function performanceMonitor$<T>(
  stream$: Stream<T>,
  label?: string
): {
  getStats: () => PerformanceStats
  log: () => void
  reset: () => void
}
```

### DebugOptions

```typescript
interface DebugOptions {
  label?: string
  logValues?: boolean
  logSubscriptions?: boolean
  logErrors?: boolean
  logger?: (message: string, ...args: any[]) => void
}
```

## 最佳实践

### ✅ 推荐

```tsx
// 开发环境启用调试
if (process.env.NODE_ENV === 'development') {
  debug$(stream$, 'MyStream')
}

// 使用有意义的标签
debug$(userStream$, 'UserData')
debug$(cartStream$, 'ShoppingCart')

// 性能分析后清理
const perf = performanceMonitor$(stream$)
// ... 测试代码
perf.log()
perf.reset()
```

### ❌ 避免

```tsx
// 不要在生产环境启用所有调试
debug$(stream$) // ❌ 生产环境性能影响

// 不要使用无意义的标签
debug$(stream$, 'stream') // ❌ 不清晰
debug$(stream$, 's1') // ❌ 太简短

// 不要忘记清理
const inspector = inspect$(stream$)
// ❌ 没有清理，可能导致内存泄漏
```
