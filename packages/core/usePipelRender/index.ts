import { ReactNode } from 'react'
import { Observable } from 'pipeljs'
import { useObservable } from '../useObservable'

/**
 * 流式渲染组件
 *
 * @example
 * ```tsx
 * function App() {
 *   const [count, count$] = usePipel(0)
 *
 *   const content = usePipelRender(
 *     count$.pipe(
 *       map(n => n > 10 ? <Success /> : <Loading />)
 *     )
 *   )
 *
 *   return <div>{content}</div>
 * }
 * ```
 */
export function usePipelRender(observable$: Observable<ReactNode>): ReactNode {
  return useObservable(observable$, null)
}
