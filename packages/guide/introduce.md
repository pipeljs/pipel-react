# Introduction

## What is Pipel-React?

Pipel-React is a **Promise-like reactive stream programming library** for React, providing elegant asynchronous data flow processing capabilities.

Simply put: it lets you handle **continuously changing data streams** using **Promise-like syntax**, not just one-time asynchronous operations.

## Core Concept

```tsx
// Traditional Promise (one-time)
const promise = fetch('/api/user')
promise.then((data) => console.log(data)) // Executes only once

// Pipel-React Stream (continuous)
const [count, count$] = usePipel(0)
count$.then((value) => console.log(value)) // Executes on every change

count$.next(1) // Output: 1
count$.next(2) // Output: 2
count$.next(3) // Output: 3
```

## Why Pipel-React?

### 1. Simplifies Async State Management

**Traditional way:**

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

**Pipel-React way:**

```tsx
const { data, loading, error } = useFetch('/api/data', {
  immediate: true,
})
```

### 2. Lower Learning Curve

Compared to RxJS:

- Familiar Promise syntax
- Easy-to-remember operators
- Seamless integration with React ecosystem

### 3. Powerful Stream Processing

```tsx
const [keyword, keyword$] = usePipel('')

const results = useObservable(
  keyword$.pipe(
    debounce(300), // Debounce
    filter((k) => k.length > 2), // Filter
    map((k) => fetchResults(k)) // Transform
  )
)
```

## Key Features

- ✅ **Automatic State Management** - Stream automatically converts to React state
- ✅ **Lifecycle Integration** - Auto unsubscribe on component unmount
- ✅ **Rich Operators** - 30+ operators for stream manipulation
- ✅ **HTTP Support** - Complete useFetch implementation
- ✅ **TypeScript** - Full type inference
- ✅ **Persistence** - Easy localStorage integration

## Next Steps

- [Quick Start](/guide/quick.en) - Get started in 5 minutes
- [Core Concepts](/guide/reactive.en) - Understand reactive programming
- [API Reference](/core/usePipel/index.en) - Explore all APIs
