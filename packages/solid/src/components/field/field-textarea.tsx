import { autoresizeTextarea } from '@zag-js/auto-resize'
import { mergeProps } from '@zag-js/solid'
import { omit, onSettled } from 'solid-js'
import { composeRefs } from '../../utils/compose-refs.ts'
import { type HTMLProps, type PolymorphicProps, ark } from '../factory.tsx'
import { useFieldContext } from './use-field-context.ts'

export interface FieldTextareaBaseProps extends PolymorphicProps<'textarea'> {
  /**
   * Whether the textarea should autoresize
   * @default false
   */
  autoresize?: boolean
}
export interface FieldTextareaProps extends HTMLProps<'textarea'>, FieldTextareaBaseProps {}

export const FieldTextarea = (props: FieldTextareaProps) => {
  const field = useFieldContext()
  let textareaRef: HTMLTextAreaElement
  const textareaProps = omit(props, 'autoresize')

  const mergedProps = mergeProps(
    () => field?.().getTextareaProps(),
    () => ({ style: { resize: props.autoresize ? 'none' : undefined } }),
    textareaProps,
  )

  onSettled(() => {
    if (!props.autoresize) return
    const cleanup = autoresizeTextarea(textareaRef)
    return () => cleanup?.()
  })

  return <ark.textarea {...mergedProps} ref={composeRefs((el) => (textareaRef = el), props.ref)} />
}
