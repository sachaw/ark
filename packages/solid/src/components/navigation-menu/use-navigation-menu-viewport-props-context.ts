import type { ViewportProps } from '@zag-js/navigation-menu'
import { createOptionalContext } from '../../utils/create-context.ts'

export const [NavigationMenuViewportPropsProvider, useNavigationMenuViewportPropsContext] = createOptionalContext<ViewportProps>('NavigationMenuViewportPropsProvider')
