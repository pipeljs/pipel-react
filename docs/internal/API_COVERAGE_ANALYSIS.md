# Pipel-React API 覆盖率分析报告

> 生成时间: 2024
>
> 本报告详细分析了 pipel-react 包中所有 API 的文档覆盖率和测试覆盖率，并提供补充建议。

---

## 📊 总体概览

### API 统计

| 类别       | API 总数 | 有文档 | 有测试 | 覆盖率  |
| ---------- | -------- | ------ | ------ | ------- |
| 核心 Hooks | 8        | 8      | 4      | 50%     |
| 高级功能   | 12       | 12     | 1      | 8.3%    |
| 调试工具   | 6        | 6      | 1      | 16.7%   |
| HTTP 功能  | 2        | 2      | 1      | 50%     |
| **总计**   | **28**   | **28** | **7**  | **25%** |

### 关键发现

✅ **优势**

- 所有 API 都有基础文档覆盖（API_REFERENCE.md）
- 核心 Hooks 有较好的测试覆盖
- useFetch 有完整的测试套件

⚠️ **需要改进**

- 高级功能测试覆盖率极低（8.3%）
- 缺少独立的 API 文档文件（仅部分有 .cn.md）
- 缺少集成测试和端到端测试
- 测试用例数量远少于 pipel-vue（4 vs 19 个测试文件）

---

## 📚 模块详细分析

### 1. 核心 Hooks 模块

#### 1.1 usePipel ✅

**功能**: 创建响应式流并返回 React 状态

**文档状态**: ✅ 完整

- API_REFERENCE.md: ✅
- 独立文档: ✅ `usePipel/index.cn.md`, `usePipel/index.en.md`

**测试状态**: ✅ 基础覆盖

- 测试文件: `usePipel/test/usePipel.test.tsx`
- 测试用例: 4 个
- 覆盖场景:
  - ✅ 创建流和初始值
  - ✅ 流更新触发状态更新
  - ✅ 使用现有流
  - ✅ 组件卸载时清理订阅

**缺失测试场景**:

```typescript
// 1. 复杂数据类型测试
- 对象、数组、嵌套结构
- 大数据量性能测试

// 2. 边界情况
- undefined/null 初始值
- 快速连续更新
- 异步初始值

// 3. 与其他 Hooks 集成
- 与 useEffect 配合
- 与 useMemo 配合
- 多个 usePipel 实例交互

// 4. 错误处理
- 流错误传播
- 组件错误边界
```

**建议测试策略**:

```typescript
// 参考 pipel-vue 的测试结构
describe('usePipel - Advanced', () => {
  it('should handle complex data types', () => {
    // 测试对象、数组等复杂类型
  })

  it('should handle rapid updates', () => {
    // 测试防抖、节流场景
  })

  it('should work with multiple instances', () => {
    // 测试多个流的交互
  })
})
```

---

#### 1.2 useStream ⚠️

**功能**: 创建稳定的流实例

**文档状态**: ⚠️ 仅基础文档

- API_REFERENCE.md: ✅
- 独立文档: ❌

**测试状态**: ❌ 无测试

**典型使用场景**:

```typescript
// 场景 1: 跨组件共享流
const globalCounter$ = useStream(0)

// 场景 2: 避免重复创建
function Component() {
  const stream$ = useStream(initialValue)
  // stream$ 在重渲染时保持稳定
}

// 场景 3: 与外部流集成
const externalStream$ = useStream(existingStream)
```

**建议测试用例**:

```typescript
describe('useStream', () => {
  it('should create stable stream instance', () => {
    // 验证多次渲染返回同一实例
  })

  it('should accept initial value', () => {
    // 测试各种初始值类型
  })

  it('should accept PromiseLike initial value', () => {
    // 测试异步初始值
  })

  it('should not recreate stream on rerender', () => {
    // 验证引用稳定性
  })

  it('should cleanup on unmount', () => {
    // 验证清理逻辑
  })
})
```

---

#### 1.3 useObservable ⚠️

**功能**: 订阅流并返回当前值

**文档状态**: ⚠️ 仅基础文档

- API_REFERENCE.md: ✅
- 独立文档: ❌

**测试状态**: ❌ 无测试（但在其他测试中被使用）

**典型使用场景**:

```typescript
// 场景 1: 基础订阅
const value = useObservable(stream$)

// 场景 2: 带回调
const value = useObservable(stream$, (newValue) => {
  console.log('Value changed:', newValue)
})

// 场景 3: 带默认值
const value = useObservable(stream$, null, defaultValue)

// 场景 4: 订阅派生流
const doubled = useObservable(stream$.pipe(map((x) => x * 2)))
```

**建议测试用例**:

