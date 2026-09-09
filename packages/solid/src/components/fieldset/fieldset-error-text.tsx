import { mergeProps } from '@zag-js/solid'
import { Show } from 'solid-js'
import { type HTMLProps, type PolymorphicProps, ark } from '../factory.tsx'
import { useStrictFieldsetContext } from './use-fieldset-context.ts'

export interface FieldsetErrorTextBaseProps extends PolymorphicProps<'span'> {}
export interface FieldsetErrorTextProps extends HTMLProps<'span'>, FieldsetErrorTextBaseProps {}

export const FieldsetErrorText = (props: FieldsetErrorTextProps) => {
  const fieldset = useStrictFieldsetContext()
  const mergedProps = mergeProps(() => fieldset().getErrorTextProps(), props)

  return (
    <Show when={fieldset().invalid}>
      <ark.span {...mergedProps} />
    </Show>
  )
}
