import { describe, it, expect } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import React from 'react'
import { batch$, createStreams, batchWithFactory, combineStreams } from '../index'
import { Stream } from 'pipeljs'

describe('batch$', () => {
  it('should create batch stream from multiple streams', async () => {
    const stream1$ = new Stream(1)
    const stream2$ = new Stream(2)
    const stream3$ = new Stream(3)

    const batched$ = batch$([stream1$, stream2$, stream3$])

    const values: any[] = []
    batched$.subscribe((value) => values.push(value))

    await waitFor(() => {
      expect(values[0]).toEqual([1, 2, 3])
    })
  })

  it('should update when any source stream changes', async () => {
    const stream1$ = new Stream(1)
    const stream2$ = new Stream(2)

    const batched$ = batch$([stream1$, stream2$])

    const values: any[] = []
    batched$.subscribe((value) => values.push(value))

    act(() => {
      stream1$.next(10)
    })

    await waitFor(() => {
      expect(values).toContainEqual([10, 2])
    })

    act(() => {
      stream2$.next(20)
    })

    await waitFor(() => {
      expect(values).toContainEqual([10, 20])
    })
  })

  it('should handle empty array', () => {
    const batched$ = batch$([])

    const values: any[] = []
    batched$.subscribe((value) => values.push(value))

    expect(values).toHaveLength(0)
  })

  it('should handle single stream', async () => {
    const stream$ = new Stream(42)
    const batched$ = batch$([stream$])

    const values: any[] = []
    batched$.subscribe((value) => values.push(value))

    await waitFor(() => {
      expect(values[0]).toEqual([42])
    })
  })

  it('should handle different data types', async () => {
    const numberStream$ = new Stream(1)
    const stringStream$ = new Stream('hello')
    const boolStream$ = new Stream(true)

    const batched$ = batch$([numberStream$, stringStream$, boolStream$])

    const values: any[] = []
    batched$.subscribe((value) => values.push(value))

    await waitFor(() => {
      expect(values[0]).toEqual([1, 'hello', true])
    })
  })

  it('should handle rapid updates', async () => {
    const stream1$ = new Stream(0)
    const stream2$ = new Stream(0)

    const batched$ = batch$([stream1$, stream2$])

    const values: any[] = []
    batched$.subscribe((value) => values.push(value))

    act(() => {
      for (let i = 1; i <= 5; i++) {
        stream1$.next(i)
        stream2$.next(i * 10)
      }
    })

    await waitFor(() => {
      expect(values.length).toBeGreaterThan(0)
      expect(values[values.length - 1]).toEqual([5, 50])
    })
  })

  it('should work with object streams', async () => {
    const userStream$ = new Stream({ name: 'John', age: 30 })
    const settingsStream$ = new Stream({ theme: 'dark', lang: 'en' })

    const batched$ = batch$([userStream$, settingsStream$])

    const values: any[] = []
    batched$.subscribe((value) => values.push(value))

    await waitFor(() => {
      expect(values[0]).toEqual([
        { name: 'John', age: 30 },
        { theme: 'dark', lang: 'en' },
      ])
    })
  })
})

describe('createStreams', () => {
  it('should create multiple streams', () => {
    const streams = createStreams(3, 0)

    expect(streams).toHaveLength(3)
    expect(streams[0].value).toBe(0)
    expect(streams[1].value).toBe(0)
    expect(streams[2].value).toBe(0)
  })

  it('should create streams with different initial values', () => {
    const streams = createStreams(3, (index) => index * 10)

    expect(streams).toHaveLength(3)
    expect(streams[0].value).toBe(0)
    expect(streams[1].value).toBe(10)
    expect(streams[2].value).toBe(20)
  })

  it('should create streams with object initial values', () => {
    const streams = createStreams(2, (index) => ({ id: index, name: `Item ${index}` }))

    expect(streams).toHaveLength(2)
    expect(streams[0].value).toEqual({ id: 0, name: 'Item 0' })
    expect(streams[1].value).toEqual({ id: 1, name: 'Item 1' })
  })

  it('should handle zero count', () => {
    const streams = createStreams(0, 0)

    expect(streams).toHaveLength(0)
  })

  it('should create independent streams', async () => {
    const streams = createStreams(2, 0)

    act(() => {
      streams[0].next(100)
    })

    await waitFor(() => {
      expect(streams[0].value).toBe(100)
      expect(streams[1].value).toBe(0)
    })
  })
})

