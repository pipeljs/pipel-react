# fromEvent

从 DOM 事件创建 Stream，实现声明式事件处理。

## 签名

```typescript
function fromEvent<K extends keyof HTMLElementEventMap>(
  target: EventTarget | null,
  eventName: K,
  options?: AddEventListenerOptions
): Stream<HTMLElementEventMap[K]>

function useFromEvent<K extends keyof HTMLElementEventMap>(
  target: EventTarget | null,
  eventName: K,
  options?: AddEventListenerOptions
): Stream<HTMLElementEventMap[K]>

function useWindowEvent<K extends keyof WindowEventMap>(
  eventName: K,
  options?: AddEventListenerOptions
): Stream<WindowEventMap[K]>

function useDocumentEvent<K extends keyof DocumentEventMap>(
  eventName: K,
  options?: AddEventListenerOptions
): Stream<DocumentEventMap[K]>
```

## 基础用法

### 监听元素事件

```tsx
import { fromEvent } from 'pipel-react'
import { useRef, useEffect } from 'react'

function ClickTracker() {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [clicks, setClicks] = useState(0)

  useEffect(() => {
    if (!buttonRef.current) return

    const click$ = fromEvent(buttonRef.current, 'click')
    const child = click$.then(() => {
      setClicks((prev) => prev + 1)
    })

    return () => child.unsubscribe()
  }, [])

  return (
    <div>
      <button ref={buttonRef}>点击我</button>
      <p>点击次数: {clicks}</p>
    </div>
  )
}
```

### 使用 useFromEvent Hook

```tsx
import { useFromEvent } from 'pipel-react'
import { useRef } from 'react'

function MouseTracker() {
  const divRef = useRef<HTMLDivElement>(null)
  const mousemove$ = useFromEvent(divRef.current, 'mousemove')

  const [position, setPosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const child = mousemove$.then((e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY })
    })

    return () => child.unsubscribe()
  }, [mousemove$])

  return (
    <div ref={divRef} style={{ width: '100%', height: '400px' }}>
      <p>
        鼠标位置: ({position.x}, {position.y})
      </p>
    </div>
  )
}
```

### 监听 Window 事件

```tsx
import { useWindowEvent } from 'pipel-react'

function ScrollIndicator() {
  const scroll$ = useWindowEvent('scroll')
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const child = scroll$.then(() => {
      setScrollY(window.scrollY)
    })

    return () => child.unsubscribe()
  }, [scroll$])

  const progress = (scrollY / (document.body.scrollHeight - window.innerHeight)) * 100

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: `${progress}%`,
        height: '4px',
        background: 'blue',
      }}
    />
  )
}
```

### 监听 Document 事件

```tsx
import { useDocumentEvent } from 'pipel-react'

function KeyboardShortcuts() {
  const keydown$ = useDocumentEvent('keydown')

  useEffect(() => {
    const child = keydown$.then((e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault()
        console.log('保存快捷键')
      }
    })

    return () => child.unsubscribe()
  }, [keydown$])

  return <div>按 Ctrl+S 保存</div>
}
```

## 高级用法

### 配合操作符使用

```tsx
import { useFromEvent } from 'pipel-react'
import { debounce, map, filter } from 'pipeljs'

function SearchBox() {
  const inputRef = useRef<HTMLInputElement>(null)
  const input$ = useFromEvent(inputRef.current, 'input')

  const [results, setResults] = useState([])

  useEffect(() => {
    const child = input$
      .pipe(
        map((e: Event) => (e.target as HTMLInputElement).value),
        debounce(300),
        filter((value) => value.length > 2),
        map((value) => fetchResults(value))
      )
      .then(setResults)

    return () => child.unsubscribe()
  }, [input$])

  return (
    <div>
      <input ref={inputRef} placeholder="搜索..." />
      <Results data={results} />
    </div>
  )
}
```

### 拖拽实现

```tsx
import { useFromEvent } from 'pipel-react'
import { useRef } from 'react'

function Draggable() {
  const boxRef = useRef<HTMLDivElement>(null)
  const mousedown$ = useFromEvent(boxRef.current, 'mousedown')
  const mousemove$ = useWindowEvent('mousemove')
  const mouseup$ = useWindowEvent('mouseup')

  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    let startX = 0,
      startY = 0

    const downChild = mousedown$.then((e: MouseEvent) => {
      setIsDragging(true)
      startX = e.clientX - position.x
      startY = e.clientY - position.y
    })

    const moveChild = mousemove$.then((e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - startX,
          y: e.clientY - startY,
        })
      }
    })

    const upChild = mouseup$.then(() => {
      setIsDragging(false)
    })

    return () => {
      downChild.unsubscribe()
      moveChild.unsubscribe()
      upChild.unsubscribe()
    }
  }, [mousedown$, mousemove$, mouseup$, isDragging, position])

  return (
    <div
      ref={boxRef}
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        width: '100px',
        height: '100px',
        background: 'blue',
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
    />
  )
}
```

