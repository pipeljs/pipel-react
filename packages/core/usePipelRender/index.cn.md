# usePipelRender

基于 Stream 的条件渲染 Hook，简化复杂的渲染逻辑。

## 签名

```typescript
function usePipelRender<T>(stream$: Stream<T>, renderMap: RenderMap<T>): ReactNode

type RenderMap<T> = {
  [K in keyof T]?: (value: T[K]) => ReactNode
} & {
  default?: (value: T) => ReactNode
}
```

## 参数

| 参数        | 类型           | 说明            |
| ----------- | -------------- | --------------- |
| `stream$`   | `Stream<T>`    | 要监听的 Stream |
| `renderMap` | `RenderMap<T>` | 渲染映射对象    |

## 返回值

返回 `ReactNode`，根据 Stream 的值渲染对应的组件。

## 基础用法

### 简单状态渲染

```tsx
import { usePipelRender } from 'pipel-react'
import { useStream } from 'pipel-react'

function StatusDisplay() {
  const status$ = useStream<'loading' | 'success' | 'error'>('loading')

  const content = usePipelRender(status$, {
    loading: () => <div>加载中...</div>,
    success: () => <div>加载成功！</div>,
    error: () => <div>加载失败</div>,
  })

  return (
    <div>
      {content}
      <button onClick={() => status$.next('success')}>成功</button>
      <button onClick={() => status$.next('error')}>失败</button>
    </div>
  )
}
```

### 带数据的渲染

```tsx
import { usePipelRender } from 'pipel-react'

type ViewState =
  | { type: 'loading' }
  | { type: 'success'; data: User[] }
  | { type: 'error'; message: string }

function UserList() {
  const state$ = useStream<ViewState>({ type: 'loading' })

  const content = usePipelRender(state$, {
    loading: () => <Spinner />,
    success: (state) => <List users={state.data} />,
    error: (state) => <Error message={state.message} />,
  })

  return <div>{content}</div>
}
```

## 高级用法

### 默认渲染

```tsx
import { usePipelRender } from 'pipel-react'

function DynamicView() {
  const view$ = useStream<string>('home')

  const content = usePipelRender(view$, {
    home: () => <HomePage />,
    about: () => <AboutPage />,
    contact: () => <ContactPage />,
    default: (view) => <NotFound page={view} />,
  })

  return <div>{content}</div>
}
```

### 异步数据加载

```tsx
import { usePipelRender } from 'pipel-react'
import { asyncStream$ } from 'pipel-react'

function AsyncDataView() {
  const fetchData = async () => {
    const res = await fetch('/api/data')
    return res.json()
  }

  const { data$, loading$, error$ } = asyncStream$(fetchData)

  // 组合多个 Stream
  const state$ = useStream<{
    loading: boolean
    data: any
    error: Error | null
  }>({
    loading: true,
    data: null,
    error: null,
  })

  useEffect(() => {
    const loadingChild = loading$.then((loading) => {
      state$.set((s) => {
        s.loading = loading
      })
    })
    const dataChild = data$.then((data) => {
      state$.set((s) => {
        s.data = data
      })
    })
    const errorChild = error$.then((error) => {
      state$.set((s) => {
        s.error = error
      })
    })

    return () => {
      loadingChild.unsubscribe()
      dataChild.unsubscribe()
      errorChild.unsubscribe()
    }
  }, [])

  const content = usePipelRender(state$, {
    loading: (state) => (state.loading ? <Loading /> : null),
    error: (state) => (state.error ? <Error error={state.error} /> : null),
    data: (state) => (state.data ? <DataDisplay data={state.data} /> : null),
  })

  return <div>{content}</div>
}
```

### 多步骤表单

