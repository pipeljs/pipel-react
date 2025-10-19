/**
 * debug - Debug utilities for pipel-react
 * Helps with debugging stream values and subscriptions
 */

import { Stream, Observable } from 'pipeljs'

/**
 * Debug plugin options
 */
export interface DebugOptions {
  /** Custom label for the stream */
  label?: string
  /** Whether to log values */
  logValues?: boolean
  /** Whether to log subscriptions */
  logSubscriptions?: boolean
  /** Whether to log errors */
  logErrors?: boolean
  /** Custom logger function */
  logger?: (message: string, ...args: any[]) => void
}

/**
 * Create a debug plugin for streams
 *
 * @param options - Debug options
 * @returns Debug plugin
 *
 * @example
 * ```tsx
 * const stream$ = new Stream(0)
 * stream$.use(createDebugPlugin({ label: 'Counter' }))
 *
 * stream$.next(1) // Logs: [Counter] Value: 1
 * stream$.next(2) // Logs: [Counter] Value: 2
 * ```
 */
export function createDebugPlugin(options: DebugOptions = {}) {
  const {
    label = 'Stream',
    logValues = true,
    logSubscriptions = true,
    logErrors = true,
    logger = console.log,
  } = options

  return {
    thenAll: (unsubscribe: () => void, _observable: Observable<any>) => {
      if (logSubscriptions) {
        logger(`[${label}] Subscribed`)
      }

      const originalUnsubscribe = unsubscribe
      return () => {
        if (logSubscriptions) {
          logger(`[${label}] Unsubscribed`)
        }
        originalUnsubscribe()
      }
    },
    afterSetValue: (value: any) => {
      if (logValues) {
        logger(`[${label}] Value:`, value)
      }
    },
    catchError: (error: Error) => {
      if (logErrors) {
        logger(`[${label}] Error:`, error)
      }
    },
  }
}

/**
 * Add debug logging to a stream
 *
 * @param stream$ - Stream to debug
 * @param label - Label for the stream
 * @returns The same stream (for chaining)
 *
 * @example
 * ```tsx
 * const count$ = new Stream(0)
 * debug$(count$, 'Counter')
 *
 * count$.next(1) // Logs: [Counter] Value: 1
 * ```
 */
export function debug$<T>(
  stream$: Stream<T>,
  label?: string,
  options?: Omit<DebugOptions, 'label'>
): Stream<T> {
  stream$.use(createDebugPlugin({ ...options, label }))
  return stream$
}

/**
 * Log stream values to console
 *
 * @param stream$ - Stream to log
 * @param label - Optional label
 * @returns Unsubscribe function
 *
 * @example
 * ```tsx
 * const count$ = new Stream(0)
 * const unsubscribe = logStream$(count$, 'Counter')
 *
 * count$.next(1) // Logs: [Counter] 1
 * count$.next(2) // Logs: [Counter] 2
 *
 * unsubscribe() // Stop logging
 * ```
 */
export function logStream$<T>(stream$: Stream<T> | Observable<T>, label?: string): () => void {
  const prefix = label ? `[${label}]` : '[Stream]'

  const subscription = stream$.then((value: T) => {
    console.log(prefix, value)
  })

  return () => subscription.unsubscribe()
}

/**
 * Trace stream lifecycle events
 *
 * @param stream$ - Stream to trace
 * @param label - Optional label
 * @returns The same stream (for chaining)
 *
 * @example
 * ```tsx
 * const count$ = new Stream(0)
 * trace$(count$, 'Counter')
 *
 * // Logs lifecycle events:
 * // [Counter] Created
 * // [Counter] Subscribed
 * // [Counter] Value: 1
 * // [Counter] Unsubscribed
 * // [Counter] Completed
 * ```
 */
export function trace$<T>(stream$: Stream<T>, label?: string): Stream<T> {
  const prefix = label ? `[${label}]` : '[Stream]'

  console.log(`${prefix} Created`)

  stream$.use({
    thenAll: (unsubscribe: () => void) => {
      console.log(`${prefix} Subscribed`)
      const originalUnsubscribe = unsubscribe
      return () => {
        console.log(`${prefix} Unsubscribed`)
        originalUnsubscribe()
      }
    },
  })

  stream$.afterSetValue((value: any) => {
    console.log(`${prefix} Value:`, value)
  })

  stream$.afterUnsubscribe(() => {
    console.log(`${prefix} Completed`)
  })

  return stream$
}

/**
 * Create a stream inspector for debugging
 *
 * @param stream$ - Stream to inspect
 * @returns Inspector object
 *
 * @example
 * ```tsx
 * const count$ = new Stream(0)
 * const inspector = inspect$(count$)
 *
 * count$.next(1)
 * count$.next(2)
 *
 * console.log(inspector.getHistory()) // [0, 1, 2]
 * console.log(inspector.getSubscriberCount()) // 1
 * ```
 */
export function inspect$<T>(stream$: Stream<T>) {
  const history: T[] = [stream$.value]
  let subscriberCount = 0

  stream$.use({
    thenAll: (unsubscribe: () => void) => {
      subscriberCount++
      const originalUnsubscribe = unsubscribe
      return () => {
        subscriberCount--
        originalUnsubscribe()
      }
    },
  })

  stream$.afterSetValue((value: T) => {
    history.push(value)
  })

  return {
    getHistory: () => [...history],
    getSubscriberCount: () => subscriberCount,
    getCurrentValue: () => stream$.value,
    clear: () => {
      history.length = 0
      history.push(stream$.value)
    },
  }
}

/**
 * Performance monitoring for streams
 *
 * @param stream$ - Stream to monitor
 * @param label - Optional label
 * @returns Performance stats
 *
 * @example
 * ```tsx
 * const count$ = new Stream(0)
 * const perf = performanceMonitor$(count$, 'Counter')
 *
 * count$.next(1)
 * count$.next(2)
 *
 * console.log(perf.getStats())
 * // {
 * //   updateCount: 2,
 * //   averageUpdateTime: 0.5,
 * //   totalTime: 1.0
 * // }
 * ```
 */
export function performanceMonitor$<T>(stream$: Stream<T>, label?: string) {
  const prefix = label ? `[${label}]` : '[Stream]'
  let updateCount = 0
  let totalTime = 0
  const updateTimes: number[] = []

  stream$.afterSetValue(() => {
    const start = performance.now()
    updateCount++

    // Measure time in next tick
    setTimeout(() => {
      const duration = performance.now() - start
      updateTimes.push(duration)
      totalTime += duration
    }, 0)
  })

  return {
    getStats: () => ({
      updateCount,
      averageUpdateTime: updateCount > 0 ? totalTime / updateCount : 0,
      totalTime,
      updateTimes: [...updateTimes],
    }),
    log: () => {
      const stats = {
        updateCount,
        averageUpdateTime: updateCount > 0 ? totalTime / updateCount : 0,
        totalTime,
      }
      console.log(`${prefix} Performance:`, stats)
    },
    reset: () => {
      updateCount = 0
      totalTime = 0
      updateTimes.length = 0
    },
  }
}
