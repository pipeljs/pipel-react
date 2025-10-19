import { Stream } from '../usePipel'

export type DataType = 'text' | 'json' | 'blob' | 'arrayBuffer' | 'formData'
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS'
export type Combination = 'overwrite' | 'chain'

export interface UseFetchOptions extends RequestInit {
  /**
   * Initial data before the request finished
   * @default null
   */
  initialData?: any

  /**
   * Will automatically run fetch when `useFetch` is used
   * @default true
   */
  immediate?: boolean

  /**
   * execute fetch only when condition is true
   * @default true
   */
  condition?: boolean | (() => boolean)

  /**
   * Will automatically refetch when:
   * - the URL is changed if the URL is a ref
   * - the payload is changed if the payload is a ref
   * @default false
   */
  refetch?: boolean

  /**
   * Auto refetch interval in millisecond
   * @default undefined
   */
  refresh?: number

  /**
   * Retry times when fetch error
   * @default 0
   */
  retry?: number

  /**
   * Allow cache the request result and reuse it if cacheResolve result is same
   * @default undefined
   */
  cacheSetting?: {
    expiration?: number
    cacheResolve?: (config: InternalConfig & { url: string }) => string
  }

  /**
   * Debounce interval in millisecond
   * @default undefined
   */
  debounce?:
    | number
    | {
        wait: number
        options?: {
          leading?: boolean
          maxWait?: number
          trailing?: boolean
        }
      }

  /**
   * Throttle interval in millisecond
   * @default undefined
   */
  throttle?:
    | number
    | {
        wait: number
        options?: {
          leading?: boolean
          trailing?: boolean
        }
      }

  /**
   * Timeout for abort request after number of millisecond
   * `0` means use browser default
   * @default undefined
   */
  timeout?: number

  /**
   * Fetch function
   */
  fetch?: typeof window.fetch

  /**
   * Allow update the `data` ref when fetch error whenever provided, or mutated in the `onFetchError` callback
   * @default false
   */
  updateDataOnError?: boolean

  /**
   * Will run immediately before the fetch request is dispatched
   */
  beforeFetch?: (
    ctx: BeforeFetchContext
  ) => Promise<Partial<BeforeFetchContext> | void> | Partial<BeforeFetchContext> | void

  /**
   * Will run immediately after the fetch request is returned.
   * Runs after any 2xx response
   */
  afterFetch?: (
    ctx: AfterFetchContext
  ) => Promise<Partial<AfterFetchContext>> | Partial<AfterFetchContext>

  /**
   * Will run immediately after the fetch request is returned.
   * Runs after any 4xx and 5xx response
   */
  onFetchError?: (ctx: {
    data: any
    response: Response | null
    error: any
  }) => Promise<Partial<OnFetchErrorContext>> | Partial<OnFetchErrorContext>
}

export interface UseFetchReturn<T> {
  /**
   * The fetch response body on success, may either be JSON or text
   */
  data: T | null

  /**
   * Indicates if the request is currently being fetched.
   */
  loading: boolean

  /**
   * Any fetch errors that may have occurred
   */
  error: any

  /**
   * Indicates if the fetch request has finished
   */
  isFinished: boolean

  /**
   * The statusCode of the HTTP fetch response
   */
  statusCode: number | null

  /**
   * The raw response of the fetch response
   */
  response: Response | null

  /**
   * Indicates if the fetch request is able to be aborted
   */
  canAbort: boolean

  /**
   * Indicates if the fetch request was aborted
   */
  aborted: boolean

  /**
   * promise stream
   */
  promise$: Stream<T | undefined>

  /**
   * Manually call the fetch
   * (default not throwing error)
   */
  execute: (throwOnFailed?: boolean) => Promise<any> | void

  /**
   * Abort the fetch request
   */
  abort: () => void

  /**
   * Cancel refresh request
   */
  cancelRefresh: () => void

  /**
   * clear current fetch cache
   */
  clearCache: () => void

  /**
   * Fires after the fetch request has finished
   */
  onFetchResponse: (callback: (response: Response) => void) => () => void

  /**
   * Fires after a fetch request error
   */
  onFetchError: (callback: (error: any) => void) => () => void

  /**
   * Fires after a fetch has completed
   */
  onFetchFinally: (callback: () => void) => () => void

  // methods
  get: (payload?: unknown) => UseFetchResult<T>
  post: (payload?: unknown, type?: string) => UseFetchResult<T>
  put: (payload?: unknown, type?: string) => UseFetchResult<T>
  delete: (payload?: unknown, type?: string) => UseFetchResult<T>
  patch: (payload?: unknown, type?: string) => UseFetchResult<T>
  head: (payload?: unknown, type?: string) => UseFetchResult<T>
  options: (payload?: unknown, type?: string) => UseFetchResult<T>

  // type
  json: <JSON = any>() => UseFetchReturn<JSON> & PromiseLike<UseFetchReturn<JSON>>
  text: () => UseFetchReturn<string> & PromiseLike<UseFetchReturn<string>>
  blob: () => UseFetchReturn<Blob> & PromiseLike<UseFetchReturn<Blob>>
  arrayBuffer: () => UseFetchReturn<ArrayBuffer> & PromiseLike<UseFetchReturn<ArrayBuffer>>
  formData: () => UseFetchReturn<FormData> & PromiseLike<UseFetchReturn<FormData>>
}

export type UseFetchResult<T> = UseFetchReturn<T> & PromiseLike<UseFetchReturn<T>>

export interface BeforeFetchContext {
  /**
   * The computed url of the current request
   */
  url: string

  /**
   * The request options of the current request
   */
  options: UseFetchOptions

  /**
   * Cancels the current request
   */
  cancel: () => void
}

export interface AfterFetchContext<T = any> {
  response: Response
  data: T | null
}

export interface OnFetchErrorContext<T = any, E = any> {
  error: E
  data: T | null
}

export interface CreateFetchOptions {
  /**
   * The base URL that will be prefixed to all urls unless urls are absolute
   */
  baseUrl?: string

  /**
   * Determine the inherit behavior for beforeFetch, afterFetch, onFetchError
   * @default 'chain'
   */
  combination?: Combination

  /**
   * Default Options for the useFetch function
   */
  options?: UseFetchOptions
}

export interface InternalConfig {
  method: HttpMethod
  type: DataType
  payload: unknown
  payloadType?: string
}
