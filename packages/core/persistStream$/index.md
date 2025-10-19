# persistStream$

Create a persistent Stream that automatically syncs with localStorage.

## Signature

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

## Parameters

| Parameter      | Type                   | Description                                   |
| -------------- | ---------------------- | --------------------------------------------- |
| `key`          | `string`               | localStorage key for persistence              |
| `initialValue` | `T`                    | Default value if no stored value exists       |
| `serializer`   | `PersistSerializer<T>` | Optional custom serializer (defaults to JSON) |

## Returns

Returns a `Stream<T>` that automatically syncs with localStorage.

## Basic Usage

### Simple Persistence

```tsx
import { persistStream$ } from 'pipel-react'
import { usePipel } from 'pipel-react'

// Create persistent stream outside component
const theme$ = persistStream$('app-theme', 'light')

function ThemeToggle() {
  const [theme] = usePipel(theme$)

  return (
    <button onClick={() => theme$.next(theme === 'light' ? 'dark' : 'light')}>
      Current Theme: {theme}
    </button>
  )
}
```

### User Preferences

```tsx
import { persistStream$ } from 'pipel-react'

interface UserPreferences {
  fontSize: number
  language: string
  notifications: boolean
}

const preferences$ = persistStream$<UserPreferences>('user-preferences', {
  fontSize: 14,
  language: 'en',
  notifications: true,
})

function Settings() {
  const [prefs] = usePipel(preferences$)

  const updateFontSize = (size: number) => {
    preferences$.next({ ...prefs, fontSize: size })
  }

  return (
    <div>
      <label>
        Font Size: {prefs.fontSize}
        <input
          type="range"
          min="12"
          max="24"
          value={prefs.fontSize}
          onChange={(e) => updateFontSize(Number(e.target.value))}
        />
      </label>
    </div>
  )
}
```

## Advanced Usage

### Custom Serializer

```tsx
import { persistStream$ } from 'pipel-react'

interface ComplexData {
  date: Date
  map: Map<string, number>
}

const data$ = persistStream$<ComplexData>(
  'complex-data',
  {
    date: new Date(),
    map: new Map(),
  },
  {
    serialize: (value) => {
      return JSON.stringify({
        date: value.date.toISOString(),
        map: Array.from(value.map.entries()),
      })
    },
    deserialize: (str) => {
      const obj = JSON.parse(str)
      return {
        date: new Date(obj.date),
        map: new Map(obj.map),
      }
    },
  }
)
```

### Shopping Cart

```tsx
import { persistStream$ } from 'pipel-react'

interface CartItem {
  id: string
  name: string
  quantity: number
  price: number
}

const cart$ = persistStream$<CartItem[]>('shopping-cart', [])

function ShoppingCart() {
  const [items] = usePipel(cart$)

  const addItem = (item: CartItem) => {
    const existing = items.find((i) => i.id === item.id)
    if (existing) {
      cart$.next(items.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i)))
    } else {
      cart$.next([...items, item])
    }
  }

  const removeItem = (id: string) => {
    cart$.next(items.filter((i) => i.id !== id))
  }

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <div>
      <h2>Cart ({items.length} items)</h2>
      <CartItems items={items} onRemove={removeItem} />
      <div>Total: ${total.toFixed(2)}</div>
    </div>
  )
}
```

### Form State Persistence

```tsx
import { persistStream$ } from 'pipel-react'

interface FormData {
  name: string
  email: string
  message: string
}

const formDraft$ = persistStream$<FormData>('contact-form-draft', {
  name: '',
  email: '',
  message: '',
})

function ContactForm() {
  const [form] = usePipel(formDraft$)

  const updateField = (field: keyof FormData, value: string) => {
    formDraft$.next({ ...form, [field]: value })
  }

  const handleSubmit = async () => {
    await submitForm(form)
    // Clear draft after successful submission
    formDraft$.next({ name: '', email: '', message: '' })
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={form.name}
        onChange={(e) => updateField('name', e.target.value)}
        placeholder="Name"
      />
      <input
        value={form.email}
        onChange={(e) => updateField('email', e.target.value)}
        placeholder="Email"
      />
      <textarea
        value={form.message}
        onChange={(e) => updateField('message', e.target.value)}
        placeholder="Message"
      />
      <button type="submit">Send</button>
    </form>
  )
}
```

