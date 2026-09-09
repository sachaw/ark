import { mergeProps } from '@zag-js/solid'
import { Show, untrack } from 'solid-js'
import { composeRefs } from '../../utils/compose-refs.ts'
import { useRenderStrategyContext } from '../../utils/render-strategy.ts'
import { type HTMLProps, type PolymorphicProps, ark } from '../factory.tsx'
import { usePresence } from '../presence/index.tsx'
import { useDialogContext } from './use-dialog-context.ts'

export interface DialogBackdropBaseProps extends PolymorphicProps<'div'> {}
export interface DialogBackdropProps extends HTMLProps<'div'>, DialogBackdropBaseProps {}

export const DialogBackdrop = (props: DialogBackdropProps) => {
  const api = useDialogContext()
  const renderStrategyProps = useRenderStrategyContext()
  const presenceApi = usePresence(mergeProps(renderStrategyProps, () => ({ present: api().open })))
  const mergedProps = mergeProps(
    () => api().getBackdropProps(),
    () => presenceApi().presenceProps,
    props,
  )

  // Hoisted and untracked: `ref` is evaluated EAGERLY when the child is
  // constructed, and a flow component constructs its child inside a tracking
  // memo — so reading an accessor here subscribes THAT memo to this state and
  // every change re-creates the element. The ref setter itself never changes.
  const presenceApiRef = untrack(() => presenceApi().ref)

  return (
    <Show when={!presenceApi().unmounted}>
      <ark.div {...mergedProps} ref={composeRefs(presenceApiRef, props.ref)} />
    </Show>
  )
}
