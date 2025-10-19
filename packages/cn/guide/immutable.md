# 不可变更新

## 什么是不可变更新？

不可变更新是指**创建新的数据副本而不是直接修改原数据**。这是 React 和响应式编程的核心原则之一。

### 为什么需要不可变更新？

1. **可预测性** - 数据变化可追踪
2. **性能优化** - React 可以快速比较引用
3. **时间旅行** - 支持撤销/重做功能
4. **并发安全** - 避免竞态条件

## 传统方式 vs Pipel-React

### 传统 React（手动不可变更新）

```tsx
const [user, setUser] = useState({ name: 'John', age: 25 })

// ❌ 错误：直接修改
user.age = 26
setUser(user) // 不会触发更新！

// ✅ 正确：创建新对象
setUser({ ...user, age: 26 })

// 嵌套对象更复杂
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

### Pipel-React（自动不可变更新）

```tsx
const [user, user$] = usePipel({ name: 'John', age: 25 })

// ✅ 简单：直接修改，自动创建副本
user$.next({ ...user, age: 26 })

// 或使用 set 方法（更简洁）
user$.set((u) => {
  u.age = 26 // 看起来是直接修改，实际是不可变的
})

// 嵌套对象也很简单
const [data, data$] = usePipel({
  user: { profile: { name: 'John' } },
})

data$.set((d) => {
  d.user.profile.name = 'Jane' // 自动处理嵌套不可变
})
```

## next() vs set()

Pipel-React 提供两种更新方式：

### next() - 手动不可变

```tsx
const [user, user$] = usePipel({ name: 'John', age: 25 })

// 需要手动创建新对象
user$.next({ ...user, age: 26 })

// 数组也需要手动创建副本
const [items, items$] = usePipel([1, 2, 3])
items$.next([...items, 4])
```

### set() - 自动不可变

```tsx
const [user, user$] = usePipel({ name: 'John', age: 25 })

// 自动创建副本
user$.set((u) => {
  u.age = 26
})

// 数组操作也很简单
const [items, items$] = usePipel([1, 2, 3])
items$.set((arr) => {
  arr.push(4) // 自动创建副本
})
```

## 常见场景

### 更新对象属性

```tsx
const [user, user$] = usePipel({
  name: 'John',
  age: 25,
  email: 'john@example.com',
})

// 方式 1：next()
user$.next({ ...user, age: 26 })

// 方式 2：set()
user$.set((u) => {
  u.age = 26
})

// 更新多个属性
user$.set((u) => {
  u.age = 26
  u.email = 'john.doe@example.com'
})
```

### 更新嵌套对象

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

// 方式 1：next()（繁琐）
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

// 方式 2：set()（简洁）
data$.set((d) => {
  d.user.profile.address.city = 'Los Angeles'
})
```

### 数组操作

```tsx
const [todos, todos$] = usePipel([
  { id: 1, text: 'Learn React', done: false },
  { id: 2, text: 'Learn Pipel', done: false },
])

// 添加项
todos$.set((arr) => {
  arr.push({ id: 3, text: 'Build App', done: false })
})

// 删除项
todos$.set((arr) => {
  const index = arr.findIndex((t) => t.id === 2)
  arr.splice(index, 1)
})

// 更新项
todos$.set((arr) => {
  const todo = arr.find((t) => t.id === 1)
  if (todo) todo.done = true
})

// 过滤
todos$.set((arr) => {
  return arr.filter((t) => !t.done)
})

// 映射
todos$.set((arr) => {
  return arr.map((t) => ({ ...t, done: true }))
})
```

### 数组排序

```tsx
const [items, items$] = usePipel([3, 1, 4, 1, 5, 9, 2, 6])

// 升序排序
items$.set((arr) => {
  arr.sort((a, b) => a - b)
})

// 对象数组排序
const [users, users$] = usePipel([
  { name: 'John', age: 25 },
  { name: 'Jane', age: 30 },
  { name: 'Bob', age: 20 },
])

users$.set((arr) => {
  arr.sort((a, b) => a.age - b.age)
})
```

### Map 和 Set

```tsx
// Map
const [userMap, userMap$] = usePipel(
  new Map([
    ['user1', { name: 'John', age: 25 }],
    ['user2', { name: 'Jane', age: 30 }],
  ])
)

userMap$.set((map) => {
  map.set('user3', { name: 'Bob', age: 20 })
  map.delete('user1')
})

// Set
const [tags, tags$] = usePipel(new Set(['react', 'vue']))

tags$.set((set) => {
  set.add('angular')
  set.delete('vue')
})
```

