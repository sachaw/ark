import { mergeProps } from '@zag-js/solid'
import { Show, untrack } from 'solid-js'
import { composeRefs } from '../../utils/compose-refs.ts'
import { type HTMLProps, type PolymorphicProps, ark } from '../factory.tsx'
import { usePresenceContext } from '../presence/index.tsx'
import { useStrictMenuContext } from './use-menu-context.ts'

export interface MenuContentBaseProps extends PolymorphicProps<'div'> {}
export interface MenuContentProps extends HTMLProps<'div'>, MenuContentBaseProps {}

export const MenuContent = (props: MenuContentProps) => {
  const context = useStrictMenuContext()
  const presenceContext = usePresenceContext()
  const mergedProps = mergeProps(
    () => context().getContentProps(),
    () => presenceContext().presenceProps,
    props,
  )

  // Hoisted and untracked: `ref` is evaluated EAGERLY when the child is
  // constructed, and a flow component constructs its child inside a tracking
  // memo — so reading an accessor here subscribes THAT memo to this state and
  // every change re-creates the element. The ref setter itself never changes.
  const presenceContextRef = untrack(() => presenceContext().ref)

  return (
    <Show when={!presenceContext().unmounted}>
      <ark.div {...mergedProps} ref={composeRefs(presenceContextRef, props.ref)} />
    </Show>
  )
}