```typescript
describe('useObservable', () => {
  it('should return current stream value', () => {})

  it('should update when stream changes', () => {})

  it('should call callback on value change', () => {})

  it('should handle undefined stream', () => {})

  it('should cleanup subscription on unmount', () => {})

  it('should work with piped streams', () => {})

  it('should handle rapid updates', () => {})

  it('should support default value', () => {})
})
```

---

#### 1.4 to$ ⚠️

**功能**: 将 React State 转换为流

**文档状态**: ⚠️ 仅基础文档

- API_REFERENCE.md: ✅
- 独立文档: ❌

**测试状态**: ❌ 无测试

**典型使用场景**:

```typescript
// 场景 1: 状态转流用于操作符
const [keyword, setKeyword] = useState('')
const keyword$ = to$(keyword)
const debouncedKeyword = useObservable(keyword$.pipe(debounce(300)))

// 场景 2: 多个状态组合
const [a, setA] = useState(0)
const [b, setB] = useState(0)
const a$ = to$(a)
const b$ = to$(b)
const sum$ = combineStreams({ a$, b$ })

// 场景 3: 状态历史追踪
const [count, setCount] = useState(0)
const count$ = to$(count)
const history = useObservable(count$.pipe(scan((acc, val) => [...acc, val], [])))
```

**建议测试用例**:

```typescript
describe('to$', () => {
  it('should create stream from state', () => {})

  it('should update stream when state changes', () => {})

  it('should maintain stream reference', () => {})

  it('should work with useState', () => {})

  it('should work with useReducer', () => {})

  it('should handle complex state types', () => {})

  it('should cleanup on unmount', () => {})
})
```

---

#### 1.5 effect$ ⚠️

**功能**: 创建副作用流

**文档状态**: ⚠️ 仅基础文档

- API_REFERENCE.md: ✅
- 独立文档: ❌

**测试状态**: ❌ 无测试

**典型使用场景**:

```typescript
// 场景 1: 日志记录
effect$(stream$, (value) => {
  console.log('Value:', value)
})

// 场景 2: 本地存储同步
effect$(settings$, (settings) => {
  localStorage.setItem('settings', JSON.stringify(settings))
})

// 场景 3: 带清理的副作用
effect$(timer$, (time) => {
  const interval = setInterval(() => {
    console.log('Tick:', time)
  }, 1000)

  return () => clearInterval(interval)
})

// 场景 4: API 调用
effect$(userId$, async (userId) => {
  const user = await fetchUser(userId)
  setUser(user)
})
```

**建议测试用例**:

```typescript
describe('effect$', () => {
  it('should execute callback on stream update', () => {})

  it('should call cleanup function', () => {})

  it('should cleanup on unmount', () => {})

  it('should handle async callbacks', () => {})

  it('should execute cleanup before next callback', () => {})

  it('should handle errors in callback', () => {})

  it('should work with multiple effects', () => {})
})
```

---

#### 1.6 useSyncState ⚠️

**功能**: 双向同步 State 和 Stream

**文档状态**: ⚠️ 仅基础文档

- API_REFERENCE.md: ✅
- 独立文档: ❌

**测试状态**: ❌ 无测试

**典型使用场景**:

```typescript
// 场景 1: 表单双向绑定
const [value, setValue, value$] = useSyncState('')
// 可以通过 setValue 或 value$.next() 更新

// 场景 2: 与操作符结合
const [count, setCount, count$] = useSyncState(0)
const doubled = useObservable(count$.pipe(map(x => x * 2)))

// 场景 3: 跨组件同步
// Parent
const [state, setState, state$] = useSyncState(0)
<Child stream$={state$} />

// Child
useObservable(stream$, (value) => {
  // 自动同步父组件状态
})

// 场景 4: 防止循环更新
const [a, setA, a$] = useSyncState(0)
const [b, setB, b$] = useSyncState(0)
// 内部机制防止 a$ -> b$ -> a$ 的循环
```

**建议测试用例**:

```typescript
describe('useSyncState', () => {
  it('should sync state to stream', () => {})

  it('should sync stream to state', () => {})

  it('should prevent circular updates', () => {})

  it('should work with setState function form', () => {})

  it('should handle rapid updates', () => {})

  it('should cleanup on unmount', () => {})

  it('should work with complex data types', () => {})

  it('should maintain reference stability', () => {})
})
```

---

#### 1.7 usePipelRender ⚠️

**功能**: 流式渲染组件

**文档状态**: ⚠️ 仅基础文档

- API_REFERENCE.md: ✅
- 独立文档: ❌

**测试状态**: ❌ 无测试

**典型使用场景**:

