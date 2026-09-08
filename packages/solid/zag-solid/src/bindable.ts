import type { Bindable, BindableParams } from "@zag-js/core"
import { isFunction } from "@zag-js/utils"
import { createEffect, createMemo, createSignal, onCleanup, type Accessor } from "solid-js"

/**
 * Solid 2 commits signal writes on flush: `setValue(x); value()` returns the
 * OLD value until the microtask drains. zag's machine relies on reading state
 * back synchronously inside a transition (`send` reads `state.get()` right
 * after a prior `state.set()`), so a straight 1.x port silently transitions
 * from stale state.
 *
 * Fix: keep the authoritative value in a plain shadow cell and demote the
 * signal to a pure change notification. `get()` reads the shadow (synchronous,
 * always current) while still subscribing via `track()`, so rendering stays
 * reactive and the machine stays correct.
 */
export function createBindable<T>(props: Accessor<BindableParams<T>>): Bindable<T> {
  const initial = props().value ?? props().defaultValue

  const eq = props().isEqual ?? Object.is

  let shadow = initial as T
  // `equals: false` — every notify is a change; the shadow holds the real value.
  // `ownedWrite` — the machine writes from actions that may run under an owner.
  const [track, notify] = createSignal(0, { equals: false, ownedWrite: true })

  const controlled = createMemo(() => props().value !== undefined)

  const valueRef = { current: shadow }
  const prevValue: Record<"current", T | undefined> = { current: undefined }

  // Controlled mode: the value lives in props, so mirror external changes into
  // the refs. Two-arg form — compute tracks, apply writes.
  createEffect(
    () => (controlled() ? (props().value as T) : (track(), shadow)),
    (v: T) => {
      prevValue.current = v
      valueRef.current = v
    },
  )

  const set = (v: T | ((prev: T) => T)) => {
    const prev = prevValue.current
    const next = isFunction(v) ? (v as (p: T) => T)(valueRef.current as T) : v

    if (props().debug) {
      console.log(`[bindable > ${props().debug}] setValue`, { next, prev })
    }

    if (!controlled()) {
      shadow = next as T
      notify((n) => n + 1)
    }

    // Update the synchronous view eagerly rather than waiting for the effect
    // above to land. Without this, two `set`s in one tick both read the same
    // stale `prev`, and the updater form composes off a stale base.
    prevValue.current = next as T
    valueRef.current = next as T

    if (!eq(next, prev)) {
      props().onChange?.(next as T, prev as T)
    }
  }

  function get(): T {
    track()
    return controlled() ? (props().value as T) : shadow
  }

  return {
    initial,
    ref: valueRef,
    get,
    set,
    invoke(nextValue: T, prevValue: T) {
      props().onChange?.(nextValue, prevValue)
    },
    hash(value: T) {
      return props().hash?.(value) ?? String(value)
    },
  }
}

createBindable.cleanup = (fn: VoidFunction) => {
  onCleanup(() => fn())
}

createBindable.ref = <T>(defaultValue: T) => {
  let value = defaultValue
  return {
    get: () => value,
    set: (next: T) => {
      value = next
    },
  }
}
