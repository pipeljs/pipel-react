import { renderHook, act } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { usePipel, $ } from '../../usePipel'
import { Stream } from 'pipeljs'

describe('usePipel', () => {
  it('should create a stream with initial value', () => {
    const { result } = renderHook(() => usePipel(0))
    const [value, stream$] = result.current

    expect(value).toBe(0)
    expect(stream$).toBeInstanceOf(Stream)
  })

  it('should update value when stream changes', async () => {
    const { result } = renderHook(() => usePipel(0))
    const [, stream$] = result.current

    act(() => {
      stream$.next(1)
    })

    // Wait for state update
    await new Promise((resolve) => setTimeout(resolve, 10))

    const [value] = result.current
    expect(value).toBe(1)
  })

  it('should work with existing stream', () => {
    const stream$ = $(10)
    const { result } = renderHook(() => usePipel(stream$))
    const [value] = result.current

    expect(value).toBe(10)
  })

  it('should cleanup subscription on unmount', () => {
    const stream$ = $(0)
    const { unmount } = renderHook(() => usePipel(stream$))

    unmount()

    // Stream should still work after unmount
    stream$.next(1)
    expect(stream$.value).toBe(1)
  })
})