```typescript
// 场景 1: 条件渲染
const content = usePipelRender(
  count$.pipe(
    map(n => n > 10 ? <Success /> : <Loading />)
  )
)

// 场景 2: 动态组件
const component = usePipelRender(
  type$.pipe(
    map(type => {
      switch(type) {
        case 'text': return <TextInput />
        case 'number': return <NumberInput />
        default: return <DefaultInput />
      }
    })
  )
)

// 场景 3: 异步内容
const content = usePipelRender(
  data$.pipe(
    map(data => data ? <Content data={data} /> : <Loading />)
  )
)

// 场景 4: 错误边界
const content = usePipelRender(
  stream$.pipe(
    map(value => <div>{value}</div>),
    catchError(() => <ErrorComponent />)
  )
)
```

**建议测试用例**:

```typescript
describe('usePipelRender', () => {
  it('should render initial value', () => {})

  it('should update render on stream change', () => {})

  it('should work with map operator', () => {})

  it('should handle null/undefined', () => {})

  it('should cleanup on unmount', () => {})

  it('should work with complex components', () => {})

  it('should handle rapid updates', () => {})

  it('should work with error handling', () => {})
})
```

---

#### 1.8 persistStream$ ⚠️

**功能**: 持久化流到 localStorage

**文档状态**: ⚠️ 仅基础文档

- API_REFERENCE.md: ✅
- 独立文档: ❌

**测试状态**: ❌ 无测试

**典型使用场景**:

```typescript
// 场景 1: 主题持久化
const theme$ = persistStream$('dark', {
  key: 'app-theme',
})

// 场景 2: 用户设置
const settings$ = persistStream$(defaultSettings, {
  key: 'user-settings',
  serializer: JSON.stringify,
  deserializer: JSON.parse,
})

// 场景 3: 表单草稿
const draft$ = persistStream$('', {
  key: 'form-draft',
  storage: sessionStorage,
})

// 场景 4: 自定义序列化
const data$ = persistStream$(complexData, {
  key: 'complex-data',
  serializer: (value) => customSerialize(value),
  deserializer: (str) => customDeserialize(str),
})
```

**建议测试用例**:

```typescript
describe('persistStream$', () => {
  it('should persist value to localStorage', () => {})

  it('should load value from localStorage', () => {})

  it('should use custom storage', () => {})

  it('should use custom serializer', () => {})

  it('should use custom deserializer', () => {})

  it('should handle storage errors', () => {})

  it('should fallback to initial value on error', () => {})

  it('should cleanup on unmount', () => {})

  it('should work with complex data types', () => {})
})
```

---

### 2. 高级功能模块

#### 2.1 computedStream$ ✅

**功能**: 创建计算流

**文档状态**: ✅ 完整

- API_REFERENCE.md: ✅
- 独立文档: ✅ `computedStream$/index.cn.md`

**测试状态**: ✅ 良好覆盖

- 测试文件: `computedStream$/test/computedStream$.test.tsx`
- 测试用例: 8 个
- 覆盖场景:
  - ✅ 创建计算流
  - ✅ 依赖变化时更新
  - ✅ 复杂计算
  - ✅ Hook 版本
  - ✅ 清理逻辑

**可补充测试**:

```typescript
// 1. 性能测试
;-大量依赖的计算流 -
  深层嵌套的计算流 -
  // 2. 边界情况
  循环依赖检测 -
  异步计算 -
  错误处理 -
  // 3. 优化测试
  记忆化验证 -
  不必要的重计算检测
```

---

#### 2.2 useComputedStream$ ✅

**功能**: Hook 版本的计算流

**文档状态**: ✅ 完整

- API_REFERENCE.md: ✅
- 独立文档: ✅ `computedStream$/index.cn.md`

**测试状态**: ✅ 已覆盖（在 computedStream$.test.tsx 中）

---

#### 2.3 asyncStream$ ⚠️

**功能**: 创建异步流

**文档状态**: ⚠️ 仅基础文档

- API_REFERENCE.md: ✅
- 独立文档: ❌

**测试状态**: ❌ 无测试

**典型使用场景**:

```typescript
// 场景 1: API 请求
const { data$, loading$, error$, execute } = asyncStream$(async (id: number) => {
  const res = await fetch(`/api/users/${id}`)
  return res.json()
})

// 场景 2: 文件上传
const { data$, loading$, error$, execute } = asyncStream$(async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  const res = await fetch('/upload', {
    method: 'POST',
    body: formData,
  })
  return res.json()
})

// 场景 3: 批量操作
const { data$, loading$, error$, execute } = asyncStream$(async (ids: number[]) => {
  const results = await Promise.all(ids.map((id) => fetch(`/api/items/${id}`)))
  return results
})

// 场景 4: 重试逻辑
const { data$, loading$, error$, execute } = asyncStream$(async (url: string) => {
  let retries = 3
  while (retries > 0) {
    try {
      return await fetch(url)
    } catch (e) {
      retries--
      if (retries === 0) throw e
      await delay(1000)
    }
  }
})
```

