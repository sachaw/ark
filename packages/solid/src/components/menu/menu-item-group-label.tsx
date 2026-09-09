import { mergeProps } from '@zag-js/solid'
import { type HTMLProps, type PolymorphicProps, ark } from '../factory.tsx'
import { useStrictMenuContext } from './use-menu-context.ts'
import { useMenuItemGroupContext } from './use-menu-item-group-context.ts'

export interface MenuItemGroupLabelBaseProps extends PolymorphicProps<'div'> {}
export interface MenuItemGroupLabelProps extends HTMLProps<'div'>, MenuItemGroupLabelBaseProps {}

export const MenuItemGroupLabel = (props: MenuItemGroupLabelProps) => {
  const context = useStrictMenuContext()
  const itemGroupContext = useMenuItemGroupContext()
  // Accessor, not a resolved object: every sibling part passes `() => …` so
  // the props stay lazy. Resolving `context()` inline reads it in the component
  // body, which 2.0 flags as a read that will not update.
  const mergedProps = mergeProps(
    () => context().getItemGroupLabelProps({ htmlFor: itemGroupContext.id }),
    props,
  )

  return <ark.div {...mergedProps} />
}
