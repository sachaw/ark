import { mergeProps } from '@zag-js/solid'
import { Show, untrack } from 'solid-js'
import { composeRefs } from '../../utils/compose-refs.ts'
import { useRenderStrategyContext } from '../../utils/render-strategy.ts'
import { type HTMLProps, type PolymorphicProps, ark } from '../factory.tsx'
import { usePresence } from '../presence/index.tsx'
import { useDrawerContext } from './use-drawer-context.ts'

export interface DrawerBackdropBaseProps extends PolymorphicProps<'div'> {}
export interface DrawerBackdropProps extends HTMLProps<'div'>, DrawerBackdropBaseProps {}

export const DrawerBackdrop = (props: DrawerBackdropProps) => {
  const drawer = useDrawerContext()
  const renderStrategyProps = useRenderStrategyContext()
  const presence = usePresence(mergeProps(renderStrategyProps, () => ({ present: drawer().open })))
  const mergedProps = mergeProps(
    () => drawer().getBackdropProps(),
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