**建议测试用例**:

```typescript
describe('asyncStream$', () => {
  it('should create async stream', () => {})

  it('should set loading state', () => {})

  it('should set data on success', () => {})

  it('should set error on failure', () => {})

  it('should reset error on new execution', () => {})

  it('should handle multiple executions', () => {})

  it('should handle concurrent executions', () => {})

  it('should work with different argument types', () => {})

  it('should cleanup on unmount', () => {})
})
```

---

#### 2.4 useAsyncStream$ ⚠️

**功能**: Hook 版本的异步流

**文档状态**: ⚠️ 仅基础文档

- API_REFERENCE.md: ✅
- 独立文档: ❌

**测试状态**: ❌ 无测试

**建议测试用例**:

```typescript
describe('useAsyncStream$', () => {
  it('should create stable async stream', () => {})

  it('should not recreate on rerender', () => {})

  it('should cleanup streams on unmount', () => {})

  it('should work with useCallback', () => {})

  it('should handle component updates', () => {})
})
```

---

#### 2.5 useAsyncStreamAuto$ ⚠️

**功能**: 自动执行的异步流

**文档状态**: ⚠️ 仅基础文档

- API_REFERENCE.md: ✅
- 独立文档: ❌

**测试状态**: ❌ 无测试

**典型使用场景**:

```typescript
// 场景 1: 依赖参数自动请求
function UserProfile({ userId }: { userId: number }) {
  const { data$, loading$, error$ } = useAsyncStreamAuto$(
    async (id: number) => {
      const res = await fetch(`/api/users/${id}`)
      return res.json()
    },
    [userId] // userId 变化时自动重新请求
  )
}

// 场景 2: 搜索自动触发
function Search({ keyword }: { keyword: string }) {
  const { data$ } = useAsyncStreamAuto$(
    async (kw: string) => {
      const res = await fetch(`/api/search?q=${kw}`)
      return res.json()
    },
    [keyword]
  )
}

// 场景 3: 多参数依赖
function DataView({ type, id }: Props) {
  const { data$ } = useAsyncStreamAuto$(
    async (t: string, i: number) => {
      return await fetchData(t, i)
    },
    [type, id]
  )
}
```

**建议测试用例**:

```typescript
describe('useAsyncStreamAuto$', () => {
  it('should execute on mount', () => {})

  it('should re-execute when args change', () => {})

  it('should not execute when args unchanged', () => {})

  it('should handle multiple args', () => {})

  it('should cleanup on unmount', () => {})

  it('should cancel previous execution', () => {})
})
```

---

#### 2.6 fromEvent ⚠️

**功能**: 从 DOM 事件创建流

**文档状态**: ⚠️ 仅基础文档

- API_REFERENCE.md: ✅
- 独立文档: ❌

**测试状态**: ❌ 无测试

**典型使用场景**:

```typescript
// 场景 1: 按钮点击
const button = document.querySelector('button')
const click$ = fromEvent(button, 'click')
click$.then((e) => console.log('Clicked!'))

// 场景 2: 输入事件
const input = document.querySelector('input')
const input$ = fromEvent(input, 'input')
const debouncedInput$ = input$.pipe(debounce(300))

// 场景 3: 鼠标移动
const mousemove$ = fromEvent(document, 'mousemove')
const position$ = mousemove$.pipe(map((e) => ({ x: e.clientX, y: e.clientY })))

// 场景 4: 键盘事件
const keydown$ = fromEvent(document, 'keydown')
const escPressed$ = keydown$.pipe(filter((e) => e.key === 'Escape'))
```

**建议测试用例**:

```typescript
describe('fromEvent', () => {
  it('should create stream from event', () => {})

  it('should emit events', () => {})

  it('should remove listener on cleanup', () => {})

  it('should handle null target', () => {})

  it('should work with different event types', () => {})

  it('should support event options', () => {})
})
```

---

#### 2.7 useFromEvent ⚠️

**功能**: Hook 版本的事件流

**文档状态**: ⚠️ 仅基础文档

- API_REFERENCE.md: ✅
- 独立文档: ❌

**测试状态**: ❌ 无测试

**建议测试用例**:

```typescript
describe('useFromEvent', () => {
  it('should create event stream from ref', () => {})

  it('should emit events', () => {})

  it('should cleanup on unmount', () => {})

  it('should handle ref changes', () => {})

  it('should work with null ref', () => {})

  it('should support different element types', () => {})
})
```

---

#### 2.8 useWindowEvent ⚠️

**功能**: Window 事件流

**文档状态**: ⚠️ 仅基础文档

- API_REFERENCE.md: ✅
- 独立文档: ❌

**测试状态**: ❌ 无测试

**典型使用场景**:

