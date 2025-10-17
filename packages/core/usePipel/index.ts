import { useState, useEffect, useRef, useMemo } from 'react'
import { Stream, Observable } from 'pipeljs'

export * from 'pipeljs'

/**
 * React plugin for pipel - auto cleanup on unmount
 */
export const reactPlugin = {
  thenAll: (unsubscribe: () => void) => {
    // React will handle cleanup via useEffect
    return unsubscribe
  },
}

/**
 * Create a stream with React integration
 */
export function $<T = any>(): Stream<T | undefined>
export function $<T = any>(data: T): Stream<T>

export function $<T = any>(data?: T) {
  const stream$ = new Stream<T>(data as any)
  return stream$.use(reactPlugin)
}

/**
 * 将 Stream/Observable 转换为 React 状态
 * 
 * @example
 * ```tsx
 * // 创建新的 Stream
 * const [count, count$] = usePipel(0)
 * 
 * // 使用现有的 Stream
 * const stream$ = new Stream(0)
 * const [value] = usePipel(stream$)
 * ```
 */
export function usePipel<T>(
  initialValue: T
): [T, Stream<T>]

export function usePipel<T>(
  initialValue: T | PromiseLike<T>
): [T | undefined, Stream<T>]

export function usePipel<T>(
  stream$: Stream<T>
): [T, Stream<T>]

export function usePipel<T>(
  observable$: Observable<T>
): [T | undefined, Observable<T>]

export function usePipel<T>(
  initialValueOrStream: T | PromiseLike<T> | Stream<T> | Observable<T>
): [T | undefined, Stream<T> | Observable<T>] {
  // 判断是否传入了 Stream/Observable
  const isStream = initialValueOrStream instanceof Stream
  const isObservable = initialValueOrStream instanceof Observable
  const isStreamOrObservable = isStream || isObservable
  
  // 创建或使用传入的流 - 使用 useMemo 确保稳定性
  const stream$ = useMemo(() => {
    if (isStreamOrObservable) {
      return initialValueOrStream as Stream<T> | Observable<T>
    }
    return $(initialValueOrStream as T)
  }, []) // 空依赖数组,只在首次渲染时创建
  
  // 获取初始值
  const getInitialValue = () => {
    if (isStream || isObservable) {
      return (stream$ as Stream<T>).value
    }
    return initialValueOrStream as T
  }
  
  // 创建 React 状态
  const [value, setValue] = useState<T | undefined>(getInitialValue)
  
  // 订阅流的变化
  useEffect(() => {
    // 同步当前值
    setValue(stream$.value as T)
    
    const child = stream$.then((newValue: T) => {
      setValue(newValue)
    })
    
    // 组件卸载时自动取消订阅
    return () => {
      child.unsubscribe()
    }
  }, [stream$])
  
  return [value, stream$]
}
