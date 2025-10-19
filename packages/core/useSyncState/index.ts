import { useState, useEffect, useRef, useCallback, Dispatch, SetStateAction } from 'react'
import { Stream } from 'pipeljs'

/**
 * 双向同步 React State 和 Stream
 *
 * @example
 * ```tsx
 * function SyncExample() {
 *   const [value, setValue, value$] = useSyncState(0)
 *
 *   // 修改 state 会同步到 stream
 *   setValue(10)
 *
 *   // 修改 stream 会同步到 state
 *   value$.next(20)
 *
 *   return <div>{value}</div>
 * }
 * ```
 */
export function useSyncState<T>(initialValue: T): [T, Dispatch<SetStateAction<T>>, Stream<T>] {
  const [state, setState] = useState<T>(initialValue)
  const stream$ = useRef<Stream<T>>(new Stream(initialValue)).current
  const isInternalUpdate = useRef(false)

  // Stream -> State
  useEffect(() => {
    const child = stream$.then((newValue: T) => {
      if (!isInternalUpdate.current) {
        setState(newValue)
      }
      isInternalUpdate.current = false
    })

    return () => {
      child.unsubscribe()
    }
  }, [stream$])

  // State -> Stream
  const syncSetState = useCallback<Dispatch<SetStateAction<T>>>(
    (action) => {
      setState((prevState) => {
        const newState =
          typeof action === 'function' ? (action as (prevState: T) => T)(prevState) : action

        isInternalUpdate.current = true
        stream$.next(newState)

        return newState
      })
    },
    [stream$]
  )

  return [state, syncSetState, stream$]
}
