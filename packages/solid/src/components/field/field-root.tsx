import { untrack } from 'solid-js'
import { mergeProps } from '@zag-js/solid'
import { composeRefs } from '../../utils/compose-refs.ts'
import { createSplitProps } from '../../utils/create-split-props.ts'
import { type HTMLProps, type PolymorphicProps, ark } from '../factory.tsx'
import { type UseFieldProps, useField } from './use-field.ts'
import { FieldProvider } from './use-field-context.ts'

export interface FieldRootBaseProps extends UseFieldProps, PolymorphicProps<'div'> {}
export interface FieldRootProps extends HTMLProps<'div'>, FieldRootBaseProps {}

export const FieldRoot = (props: FieldRootProps) => {
  const [useFieldProps, localProps] = createSplitProps<UseFieldProps>()(props, [
    'id',
    'ids',
    'disabled',
    'invalid',
    'readOnly',
    'required',
    'target',
  ])
  const field = useField(useFieldProps)
  const mergedProps = mergeProps(() => field().getRootProps(), localProps)

  // Hoisted and untracked: `ref` is evaluated EAGERLY when the child is
  // constructed, and a flow component constructs its child inside a tracking
  // memo — so reading an accessor here subscribes THAT memo to this state and
  // every change re-creates the element. The ref setter itself never changes.
  const fieldRefsRootRef = untrack(() => field().refs.rootRef)

  return (
    <FieldProvider value={field}>
      <ark.div {...mergedProps} ref={composeRefs(fieldRefsRootRef, props.ref)} />
    </FieldProvider>
  )
}
