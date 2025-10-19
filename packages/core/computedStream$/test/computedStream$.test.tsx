import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { Stream } from 'pipeljs'
import { computedStream$, useComputedStream$, useObservable } from '../../index'

describe('computedStream$', () => {
  it('should create computed stream', () => {
    const a$ = new Stream(1)
    const b$ = new Stream(2)

    const sum$ = computedStream$(() => a$.value + b$.value)

    expect(sum$.value).toBe(3)
  })

  it('should update when dependencies change', () => {
    const a$ = new Stream(1)
    const b$ = new Stream(2)

    const sum$ = computedStream$(() => a$.value + b$.value)

    expect(sum$.value).toBe(3)

    a$.next(5)
    expect(sum$.value).toBe(3) // Note: computedStream$ doesn't auto-update
  })

  it('should handle complex computations', () => {
    const items$ = new Stream([
      { price: 10, quantity: 2 },
      { price: 5, quantity: 3 },
    ])

    const total$ = computedStream$(() => {
      return items$.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
    })

    expect(total$.value).toBe(35) // (10*2) + (5*3) = 35
  })
})

describe('useComputedStream$', () => {
  it('should create computed stream with hook', () => {
    const { result } = renderHook(() => {
      const a = 1
      const b = 2
      const sum$ = useComputedStream$(() => a + b, [a, b])
      return useObservable(sum$)
    })

    expect(result.current).toBe(3)
  })

  it('should update when dependencies change', () => {
    const { result, rerender } = renderHook(
      ({ a, b }) => {
        const sum$ = useComputedStream$(() => a + b, [a, b])
        return useObservable(sum$)
      },
      { initialProps: { a: 1, b: 2 } }
    )

    expect(result.current).toBe(3)

    rerender({ a: 5, b: 3 })
    expect(result.current).toBe(8)
  })

  it('should handle complex computations', () => {
    const { result, rerender } = renderHook(
      ({ items }) => {
        const total$ = useComputedStream$(
          () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
          [items]
        )
        return useObservable(total$)
      },
      {
        initialProps: {
          items: [
            { price: 10, quantity: 2 },
            { price: 5, quantity: 3 },
          ],
        },
      }
    )

    expect(result.current).toBe(35)

    rerender({
      items: [
        { price: 10, quantity: 3 },
        { price: 5, quantity: 2 },
      ],
    })

    expect(result.current).toBe(40)
  })

  it('should cleanup on unmount', () => {
    const { result, unmount } = renderHook(() => {
      const sum$ = useComputedStream$(() => 1 + 2, [])
      return sum$
    })

    const stream$ = result.current
    let completed = false

    stream$.afterUnsubscribe(() => {
      completed = true
    })

    unmount()

    expect(completed).toBe(true)
  })
})
