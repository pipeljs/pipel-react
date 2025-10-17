# 在线试用

你可以在线试用 Pipel-React，无需安装：

## 在线演练场

### CodeSandbox
[在 CodeSandbox 中打开](https://codesandbox.io/s/pipel-react-demo)

### StackBlitz
[在 StackBlitz 中打开](https://stackblitz.com/edit/pipel-react-demo)

## 快速示例

试试这个简单的计数器示例：

```tsx
import { usePipel } from 'pipel-react'

function App() {
  const [count, count$] = usePipel(0)
  
  return (
    <div>
      <h1>计数: {count}</h1>
      <button onClick={() => count$.next(count + 1)}>
        增加
      </button>
    </div>
  )
}
```

## 更多示例

查看我们的 [GitHub 仓库](https://github.com/pipeljs/pipel-react/tree/main/examples) 获取更多示例。
