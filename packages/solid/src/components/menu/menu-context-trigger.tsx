import { mergeProps } from '@zag-js/solid'
import { type HTMLProps, type PolymorphicProps, ark } from '../factory.tsx'
import { useStrictMenuContext } from './use-menu-context.ts'

export interface MenuContextTriggerBaseProps extends PolymorphicProps<'button'> {}
export interface MenuContextTriggerProps extends HTMLProps<'button'>, MenuContextTriggerBaseProps {}

export const MenuContextTrigger = (props: MenuContextTriggerProps) => {
  const context = useStrictMenuContext()
  const mergedProps = mergeProps(() => context().getContextTriggerProps(), props)

  return <ark.button {...mergedProps} />
}
