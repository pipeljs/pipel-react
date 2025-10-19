---
layout: home

hero:
  name: Pipel-React
  text: Promise-like Reactive Streams for React
  tagline: Simple, powerful, and elegant reactive programming with familiar Promise syntax
  image:
    src: /logo.svg
    alt: Pipel-React
  actions:
    - theme: brand
      text: Get Started
      link: /guide/introduce
    - theme: alt
      text: View on GitHub
      link: https://github.com/pipeljs/pipel-react

features:
  - icon: 🎯
    title: Promise-like Syntax
    details: Use familiar .then() syntax for reactive streams. If you know Promises, you already know Pipel-React.

  - icon: ⚡
    title: Powerful Operators
    details: 30+ built-in operators including debounce, throttle, retry, map, filter, and more for stream manipulation.

  - icon: 🎣
    title: React Hooks Integration
    details: Complete Hooks API designed for React 18+. Automatic subscription management and cleanup.

  - icon: 🔄
    title: Automatic State Sync
    details: Streams automatically sync with React state. No manual subscription or cleanup needed.

  - icon: 💾
    title: Persistence Support
    details: Built-in localStorage integration with automatic serialization and deserialization.

  - icon: 🛠️
    title: TypeScript First
    details: Written in TypeScript with full type inference. Get autocomplete and type safety out of the box.

  - icon: 🎨
    title: Async State Management
    details: Simplified async operations with useFetch hook. Loading, error, and data states handled automatically.

  - icon: 📦
    title: Lightweight
    details: Small bundle size with zero dependencies (except pipeljs). Tree-shakeable for optimal performance.

  - icon: 🧪
    title: Well Tested
    details: Comprehensive test coverage with 195+ test cases ensuring reliability and stability.
---

## Quick Example

```tsx
import { usePipel } from 'pipel-react'

function Counter() {
  const [count, count$] = usePipel(0)

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => count$.next(count + 1)}>Increment</button>
    </div>
  )
}
```

## Installation

::: code-group

```bash [npm]
npm install pipel-react pipeljs
```

```bash [yarn]
yarn add pipel-react pipeljs
```

```bash [pnpm]
pnpm add pipel-react pipeljs
```

:::

## Why Pipel-React?

### Traditional Approach

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

### Pipel-React Approach

```tsx
const { data, loading, error } = useFetch('/api/data', {
  immediate: true,
})
```

## Learn More

- [Introduction](/guide/introduce) - Learn about core concepts
- [Quick Start](/guide/quick) - Get up and running in 5 minutes
- [API Reference](/core/usePipel/) - Explore all available APIs
