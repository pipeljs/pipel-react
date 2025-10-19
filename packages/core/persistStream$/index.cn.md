# persistStream$

创建持久化的 Stream，自动同步到 localStorage。

## 签名

```typescript
function persistStream$<T>(
  key: string,
  initialValue: T,
  serializer?: PersistSerializer<T>
): Stream<T>

interface PersistSerializer<T> {
  serialize: (value: T) => string
  deserialize: (value: string) => T
}
```

## 参数

| 参数           | 类型                   | 说明                                   |
| -------------- | ---------------------- | -------------------------------------- |
| `key`          | `string`               | localStorage 的键名                    |
| `initialValue` | `T`                    | 初始值（如果 localStorage 中没有数据） |
| `serializer`   | `PersistSerializer<T>` | 可选的序列化器                         |

## 返回值

返回一个 `Stream<T>`，会自动同步到 localStorage。

## 基础用法

### 持久化简单值

```tsx
import { persistStream$ } from 'pipel-react'
import { usePipel } from 'pipel-react'

// 在组件外部创建
const theme$ = persistStream$('app-theme', 'light')

function ThemeToggle() {
  const [theme] = usePipel(theme$)

  const toggleTheme = () => {
    theme$.next(theme === 'light' ? 'dark' : 'light')
  }

  return <button onClick={toggleTheme}>当前主题: {theme}</button>
}
```

### 持久化对象

```tsx
import { persistStream$ } from 'pipel-react'

const settings$ = persistStream$('app-settings', {
  language: 'zh-CN',
  fontSize: 14,
  notifications: true,
})

function Settings() {
  const [settings] = usePipel(settings$)

  const updateLanguage = (lang: string) => {
    settings$.set((s) => {
      s.language = lang
    })
  }

  return (
    <div>
      <select value={settings.language} onChange={(e) => updateLanguage(e.target.value)}>
        <option value="zh-CN">简体中文</option>
        <option value="en-US">English</option>
      </select>
    </div>
  )
}
```

### 持久化数组

```tsx
import { persistStream$ } from 'pipel-react'

const todos$ = persistStream$('todos', [])

function TodoList() {
  const [todos] = usePipel(todos$)

  const addTodo = (text: string) => {
    todos$.set((list) => {
      list.push({ id: Date.now(), text, done: false })
    })
  }

  const toggleTodo = (id: number) => {
    todos$.set((list) => {
      const todo = list.find((t) => t.id === id)
      if (todo) todo.done = !todo.done
    })
  }

  return (
    <div>
      {todos.map((todo) => (
        <div key={todo.id}>
          <input type="checkbox" checked={todo.done} onChange={() => toggleTodo(todo.id)} />
          <span>{todo.text}</span>
        </div>
      ))}
    </div>
  )
}
```

## 高级用法

### 自定义序列化器

```tsx
import { persistStream$ } from 'pipel-react'

// 使用自定义序列化器处理 Date 对象
const lastVisit$ = persistStream$('last-visit', new Date(), {
  serialize: (date) => date.toISOString(),
  deserialize: (str) => new Date(str),
})

function LastVisit() {
  const [lastVisit] = usePipel(lastVisit$)

  useEffect(() => {
    lastVisit$.next(new Date())
  }, [])

  return <div>上次访问: {lastVisit.toLocaleString()}</div>
}
```

### 用户偏好设置

```tsx
import { persistStream$ } from 'pipel-react'

interface UserPreferences {
  theme: 'light' | 'dark'
  language: string
  fontSize: number
  sidebarCollapsed: boolean
}

const preferences$ = persistStream$<UserPreferences>('user-preferences', {
  theme: 'light',
  language: 'zh-CN',
  fontSize: 14,
  sidebarCollapsed: false,
})

function PreferencesPanel() {
  const [prefs] = usePipel(preferences$)

  const updateTheme = (theme: 'light' | 'dark') => {
    preferences$.set((p) => {
      p.theme = theme
    })
  }

  const updateFontSize = (size: number) => {
    preferences$.set((p) => {
      p.fontSize = size
    })
  }

  return (
    <div>
      <div>
        <label>主题</label>
        <select value={prefs.theme} onChange={(e) => updateTheme(e.target.value as any)}>
          <option value="light">浅色</option>
          <option value="dark">深色</option>
        </select>
      </div>

      <div>
        <label>字体大小: {prefs.fontSize}px</label>
        <input
          type="range"
          min="12"
          max="20"
          value={prefs.fontSize}
          onChange={(e) => updateFontSize(Number(e.target.value))}
        />
      </div>
    </div>
  )
}
```

### 购物车