## 性能优化

### 批量更新

```tsx
const [data, data$] = usePipel({
  count: 0,
  name: '',
  items: [],
})

// ❌ 避免：多次更新
data$.set((d) => {
  d.count = 1
})
data$.set((d) => {
  d.name = 'test'
})
data$.set((d) => {
  d.items = [1, 2, 3]
})

// ✅ 好：一次更新
data$.set((d) => {
  d.count = 1
  d.name = 'test'
  d.items = [1, 2, 3]
})
```

### 条件更新

```tsx
const [user, user$] = usePipel({ name: 'John', age: 25 })

// 只在满足条件时更新
const updateAge = (newAge) => {
  if (newAge >= 0 && newAge <= 120) {
    user$.set((u) => {
      u.age = newAge
    })
  }
}
```

### 使用 immer 风格

```tsx
import { produce } from 'immer'

const [data, data$] = usePipel({
  /* ... */
})

// set() 内部使用类似 immer 的机制
data$.set((draft) => {
  // draft 是代理对象，可以直接修改
  draft.user.profile.name = 'Jane'
  draft.items.push(newItem)
})
```

## 最佳实践

### 1. 优先使用 set()

```tsx
// ✅ 好：使用 set()
user$.set((u) => {
  u.age = 26
})

// ❌ 避免：手动展开（除非必要）
user$.next({ ...user, age: 26 })
```

### 2. 避免在 set() 中返回 undefined

```tsx
// ✅ 好：修改 draft
data$.set((d) => {
  d.count += 1
})

// ❌ 避免：返回 undefined
data$.set((d) => {
  d.count += 1
  return undefined // 会导致数据丢失
})

// ✅ 好：返回新值
data$.set((d) => {
  return { ...d, count: d.count + 1 }
})
```

### 3. 保持更新逻辑简单

```tsx
// ✅ 好：简单直接
todos$.set((arr) => {
  arr.push(newTodo)
})

// ❌ 避免：过于复杂
todos$.set((arr) => {
  const newArr = [...arr]
  const index = newArr.findIndex(/* ... */)
  if (index !== -1) {
    newArr[index] = {
      ...newArr[index],
      // 复杂的嵌套更新...
    }
  }
  return newArr
})

// ✅ 好：拆分成多个函数
const updateTodo = (id, updates) => {
  todos$.set((arr) => {
    const todo = arr.find((t) => t.id === id)
    if (todo) Object.assign(todo, updates)
  })
}
```

### 4. 使用类型安全

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

// TypeScript 会检查类型
user$.set((u) => {
  u.age = 26 // ✅
  u.age = '26' // ❌ 类型错误
  u.invalid = true // ❌ 属性不存在
})
```

## 常见陷阱

### 1. 忘记使用 set() 或 next()

```tsx
const [user, user$] = usePipel({ name: 'John', age: 25 })

// ❌ 错误：直接修改不会触发更新
user.age = 26

// ✅ 正确：使用 set() 或 next()
user$.set((u) => {
  u.age = 26
})
```

### 2. 在 set() 外部修改数据

```tsx
const [items, items$] = usePipel([1, 2, 3])

// ❌ 错误：外部修改
items.push(4)
items$.next(items) // 不会触发更新

// ✅ 正确：在 set() 内部修改
items$.set((arr) => {
  arr.push(4)
})
```

### 3. 异步更新中的闭包问题

```tsx
const [count, count$] = usePipel(0)

// ❌ 问题：使用闭包中的旧值
setTimeout(() => {
  count$.next(count + 1) // count 可能已经过时
}, 1000)

// ✅ 解决：使用函数式更新
setTimeout(() => {
  count$.set((c) => c + 1) // 总是使用最新值
}, 1000)
```

## 调试技巧

### 监听数据更新

```tsx
const [user, user$] = usePipel({ name: 'John', age: 25 })

// 监听所有更新
user$.then((value) => {
  console.log('[user]', value)
})

user$.set((u) => {
  u.age = 26
})
// 输出: [user] { name: 'John', age: 26 }
```

### 比较更新前后的值

```tsx
user$.then((newValue) => {
  console.log('Updated:', newValue)
})
```

## 下一步

- [响应式编程](/guide/reactive) - 了解响应式概念
- [流式渲染](/guide/render) - 学习渲染优化
- [调试](/guide/debug) - 调试技巧
