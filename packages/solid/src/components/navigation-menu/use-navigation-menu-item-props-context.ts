import type { ItemProps } from '@zag-js/navigation-menu'
import { createOptionalContext } from '../../utils/create-context.ts'

export const [NavigationMenuItemPropsProvider, useNavigationMenuItemPropsContext] = createOptionalContext<ItemProps>('NavigationMenuItemPropsProvider')
