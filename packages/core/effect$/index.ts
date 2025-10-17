import { useEffect } from 'react'
import { Observable } from 'pipeljs'

/**
 * 创建副作用流，用于执行副作用操作
 * 
 * @example
 * ```tsx
 * function Logger() {
 *   const [count, count$] = usePipel(0)
 *   
 *   effect$(count$, (value) => {
 *     console.log('Count changed:', value)
 *     localStorage.setItem('count', String(value))
 *   })
 *   
 *   return <div>Count: {count}</div>
 * }
 * ```
 */
export function effect$<T>(
  observable$: Observable<T>,
  callback: (value: T) => void | (() => void)
): void {
  useEffect(() => {
    let cleanup: (() => void) | void
    
    const child = observable$.then((value: T) => {
      // 执行之前的清理函数
      if (cleanup) {
        cleanup()
      }
      // 执行回调并保存清理函数
      cleanup = callback(value)
    })
    
    return () => {
      // 执行最后的清理函数
      if (cleanup) {
        cleanup()
      }
      child.unsubscribe()
    }
  }, [observable$, callback])
}