```tsx
import { usePipelRender } from 'pipel-react'

type FormStep = 'personal' | 'contact' | 'review' | 'complete'

function MultiStepForm() {
  const step$ = useStream<FormStep>('personal')
  const [formData, setFormData] = useState({
    personal: {},
    contact: {},
  })

  const content = usePipelRender(step$, {
    personal: () => (
      <PersonalInfo
        data={formData.personal}
        onNext={(data) => {
          setFormData((prev) => ({ ...prev, personal: data }))
          step$.next('contact')
        }}
      />
    ),
    contact: () => (
      <ContactInfo
        data={formData.contact}
        onNext={(data) => {
          setFormData((prev) => ({ ...prev, contact: data }))
          step$.next('review')
        }}
        onBack={() => step$.next('personal')}
      />
    ),
    review: () => (
      <Review
        data={formData}
        onSubmit={() => step$.next('complete')}
        onBack={() => step$.next('contact')}
      />
    ),
    complete: () => <Success />,
  })

  return (
    <div>
      <StepIndicator current={step$.value} />
      {content}
    </div>
  )
}
```

### 权限控制

```tsx
import { usePipelRender } from 'pipel-react'

type UserRole = 'guest' | 'user' | 'admin'

function ProtectedContent() {
  const role$ = useStream<UserRole>('guest')

  const content = usePipelRender(role$, {
    guest: () => <LoginPrompt />,
    user: () => <UserDashboard />,
    admin: () => <AdminPanel />,
    default: () => <AccessDenied />,
  })

  return <div>{content}</div>
}
```

### 路由视图

```tsx
import { usePipelRender } from 'pipel-react'

type Route =
  | { path: '/'; params: {} }
  | { path: '/user/:id'; params: { id: string } }
  | { path: '/post/:id'; params: { id: string } }

function Router() {
  const route$ = useStream<Route>({ path: '/', params: {} })

  const content = usePipelRender(route$, {
    '/': () => <HomePage />,
    '/user/:id': (route) => <UserPage userId={route.params.id} />,
    '/post/:id': (route) => <PostPage postId={route.params.id} />,
    default: () => <NotFound />,
  })

  return <div>{content}</div>
}
```

### 主题切换

```tsx
import { usePipelRender } from 'pipel-react'

type Theme = 'light' | 'dark' | 'auto'

function ThemedApp() {
  const theme$ = useStream<Theme>('auto')

  const themeClass = usePipelRender(theme$, {
    light: () => 'theme-light',
    dark: () => 'theme-dark',
    auto: () => {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      return isDark ? 'theme-dark' : 'theme-light'
    },
  })

  return (
    <div className={themeClass}>
      <ThemeSelector theme$={theme$} />
      <AppContent />
    </div>
  )
}
```

## 特性

- ✅ 声明式条件渲染
- ✅ 类型安全的渲染映射
- ✅ 支持默认渲染
- ✅ 自动订阅管理
- ✅ 简化复杂渲染逻辑
- ✅ TypeScript 完整支持

## 注意事项

1. 渲染函数应该是纯函数
2. 避免在渲染函数中执行副作用
3. 使用 `default` 处理未匹配的情况
4. Stream 变化时会自动重新渲染
5. 组件卸载时自动清理订阅

## 与传统方式的对比

### 传统方式

```tsx
function StatusView() {
  const [status, setStatus] = useState('loading')

  if (status === 'loading') return <Loading />
  if (status === 'error') return <Error />
  if (status === 'success') return <Success />
  return null
}
```

### 使用 usePipelRender

```tsx
function StatusView() {
  const status$ = useStream('loading')

  return usePipelRender(status$, {
    loading: () => <Loading />,
    error: () => <Error />,
    success: () => <Success />,
  })
}
```

## 最佳实践

### 提取渲染函数

```tsx
const renderMap = {
  loading: () => <Loading />,
  success: (data) => <Success data={data} />,
  error: (error) => <Error error={error} />,
}

function MyComponent() {
  const state$ = useStream('loading')
  return usePipelRender(state$, renderMap)
}
```

### 组合使用

```tsx
function ComplexView() {
  const auth$ = useStream<'authenticated' | 'guest'>('guest')
  const loading$ = useStream(false)

  const authContent = usePipelRender(auth$, {
    authenticated: () => <Dashboard />,
    guest: () => <Login />,
  })

  return usePipelRender(loading$, {
    true: () => <Loading />,
    false: () => authContent,
  })
}
```

## 相关链接

- [usePipel](/cn/core/usePipel/index.cn) - Stream 状态管理
- [useStream](/cn/core/useStream/index.cn) - 创建稳定的 Stream
- [asyncStream$](/cn/core/asyncStream$/index.cn) - 异步数据流
