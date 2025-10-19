import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import React from 'react'
import { fromEvent, useFromEvent, useWindowEvent, useDocumentEvent } from '../index'

describe('fromEvent', () => {
  it('should create stream from event target', async () => {
    const button = document.createElement('button')
    const stream$ = fromEvent(button, 'click')

    const events: any[] = []
    stream$.subscribe((event) => events.push(event))

    act(() => {
      button.click()
    })

    await waitFor(() => {
      expect(events).toHaveLength(1)
      expect(events[0].type).toBe('click')
    })
  })

  it('should handle multiple events', async () => {
    const input = document.createElement('input')
    const stream$ = fromEvent(input, 'input')

    const events: any[] = []
    stream$.subscribe((event) => events.push(event))

    act(() => {
      input.value = 'a'
      input.dispatchEvent(new Event('input'))
      input.value = 'ab'
      input.dispatchEvent(new Event('input'))
      input.value = 'abc'
      input.dispatchEvent(new Event('input'))
    })

    await waitFor(() => {
      expect(events).toHaveLength(3)
    })
  })

  it('should cleanup event listener on unsubscribe', () => {
    const button = document.createElement('button')
    const stream$ = fromEvent(button, 'click')

    const events: any[] = []
    const subscription = stream$.subscribe((event) => events.push(event))

    button.click()
    expect(events).toHaveLength(1)

    subscription.unsubscribe()

    button.click()
    expect(events).toHaveLength(1) // Should not increase
  })

  it('should support different event types', async () => {
    const div = document.createElement('div')

    const clickStream$ = fromEvent(div, 'click')
    const mouseoverStream$ = fromEvent(div, 'mouseover')

    const clickEvents: any[] = []
    const mouseoverEvents: any[] = []

    clickStream$.subscribe((e) => clickEvents.push(e))
    mouseoverStream$.subscribe((e) => mouseoverEvents.push(e))

    act(() => {
      div.dispatchEvent(new MouseEvent('click'))
      div.dispatchEvent(new MouseEvent('mouseover'))
    })

    await waitFor(() => {
      expect(clickEvents).toHaveLength(1)
      expect(mouseoverEvents).toHaveLength(1)
    })
  })

  it('should work with keyboard events', async () => {
    const input = document.createElement('input')
    const stream$ = fromEvent(input, 'keydown')

    const events: any[] = []
    stream$.subscribe((event) => events.push(event))

    act(() => {
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))
    })

    await waitFor(() => {
      expect(events).toHaveLength(1)
      expect(events[0].key).toBe('Enter')
    })
  })

  it('should support event options', async () => {
    const div = document.createElement('div')
    const stream$ = fromEvent(div, 'click', { capture: true })

    const events: any[] = []
    stream$.subscribe((event) => events.push(event))

    act(() => {
      div.click()
    })

    await waitFor(() => {
      expect(events).toHaveLength(1)
    })
  })
})

describe('useFromEvent', () => {
  let button: HTMLButtonElement

  beforeEach(() => {
    button = document.createElement('button')
    document.body.appendChild(button)
  })

  afterEach(() => {
    document.body.removeChild(button)
  })

  it('should create event stream in component', async () => {
    const { result } = renderHook(() => {
      const ref = React.useRef<HTMLButtonElement>(button)
      return useFromEvent(ref, 'click')
    })

    expect(result.current).toBeDefined()
  })

  it('should receive events from ref element', async () => {
    const { result } = renderHook(() => {
      const ref = React.useRef<HTMLButtonElement>(button)
      const stream$ = useFromEvent(ref, 'click')
      const [count, setCount] = React.useState(0)

      React.useEffect(() => {
        const subscription = stream$.subscribe(() => setCount((c) => c + 1))
        return () => subscription.unsubscribe()
      }, [stream$])

      return count
    })

    act(() => {
      button.click()
      button.click()
    })

    await waitFor(() => {
      expect(result.current).toBe(2)
    })
  })

  it('should cleanup on unmount', async () => {
    const clickHandler = vi.fn()

    const { unmount } = renderHook(() => {
      const ref = React.useRef<HTMLButtonElement>(button)
      const stream$ = useFromEvent(ref, 'click')

      React.useEffect(() => {
        const subscription = stream$.subscribe(clickHandler)
        return () => subscription.unsubscribe()
      }, [stream$])
    })

    act(() => {
      button.click()
    })

    await waitFor(() => {
      expect(clickHandler).toHaveBeenCalledTimes(1)
    })

    unmount()

    button.click()
    expect(clickHandler).toHaveBeenCalledTimes(1) // Should not increase
  })

  it('should handle ref changes', async () => {
    const button1 = document.createElement('button')
    const button2 = document.createElement('button')
    document.body.appendChild(button1)
    document.body.appendChild(button2)

    const { result, rerender } = renderHook(
      ({ element }) => {
        const ref = React.useRef<HTMLButtonElement>(element)
        const stream$ = useFromEvent(ref, 'click')
        const [count, setCount] = React.useState(0)

        React.useEffect(() => {
          const subscription = stream$.subscribe(() => setCount((c) => c + 1))
          return () => subscription.unsubscribe()
        }, [stream$])

        return count
      },
      { initialProps: { element: button1 } }
    )

    act(() => {
      button1.click()
    })

    await waitFor(() => {
      expect(result.current).toBe(1)
    })

    rerender({ element: button2 })

    act(() => {
      button2.click()
    })

    await waitFor(() => {
      expect(result.current).toBe(2)
    })

    document.body.removeChild(button1)
    document.body.removeChild(button2)
  })
})

