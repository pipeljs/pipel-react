import { describe, it, expect, vi } from 'vitest'
import { Stream } from 'pipeljs'
import { 
  debug$, 
  logStream$, 
  trace$, 
  inspect$, 
  performanceMonitor$,
  createDebugPlugin 
} from '../../index'

describe('debug$', () => {
  it('should add debug logging to stream', () => {
    const stream$ = new Stream(0)
    const consoleSpy = vi.spyOn(console, 'log')
    
    debug$(stream$, 'Test')
    stream$.next(1)
    
    expect(consoleSpy).toHaveBeenCalled()
    consoleSpy.mockRestore()
  })
})

describe('logStream$', () => {
  it('should log stream values', () => {
    const stream$ = new Stream(0)
    const consoleSpy = vi.spyOn(console, 'log')
    
    const unsubscribe = logStream$(stream$, 'Test')
    stream$.next(1)
    
    expect(consoleSpy).toHaveBeenCalledWith('[Test]', 1)
    
    unsubscribe()
    consoleSpy.mockRestore()
  })

  it('should stop logging after unsubscribe', () => {
    const stream$ = new Stream(0)
    const consoleSpy = vi.spyOn(console, 'log')
    
    const unsubscribe = logStream$(stream$, 'Test')
    stream$.next(1)
    
    consoleSpy.mockClear()
    unsubscribe()
    
    stream$.next(2)
    expect(consoleSpy).not.toHaveBeenCalled()
    
    consoleSpy.mockRestore()
  })
})

describe('trace$', () => {
  it('should trace stream lifecycle', () => {
    const consoleSpy = vi.spyOn(console, 'log')
    
    const stream$ = new Stream(0)
    trace$(stream$, 'Test')
    
    expect(consoleSpy).toHaveBeenCalledWith('[Test] Created')
    
    consoleSpy.mockRestore()
  })
})

describe('inspect$', () => {
  it('should track stream history', () => {
    const stream$ = new Stream(0)
    const inspector = inspect$(stream$)
    
    stream$.next(1)
    stream$.next(2)
    stream$.next(3)
    
    expect(inspector.getHistory()).toEqual([0, 1, 2, 3])
    expect(inspector.getCurrentValue()).toBe(3)
  })

  it('should track subscriber count', () => {
    const stream$ = new Stream(0)
    const inspector = inspect$(stream$)
    
    expect(inspector.getSubscriberCount()).toBe(0)
    
    const sub1 = stream$.then(() => {})
    expect(inspector.getSubscriberCount()).toBe(1)
    
    const sub2 = stream$.then(() => {})
    expect(inspector.getSubscriberCount()).toBe(2)
    
    sub1.unsubscribe()
    expect(inspector.getSubscriberCount()).toBe(1)
    
    sub2.unsubscribe()
    expect(inspector.getSubscriberCount()).toBe(0)
  })

  it('should clear history', () => {
    const stream$ = new Stream(0)
    const inspector = inspect$(stream$)
    
    stream$.next(1)
    stream$.next(2)
    
    expect(inspector.getHistory()).toEqual([0, 1, 2])
    
    inspector.clear()
    expect(inspector.getHistory()).toEqual([2]) // Only current value
  })
})

describe('performanceMonitor$', () => {
  it('should track update count', () => {
    const stream$ = new Stream(0)
    const perf = performanceMonitor$(stream$)
    
    stream$.next(1)
    stream$.next(2)
    stream$.next(3)
    
    const stats = perf.getStats()
    expect(stats.updateCount).toBe(3)
  })

  it('should reset stats', () => {
    const stream$ = new Stream(0)
    const perf = performanceMonitor$(stream$)
    
    stream$.next(1)
    stream$.next(2)
    
    expect(perf.getStats().updateCount).toBe(2)
    
    perf.reset()
    expect(perf.getStats().updateCount).toBe(0)
  })
})

describe('createDebugPlugin', () => {
  it('should create custom debug plugin', () => {
    const logger = vi.fn()
    const plugin = createDebugPlugin({
      label: 'Test',
      logger
    })
    
    const stream$ = new Stream(0)
    stream$.use(plugin)
    
    stream$.next(1)
    
    expect(logger).toHaveBeenCalled()
  })

  it('should respect options', () => {
    const logger = vi.fn()
    const plugin = createDebugPlugin({
      label: 'Test',
      logValues: false,
      logSubscriptions: true,
      logger
    })
    
    const stream$ = new Stream(0)
    stream$.use(plugin)
    
    logger.mockClear()
    stream$.next(1)
    
    // Should not log values
    expect(logger).not.toHaveBeenCalled()
  })
})
