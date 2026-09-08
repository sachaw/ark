import { isEqual, isFunction } from "@zag-js/utils"
import { createEffect, untrack } from "solid-js"

function access<T>(v: T | (() => T)): T {
  if (isFunction(v)) return v()
  return v
}

/**
 * Solid 2's `createEffect(compute, apply)` gives us the previous computed value,
 * so the manual `prevDeps`/`isFirstRun` bookkeeping the 1.x single-arg form
 * needed is now carried by the runtime. `prev` is undefined on the first run,
 * which is exactly the "skip initial" semantic zag wants.
 */
export const createTrack = (deps: any[], effect: VoidFunction) => {
  createEffect(
    () => deps.map((d) => access(d)),
    (next: any[], prev: any[] | undefined) => {
      if (prev === undefined) return
      for (let i = 0; i < next.length; i++) {
        if (!isEqual(prev[i], next[i])) {
          // zag's contract: the callback reacts to `deps` only and must not
          // re-subscribe to whatever it reads. Explicit untrack keeps that
          // intent and avoids a false STRICT_READ_UNTRACKED diagnostic.
          untrack(effect)
          return
        }
      }
    },
  )
}
