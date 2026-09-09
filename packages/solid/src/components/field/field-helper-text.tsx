import { mergeProps } from '@zag-js/solid'
import { type HTMLProps, type PolymorphicProps, ark } from '../factory.tsx'
import { useStrictFieldContext } from './use-field-context.ts'

export interface FieldHelperTextBaseProps extends PolymorphicProps<'span'> {}
export interface FieldHelperTextProps extends HTMLProps<'span'>, FieldHelperTextBaseProps {}

export const FieldHelperText = (props: FieldHelperTextProps) => {
  const field = useStrictFieldContext()
  const mergedProps = mergeProps(() => field().getHelperTextProps(), props)

  return <ark.span {...mergedProps} />
}
