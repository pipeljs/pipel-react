import { describe, it, expect, vi } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { Stream } from 'pipeljs'
import { map, filter } from 'pipeljs'
import { useObservable } from '../index'

describe('useObservable', () => {
  it('should return current stream value', () => {
    const stream$ = new Stream(42)
    const { result } = renderHook(() => useObservable(stream$))

    expect(result.current).toBe(42)
  })

  it('should update when stream changes', async () => {
    const stream$ = new Stream(0)
    const { result } = renderHook(() => useObservable(stream$))

    expect(result.current).toBe(0)

    act(() => {
      stream$.next(1)
    })

    await waitFor(() => {
      expect(result.current).toBe(1)
    })

    act(() => {
      stream$.next(2)
    })

    await waitFor(() => {
      expect(result.current).toBe(2)
    })
  })

  it('should work with default value', async () => {
    const stream$ = new Stream<number | undefined>(undefined)
    const { result } = renderHook(() => useObservable(stream$, 42))

    expect(result.current).toBe(42)

    act(() => {
      stream$.next(10)
    })

    await waitFor(() => {
      expect(result.current).toBe(10)
    })
  })

  it('should handle undefined stream', () => {
    const { result } = renderHook(() => useObservable(undefined as any))

    expect(result.current).toBeUndefined()
  })

  it('should handle null stream', () => {
    const { result } = renderHook(() => useObservable(null as any))

    expect(result.current).toBeUndefined()
  })

  it('should cleanup subscription on unmount', async () => {
    const stream$ = new Stream(0)
    const callback = vi.fn()

    const { unmount } = renderHook(() => useObservable(stream$, callback))

    act(() => {
      stream$.next(1)
    })

    await waitFor(() => {
      expect(callback).toHaveBeenCalledTimes(1)
    })

    unmount()

    // After unmount, callback should not be called
    act(() => {
      stream$.next(2)
    })

    // Wait a bit to ensure callback is not called
    await new Promise((resolve) => setTimeout(resolve, 50))

    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('should work with piped streams', async () => {
    const stream$ = new Stream(1)
    const doubled$ = stream$.pipe(map((x: number) => x * 2))

    const { result } = renderHook(() => useObservable(doubled$))

    await waitFor(() => {
      expect(result.current).toBe(2)
    })

    act(() => {
      stream$.next(5)
    })

    await waitFor(() => {
      expect(result.current).toBe(10)
    })
  })

  it('should work with filter operator', async () => {
    const stream$ = new Stream(1)
    const filtered$ = stream$.pipe(filter((x: number) => x > 5))

    const { result } = renderHook(() => useObservable(filtered$))

    // Initial value doesn't pass filter
    expect(result.current).toBeUndefined()

    act(() => {
      stream$.next(3)
    })

    // Still doesn't pass filter
    await new Promise((resolve) => setTimeout(resolve, 50))
    expect(result.current).toBeUndefined()

    act(() => {
      stream$.next(10)
    })

    // Now it passes
    await waitFor(() => {
      expect(result.current).toBe(10)
    })
  })

  it('should handle rapid updates', async () => {
    const stream$ = new Stream(0)
    const { result } = renderHook(() => useObservable(stream$))

    // Rapid updates
    act(() => {
      for (let i = 1; i <= 100; i++) {
        stream$.next(i)
      }
    })

    await waitFor(() => {
      expect(result.current).toBe(100)
    })
  })

  it('should handle initial stream value', async () => {
    const stream$ = new Stream(100)
    const { result } = renderHook(() => useObservable(stream$))

    // Initial value should be available
    await waitFor(() => {
      expect(result.current).toBe(100)
    })
  })

  it('should work with different data types', async () => {
    // String
    const stringStream$ = new Stream('hello')
    const { result: stringResult } = renderHook(() => useObservable(stringStream$))
    expect(stringResult.current).toBe('hello')

    // Object
    const objStream$ = new Stream({ name: 'John' })
    const { result: objResult } = renderHook(() => useObservable(objStream$))
    expect(objResult.current).toEqual({ name: 'John' })

    // Array
    const arrStream$ = new Stream([1, 2, 3])
    const { result: arrResult } = renderHook(() => useObservable(arrStream$))
    expect(arrResult.current).toEqual([1, 2, 3])

    // Boolean
    const boolStream$ = new Stream(true)
    const { result: boolResult } = renderHook(() => useObservable(boolStream$))
    expect(boolResult.current).toBe(true)
  })

  it('should handle stream switching', async () => {
    const stream1$ = new Stream(1)
    const stream2$ = new Stream(100)

    const { result, rerender } = renderHook(({ stream }) => useObservable(stream), {
      initialProps: { stream: stream1$ },
    })

    expect(result.current).toBe(1)

    // Switch to stream2
    rerender({ stream: stream2$ })

    await waitFor(() => {
      expect(result.current).toBe(100)
    })

    // Update stream2
    act(() => {
      stream2$.next(200)
    })

    await waitFor(() => {
      expect(result.current).toBe(200)
    })

    // Update stream1 (should not affect result)
    act(() => {
      stream1$.next(2)
    })

    await new Promise((resolve) => setTimeout(resolve, 50))
    expect(result.current).toBe(200)
  })

  it('should handle complex transformations', async () => {
    const stream$ = new Stream(1)
    const transformed$ = stream$.pipe(
      map((x: number) => x * 2),
      map((x: number) => x + 10),
      map((x: number) => `Value: ${x}`)
    )

    const { result } = renderHook(() => useObservable(transformed$))

    await waitFor(() => {
      expect(result.current).toBe('Value: 12') // (1 * 2) + 10 = 12
    })

    act(() => {
      stream$.next(5)
    })

    await waitFor(() => {
      expect(result.current).toBe('Value: 20') // (5 * 2) + 10 = 20
    })
  })

  it('should work with async operations', async () => {
    const stream$ = new Stream(1)
    const asyncStream$ = stream$.pipe(
      map(async (x: number) => {
        await new Promise((resolve) => setTimeout(resolve, 10))
        return x * 2
      })
    )

    const { result } = renderHook(() => useObservable(asyncStream$))

    // Initial value is a promise
    expect(result.current).toBeInstanceOf(Promise)

    act(() => {
      stream$.next(5)
    })

    await waitFor(() => {
      expect(result.current).toBeInstanceOf(Promise)
    })
  })

  it('should handle observable updates correctly', async () => {
    const stream$ = new Stream(0)
    const { result } = renderHook(() => useObservable(stream$))

    await waitFor(() => {
      expect(result.current).toBe(0)
    })

    act(() => {
      stream$.next(1)
    })

    await waitFor(() => {
      expect(result.current).toBe(1)
    })

    act(() => {
      stream$.next(2)
    })

    await waitFor(() => {
      expect(result.current).toBe(2)
    })
  })

  it('should handle errors gracefully', async () => {
    const stream$ = new Stream(1)
    const errorStream$ = stream$.pipe(
      map((x: number) => {
        if (x > 5) throw new Error('Too large')
        return x * 2
      })
    )

    const { result } = renderHook(() => useObservable(errorStream$))

    await waitFor(() => {
      expect(result.current).toBe(2)
    })

    // This should trigger an error
    act(() => {
      stream$.next(10)
    })

    // The stream should handle the error (implementation dependent)
    await new Promise((resolve) => setTimeout(resolve, 50))
  })

  it('should work with multiple components', async () => {
    const stream$ = new Stream(0)

    const { result: result1 } = renderHook(() => useObservable(stream$))
    const { result: result2 } = renderHook(() => useObservable(stream$))
    const { result: result3 } = renderHook(() => useObservable(stream$))

    expect(result1.current).toBe(0)
    expect(result2.current).toBe(0)
    expect(result3.current).toBe(0)

    act(() => {
      stream$.next(42)
    })

    await waitFor(() => {
      expect(result1.current).toBe(42)
      expect(result2.current).toBe(42)
      expect(result3.current).toBe(42)
    })
  })
})
