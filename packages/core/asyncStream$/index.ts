/**
 * asyncStream$ - Create async stream with loading/error state
 * Automatically manages loading and error states
 */

import { useCallback, useRef, useEffect } from 'react'
import { Stream } from 'pipeljs'

/**
 * Result of asyncStream$
 */
export interface AsyncStreamResult<T> {
  data$: Stream<T | undefined>
  loading$: Stream<boolean>
  error$: Stream<Error | undefined>
  execute: (...args: any[]) => Promise<void>
}

/**
 * Create an async stream with automatic loading/error state management
 * 
 * @param asyncFn - Async function to execute
 * @returns Object with data$, loading$, error$, and execute function
 * 
 * @example
 * ```tsx
 * const fetchUser = async (id: number) => {
 *   const res = await fetch(`/api/users/${id}`)
 *   return res.json()
 * }
 * 
 * const { data$, loading$, error$, execute } = asyncStream$(fetchUser)
 * 
 * // Execute the async function
 * execute(123)
 * 
 * // Subscribe to streams
 * data$.then(user => console.log('User:', user))
 * loading$.then(loading => console.log('Loading:', loading))
 * error$.then(error => console.log('Error:', error))
 * ```
 */
export function asyncStream$<T>(
  asyncFn: (...args: any[]) => Promise<T>
): AsyncStreamResult<T> {
  const data$ = new Stream<T | undefined>(undefined)
  const loading$ = new Stream<boolean>(false)
  const error$ = new Stream<Error | undefined>(undefined)

  const execute = async (...args: any[]) => {
    loading$.next(true)
    error$.next(undefined)

    try {
      const result = await asyncFn(...args)
      data$.next(result)
    } catch (e) {
      error$.next(e as Error)
    } finally {
      loading$.next(false)
    }
  }

  return { data$, loading$, error$, execute }
}

/**
 * Hook version of asyncStream$ that properly integrates with React lifecycle
 * 
 * @param asyncFn - Async function to execute
 * @returns Object with data$, loading$, error$, and execute function
 * 
 * @example
 * ```tsx
 * function UserProfile({ userId }: { userId: number }) {
 *   const fetchUser = useCallback(async (id: number) => {
 *     const res = await fetch(`/api/users/${id}`)
 *     return res.json()
 *   }, [])
 *   
 *   const { data$, loading$, error$, execute } = useAsyncStream$(fetchUser)
 *   
 *   const user = useObservable(data$)
 *   const loading = useObservable(loading$)
 *   const error = useObservable(error$)
 *   
 *   useEffect(() => {
 *     execute(userId)
 *   }, [userId, execute])
 *   
 *   if (loading) return <div>Loading...</div>
 *   if (error) return <div>Error: {error.message}</div>
 *   if (!user) return null
 *   
 *   return <div>{user.name}</div>
 * }
 * ```
 */
export function useAsyncStream$<T>(
  asyncFn: (...args: any[]) => Promise<T>
): AsyncStreamResult<T> {
  const streamsRef = useRef<AsyncStreamResult<T>>()

  if (!streamsRef.current) {
    streamsRef.current = asyncStream$(asyncFn)
  }

  useEffect(() => {
    const streams = streamsRef.current!
    return () => {
      streams.data$.complete()
      streams.loading$.complete()
      streams.error$.complete()
    }
  }, [])

  return streamsRef.current
}

/**
 * Create an async stream that auto-executes on mount
 * 
 * @param asyncFn - Async function to execute
 * @param args - Arguments to pass to the function
 * @returns Object with data$, loading$, error$, and execute function
 * 
 * @example
 * ```tsx
 * function UserProfile({ userId }: { userId: number }) {
 *   const { data$, loading$, error$ } = useAsyncStreamAuto$(
 *     async (id: number) => {
 *       const res = await fetch(`/api/users/${id}`)
 *       return res.json()
 *     },
 *     [userId]
 *   )
 *   
 *   const user = useObservable(data$)
 *   const loading = useObservable(loading$)
 *   const error = useObservable(error$)
 *   
 *   if (loading) return <div>Loading...</div>
 *   if (error) return <div>Error: {error.message}</div>
 *   if (!user) return null
 *   
 *   return <div>{user.name}</div>
 * }
 * ```
 */
export function useAsyncStreamAuto$<T>(
  asyncFn: (...args: any[]) => Promise<T>,
  args: any[] = []
): AsyncStreamResult<T> {
  const result = useAsyncStream$(asyncFn)

  const execute = useCallback(() => {
    result.execute(...args)
  }, [result, ...args])

  useEffect(() => {
    execute()
  }, [execute])

  return result
}