describe('batchWithFactory', () => {
  it('should create batch with factory function', async () => {
    const batched$ = batchWithFactory(3, (index) => new Stream(index))

    const values: any[] = []
    batched$.subscribe((value) => values.push(value))

    await waitFor(() => {
      expect(values[0]).toEqual([0, 1, 2])
    })
  })

  it('should support custom stream creation', async () => {
    const batched$ = batchWithFactory(2, (index) => new Stream(`stream-${index}`))

    const values: any[] = []
    batched$.subscribe((value) => values.push(value))

    await waitFor(() => {
      expect(values[0]).toEqual(['stream-0', 'stream-1'])
    })
  })

  it('should handle updates to factory-created streams', async () => {
    const streams: Stream<number>[] = []
    const batched$ = batchWithFactory(2, (index) => {
      const stream = new Stream(index)
      streams.push(stream)
      return stream
    })

    const values: any[] = []
    batched$.subscribe((value) => values.push(value))

    await waitFor(() => {
      expect(values[0]).toEqual([0, 1])
    })

    act(() => {
      streams[0].next(100)
    })

    await waitFor(() => {
      expect(values).toContainEqual([100, 1])
    })
  })
})

describe('combineStreams', () => {
  it('should combine streams with custom combiner', async () => {
    const stream1$ = new Stream(10)
    const stream2$ = new Stream(20)

    const combined$ = combineStreams([stream1$, stream2$], (values) =>
      values.reduce((a, b) => a + b, 0)
    )

    const values: any[] = []
    combined$.subscribe((value) => values.push(value))

    await waitFor(() => {
      expect(values[0]).toBe(30)
    })
  })

  it('should update when source streams change', async () => {
    const stream1$ = new Stream(5)
    const stream2$ = new Stream(10)

    const combined$ = combineStreams([stream1$, stream2$], ([a, b]) => a * b)

    const values: any[] = []
    combined$.subscribe((value) => values.push(value))

    await waitFor(() => {
      expect(values[0]).toBe(50)
    })

    act(() => {
      stream1$.next(3)
    })

    await waitFor(() => {
      expect(values).toContain(30)
    })
  })

  it('should support object combination', async () => {
    const nameStream$ = new Stream('John')
    const ageStream$ = new Stream(30)

    const combined$ = combineStreams([nameStream$, ageStream$], ([name, age]) => ({ name, age }))

    const values: any[] = []
    combined$.subscribe((value) => values.push(value))

    await waitFor(() => {
      expect(values[0]).toEqual({ name: 'John', age: 30 })
    })
  })

  it('should support string concatenation', async () => {
    const firstStream$ = new Stream('Hello')
    const secondStream$ = new Stream('World')

    const combined$ = combineStreams(
      [firstStream$, secondStream$],
      ([first, second]) => `${first} ${second}`
    )

    const values: any[] = []
    combined$.subscribe((value) => values.push(value))

    await waitFor(() => {
      expect(values[0]).toBe('Hello World')
    })
  })

  it('should support array operations', async () => {
    const stream1$ = new Stream([1, 2])
    const stream2$ = new Stream([3, 4])

    const combined$ = combineStreams([stream1$, stream2$], ([arr1, arr2]) => [...arr1, ...arr2])

    const values: any[] = []
    combined$.subscribe((value) => values.push(value))

    await waitFor(() => {
      expect(values[0]).toEqual([1, 2, 3, 4])
    })
  })

  it('should handle complex calculations', async () => {
    const priceStream$ = new Stream(100)
    const quantityStream$ = new Stream(3)
    const taxRateStream$ = new Stream(0.1)

    const totalStream$ = combineStreams(
      [priceStream$, quantityStream$, taxRateStream$],
      ([price, quantity, taxRate]) => {
        const subtotal = price * quantity
        const tax = subtotal * taxRate
        return subtotal + tax
      }
    )

    const values: any[] = []
    totalStream$.subscribe((value) => values.push(value))

    await waitFor(() => {
      expect(values[0]).toBe(330) // (100 * 3) * 1.1
    })
  })

  it('should support form field combination', async () => {
    const emailStream$ = new Stream('user@example.com')
    const passwordStream$ = new Stream('password123')
    const rememberStream$ = new Stream(true)

    const formStream$ = combineStreams(
      [emailStream$, passwordStream$, rememberStream$],
      ([email, password, remember]) => ({
        email,
        password,
        remember,
        isValid: email.includes('@') && password.length >= 8,
      })
    )

    const values: any[] = []
    formStream$.subscribe((value) => values.push(value))

    await waitFor(() => {
      expect(values[0]).toEqual({
        email: 'user@example.com',
        password: 'password123',
        remember: true,
        isValid: true,
      })
    })
  })

  it('should work with React hooks', async () => {
    const stream1$ = new Stream(1)
    const stream2$ = new Stream(2)

    const { result } = renderHook(() => {
      const combined$ = combineStreams([stream1$, stream2$], ([a, b]) => a + b)

      const [value, setValue] = React.useState(0)

      React.useEffect(() => {
        const subscription = combined$.subscribe(setValue)
        return () => subscription.unsubscribe()
      }, [combined$])

      return value
    })

    await waitFor(() => {
      expect(result.current).toBe(3)
    })

    act(() => {
      stream1$.next(10)
    })

    await waitFor(() => {
      expect(result.current).toBe(12)
    })
  })
})
