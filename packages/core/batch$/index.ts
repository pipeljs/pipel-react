/**
 * batch$ - Batch create multiple streams
 * Convenient way to create multiple streams at once
 */

import { Stream } from 'pipeljs'

/**
 * Batch create multiple streams from a config object
 * 
 * @param config - Object with stream names and initial values
 * @returns Object with created streams
 * 
 * @example
 * ```tsx
 * const streams = batch$({
 *   count: 0,
 *   name: 'John',
 *   isActive: true
 * })
 * 
 * // Access streams
 * streams.count.next(1)
 * streams.name.next('Jane')
 * streams.isActive.next(false)
 * 
 * // Subscribe to streams
 * streams.count.then(value => console.log('Count:', value))
 * ```
 */
export function batch$<T extends Record<string, any>>(
  config: T
): { [K in keyof T]: Stream<T[K]> } {
  const result: any = {}

  for (const key in config) {
    if (Object.prototype.hasOwnProperty.call(config, key)) {
      result[key] = new Stream(config[key])
    }
  }

  return result
}

/**
 * Batch create multiple streams with type inference
 * 
 * @example
 * ```tsx
 * const { count$, name$, isActive$ } = batch$({
 *   count$: 0,
 *   name$: 'John',
 *   isActive$: true
 * })
 * ```
 */
export function createStreams<T extends Record<string, any>>(
  config: T
): { [K in keyof T]: Stream<T[K]> } {
  return batch$(config)
}

/**
 * Batch create multiple streams with custom factory
 * 
 * @param keys - Array of stream names
 * @param factory - Factory function to create initial values
 * @returns Object with created streams
 * 
 * @example
 * ```tsx
 * const streams = batchWithFactory(
 *   ['count', 'name', 'isActive'],
 *   (key) => {
 *     if (key === 'count') return 0
 *     if (key === 'name') return 'John'
 *     if (key === 'isActive') return true
 *     return undefined
 *   }
 * )
 * ```
 */
export function batchWithFactory<K extends string, T>(
  keys: K[],
  factory: (key: K) => T
): Record<K, Stream<T>> {
  const result: any = {}

  for (const key of keys) {
    result[key] = new Stream(factory(key))
  }

  return result
}

/**
 * Combine multiple streams into a single object stream
 * 
 * @param streams - Object with streams
 * @returns Combined stream
 * 
 * @example
 * ```tsx
 * const count$ = new Stream(0)
 * const name$ = new Stream('John')
 * 
 * const combined$ = combineStreams({ count$, name$ })
 * 
 * combined$.then(({ count$, name$ }) => {
 *   console.log('Count:', count$, 'Name:', name$)
 * })
 * ```
 */
export function combineStreams<T extends Record<string, Stream<any>>>(
  streams: T
): Stream<{ [K in keyof T]: T[K] extends Stream<infer U> ? U : never }> {
  const result$ = new Stream<any>({})

  const updateCombined = () => {
    const combined: any = {}
    for (const key in streams) {
      if (Object.prototype.hasOwnProperty.call(streams, key)) {
        combined[key] = streams[key].value
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
