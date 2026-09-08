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
            // Solid 2's `class` takes a ClassValue -- string | number |
            // boolean | null | undefined | Record<string, boolean> |
            // ClassValue[]. zag folds class layers with a string-only clsx
            // (`args.map(s => s?.trim?.()).filter(Boolean).join(" ")`), so an
            // array or object layer has no `.trim` and is dropped: the part
            // renders with NO classes at all, silently. Collect the layers
            // into an array instead and let the renderer flatten it -- nested
            // arrays merge, object entries toggle, falsy entries are skipped,
            // and source order still decides precedence.
            if (key === "class" || key === "className") {
              const layers: unknown[] = []
              for (let i = 0; i < sources.length; i++) {
                let s = sources[i]
                if (typeof s === "function") s = s()
                const v = (s || {})[key]
                if (v != null && v !== false && v !== "") layers.push(v)
              }
              if (layers.length === 0) return undefined
              return layers.length === 1 ? layers[0] : layers
            }
            let e = {}
            if (
              key === "style" ||
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
