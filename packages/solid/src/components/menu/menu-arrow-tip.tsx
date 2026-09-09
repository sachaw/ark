import { mergeProps } from '@zag-js/solid'
import { type HTMLProps, type PolymorphicProps, ark } from '../factory.tsx'
import { useStrictMenuContext } from './use-menu-context.ts'

export interface MenuArrowTipBaseProps extends PolymorphicProps<'div'> {}
export interface MenuArrowTipProps extends HTMLProps<'div'>, MenuArrowTipBaseProps {}

export const MenuArrowTip = (props: MenuArrowTipProps) => {
  const context = useStrictMenuContext()
  const mergedProps = mergeProps(() => context().getArrowTipProps(), props)

  return <ark.div {...mergedProps} />
}
