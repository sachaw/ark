import { omit } from 'solid-js'

/**
 * Solid 2 removed `splitProps` in favour of `omit`, which is variadic and
 * returns ONLY the rest half. Ark destructures the `[picked, rest]` tuple in
 * ~200 places, so rather than churn every call site the fork keeps the 1.x
 * contract and reimplements it on 2.0 primitives.
 *
 * The picked half is built from getters so property access still tracks —
 * reading `local.value` re-reads `props.value` exactly as `splitProps` did.
 */
export function splitProps<T extends Record<any, any>, K extends readonly (keyof T)[]>(
  props: T,
  keys: K,
): [Pick<T, K[number]>, Omit<T, K[number]>] {
  const picked = {} as Pick<T, K[number]>
  for (const key of keys) {
    // Only mirror keys that actually exist on the source. 1.x `splitProps`
    // buckets the source's own keys, so an absent key stays absent; defining
    // it unconditionally makes it an enumerable `undefined` that then
    // CLOBBERS defaults when the result is spread (`{ id, ...rest }`).
    if (!(key in props)) continue
    Object.defineProperty(picked, key, {
      enumerable: true,
      configurable: true,
      get: () => props[key],
    })
  }
  return [picked, omit(props, ...(keys as readonly any[])) as unknown as Omit<T, K[number]>]
}
