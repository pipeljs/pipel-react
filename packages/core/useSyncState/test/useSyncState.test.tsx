import { describe, it, expect, vi } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useSyncState } from '../index'

describe('useSyncState', () => {
  it('should sync state to stream', async () => {
    const { result } = renderHook(() => useSyncState(0))
    const [state, setState, stream$] = result.current

    expect(state).toBe(0)
    expect(stream$.value).toBe(0)

    act(() => {
      setState(5)
    })

    await waitFor(() => {
      expect(result.current[0]).toBe(5)
      expect(result.current[2].value).toBe(5)
    })
  })

  it('should sync stream to state', async () => {
    const { result } = renderHook(() => useSyncState(0))
    const [, , stream$] = result.current

    act(() => {
      stream$.next(10)
    })

    await waitFor(() => {
      expect(result.current[0]).toBe(10)
      expect(result.current[2].value).toBe(10)
    })
  })

  it('should prevent circular updates', async () => {
    const { result } = renderHook(() => useSyncState(0))
    const [, setState, stream$] = result.current

    const callback = vi.fn()
    const subscription = stream$.then(callback)

    // Update via setState
    act(() => {
      setState(5)
    })

    await waitFor(() => {
      expect(result.current[0]).toBe(5)
    })

    // Should only trigger one stream update
    expect(callback).toHaveBeenCalledTimes(1)
    expect(callback).toHaveBeenCalledWith(5)

    subscription.unsubscribe()
  })

  it('should work with setState function form', async () => {
    const { result } = renderHook(() => useSyncState(0))
    const [, setState] = result.current

    act(() => {
      setState((prev) => prev + 1)
    })

    await waitFor(() => {
      expect(result.current[0]).toBe(1)
      expect(result.current[2].value).toBe(1)
    })

    act(() => {
      setState((prev) => prev * 2)
    })

    await waitFor(() => {
      expect(result.current[0]).toBe(2)
      expect(result.current[2].value).toBe(2)
    })
  })

  it('should handle rapid updates', async () => {
    const { result } = renderHook(() => useSyncState(0))
    const [, setState] = result.current

    // Rapid setState updates
    act(() => {
      for (let i = 1; i <= 10; i++) {
        setState(i)
      }
    })

    await waitFor(() => {
      expect(result.current[0]).toBe(10)
      expect(result.current[2].value).toBe(10)
    })
  })

  it('should cleanup on unmount', async () => {
    const { result, unmount } = renderHook(() => useSyncState(0))
    const [, , stream$] = result.current

    const callback = vi.fn()
    const subscription = stream$.then(callback)

    act(() => {
      stream$.next(5)
    })

    await waitFor(() => {
      expect(callback).toHaveBeenCalledWith(5)
    })

    unmount()

    // After unmount, stream should still work
    act(() => {
      stream$.next(10)
    })

    await waitFor(() => {
      expect(callback).toHaveBeenCalledWith(10)
    })

    subscription.unsubscribe()
  })

  it('should work with complex data types', async () => {
    interface User {
      name: string
      age: number
    }

    const initialUser: User = { name: 'John', age: 30 }
    const { result } = renderHook(() => useSyncState(initialUser))
    const [, setState] = result.current

    expect(result.current[0]).toEqual(initialUser)
    expect(result.current[2].value).toEqual(initialUser)

    const updatedUser: User = { name: 'Jane', age: 25 }

    act(() => {
      setState(updatedUser)
    })

    await waitFor(() => {
      expect(result.current[0]).toEqual(updatedUser)
      expect(result.current[2].value).toEqual(updatedUser)
    })
  })

  it('should maintain reference stability', () => {
    const { result, rerender } = renderHook(() => useSyncState(0))

    const [, firstSetState, firstStream$] = result.current

    rerender()

    const [, secondSetState, secondStream$] = result.current

    // setState and stream$ should maintain reference
    expect(secondSetState).toBe(firstSetState)
    expect(secondStream$).toBe(firstStream$)
  })

  it('should handle bidirectional updates', async () => {
    const { result } = renderHook(() => useSyncState(0))
    const [, setState, stream$] = result.current

    // Update via setState
    act(() => {
      setState(5)
    })

    await waitFor(() => {
      expect(result.current[0]).toBe(5)
      expect(result.current[2].value).toBe(5)
    })

    // Update via stream
    act(() => {
      stream$.next(10)
    })

    await waitFor(() => {
      expect(result.current[0]).toBe(10)
      expect(result.current[2].value).toBe(10)
    })

    // Update via setState again
    act(() => {
      setState(15)
    })

    await waitFor(() => {
      expect(result.current[0]).toBe(15)
      expect(result.current[2].value).toBe(15)
    })
  })

  it('should work with multiple instances', async () => {
    const { result: result1 } = renderHook(() => useSyncState(0))
    const { result: result2 } = renderHook(() => useSyncState(100))

    const [, setState1] = result1.current
    const [, setState2] = result2.current

    act(() => {
      setState1(5)
    })

    await waitFor(() => {
      expect(result1.current[0]).toBe(5)
      expect(result2.current[0]).toBe(100) // Should not affect result2
    })

    act(() => {
      setState2(200)
    })

    await waitFor(() => {
      expect(result1.current[0]).toBe(5) // Should not affect result1
      expect(result2.current[0]).toBe(200)
    })
  })

  it('should handle null and undefined', async () => {
    const { result } = renderHook(() => useSyncState<number | null | undefined>(null))
    const [, setState] = result.current

    expect(result.current[0]).toBe(null)
    expect(result.current[2].value).toBe(null)

    act(() => {
      setState(undefined)
    })

    await waitFor(() => {
      expect(result.current[0]).toBe(undefined)
      expect(result.current[2].value).toBe(undefined)
    })

    act(() => {
      setState(42)
    })

    await waitFor(() => {
      expect(result.current[0]).toBe(42)
      expect(result.current[2].value).toBe(42)
    })
  })

  it('should work with array state', async () => {
    const { result } = renderHook(() => useSyncState<number[]>([]))
    const [, setState, stream$] = result.current

    act(() => {
      setState([1, 2, 3])
    })

    await waitFor(() => {
      expect(result.current[0]).toEqual([1, 2, 3])
      expect(result.current[2].value).toEqual([1, 2, 3])
    })

    act(() => {
      stream$.next([4, 5, 6])
    })

    await waitFor(() => {
      expect(result.current[0]).toEqual([4, 5, 6])
      expect(result.current[2].value).toEqual([4, 5, 6])
    })
  })

  it('should support stream subscriptions', async () => {
    const { result } = renderHook(() => useSyncState(0))
    const [, setState, stream$] = result.current

    const callback = vi.fn()
    const subscription = stream$.then(callback)

    act(() => {
      setState(1)
    })

    await waitFor(() => {
      expect(callback).toHaveBeenCalledWith(1)
    })

    act(() => {
      setState(2)
    })

    await waitFor(() => {
      expect(callback).toHaveBeenCalledWith(2)
      expect(callback).toHaveBeenCalledTimes(2)
    })

    subscription.unsubscribe()
  })

  it('should handle concurrent state and stream updates', async () => {
    const { result } = renderHook(() => useSyncState(0))
    const [, setState, stream$] = result.current

    // Update both at the same time
    act(() => {
      setState(5)
      stream$.next(10)
    })

    await waitFor(() => {
      // Last update should win
      expect(result.current[0]).toBe(10)
      expect(result.current[2].value).toBe(10)
    })
  })

  it('should work with boolean state', async () => {
    const { result } = renderHook(() => useSyncState(false))
    const [, setState, stream$] = result.current

    act(() => {
      setState(true)
    })

    await waitFor(() => {
      expect(result.current[0]).toBe(true)
      expect(result.current[2].value).toBe(true)
    })

    act(() => {
      stream$.next(false)
    })

    await waitFor(() => {
      expect(result.current[0]).toBe(false)
      expect(result.current[2].value).toBe(false)
    })
  })

  it('should work with string state', async () => {
    const { result } = renderHook(() => useSyncState(''))
    const [, setState, stream$] = result.current

    act(() => {
      setState('hello')
    })

    await waitFor(() => {
      expect(result.current[0]).toBe('hello')
      expect(result.current[2].value).toBe('hello')
    })

    act(() => {
      stream$.next('world')
    })

    await waitFor(() => {
      expect(result.current[0]).toBe('world')
      expect(result.current[2].value).toBe('world')
    })
  })

  it('should handle form input scenario', async () => {
    const { result } = renderHook(() => useSyncState(''))
    const [, setValue, value$] = result.current

    const callback = vi.fn()
    const subscription = value$.then(callback)

    // Simulate typing
    act(() => {
      setValue('h')
    })

    await waitFor(() => {
      expect(result.current[0]).toBe('h')
    })

    act(() => {
      setValue('he')
    })

    await waitFor(() => {
      expect(result.current[0]).toBe('he')
    })

    act(() => {
      setValue('hel')
    })

    await waitFor(() => {
      expect(result.current[0]).toBe('hel')
    })

    act(() => {
      setValue('hell')
    })

    await waitFor(() => {
      expect(result.current[0]).toBe('hell')
    })

    act(() => {
      setValue('hello')
    })

    await waitFor(() => {
      expect(result.current[0]).toBe('hello')
      expect(callback).toHaveBeenCalledTimes(5)
    })

    subscription.unsubscribe()
  })
})
