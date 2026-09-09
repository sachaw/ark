import { createOptionalContext } from '../../utils/create-context.ts'
import type { UseMenuReturn } from './use-menu.ts'

export type UseMenuContext = UseMenuReturn['api']

// Optional, and consumed that way by exactly one caller: `Menu.Root` reads it
// to find a PARENT menu when nesting, and a top-level menu has none. Every
// other part of the menu requires it, so they take the strict reader.
export const [MenuProvider, useMenuContext, useStrictMenuContext] =
  createOptionalContext<UseMenuContext>('MenuProvider')
