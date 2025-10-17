import { useRef } from 'react'
import { Stream } from 'pipeljs'

/**
 * 创建一个稳定的 Stream 实例
 * 
 * @example
 * ```tsx
 * function Counter() {
 *   const count$ = useStream(0)
 *   const [count] = usePipel(count$)
 *   
 *   return (
 *     <button onClick={() => count$.next(count + 1)}>
 *       Count: {count}
 *     </button>
 *   )
 * }
 * ```
 */
export function useStream<T>(
  initialValue: T | PromiseLike<T>
): Stream<T> {
  const stream$ = useRef<Stream<T>>()
  
  if (!stream$.current) {
    stream$.current = new Stream(initialValue)
  }
  
  return stream$.current
}
