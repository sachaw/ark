import { createSignal, onSettled, type Accessor } from "solid-js"

export function useSyncExternalStore<T>(
  subscribe: (listener: () => void) => () => void,
  getSnapshot: () => T,
  _getServerSnapshot?: () => T,
): Accessor<T> {
  // 2.0 overloads a function first-arg as a writable derived memo
  // (`createSignal<T>(value: Exclude<T, Function>)`), so generic library code
  // that may legitimately hold a function value needs the cast to select the
  // plain-value overload.
  const [snapshot, setSnapshot] = createSignal<T>(getSnapshot() as Exclude<T, Function>, {
    ownedWrite: true,
  })

  // `onSettled` is the 2.0 component-lifecycle primitive; the returned function
  // is the cleanup, so `subscribe`'s unsubscribe can be handed back directly.
  onSettled(() => {
    setSnapshot(() => getSnapshot())
    return subscribe(() => {
      setSnapshot(() => getSnapshot())
    })
  })

  return snapshot
}
