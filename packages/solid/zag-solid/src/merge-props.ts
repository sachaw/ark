import { mergeProps as zagMergeProps } from "@zag-js/core"
import { untrack } from "solid-js"

export type MaybeAccessor<T> = T | (() => T)

export function mergeProps<T>(source: MaybeAccessor<T>): T
export function mergeProps<T, U>(source: MaybeAccessor<T>, source1: MaybeAccessor<U>): T & U
export function mergeProps<T, U, V>(
  source: MaybeAccessor<T>,
  source1: MaybeAccessor<U>,
  source2: MaybeAccessor<V>,
): T & U & V
export function mergeProps<T, U, V, W>(
  source: MaybeAccessor<T>,
  source1: MaybeAccessor<U>,
  source2: MaybeAccessor<V>,
  source3: MaybeAccessor<W>,
): T & U & V & W
export function mergeProps(...sources: any[]) {
  const target = {}
  for (let i = 0; i < sources.length; i++) {
    let source = sources[i]
    // Resolve accessor sources UNTRACKED. This runs during the component
    // body, which under Solid 2 executes inside the parent's `insert` compute
    // — a tracking scope. Reading the accessor here therefore subscribed the
    // PARENT's insert to the child's state, so any child-state change re-ran
    // the parent's children getter and re-created the whole subtree (element
    // identity lost => dropped focus, restarted animations, stale test refs).
    // Only the key set is needed here; the per-key getters below still resolve
    // sources reactively inside the consumer's own effect.
    if (typeof source === "function") source = untrack(source)
    if (source) {
      const descriptors = Object.getOwnPropertyDescriptors(source)
      for (const key in descriptors) {
        if (key in target) continue
        Object.defineProperty(target, key, {
          enumerable: true,
          get() {
            let e = {}
            if (
              key === "style" ||
              key === "class" ||
              key === "className" ||
              key === "data-ownedby" ||
              key.startsWith("on")
            ) {
              for (let i = 0; i < sources.length; i++) {
                let s = sources[i]
                if (typeof s === "function") s = s()
                e = zagMergeProps(e, { [key]: (s || {})[key] })
              }

              return (e as any)[key]
            }
            for (let i = sources.length - 1; i >= 0; i--) {
              let v,
                s = sources[i]
              if (typeof s === "function") s = s()
              v = (s || {})[key]
              if (v !== undefined) return v
            }
          },
        })
      }
    }
  }
  return target
}
