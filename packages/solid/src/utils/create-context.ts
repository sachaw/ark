import { type Context, createContext as createSolidContext, useContext as useSolidContext } from 'solid-js'

/**
 * A context every consumer must be inside, and its reader.
 *
 * There is no wrapper around the read because 2.0 does not need one: a
 * default-less context THROWS `ContextNotFoundError` when the value was never
 * provided, and `useContext` types as `T` rather than `T | undefined`. The
 * `hookName` / `providerName` / `errorMessage` / `captureStackTrace` plumbing
 * this used to carry only restated what the runtime already does. The name is
 * handed to Solid instead, where it reaches the dev graph.
 *
 * Pass a `defaultValue` for the frozen-config case — locale, environment — and
 * the read simply never fails. That is a real default, not a stand-in for
 * absence; see `createOptionalContext` for the difference.
 */
export function createContext<T>(name: string, defaultValue?: T): [Context<T>, () => T] {
  const context = createSolidContext<T>(defaultValue, { name })
  return [context, () => useSolidContext(context)]
}

const MISSING = Symbol('ark-ui.context.missing')

/**
 * A context a component may legitimately render outside of.
 *
 * This is the one case 2.0 cannot express directly, and the reason a sentinel
 * is not a leftover habit. Solid decides "never provided" from the resolved
 * VALUE — `hasContext` is `!isUndefined(value)` — so a default-less context
 * and an `undefined` default behave identically: both throw. Only a value that
 * is always present can mean "nothing here", so a sentinel goes in as the
 * default and the read maps it back to `undefined`.
 */
export function createOptionalContext<T>(name: string): [Context<T>, () => T | undefined, () => T] {
  const context = createSolidContext<T | typeof MISSING>(MISSING, { name })
  const read = () => useSolidContext(context)
  return [
    context as Context<T>,
    () => {
      const value = read()
      return value === MISSING ? undefined : value
    },
    // The strict reader for the component's OWN parts. It has to do its own
    // check: the sentinel is always present, so Solid's ContextNotFoundError
    // can never fire on an optional context. `Field.ErrorText` outside a
    // `Field.Root` is a usage error, and this is where it is said.
    () => {
      const value = read()
      if (value === MISSING) throw new Error(`${name} is missing: this part must be rendered inside it`)
      return value as T
    },
  ]
}
