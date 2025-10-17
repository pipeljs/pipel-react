import { useFetch } from './useFetch'
import type { CreateFetchOptions, UseFetchOptions, Combination } from './types'
import { joinPaths, isAbsoluteURL, combineCallbacks } from './utils'

/**
 * 创建带有默认配置的 fetch 实例
 * 
 * @example
 * ```tsx
 * const useMyFetch = createFetch({
 *   baseUrl: 'https://api.example.com',
 *   options: {
 *     headers: {
 *       'Authorization': 'Bearer token'
 *     }
 *   }
 * })
 * 
 * function MyComponent() {
 *   const { data } = useMyFetch('/users')
 *   return <div>{JSON.stringify(data)}</div>
 * }
 * ```
 */
export function createFetch(config: CreateFetchOptions = {}) {
  const _combination = config.combination || ('chain' as Combination)
  const _options = config.options

  function useFactoryFetch<T = any>(url: string, options?: UseFetchOptions) {
    const computedUrl = (() => {
      const baseUrl = config.baseUrl || ''
      const targetUrl = url

      return baseUrl && !isAbsoluteURL(targetUrl) ? joinPaths(baseUrl, targetUrl) : targetUrl
    })()

    const combinedOptions: UseFetchOptions = {
      ..._options,
      ...options,
      headers: { ..._options?.headers, ...options?.headers },
      beforeFetch: combineCallbacks(_combination, _options?.beforeFetch, options?.beforeFetch),
      afterFetch: combineCallbacks(_combination, _options?.afterFetch, options?.afterFetch),
      onFetchError: combineCallbacks(_combination, _options?.onFetchError, options?.onFetchError),
    }

    return useFetch<T>(computedUrl, combinedOptions)
  }

  return useFactoryFetch as typeof useFetch
}
