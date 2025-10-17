# Pipel-React 快速参考

## 🚀 安装

```bash
npm install pipel-react pipeljs
```

## 📚 核心 API

### usePipel - 核心 Hook

```tsx
const [value, stream$] = usePipel(initialValue)
```

**示例**:
```tsx
const [count, count$] = usePipel(0)
count$.next(count + 1)  // 更新
```

### useStream - 创建流

```tsx
const stream$ = useStream(initialValue)
```

**示例**:
```tsx
const count$ = useStream(0)
const [count] = usePipel(count$)
```

### useObservable - 订阅流

```tsx
const value = useObservable(observable$)
```

**示例**:
```tsx
const doubled = useObservable(
  count$.pipe(map(x => x * 2))
)
```

### to$ - State 转 Stream

```tsx
const stream$ = to$(stateValue)
```

**示例**:
```tsx
const [keyword, setKeyword] = useState('')
const keyword$ = to$(keyword)
```

### effect$ - 副作用

```tsx
effect$(stream$, (value) => {
  // 副作用逻辑
})
```

**示例**:
```tsx
effect$(count$, (value) => {
  console.log('Count:', value)
})
```

### useSyncState - 双向同步

```tsx
const [value, setValue, stream$] = useSyncState(initialValue)
```

**示例**:
```tsx
const [count, setCount, count$] = useSyncState(0)
setCount(10)      // 同步到 stream
count$.next(20)   // 同步到 state
```

### persistStream$ - 持久化

```tsx
const stream$ = persistStream$(initialValue, { key: 'storage-key' })
```

**示例**:
```tsx
const theme$ = persistStream$('dark', { key: 'theme' })
const [theme] = usePipel(theme$)
```

### useFetch - HTTP 请求

```tsx
const { data, loading, error, refetch } = useFetch(url, options)
```

**示例**:
```tsx
const { data, loading } = useFetch('/api/users', {
  immediate: true
})
```

## 🔧 常用操作符

### 转换
```tsx
map(x => x * 2)           // 映射
scan((acc, x) => acc + x) // 累加
reduce((acc, x) => acc + x) // 归约
```

### 过滤
```tsx
filter(x => x > 10)       // 过滤
distinctUntilChanged()    // 去重
take(5)                   // 取前 N 个
skip(2)                   // 跳过前 N 个
```

### 时间
```tsx
debounce(300)             // 防抖
throttle(1000)            // 节流
delay(500)                // 延迟
timeout(5000)             // 超时
```

### 组合
```tsx
merge(stream1$, stream2$) // 合并
concat(stream1$, stream2$) // 连接
promiseAll([p1, p2])      // 等待全部
promiseRace([p1, p2])     // 竞速
```

### 错误处理
```tsx
catchError(err => of(defaultValue)) // 捕获错误
retry(3)                            // 重试
```

## 💡 常见模式

### 模式 1: 搜索防抖

```tsx
function SearchBox() {
  const [keyword, keyword$] = usePipel('')
  
  const results = useObservable(
    keyword$.pipe(
      debounce(300),
      filter(k => k.length > 2),
      map(k => fetchResults(k))
    )
  )
  
  return (
    <input 
      value={keyword}
      onChange={e => keyword$.next(e.target.value)}
    />
  )
}
```

### 模式 2: 表单验证

```tsx
function Form() {
  const [email, email$] = usePipel('')
  
  const isValid = useObservable(
    email$.pipe(
      debounce(300),
      map(email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    )
  )
  
  return (
    <input 
      value={email}
      onChange={e => email$.next(e.target.value)}
      className={isValid ? 'valid' : 'invalid'}
    />
  )
}
```

### 模式 3: 数据获取

```tsx
function UserProfile({ userId }) {
  const { data, loading, error, refetch } = useFetch(
    `/api/users/${userId}`,
    { 
      immediate: true,
      retry: 3,
      timeout: 5000
    }
  )
  
  if (loading) return <Spinner />
  if (error) return <Error message={error.message} onRetry={refetch} />
  
  return <Profile user={data} />
}
```

### 模式 4: 实时计算

```tsx
function Calculator() {
  const [price, price$] = usePipel(100)
  const [quantity, quantity$] = usePipel(1)
  
  const total = useObservable(
    price$.pipe(
      promiseAll(quantity$),
      map(([p, q]) => p * q)
    )
  )
  
  return <div>Total: ${total}</div>
}
```

### 模式 5: 持久化设置

```tsx
function Settings() {
  const theme$ = persistStream$('light', { key: 'app-theme' })
  const [theme] = usePipel(theme$)
  
  return (
    <button onClick={() => theme$.next(theme === 'light' ? 'dark' : 'light')}>
      Toggle Theme: {theme}
    </button>
  )
}
```

## 🎯 最佳实践

### 1. 命名约定
```tsx
// ✅ 好的命名
const [count, count$] = usePipel(0)
const user$ = useStream(null)

// ❌ 避免
const [count, stream] = usePipel(0)
const userStream = useStream(null)
```

### 2. 类型注解
```tsx
// ✅ 明确类型
const [user, user$] = usePipel<User | null>(null)

// ✅ 类型推导
const [count, count$] = usePipel(0) // 自动推导为 number
```

### 3. 清理资源
```tsx
// ✅ 自动清理（推荐）
const value = useObservable(stream$)

// ✅ 手动清理（特殊情况）
useEffect(() => {
  const child = stream$.then(callback)
  return () => child.unsubscribe()
}, [stream$])
```

### 4. 避免循环依赖
```tsx
// ❌ 避免
const [a, a$] = usePipel(0)
const [b, b$] = usePipel(0)

useEffect(() => {
  a$.next(b)  // a 依赖 b
  b$.next(a)  // b 依赖 a - 循环！
}, [a, b])

// ✅ 使用操作符
const b = useObservable(a$.pipe(map(x => x * 2)))
```

### 5. 性能优化
```tsx
// ✅ 使用 distinctUntilChanged 避免重复更新
const filtered = useObservable(
  stream$.pipe(
    distinctUntilChanged(),
    map(transform)
  )
)

// ✅ 使用 debounce 减少计算
const debounced = useObservable(
  input$.pipe(
    debounce(300),
    map(expensiveComputation)
  )
)
```

## 🔍 调试技巧

### 1. 使用 tap 打印日志
```tsx
const result = useObservable(
  stream$.pipe(
    tap(value => console.log('Before:', value)),
    map(transform),
    tap(value => console.log('After:', value))
  )
)
```

### 2. 错误处理
```tsx
const result = useObservable(
  stream$.pipe(
    map(riskyOperation),
    catchError(error => {
      console.error('Error:', error)
      return of(defaultValue)
    })
  )
)
```

### 3. 监控状态变化
```tsx
effect$(stream$, (value) => {
  console.log('Stream updated:', value)
})
```

## 📦 项目结构建议

```
src/
├── hooks/              # 自定义 Hooks
│   ├── useAuth.ts
│   └── useData.ts
├── streams/            # Stream 定义
│   ├── user$.ts
│   └── settings$.ts
├── components/         # 组件
│   ├── Counter.tsx
│   └── SearchBox.tsx
└── utils/              # 工具函数
    └── api.ts
```

## 🔗 相关资源

- [完整文档](./README.md)
- [API 参考](./README.md#-api-reference)
- [示例代码](./examples)
- [项目概览](./PROJECT_OVERVIEW.md)

## 💬 获取帮助

- GitHub Issues: [提交问题](https://github.com/pipeljs/pipel/issues)
- 文档: [在线文档](https://pipeljs.dev)

---

**快速开始**: `pnpm add pipel-react pipeljs`
