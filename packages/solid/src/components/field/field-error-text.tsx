import { mergeProps } from '@zag-js/solid'
import { Show } from 'solid-js'
import { type HTMLProps, type PolymorphicProps, ark } from '../factory.tsx'
import { useStrictFieldContext } from './use-field-context.ts'

export interface FieldErrorTextBaseProps extends PolymorphicProps<'span'> {}
export interface FieldErrorTextProps extends HTMLProps<'span'>, FieldErrorTextBaseProps {}

export const FieldErrorText = (props: FieldErrorTextProps) => {
  const field = useStrictFieldContext()
  const mergedProps = mergeProps(() => field().getErrorTextProps(), props)

  return (
    <Show when={field().invalid}>
      <ark.span {...mergedProps} />
    </Show>
  )
}
