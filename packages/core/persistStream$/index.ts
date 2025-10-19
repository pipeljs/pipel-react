import { Stream } from 'pipeljs'

export interface PersistSerializer<T> {
  serialize: (value: T) => string
  deserialize: (value: string) => T
}

/**
 * 创建持久化的 Stream，自动同步到 localStorage
 * 注意：这是一个工厂函数，不是 React Hook
 *
 * @example
 * ```tsx
 * // 在组件外部创建
 * const theme$ = persistStream$('app-theme', 'dark')
 *
 * function Settings() {
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
  key: string,
  initialValue: T,
  serializer?: PersistSerializer<T>
): Stream<T> {
  const storage = typeof window !== 'undefined' ? localStorage : null
  const serialize = serializer?.serialize || JSON.stringify
  const deserialize = serializer?.deserialize || JSON.parse

  // 从 storage 读取初始值
  const getStoredValue = (): T => {
    if (!storage) return initialValue

    try {
      const item = storage.getItem(key)
      return item ? deserialize(item) : initialValue
    } catch (error) {
      console.error(`Error reading from storage (key: ${key}):`, error)
      return initialValue
    }
  }

  const stream$ = new Stream<T>(getStoredValue())

  // 监听 stream 变化并持久化
  stream$.then((value: T) => {
    if (!storage) return

    try {
      storage.setItem(key, serialize(value))
    } catch (error) {
      console.error(`Error writing to storage (key: ${key}):`, error)
    }
  })

  return stream$
}