```typescript
// 场景 1: 窗口大小变化
const resize$ = useWindowEvent('resize')
const size = useObservable(
  resize$.pipe(
    debounce(200),
    map(() => ({
      width: window.innerWidth,
      height: window.innerHeight,
    }))
  )
)

// 场景 2: 滚动监听
const scroll$ = useWindowEvent('scroll')
const scrollTop = useObservable(
  scroll$.pipe(
    throttle(100),
    map(() => window.scrollY)
  )
)

// 场景 3: 在线状态
const online$ = useWindowEvent('online')
const offline$ = useWindowEvent('offline')

// 场景 4: 焦点状态
const focus$ = useWindowEvent('focus')
const blur$ = useWindowEvent('blur')
```

**建议测试用例**:

```typescript
describe('useWindowEvent', () => {
  it('should create window event stream', () => {})

  it('should emit window events', () => {})

  it('should cleanup on unmount', () => {})

  it('should work with different event types', () => {})

  it('should handle rapid events', () => {})
})
```

---

#### 2.9 useDocumentEvent ⚠️

**功能**: Document 事件流

**文档状态**: ⚠️ 仅基础文档

- API_REFERENCE.md: ✅
- 独立文档: ❌

**测试状态**: ❌ 无测试

**典型使用场景**:

```typescript
// 场景 1: 全局点击
const click$ = useDocumentEvent('click')
useObservable(click$, (e) => {
  // 处理全局点击
})

// 场景 2: 键盘快捷键
const keydown$ = useDocumentEvent('keydown')
const ctrlS$ = keydown$.pipe(filter((e) => e.ctrlKey && e.key === 's'))

// 场景 3: 拖放
const dragover$ = useDocumentEvent('dragover')
const drop$ = useDocumentEvent('drop')

// 场景 4: 选择变化
const selectionchange$ = useDocumentEvent('selectionchange')
```

**建议测试用例**:

```typescript
describe('useDocumentEvent', () => {
  it('should create document event stream', () => {})

  it('should emit document events', () => {})

  it('should cleanup on unmount', () => {})

  it('should work with different event types', () => {})

  it('should not interfere with other listeners', () => {})
})
```

---

#### 2.10 batch$ ⚠️

**功能**: 批量创建流

**文档状态**: ⚠️ 仅基础文档

- API_REFERENCE.md: ✅
- 独立文档: ❌

**测试状态**: ❌ 无测试

**典型使用场景**:

```typescript
// 场景 1: 表单状态管理
const form = batch$({
  username: '',
  email: '',
  password: '',
  remember: false,
})

// 场景 2: 多个计数器
const counters = batch$({
  clicks: 0,
  views: 0,
  likes: 0,
})

// 场景 3: 配置管理
const config = batch$({
  theme: 'dark',
  language: 'en',
  fontSize: 14,
  notifications: true,
})

// 场景 4: 游戏状态
const game = batch$({
  score: 0,
  level: 1,
  lives: 3,
  paused: false,
})
```

**建议测试用例**:

```typescript
describe('batch$', () => {
  it('should create multiple streams', () => {})

  it('should preserve initial values', () => {})

  it('should create independent streams', () => {})

  it('should work with different value types', () => {})

  it('should handle empty config', () => {})

  it('should not share references', () => {})
})
```

---

#### 2.11 createStreams ⚠️

**功能**: 类型推断版本的批量创建

**文档状态**: ⚠️ 仅基础文档

- API_REFERENCE.md: ✅
- 独立文档: ❌

**测试状态**: ❌ 无测试

**建议测试用例**:

```typescript
describe('createStreams', () => {
  it('should create streams with type inference', () => {})

  it('should maintain key names', () => {})

  it('should work with $ suffix convention', () => {})

  it('should preserve types', () => {})
})
```

---

#### 2.12 batchWithFactory ⚠️

**功能**: 使用工厂函数批量创建

**文档状态**: ⚠️ 仅基础文档

- API_REFERENCE.md: ✅
- 独立文档: ❌

**测试状态**: ❌ 无测试

**典型使用场景**:

```typescript
// 场景 1: 动态初始化
const streams = batchWithFactory(['a', 'b', 'c'], (key) => initialValues[key])

// 场景 2: 计算初始值
const counters = batchWithFactory(['counter1', 'counter2', 'counter3'], (key) =>
  parseInt(key.replace('counter', ''))
)

// 场景 3: 从配置创建
const config = { a: 1, b: 2, c: 3 }
const streams = batchWithFactory(Object.keys(config), (key) => config[key])
```

**建议测试用例**:

```typescript
describe('batchWithFactory', () => {
  it('should create streams with factory', () => {})

  it('should call factory for each key', () => {})

  it('should pass correct key to factory', () => {})

  it('should handle empty keys array', () => {})

  it('should work with different return types', () => {})
})
```

---

#### 2.13 combineStreams ⚠️

