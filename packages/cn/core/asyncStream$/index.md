# asyncStream$

创建一个异步流，自动管理加载、错误和数据状态。

## 签名

```typescript
function asyncStream$<T, Args extends any[] = []>(
  fetcher: (...args: Args) => Promise<T>
): {
  data$: Stream<T | undefined>
  loading$: Stream<boolean>
  error$: Stream<Error | undefined>
  execute: (...args: Args) => Promise<void>
}
```

## 参数

| 参数      | 类型                            | 说明                    |
| --------- | ------------------------------- | ----------------------- |
| `fetcher` | `(...args: Args) => Promise<T>` | 返回 Promise 的异步函数 |

## 返回值

返回一个包含四个属性的对象：

| 属性       | 类型                               | 说明                  |
| ---------- | ---------------------------------- | --------------------- |
| `data$`    | `Stream<T \| undefined>`           | 包含获取数据的 Stream |
| `loading$` | `Stream<boolean>`                  | 表示加载状态的 Stream |
| `error$`   | `Stream<Error \| undefined>`       | 包含错误信息的 Stream |
| `execute`  | `(...args: Args) => Promise<void>` | 触发获取的函数        |

## 基础用法

### 简单异步操作

```tsx
import { asyncStream$ } from 'pipel-react'
import { usePipel } from 'pipel-react'

function UserProfile({ userId }) {
  const fetchUser = async (id: string) => {
    const res = await fetch(`/api/users/${id}`)
    return res.json()
  }

  const { data$, loading$, error$, execute } = asyncStream$(fetchUser)

  const [user] = usePipel(data$)
  const [loading] = usePipel(loading$)
  const [error] = usePipel(error$)

  useEffect(() => {
    execute(userId)
  }, [userId])

  if (loading) return <div>加载中...</div>
  if (error) return <div>错误: {error.message}</div>
  if (!user) return null

  return <div>{user.name}</div>
}
```

### 手动触发

```tsx
import { asyncStream$ } from 'pipel-react'

function SearchBox() {
  const searchAPI = async (keyword: string) => {
    const res = await fetch(`/api/search?q=${keyword}`)
    return res.json()
  }

  const { data$, loading$, execute } = asyncStream$(searchAPI)

  const [results] = usePipel(data$)
  const [loading] = usePipel(loading$)

  const handleSearch = (e) => {
    execute(e.target.value)
  }

  return (
    <div>
      <input onChange={handleSearch} />
      {loading && <Spinner />}
      <Results data={results} />
    </div>
  )
}
```

## 高级用法

### 带参数的异步操作

```tsx
import { asyncStream$ } from 'pipel-react'

function ProductList() {
  const fetchProducts = async (category: string, page: number) => {
    const res = await fetch(`/api/products?category=${category}&page=${page}`)
    return res.json()
  }

  const { data$, loading$, error$, execute } = asyncStream$(fetchProducts)

  const [products] = usePipel(data$)
  const [loading] = usePipel(loading$)

  const loadMore = () => {
    execute('electronics', 2)
  }

  return (
    <div>
      <ProductGrid products={products} />
      <button onClick={loadMore} disabled={loading}>
        {loading ? '加载中...' : '加载更多'}
      </button>
    </div>
  )
}
```

### 组合多个异步流

```tsx
import { asyncStream$ } from 'pipel-react'

function Dashboard() {
  const { data$: users$, execute: fetchUsers } = asyncStream$(async () => {
    const res = await fetch('/api/users')
    return res.json()
  })

  const { data$: posts$, execute: fetchPosts } = asyncStream$(async () => {
    const res = await fetch('/api/posts')
    return res.json()
  })

  const [users] = usePipel(users$)
  const [posts] = usePipel(posts$)

  useEffect(() => {
    fetchUsers()
    fetchPosts()
  }, [])

  return (
    <div>
      <UserList users={users} />
      <PostList posts={posts} />
    </div>
  )
}
```

### 错误处理

```tsx
import { asyncStream$ } from 'pipel-react'

function DataFetcher() {
  const fetchData = async () => {
    const res = await fetch('/api/data')
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`)
    }
    return res.json()
  }

  const { data$, loading$, error$, execute } = asyncStream$(fetchData)

  const [data] = usePipel(data$)
  const [loading] = usePipel(loading$)
  const [error] = usePipel(error$)

  useEffect(() => {
    execute()
  }, [])

  if (loading) return <Loading />

  if (error) {
    return (
      <div>
        <p>加载失败: {error.message}</p>
        <button onClick={() => execute()}>重试</button>
      </div>
    )
  }

  return <DataDisplay data={data} />
}
```

### 配合防抖使用

```tsx
import { asyncStream$ } from 'pipel-react'
import { debounce } from 'pipeljs'

function AutoComplete() {
  const searchAPI = async (keyword: string) => {
    const res = await fetch(`/api/search?q=${keyword}`)
    return res.json()
  }

  const { data$, loading$, execute } = asyncStream$(searchAPI)

  const [keyword, keyword$] = usePipel('')
  const [results] = usePipel(data$)
  const [loading] = usePipel(loading$)

  useEffect(() => {
    const child = keyword$.pipe(debounce(300)).then((value) => {
      if (value.length > 2) {
        execute(value)
      }
    })

    return () => child.unsubscribe()
  }, [])

  return (
    <div>
      <input value={keyword} onChange={(e) => keyword$.next(e.target.value)} />
      {loading && <Spinner />}
      <Suggestions data={results} />
    </div>
  )
}
```

## 特性

- ✅ 自动状态管理（data、loading、error）
- ✅ 支持带参数的异步函数
- ✅ 手动触发执行
- ✅ 自动错误捕获
- ✅ TypeScript 类型推导
- ✅ 可组合多个异步流

## 注意事项

1. `execute` 函数可以多次调用
2. 每次调用 `execute` 都会更新 loading 状态
3. 错误会自动捕获并存储在 `error$` 中
4. 数据在成功获取后存储在 `data$` 中
5. 所有 Stream 都可以独立订阅

## 与 useFetch 的对比

| 特性     | asyncStream$    | useFetch         |
| -------- | --------------- | ---------------- |
| 返回值   | 多个独立 Stream | 单个对象         |
| 自动执行 | 否              | 可选             |
| 灵活性   | 更高            | 更简单           |
| 使用场景 | 需要细粒度控制  | 简单的 HTTP 请求 |

## 相关链接

- [useFetch](/cn/core/useFetch/index.cn) - HTTP 请求 Hook
- [effect$](/cn/core/effect$/index.cn) - 副作用处理
- [usePipel](/cn/core/usePipel/index.cn) - Stream 状态管理
