import { mergeProps } from '@zag-js/solid'
import { Show, untrack } from 'solid-js'
import type { ContentProps } from '@zag-js/drawer'
import { createSplitProps } from '../../utils/create-split-props.ts'
import { type HTMLProps, type PolymorphicProps, ark } from '../factory.tsx'
import { useDrawerContext } from './use-drawer-context.ts'
import { usePresenceContext } from '../presence/index.tsx'
import { composeRefs } from '../../utils/compose-refs.ts'

export interface DrawerContentBaseProps extends PolymorphicProps<'div'>, ContentProps {}
export interface DrawerContentProps extends Omit<HTMLProps<'div'>, 'draggable'>, DrawerContentBaseProps {}

export const DrawerContent = (props: DrawerContentProps) => {
  const [contentProps, localProps] = createSplitProps<ContentProps>()(props, ['draggable'])
  const drawer = useDrawerContext()
  const presence = usePresenceContext()
  const mergedProps = mergeProps(
    () => drawer().getContentProps({ draggable: true, ...contentProps }),
    () => presence().presenceProps,
    localProps,
  )

  // Hoisted and untracked: `ref` is evaluated EAGERLY when the child is
  // constructed, and a flow component constructs its child inside a tracking
  // memo — so reading an accessor here subscribes THAT memo to this state and
  // every change re-creates the element. The ref setter itself never changes.
  const presenceRef = untrack(() => presence().ref)

  return (
    <Show when={!presence().unmounted}>
      <ark.div {...mergedProps} ref={composeRefs(presenceRef, localProps.ref)} />
    </Show>
  )
}
