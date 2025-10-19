# Immutable Updates

## What are Immutable Updates?

Immutable updates mean **creating new data copies instead of directly modifying original data**. This is a core principle of React and reactive programming.

### Why Immutable Updates?

1. **Predictability** - Data changes are trackable
2. **Performance** - React can quickly compare references
3. **Time Travel** - Supports undo/redo functionality
4. **Concurrency Safety** - Avoids race conditions

## Traditional vs Pipel-React

### Traditional React (Manual Immutable Updates)

```tsx
const [user, setUser] = useState({ name: 'John', age: 25 })

// ❌ Wrong: Direct modification
user.age = 26
setUser(user) // Won't trigger update!

// ✅ Correct: Create new object
setUser({ ...user, age: 26 })

// Nested objects are more complex
const [data, setData] = useState({
  user: { profile: { name: 'John' } },
})

setData({
  ...data,
  user: {
    ...data.user,
    profile: {
      ...data.user.profile,
      name: 'Jane',
    },
  },
})
```

### Pipel-React (Automatic Immutable Updates)

```tsx
const [user, user$] = usePipel({ name: 'John', age: 25 })

// ✅ Simple: Direct modification, auto-creates copy
user$.next({ ...user, age: 26 })

// Or use set() method (more concise)
user$.set((u) => {
  u.age = 26 // Looks like direct modification, but immutable
})

// Nested objects are also simple
const [data, data$] = usePipel({
  user: { profile: { name: 'John' } },
})

data$.set((d) => {
  d.user.profile.name = 'Jane' // Auto-handles nested immutability
})
```

## next() vs set()

Pipel-React provides two update methods:

### next() - Manual Immutable

```tsx
const [user, user$] = usePipel({ name: 'John', age: 25 })

// Need to manually create new object
user$.next({ ...user, age: 26 })

// Arrays also need manual copies
const [items, items$] = usePipel([1, 2, 3])
items$.next([...items, 4])
```

### set() - Auto Immutable

```tsx
const [user, user$] = usePipel({ name: 'John', age: 25 })

// Auto-creates copy
user$.set((u) => {
  u.age = 26
})

// Array operations are also simple
const [items, items$] = usePipel([1, 2, 3])
items$.set((arr) => {
  arr.push(4) // Auto-creates copy
})
```

## Common Scenarios

### Updating Object Properties

```tsx
const [user, user$] = usePipel({
  name: 'John',
  age: 25,
  email: 'john@example.com',
})

// Method 1: next()
user$.next({ ...user, age: 26 })

// Method 2: set()
user$.set((u) => {
  u.age = 26
})

// Update multiple properties
user$.set((u) => {
  u.age = 26
  u.email = 'john.doe@example.com'
})
```

### Updating Nested Objects

```tsx
const [data, data$] = usePipel({
  user: {
    profile: {
      name: 'John',
      address: {
        city: 'New York',
        zip: '10001',
      },
    },
  },
})

// Method 1: next() (verbose)
data$.next({
  ...data,
  user: {
    ...data.user,
    profile: {
      ...data.user.profile,
      address: {
        ...data.user.profile.address,
        city: 'Los Angeles',
      },
    },
  },
})

// Method 2: set() (concise)
data$.set((d) => {
  d.user.profile.address.city = 'Los Angeles'
})
```

### Array Operations

```tsx
const [todos, todos$] = usePipel([
  { id: 1, text: 'Learn React', done: false },
  { id: 2, text: 'Learn Pipel', done: false },
])

// Add item
todos$.set((arr) => {
  arr.push({ id: 3, text: 'Build App', done: false })
})

// Remove item
todos$.set((arr) => {
  const index = arr.findIndex((t) => t.id === 2)
  arr.splice(index, 1)
})

// Update item
todos$.set((arr) => {
  const todo = arr.find((t) => t.id === 1)
  if (todo) todo.done = true
})

// Filter
todos$.set((arr) => {
  return arr.filter((t) => !t.done)
})

// Map
todos$.set((arr) => {
  return arr.map((t) => ({ ...t, done: true }))
})
```

## Performance Optimization

### Batch Updates

```tsx
const [data, data$] = usePipel({
  count: 0,
  name: '',
  items: [],
})

// ❌ Avoid: Multiple updates
data$.set((d) => {
  d.count = 1
})
data$.set((d) => {
  d.name = 'test'
})
data$.set((d) => {
  d.items = [1, 2, 3]
})

// ✅ Good: Single update
data$.set((d) => {
  d.count = 1
  d.name = 'test'
  d.items = [1, 2, 3]
})
```

### Conditional Updates

```tsx
const [user, user$] = usePipel({ name: 'John', age: 25 })

// Only update when condition is met
const updateAge = (newAge) => {
  if (newAge >= 0 && newAge <= 120) {
    user$.set((u) => {
      u.age = newAge
    })
  }
}
```

## Best Practices

### 1. Prefer set()

```tsx
// ✅ Good: Use set()
user$.set((u) => {
  u.age = 26
})

// ❌ Avoid: Manual spread (unless necessary)
user$.next({ ...user, age: 26 })
```

### 2. Avoid Returning undefined in set()

```tsx
// ✅ Good: Modify draft
data$.set((d) => {
  d.count += 1
})

// ❌ Avoid: Return undefined
data$.set((d) => {
  d.count += 1
  return undefined // Will lose data
})

// ✅ Good: Return new value
data$.set((d) => {
  return { ...d, count: d.count + 1 }
})
```

### 3. Keep Update Logic Simple

```tsx
// ✅ Good: Simple and direct
todos$.set((arr) => {
  arr.push(newTodo)
})

// ❌ Avoid: Too complex
todos$.set((arr) => {
  const newArr = [...arr]
  const index = newArr.findIndex(/* ... */)
  if (index !== -1) {
    newArr[index] = {
      ...newArr[index],
      // Complex nested updates...
    }
  }
  return newArr
})
```

### 4. Use Type Safety

```tsx
interface User {
  name: string
  age: number
  email: string
}

const [user, user$] = usePipel<User>({
  name: 'John',
  age: 25,
  email: 'john@example.com',
})

// TypeScript will check types
user$.set((u) => {
  u.age = 26 // ✅
  u.age = '26' // ❌ Type error
  u.invalid = true // ❌ Property doesn't exist
})
```

## Common Pitfalls

### 1. Forgetting to Use set() or next()

```tsx
const [user, user$] = usePipel({ name: 'John', age: 25 })

// ❌ Wrong: Direct modification won't trigger update
user.age = 26

// ✅ Correct: Use set() or next()
user$.set((u) => {
  u.age = 26
})
```

### 2. Modifying Data Outside set()

```tsx
const [items, items$] = usePipel([1, 2, 3])

// ❌ Wrong: External modification
items.push(4)
items$.next(items) // Won't trigger update

// ✅ Correct: Modify inside set()
items$.set((arr) => {
  arr.push(4)
})
```

### 3. Closure Issues in Async Updates

```tsx
const [count, count$] = usePipel(0)

// ❌ Problem: Using stale value from closure
setTimeout(() => {
  count$.next(count + 1) // count might be outdated
}, 1000)

// ✅ Solution: Use functional update
setTimeout(() => {
  count$.set((c) => c + 1) // Always uses latest value
}, 1000)
```

## Next Steps

- [Reactive Programming](/guide/reactive) - Understand reactive concepts
- [Stream Rendering](/guide/render) - Learn rendering optimization
- [Debugging](/guide/debug) - Debugging techniques
