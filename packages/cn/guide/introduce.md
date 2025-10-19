# 介绍

## 什么是 Pipel-React？

Pipel-React 是一个 **基于 Promise-like 语法的响应式流编程库**，为 React 应用提供优雅的异步数据流处理能力。

简单来说：它让你用 **类似 Promise 的方式** 来处理 **持续变化的数据流**，而不仅仅是一次性的异步操作。

## 核心概念

```tsx
// 传统 Promise（一次性）
const promise = fetch('/api/user')
promise.then((data) => console.log(data)) // 只执行一次

// Pipel-React Stream（持续响应）
const [count, count$] = usePipel(0)
count$.then((value) => console.log(value)) // 每次数据变化都执行

count$.next(1) // 输出: 1
count$.next(2) // 输出: 2
count$.next(3) // 输出: 3
```

## 为什么选择 Pipel-React？

### 1. 简化异步状态管理

**传统方式：**

```tsx
const [data, setData] = useState(null)
const [loading, setLoading] = useState(false)
const [error, setError] = useState(null)

const fetchData = async () => {
  setLoading(true)
  try {
    const res = await fetch('/api/data')
    setData(await res.json())
  } catch (err) {
    setError(err)
  } finally {
    setLoading(false)
  }
}
```

**Pipel-React 方式：**

```tsx
const { data, loading, error } = useFetch('/api/data', {
  immediate: true,
})
```

### 2. 降低学习门槛

相比 RxJS：

- 熟悉的 Promise 语法
- 易于记忆的操作符
- 与 React 生态无缝集成

### 3. 强大的流处理能力

```tsx
const [keyword, keyword$] = usePipel('')

const results = useObservable(
  keyword$.pipe(
    debounce(300), // 防抖
    filter((k) => k.length > 2), // 过滤
    map((k) => fetchResults(k)) // 转换
  )
)
```

## 核心特性

- ✅ **自动状态管理** - Stream 自动转换为 React 状态
- ✅ **生命周期集成** - 组件卸载时自动取消订阅
- ✅ **丰富操作符** - 30+ 操作符用于流处理
- ✅ **HTTP 支持** - 完整的 useFetch 实现
- ✅ **TypeScript** - 完整的类型推导
- ✅ **持久化** - 轻松集成 localStorage

## 下一步

- [快速开始](/cn/guide/quick) - 5 分钟上手
- [核心概念](/cn/guide/reactive) - 理解响应式编程
- [API 参考](/cn/core/usePipel/) - 探索所有 API
