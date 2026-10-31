import type { ItemProps } from '@zag-js/navigation-menu'
import { createOptionalContext } from '../../utils/create-context.ts'

export const [
  NavigationMenuItemPropsProvider,
  useNavigationMenuItemPropsContext,
  useStrictNavigationMenuItemPropsContext,
] = createOptionalContext<ItemProps>('NavigationMenuItemPropsProvider')
