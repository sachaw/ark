import { onSettled } from 'solid-js'

// 2.0 made refs composable: `ref={[a, b]}` is legal, so `Ref<T>` now includes
// `Ref<T>[]`. Accept the nested form and flatten when applying.
type PossibleRef<T> = T | ((el: T) => void) | PossibleRef<T>[] | undefined

const isRefFn = <T>(ref: PossibleRef<T>): ref is (el: T | null) => void => typeof ref === 'function'

const setRefs = <T>(refs: PossibleRef<T>[], node: T | null) => {
  for (const ref of refs) {
    if (Array.isArray(ref)) {
      setRefs(ref, node)
    } else if (isRefFn(ref)) {
      ref(node)
    }
  }
}

export function composeRefs<T>(...refs: PossibleRef<T>[]) {
  let node: T | null = null
  // Was a single-arg `createEffect` that tracked nothing — its only job is to
  // re-apply the refs once the tree has settled. `onSettled` is the 2.0
  // primitive for exactly that.
  onSettled(() => {
    setRefs(refs, node)
  })
  return (el: T) => {
    node = el
    setRefs(refs, el)
  }
}
