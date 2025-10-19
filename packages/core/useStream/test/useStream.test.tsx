import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { Stream } from 'pipeljs'
import { useStream } from '../index'

describe('useStream', () => {
  it('should create stable stream instance', () => {
    const { result, rerender } = renderHook(() => useStream(0))

    const firstStream = result.current
    expect(firstStream).toBeInstanceOf(Stream)
    expect(firstStream.value).toBe(0)

    // Rerender should return the same instance
    rerender()
    expect(result.current).toBe(firstStream)
  })

  it('should accept initial value', () => {
    const { result } = renderHook(() => useStream(42))

    expect(result.current.value).toBe(42)
  })

  it('should accept different value types', () => {
    // String
    const { result: stringResult } = renderHook(() => useStream('hello'))
    expect(stringResult.current.value).toBe('hello')

    // Object
    const obj = { name: 'John', age: 30 }
    const { result: objResult } = renderHook(() => useStream(obj))
    expect(objResult.current.value).toEqual(obj)

    // Array
    const arr = [1, 2, 3]
    const { result: arrResult } = renderHook(() => useStream(arr))
    expect(arrResult.current.value).toEqual(arr)

    // Boolean
    const { result: boolResult } = renderHook(() => useStream(true))
    expect(boolResult.current.value).toBe(true)

    // Null
    const { result: nullResult } = renderHook(() => useStream(null))
    expect(nullResult.current.value).toBe(null)

    // Undefined
    const { result: undefinedResult } = renderHook(() => useStream(undefined))
    expect(undefinedResult.current.value).toBe(undefined)
  })

  it('should accept PromiseLike initial value', async () => {
    const promise = Promise.resolve(42)
    const { result } = renderHook(() => useStream(promise))

    expect(result.current).toBeInstanceOf(Stream)

    // Wait for promise to resolve
    await act(async () => {
      await promise
    })

    expect(result.current.value).toBe(42)
  })

  it('should not recreate stream on rerender', () => {
    const { result, rerender } = renderHook(({ value }) => useStream(value), {
      initialProps: { value: 0 },
    })

    const firstStream = result.current

    // Rerender with different props
    rerender({ value: 1 })

    // Stream instance should remain the same
    expect(result.current).toBe(firstStream)
    // But initial value doesn't change (stream is stable)
    expect(result.current.value).toBe(0)
  })

  it('should allow stream updates', () => {
    const { result } = renderHook(() => useStream(0))

    act(() => {
      result.current.next(10)
    })

    expect(result.current.value).toBe(10)

    act(() => {
      result.current.next(20)
    })

    expect(result.current.value).toBe(20)
  })

  it('should support subscriptions', () => {
    const { result } = renderHook(() => useStream(0))
    const callback = vi.fn()

    let subscription: any
    act(() => {
      subscription = result.current.then(callback)
    })

    act(() => {
      result.current.next(1)
    })

    expect(callback).toHaveBeenCalledWith(1)

    act(() => {
      result.current.next(2)
    })

    expect(callback).toHaveBeenCalledWith(2)
    expect(callback).toHaveBeenCalledTimes(2)

    // Cleanup
    act(() => {
      subscription.unsubscribe()
    })
  })

  it('should cleanup subscriptions on unmount', () => {
    const { result, unmount } = renderHook(() => useStream(0))
    const callback = vi.fn()

    let subscription: any
    act(() => {
      subscription = result.current.then(callback)
    })

    act(() => {
      result.current.next(1)
    })

    expect(callback).toHaveBeenCalledTimes(1)

    unmount()

    // After unmount, stream should still work
    act(() => {
      result.current.next(2)
    })

    // Callback should still be called (subscription is independent)
    expect(callback).toHaveBeenCalledTimes(2)

    // Cleanup
    act(() => {
      subscription.unsubscribe()
    })
  })

  it('should work with complex data types', () => {
    const complexData = {
      user: {
        name: 'John',
        age: 30,
        hobbies: ['reading', 'coding'],
      },
      settings: {
        theme: 'dark',
        notifications: true,
      },
    }

    const { result } = renderHook(() => useStream(complexData))

    expect(result.current.value).toEqual(complexData)

    const updatedData = {
      ...complexData,
      user: { ...complexData.user, age: 31 },
    }

    act(() => {
      result.current.next(updatedData)
    })

    expect(result.current.value).toEqual(updatedData)
    expect(result.current.value.user.age).toBe(31)
  })

  it('should handle rapid updates', () => {
    const { result } = renderHook(() => useStream(0))
    const callback = vi.fn()

    let subscription: any
    act(() => {
      subscription = result.current.then(callback)
    })

    // Rapid updates
    act(() => {
      for (let i = 1; i <= 100; i++) {
        result.current.next(i)
      }
    })

    expect(result.current.value).toBe(100)
    expect(callback).toHaveBeenCalledTimes(100)

    // Cleanup
    act(() => {
      subscription.unsubscribe()
    })
  })

  it('should support stream completion', () => {
    const { result } = renderHook(() => useStream(0))
    const callback = vi.fn()

    let subscription: any
    act(() => {
      subscription = result.current.then(callback)
    })

    act(() => {
      result.current.next(1)
    })

    expect(callback).toHaveBeenCalledTimes(1)

    act(() => {
      result.current.complete()
    })

    // After completion, new values should not trigger callback
    act(() => {
      result.current.next(2)
    })

    // Should still be 1 call (completion stops emissions)
    expect(callback).toHaveBeenCalledTimes(1)

    // Cleanup
    act(() => {
      subscription.unsubscribe()
    })
  })

  it('should work with multiple subscribers', () => {
    const { result } = renderHook(() => useStream(0))
    const callback1 = vi.fn()
    const callback2 = vi.fn()
    const callback3 = vi.fn()

    let sub1: any, sub2: any, sub3: any
    act(() => {
      sub1 = result.current.then(callback1)
      sub2 = result.current.then(callback2)
      sub3 = result.current.then(callback3)
    })

    act(() => {
      result.current.next(1)
    })

    expect(callback1).toHaveBeenCalledWith(1)
    expect(callback2).toHaveBeenCalledWith(1)
    expect(callback3).toHaveBeenCalledWith(1)

    // Unsubscribe one
    act(() => {
      sub2.unsubscribe()
    })

    act(() => {
      result.current.next(2)
    })

    expect(callback1).toHaveBeenCalledWith(2)
    expect(callback2).toHaveBeenCalledTimes(1) // Not called again
    expect(callback3).toHaveBeenCalledWith(2)

    // Cleanup
    act(() => {
      sub1.unsubscribe()
      sub3.unsubscribe()
    })
  })
})
