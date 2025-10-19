import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { Stream } from 'pipeljs'
import { effect$ } from '../index'

describe('effect$', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should execute callback on stream update', async () => {
    const stream$ = new Stream(0)
    const callback = vi.fn()

    renderHook(() => {
      effect$(stream$, callback)
    })

    act(() => {
      stream$.next(1)
    })

    await waitFor(() => {
      expect(callback).toHaveBeenCalledWith(1)
    })
  })

  it('should call cleanup function', async () => {
    const stream$ = new Stream(0)
    const cleanup = vi.fn()
    const callback = vi.fn(() => cleanup)

    renderHook(() => {
      effect$(stream$, callback)
    })

    act(() => {
      stream$.next(1)
    })

    await waitFor(() => {
      expect(callback).toHaveBeenCalledWith(1)
    })

    // Next update should call cleanup first
    act(() => {
      stream$.next(2)
    })

    await waitFor(() => {
      expect(cleanup).toHaveBeenCalled()
      expect(callback).toHaveBeenCalledWith(2)
    })
  })

  it('should cleanup on unmount', async () => {
    const stream$ = new Stream(0)
    const cleanup = vi.fn()
    const callback = vi.fn(() => cleanup)

    const { unmount } = renderHook(() => {
      effect$(stream$, callback)
    })

    act(() => {
      stream$.next(1)
    })

    await waitFor(() => {
      expect(callback).toHaveBeenCalledWith(1)
    })

    unmount()

    await waitFor(() => {
      expect(cleanup).toHaveBeenCalled()
    })

    // After unmount, callback should not be called
    act(() => {
      stream$.next(2)
    })

    await new Promise((resolve) => setTimeout(resolve, 50))
    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('should handle async callbacks', async () => {
    const stream$ = new Stream(0)
    const callback = vi.fn(async (value: number) => {
      await new Promise((resolve) => setTimeout(resolve, 10))
      return value * 2
    })

    renderHook(() => {
      effect$(stream$, callback)
    })

    act(() => {
      stream$.next(5)
    })

    await waitFor(() => {
      expect(callback).toHaveBeenCalledWith(5)
    })
  })

  it('should execute cleanup before next callback', async () => {
    const stream$ = new Stream(0)
    const order: string[] = []

    const callback = vi.fn((value: number) => {
      order.push(`callback-${value}`)
      return () => {
        order.push(`cleanup-${value}`)
      }
    })

    renderHook(() => {
      effect$(stream$, callback)
    })

    act(() => {
      stream$.next(1)
    })

    await waitFor(() => {
      expect(order).toEqual(['callback-1'])
    })

    act(() => {
      stream$.next(2)
    })

    await waitFor(() => {
      expect(order).toEqual(['callback-1', 'cleanup-1', 'callback-2'])
    })

    act(() => {
      stream$.next(3)
    })

    await waitFor(() => {
      expect(order).toEqual(['callback-1', 'cleanup-1', 'callback-2', 'cleanup-2', 'callback-3'])
    })
  })

  it('should handle errors in callback', async () => {
    const stream$ = new Stream(0)
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    const callback = vi.fn((value: number) => {
      if (value > 5) {
        throw new Error('Value too large')
      }
    })

    renderHook(() => {
      effect$(stream$, callback)
    })

    act(() => {
      stream$.next(3)
    })

    await waitFor(() => {
      expect(callback).toHaveBeenCalledWith(3)
    })

    // This should trigger an error
    act(() => {
      stream$.next(10)
    })

    await waitFor(() => {
      expect(callback).toHaveBeenCalledWith(10)
    })

    consoleError.mockRestore()
  })

  it('should work with multiple effects', async () => {
    const stream$ = new Stream(0)
    const callback1 = vi.fn()
    const callback2 = vi.fn()
    const callback3 = vi.fn()

    renderHook(() => {
      effect$(stream$, callback1)
      effect$(stream$, callback2)
      effect$(stream$, callback3)
    })

    act(() => {
      stream$.next(1)
    })

    await waitFor(() => {
      expect(callback1).toHaveBeenCalledWith(1)
      expect(callback2).toHaveBeenCalledWith(1)
      expect(callback3).toHaveBeenCalledWith(1)
    })
  })

  it('should support localStorage sync', async () => {
    const stream$ = new Stream('initial')
    const key = 'test-key'

    renderHook(() => {
      effect$(stream$, (value: string) => {
        localStorage.setItem(key, value)
      })
    })

    act(() => {
      stream$.next('updated')
    })

    await waitFor(() => {
      expect(localStorage.getItem(key)).toBe('updated')
    })

    // Cleanup
    localStorage.removeItem(key)
  })

  it('should support interval cleanup', async () => {
    const stream$ = new Stream(0)
    const intervalCallback = vi.fn()

    const { unmount } = renderHook(() => {
      effect$(stream$, (value: number) => {
        const interval = setInterval(() => {
          intervalCallback(value)
        }, 10)

        return () => clearInterval(interval)
      })
    })

    act(() => {
      stream$.next(1)
    })

    await new Promise((resolve) => setTimeout(resolve, 50))

    expect(intervalCallback).toHaveBeenCalled()
    const callCount = intervalCallback.mock.calls.length

    // Update stream (should clear previous interval)
    act(() => {
      stream$.next(2)
    })

    await new Promise((resolve) => setTimeout(resolve, 50))

    // Should have been called more times
    expect(intervalCallback.mock.calls.length).toBeGreaterThan(callCount)

    unmount()

    const finalCount = intervalCallback.mock.calls.length

    // After unmount, should not be called anymore
    await new Promise((resolve) => setTimeout(resolve, 50))
    expect(intervalCallback.mock.calls.length).toBe(finalCount)
  })

  it('should support event listener cleanup', async () => {
    const stream$ = new Stream(false)
    const clickHandler = vi.fn()

    const { unmount } = renderHook(() => {
      effect$(stream$, (enabled: boolean) => {
        if (enabled) {
          document.addEventListener('click', clickHandler)
          return () => document.removeEventListener('click', clickHandler)
        }
      })
    })

    // Enable
    act(() => {
      stream$.next(true)
    })

    await waitFor(() => {
      // Trigger click
      document.dispatchEvent(new MouseEvent('click'))
    })

    expect(clickHandler).toHaveBeenCalled()

    // Disable (should cleanup)
    act(() => {
      stream$.next(false)
    })

    await waitFor(() => {
      clickHandler.mockClear()
      document.dispatchEvent(new MouseEvent('click'))
    })

    expect(clickHandler).not.toHaveBeenCalled()

    unmount()
  })

  it('should handle rapid updates with cleanup', async () => {
    const stream$ = new Stream(0)
    const cleanups: number[] = []

    const callback = vi.fn((value: number) => {
      return () => {
        cleanups.push(value)
      }
    })

    renderHook(() => {
      effect$(stream$, callback)
    })

    // Rapid updates
    act(() => {
      for (let i = 1; i <= 5; i++) {
        stream$.next(i)
      }
    })

    await waitFor(() => {
      expect(callback).toHaveBeenCalledTimes(5)
    })

    // Should have cleaned up 1, 2, 3, 4 (not 5 yet)
    expect(cleanups).toEqual([1, 2, 3, 4])
  })

  it('should work with different data types', async () => {
    // String
    const stringStream$ = new Stream('hello')
    const stringCallback = vi.fn()

    renderHook(() => {
      effect$(stringStream$, stringCallback)
    })

    act(() => {
      stringStream$.next('world')
    })

    await waitFor(() => {
      expect(stringCallback).toHaveBeenCalledWith('world')
    })

    // Object
    const objStream$ = new Stream({ count: 0 })
    const objCallback = vi.fn()

    renderHook(() => {
      effect$(objStream$, objCallback)
    })

    act(() => {
      objStream$.next({ count: 1 })
    })

    await waitFor(() => {
      expect(objCallback).toHaveBeenCalledWith({ count: 1 })
    })
  })

  it('should support API calls', async () => {
    const userIdStream$ = new Stream(1)
    const fetchUser = vi.fn(async (id: number) => {
      return { id, name: `User ${id}` }
    })

    renderHook(() => {
      effect$(userIdStream$, async (userId: number) => {
        await fetchUser(userId)
      })
    })

    act(() => {
      userIdStream$.next(2)
    })

    await waitFor(() => {
      expect(fetchUser).toHaveBeenCalledWith(2)
    })

    act(() => {
      userIdStream$.next(3)
    })

    await waitFor(() => {
      expect(fetchUser).toHaveBeenCalledWith(3)
      expect(fetchUser).toHaveBeenCalledTimes(2)
    })
  })

  it('should handle callback without cleanup', async () => {
    const stream$ = new Stream(0)
    const callback = vi.fn((value: number) => {
      // No cleanup function returned
      console.log(value)
    })

    renderHook(() => {
      effect$(stream$, callback)
    })

    act(() => {
      stream$.next(1)
    })

    await waitFor(() => {
      expect(callback).toHaveBeenCalledWith(1)
    })

    act(() => {
      stream$.next(2)
    })

    await waitFor(() => {
      expect(callback).toHaveBeenCalledWith(2)
    })
  })

  it('should work with stream switching', async () => {
    const stream1$ = new Stream(1)
    const stream2$ = new Stream(100)
    const callback = vi.fn()

    const { rerender } = renderHook(
      ({ stream }) => {
        effect$(stream, callback)
      },
      { initialProps: { stream: stream1$ } }
    )

    act(() => {
      stream1$.next(2)
    })

    await waitFor(() => {
      expect(callback).toHaveBeenCalledWith(2)
    })

    // Switch to stream2
    rerender({ stream: stream2$ })

    act(() => {
      stream2$.next(200)
    })

    await waitFor(() => {
      expect(callback).toHaveBeenCalledWith(200)
    })

    // stream1 updates should not trigger callback
    callback.mockClear()
    act(() => {
      stream1$.next(3)
    })

    await new Promise((resolve) => setTimeout(resolve, 50))
    expect(callback).not.toHaveBeenCalled()
  })
})
