# batch$

批量创建和管理多个 Stream，简化多状态管理。

## 签名

```typescript
function batch$<T extends Record<string, any>>(
  initialValues: T
): {
  [K in keyof T]: Stream<T[K]>
}

function createStreams<T extends Record<string, any>>(
  initialValues: T
): {
  [K in keyof T]: Stream<T[K]>
}

function batchWithFactory<T, K extends string>(
  keys: K[],
  factory: (key: K) => T
): Record<K, Stream<T>>

function combineStreams<T extends Record<string, Stream<any>>>(
  streams: T
): Stream<{ [K in keyof T]: T[K] extends Stream<infer U> ? U : never }>
```

## 基础用法

### 批量创建 Stream

```tsx
import { batch$ } from 'pipel-react'
import { usePipel } from 'pipel-react'

function Form() {
  const streams = batch$({
    name: '',
    email: '',
    age: 0,
  })

  const [name] = usePipel(streams.name)
  const [email] = usePipel(streams.email)
  const [age] = usePipel(streams.age)

  return (
    <form>
      <input value={name} onChange={(e) => streams.name.next(e.target.value)} />
      <input value={email} onChange={(e) => streams.email.next(e.target.value)} />
      <input type="number" value={age} onChange={(e) => streams.age.next(Number(e.target.value))} />
    </form>
  )
}
```

### 使用 createStreams

```tsx
import { createStreams } from 'pipel-react'

function Dashboard() {
  const { users$, posts$, comments$ } = createStreams({
    users: [],
    posts: [],
    comments: [],
  })

  const [users] = usePipel(users$)
  const [posts] = usePipel(posts$)
  const [comments] = usePipel(comments$)

  return (
    <div>
      <UserList users={users} />
      <PostList posts={posts} />
      <CommentList comments={comments} />
    </div>
  )
}
```

## 高级用法

### 使用工厂函数创建

```tsx
import { batchWithFactory } from 'pipel-react'

function TabManager() {
  const tabs = ['home', 'profile', 'settings'] as const

  const tabStreams = batchWithFactory(tabs, (tabName) => ({ active: false, data: null }))

  const activateTab = (tabName: string) => {
    tabs.forEach((tab) => {
      tabStreams[tab].next({
        ...tabStreams[tab].value,
        active: tab === tabName,
      })
    })
  }

  return (
    <div>
      {tabs.map((tab) => (
        <Tab key={tab} stream$={tabStreams[tab]} onClick={() => activateTab(tab)} />
      ))}
    </div>
  )
}
```

### 组合多个 Stream

```tsx
import { combineStreams } from 'pipel-react'
import { useStream } from 'pipel-react'

function Calculator() {
  const price$ = useStream(100)
  const quantity$ = useStream(1)
  const tax$ = useStream(0.1)

  const combined$ = combineStreams({
    price: price$,
    quantity: quantity$,
    tax: tax$,
  })

  const [values] = usePipel(combined$)

  const total = values ? values.price * values.quantity * (1 + values.tax) : 0

  return (
    <div>
      <p>价格: ¥{values?.price}</p>
      <p>数量: {values?.quantity}</p>
      <p>税率: {values?.tax * 100}%</p>
      <p>总计: ¥{total.toFixed(2)}</p>
    </div>
  )
}
```

### 表单验证

```tsx
import { batch$ } from 'pipel-react'
import { map, debounce } from 'pipeljs'

function SignupForm() {
  const fields = batch$({
    username: '',
    email: '',
    password: '',
  })

  const errors = batch$({
    username: '',
    email: '',
    password: '',
  })

  // 用户名验证
  useEffect(() => {
    const child = fields.username
      .pipe(
        debounce(300),
        map((value) => {
          if (value.length < 3) return '用户名至少3个字符'
          if (!/^[a-zA-Z0-9_]+$/.test(value)) return '只能包含字母、数字和下划线'
          return ''
        })
      )
      .then((error) => errors.username.next(error))

    return () => child.unsubscribe()
  }, [])

  // 邮箱验证
  useEffect(() => {
    const child = fields.email
      .pipe(
        debounce(300),
        map((value) => {
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            return '请输入有效的邮箱地址'
          }
          return ''
        })
      )
      .then((error) => errors.email.next(error))

    return () => child.unsubscribe()
  }, [])

  const [username] = usePipel(fields.username)
  const [email] = usePipel(fields.email)
  const [password] = usePipel(fields.password)
  const [usernameError] = usePipel(errors.username)
  const [emailError] = usePipel(errors.email)

  return (
    <form>
      <div>
        <input value={username} onChange={(e) => fields.username.next(e.target.value)} />
        {usernameError && <span className="error">{usernameError}</span>}
      </div>
      <div>
        <input value={email} onChange={(e) => fields.email.next(e.target.value)} />
        {emailError && <span className="error">{emailError}</span>}
      </div>
      <div>
        <input
          type="password"
          value={password}
          onChange={(e) => fields.password.next(e.target.value)}
        />
      </div>
    </form>
  )
}
```

### 多步骤表单

```tsx
import { batch$ } from 'pipel-react'

function MultiStepForm() {
  const steps = batch$({
    personal: { name: '', age: 0 },
    contact: { email: '', phone: '' },
    address: { street: '', city: '' },
  })

  const [currentStep, setCurrentStep] = useState(0)
  const stepNames = ['personal', 'contact', 'address'] as const

  const [personalData] = usePipel(steps.personal)
  const [contactData] = usePipel(steps.contact)
  const [addressData] = usePipel(steps.address)

  const nextStep = () => {
    if (currentStep < stepNames.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <div>
      {currentStep === 0 && (
        <PersonalInfo data={personalData} onChange={(data) => steps.personal.next(data)} />
      )}
      {currentStep === 1 && (
        <ContactInfo data={contactData} onChange={(data) => steps.contact.next(data)} />
      )}
      {currentStep === 2 && (
        <AddressInfo data={addressData} onChange={(data) => steps.address.next(data)} />
      )}

      <div>
        <button onClick={prevStep} disabled={currentStep === 0}>
          上一步
        </button>
        <button onClick={nextStep} disabled={currentStep === 2}>
          下一步
        </button>
      </div>
    </div>
  )
}
```

## 特性

- ✅ 批量创建多个 Stream
- ✅ 类型安全的键值访问
- ✅ 支持工厂函数
- ✅ 可组合多个 Stream
- ✅ 简化多状态管理
- ✅ TypeScript 完整支持

## 注意事项

1. `batch$` 返回的对象中每个属性都是独立的 Stream
2. `combineStreams` 会在任一 Stream 变化时发出新值
3. 工厂函数会为每个键调用一次
4. 所有 Stream 都可以独立订阅和更新
5. 适合管理相关联的多个状态

## API 对比

| API                | 用途            | 返回值      |
| ------------------ | --------------- | ----------- |
| `batch$`           | 从对象创建      | Stream 对象 |
| `createStreams`    | 同 batch$       | Stream 对象 |
| `batchWithFactory` | 使用工厂函数    | Stream 对象 |
| `combineStreams`   | 组合多个 Stream | 单个 Stream |

## 相关链接

- [usePipel](/cn/core/usePipel/index.cn) - Stream 状态管理
- [useStream](/cn/core/useStream/index.cn) - 创建稳定的 Stream
- [combineLatest](/cn/operators/combineLatest) - 组合操作符
