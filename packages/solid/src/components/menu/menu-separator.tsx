import { mergeProps } from '@zag-js/solid'
import { type HTMLProps, type PolymorphicProps, ark } from '../factory.tsx'
import { useStrictMenuContext } from './use-menu-context.ts'

export interface MenuSeparatorBaseProps extends PolymorphicProps<'hr'> {}
export interface MenuSeparatorProps extends HTMLProps<'hr'>, MenuSeparatorBaseProps {}

export const MenuSeparator = (props: MenuSeparatorProps) => {
  const menu = useStrictMenuContext()
  const mergedProps = mergeProps(() => menu().getSeparatorProps(), props)

  return <ark.hr {...mergedProps} />
}
