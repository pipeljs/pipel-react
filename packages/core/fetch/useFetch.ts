import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { debounce, throttle } from 'lodash-es'
import { $, Observable, Stream, PromiseStatus } from '../usePipel'
import type {
  DataType,
  HttpMethod,
  UseFetchOptions,
  UseFetchReturn,
  BeforeFetchContext,
  InternalConfig,
} from './types'
import { headersToObject, addQueryParams, getValue, createEventHook } from './utils'

const payloadMapping: Record<string, string> = {
  json: 'application/json',
  text: 'text/plain',
}

export function useFetch<T>(
  url: string | Stream<string> | Observable<string>,
  fetchOptions?: UseFetchOptions
): UseFetchReturn<T> & PromiseLike<UseFetchReturn<T>> {
  const supportsAbort = typeof AbortController === 'function'

  const options = {
    immediate: true,
    refetch: false,
    condition: true,
    updateDataOnError: false,
    ...fetchOptions,
  }

  const config = useRef<InternalConfig>({
    method: 'GET',
    type: 'text' as DataType,
    payload: undefined as unknown,
  })

  const promise$ = useMemo(() => $<T>(fetchOptions?.initialData), [])

  const { fetch = window?.fetch, initialData, timeout, refresh, cacheSetting } = options

  // Event Hooks
  const responseEvent = useMemo(() => createEventHook<Response>(), [])
  const errorEvent = useMemo(() => createEventHook<any>(), [])
  const finallyEvent = useMemo(() => createEventHook<any>(), [])

  const [isFinished, setIsFinished] = useState(false)
  const [loading, setLoading] = useState(false)
  const [aborted, setAborted] = useState(false)
  const [statusCode, setStatusCode] = useState<number | null>(null)
  const [response, setResponse] = useState<Response | null>(null)
  const [error, setError] = useState<any>(null)
  const [data, setData] = useState<T | null>(initialData || null)

  const canAbort = useMemo(() => supportsAbort && loading, [loading])

  const controllerRef = useRef<AbortController>()
  const timerRef = useRef<NodeJS.Timeout>()
  const intervalRef = useRef<NodeJS.Timeout>()
  const retryCountRef = useRef(0)
  const executeCounterRef = useRef(0)
  const cacheKeyRef = useRef<string | null>(null)

  const REPEAT_REQUEST = 'repeat request'
  const TIME_OUT = 'fetch timeout'

  const abort = useCallback(
    (message?: string) => {
      if (supportsAbort) {
        controllerRef.current?.abort(message)
        controllerRef.current = new AbortController()
        setAborted(true)
      }
    },
    [supportsAbort]
  )

  const setLoadingState = useCallback((isLoading: boolean) => {
    setLoading(isLoading)
    setIsFinished(!isLoading)
  }, [])

  const execute = useCallback(
    async (throwOnFailed = true) => {
      const conditionResult =
        typeof options.condition === 'function' ? options.condition() : getValue(options.condition)
      if (!conditionResult) return Promise.resolve(null)

      abort(REPEAT_REQUEST)

      // cache process
      const cacheKey =
        cacheSetting?.cacheResolve?.({ url: getValue(url), ...config.current }) || null
      cacheKeyRef.current = cacheKey
      if (cacheKey) {
        const cacheData = (useFetch as any)._cache.get(cacheKey)
        if (cacheData !== undefined) {
          setData(cacheData)
          setLoadingState(false)
          promise$.next(cacheData)
          return Promise.resolve(cacheData)
        }
      }

      setLoadingState(true)
      setError(null)
      setStatusCode(null)
      setAborted(false)

      executeCounterRef.current += 1
      const currentExecuteCounter = executeCounterRef.current

      const defaultFetchOptions: RequestInit = {
        method: config.current.method,
        headers: {},
      }

      if (config.current.payload && config.current.method !== 'GET') {
        const headers = headersToObject(defaultFetchOptions.headers) as Record<string, string>
        const payload = getValue(config.current.payload)

        if (
          !config.current.payloadType &&
          payload &&
          Object.getPrototypeOf(payload) === Object.prototype &&
          !(payload instanceof FormData)
        )
          config.current.payloadType = 'json'

        if (config.current.payloadType)
          headers['Content-Type'] =
            payloadMapping[config.current.payloadType] ?? config.current.payloadType

        defaultFetchOptions.body =
          config.current.payloadType === 'json' ? JSON.stringify(payload) : (payload as BodyInit)
      }

      let isCanceled = false
      const context: BeforeFetchContext = {
        url:
          config.current.method === 'GET' && config.current.payload
            ? addQueryParams(getValue(url), getValue(config.current.payload))
            : getValue(url),
        options: {
          ...defaultFetchOptions,
          ...fetchOptions,
        },
        cancel: () => {
          isCanceled = true
        },
      }

      if (options.beforeFetch) Object.assign(context, await options.beforeFetch(context))

      if (isCanceled || !fetch) {
        setLoadingState(false)
        return Promise.resolve(null)
      }

      let responseData: any = null
      setResponse(null)

      if (timeout) {
        timerRef.current = setTimeout(() => abort(TIME_OUT), timeout)
      }

      promise$.status = PromiseStatus.PENDING

      const requestOptions: RequestInit = {
        ...defaultFetchOptions,
        ...fetchOptions,
        headers: {
          ...headersToObject(defaultFetchOptions.headers),
          ...headersToObject(context.options?.headers),
        },
      }

      // Add abort signal
      if (controllerRef.current) {
        requestOptions.signal = controllerRef.current.signal
      }

      return fetch(context.url, requestOptions)
        .then(async (fetchResponse) => {
          setResponse(fetchResponse)
          setStatusCode(fetchResponse.status)

          const contentType = fetchResponse.headers.get('Content-Type')
          const isSSEStream =
            contentType?.includes('text/event-stream') &&
            fetchResponse.body instanceof ReadableStream
          const isNDJSONStream =
            contentType?.includes('application/x-ndjson') &&
            fetchResponse.body instanceof ReadableStream

          // handle stream response
          if (isSSEStream || isNDJSONStream) {
            const reader = fetchResponse.clone().body?.getReader() as ReadableStreamDefaultReader<
              Uint8Array<ArrayBuffer>
            >
            const decoder = new TextDecoder()
            let received = ''
            let buffer = ''

            while (true) {
              const { done, value } = await reader.read()

              if (done) break

              const chunk = decoder.decode(value, { stream: true })
              received += chunk

              if (isNDJSONStream) {
                buffer += chunk
                const lines = buffer.split('\n')
                buffer = lines.pop() || ''

                for (const line of lines) {
                  if (line.trim()) {
                    try {
                      const jsonObj = JSON.parse(line)
                      promise$.next(jsonObj as T)
                    } catch (e) {
                      console.error(e)
                      promise$.next(line as T)
                    }
                  }
                }
              } else {
                promise$.next(chunk as T)
              }
            }

            if (isNDJSONStream && buffer.trim()) {
              try {
                const jsonObj = JSON.parse(buffer)
                promise$.next(jsonObj as T)
              } catch (e) {
                console.error(e)
                promise$.next(buffer as T)
              }
            }

            responseData = received
          } else {
            responseData = await fetchResponse.clone()[config.current.type]()
          }

          if (!fetchResponse.ok) {
            setData(initialData || null)
            throw new Error(fetchResponse.statusText)
          }

          if (options.afterFetch) {
            ;({ data: responseData } = await options.afterFetch({
              data: responseData,
              response: fetchResponse,
            }))
          }

          retryCountRef.current = 0
          setData(responseData)
          if (cacheKey) {
            ;(useFetch as any)._cache.set(cacheKey, responseData)
            if (cacheSetting?.expiration)
              setTimeout(
                () => (useFetch as any)._cache.delete(cacheKey || ''),
                cacheSetting.expiration
              )
          }
          if (!isSSEStream && !isNDJSONStream) {
            promise$.next(Promise.resolve(responseData))
          }

          responseEvent.trigger(fetchResponse)
          return responseData
        })
        .catch(async (fetchError) => {
          if (fetchError === REPEAT_REQUEST) {
            console.warn(REPEAT_REQUEST, getValue(url))
          }
          let errorData = fetchError.message || fetchError.name

          if (options.onFetchError) {
            ;({ error: errorData, data: responseData } = await options.onFetchError({
              data: responseData,
              error: fetchError,
              response: response,
            }))
          }

          if (options.retry && retryCountRef.current < options.retry) {
            retryCountRef.current += 1
            execute()
            return
          }

          setError(errorData)
          if (options.updateDataOnError) setData(responseData)

          promise$.next(Promise.reject(errorData))
          errorEvent.trigger(errorData)
          if (throwOnFailed) throw errorData
          return null
        })
        .finally(() => {
          if (currentExecuteCounter === executeCounterRef.current && retryCountRef.current === 0)
            setLoadingState(false)
          if (timerRef.current) clearTimeout(timerRef.current)
          finallyEvent.trigger(null)
        })
    },
    [url, options, abort, setLoadingState, promise$, responseEvent, errorEvent, finallyEvent]
  )

  const executeFun = useMemo(() => {
    if (options.debounce) {
      return debounce(
        execute,
        typeof options.debounce === 'number' ? options.debounce : options.debounce.wait,
        (typeof options.debounce === 'object' && options.debounce.options) || {}
      )
    } else if (options.throttle) {
      return throttle(
        execute,
        typeof options.throttle === 'number' ? options.throttle : options.throttle.wait,
        (typeof options.throttle === 'object' && options.throttle.options) || {}
      )
    }
    return execute
  }, [execute, options.debounce, options.throttle])

  // Initial execution
  useEffect(() => {
    if (options.immediate) {
      executeFun()
    }
  }, [])

  // Refresh interval
  useEffect(() => {
    if (refresh) {
      intervalRef.current = setInterval(() => executeFun(), refresh)
      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current)
      }
    }
  }, [refresh, executeFun])

  // Watch for url changes
  useEffect(() => {
    if (options.refetch && (url instanceof Observable || (url as any) instanceof Stream)) {
      const child = (url as Observable<string>).then(() => executeFun())
      return () => child.unsubscribe()
    }
  }, [url, options.refetch, executeFun])

  const setMethod = useCallback(
    (method: HttpMethod) => {
      return (payload?: unknown, payloadType?: string) => {
        if (!loading) {
          config.current.method = method
          config.current.payload = payload
          config.current.payloadType = payloadType

          if (
            options.refetch &&
            (config.current.payload instanceof Observable ||
              config.current.payload instanceof Stream)
          ) {
            config.current.payload.then(() => executeFun())
          }

          return {
            ...shell,
            then(onFulfilled: any, onRejected: any) {
              return waitUntilFinished().then(onFulfilled, onRejected)
            },
          } as any
        }
        return undefined
      }
    },
    [loading, options.refetch, executeFun]
  )

  // 先创建 shell 对象的基础部分
  const shell: UseFetchReturn<T> = {
    isFinished,
    loading,
    statusCode,
    response,
    error,
    data,
    canAbort,
    aborted,
    promise$,
    abort,
    execute: executeFun,
    cancelRefresh: () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    },
    clearCache: () => (useFetch as any)._cache.delete(cacheKeyRef.current || ''),
    onFetchResponse: responseEvent.on,
    onFetchError: errorEvent.on,
    onFetchFinally: finallyEvent.on,
    // method - 占位，稍后赋值
    get: null as any,
    put: null as any,
    post: null as any,
    delete: null as any,
    patch: null as any,
    head: null as any,
    options: null as any,
    // type - 占位，稍后赋值
    json: null as any,
    text: null as any,
    blob: null as any,
    arrayBuffer: null as any,
    formData: null as any,
  }

  const waitUntilFinished = useCallback(() => {
    return new Promise<UseFetchReturn<T>>((resolve, reject) => {
      const checkFinished = () => {
        if (isFinished) {
          if (error) {
            reject(shell)
          } else {
            resolve(shell)
          }
        } else {
          setTimeout(checkFinished, 50)
        }
      }
      checkFinished()
    })
  }, [isFinished, error])

  const setType = useCallback(
    (type: DataType) => {
      return () => {
        config.current.type = type
        return {
          ...shell,
          then(onFulfilled: any, onRejected: any) {
            return waitUntilFinished().then(onFulfilled, onRejected)
          },
        } as any
      }
    },
    [waitUntilFinished]
  )

  // 赋值 method 方法
  shell.get = setMethod('GET')
  shell.put = setMethod('PUT')
  shell.post = setMethod('POST')
  shell.delete = setMethod('DELETE')
  shell.patch = setMethod('PATCH')
  shell.head = setMethod('HEAD')
  shell.options = setMethod('OPTIONS')

  // 赋值 type 方法
  shell.json = setType('json')
  shell.text = setType('text')
  shell.blob = setType('blob')
  shell.arrayBuffer = setType('arrayBuffer')
  shell.formData = setType('formData')

  return {
    ...shell,
    then(onFulfilled, onRejected) {
      return waitUntilFinished().then(onFulfilled, onRejected)
    },
  }
}

;(useFetch as any)._cache = new Map() as unknown as Map<string, any>

export function clearFetchCache() {
  ;(useFetch as any)._cache = new Map()
}
