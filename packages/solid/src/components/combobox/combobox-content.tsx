import { mergeProps } from '@zag-js/solid'
import { Show, untrack } from 'solid-js'
import { composeRefs } from '../../utils/compose-refs.ts'
import { type HTMLProps, type PolymorphicProps, ark } from '../factory.tsx'
import { usePresenceContext } from '../presence/index.tsx'
import { useComboboxContext } from './use-combobox-context.ts'

export interface ComboboxContentBaseProps extends PolymorphicProps<'div'> {}
export interface ComboboxContentProps extends HTMLProps<'div'>, ComboboxContentBaseProps {}

export const ComboboxContent = (props: ComboboxContentProps) => {
  const api = useComboboxContext()
  const presenceApi = usePresenceContext()
  const mergedProps = mergeProps(
    () => api().getContentProps(),
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