describe('useWindowEvent', () => {
  it('should listen to window events', async () => {
    const { result } = renderHook(() => {
      const stream$ = useWindowEvent('resize')
      const [count, setCount] = React.useState(0)

      React.useEffect(() => {
        const subscription = stream$.subscribe(() => setCount((c) => c + 1))
        return () => subscription.unsubscribe()
      }, [stream$])

      return count
    })

    act(() => {
      window.dispatchEvent(new Event('resize'))
    })

    await waitFor(() => {
      expect(result.current).toBe(1)
    })
  })

  it('should handle scroll events', async () => {
    const { result } = renderHook(() => {
      const stream$ = useWindowEvent('scroll')
      const [scrollCount, setScrollCount] = React.useState(0)

      React.useEffect(() => {
        const subscription = stream$.subscribe(() => setScrollCount((c) => c + 1))
        return () => subscription.unsubscribe()
      }, [stream$])

      return scrollCount
    })

    act(() => {
      window.dispatchEvent(new Event('scroll'))
      window.dispatchEvent(new Event('scroll'))
    })

    await waitFor(() => {
      expect(result.current).toBe(2)
    })
  })

  it('should cleanup on unmount', async () => {
    const handler = vi.fn()

    const { unmount } = renderHook(() => {
      const stream$ = useWindowEvent('resize')

      React.useEffect(() => {
        const subscription = stream$.subscribe(handler)
        return () => subscription.unsubscribe()
      }, [stream$])
    })

    act(() => {
      window.dispatchEvent(new Event('resize'))
    })

    await waitFor(() => {
      expect(handler).toHaveBeenCalledTimes(1)
    })

    unmount()

    window.dispatchEvent(new Event('resize'))
    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('should support keyboard events', async () => {
    const { result } = renderHook(() => {
      const stream$ = useWindowEvent('keydown')
      const [keys, setKeys] = React.useState<string[]>([])

      React.useEffect(() => {
        const subscription = stream$.subscribe((e: any) => {
          setKeys((prev) => [...prev, e.key])
        })
        return () => subscription.unsubscribe()
      }, [stream$])

      return keys
    })

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }))
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'b' }))
    })

    await waitFor(() => {
      expect(result.current).toEqual(['a', 'b'])
    })
  })
})

describe('useDocumentEvent', () => {
  it('should listen to document events', async () => {
    const { result } = renderHook(() => {
      const stream$ = useDocumentEvent('click')
      const [count, setCount] = React.useState(0)

      React.useEffect(() => {
        const subscription = stream$.subscribe(() => setCount((c) => c + 1))
        return () => subscription.unsubscribe()
      }, [stream$])

      return count
    })

    act(() => {
      document.dispatchEvent(new MouseEvent('click'))
    })

    await waitFor(() => {
      expect(result.current).toBe(1)
    })
  })

  it('should handle visibility change', async () => {
    const { result } = renderHook(() => {
      const stream$ = useDocumentEvent('visibilitychange')
      const [changeCount, setChangeCount] = React.useState(0)

      React.useEffect(() => {
        const subscription = stream$.subscribe(() => setChangeCount((c) => c + 1))
        return () => subscription.unsubscribe()
      }, [stream$])

      return changeCount
    })

    act(() => {
      document.dispatchEvent(new Event('visibilitychange'))
    })

    await waitFor(() => {
      expect(result.current).toBe(1)
    })
  })

  it('should cleanup on unmount', async () => {
    const handler = vi.fn()

    const { unmount } = renderHook(() => {
      const stream$ = useDocumentEvent('click')

      React.useEffect(() => {
        const subscription = stream$.subscribe(handler)
        return () => subscription.unsubscribe()
      }, [stream$])
    })

    act(() => {
      document.dispatchEvent(new MouseEvent('click'))
    })

    await waitFor(() => {
      expect(handler).toHaveBeenCalledTimes(1)
    })

    unmount()

    document.dispatchEvent(new MouseEvent('click'))
    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('should support multiple event types', async () => {
    const { result } = renderHook(() => {
      const clickStream$ = useDocumentEvent('click')
      const keydownStream$ = useDocumentEvent('keydown')

      const [events, setEvents] = React.useState<string[]>([])

      React.useEffect(() => {
        const sub1 = clickStream$.subscribe(() => setEvents((prev) => [...prev, 'click']))
        const sub2 = keydownStream$.subscribe(() => setEvents((prev) => [...prev, 'keydown']))

        return () => {
          sub1.unsubscribe()
          sub2.unsubscribe()
        }
      }, [clickStream$, keydownStream$])

      return events
    })

    act(() => {
      document.dispatchEvent(new MouseEvent('click'))
      document.dispatchEvent(new KeyboardEvent('keydown'))
      document.dispatchEvent(new MouseEvent('click'))
    })

    await waitFor(() => {
      expect(result.current).toEqual(['click', 'keydown', 'click'])
    })
  })
})
