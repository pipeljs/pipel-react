import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import React from 'react'
import { persistStream$ } from '../index'

describe('persistStream$', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('should create stream with initial value', () => {
    const stream$ = persistStream$('test-key', 0)
    expect(stream$.value).toBe(0)
  })

  it('should persist value to localStorage', async () => {
    const stream$ = persistStream$('test-persist', 42)

    act(() => {
      stream$.next(100)
    })

    await waitFor(() => {
      const stored = localStorage.getItem('test-persist')
      expect(stored).toBe('100')
    })
  })

  it('should restore value from localStorage', () => {
    localStorage.setItem('test-restore', '999')

    const stream$ = persistStream$('test-restore', 0)

    expect(stream$.value).toBe(999)
  })

  it('should handle string values', async () => {
    const stream$ = persistStream$('test-string', 'initial')

    act(() => {
      stream$.next('updated')
    })

    await waitFor(() => {
      expect(localStorage.getItem('test-string')).toBe('"updated"')
    })

    // Create new stream to test restoration
    const stream2$ = persistStream$('test-string', 'default')
    expect(stream2$.value).toBe('updated')
  })

  it('should handle object values', async () => {
    const initialObj = { name: 'John', age: 30 }
    const stream$ = persistStream$('test-object', initialObj)

    const updatedObj = { name: 'Jane', age: 25 }
    act(() => {
      stream$.next(updatedObj)
    })

    await waitFor(() => {
      const stored = localStorage.getItem('test-object')
      expect(JSON.parse(stored!)).toEqual(updatedObj)
    })

    // Restore
    const stream2$ = persistStream$('test-object', { name: '', age: 0 })
    expect(stream2$.value).toEqual(updatedObj)
  })

  it('should handle array values', async () => {
    const stream$ = persistStream$('test-array', [1, 2, 3])

    act(() => {
      stream$.next([4, 5, 6])
    })

    await waitFor(() => {
      const stored = localStorage.getItem('test-array')
      expect(JSON.parse(stored!)).toEqual([4, 5, 6])
    })
  })

  it('should handle boolean values', async () => {
    const stream$ = persistStream$('test-boolean', false)

    act(() => {
      stream$.next(true)
    })

    await waitFor(() => {
      expect(localStorage.getItem('test-boolean')).toBe('true')
    })

    const stream2$ = persistStream$('test-boolean', false)
    expect(stream2$.value).toBe(true)
  })

  it('should handle null values', async () => {
    const stream$ = persistStream$('test-null', null)

    act(() => {
      stream$.next(null)
    })

    await waitFor(() => {
      expect(localStorage.getItem('test-null')).toBe('null')
    })
  })

  it('should handle undefined gracefully', async () => {
    const stream$ = persistStream$('test-undefined', 'default')

    act(() => {
      stream$.next(undefined as any)
    })

    await waitFor(() => {
      // undefined should be stored as null or empty
      const stored = localStorage.getItem('test-undefined')
      expect(stored).toBeTruthy()
    })
  })

  it('should support custom serializer', async () => {
    const customSerializer = {
      serialize: (value: any) => `custom:${value}`,
      deserialize: (value: string) => value.replace('custom:', ''),
    }

    const stream$ = persistStream$('test-custom', 'test', customSerializer)

    act(() => {
      stream$.next('value')
    })

    await waitFor(() => {
      expect(localStorage.getItem('test-custom')).toBe('custom:value')
    })

    const stream2$ = persistStream$('test-custom', 'default', customSerializer)
    expect(stream2$.value).toBe('value')
  })

  it('should handle localStorage errors gracefully', async () => {
    // Mock localStorage to throw error
    const originalSetItem = localStorage.setItem
    localStorage.setItem = vi.fn(() => {
      throw new Error('Storage full')
    })

    const stream$ = persistStream$('test-error', 0)

    // Should not throw
    expect(() => {
      act(() => {
        stream$.next(100)
      })
    }).not.toThrow()

    // Restore
    localStorage.setItem = originalSetItem
  })

  it('should handle corrupted localStorage data', () => {
    localStorage.setItem('test-corrupted', 'invalid-json{')

    // Should fall back to initial value
    const stream$ = persistStream$('test-corrupted', 42)
    expect(stream$.value).toBe(42)
  })

  it('should support multiple streams with different keys', async () => {
    const stream1$ = persistStream$('key1', 1)
    const stream2$ = persistStream$('key2', 2)

    act(() => {
      stream1$.next(10)
      stream2$.next(20)
    })

    await waitFor(() => {
      expect(localStorage.getItem('key1')).toBe('10')
      expect(localStorage.getItem('key2')).toBe('20')
    })
  })

  it('should update all subscribers when value changes', async () => {
    const stream$ = persistStream$('test-subscribers', 0)
    const values: number[] = []

    stream$.subscribe((value) => {
      values.push(value)
    })

    act(() => {
      stream$.next(1)
      stream$.next(2)
      stream$.next(3)
    })

    await waitFor(() => {
      expect(values).toContain(1)
      expect(values).toContain(2)
      expect(values).toContain(3)
    })
  })

  it('should work with React hooks', async () => {
    const stream$ = persistStream$('test-react', 0)

    const { result } = renderHook(() => {
      const [value, setValue] = React.useState(stream$.value)

      React.useEffect(() => {
        const subscription = stream$.subscribe(setValue)
        return () => subscription.unsubscribe()
      }, [])

      return value
    })

    await waitFor(() => {
      expect(result.current).toBe(0)
    })

    act(() => {
      stream$.next(42)
    })

    await waitFor(() => {
      expect(result.current).toBe(42)
    })
  })

  it('should handle rapid updates', async () => {
    const stream$ = persistStream$('test-rapid', 0)

    act(() => {
      for (let i = 1; i <= 100; i++) {
        stream$.next(i)
      }
    })

    await waitFor(() => {
      expect(stream$.value).toBe(100)
      expect(localStorage.getItem('test-rapid')).toBe('100')
    })
  })

  it('should support theme persistence use case', async () => {
    type Theme = 'light' | 'dark'
    const themeStream$ = persistStream$<Theme>('app-theme', 'light')

    expect(themeStream$.value).toBe('light')

    act(() => {
      themeStream$.next('dark')
    })

    await waitFor(() => {
      expect(localStorage.getItem('app-theme')).toBe('"dark"')
    })

    // Simulate page reload
    const newThemeStream$ = persistStream$<Theme>('app-theme', 'light')
    expect(newThemeStream$.value).toBe('dark')
  })

  it('should support user settings persistence', async () => {
    interface Settings {
      notifications: boolean
      language: string
      fontSize: number
    }

    const defaultSettings: Settings = {
      notifications: true,
      language: 'en',
      fontSize: 14,
    }

    const settingsStream$ = persistStream$('user-settings', defaultSettings)

    const newSettings: Settings = {
      notifications: false,
      language: 'zh',
      fontSize: 16,
    }

    act(() => {
      settingsStream$.next(newSettings)
    })

    await waitFor(() => {
      const stored = JSON.parse(localStorage.getItem('user-settings')!)
      expect(stored).toEqual(newSettings)
    })
  })

  it('should support shopping cart persistence', async () => {
    interface CartItem {
      id: string
      name: string
      quantity: number
      price: number
    }

    const cartStream$ = persistStream$<CartItem[]>('shopping-cart', [])

    const items: CartItem[] = [
      { id: '1', name: 'Product A', quantity: 2, price: 10 },
      { id: '2', name: 'Product B', quantity: 1, price: 20 },
    ]

    act(() => {
      cartStream$.next(items)
    })

    await waitFor(() => {
      const stored = JSON.parse(localStorage.getItem('shopping-cart')!)
      expect(stored).toEqual(items)
      expect(stored).toHaveLength(2)
    })
  })
})
