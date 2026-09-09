import { mergeProps } from '@zag-js/solid'
import { type HTMLProps, type PolymorphicProps, ark } from '../factory.tsx'
import { useStrictFieldContext } from './use-field-context.ts'

export interface FieldLabelBaseProps extends PolymorphicProps<'label'> {}
export interface FieldLabelProps extends HTMLProps<'label'>, FieldLabelBaseProps {}

export const FieldLabel = (props: FieldLabelProps) => {
  const field = useStrictFieldContext()
  const mergedProps = mergeProps(() => field().getLabelProps(), props)

  return <ark.label {...mergedProps} />
}