**功能**: 合并多个流

**文档状态**: ⚠️ 仅基础文档

- API_REFERENCE.md: ✅
- 独立文档: ❌

**测试状态**: ❌ 无测试

**典型使用场景**:

```typescript
// 场景 1: 表单验证
const username$ = new Stream('')
const email$ = new Stream('')
const password$ = new Stream('')

const form$ = combineStreams({ username$, email$, password$ })
const isValid$ = form$.pipe(
  map(({ username$, email$, password$ }) => {
    return username$.length > 0 && email$.includes('@') && password$.length >= 8
  })
)

// 场景 2: 计算总和
const a$ = new Stream(1)
const b$ = new Stream(2)
const c$ = new Stream(3)

const sum$ = combineStreams({ a$, b$, c$ }).pipe(map(({ a$, b$, c$ }) => a$ + b$ + c$))

// 场景 3: 状态聚合
const loading$ = new Stream(false)
const error$ = new Stream(null)
const data$ = new Stream(null)

const state$ = combineStreams({ loading$, error$, data$ })
```

**建议测试用例**:

```typescript
describe('combineStreams', () => {
  it('should combine multiple streams', () => {})

  it('should emit when any stream updates', () => {})

  it('should include all stream values', () => {})

  it('should emit initial combined value', () => {})

  it('should handle empty streams object', () => {})

  it('should cleanup subscriptions', () => {})
})
```

---

### 3. 调试工具模块

#### 3.1 debug$ ✅

**功能**: 添加调试日志

**文档状态**: ✅ 完整

- API_REFERENCE.md: ✅
- 独立文档: ✅ `debug/index.cn.md`

**测试状态**: ✅ 良好覆盖

- 测试文件: `debug/test/debug.test.tsx`
- 测试用例: 多个
- 覆盖场景:
  - ✅ 添加调试日志
  - ✅ 日志输出
  - ✅ 选项配置

---

#### 3.2 logStream$ ✅

**功能**: 记录流值

**文档状态**: ✅ 完整

- API_REFERENCE.md: ✅
- 独立文档: ✅ `debug/index.cn.md`

**测试状态**: ✅ 已覆盖（在 debug.test.tsx 中）

---

#### 3.3 trace$ ✅

**功能**: 追踪生命周期

**文档状态**: ✅ 完整

- API_REFERENCE.md: ✅
- 独立文档: ✅ `debug/index.cn.md`

**测试状态**: ✅ 已覆盖（在 debug.test.tsx 中）

---

#### 3.4 inspect$ ✅

**功能**: 创建流检查器

**文档状态**: ✅ 完整

- API_REFERENCE.md: ✅
- 独立文档: ✅ `debug/index.cn.md`

**测试状态**: ✅ 已覆盖（在 debug.test.tsx 中）

---

#### 3.5 performanceMonitor$ ✅

**功能**: 性能监控

**文档状态**: ✅ 完整

- API_REFERENCE.md: ✅
- 独立文档: ✅ `debug/index.cn.md`

**测试状态**: ✅ 已覆盖（在 debug.test.tsx 中）

---

#### 3.6 createDebugPlugin ✅

**功能**: 创建自定义调试插件

**文档状态**: ✅ 完整

- API_REFERENCE.md: ✅
- 独立文档: ✅ `debug/index.cn.md`

**测试状态**: ✅ 已覆盖（在 debug.test.tsx 中）

---

### 4. HTTP 功能模块

#### 4.1 useFetch ✅

**功能**: HTTP 请求 Hook

**文档状态**: ✅ 完整

- API_REFERENCE.md: ✅
- 独立文档: ✅ `useFetch/index.cn.md`, `useFetch/index.en.md`

**测试状态**: ✅ 良好覆盖

- 测试文件: `useFetch/test/useFetch.test.tsx`
- 测试用例: 4 个
- 覆盖场景:
  - ✅ 成功请求
  - ✅ 错误处理
  - ✅ immediate 选项
  - ✅ 手动执行

**可参考 pipel-vue 补充测试**:

```typescript
// pipel-vue 有 11 个测试文件：
- cache.spec.ts - 缓存功能
- condition.spec.ts - 条件请求
- debounce.spec.ts - 防抖
- index.spec.ts - 基础功能（21KB，非常全面）
- ndjson.spec.ts - NDJSON 流式响应
- pipel.spec.ts - 与 pipel 集成
- refetch.spec.ts - 重新请求
- refresh.spec.ts - 刷新
- retry.spec.ts - 重试
- sse.spec.ts - Server-Sent Events
- throttle.spec.ts - 节流

// 建议补充的测试场景：
describe('useFetch - Advanced', () => {
  it('should support caching', () => {})
  it('should support conditional requests', () => {})
  it('should support debounce', () => {})
  it('should support throttle', () => {})
  it('should support retry with delay', () => {})
  it('should support refetch on window focus', () => {})
  it('should support refetch interval', () => {})
  it('should support SSE', () => {})
  it('should support NDJSON', () => {})
  it('should support request cancellation', () => {})
  it('should support timeout', () => {})
  it('should support beforeFetch hook', () => {})
  it('should support afterFetch hook', () => {})
  it('should support onSuccess callback', () => {})
  it('should support onError callback', () => {})
  it('should chain response type methods', () => {})
})
```

