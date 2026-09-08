import { hasProp, isFunction } from '@zag-js/utils'
import { type Context, createContext as createSolidContext, useContext as useSolidContext } from 'solid-js'

export interface CreateContextOptions<T> {
  strict?: boolean
  hookName?: string
  providerName?: string
  errorMessage?: string
  defaultValue?: T
}

// 2.0: there is no `.Provider` — the context IS the provider component
// (`<Ctx value={...}>`), so the first tuple slot is the context itself.
export type CreateContextReturn<T> = [Context<T>, () => T, Context<T>]

const MISSING = Symbol('ark-ui.context.missing')

function getErrorMessage(hook: string, provider: string) {
  return `${hook} returned \`undefined\`. Seems you forgot to wrap component within ${provider}`
}

export function createContext<T>(options: CreateContextOptions<T> = {}) {
  const { strict = true, hookName = 'useContext', providerName = 'Provider', errorMessage, defaultValue } = options

  // 2.0: a context whose resolved value is `undefined` THROWS
  // (`ContextNotFoundError`) rather than returning undefined, so a
  // default-less context can no longer model "optional". Park a sentinel as
  // the default and map it back to `undefined` on read, which preserves both
  // ark's `strict: false` behaviour and its own nicer strict error message.
  const Context = createSolidContext<T | typeof MISSING>(
    defaultValue === undefined ? (MISSING as T | typeof MISSING) : defaultValue,
  )

  function useContext() {
    const raw = useSolidContext(Context)
    const context = (raw === MISSING ? undefined : raw) as T

    if (!context && strict) {
      const error = new Error(errorMessage ?? getErrorMessage(hookName, providerName))
      error.name = 'ContextError'
      if (hasProp(Error, 'captureStackTrace') && isFunction(Error.captureStackTrace)) {
        Error.captureStackTrace(error, useContext)
      }
      throw error
    }

    return context
  }

  return [Context, useContext, Context] as CreateContextReturn<T>
}
