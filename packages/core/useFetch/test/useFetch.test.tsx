import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useFetch } from '../../fetch/useFetch'

describe('useFetch', () => {
  beforeEach(() => {
    // Mock fetch
    global.fetch = vi.fn()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should fetch data successfully', async () => {
    const mockData = { id: 1, name: 'Test' }
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockData,
      clone: () => ({
        json: async () => mockData,
      }),
      headers: new Headers(),
    })

    const { result } = renderHook(() =>
      useFetch<typeof mockData>('https://api.example.com/test', {
        immediate: true,
      })
    )

    expect(result.current.loading).toBe(true)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).toEqual(mockData)
    expect(result.current.error).toBe(null)
  })

  it('should handle fetch error', async () => {
    const errorMessage = 'Network error'
    ;(global.fetch as any).mockRejectedValueOnce(new Error(errorMessage))

    const { result } = renderHook(() =>
      useFetch('https://api.example.com/test', {
        immediate: true,
      })
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBeTruthy()
    expect(result.current.data).toBe(null)
  })

  it('should not fetch immediately when immediate is false', () => {
    renderHook(() =>
      useFetch('https://api.example.com/test', {
        immediate: false,
      })
    )

    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('should support manual execution', async () => {
    const mockData = { id: 1 }
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockData,
      clone: () => ({
        json: async () => mockData,
      }),
      headers: new Headers(),
    })

    const { result } = renderHook(() =>
      useFetch<typeof mockData>('https://api.example.com/test', {
        immediate: false,
      })
    )

    expect(result.current.loading).toBe(false)

    await result.current.execute()

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).toEqual(mockData)
  })
})
