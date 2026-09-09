import type { JSX } from '@solidjs/web'
import { type UseMenuContext, useStrictMenuContext } from './use-menu-context.ts'

export interface MenuContextProps {
  children: (context: UseMenuContext) => JSX.Element
}

export const MenuContext = (props: MenuContextProps) => props.children(useStrictMenuContext())
