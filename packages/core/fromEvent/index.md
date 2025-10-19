# fromEvent

Create a Stream from DOM events with automatic cleanup.

## Signature

```typescript
function fromEvent<K extends keyof WindowEventMap>(
  target: Window,
  eventName: K,
  options?: AddEventListenerOptions
): Stream<WindowEventMap[K]>

function fromEvent<K extends keyof DocumentEventMap>(
  target: Document,
  eventName: K,
  options?: AddEventListenerOptions
): Stream<DocumentEventMap[K]>

function fromEvent<K extends keyof HTMLElementEventMap>(
  target: HTMLElement,
  eventName: K,
  options?: AddEventListenerOptions
): Stream<HTMLElementEventMap[K]>

function fromEvent<T extends Event>(
  target: EventTarget,
  eventName: string,
  options?: AddEventListenerOptions
): Stream<T>
```

## Parameters

| Parameter   | Type                      | Description                          |
| ----------- | ------------------------- | ------------------------------------ |
| `target`    | `EventTarget`             | DOM element, window, or document     |
| `eventName` | `string`                  | Event name (e.g., 'click', 'scroll') |
| `options`   | `AddEventListenerOptions` | Optional event listener options      |

## Returns

Returns a `Stream<Event>` that emits whenever the event fires.

## Basic Usage

### Click Events

```tsx
import { fromEvent } from 'pipel-react'
import { useRef, useEffect } from 'react'

function ClickCounter() {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!buttonRef.current) return

    const click$ = fromEvent(buttonRef.current, 'click')
    const child = click$.then(() => setCount((c) => c + 1))

    return () => child.unsubscribe()
  }, [])

  return (
    <div>
      <button ref={buttonRef}>Click me</button>
      <p>Clicks: {count}</p>
    </div>
  )
}
```

### Window Events

```tsx
import { fromEvent } from 'pipel-react'

function WindowSize() {
  const [size, setSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const resize$ = fromEvent(window, 'resize')

    const child = resize$.then(() => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    })

    // Set initial size
    setSize({
      width: window.innerWidth,
      height: window.innerHeight,
    })

    return () => child.unsubscribe()
  }, [])

  return (
    <div>
      Window: {size.width} x {size.height}
    </div>
  )
}
```

## Advanced Usage

### With Stream Operators

```tsx
import { fromEvent } from 'pipel-react'
import { debounce, map } from 'pipeljs'

function SearchBox() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [results, setResults] = useState([])

  useEffect(() => {
    if (!inputRef.current) return

    const input$ = fromEvent(inputRef.current, 'input')

    const child = input$
      .pipe(
        debounce(300),
        map((e) => (e.target as HTMLInputElement).value),
        filter((value) => value.length > 2),
        map((value) => searchAPI(value))
      )
      .then((data) => setResults(data))

    return () => child.unsubscribe()
  }, [])

  return (
    <div>
      <input ref={inputRef} placeholder="Search..." />
      <Results data={results} />
    </div>
  )
}
```

### Scroll Position

```tsx
import { fromEvent } from 'pipel-react'
import { throttle } from 'pipeljs'

function ScrollProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const scroll$ = fromEvent(window, 'scroll')

    const child = scroll$.pipe(throttle(100)).then(() => {
      const winScroll = document.documentElement.scrollTop
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight
      const scrolled = (winScroll / height) * 100

      setProgress(scrolled)
    })

    return () => child.unsubscribe()
  }, [])

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

### Mouse Position

```tsx
import { fromEvent } from 'pipel-react'

function MouseTracker() {
  const [position, setPosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const move$ = fromEvent(document, 'mousemove')

    const child = move$.then((e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY })
    })

    return () => child.unsubscribe()
  }, [])

  return (
    <div>
      Mouse: ({position.x}, {position.y})
    </div>
  )
}
```

### Keyboard Shortcuts

```tsx
import { fromEvent } from 'pipel-react'
import { filter } from 'pipeljs'

