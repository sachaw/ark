import { mergeProps } from '@zag-js/solid'
import { omit, Show } from 'solid-js'
import type { JSX } from '@solidjs/web'
import { type HTMLProps, type PolymorphicProps, ark } from '../factory.tsx'
import { usePasswordInputContext } from './use-password-input-context.ts'

export interface PasswordInputIndicatorBaseProps extends PolymorphicProps<'span'> {
  /**
   * The fallback content to display when the password is not visible.
   */
  fallback?: JSX.Element
}
export interface PasswordInputIndicatorProps extends HTMLProps<'span'>, PasswordInputIndicatorBaseProps {}

export const PasswordInputIndicator = (props: PasswordInputIndicatorProps) => {
  const passwordInput = usePasswordInputContext()
  const rest = omit(props, 'fallback', 'children')
  const mergedProps = mergeProps(() => passwordInput().getIndicatorProps(), rest)

  return (
    <ark.span {...mergedProps}>
      <Show when={passwordInput().visible} fallback={props.fallback}>
        {props.children}
      </Show>
    </ark.span>
  )
}
