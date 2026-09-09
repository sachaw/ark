import { mergeProps } from '@zag-js/solid'
import { Show, untrack } from 'solid-js'
import { composeRefs } from '../../utils/compose-refs.ts'
import { type HTMLProps, type PolymorphicProps, ark } from '../factory.tsx'
import { splitPresenceProps } from './split-presence-props.ts'
import { type UsePresenceProps, usePresence } from './use-presence.ts'

export interface PresenceBaseProps extends UsePresenceProps, PolymorphicProps<'div'> {}
export interface PresenceProps extends HTMLProps<'div'>, PresenceBaseProps {}

export const Presence = (props: PresenceProps) => {
  const [presenceProps, localProps] = splitPresenceProps(props)
  const api = usePresence(presenceProps)
  const mergedProps = mergeProps(() => api().presenceProps, localProps)

  // Hoisted and untracked: `ref` is evaluated EAGERLY when the child is
  // constructed, and a flow component constructs its child inside a tracking
  // memo — so reading an accessor here subscribes THAT memo to this state and
  // every change re-creates the element. The ref setter itself never changes.
  const apiRef = untrack(() => api().ref)

  return (
    <Show when={!api().unmounted}>
      <ark.div {...mergedProps} ref={composeRefs(apiRef, props.ref)} data-scope="presence" data-part="root" />
    </Show>
  )
}
