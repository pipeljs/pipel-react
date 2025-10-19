import { describe, it, expect, vi } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useState, useReducer } from 'react'
import { Stream } from 'pipeljs'
import { map, scan } from 'pipeljs'
import { to$ } from '../index'

describe('to$', () => {
  it('should create stream from state', () => {
    const { result } = renderHook(() => {
      const [state] = useState(42)
      return to$(state)
    })

    expect(result.current).toBeInstanceOf(Stream)
    expect(result.current.value).toBe(42)
  })

  it('should update stream when state changes', async () => {
    const { result } = renderHook(() => {
      const [state, setState] = useState(0)
      const stream$ = to$(state)
      return { stream$, setState }
    })

    expect(result.current.stream$.value).toBe(0)

    act(() => {
      result.current.setState(1)
    })

    await waitFor(() => {
      expect(result.current.stream$.value).toBe(1)
    })

    act(() => {
      result.current.setState(2)
    })

    await waitFor(() => {
      expect(result.current.stream$.value).toBe(2)
    })
  })

  it('should maintain stream reference', () => {
    const { result, rerender } = renderHook(() => {
      const [state, setState] = useState(0)
      const stream$ = to$(state)
      return { stream$, setState }
    })

    const firstStream = result.current.stream$

    // Update state
    act(() => {
      result.current.setState(1)
    })

    // Stream reference should remain the same
    expect(result.current.stream$).toBe(firstStream)

    // Rerender
    rerender()

    // Stream reference should still be the same
    expect(result.current.stream$).toBe(firstStream)
  })

  it('should work with useState', async () => {
    const { result } = renderHook(() => {
      const [count, setCount] = useState(0)
      const count$ = to$(count)
      return { count, count$, setCount }
    })

    expect(result.current.count).toBe(0)
    expect(result.current.count$.value).toBe(0)

    act(() => {
      result.current.setCount(5)
    })

    await waitFor(() => {
      expect(result.current.count).toBe(5)
      expect(result.current.count$.value).toBe(5)
    })
  })

  it('should work with useReducer', async () => {
    const reducer = (state: number, action: { type: string }) => {
      switch (action.type) {
        case 'increment':
          return state + 1
        case 'decrement':
          return state - 1
        default:
          return state
      }
    }

    const { result } = renderHook(() => {
      const [state, dispatch] = useReducer(reducer, 0)
      const state$ = to$(state)
      return { state, state$, dispatch }
    })

    expect(result.current.state$.value).toBe(0)

    act(() => {
      result.current.dispatch({ type: 'increment' })
    })

    await waitFor(() => {
      expect(result.current.state$.value).toBe(1)
    })

    act(() => {
      result.current.dispatch({ type: 'increment' })
    })

    await waitFor(() => {
      expect(result.current.state$.value).toBe(2)
    })
  })

  it('should handle complex state types', async () => {
    interface User {
      name: string
      age: number
      hobbies: string[]
    }

    const initialUser: User = {
      name: 'John',
      age: 30,
      hobbies: ['reading'],
    }

    const { result } = renderHook(() => {
      const [user, setUser] = useState(initialUser)
      const user$ = to$(user)
      return { user$, setUser }
    })

    expect(result.current.user$.value).toEqual(initialUser)

    const updatedUser: User = {
      ...initialUser,
      age: 31,
      hobbies: ['reading', 'coding'],
    }

    act(() => {
      result.current.setUser(updatedUser)
    })

    await waitFor(() => {
      expect(result.current.user$.value).toEqual(updatedUser)
    })
  })

  it('should cleanup on unmount', async () => {
    const { result, unmount } = renderHook(() => {
      const [state, setState] = useState(0)
      const stream$ = to$(state)
      return { stream$, setState }
    })

    const stream = result.current.stream$
    const callback = vi.fn()

    const subscription = stream.then(callback)

    act(() => {
      result.current.setState(1)
    })

    await waitFor(() => {
      expect(callback).toHaveBeenCalledWith(1)
    })

    unmount()

    // Stream should still work after unmount
    act(() => {
      stream.next(2)
    })

    await waitFor(() => {
      expect(callback).toHaveBeenCalledWith(2)
    })

    subscription.unsubscribe()
  })

  it('should work with operators', async () => {
    const { result } = renderHook(() => {
      const [count, setCount] = useState(0)
      const count$ = to$(count)
      const doubled$ = count$.pipe(map((x: number) => x * 2))
      return { count$, doubled$, setCount }
    })

    expect(result.current.doubled$.value).toBe(0)

    act(() => {
      result.current.setCount(5)
    })

    await waitFor(() => {
      expect(result.current.count$.value).toBe(5)
      expect(result.current.doubled$.value).toBe(10)
    })
  })

  it('should support state history tracking', async () => {
    const { result } = renderHook(() => {
      const [count, setCount] = useState(0)
      const count$ = to$(count)
      const history$ = count$.pipe(
        scan((acc: number[], val: number) => [...acc, val], [] as number[])
      )
      return { count$, history$, setCount }
    })

    const historyCallback = vi.fn()
    const subscription = result.current.history$.then(historyCallback)

    act(() => {
      result.current.setCount(1)
    })

    await waitFor(() => {
      expect(historyCallback).toHaveBeenCalled()
    })

    act(() => {
      result.current.setCount(2)
    })

    await waitFor(() => {
      expect(historyCallback).toHaveBeenCalled()
    })

    act(() => {
      result.current.setCount(3)
    })

    await waitFor(() => {
      expect(historyCallback).toHaveBeenCalled()
    })

    subscription.unsubscribe()
  })

  it('should handle rapid state updates', async () => {
    const { result } = renderHook(() => {
      const [count, setCount] = useState(0)
      const count$ = to$(count)
      return { count$, setCount }
    })

    const callback = vi.fn()
    const subscription = result.current.count$.then(callback)

    // Rapid updates
    act(() => {
      for (let i = 1; i <= 10; i++) {
        result.current.setCount(i)
      }
    })

    await waitFor(() => {
      expect(result.current.count$.value).toBe(10)
    })

    subscription.unsubscribe()
  })

  it('should work with multiple states', async () => {
    const { result } = renderHook(() => {
      const [a, setA] = useState(1)
      const [b, setB] = useState(2)
      const a$ = to$(a)
      const b$ = to$(b)
      return { a$, b$, setA, setB }
    })

    expect(result.current.a$.value).toBe(1)
    expect(result.current.b$.value).toBe(2)

    act(() => {
      result.current.setA(10)
    })

    await waitFor(() => {
      expect(result.current.a$.value).toBe(10)
      expect(result.current.b$.value).toBe(2)
    })

    act(() => {
      result.current.setB(20)
    })

    await waitFor(() => {
      expect(result.current.a$.value).toBe(10)
      expect(result.current.b$.value).toBe(20)
    })
  })

  it('should handle null and undefined', async () => {
    const { result } = renderHook(() => {
      const [value, setValue] = useState<number | null | undefined>(null)
      const value$ = to$(value)
      return { value$, setValue }
    })

    expect(result.current.value$.value).toBe(null)

    act(() => {
      result.current.setValue(undefined)
    })

    await waitFor(() => {
      expect(result.current.value$.value).toBe(undefined)
    })

    act(() => {
      result.current.setValue(42)
    })

    await waitFor(() => {
      expect(result.current.value$.value).toBe(42)
    })
  })

  it('should work with functional setState', async () => {
    const { result } = renderHook(() => {
      const [count, setCount] = useState(0)
      const count$ = to$(count)
      return { count$, setCount }
    })

    act(() => {
      result.current.setCount((prev) => prev + 1)
    })

    await waitFor(() => {
      expect(result.current.count$.value).toBe(1)
    })

    act(() => {
      result.current.setCount((prev) => prev * 2)
    })

    await waitFor(() => {
      expect(result.current.count$.value).toBe(2)
    })
  })

  it('should support subscription callbacks', async () => {
    const { result } = renderHook(() => {
      const [count, setCount] = useState(0)
      const count$ = to$(count)
      return { count$, setCount }
    })

    const callback = vi.fn()
    const subscription = result.current.count$.then(callback)

    act(() => {
      result.current.setCount(1)
    })

    await waitFor(() => {
      expect(callback).toHaveBeenCalledWith(1)
    })

    act(() => {
      result.current.setCount(2)
    })

    await waitFor(() => {
      expect(callback).toHaveBeenCalledWith(2)
      expect(callback).toHaveBeenCalledTimes(2)
    })

    subscription.unsubscribe()
  })

  it('should work with array state', async () => {
    const { result } = renderHook(() => {
      const [items, setItems] = useState<number[]>([])
      const items$ = to$(items)
      return { items$, setItems }
    })

    expect(result.current.items$.value).toEqual([])

    act(() => {
      result.current.setItems([1, 2, 3])
    })

    await waitFor(() => {
      expect(result.current.items$.value).toEqual([1, 2, 3])
    })

    act(() => {
      result.current.setItems((prev) => [...prev, 4])
    })

    await waitFor(() => {
      expect(result.current.items$.value).toEqual([1, 2, 3, 4])
    })
  })
})
