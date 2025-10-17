/**
 * 判断是否为 Promise
 */
export function isPromise<T = any>(value: any): value is Promise<T> {
  return value && typeof value.then === 'function'
}

/**
 * 判断是否为函数
 */
export function isFunction(value: any): value is Function {
  return typeof value === 'function'
}

/**
 * 安全执行回调
 */
export function safeCall<T>(
  callback: (...args: any[]) => T,
  ...args: any[]
): T | undefined {
  try {
    return callback(...args)
  } catch (error) {
    console.error('Error in callback:', error)
    return undefined
  }
}

/**
 * 创建延迟 Promise
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
