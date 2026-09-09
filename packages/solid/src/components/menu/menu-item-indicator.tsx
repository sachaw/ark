import { mergeProps } from '@zag-js/solid'
import { type HTMLProps, type PolymorphicProps, ark } from '../factory.tsx'
import { useStrictMenuContext } from './use-menu-context.ts'
import { useMenuItemPropsContext } from './use-menu-option-item-props-context.ts'

export interface MenuItemIndicatorBaseProps extends PolymorphicProps<'div'> {}
export interface MenuItemIndicatorProps extends HTMLProps<'div'>, MenuItemIndicatorBaseProps {}

export const MenuItemIndicator = (props: MenuItemIndicatorProps) => {
  const context = useStrictMenuContext()
  const itemProps = useMenuItemPropsContext()

  const mergedProps = mergeProps(() => context().getItemIndicatorProps(itemProps), props)

  return <ark.div {...mergedProps} />
}
