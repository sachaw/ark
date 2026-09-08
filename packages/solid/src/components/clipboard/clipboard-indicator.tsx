import { mergeProps } from '@zag-js/solid'
import { Show, children } from 'solid-js'
import type { JSX } from '@solidjs/web'
import { createSplitProps } from '../../utils/create-split-props.ts'
import { type HTMLProps, type PolymorphicProps, ark } from '../factory.tsx'
import { useClipboardContext } from './use-clipboard-context.ts'

interface IndicatorProps {
  copied?: JSX.Element
}

export interface ClipboardIndicatorBaseProps extends IndicatorProps, PolymorphicProps<'div'> {}
export interface ClipboardIndicatorProps extends HTMLProps<'div'>, ClipboardIndicatorBaseProps {}

export const ClipboardIndicator = (props: ClipboardIndicatorProps) => {
  const [indicatorProps, localProps] = createSplitProps<IndicatorProps>()(props, ['copied'])
  const api = useClipboardContext()
  // Lazy, like every other part — resolving inline reads the api in the
  // component body, which 2.0 flags as a read that will not update.
  const mergedProps = mergeProps(
    () => api().getIndicatorProps({ copied: api().copied }),
    localProps,
  )
  const getChildren = children(() => localProps.children)

  return (
    <ark.div {...mergedProps}>
      <Show when={api().copied} fallback={getChildren()}>
        {indicatorProps.copied}
      </Show>
    </ark.div>
  )
}
