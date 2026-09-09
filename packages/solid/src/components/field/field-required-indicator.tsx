import { mergeProps } from '@zag-js/solid'
import { Show } from 'solid-js'
import type { JSX } from '@solidjs/web'
import { type HTMLProps, type PolymorphicProps, ark } from '../factory.tsx'
import { useStrictFieldContext } from './use-field-context.ts'

export interface FieldRequiredIndicatorBaseProps extends PolymorphicProps<'span'> {
  fallback?: JSX.Element
}
export interface FieldRequiredIndicatorProps extends HTMLProps<'span'>, FieldRequiredIndicatorBaseProps {}

export const FieldRequiredIndicator = (props: FieldRequiredIndicatorProps) => {
  const field = useStrictFieldContext()
  const mergedProps = mergeProps(() => field().getRequiredIndicatorProps(), props)

  return (
    <Show when={field().required} fallback={props.fallback}>
      <ark.span {...mergedProps}>{props.children ?? '*'}</ark.span>
    </Show>
  )
}
