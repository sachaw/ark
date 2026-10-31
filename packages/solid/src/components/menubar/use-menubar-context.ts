import { createOptionalContext } from '../../utils/create-context.ts'
import type { UseMenubarReturn } from './use-menubar.ts'

export interface UseMenubarContext extends UseMenubarReturn {}

// Optional: a menu reads it to find the menubar it sits in, and most menus sit in none.
export const [MenubarProvider, useMenubarContext, useStrictMenubarContext] =
  createOptionalContext<UseMenubarContext>('MenubarProvider')
