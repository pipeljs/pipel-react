/**
 * Pipel-React Core
 * React integration for PipelJS
 */

// Core Hooks
export { usePipel } from './usePipel'
export { useStream } from './useStream'
export { useObservable } from './useObservable'
export { to$ } from './to$'
export { effect$ } from './effect$'
export { useSyncState } from './useSyncState'
export { usePipelRender } from './usePipelRender'
export { persistStream$ } from './persistStream$'
export type { PersistOptions } from './persistStream$'

// Advanced Hooks
export { 
  computedStream$, 
  useComputedStream$ 
} from './computedStream$'

export { 
  fromEvent, 
  useFromEvent, 
  useWindowEvent, 
  useDocumentEvent 
} from './fromEvent'

export { 
  asyncStream$, 
  useAsyncStream$, 
  useAsyncStreamAuto$ 
} from './asyncStream$'
export type { AsyncStreamResult } from './asyncStream$'

export { 
  batch$, 
  createStreams, 
  batchWithFactory, 
  combineStreams 
} from './batch$'

// Debug Utilities
export { 
  createDebugPlugin, 
  debug$, 
  logStream$, 
  trace$, 
  inspect$, 
  performanceMonitor$ 
} from './debug'
export type { DebugOptions } from './debug'

// Fetch
export { useFetch } from './fetch/useFetch'
export { createFetch } from './fetch/createFetch'
export type { 
  UseFetchOptions, 
  UseFetchReturn, 
  CreateFetchOptions 
} from './fetch/types'

// Re-export operators from pipeljs
export {
  map,
  filter,
  debounce,
  throttle,
  distinctUntilChanged,
  take,
  skip,
  merge,
  concat,
  switchMap,
  mergeMap,
  catchError,
  retry,
  tap,
  delay,
  timeout,
  share,
  startWith,
  endWith,
  scan,
  reduce,
  every,
  some,
  find,
  findIndex,
  isEmpty,
  defaultIfEmpty,
  promiseAll,
  promiseRace
} from 'pipeljs'

// Re-export core types from pipeljs
export type { 
  Stream, 
  Observable,
  OperatorFunction,
  OnFulfilled,
  OnRejected
} from 'pipeljs'