### 双击检测

```tsx
import { useFromEvent } from 'pipel-react'
import { buffer, filter, map } from 'pipeljs'

function DoubleClickDetector() {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const click$ = useFromEvent(buttonRef.current, 'click')

  useEffect(() => {
    const doubleClick$ = click$.pipe(
      buffer(500), // 500ms 内的点击
      filter((clicks) => clicks.length === 2),
      map(() => 'double-click')
    )

    const child = doubleClick$.then(() => {
      console.log('检测到双击！')
    })

    return () => child.unsubscribe()
  }, [click$])

  return <button ref={buttonRef}>双击我</button>
}
```

### 长按检测

```tsx
import { useFromEvent } from 'pipel-react'

function LongPressButton() {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const mousedown$ = useFromEvent(buttonRef.current, 'mousedown')
  const mouseup$ = useFromEvent(buttonRef.current, 'mouseup')

  const [isLongPress, setIsLongPress] = useState(false)

  useEffect(() => {
    let timer: NodeJS.Timeout

    const downChild = mousedown$.then(() => {
      timer = setTimeout(() => {
        setIsLongPress(true)
        console.log('长按触发！')
      }, 1000)
    })

    const upChild = mouseup$.then(() => {
      clearTimeout(timer)
      setIsLongPress(false)
    })

    return () => {
      downChild.unsubscribe()
      upChild.unsubscribe()
      clearTimeout(timer)
    }
  }, [mousedown$, mouseup$])

  return (
    <button ref={buttonRef} style={{ background: isLongPress ? 'green' : 'gray' }}>
      长按我
    </button>
  )
}
```

### 窗口大小变化

```tsx
import { useWindowEvent } from 'pipel-react'
import { debounce } from 'pipeljs'

function ResponsiveLayout() {
  const resize$ = useWindowEvent('resize')
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  })

  useEffect(() => {
    const child = resize$.pipe(debounce(200)).then(() => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    })

    return () => child.unsubscribe()
  }, [resize$])

  return (
    <div>
      <p>
        窗口大小: {windowSize.width} x {windowSize.height}
      </p>
      {windowSize.width < 768 && <MobileLayout />}
      {windowSize.width >= 768 && <DesktopLayout />}
    </div>
  )
}
```

## 特性

- ✅ 声明式事件处理
- ✅ 自动清理事件监听器
- ✅ 支持所有 DOM 事件
- ✅ 可配合 Stream 操作符
- ✅ TypeScript 类型安全
- ✅ 支持事件选项（capture、passive 等）

## 注意事项

1. 事件监听器在组件卸载时自动移除
2. `target` 为 `null` 时不会添加监听器
3. 支持 `AddEventListenerOptions`（如 `{ passive: true }`）
4. 返回的 Stream 会发出原生事件对象
5. 使用 `useFromEvent` 时，Stream 引用保持稳定

## API 对比

| API                | 用途          | 自动清理 |
| ------------------ | ------------- | -------- |
| `fromEvent`        | 通用事件监听  | 需手动   |
| `useFromEvent`     | Hook 版本     | 自动     |
| `useWindowEvent`   | Window 事件   | 自动     |
| `useDocumentEvent` | Document 事件 | 自动     |

## 最佳实践

### 使用 Hook 版本

```tsx
// ✅ 推荐：使用 Hook 版本
const click$ = useFromEvent(buttonRef.current, 'click')

// ❌ 不推荐：手动管理
useEffect(() => {
  const click$ = fromEvent(buttonRef.current, 'click')
  return () => click$.unsubscribe()
}, [])
```

### 配合防抖

```tsx
// ✅ 好：防抖优化性能
const scroll$ = useWindowEvent('scroll')
const debouncedScroll$ = scroll$.pipe(debounce(100))
```

## 相关链接

- [effect$](/cn/core/effect$/index.cn) - 副作用处理
- [usePipel](/cn/core/usePipel/index.cn) - Stream 状态管理
- [debounce](/cn/operators/debounce) - 防抖操作符
