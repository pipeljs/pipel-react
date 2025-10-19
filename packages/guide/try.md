# Try it Online

You can try Pipel-React online without installation:

## Online Playgrounds

### CodeSandbox

[Open in CodeSandbox](https://codesandbox.io/s/pipel-react-demo)

### StackBlitz

[Open in StackBlitz](https://stackblitz.com/edit/pipel-react-demo)

## Quick Example

Try this simple counter example:

```tsx
import { usePipel } from 'pipel-react'

function App() {
  const [count, count$] = usePipel(0)

  return (
    <div>
      <h1>Count: {count}</h1>
      <button onClick={() => count$.next(count + 1)}>Increment</button>
    </div>
  )
}
```

## More Examples

Check out our [GitHub repository](https://github.com/pipeljs/pipel-react/tree/main/examples) for more examples.