function KeyboardShortcuts() {
  useEffect(() => {
    const keydown$ = fromEvent(document, 'keydown')

    // Ctrl+S to save
    const save$ = keydown$.pipe(filter((e: KeyboardEvent) => e.ctrlKey && e.key === 's'))

    const child = save$.then((e: KeyboardEvent) => {
      e.preventDefault()
      handleSave()
    })

    return () => child.unsubscribe()
  }, [])

  return <div>Press Ctrl+S to save</div>
}
```

### Form Validation

```tsx
import { fromEvent } from 'pipel-react'
import { debounce, map } from 'pipeljs'

function EmailInput() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isValid, setIsValid] = useState(false)

  useEffect(() => {
    if (!inputRef.current) return

    const input$ = fromEvent(inputRef.current, 'input')

    const child = input$
      .pipe(
        debounce(500),
        map((e) => (e.target as HTMLInputElement).value),
        map((email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      )
      .then((valid) => setIsValid(valid))

    return () => child.unsubscribe()
  }, [])

  return (
    <div>
      <input ref={inputRef} type="email" placeholder="Enter email" />
      {isValid ? '✓ Valid' : '✗ Invalid'}
    </div>
  )
}
```

## Hooks Integration

### useFromEvent

For easier integration:

```tsx
import { useFromEvent } from 'pipel-react'

function Component() {
  const buttonRef = useRef<HTMLButtonElement>(null)

  useFromEvent(buttonRef, 'click', () => {
    console.log('Button clicked!')
  })

  return <button ref={buttonRef}>Click me</button>
}
```

### useWindowEvent

For window events:

```tsx
import { useWindowEvent } from 'pipel-react'

function Component() {
  const [online, setOnline] = useState(navigator.onLine)

  useWindowEvent('online', () => setOnline(true))
  useWindowEvent('offline', () => setOnline(false))

  return <div>Status: {online ? 'Online' : 'Offline'}</div>
}
```

### useDocumentEvent

For document events:

```tsx
import { useDocumentEvent } from 'pipel-react'

function Component() {
  const [visible, setVisible] = useState(!document.hidden)

  useDocumentEvent('visibilitychange', () => {
    setVisible(!document.hidden)
  })

  return <div>Page is {visible ? 'visible' : 'hidden'}</div>
}
```

## Event Options

### Passive Events

```tsx
const scroll$ = fromEvent(window, 'scroll', { passive: true })
```

### Capture Phase

```tsx
const click$ = fromEvent(element, 'click', { capture: true })
```

### Once

```tsx
const load$ = fromEvent(window, 'load', { once: true })
```

## Features

- ✅ Type-safe event handling
- ✅ Automatic cleanup
- ✅ Works with all DOM events
- ✅ Supports event options
- ✅ Compatible with Stream operators
- ✅ Multiple event targets
- ✅ SSR-safe

## Notes

1. The Stream automatically adds and removes event listeners
2. Cleanup happens when all subscriptions are removed
3. Event listener options are passed through to `addEventListener`
4. Type inference works for standard DOM events
5. Custom events require explicit type parameter

## Best Practices

### Use Refs for Elements

```tsx
// ✅ Good - using ref
function Component() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return
    const click$ = fromEvent(ref.current, 'click')
    // ...
  }, [])

  return <div ref={ref}>...</div>
}

// ❌ Bad - direct DOM query
function Component() {
  useEffect(() => {
    const element = document.getElementById('my-div')
    const click$ = fromEvent(element, 'click')
    // ...
  }, [])

  return <div id="my-div">...</div>
}
```

### Always Cleanup

```tsx
// ✅ Good - cleanup in useEffect
useEffect(() => {
  const click$ = fromEvent(button, 'click')
  const child = click$.then(handler)
  return () => child.unsubscribe()
}, [])

// ❌ Bad - no cleanup
useEffect(() => {
  const click$ = fromEvent(button, 'click')
  click$.then(handler)
}, [])
```

## Related

- [useFromEvent](/core/fromEvent/#usefromevent) - Hook version
- [useWindowEvent](/core/fromEvent/#usewindowevent) - Window events hook
- [useDocumentEvent](/core/fromEvent/#usedocumentevent) - Document events hook
- [effect$](/core/effect$/) - Side effects for Observables
