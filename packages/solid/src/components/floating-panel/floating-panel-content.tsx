import { mergeProps } from '@zag-js/solid'
import { Show, untrack } from 'solid-js'
import { composeRefs } from '../../utils/compose-refs.ts'
import { type HTMLProps, type PolymorphicProps, ark } from '../factory.tsx'
import { usePresenceContext } from '../presence/index.tsx'
import { useFloatingPanelContext } from './use-floating-panel-context.ts'

export interface FloatingPanelContentBaseProps extends PolymorphicProps<'div'> {}
export interface FloatingPanelContentProps extends HTMLProps<'div'>, FloatingPanelContentBaseProps {}

export const FloatingPanelContent = (props: FloatingPanelContentProps) => {
  const floatingPanel = useFloatingPanelContext()
  const presence = usePresenceContext()
  const mergedProps = mergeProps(
    () => floatingPanel().getContentProps(),
    () => presence().presenceProps,
    props,
  )

  // Hoisted and untracked: `ref` is evaluated EAGERLY when the child is
  // constructed, and a flow component constructs its child inside a tracking
  // memo — so reading an accessor here subscribes THAT memo to this state and
  // every change re-creates the element. The ref setter itself never changes.
  const presenceRef = untrack(() => presence().ref)

  return (
    <Show when={!presence().unmounted}>
      <ark.div {...mergedProps} ref={composeRefs(presenceRef, props.ref)} />
    </Show>
  )
}
