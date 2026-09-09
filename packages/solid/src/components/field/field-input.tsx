import { mergeProps } from '@zag-js/solid'
import { type HTMLProps, type PolymorphicProps, ark } from '../factory.tsx'
import { useStrictFieldContext } from './use-field-context.ts'

export interface FieldInputBaseProps extends PolymorphicProps<'input'> {}
export interface FieldInputProps extends HTMLProps<'input'>, FieldInputBaseProps {}

export const FieldInput = (props: FieldInputProps) => {
  const field = useStrictFieldContext()
  const mergedProps = mergeProps(() => field().getInputProps(), props)

  return <ark.input {...mergedProps} />
}
