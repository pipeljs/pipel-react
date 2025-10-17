/**
 * fromEvent - Create stream from DOM events
 * Automatically manages event listeners and cleanup
 */

import { useEffect, useRef, RefObject } from 'react'
import { Stream } from 'pipeljs'

/**
 * Create a stream from DOM events
 * 
 * @param target - Event target (element or ref)
 * @param event - Event name
 * @returns Stream of events
 * 
 * @example
 * ```tsx
 * const button = document.querySelector('button')
 * const click$ = fromEvent(button, 'click')
 * 
 * click$.then(event => {
 *   console.log('Button clicked!', event)
 * })
 * ```
 */
export function fromEvent<T extends Event = Event>(
  target: EventTarget | null,
  event: string
): Stream<T> {
  const stream$ = new Stream<T>()

  if (!target) {
    console.warn('fromEvent: target is null')
    return stream$
  }

  const handler = (e: Event) => {
    stream$.next(e as T)
  }

  target.addEventListener(event, handler)

  // Cleanup on stream completion
  stream$.afterUnsubscribe(() => {
    target.removeEventListener(event, handler)
  })

  return stream$
}

/**
 * Hook version of fromEvent that properly integrates with React lifecycle
 * 
 * @param ref - React ref to the element
 * @param event - Event name
 * @returns Stream of events
 * 
 * @example
 * ```tsx
 * function Button() {
 *   const buttonRef = useRef<HTMLButtonElement>(null)
 *   const click$ = useFromEvent(buttonRef, 'click')
 *   
 *   useObservable(click$, (event) => {
 *     console.log('Button clicked!', event)
 *   })
 *   
 *   return <button ref={buttonRef}>Click me</button>
 * }
 * ```
 */
export function useFromEvent<
  T extends Event = Event,
  E extends HTMLElement = HTMLElement
>(
  ref: RefObject<E | null>,
  event: string
): Stream<T> {
  const streamRef = useRef<Stream<T>>()

  if (!streamRef.current) {
    streamRef.current = new Stream<T>()
  }

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const handler = (e: Event) => {
      streamRef.current?.next(e as T)
    }

    element.addEventListener(event, handler)

    return () => {
      element.removeEventListener(event, handler)
    }
  }, [ref, event])

  useEffect(() => {
    return () => {
      streamRef.current?.complete()
    }
  }, [])

  return streamRef.current
}

/**
 * Create a stream from window events
 * 
 * @param event - Event name
 * @returns Stream of events
 * 
 * @example
 * ```tsx
 * function App() {
 *   const resize$ = useWindowEvent('resize')
 *   
 *   useObservable(resize$, () => {
 *     console.log('Window resized!')
 *   })
 *   
 *   return <div>Resize the window</div>
 * }
 * ```
 */
export function useWindowEvent<T extends Event = Event>(
  event: string
): Stream<T> {
  const streamRef = useRef<Stream<T>>()

  if (!streamRef.current) {
    streamRef.current = new Stream<T>()
  }

  useEffect(() => {
    const handler = (e: Event) => {
      streamRef.current?.next(e as T)
    }

    window.addEventListener(event, handler)

    return () => {
      window.removeEventListener(event, handler)
    }
  }, [event])

  useEffect(() => {
    return () => {
      streamRef.current?.complete()
    }
  }, [])

  return streamRef.current
}

/**
 * Create a stream from document events
 * 
 * @param event - Event name
 * @returns Stream of events
 * 
 * @example
 * ```tsx
 * function App() {
 *   const click$ = useDocumentEvent('click')
 *   
 *   useObservable(click$, (event) => {
 *     console.log('Document clicked at:', event.clientX, event.clientY)
 *   })
 *   
 *   return <div>Click anywhere</div>
 * }
 * ```
 */
export function useDocumentEvent<T extends Event = Event>(
  event: string
): Stream<T> {
  const streamRef = useRef<Stream<T>>()

  if (!streamRef.current) {
    streamRef.current = new Stream<T>()
  }

  useEffect(() => {
    const handler = (e: Event) => {
      streamRef.current?.next(e as T)
    }

    document.addEventListener(event, handler)

    return () => {
      document.removeEventListener(event, handler)
    }
  }, [event])

  useEffect(() => {
    return () => {
      streamRef.current?.complete()
    }
  }, [])

  return streamRef.current
}
