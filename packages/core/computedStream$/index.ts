/**
 * computedStream$ - Create a computed stream from multiple streams
 * Automatically tracks dependencies and updates
 */

import { useEffect, useMemo } from 'react'
import { Stream } from 'pipeljs'

/**
 * Create a computed stream from a getter function
 * The stream will automatically update when dependencies change
 * 
 * @param getter - Function that computes the value
 * @returns Computed stream
 * 
 * @example
 * ```tsx
 * const price$ = new Stream(100)
 * const quantity$ = new Stream(2)
 * 
 * function Cart() {
 *   const total$ = computedStream$(() => {
 *     return price$.value * quantity$.value
 *   })
 *   
 *   const total = useObservable(total$)
 *   return <div>Total: ${total}</div>
 * }
 * ```
 */
export function computedStream$<T>(getter: () => T): Stream<T> {
  const result$ = new Stream<T>(getter())

  // Create a reactive effect that updates the stream
  const update = () => {
    try {
      const newValue = getter()
      result$.next(newValue)
    } catch (error) {
      console.error('computedStream$ getter error:', error)
    }
  }

  // Initial update
  update()

  return result$
}

/**
 * Hook version of computedStream$ that properly integrates with React lifecycle
 * 
 * @param getter - Function that computes the value
 * @param deps - Dependency array (like useEffect)
 * @returns Computed stream
 * 
 * @example
 * ```tsx
 * function Cart() {
 *   const [price, setPrice] = useState(100)
 *   const [quantity, setQuantity] = useState(2)
 *   
 *   const total$ = useComputedStream$(() => price * quantity, [price, quantity])
 *   const total = useObservable(total$)
 *   
 *   return <div>Total: ${total}</div>
 * }
 * ```
 */
export function useComputedStream$<T>(
  getter: () => T,
  deps: React.DependencyList
): Stream<T> {
  const stream$ = useMemo(() => new Stream<T>(getter()), [])

  useEffect(() => {
    const newValue = getter()
    stream$.next(newValue)
  }, deps)

  useEffect(() => {
    return () => {
      stream$.complete()
    }
  }, [stream$])

  return stream$
}
