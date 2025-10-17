import { useEffect } from 'react'
import { Stream } from 'pipeljs'
import { useStream } from './useStream'

export interface PersistOptions<T> {
  key: string
  storage?: Storage
  serializer?: (value: T) => string
  deserializer?: (value: string) => T
}

/**
 * 创建持久化的 Stream，自动同步到 localStorage
 * 
 * @example
 * ```tsx
 * function Settings() {
 *   const theme$ = persistStream$('dark', {
 *     key: 'app-theme'
 *   })
 *   const [theme] = usePipel(theme$)
 *   
 *   return (
 *     <button onClick={() => theme$.next(theme === 'dark' ? 'light' : 'dark')}>
 *       Toggle Theme: {theme}
 *     </button>
 *   )
 * }
 * ```
 */
export function persistStream$<T>(
  initialValue: T,
  options: PersistOptions<T>
): Stream<T> {
  const {
    key,
    storage = localStorage,
    serializer = JSON.stringify,
    deserializer = JSON.parse
  } = options
  
  // 从 storage 读取初始值
  const getStoredValue = (): T => {
    try {
      const item = storage.getItem(key)
      return item ? deserializer(item) : initialValue
    } catch (error) {
      console.error(`Error reading from storage (key: ${key}):`, error)
      return initialValue
    }
  }
  
  const stream$ = useStream(getStoredValue())
  
  // 监听 stream 变化并持久化
  useEffect(() => {
    const child = stream$.then((value: T) => {
      try {
        storage.setItem(key, serializer(value))
      } catch (error) {
        console.error(`Error writing to storage (key: ${key}):`, error)
      }
    })
    
    return () => {
      child.unsubscribe()
    }
  }, [stream$, key, storage, serializer])
  
  return stream$
}
