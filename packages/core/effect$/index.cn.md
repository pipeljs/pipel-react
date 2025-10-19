# effect$

响应 Observable 变化执行副作用，并自动清理。

## 签名

```typescript
function effect$<T>(observable$: Observable<T>, callback: (value: T) => void | (() => void)): void
```

## 参数

| 参数          | 类型                                 | 说明                         |
| ------------- | ------------------------------------ | ---------------------------- |
| `observable$` | `Observable<T>`                      | 要订阅的 Observable          |
| `callback`    | `(value: T) => void \| (() => void)` | 副作用函数，可选返回清理函数 |

## 返回值

返回 `void`。副作用在组件生命周期内自动管理。

## 基础用法

### 简单副作用

```tsx
import { effect$ } from 'pipel-react'
import { usePipel } from 'pipel-react'

function Logger() {
  const [count, count$] = usePipel(0)

  effect$(count$, (value) => {
    console.log('计数变化:', value)
  })

  return <button onClick={() => count$.next(count + 1)}>计数: {count}</button>
}
```

### 带清理函数

```tsx
import { effect$ } from 'pipel-react'

function Timer() {
  const [isActive, isActive$] = usePipel(false)

  effect$(isActive$, (active) => {
    if (!active) return

    const timer = setInterval(() => {
      console.log('滴答')
    }, 1000)

    // 清理函数
    return () => {
      clearInterval(timer)
      console.log('定时器已停止')
    }
  })

  return (
    <button onClick={() => isActive$.next(!isActive)}>{isActive ? '停止' : '启动'} 定时器</button>
  )
}
```

## 高级用法

### DOM 操作

```tsx
import { effect$ } from 'pipel-react'

function ScrollTracker() {
  const [scrollY, scrollY$] = usePipel(0)

  effect$(scrollY$, (y) => {
    const header = document.querySelector('.header')
    if (header) {
      header.style.transform = `translateY(${y > 100 ? '-100%' : '0'})`
    }
  })

  useEffect(() => {
    const handleScroll = () => scrollY$.next(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return <div>滚动位置: {scrollY}</div>
}
```

### 本地存储同步

```tsx
import { effect$ } from 'pipel-react'

function Settings() {
  const [theme, theme$] = usePipel('light')

  effect$(theme$, (value) => {
    localStorage.setItem('theme', value)
    document.body.className = value
  })

  return (
    <button onClick={() => theme$.next(theme === 'light' ? 'dark' : 'light')}>
      切换主题: {theme}
    </button>
  )
}
```

### WebSocket 连接

```tsx
import { effect$ } from 'pipel-react'

function ChatRoom({ roomId$ }) {
  const [messages, setMessages] = useState([])

  effect$(roomId$, (roomId) => {
    const ws = new WebSocket(`ws://chat.example.com/${roomId}`)

    ws.onmessage = (event) => {
      setMessages((prev) => [...prev, JSON.parse(event.data)])
    }

    // 清理函数：关闭 WebSocket
    return () => {
      ws.close()
    }
  })

  return <MessageList messages={messages} />
}
```

### 事件监听

```tsx
import { effect$ } from 'pipel-react'

function KeyboardShortcuts() {
  const [isEnabled, isEnabled$] = usePipel(true)

  effect$(isEnabled$, (enabled) => {
    if (!enabled) return

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault()
        console.log('保存快捷键触发')
      }
    }

    window.addEventListener('keydown', handleKeyPress)

    return () => {
      window.removeEventListener('keydown', handleKeyPress)
    }
  })

  return (
    <div>
      <label>
        <input
          type="checkbox"
          checked={isEnabled}
          onChange={(e) => isEnabled$.next(e.target.checked)}
        />
        启用快捷键
      </label>
    </div>
  )
}
```

### 多个副作用

```tsx
import { effect$ } from 'pipel-react'

function Analytics() {
  const [page, page$] = usePipel('home')

  // 副作用 1：页面浏览统计
  effect$(page$, (pageName) => {
    console.log('页面浏览:', pageName)
    analytics.track('page_view', { page: pageName })
  })

  // 副作用 2：更新文档标题
  effect$(page$, (pageName) => {
    document.title = `${pageName} - 我的应用`
  })

  // 副作用 3：滚动到顶部
  effect$(page$, () => {
    window.scrollTo(0, 0)
  })

  return (
    <nav>
      <button onClick={() => page$.next('home')}>首页</button>
      <button onClick={() => page$.next('about')}>关于</button>
    </nav>
  )
}
```

### 条件副作用

```tsx
import { effect$ } from 'pipel-react'

function ConditionalEffect() {
  const [user, user$] = usePipel(null)

  effect$(user$, (user) => {
    // 只在用户登录时执行
    if (!user) return

    console.log('用户已登录:', user.name)

    // 启动心跳检测
    const heartbeat = setInterval(() => {
      fetch('/api/heartbeat', {
        headers: { Authorization: `Bearer ${user.token}` },
      })
    }, 30000)

    return () => {
      clearInterval(heartbeat)
      console.log('心跳检测已停止')
    }
  })

  return <UserProfile user={user} />
}
```

## 特性

- ✅ 自动订阅管理
- ✅ 支持清理函数
- ✅ 组件卸载时自动清理
- ✅ 可以有多个副作用
- ✅ TypeScript 类型安全
- ✅ 与 React 生命周期集成

## 注意事项

1. 副作用在每次 Observable 发出值时执行
2. 清理函数在下次副作用执行前和组件卸载时调用
3. 如果回调返回非函数值，不会执行清理
4. 避免在副作用中修改组件状态，可能导致无限循环
5. 副作用应该是幂等的（多次执行结果相同）

## 与 useEffect 的对比

| 特性     | effect$         | useEffect  |
| -------- | --------------- | ---------- |
| 触发时机 | Observable 变化 | 依赖项变化 |
| 清理     | 自动            | 手动返回   |
| 订阅管理 | 自动            | 手动       |
| 使用场景 | 响应式数据流    | React 状态 |

## 最佳实践

### 避免副作用中的状态更新

```tsx
// ❌ 不好：可能导致无限循环
effect$(count$, (value) => {
  setCount(value + 1) // 不要这样做
})

// ✅ 好：使用 Stream 操作符
const doubled$ = count$.pipe(map((x) => x * 2))
```

### 使用清理函数

```tsx
// ✅ 好：总是清理资源
effect$(stream$, (value) => {
  const subscription = externalAPI.subscribe(value)

  return () => {
    subscription.unsubscribe()
  }
})
```

## 相关链接

- [usePipel](/cn/core/usePipel/index.cn) - Stream 状态管理
- [useObservable](/cn/core/useObservable/index.cn) - 订阅 Observable
- [asyncStream$](/cn/core/asyncStream$/index.cn) - 异步数据流
