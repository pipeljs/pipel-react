import { useEffect, useRef } from 'react'
import { Stream } from 'pipeljs'

/**
 * 将 React State 转换为 Stream
 * 
 * @example
 * ```tsx
 * function App() {
 *   const [keyword, setKeyword] = useState('')
 *   const keyword$ = to$(keyword)
 *   
 *   const results = useObservable(
 *     keyword$.pipe(
 *       debounce(300),
 *       map(k => fetchResults(k))
 *     )
 *   )
 *   
 *   return (
 *     <input 
 *       value={keyword}
 *       onChange={e => setKeyword(e.target.value)}
 *     />
 *   )
 * }
 * ```
 */
export function to$<T>(value: T): Stream<T> {
  const stream$ = useRef<Stream<T>>()
  
  if (!stream$.current) {
    stream$.current = new Stream(value)
  }
  
  useEffect(() => {
    stream$.current!.next(value)
  }, [value])
  
  return stream$.current
}
