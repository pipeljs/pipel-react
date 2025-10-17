import { Observable, Stream } from '../usePipel'
import type { Combination } from './types'

export function joinPaths(start: string, end: string): string {
  if (!start.endsWith('/') && !end.startsWith('/')) return `${start}/${end}`
  return `${start}${end}`
}

export function addQueryParams(url: string, params: unknown) {
  if (Object.prototype.toString.call(params) !== '[object Object]') return url
  const path = url.split('?')[0]
  const query = url.split('?')[1] || ''
  const paramsObj = new URLSearchParams(query)
  Object.keys(params as Record<string, unknown>).forEach((key) =>
    paramsObj.set(key, (params as Record<string, string>)[key])
  )
  return path + '?' + paramsObj.toString()
}

// A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
export function isAbsoluteURL(url: string) {
  return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(url)
}

export function getValue(data: any) {
  if (data instanceof Observable || data instanceof Stream) return data.value
  else if (typeof data === 'function') return data()
  else return data
}

export function headersToObject(headers: HeadersInit | undefined) {
  if (typeof Headers !== 'undefined' && headers instanceof Headers)
    return Object.fromEntries(headers.entries())
  return headers
}

export function combineCallbacks<T = any>(
  combination: Combination,
  ...callbacks: ((ctx: T) => void | Partial<T> | Promise<void | Partial<T>>) | undefined[]
) {
  if (combination === 'overwrite') {
    // use last callback
    return async (ctx: T) => {
      const callback = callbacks[callbacks.length - 1]
      if (callback) return { ...ctx, ...(await callback(ctx)) }
      return ctx
    }
  } else {
    // chaining and combine result
    return async (ctx: T) => {
      for (const callback of callbacks) {
        if (callback) ctx = { ...ctx, ...(await callback(ctx)) }
      }
      return ctx
    }
  }
}

/**
 * Create event hook for callbacks
 */
export function createEventHook<T = any>() {
  const callbacks: Set<(data: T) => void> = new Set()

  const on = (callback: (data: T) => void) => {
    callbacks.add(callback)
    return () => {
      callbacks.delete(callback)
    }
  }

  const trigger = (data: T) => {
    callbacks.forEach((callback) => callback(data))
  }

  return { on, trigger }
}