```tsx
import { persistStream$ } from 'pipel-react'

interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
}

const cart$ = persistStream$<CartItem[]>('shopping-cart', [])

function ShoppingCart() {
  const [cart] = usePipel(cart$)

  const addToCart = (product: Omit<CartItem, 'quantity'>) => {
    cart$.set((items) => {
      const existing = items.find((item) => item.id === product.id)
      if (existing) {
        existing.quantity++
      } else {
        items.push({ ...product, quantity: 1 })
      }
    })
  }

  const removeFromCart = (id: number) => {
    cart$.set((items) => {
      const index = items.findIndex((item) => item.id === id)
      if (index > -1) {
        items.splice(index, 1)
      }
    })
  }

  const updateQuantity = (id: number, quantity: number) => {
    cart$.set((items) => {
      const item = items.find((i) => i.id === id)
      if (item) {
        item.quantity = quantity
      }
    })
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <div>
      <h2>购物车</h2>
      {cart.map((item) => (
        <div key={item.id}>
          <span>{item.name}</span>
          <span>¥{item.price}</span>
          <input
            type="number"
            value={item.quantity}
            onChange={(e) => updateQuantity(item.id, Number(e.target.value))}
          />
          <button onClick={() => removeFromCart(item.id)}>删除</button>
        </div>
      ))}
      <div>总计: ¥{total}</div>
    </div>
  )
}
```

### 表单草稿

```tsx
import { persistStream$ } from 'pipel-react'
import { debounce } from 'pipeljs'

interface FormDraft {
  title: string
  content: string
  tags: string[]
}

const draft$ = persistStream$<FormDraft>('post-draft', {
  title: '',
  content: '',
  tags: [],
})

function PostEditor() {
  const [draft] = usePipel(draft$)

  // 自动保存（防抖）
  useEffect(() => {
    const child = draft$.pipe(debounce(1000)).then(() => {
      console.log('草稿已自动保存')
    })

    return () => child.unsubscribe()
  }, [])

  const updateTitle = (title: string) => {
    draft$.set((d) => {
      d.title = title
    })
  }

  const updateContent = (content: string) => {
    draft$.set((d) => {
      d.content = content
    })
  }

  const clearDraft = () => {
    draft$.next({
      title: '',
      content: '',
      tags: [],
    })
  }

  return (
    <div>
      <input value={draft.title} onChange={(e) => updateTitle(e.target.value)} placeholder="标题" />
      <textarea
        value={draft.content}
        onChange={(e) => updateContent(e.target.value)}
        placeholder="内容"
      />
      <button onClick={clearDraft}>清空草稿</button>
    </div>
  )
}
```

### 多标签页同步

```tsx
import { persistStream$ } from 'pipel-react'

const counter$ = persistStream$('shared-counter', 0)

function SharedCounter() {
  const [count] = usePipel(counter$)

  // 监听 storage 事件，实现跨标签页同步
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'shared-counter' && e.newValue) {
        counter$.next(JSON.parse(e.newValue))
      }
    }

    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  return (
    <div>
      <p>计数: {count}</p>
      <p>在多个标签页中打开此页面，计数会同步！</p>
      <button onClick={() => counter$.next(count + 1)}>增加</button>
    </div>
  )
}
```

## 特性

- ✅ 自动持久化到 localStorage
- ✅ 支持复杂对象和数组
- ✅ 自定义序列化器
- ✅ 不可变数据更新
- ✅ TypeScript 类型安全
- ✅ 可跨标签页同步

## 注意事项

1. `persistStream$` 应该在组件外部创建，作为全局 Stream
2. 默认使用 `JSON.stringify/parse` 序列化
3. localStorage 有大小限制（通常 5-10MB）
4. 不支持 SSR（服务端渲染）
5. 序列化失败会使用初始值

## 最佳实践

### 在组件外部创建

```tsx
// ✅ 好：在组件外部创建
const theme$ = persistStream$('theme', 'light')

function App() {
  const [theme] = usePipel(theme$)
  return <div>{theme}</div>
}

// ❌ 不好：在组件内部创建
function App() {
  const theme$ = persistStream$('theme', 'light') // 每次渲染都会创建新实例
  const [theme] = usePipel(theme$)
  return <div>{theme}</div>
}
```

### 使用 set 方法更新

```tsx
// ✅ 好：使用 set 方法
settings$.set((s) => {
  s.theme = 'dark'
})

// ✅ 也可以：使用 next 方法
settings$.next({ ...settings$.value, theme: 'dark' })
```

### 处理序列化错误

```tsx
const data$ = persistStream$('complex-data', defaultValue, {
  serialize: (value) => {
    try {
      return JSON.stringify(value)
    } catch (error) {
      console.error('序列化失败:', error)
      return JSON.stringify(defaultValue)
    }
  },
  deserialize: (str) => {
    try {
      return JSON.parse(str)
    } catch (error) {
      console.error('反序列化失败:', error)
      return defaultValue
    }
  },
})
```

## 相关链接

- [usePipel](/cn/core/usePipel/index.cn) - Stream 状态管理
- [useStream](/cn/core/useStream/index.cn) - 创建稳定的 Stream
- [asyncStream$](/cn/core/asyncStream$/index.cn) - 异步数据流
