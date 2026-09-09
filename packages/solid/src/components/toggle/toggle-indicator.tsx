import { mergeProps } from '@zag-js/solid'
import { omit, Show } from 'solid-js'
import type { JSX } from '@solidjs/web'
import type { HTMLProps, PolymorphicProps } from '../factory.tsx'
import { ark } from '../factory.tsx'
import { useToggleContext } from './use-toggle-context.ts'

export interface ToggleIndicatorBaseProps extends PolymorphicProps<'div'> {
  fallback?: JSX.Element
}

export interface ToggleIndicatorProps extends HTMLProps<'div'>, ToggleIndicatorBaseProps {}

export const ToggleIndicator = (props: ToggleIndicatorProps) => {
  const restProps = omit(props, 'children', 'fallback')
  const toggle = useToggleContext()
  const mergedProps = mergeProps(() => toggle().getIndicatorProps(), restProps)
  return (
    <ark.div {...mergedProps}>
      <Show when={toggle().pressed} fallback={props.fallback}>
        {props.children}
      </Show>
    </ark.div>
  )
}