### Multi-Tab Sync

```tsx
import { persistStream$ } from 'pipel-react'
import { useEffect } from 'react'

const counter$ = persistStream$('shared-counter', 0)

function MultiTabCounter() {
  const [count] = usePipel(counter$)

  // Listen for storage changes from other tabs
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
      <p>Count (synced across tabs): {count}</p>
      <button onClick={() => counter$.next(count + 1)}>Increment</button>
    </div>
  )
}
```

### Session History

```tsx
import { persistStream$ } from 'pipel-react'

interface HistoryItem {
  id: string
  timestamp: number
  action: string
}

const history$ = persistStream$<HistoryItem[]>('user-history', [])

function ActivityTracker() {
  const [history] = usePipel(history$)

  const addActivity = (action: string) => {
    const item: HistoryItem = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      action,
    }

    // Keep only last 50 items
    const updated = [item, ...history].slice(0, 50)
    history$.next(updated)
  }

  const clearHistory = () => {
    history$.next([])
  }

  return (
    <div>
      <h2>Activity History</h2>
      <button onClick={clearHistory}>Clear History</button>
      <ul>
        {history.map((item) => (
          <li key={item.id}>
            {new Date(item.timestamp).toLocaleString()} - {item.action}
          </li>
        ))}
      </ul>
    </div>
  )
}
```

## Features

- ✅ Automatic localStorage sync
- ✅ Custom serialization support
- ✅ Type-safe with TypeScript
- ✅ SSR-safe (no localStorage on server)
- ✅ Error handling built-in
- ✅ Works with all Stream operators
- ✅ Multi-tab sync support

## Notes

1. The Stream is created **outside** components (factory function, not a hook)
2. Initial value is read from localStorage on creation
3. Every Stream update is automatically saved to localStorage
4. Serialization errors are caught and logged
5. Returns `initialValue` if localStorage is unavailable (SSR)
6. The Stream can be shared across multiple components

## SSR Considerations

```tsx
// Safe for SSR - localStorage check is built-in
const theme$ = persistStream$('theme', 'light')

function App() {
  const [theme] = usePipel(theme$)

  // Will use initialValue on server, localStorage value on client
  return <div className={theme}>...</div>
}
```

## Error Handling

The function handles errors gracefully:

- **Read errors**: Returns `initialValue`
- **Write errors**: Logs error to console, continues operation
- **Parse errors**: Returns `initialValue`

## Best Practices

### 1. Create Outside Components

```tsx
// ✅ Good - created once
const settings$ = persistStream$('settings', defaultSettings)

function Component() {
  const [settings] = usePipel(settings$)
  return <div>...</div>
}

// ❌ Bad - recreated on every render
function Component() {
  const settings$ = persistStream$('settings', defaultSettings)
  const [settings] = usePipel(settings$)
  return <div>...</div>
}
```

### 2. Use Immutable Updates

```tsx
// ✅ Good
const updateName = (name: string) => {
  user$.next({ ...user$.value, name })
}

// ❌ Bad - mutates object
const updateName = (name: string) => {
  user$.value.name = name
  user$.next(user$.value)
}
```

### 3. Namespace Keys

```tsx
// ✅ Good - namespaced
const userPrefs$ = persistStream$('app:user:preferences', defaults)
const appState$ = persistStream$('app:state', initialState)

// ❌ Bad - might conflict
const prefs$ = persistStream$('preferences', defaults)
```

## Related

- [usePipel](/core/usePipel/) - Use Stream as React state
- [useStream](/core/useStream/) - Create non-persistent Stream
- [useSyncState](/core/useSyncState/) - Bidirectional state sync
