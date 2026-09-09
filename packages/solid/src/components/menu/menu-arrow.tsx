import { mergeProps } from '@zag-js/solid'
import { type HTMLProps, type PolymorphicProps, ark } from '../factory.tsx'
import { useStrictMenuContext } from './use-menu-context.ts'

export interface MenuArrowBaseProps extends PolymorphicProps<'div'> {}
export interface MenuArrowProps extends HTMLProps<'div'>, MenuArrowBaseProps {}

export const MenuArrow = (props: MenuArrowProps) => {
  const context = useStrictMenuContext()
  const mergedProps = mergeProps(() => context().getArrowProps(), props)

  return <ark.div {...mergedProps} />
}
