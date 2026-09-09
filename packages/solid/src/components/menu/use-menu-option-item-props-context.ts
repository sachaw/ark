import type { ItemBaseProps } from '@zag-js/menu'
import { createContext } from '../../utils/create-context.ts'

export const [MenuItemPropsProvider, useMenuItemPropsContext] = createContext<ItemBaseProps>('MenuItemPropsProvider')
