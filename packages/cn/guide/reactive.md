# 响应式编程

pipel-react 提供了强大的响应式流编程能力，让数据流能够与 React 的状态管理无缝集成：

1. 流的数据自动转换为 React 状态，触发组件重新渲染
2. pipel-react 提供了 [to$](/cn/core/usePipel/index.cn#to$) 方法，可以将 React 状态转换为流
3. 流提供了丰富的操作符，可以对数据进行转换、过滤、组合等操作

::: tip 注意

- pipel-react 需要 React 18.0+ 版本，推荐使用 React 18.2.0+ 以获得最佳体验
- 流的数据是单向数据流，通过 `stream$.next()` 或 `stream$.set()` 来更新数据
- 组件卸载时会自动取消订阅，无需手动清理

:::

## 响应式数据渲染

流可以直接在 React 组件中使用，通过 `usePipel` hook 将流转换为 React 状态：

```tsx
import { usePipel } from 'pipel-react'

function Example() {
  const [name, name$] = usePipel('pipeljs')

  const updateName = () => {
    name$.next('pipel-react')
  }

  return (
    <div>
      <p>{name}</p>
      <button onClick={updateName}>修改</button>
    </div>
  )
}
```

## 响应式数据更新

pipel 提供 [next](https://pipeljs.github.io/pipel-doc/cn/api/stream.html#next) 和 [set](https://pipeljs.github.io/pipel-doc/cn/api/stream.html#set) 来修改流的数据，详见：[不可变数据](/cn/guide/immutable.cn)

```typescript
import { useStream } from 'pipel-react'

function Example() {
  const stream$ = useStream({ obj: { name: 'pipeljs', age: 0 } })

  // 无需使用扩展符 {...value, obj: {...value.obj, age: value.obj.age + 1}}
  const updateAge = () => {
    stream$.set((value) => (value.obj.age += 1))
  }

  return <button onClick={updateAge}>增加年龄</button>
}
```

## 响应式数据融合

pipel 流可以无缝地用于 React 的各种场景。你可以使用 `useObservable` 来订阅流的变化，使用 `effect$` 来执行副作用：

```typescript
import { usePipel, useObservable } from 'pipel-react'
import { map, filter } from 'pipeljs'

function Example() {
  const [keyword, keyword$] = usePipel('')

  // 使用操作符处理流
  const filteredKeyword = useObservable(
    keyword$.pipe(
      filter(k => k.length > 2),
      map(k => k.toUpperCase())
    )
  )

  return (
    <div>
      <input
        value={keyword}
        onChange={e => keyword$.next(e.target.value)}
      />
      <p>过滤后的关键词: {filteredKeyword}</p>
    </div>
  )
}
```

## 响应式和数据的解耦

使用 useState 的时候，数据和响应式是一体的，修改了数据就会触发重新渲染，没有办法做到条件响应式，比如：

```typescript
// wineList 会被外部频繁的修改
const [wineList, setWineList] = useState(['Red Wine', 'White Wine', 'Sparkling Wine', 'Rosé Wine'])
const [age, setAge] = useState(0)

// 每次 wineList 或 age 变化都会重新计算
const availableWineList = useMemo(() => {
  return age > 18 ? wineList : []
}, [age, wineList])
```

如果想只有在年龄发生变化的时候获取一下 wineList 的最新值，年龄不变的时候不响应 wineList 的修改，useMemo 则无法做到。

使用 pipel 流式编程则可以很好的对数据和响应式进行解耦：

```typescript
import { useStream, useObservable } from 'pipel-react'
import { filter } from 'pipeljs'

function Example() {
  const wineList$ = useStream(['Red Wine', 'White Wine', 'Sparkling Wine', 'Rosé Wine'])
  const age$ = useStream(0)

  // 只有 age 大于 18 的时候，才可以获取到 wineList 的最新值
  // 后续 wineList 的修改不会触发 availableWineList 的重新计算
  const availableWineList = useObservable(
    age$.pipe(
      filter(age => age > 18)
    ).then(() => wineList$.value)
  )

  return (
    <div>
      <p>年龄: {age$.value}</p>
      <p>可用酒单: {availableWineList?.join(', ')}</p>
    </div>
  )
}
```

## 异步数据流

pipel-react 提供了强大的异步数据流处理能力：

```typescript
import { usePipel, useObservable } from 'pipel-react'
import { debounce, map } from 'pipeljs'

function SearchComponent() {
  const [keyword, keyword$] = usePipel('')

  // 防抖搜索
  const searchResults = useObservable(
    keyword$.pipe(
      debounce(300),
      filter(k => k.length > 0),
      map(async k => {
        const res = await fetch(`/api/search?q=${k}`)
        return res.json()
      })
    )
  )

  return (
    <div>
      <input
        value={keyword}
        onChange={e => keyword$.next(e.target.value)}
        placeholder="搜索..."
      />
      <ul>
        {searchResults?.map(item => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </div>
  )
}
```

## 状态同步

使用 `useSyncState` 可以实现 React 状态和流的双向同步：

```typescript
import { useSyncState } from 'pipel-react'

function Example() {
  const [count, setCount, count$] = useSyncState(0)

  // 修改 state 会同步到 stream
  setCount(1)

  // 修改 stream 会同步到 state
  count$.next(2)

  // 可以订阅 stream 的变化
  useEffect(() => {
    const child = count$.then(value => {
      console.log('count changed:', value)
    })
    return () => child.unsubscribe()
  }, [count$])

  return <div>Count: {count}</div>
}
```