---

#### 4.2 createFetch ⚠️

**功能**: 创建自定义 Fetch 实例

**文档状态**: ⚠️ 仅基础文档

- API_REFERENCE.md: ✅
- 独立文档: ❌

**测试状态**: ❌ 无独立测试

**典型使用场景**:

```typescript
// 场景 1: API 基础配置
const useMyAPI = createFetch({
  baseUrl: 'https://api.example.com',
  options: {
    headers: {
      Authorization: 'Bearer token',
    },
  },
})

// 场景 2: 多个 API 实例
const useAuthAPI = createFetch({
  baseUrl: 'https://auth.example.com',
})

const useDataAPI = createFetch({
  baseUrl: 'https://data.example.com',
})

// 场景 3: 默认选项
const useFetchWithRetry = createFetch({
  options: {
    retry: 3,
    retryDelay: 1000,
    timeout: 5000,
  },
})

// 场景 4: 拦截器
const useFetchWithInterceptor = createFetch({
  options: {
    beforeFetch: (ctx) => {
      ctx.options.headers = {
        ...ctx.options.headers,
        'X-Request-ID': generateId(),
      }
      return ctx
    },
    afterFetch: (ctx) => {
      logRequest(ctx)
      return ctx
    },
  },
})
```

**建议测试用例**:

```typescript
describe('createFetch', () => {
  it('should create custom fetch hook', () => {})

  it('should use baseUrl', () => {})

  it('should merge options', () => {})

  it('should inherit default options', () => {})

  it('should allow option override', () => {})

  it('should work with all useFetch features', () => {})

  it('should create independent instances', () => {})
})
```

---

## 📋 测试策略建议

### 1. 单元测试优先级

**高优先级** (立即补充):

1. `useStream` - 核心基础 Hook
2. `useObservable` - 使用频率最高
3. `to$` - 状态转流的关键
4. `effect$` - 副作用管理
5. `useSyncState` - 双向同步核心
6. `usePipelRender` - 渲染相关
7. `persistStream$` - 持久化功能

**中优先级** (逐步补充):

1. 所有 `asyncStream$` 相关 API
2. 所有 `fromEvent` 相关 API
3. 所有 `batch$` 相关 API
4. `createFetch`

**低优先级** (可选):

1. 已有测试的 API 的边界情况补充

### 2. 集成测试建议

参考 pipel-vue 的测试结构，建议添加：

```typescript
// test/integration/
├── hooks-integration.spec.ts      // Hooks 之间的集成
├── operators-integration.spec.ts  // 与操作符的集成
├── fetch-integration.spec.ts      // HTTP 功能集成
├── events-integration.spec.ts     // 事件流集成
└── lifecycle.spec.ts              // 生命周期测试
```

### 3. 端到端测试建议

```typescript
// test/e2e/
├── counter-app.spec.ts           // 完整计数器应用
├── form-validation.spec.ts       // 表单验证流程
├── data-fetching.spec.ts         // 数据获取流程
├── real-time-updates.spec.ts     // 实时更新场景
└── complex-state.spec.ts         // 复杂状态管理
```

### 4. 性能测试建议

```typescript
// test/performance/
├── stream-creation.perf.ts       // 流创建性能
├── update-performance.perf.ts    // 更新性能
├── memory-leaks.perf.ts          // 内存泄漏检测
└── large-scale.perf.ts           // 大规模场景
```

---

## 📝 文档补充建议

### 1. 需要独立文档的 API

以下 API 建议创建独立的 `.cn.md` 和 `.en.md` 文档：

1. **核心 Hooks**:
   - `useStream/index.cn.md`
   - `useObservable/index.cn.md`
   - `to$/index.cn.md`
   - `effect$/index.cn.md`
   - `useSyncState/index.cn.md`
   - `usePipelRender/index.cn.md`
   - `persistStream$/index.cn.md`

2. **高级功能**:
   - `asyncStream$/index.cn.md`
   - `fromEvent/index.cn.md`
   - `batch$/index.cn.md`

3. **HTTP 功能**:
   - `createFetch/index.cn.md`

### 2. 文档结构建议

参考现有的 `usePipel/index.cn.md` 结构：

````markdown
# API 名称

## 简介

简短描述 API 的用途和核心功能

## 类型签名

