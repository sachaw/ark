import { mergeProps } from '@zag-js/solid'
import { Show, untrack } from 'solid-js'
import { composeRefs } from '../../utils/compose-refs.ts'
import { type HTMLProps, type PolymorphicProps, ark } from '../factory.tsx'
import { usePresenceContext } from '../presence/index.tsx'
import { useSelectContext } from './use-select-context.ts'

export interface SelectContentBaseProps extends PolymorphicProps<'div'> {}
export interface SelectContentProps extends HTMLProps<'div'>, SelectContentBaseProps {}

export const SelectContent = (props: SelectContentProps) => {
  const select = useSelectContext()
  const presenceApi = usePresenceContext()
  const mergedProps = mergeProps(
    () => select().getContentProps(),
    () => presenceApi().presenceProps,
    props,
  )

  // Hoisted and untracked. `ref` is evaluated EAGERLY when the child element is
  // constructed, and `<Show>` constructs its child inside a tracking memo — so
  // reading the presence memo there subscribes Show itself to presence state,
  // and every state change re-creates the content element. `setNode` is stable
  // for the life of the hook, so there is nothing to re-read.
  const presenceRef = untrack(() => presenceApi().ref)

  return (
    <Show when={!presenceApi().unmounted}>
      <ark.div {...mergedProps} ref={composeRefs(presenceRef, props.ref)} />
    </Show>
  )
}
