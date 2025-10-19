import { useState, useEffect } from 'react'
import { Observable } from 'pipeljs'

/**
 * 订阅 Observable 并返回当前值
 *
 * @example
 * ```tsx
 * function SearchResults() {
 *   const [keyword, keyword$] = usePipel('')
 *
 *   const results = useObservable(
 *     keyword$.pipe(
 *       debounce(300),
 *       map(k => fetchResults(k))
 *     )
 *   )
 *
 *   return <div>{results}</div>
 * }
 * ```
 */
export function useObservable<T>(observable$: Observable<T>): T | undefined

export function useObservable<T>(observable$: Observable<T>, defaultValue: T): T

export function useObservable<T>(observable$: Observable<T>, defaultValue?: T): T | undefined {
  const [value, setValue] = useState<T | undefined>(() => {
    // 尝试立即获取流的当前值
    if ('value' in observable$ && observable$.value !== undefined) {
      return observable$.value as T
    }
    return defaultValue
  })

  useEffect(() => {
    // 立即获取一次当前值
    if ('value' in observable$ && observable$.value !== undefined) {
      setValue(observable$.value as T)
    }

    const child = observable$.then((newValue: T) => {
      setValue(newValue)
    })

    return () => {
      child.unsubscribe()
    }
  }, [observable$])

  return value
}