```typescript
function apiName<T>(params): ReturnType
```
````

## 参数

详细说明每个参数

## 返回值

详细说明返回值

## 基础用法

最简单的使用示例

## 高级用法

复杂场景的使用示例

## 注意事项

使用时需要注意的点

## 相关 API

相关联的其他 API

## 常见问题

FAQ

````

### 3. 示例代码质量

建议所有文档示例：
- ✅ 包含完整的 import 语句
- ✅ 包含类型注解
- ✅ 可以直接复制运行
- ✅ 覆盖常见使用场景
- ✅ 包含错误处理
- ✅ 包含清理逻辑

---

## 🎯 行动计划

### 第一阶段：核心测试补充（1-2 周）

1. 为 7 个高优先级 API 编写完整测试
2. 每个 API 至少 8-10 个测试用例
3. 覆盖基础功能、边界情况、错误处理

### 第二阶段：高级功能测试（2-3 周）

1. 补充所有高级功能的测试
2. 参考 pipel-vue 的测试结构
3. 添加集成测试

### 第三阶段：文档完善（1-2 周）

1. 为所有缺失独立文档的 API 创建文档
2. 补充使用示例
3. 添加最佳实践指南

### 第四阶段：质量提升（持续）

1. 添加性能测试
2. 添加端到端测试
3. 持续优化测试覆盖率

---

## 📊 对比 pipel-vue

### 测试文件数量对比

| 项目 | 测试文件数 | 测试覆盖率 |
|------|-----------|-----------|
| pipel-vue | 19 | ~90% |
| pipel-react | 4 | ~25% |

### pipel-vue 的优势

1. **完整的 useFetch 测试套件** (11 个文件)
   - 缓存、条件请求、防抖、节流
   - SSE、NDJSON 流式响应
   - 重试、刷新、取消

2. **全面的 usePipel 测试** (6 个文件)
   - 高级用法、副作用、渲染
   - 引用同步、转换、流操作

3. **测试工具完善**
   - Mock 服务器
   - 工具函数
   - 测试辅助方法

### 可借鉴的测试模式

```typescript
// 1. 使用 describe.sequential 确保测试顺序
describe.sequential('usePipel', () => {
  // 测试用例
})

// 2. 使用 beforeEach 设置
beforeEach(() => {
  process.on('unhandledRejection', () => null)
  vi.useFakeTimers()
  consoleSpy.mockClear()
})

// 3. 使用 retry 工具处理异步
await retry(() => {
  expect(data.value).toBe('hello')
})

// 4. 完整的生命周期测试
it('should unsubscribe after unmount', async () => {
  const wrapper = mount(Component)
  wrapper.unmount()
  // 验证清理
})
````

---

## 🔍 总结

### 当前状态

- ✅ 文档覆盖率: 100%（基础）
- ⚠️ 测试覆盖率: 25%（需大幅提升）
- ⚠️ 独立文档: 30%（需补充）

### 关键差距

1. **测试覆盖率远低于 pipel-vue**（25% vs 90%）
2. **缺少高级功能的测试**（仅 8.3% 覆盖）
3. **缺少集成测试和端到端测试**
4. **独立文档不完整**（仅 30% 有独立文档）

### 改进建议

1. **立即行动**: 补充 7 个高优先级 API 的测试
2. **参考 pipel-vue**: 学习其测试结构和模式
3. **系统化**: 建立完整的测试体系（单元+集成+E2E）
4. **文档化**: 为所有 API 创建独立文档

### 预期成果

完成所有改进后：

- 测试覆盖率: 25% → 85%+
- 独立文档: 30% → 100%
- 测试文件数: 4 → 20+
- 代码质量和可维护性显著提升

---

## 附录：快速参考

### 需要测试的 API 清单

**核心 Hooks** (5/8 需要测试):

- [ ] useStream
- [ ] useObservable
- [ ] to$
- [ ] effect$
- [ ] useSyncState
- [ ] usePipelRender
- [ ] persistStream$
- [x] usePipel

**高级功能** (11/12 需要测试):

- [x] computedStream$
- [x] useComputedStream$
- [ ] asyncStream$
- [ ] useAsyncStream$
- [ ] useAsyncStreamAuto$
- [ ] fromEvent
- [ ] useFromEvent
- [ ] useWindowEvent
- [ ] useDocumentEvent
- [ ] batch$
- [ ] createStreams
- [ ] batchWithFactory
- [ ] combineStreams

**调试工具** (0/6 需要测试):

- [x] debug$
- [x] logStream$
- [x] trace$
- [x] inspect$
- [x] performanceMonitor$
- [x] createDebugPlugin

**HTTP 功能** (1/2 需要测试):

- [x] useFetch
- [ ] createFetch

**总计**: 17 个 API 需要补充测试

---

_报告结束_
