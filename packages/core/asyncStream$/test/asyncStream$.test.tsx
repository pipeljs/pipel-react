import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import React from 'react'
import { asyncStream$, useAsyncStream$, useAsyncStreamAuto$ } from '../index'

describe('asyncStream$', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create async stream with fetcher', () => {
    const fetcher = vi.fn(async () => 'result')
    const result = asyncStream$(fetcher)

    expect(result).toBeDefined()
    expect(result.data$).toBeDefined()
    expect(result.loading$).toBeDefined()
    expect(result.error$).toBeDefined()
    expect(typeof result.execute).toBe('function')
  })

  it('should execute fetcher when called', async () => {
    const fetcher = vi.fn(async () => 'data')
    const { data$, execute } = asyncStream$(fetcher)

    const values: any[] = []
    data$.subscribe((value) => {
      if (value !== undefined) values.push(value)
    })

    await act(async () => {
      await execute()
    })

    await waitFor(() => {
      expect(fetcher).toHaveBeenCalledTimes(1)
      expect(values).toContain('data')
    })
  })

  it('should handle async fetcher with delay', async () => {
    const fetcher = vi.fn(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50))
      return 'delayed-data'
    })

    const { data$, execute } = asyncStream$(fetcher)
    const values: any[] = []
    data$.subscribe((value) => {
      if (value !== undefined) values.push(value)
    })

    await act(async () => {
      await execute()
    })

    await waitFor(
      () => {
        expect(values).toContain('delayed-data')
      },
      { timeout: 200 }
    )
  })

  it('should handle fetcher with parameters', async () => {
    const fetcher = vi.fn(async (id: number) => `user-${id}`)
    const { data$, execute } = asyncStream$(fetcher)

    const values: any[] = []
    data$.subscribe((value) => {
      if (value !== undefined) values.push(value)
    })

    await act(async () => {
      await execute(123)
    })

    await waitFor(() => {
      expect(fetcher).toHaveBeenCalledWith(123)
      expect(values).toContain('user-123')
    })
  })

  it('should handle multiple executions', async () => {
    let counter = 0
    const fetcher = vi.fn(async () => ++counter)
    const { data$, execute } = asyncStream$(fetcher)

    const values: any[] = []
    data$.subscribe((value) => {
      if (value !== undefined) values.push(value)
    })

    await act(async () => {
      await execute()
      await execute()
      await execute()
    })

    await waitFor(() => {
      expect(fetcher).toHaveBeenCalledTimes(3)
      expect(values).toEqual([1, 2, 3])
    })
  })

  it('should handle errors in fetcher', async () => {
    const error = new Error('Fetch failed')
    const fetcher = vi.fn(async () => {
      throw error
    })

    const { error$, execute } = asyncStream$(fetcher)
    const errors: any[] = []

    error$.subscribe((err) => {
      if (err !== undefined) errors.push(err)
    })

    await act(async () => {
      await execute()
    })

    await waitFor(() => {
      expect(errors).toHaveLength(1)
      expect(errors[0]).toBe(error)
    })
  })

  it('should manage loading state', async () => {
    const fetcher = vi.fn(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50))
      return 'data'
    })

    const { loading$, execute } = asyncStream$(fetcher)
    const loadingStates: boolean[] = []

    loading$.subscribe((loading) => {
      loadingStates.push(loading)
    })

    await act(async () => {
      await execute()
    })

    await waitFor(() => {
      expect(loadingStates).toContain(false) // initial
      expect(loadingStates).toContain(true) // loading
      expect(loadingStates[loadingStates.length - 1]).toBe(false) // done
    })
  })

  it('should support object return values', async () => {
    const fetcher = vi.fn(async () => ({ id: 1, name: 'Test' }))
    const { data$, execute } = asyncStream$(fetcher)

    const values: any[] = []
    data$.subscribe((value) => {
      if (value !== undefined) values.push(value)
    })

    await act(async () => {
      await execute()
    })

    await waitFor(() => {
      expect(values[0]).toEqual({ id: 1, name: 'Test' })
    })
  })

  it('should support array return values', async () => {
    const fetcher = vi.fn(async () => [1, 2, 3, 4, 5])
    const { data$, execute } = asyncStream$(fetcher)

    const values: any[] = []
    data$.subscribe((value) => {
      if (value !== undefined) values.push(value)
    })

    await act(async () => {
      await execute()
    })

    await waitFor(() => {
      expect(values[0]).toEqual([1, 2, 3, 4, 5])
    })
  })
})

