/**
 * batch$ - Combine multiple streams into array stream
 * Similar to RxJS combineLatest
 */

import { Stream, Observable } from 'pipeljs'

/**
 * Combine multiple streams into a single array stream
 * Emits an array of the latest values whenever any source stream emits
 *
 * @param streams - Array of streams to combine
 * @returns Combined stream that emits arrays
 *
 * @example
 * ```tsx
 * const count$ = new Stream(0)
 * const name$ = new Stream('John')
 *
 * const combined$ = batch$([count$, name$])
 *
 * combined$.then(([count, name]) => {
 *   console.log('Count:', count, 'Name:', name)
 * })
 *
 * count$.next(1) // Emits: [1, 'John']
 * name$.next('Jane') // Emits: [1, 'Jane']
 * ```
 */
export function batch$<T extends readonly Observable<any>[]>(
  streams: T
): Stream<{ [K in keyof T]: T[K] extends Observable<infer U> ? U : never }> {
  type Values = { [K in keyof T]: T[K] extends Observable<infer U> ? U : never }

  const result$ = new Stream<Values>([] as any)

  if (streams.length === 0) {
    return result$
  }

  // Get initial values
  const getCurrentValues = (): Values => {
    return streams.map((stream) => {
      if ('value' in stream) {
        return stream.value
      }
      return undefined
    }) as Values
  }

  // Subscribe to all streams
  const subscriptions = streams.map((stream) => {
    return stream.then(() => {
      result$.next(getCurrentValues())
    })
  })

  // Emit initial values
  result$.next(getCurrentValues())

  // Store subscriptions for cleanup (optional)
  ;(result$ as any)._subscriptions = subscriptions

  return result$
}

/**
 * Create multiple streams with initial values
 *
 * @param count - Number of streams to create
 * @param initialValue - Initial value or factory function
 * @returns Array of created streams
 *
 * @example
 * ```tsx
 * // Create 3 streams with same initial value
 * const streams = createStreams(3, 0)
 *
 * // Create 3 streams with different initial values
 * const streams = createStreams(3, (index) => index * 10)
 * ```
 */
export function createStreams<T>(
  count: number,
  initialValue: T | ((index: number) => T)
): Stream<T>[] {
  const streams: Stream<T>[] = []

  for (let i = 0; i < count; i++) {
    const value =
      typeof initialValue === 'function' ? (initialValue as (index: number) => T)(i) : initialValue
    streams.push(new Stream(value))
  }

  return streams
}

/**
 * Create and combine multiple streams with factory function
 *
 * @param count - Number of streams to create
 * @param factory - Factory function to create streams
 * @returns Combined stream
 *
 * @example
 * ```tsx
 * const combined$ = batchWithFactory(3, (index) => new Stream(index))
 *
 * combined$.then(([v0, v1, v2]) => {
 *   console.log('Values:', v0, v1, v2)
 * })
 * ```
 */
export function batchWithFactory<T>(
  count: number,
  factory: (index: number) => Stream<T>
): Stream<T[]> {
  const streams: Stream<T>[] = []

  for (let i = 0; i < count; i++) {
    streams.push(factory(i))
  }

  return batch$(streams) as Stream<T[]>
}

/**
 * Combine multiple streams from object into a single object stream
 *
 * @param streams - Object with streams
 * @returns Combined stream that emits objects
 *
 * @example
 * ```tsx
 * const count$ = new Stream(0)
 * const name$ = new Stream('John')
 *
 * const combined$ = combineStreams({ count: count$, name: name$ })
 *
 * combined$.then(({ count, name }) => {
 *   console.log('Count:', count, 'Name:', name)
 * })
 * ```
 */
export function combineStreams<T extends Record<string, Observable<any>>>(
  streams: T
): Stream<{ [K in keyof T]: T[K] extends Observable<infer U> ? U : never }> {
  type Values = { [K in keyof T]: T[K] extends Observable<infer U> ? U : never }

  const result$ = new Stream<Values>({} as Values)

  const updateCombined = () => {
    const combined: any = {}
    for (const key in streams) {
      if (Object.prototype.hasOwnProperty.call(streams, key)) {
        const stream = streams[key]
        combined[key] = 'value' in stream ? stream.value : undefined
      }
    }
    result$.next(combined)
  }

  // Subscribe to all streams
  for (const key in streams) {
    if (Object.prototype.hasOwnProperty.call(streams, key)) {
      streams[key].then(() => {
        updateCombined()
      })
    }
  }

  // Initial update
  updateCombined()

  return result$
}
