import { untrack } from 'solid-js'

/**
 * A reactive view of just these keys — the complement of Solid 2's `omit`.
 *
 * Solid 2 ships `omit` and nothing for the other side, on the reasoning that
 * you should read `props.x` directly rather than build a subset object. Ark
 * cannot: the picked half is handed to a zag machine AS a props object, and
 * the machine reads it itself. So the pick is spelled out here over 2.0
 * primitives rather than reimplementing 1.x's `splitProps`.
 *
 * Getters, so a value read through the result re-reads the source and stays
 * reactive. Only keys the source actually HAS are mirrored: defining an absent
 * one makes it an enumerable `undefined`, which then overrides the machine's
 * own default when the object is spread. The key set is fixed at pick time and
 * the probe is untracked — `key in props` hits the proxy's `has` trap, and this
 * runs in a component body.
 */
export function pickProps<T extends Record<any, any>, K extends readonly (keyof T)[]>(
  props: T,
  keys: K,
): Pick<T, K[number]> {
  const picked = {} as Pick<T, K[number]>
  for (const key of keys) {
    if (!untrack(() => key in props)) continue
    Object.defineProperty(picked, key, {
      enumerable: true,
      configurable: true,
      get: () => props[key],
    })
  }
  return picked
}