describe('useAsyncStream$', () => {
  it('should create async stream in component', () => {
    const fetcher = vi.fn(async () => 'data')

    const { result } = renderHook(() => useAsyncStream$(fetcher))

    expect(result.current).toBeDefined()
    expect(result.current.data$).toBeDefined()
    expect(result.current.loading$).toBeDefined()
    expect(result.current.error$).toBeDefined()
    expect(typeof result.current.execute).toBe('function')
  })

  it('should execute fetcher manually', async () => {
    const fetcher = vi.fn(async () => 'manual-data')

    const { result } = renderHook(() => useAsyncStream$(fetcher))

    await act(async () => {
      await result.current.execute()
    })

    await waitFor(() => {
      expect(fetcher).toHaveBeenCalledTimes(1)
    })
  })

  it('should maintain stream reference across renders', () => {
    const fetcher = vi.fn(async () => 'data')

    const { result, rerender } = renderHook(() => useAsyncStream$(fetcher))

    const firstResult = result.current

    rerender()

    const secondResult = result.current

    expect(firstResult).toBe(secondResult)
  })

  it('should work with useObservable', async () => {
    const fetcher = vi.fn(async () => 42)

    const { result } = renderHook(() => {
      const { data$, execute } = useAsyncStream$(fetcher)
      const [value, setValue] = React.useState<number | undefined>(undefined)

      React.useEffect(() => {
        const subscription = data$.subscribe((val) => setValue(val))
        return () => subscription.unsubscribe()
      }, [data$])

      return { execute, value }
    })

    await act(async () => {
      await result.current.execute()
    })

    await waitFor(() => {
      expect(result.current.value).toBe(42)
    })
  })
})

describe('useAsyncStreamAuto$', () => {
  it('should auto-execute on mount', async () => {
    const fetcher = vi.fn(async () => 'auto-data')

    renderHook(() => useAsyncStreamAuto$(fetcher))

    await waitFor(() => {
      expect(fetcher).toHaveBeenCalledTimes(1)
    })
  })

  it('should auto-execute with dependencies', async () => {
    const fetcher = vi.fn(async (id: number) => `user-${id}`)

    const { rerender } = renderHook(({ userId }) => useAsyncStreamAuto$(fetcher, [userId]), {
      initialProps: { userId: 1 },
    })

    await waitFor(() => {
      expect(fetcher).toHaveBeenCalledWith(1)
    })

    rerender({ userId: 2 })

    await waitFor(() => {
      expect(fetcher).toHaveBeenCalledWith(2)
      expect(fetcher).toHaveBeenCalledTimes(2)
    })
  })

  it('should not re-execute if dependencies unchanged', async () => {
    const fetcher = vi.fn(async () => 'data')

    const { rerender } = renderHook(() => useAsyncStreamAuto$(fetcher, []))

    await waitFor(() => {
      expect(fetcher).toHaveBeenCalledTimes(1)
    })

    rerender()
    rerender()

    // Should still be called only once
    expect(fetcher).toHaveBeenCalledTimes(1)
  })

  it('should handle multiple dependencies', async () => {
    const fetcher = vi.fn(async (a: number, b: string) => `${a}-${b}`)

    const { rerender } = renderHook(({ num, str }) => useAsyncStreamAuto$(fetcher, [num, str]), {
      initialProps: { num: 1, str: 'a' },
    })

    await waitFor(() => {
      expect(fetcher).toHaveBeenCalledWith(1, 'a')
    })

    rerender({ num: 2, str: 'a' })

    await waitFor(() => {
      expect(fetcher).toHaveBeenCalledWith(2, 'a')
    })

    rerender({ num: 2, str: 'b' })

    await waitFor(() => {
      expect(fetcher).toHaveBeenCalledWith(2, 'b')
      expect(fetcher).toHaveBeenCalledTimes(3)
    })
  })

  it('should cleanup on unmount', async () => {
    const fetcher = vi.fn(async () => 'data')

    const { unmount } = renderHook(() => useAsyncStreamAuto$(fetcher))

    await waitFor(() => {
      expect(fetcher).toHaveBeenCalledTimes(1)
    })

    unmount()

    // Should not execute after unmount
    await new Promise((resolve) => setTimeout(resolve, 100))
    expect(fetcher).toHaveBeenCalledTimes(1)
  })

  it('should support data fetching use case', async () => {
    const mockApi = vi.fn(async (userId: number) => ({
      id: userId,
      name: `User ${userId}`,
      email: `user${userId}@example.com`,
    }))

    const { result, rerender } = renderHook(
      ({ id }) => {
        const { data$ } = useAsyncStreamAuto$(mockApi, [id])
        const [user, setUser] = React.useState<any>(null)

        React.useEffect(() => {
          const subscription = data$.subscribe(setUser)
          return () => subscription.unsubscribe()
        }, [data$])

        return user
      },
      { initialProps: { id: 1 } }
    )

    await waitFor(() => {
      expect(result.current).toEqual({
        id: 1,
        name: 'User 1',
        email: 'user1@example.com',
      })
    })

    rerender({ id: 2 })

    await waitFor(() => {
      expect(result.current).toEqual({
        id: 2,
        name: 'User 2',
        email: 'user2@example.com',
      })
    })
  })
})
