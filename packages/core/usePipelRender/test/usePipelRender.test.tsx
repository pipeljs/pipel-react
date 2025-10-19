import { describe, it, expect, vi } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { usePipelRender } from '../index'
import { Stream } from 'pipeljs'
import { map } from 'pipeljs'

describe('usePipelRender', () => {
  it('should render initial value', async () => {
    const stream$ = new Stream(<div>Initial</div>)
    const { result } = renderHook(() => usePipelRender(stream$))

    await waitFor(() => {
      expect(result.current?.type).toBe('div')
      expect(result.current?.props.children).toBe('Initial')
    })
  })

  it('should update when stream emits new ReactNode', async () => {
    const stream$ = new Stream(<div>First</div>)
    const { result } = renderHook(() => usePipelRender(stream$))

    await waitFor(() => {
      expect(result.current?.props.children).toBe('First')
    })

    act(() => {
      stream$.next(<div>Second</div>)
    })

    await waitFor(() => {
      expect(result.current?.props.children).toBe('Second')
    })
  })

  it('should work with map operator', async () => {
    const numberStream$ = new Stream(1)
    const renderStream$ = numberStream$.pipe(map((n: number) => <div>Count: {n}</div>))

    const { result } = renderHook(() => usePipelRender(renderStream$))

    await waitFor(() => {
      expect(result.current?.props.children).toContain('Count: 1')
    })

    act(() => {
      numberStream$.next(2)
    })

    await waitFor(() => {
      expect(result.current?.props.children).toContain('Count: 2')
    })
  })

  it('should handle string content', async () => {
    const stream$ = new Stream('Hello')
    const { result } = renderHook(() => usePipelRender(stream$))

    await waitFor(() => {
      expect(result.current).toBe('Hello')
    })
  })

  it('should handle number content', async () => {
    const stream$ = new Stream(42)
    const { result } = renderHook(() => usePipelRender(stream$))

    await waitFor(() => {
      expect(result.current).toBe(42)
    })
  })

  it('should handle null content', async () => {
    const stream$ = new Stream(null)
    const { result } = renderHook(() => usePipelRender(stream$))

    await waitFor(() => {
      expect(result.current).toBe(null)
    })
  })

  it('should handle complex JSX', async () => {
    const stream$ = new Stream(
      (
        <div className="container">
          <h1>Title</h1>
          <p>Content</p>
        </div>
      )
    )
    const { result } = renderHook(() => usePipelRender(stream$))

    await waitFor(() => {
      expect(result.current?.type).toBe('div')
      expect(result.current?.props.className).toBe('container')
      expect(result.current?.props.children).toHaveLength(2)
    })
  })

  it('should handle conditional rendering', async () => {
    const stream$ = new Stream(true)
    const renderStream$ = stream$.pipe(map((show: boolean) => (show ? <div>Visible</div> : null)))

    const { result } = renderHook(() => usePipelRender(renderStream$))

    await waitFor(() => {
      expect(result.current?.props.children).toBe('Visible')
    })

    act(() => {
      stream$.next(false)
    })

    await waitFor(() => {
      expect(result.current).toBe(null)
    })
  })

  it('should handle array of elements', async () => {
    const stream$ = new Stream([1, 2, 3])
    const renderStream$ = stream$.pipe(
      map((items: number[]) => (
        <ul>
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ))
    )

    const { result } = renderHook(() => usePipelRender(renderStream$))

    await waitFor(() => {
      expect(result.current?.type).toBe('ul')
      expect(result.current?.props.children).toHaveLength(3)
    })
  })

  it('should cleanup subscription on unmount', async () => {
    const stream$ = new Stream(<div>Test</div>)
    const unsubscribeSpy = vi.fn()

    // Mock the subscribe method
    const originalSubscribe = stream$.subscribe.bind(stream$)
    stream$.subscribe = (observer: any) => {
      const subscription = originalSubscribe(observer)
      const originalUnsubscribe = subscription.unsubscribe.bind(subscription)
      subscription.unsubscribe = () => {
        unsubscribeSpy()
        originalUnsubscribe()
      }
      return subscription
    }

    const { unmount } = renderHook(() => usePipelRender(stream$))

    unmount()

    expect(unsubscribeSpy).toHaveBeenCalled()
  })

  it('should handle rapid updates', async () => {
    const stream$ = new Stream(0)
    const { result } = renderHook(() =>
      usePipelRender(stream$.pipe(map((n: number) => <div>{n}</div>)))
    )

    // Emit multiple values rapidly
    act(() => {
      for (let i = 1; i <= 10; i++) {
        stream$.next(i)
      }
    })

    // Should eventually show the last value
    await waitFor(() => {
      expect(result.current?.props.children).toBe(10)
    })
  })

  it('should work with fragments', async () => {
    const stream$ = new Stream(
      (
        <>
          <div>First</div>
          <div>Second</div>
        </>
      )
    )
    const { result } = renderHook(() => usePipelRender(stream$))

    await waitFor(() => {
      expect(result.current).toBeTruthy()
    })
  })

  it('should handle error boundaries gracefully', async () => {
    const stream$ = new Stream(<div>Safe</div>)
    const { result } = renderHook(() => usePipelRender(stream$))

    await waitFor(() => {
      expect(result.current?.props.children).toBe('Safe')
    })

    // Emit potentially problematic content
    act(() => {
      stream$.next(undefined as any)
    })

    await waitFor(() => {
      expect(result.current).toBe(undefined)
    })
  })

  it('should support dynamic component rendering', async () => {
    const stream$ = new Stream({ type: 'success', message: 'Done' })
    const renderStream$ = stream$.pipe(
      map((state: any) => {
        if (state.type === 'success') {
          return <div className="success">{state.message}</div>
        } else if (state.type === 'error') {
          return <div className="error">{state.message}</div>
        }
        return <div>Loading...</div>
      })
    )

    const { result } = renderHook(() => usePipelRender(renderStream$))

    await waitFor(() => {
      expect(result.current?.props.className).toBe('success')
      expect(result.current?.props.children).toBe('Done')
    })

    act(() => {
      stream$.next({ type: 'error', message: 'Failed' })
    })

    await waitFor(() => {
      expect(result.current?.props.className).toBe('error')
      expect(result.current?.props.children).toBe('Failed')
    })
  })
})
