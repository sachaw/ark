import { mergeProps } from '@zag-js/solid'
import { omit, Show, untrack } from 'solid-js'
import { composeRefs } from '../../utils/compose-refs.ts'
import { type HTMLProps, type PolymorphicProps, ark } from '../factory.tsx'
import { useSwapContext } from './use-swap-context.ts'

export interface SwapIndicatorBaseProps extends PolymorphicProps<'span'> {
  type: 'on' | 'off'
}

export interface SwapIndicatorProps extends HTMLProps<'span'>, SwapIndicatorBaseProps {}

export const SwapIndicator = (props: SwapIndicatorProps) => {
  const restProps = omit(props, 'type', 'ref')
  const swap = useSwapContext()
  const presence = () => {
    const p = props.type === 'on' ? swap().onPresence : swap().offPresence
    return p()
  }

  const mergedProps = mergeProps(() => swap().getIndicatorProps({ type: props.type }), restProps)

  // Hoisted and untracked: `ref` is evaluated EAGERLY when the child is
  // constructed, and a flow component constructs its child inside a tracking
  // memo — so reading an accessor here subscribes THAT memo to this state and
  // every change re-creates the element. The ref setter itself never changes.
  const presenceRef = untrack(() => presence().ref)

  return (
    <Show when={!presence().unmounted}>
      <ark.span {...mergedProps} ref={composeRefs(presenceRef, props.ref)} />
    </Show>
  )
}
